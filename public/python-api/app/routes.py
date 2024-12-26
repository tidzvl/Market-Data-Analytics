#
# File: routes.py
# Author: TiDz
# Contact: nguyentinvs123@gmail.com
# Created on Mon Dec 23 2024
# Description: 
# Useage: 
#

from flask import request, render_template
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

@app.route('/api/getAllProducts', methods=['GET'])
def api_get_all_products():
    return get_all_products()

@app.route('/api/addNewProduct', methods=['POST'])
def api_add_new_product():
    data = request.json
    result, status = add_new_product(data['name'],data['desc'],data['weight'], data['cost'], data['subcategoryid'])
    return jsonify(result), status

@app.route('/api/deleteProduct', methods=['POST'])
def api_delete_product():
    data = request.json
    result, status = delete_product(data['productid'])
    return jsonify(result), status

@app.route('/api/updateProduct', methods=['POST'])
def api_update_product():
    data = request.json
    result, status = update_sales(data['productid'], data['country'], data['qty'], data['sellprice'], data['cost'])
    return jsonify(result), status

@app.route('/api/calcuFromImport', methods = ['POST'])
def api_calcu_from_import():
    data = request.json
    result, status = calcu_from_import(data)
    return jsonify(result), status

@app.route('/api/test', methods=['POST'])
def api_test():
    result, status = test()
    return jsonify(result), status

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/manager')
def manager():
    return render_template('manager/index.html')