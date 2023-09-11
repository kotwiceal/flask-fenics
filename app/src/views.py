"""This module implements a server hander functional.
Return: modified flask instance
"""

from src import app

@app.route('/')
def index():
    return app.send_static_file('./dist/index.html')

@app.route('/<path:path>')
def route_static_file(path):
    return app.send_static_file('./dist/' + path)