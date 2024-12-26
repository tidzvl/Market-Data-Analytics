#
# File: __init__.py
# Author: TiDz
# Contact: nguyentinvs123@gmail.com
# Created on Mon Dec 23 2024
# Description: 
# Useage: 
#


from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import os

load_dotenv()
# app = Flask(__name__)
app = Flask(__name__, static_folder="../../../assets", template_folder="../../../public/dashboard")

socketio = SocketIO(app, async_mode='eventlet')

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = { 
    'connect_args': { 
        'ssl': { 
            'fake_flag_to_enable_tls': True 
            } 
        } 
    }

CORS(app)
db = SQLAlchemy(app)

from app import routes, models
