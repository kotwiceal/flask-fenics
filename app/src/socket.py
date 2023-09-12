"""This module provides socketIO imlementation of server-client communication.
Return: modified socketio instance
"""

from flask import request
from src import flaskSocket, taskManager, solver

namespace = '/solver'

@flaskSocket.on('process', namespace = namespace)
def process(data):
    task = solver.Task(id = data['id'], sid = request.sid, problem = data['problem'],
        styles = data['styles'])
    taskManager.process([task])
    
@flaskSocket.on('monitor', namespace = namespace)
def monitor(data):
    flaskSocket.emit('monitor', data['image'], to = data['sid'], namespace = namespace)
    
@flaskSocket.on('monitor_event', namespace = namespace)
def monitor_socket(data):
    taskManager.monitor(data['sid'], data['id'])

@flaskSocket.on('monitor_update', namespace = namespace)
def monitor_update(data):
    taskManager.monitor_update(data['id'], data['styles'])

@flaskSocket.on('connect', namespace = namespace)
def ns_on_connect():
    taskManager.pool_state(request.sid)
    print(f'SOCKETIO: client by sid={request.sid} is connected')
    
@flaskSocket.on('disconnect', namespace = namespace)
def ns_on_disconnect():
    print(f'SOCKETIO: client by sid={request.sid} is disconnected')

@flaskSocket.on('logger', namespace = namespace)
def logger(message):
    print(message)