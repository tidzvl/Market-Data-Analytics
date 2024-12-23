#
# File: controllers.py
# Author: TiDz
# Contact: nguyentinvs123@gmail.com
# Created on Mon Dec 23 2024
# Description: 
# Useage: 
#

from app import db
from app.models import SalesInfo, QuarterlySalesInfo, CountryRegion, ProductSubcategory
import pandas as pd
from sqlalchemy import text
from flask import jsonify
import os

def add_salesinfo(data):
    new_entry = SalesInfo(
        ProductID=data['ProductID'],
        TotalQtySold=data['TotalQtySold'],
        TotalLine=data['TotalLine'],
        CountryRegionCode=data['CountryRegionCode'],
        Weight=data['Weight'],
        StandardCost=data['StandardCost'],
        TotalCost=data['TotalCost'],
        TotalProfit=data['TotalProfit'],
        ProfitPerProduct=data['ProfitPerProduct'],
        ProductSubcategoryID=data['ProductSubcategoryID'],
        SubcategoryName=data['SubcategoryName'],
        CategoryName=data['CategoryName']
    )
    db.session.add(new_entry)
    db.session.commit()
    return {"message": "SalesInfo added successfully"}, 201

def add_quarterlysalesinfo(data):
    new_entry = QuarterlySalesInfo(
        StartDate=data['StartDate'],
        EndDate=data['EndDate'],
        ProductID=data['ProductID'],
        Weight=data['Weight'],
        OrderQty=data['OrderQty'],
        LineTotal=data['LineTotal'],
        CountryRegionCode=data['CountryRegionCode'],
        ProductSubcategoryID=data['ProductSubcategoryID'],
        SubcategoryName=data['SubcategoryName'],
        CategoryName=data['CategoryName']
    )
    db.session.add(new_entry)
    db.session.commit()
    return {"message": "QuarterlySalesInfo added successfully"}, 201

def add_region(data):
    new_entry = CountryRegion(
        CountryRegionCode = data['CountryRegionCode'],
        CountryRegionName = data['CountryRegionName']
    )
    db.session.add(new_entry)
    db.session.commit()
    return {"message": "CountryRegion added successfully"}, 201

def add_productSubcategory(data):
    new_entry = ProductSubcategory(
        ProductSubcategoryID = data['ProductSubcategoryID'],
        SubcategoryName = data['SubcategoryName'],
        CategoryName = data['CategoryName']
    )
    db.session.add(new_entry)
    db.session.commit()
    return {"message": "ProductSubcategory added successfully"}, 201

def Load_Sales_Info():
    # pd.set_option('display.max_rows', None) 
    # pd.set_option('display.max_columns', None)
    file_path = os.path.join(os.path.dirname(__file__), 'Sheet.xlsx')
    df = pd.read_excel(file_path, sheet_name='Product-US', usecols="B:M", skiprows=1, nrows=265)

    df = df.where(pd.notnull(df), 0)
    pd.set_option('display.precision', 10)
    for index, row in df.iterrows():
        new_entry = SalesInfo(
            ProductID=row['ProductID'],
            TotalQtySold=row['Totoal QTY sold'],
            TotalLine=row['Total line\n(Sum total sell)'],
            CountryRegionCode=row['CountryRegionCode'],
            Weight=row['Weight'],
            StandardCost=row['StandardCost \n(Lastest update)'],
            TotalCost=row['Total Cost'],
            TotalProfit=row['Total Profit'],
            ProfitPerProduct=row['Profit/Product'],
            ProductSubcategoryID=row['ProductSubCategoryID'],
            SubcategoryName=row['SubCategoryName'],
            CategoryName=row['CategoryName']
        )
        db.session.add(new_entry)
    db.session.commit()
    return {"message": "SalesInfo added successfully"}, 201

def Load_Quarterly():
    file_path = os.path.join(os.path.dirname(__file__), 'Sheet.xlsx')
    df = pd.read_excel(file_path, sheet_name='Product-GB', usecols="O:X", skiprows=1, nrows=1319)

    df = df.where(pd.notnull(df), 0)
    pd.set_option('display.precision', 10)

    for index, row in df.iterrows():
        new_entry = QuarterlySalesInfo(
            StartDate=row['StartDate'],
            EndDate=row['EndDate'],
            ProductID=row['ProductID.1'],
            Weight=row['Weight.1'],
            OrderQty=row['OrderQty'],
            LineTotal=row['Line Total\n(Not include tax and ship)'],
            CountryRegionCode=row['CountryRegionCode.1'],
            ProductSubcategoryID=row['SubCategoryID'],
            SubcategoryName=row['SubCategoryName.1'],
            CategoryName=row['CategoryName.1']
        )
        db.session.add(new_entry)
    db.session.commit()

    return {"message": "QuarterlySalesInfo added successfully"}, 201

def get_revenue_and_profit():
    sql = text("""
        SELECT 
            YEAR(qsi.StartDate) AS Year,
            QUARTER(qsi.StartDate) AS Quarter,
            qsi.CountryRegionCode,
            SUM(qsi.LineTotal) AS TotalRevenue,
            SUM(qsi.OrderQty * si.ProfitPerProduct) AS TotalProfit
        FROM 
            QuarterlySalesInfo qsi
        JOIN 
            SalesInfo si ON qsi.ProductID = si.ProductID AND qsi.CountryRegionCode = si.CountryRegionCode
        GROUP BY 
            YEAR(qsi.StartDate), 
            QUARTER(qsi.StartDate),
            qsi.CountryRegionCode
        ORDER BY 
            YEAR(qsi.StartDate),
            QUARTER(qsi.StartDate),
            qsi.CountryRegionCode
        LIMIT 0, 1000;
    """)
    result = db.session.execute(sql) 
    data = result.mappings().all()
    data_dict = [dict(row) for row in data] 
    return jsonify(data_dict), 200

def test():
    return {"message": "No broblem!"}, 201