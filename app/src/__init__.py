"""This package implements HTTP server hosted by flask framework.
"""

from flask import Flask
from flask_socketio import SocketIO
from src import solver

# create flask instance with indication a path of static files (scr/static)
app = Flask(__name__, static_url_path = '/static')
# create socketio instance
flaskSocket = SocketIO(app)

from src import views

def init_app():
    pass

def start_app():
    try:
        init_app()
        flaskSocket.run(app, host = '0.0.0.0', port = 5000)
    except KeyboardInterrupt:
        app.taskManager.close()