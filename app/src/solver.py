"""Implement solver session."""

import multiprocessing, time
import numpy as np
import socketio

def process_watcher(mng_dkt, mng_lock):
    def decorator(function):
        def wrapper(*args, **kwargs):
            # execute of goal function
            time_start = time.time()
            result = function(*args, **kwargs)
            time_end = time.time()
            # store worker parameters
            result['worker'] = dict(pid = multiprocessing.current_process().pid, 
                name = multiprocessing.current_process().name, 
                time = time_end - time_start)
            try:
                # acquire lock
                mng_lock.acquire()
                task_data = mng_dkt[result['id']].copy()
                task_data.update(dict(process = result))
                mng_dkt[result['id']] = task_data
            finally:
                # release lock
                mng_lock.release()
        return wrapper
    return decorator

class Task:
    """Task pattern to process problem, monitor intermediate results, store and extract calculation sessions."""
    _valid_attr = ['sid', 'id', 'problem', 'styles']
    def __init__(self, **kwargs) -> None:
        [setattr(self, key, kwargs.get(key, None)) for key in kwargs.keys() if key in self._valid_attr]

        self.socket_host = 'http://127.0.0.1:5000/'
        self.socket_namespace = '/solver'
        self.channels = dict(monitor_event = 'monitor_event', monitor = 'monitor', logger = 'logger')
        
    def task_process(self, mng_dkt, mng_lock) -> None:
        """To process task."""
        pass
    
    def task_monitor(self, data: dict) -> None:
        """To monitor intermediate task results."""
        pass
    
    def task_postporcess(self, data) -> None:
        """To postprocess task results."""
        pass

    def logger(self, message):
        """Log message."""
        try:
            sio = socketio.Client()
            sio.connect(self.socket_host, namespaces = self.socket_namespace)
            sio.emit(self.channels['logger'], message, namespace = self.socket_namespace)
        except Exception as error:
            print(error)
                
    def process(self, mng_dkt, mng_lock):
        """Prepare buffer and start the process."""
        try:
            # acquire lock
            mng_lock.acquire()
            # initialize a buffer of the task session
            mng_dkt[self.id] = dict(lock = False, monitor = dict(styles = self.styles))
        except Exception as error:
            print(error)
        finally:
            mng_lock.release()
        process_watcher(mng_dkt, mng_lock)(self.task_process)(mng_dkt, mng_lock)
    
    def monitor_send(self, monitor, mng_dkt, mng_lock) -> None:
        """To trigger a monitoring of the task result by new child process."""
        try:
            # acquire lock
            mng_lock.acquire()
            lock = mng_dkt[self.id]['lock']
            if not lock:
                data = mng_dkt[self.id].copy()
                data.update(dict(lock = True, monitor = monitor))
                mng_dkt[self.id] = data
                
                # create worker to monitor data
                try:
                    sio = socketio.Client()
                    sio.connect(self.socket_host, namespaces = self.socket_namespace)
                    sio.emit(self.channels['monitor_event'], 
                        dict(socket_host = self.socket_host, socket_namespace = self.socket_namespace,
                        id = self.id, sid = self.sid), namespace = self.socket_namespace)
                except Exception as error:
                    print(error)
        except Exception as error:
            print(error)
        finally:
            mng_lock.release()
    
    def monitor(self, mng_dkt, mng_lock) -> dict:
        """To monitor task result."""
        # get data from pool manager
        self.logger('fun monitor')
        try:
            mng_lock.acquire()
            monitor = mng_dkt[self.id]['monitor'].copy()
            progress = monitor['progress']
            # plot data
            image = self.task_monitor(monitor)
        except Exception as error:
            image = []
            progress = []
            print(error)
        finally:
            mng_lock.release()
        return dict(image = image, type = 'matplotlib', progress = progress)

    def postprocess(self, mng_dkt, mng_lock):
        """To postprocess the task result."""
        # get data from pool manager
        try:
            # acquire lock
            mng_lock.acquire()
            data = mng_dkt[self.id]['postprocess'].copy()
        except Exception as error:
            data = []
            print(error)
        finally:
            mng_lock.release()
            self.task_postporcess(data)

