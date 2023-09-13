from src import solver

from fenics import (VectorFunctionSpace, FunctionSpace, DirichletBC, Expression, Constant, TrialFunction,
    TestFunction, Function, FacetNormal, sym, nabla_grad, Identity, dot, dx, ds, inner, lhs, rhs, assemble,
    solve, Point)
from mshr import Rectangle, Circle, generate_mesh

import numpy as np
import matplotlib as mpl
from matplotlib import pyplot as plt

import base64
from io import BytesIO
from matplotlib.figure import Figure

plt.style.use('dark_background')
plt.rcParams['axes.facecolor'] = '#282c34'
mpl.rcParams['figure.facecolor'] = '#282c34'
mpl.rcParams['figure.figsize'] = [12, 8]
mpl.rcParams['font.size'] = 16
mpl.rcParams['legend.fontsize'] = 'large'
mpl.rcParams['figure.titlesize'] = 'medium'

class TaskNavierStokesCylinder(solver.Task):
    def __init__(self, id: str, sid: str, problem):
        self.problem = problem
        super().__init__(id, sid)

    def task_process(self, mng_dkt, mng_lock):
        """To solve task."""
        T = self.problem['time']         # final time
        num_steps = self.problem['tn']    # number of time steps
        dt = T / num_steps # time step size
        mu = self.problem['viscosity']       # dynamic viscosity
        rho = self.problem['density']           # density

        # Create mesh
        channel = Rectangle(Point(0, 0), Point(2.2, 0.41))
        cylinder = Circle(Point(0.2, 0.2), 0.05)
        domain = channel - cylinder
        mesh = generate_mesh(domain, self.problem['mn'])

        # Define function spaces
        V = VectorFunctionSpace(mesh, 'P', 2)
        Q = FunctionSpace(mesh, 'P', 1)

        # Define boundaries
        inflow   = 'near(x[0], 0)'
        outflow  = 'near(x[0], 2.2)'
        walls    = 'near(x[1], 0) || near(x[1], 0.41)'
        cylinder = 'on_boundary && x[0]>0.1 && x[0]<0.3 && x[1]>0.1 && x[1]<0.3'

        # Define inflow profile
        inflow_profile = ('4.0*1.5*x[1]*(0.41 - x[1]) / pow(0.41, 2)', '0')

        # Define boundary conditions
        bcu_inflow = DirichletBC(V, Expression(inflow_profile, degree=2), inflow)
        bcu_walls = DirichletBC(V, Constant((0, 0)), walls)
        bcu_cylinder = DirichletBC(V, Constant((0, 0)), cylinder)
        bcp_outflow = DirichletBC(Q, Constant(0), outflow)
        bcu = [bcu_inflow, bcu_walls, bcu_cylinder]
        bcp = [bcp_outflow]

        # Define trial and test functions
        u = TrialFunction(V)
        v = TestFunction(V)
        p = TrialFunction(Q)
        q = TestFunction(Q)

        # Define functions for solutions at previous and current time steps
        u_n = Function(V)
        u_  = Function(V)
        p_n = Function(Q)
        p_  = Function(Q)

        # Define expressions used in variational forms
        U  = 0.5*(u_n + u)
        n  = FacetNormal(mesh)
        f  = Constant((0, 0))
        k  = Constant(dt)
        mu = Constant(mu)
        rho = Constant(rho)

        # Define symmetric gradient
        def epsilon(u):
            return sym(nabla_grad(u))

        # Define stress tensor
        def sigma(u, p):
            return 2*mu*epsilon(u) - p*Identity(len(u))

        # Define variational problem for step 1
        F1 = (rho*dot((u - u_n) / k, v)*dx 
            + rho*dot(dot(u_n, nabla_grad(u_n)), v)*dx 
            + inner(sigma(U, p_n), epsilon(v))*dx 
            + dot(p_n*n, v)*ds - dot(mu*nabla_grad(U)*n, v)*ds 
            - dot(f, v)*dx)
        a1 = lhs(F1)
        L1 = rhs(F1)

        # Define variational problem for step 2
        a2 = dot(nabla_grad(p), nabla_grad(q))*dx
        L2 = dot(nabla_grad(p_n), nabla_grad(q))*dx - (1/k)*div(u_)*q*dx

        # Define variational problem for step 3
        a3 = dot(u, v)*dx
        L3 = dot(u_, v)*dx - k*dot(nabla_grad(p_ - p_n), v)*dx

        # Assemble matrices
        A1 = assemble(a1)
        A2 = assemble(a2)
        A3 = assemble(a3)

        # Apply boundary conditions to matrices
        [bc.apply(A1) for bc in bcu]
        [bc.apply(A2) for bc in bcp]

        # Time-stepping
        t = 0
        for n in range(num_steps):

            # Update current time
            t += dt

            # Step 1: Tentative velocity step
            b1 = assemble(L1)
            [bc.apply(b1) for bc in bcu]
            solve(A1, u_.vector(), b1, 'bicgstab', 'hypre_amg')

            # Step 2: Pressure correction step
            b2 = assemble(L2)
            [bc.apply(b2) for bc in bcp]
            solve(A2, p_.vector(), b2, 'bicgstab', 'hypre_amg')

            # Step 3: Velocity correction step
            b3 = assemble(L3)
            solve(A3, u_.vector(), b3, 'cg', 'sor')

            # create data to monitor
            monitor = dict(mesh = mesh.coordinates(), 
                velocity = u_.compute_vertex_values(mesh),
                pressure = p_.compute_vertex_values(mesh), iteration = n, 
                progress = int(np.round((n+1)/num_steps*100)))
            # send to monitor
            self.monitor_send(monitor, mng_dkt, mng_lock) 

            # Update previous solution
            u_n.assign(u_)
            p_n.assign(p_)
            
        result = dict(sid = self.sid, id = self.id, status = True, solution = [])   
        return result

    def task_monitor(self, data):
        """To monitor intermediate results."""
        mesh = data['mesh']
        velocity = data['velocity']
        velocity = velocity.reshape((mesh.shape[1], -1))
        pressure = data['pressure']
        iteration = data['iteration']

        levels_u = 50
        levels_v = 50
        levels_p = 50

        figure = Figure()
        axis = figure.subplots(3, 1)

        axis[0].tricontourf(mesh[:, 0], mesh[:, 1], velocity[0, :], levels_u, cmap = 'viridis')
        axis[0].set_title(f'iteration = {iteration}')
        axis[0].set_aspect('equal', 'box')

        axis[1].tricontourf(mesh[:, 0], mesh[:, 1], velocity[1, :], levels_v, cmap = 'viridis')
        # axis[1].set_title('v')
        axis[1].set_aspect('equal', 'box')

        axis[2].tricontourf(mesh[:, 0], mesh[:, 1], pressure, levels_p, cmap = 'viridis')
        # axis[2].set_title('p')
        axis[2].set_aspect('equal', 'box')

        buffer = BytesIO()
        figure.savefig(buffer, format = 'png')
        image = base64.b64encode(buffer.getbuffer()).decode('ascii')
        return image