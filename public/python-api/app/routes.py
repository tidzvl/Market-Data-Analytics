#
# File: routes.py
# Author: TiDz
# Contact: nguyentinvs123@gmail.com
# Created on Mon Dec 23 2024
# Description: 
# Useage: 
#

from flask import request
from app import app
from app.controllers import *

@app.route('/api/salesinfo', methods=['POST'])
def api_add_salesinfo():
    data = request.json
    result, status = add_salesinfo(data)
    return jsonify(result), status

@app.route('/api/quarterlysalesinfo', methods=['POST'])
def api_add_quarterlysalesinfo():
    data = request.json
    result, status = add_quarterlysalesinfo(data)
    return jsonify(result), status

@app.route('/api/addCountry', methods=['POST'])
def api_add_countryRegion():
    data = request.json
    result, status = add_region(data)
    return jsonify(result), status

@app.route('/api/addProductSubcategory', methods=['POST'])
def api_add_productSubcategory():
    data = request.json
    result, status = add_productSubcategory(data)
    return jsonify(result), status

@app.route('/api/getRevenueAndProfit', methods=['GET'])
def api_get_revenue_and_profit():
    return get_revenue_and_profit()

@app.route('/api/getWeightAndSubcategory', methods=['GET'])
def api_get_weight_and_subcategory():
    return get_weight_and_subcategory()

@app.route('/api/test', methods=['POST'])
def api_test():
    result, status = test()
    return jsonify(result), status