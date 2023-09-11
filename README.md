# FLASK-FENICS
The project goals to present a graphical user interface in order to solve partial differential equations (PDEs) by the finite element method (FEM).
## Description
Web application based on Flask framework serves to configure physical problem, parallelize launching of tasks, monitor intermediate results, store and extract calculation sessions. As toolkit to solve PDEs the [FEniCS Project](https://fenicsproject.org/) computing platform is exploited.

## Installation and running of the project
#### Only for Linux OS:
1. Insall [FEniCS Project](https://github.com/FEniCS/dolfinx)
2. Clone the repository:
```bash
git clone https://github.com/kotwiceal/flask-fenics.git
```
3. Install python dependencies by means of poetry package manager:
```bash
cd flask-fenics/app
python3 -m pip install poetry
python3 -m poetry install
```
4. Install and assebmly client dependencies by means of `npm` or other package managers:
```bash
cd flask-fenics/app/src/static
npm install
npm run dev
``` 
5. Run of the project:
```bash
cd flask-fenics/app
python3 -m run.py
```

#### Docker image:
1. Compose image:
```bash
docker compose -f "compose.dev.yml" up -d --build 
```
2. Attach shell:
```bash
docker exec -it flask-fenics-app sh
```
3. Run of the project:
```bash
python3 -m run.py
```