class TaskManager:
    """Task manager to parallelize solvers."""
    def __init__(self, proc_num: int) -> None:
        self.proc_num = proc_num
        self.channels = dict(process = 'process', monitor = 'monitor', manager = 'manager')
        self.socket_host = 'http://127.0.0.1:5000/'
        self.socket_namespace = '/solver'
        self.tasks = {}
        self.async_result = []
        
    def run(self, socketio: object) -> None:
        """Create pool manager."""
        self.socketio = socketio
        self.manager = multiprocessing.Manager()
        self.mng_dkt = self.manager.dict()
        self.mng_lock = self.manager.Lock()
        self.pool = multiprocessing.Pool(processes = self.proc_num)
            
    def process(self, tasks: list) -> None:
        """Launch the pool processing session."""
        # store task objects
        self.tasks[tasks[0].sid] = dict()
        for task in tasks:
            self.tasks[task.sid][task.id] = task
                       
        self.async_result.extend([self.pool.apply_async(task.process, args = (self.mng_dkt, self.mng_lock,), 
            callback = lambda result, channel = self.channels['process'], sid = task.sid, id = task.id: 
                self.callback_process(channel, sid, id, result), error_callback = self.error_callback) for task in tasks])

    def callback_process(self, channel: str, sid: str, id: str, result) -> None:
        """Callback function at processing task."""
        # update pool state
        self.pool_state()
        try:
            # acquire lock
            self.mng_lock.acquire()
            data = self.mng_dkt[id]['process']['worker'].copy()
            self.socketio.emit(channel, dict(id = id, sid = sid, worker = data), to = sid, namespace = '/solver')
        except Exception as error:
            print(error)
        finally:
            # release lock
            self.mng_lock.release()

    def monitor(self, sid: str, id: str) -> None:
        """Launch the monitoring of task result."""
        try:
            self.async_result.append(self.pool.apply_async(self.tasks[sid][id].monitor, args = (self.mng_dkt, self.mng_lock,), 
                callback = lambda result, channel = self.channels['monitor'], sid = sid, id = id: 
                    self.callback_monitor(channel, sid, id, result), error_callback = self.error_callback))
        except Exception as error:
            print(error)
    
    def callback_monitor(self, channel: str, sid: str, id: str, result: dict) -> None:
        """Callback function at monitoring task."""     
        self.socketio.emit(channel, result, to = sid, namespace = '/solver')
        # update pool state
        self.pool_state()
        # release monitor lock
        try:
            # acquire lock
            self.mng_lock.acquire()
            data = self.mng_dkt[id].copy()
            data.update(dict(lock = False))
            self.mng_dkt[id] = data
        except Exception as error:
            print(error)
        finally:
            # release lock
            self.mng_lock.release()
        
    def error_callback(self, error):
        print(f'TASKMANAGER: {error}')

    def pool_state(self, sid = []) -> None:
        """Pool state watching."""
        result = list(filter(lambda element: not element.ready(), self.async_result))
        self.async_result = result
        result = [r.ready() for r in result]
        temporary = np.ones(self.pool.__dict__['_processes'], dtype = bool)
        temporary[0:len(result)] = result

        if sid:
            self.socketio.emit(self.channels['manager'], 
                dict(free = temporary.tolist()),
                to = sid, namespace = '/solver')
        else: 
            self.socketio.emit(self.channels['manager'], 
                dict(free = temporary.tolist()), namespace = '/solver')

    def monitor_update(self, id: str, styles: dict) -> None:
        """Update monitor styles."""
        try:
            # acquire lock
            self.mng_lock.acquire()
            data = self.mng_dkt[id].copy()
            data.update(dict(monitor = dict(styles = styles)))
            self.mng_dkt[id] = data
        except Exception as error:
            print(error)
        finally:
            # release lock
            self.mng_lock.release()
        
    def close(self) -> None:
        """Finishing the pool session."""
        self.pool.close()
        self.pool.join()
