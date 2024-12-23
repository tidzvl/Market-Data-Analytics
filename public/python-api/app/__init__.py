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

app = Flask(__name__)

# Cấu hình kết nối với MySQL trên Azure
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://HcmutElectronics:Kua%401234@electronics.mysql.database.azure.com:3306/new_schema'
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
