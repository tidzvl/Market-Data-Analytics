#
# File: controllers.py
# Author: TiDz
# Contact: nguyentinvs123@gmail.com
# Created on Mon Dec 23 2024
# Description: 
# Useage: 
#

from app import db, socketio
from app.models import SalesInfo, QuarterlySalesInfo, CountryRegion, ProductSubcategory
import pandas as pd
from sqlalchemy import text
from flask import jsonify
from collections import defaultdict
from datetime import datetime
import json
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import LinearRegression
from scipy.optimize import linprog
import numpy as np
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
            SUM(qsi.OrderQty * si.ProfitPerProduct) AS TotalProfit,
            SUM(CASE WHEN qsi.CategoryName = 'Bikes' THEN qsi.OrderQty ELSE 0 END) AS Bikes,
            SUM(CASE WHEN qsi.CategoryName = 'Components' THEN qsi.OrderQty ELSE 0 END) AS Components,
            SUM(CASE WHEN qsi.CategoryName = 'Clothing' THEN qsi.OrderQty ELSE 0 END) AS Clothing,
            SUM(CASE WHEN qsi.CategoryName = 'Accessories' THEN qsi.OrderQty ELSE 0 END) AS Accessories
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

    group_data = {}
    for row in data:
        country = row['CountryRegionCode']
        if country not in group_data:
            group_data[country] = []
        group_data[country].append(dict(row))

    # data_dict = [dict(row) for row in data] 
    return jsonify(group_data), 200

def get_weight_and_subcategory():
    sql = text("""
        SELECT 
            YEAR(qsi.StartDate) AS Year,
            QUARTER(qsi.StartDate) AS Quarter,
            qsi.CountryRegionCode,
            SUM(qsi.LineTotal) AS TotalRevenue,
            SUM(qsi.OrderQty * si.ProfitPerProduct) AS TotalProfit,

            SUM(CASE WHEN qsi.SubcategoryName = 'Mountain Bikes' THEN qsi.OrderQty ELSE 0 END) AS MountainBikes,
            SUM(CASE WHEN qsi.SubcategoryName = 'Road Bikes' THEN qsi.OrderQty ELSE 0 END) AS RoadBikes,
            SUM(CASE WHEN qsi.SubcategoryName = 'Touring Bikes' THEN qsi.OrderQty ELSE 0 END) AS TouringBikes,
            SUM(CASE WHEN qsi.SubcategoryName = 'Handlebars' THEN qsi.OrderQty ELSE 0 END) AS Handlebars,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bottom Brackets' THEN qsi.OrderQty ELSE 0 END) AS BottomBrackets,
            SUM(CASE WHEN qsi.SubcategoryName = 'Brakes' THEN qsi.OrderQty ELSE 0 END) AS Brakes,
            SUM(CASE WHEN qsi.SubcategoryName = 'Chains' THEN qsi.OrderQty ELSE 0 END) AS Chains,
            SUM(CASE WHEN qsi.SubcategoryName = 'Cranksets' THEN qsi.OrderQty ELSE 0 END) AS Cranksets,
            SUM(CASE WHEN qsi.SubcategoryName = 'Derailleurs' THEN qsi.OrderQty ELSE 0 END) AS Derailleurs,
            SUM(CASE WHEN qsi.SubcategoryName = 'Forks' THEN qsi.OrderQty ELSE 0 END) AS Forks,
            SUM(CASE WHEN qsi.SubcategoryName = 'Headsets' THEN qsi.OrderQty ELSE 0 END) AS Headsets,
            SUM(CASE WHEN qsi.SubcategoryName = 'Mountain Frames' THEN qsi.OrderQty ELSE 0 END) AS MountainFrames,
            SUM(CASE WHEN qsi.SubcategoryName = 'Pedals' THEN qsi.OrderQty ELSE 0 END) AS Pedals,
            SUM(CASE WHEN qsi.SubcategoryName = 'Road Frames' THEN qsi.OrderQty ELSE 0 END) AS RoadFrames,
            SUM(CASE WHEN qsi.SubcategoryName = 'Saddles' THEN qsi.OrderQty ELSE 0 END) AS Saddles, 
            SUM(CASE WHEN qsi.SubcategoryName = 'Touring Frames' THEN qsi.OrderQty ELSE 0 END) AS TouringFrames,
            SUM(CASE WHEN qsi.SubcategoryName = 'Wheels' THEN qsi.OrderQty ELSE 0 END) AS Wheels,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bib-Shorts' THEN qsi.OrderQty ELSE 0 END) AS BibShorts,
            SUM(CASE WHEN qsi.SubcategoryName = 'Caps' THEN qsi.OrderQty ELSE 0 END) AS Caps,
            SUM(CASE WHEN qsi.SubcategoryName = 'Gloves' THEN qsi.OrderQty ELSE 0 END) AS Gloves,
            SUM(CASE WHEN qsi.SubcategoryName = 'Jerseys' THEN qsi.OrderQty ELSE 0 END) AS Jerseys,
            SUM(CASE WHEN qsi.SubcategoryName = 'Shorts' THEN qsi.OrderQty ELSE 0 END) AS Shorts,
            SUM(CASE WHEN qsi.SubcategoryName = 'Socks' THEN qsi.OrderQty ELSE 0 END) AS Socks,
            SUM(CASE WHEN qsi.SubcategoryName = 'Tights' THEN qsi.OrderQty ELSE 0 END) AS Tights,
            SUM(CASE WHEN qsi.SubcategoryName = 'Vests' THEN qsi.OrderQty ELSE 0 END) AS Vests,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bike Racks' THEN qsi.OrderQty ELSE 0 END) AS BikeRacks,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bike Stands' THEN qsi.OrderQty ELSE 0 END) AS BikeStands,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bottles and Cages' THEN qsi.OrderQty ELSE 0 END) AS BottlesandCages,
            SUM(CASE WHEN qsi.SubcategoryName = 'Cleaners' THEN qsi.OrderQty ELSE 0 END) AS Cleaners,
            SUM(CASE WHEN qsi.SubcategoryName = 'Fenders' THEN qsi.OrderQty ELSE 0 END) AS Fenders,
            SUM(CASE WHEN qsi.SubcategoryName = 'Helmets' THEN qsi.OrderQty ELSE 0 END) AS Helmets,
            SUM(CASE WHEN qsi.SubcategoryName = 'Hydration Packs' THEN qsi.OrderQty ELSE 0 END) AS HydrationPacks,
            SUM(CASE WHEN qsi.SubcategoryName = 'Lights' THEN qsi.OrderQty ELSE 0 END) AS Lights,
            SUM(CASE WHEN qsi.SubcategoryName = 'Locks' THEN qsi.OrderQty ELSE 0 END) AS Lockss,
            SUM(CASE WHEN qsi.SubcategoryName = 'Panniers' THEN qsi.OrderQty ELSE 0 END) AS Panniers,
            SUM(CASE WHEN qsi.SubcategoryName = 'Pumps' THEN qsi.OrderQty ELSE 0 END) AS Pumps,
            SUM(CASE WHEN qsi.SubcategoryName = 'Tires and Tubes' THEN qsi.OrderQty ELSE 0 END) AS TiresandTubes,

            SUM(CASE WHEN qsi.SubcategoryName = 'Mountain Bikes' THEN qsi.Weight ELSE 0 END) AS MountainBikesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Road Bikes' THEN qsi.Weight ELSE 0 END) AS RoadBikesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Touring Bikes' THEN qsi.Weight ELSE 0 END) AS TouringBikesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Handlebars' THEN qsi.Weight ELSE 0 END) AS HandlebarsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bottom Brackets' THEN qsi.Weight ELSE 0 END) AS BottomBracketsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Brakes' THEN qsi.Weight ELSE 0 END) AS BrakesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Chains' THEN qsi.Weight ELSE 0 END) AS ChainsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Cranksets' THEN qsi.Weight ELSE 0 END) AS CranksetsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Derailleurs' THEN qsi.Weight ELSE 0 END) AS DerailleursWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Forks' THEN qsi.Weight ELSE 0 END) AS ForksWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Headsets' THEN qsi.Weight ELSE 0 END) AS HeadsetsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Mountain Frames' THEN qsi.Weight ELSE 0 END) AS MountainFramesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Pedals' THEN qsi.Weight ELSE 0 END) AS PedalsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Road Frames' THEN qsi.Weight ELSE 0 END) AS RoadFramesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Saddles' THEN qsi.Weight ELSE 0 END) AS SaddlesWeight, 
            SUM(CASE WHEN qsi.SubcategoryName = 'Touring Frames' THEN qsi.Weight ELSE 0 END) AS TouringFramesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Wheels' THEN qsi.Weight ELSE 0 END) AS WheelsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bib-Shorts' THEN qsi.Weight ELSE 0 END) AS BibShortsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Caps' THEN qsi.Weight ELSE 0 END) AS CapsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Gloves' THEN qsi.Weight ELSE 0 END) AS GlovesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Jerseys' THEN qsi.Weight ELSE 0 END) AS JerseysWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Shorts' THEN qsi.Weight ELSE 0 END) AS ShortsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Socks' THEN qsi.Weight ELSE 0 END) AS SocksWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Tights' THEN qsi.Weight ELSE 0 END) AS TightsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Vests' THEN qsi.Weight ELSE 0 END) AS VestsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bike Racks' THEN qsi.Weight ELSE 0 END) AS BikeRacksWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bike Stands' THEN qsi.Weight ELSE 0 END) AS BikeStandsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bottles and Cages' THEN qsi.Weight ELSE 0 END) AS BottlesandCagesWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Cleaners' THEN qsi.Weight ELSE 0 END) AS CleanersWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Fenders' THEN qsi.Weight ELSE 0 END) AS FendersWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Helmets' THEN qsi.Weight ELSE 0 END) AS HelmetsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Hydration Packs' THEN qsi.Weight ELSE 0 END) AS HydrationPacksWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Lights' THEN qsi.Weight ELSE 0 END) AS LightsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Locks' THEN qsi.Weight ELSE 0 END) AS LockssWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Panniers' THEN qsi.Weight ELSE 0 END) AS PanniersWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Pumps' THEN qsi.Weight ELSE 0 END) AS PumpsWeight,
            SUM(CASE WHEN qsi.SubcategoryName = 'Tires and Tubes' THEN qsi.Weight ELSE 0 END) AS TiresandTubesWeight,
            
            SUM(CASE WHEN qsi.SubcategoryName = 'Mountain Bikes' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS MountainBikesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Road Bikes' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS RoadBikesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Touring Bikes' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS TouringBikesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Handlebars' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS HandlebarsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bottom Brackets' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS BottomBracketsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Brakes' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS BrakesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Chains' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS ChainsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Cranksets' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS CranksetsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Derailleurs' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS DerailleursProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Forks' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS ForksProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Headsets' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS HeadsetsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Mountain Frames' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS MountainFramesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Pedals' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS PedalsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Road Frames' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS RoadFramesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Saddles' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS SaddlesProfit, 
            SUM(CASE WHEN qsi.SubcategoryName = 'Touring Frames' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS TouringFramesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Wheels' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS WheelsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bib-Shorts' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS BibShortsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Caps' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS CapsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Gloves' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS GlovesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Jerseys' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS JerseysProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Shorts' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS ShortsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Socks' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS SocksProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Tights' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS TightsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Vests' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS VestsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bike Racks' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS BikeRacksProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bike Stands' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS BikeStandsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Bottles and Cages' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS BottlesandCagesProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Cleaners' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS CleanersProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Fenders' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS FendersProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Helmets' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS HelmetsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Hydration Packs' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS HydrationPacksProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Lights' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS LightsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Locks' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS LockssProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Panniers' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS PanniersProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Pumps' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS PumpsProfit,
            SUM(CASE WHEN qsi.SubcategoryName = 'Tires and Tubes' THEN qsi.OrderQty * si.ProfitPerProduct ELSE 0 END) AS TiresandTubesProfit,
            
            SUM(qsi.Weight) AS TotalWeightAllSubcategories
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

    # group_data = {}
    # for row in data:
    #     country = row['CountryRegionCode']
    #     if country not in group_data:
    #         group_data[country] = []
    #     group_data[country].append(dict(row))
    group_data = defaultdict(lambda: defaultdict(lambda: defaultdict(list))) 
    for row in data: 
        country = row['CountryRegionCode'] 
        year = row['Year'] 
        quarter = row['Quarter'] 
        group_data[country][year][quarter].append(dict(row))

    grouped_by_subcategory = {}

    for country, year_data in group_data.items():
        grouped_by_subcategory[country] = {}
        for year, quarter_data in year_data.items():
            grouped_by_subcategory[country][year] = {}
            for quarter, records in quarter_data.items():
                subcategory_data = {}
                for record in records:
                    total_profit = float(record['TotalProfit']) if record['TotalProfit'] else 1  
                    total_weight = float(record['TotalWeightAllSubcategories']) if record['TotalWeightAllSubcategories'] else 1  
                    for key, value in record.items():
                        if 'Profit' in key and key != 'TotalProfit':
                            subcategory = key.replace('Profit', '')
                            subcategory_data.setdefault(subcategory, {"Quantity": 0, "Weight": 0.0, "Profit": 0.0})
                            profit_value = float(value)
                            subcategory_data[subcategory]['Profit'] += max(round(profit_value / total_profit * 100, 2), 0)
                        elif 'Weight' in key and key != 'TotalWeightAllSubcategories':
                            subcategory = key.replace('Weight', '')
                            subcategory_data.setdefault(subcategory, {"Quantity": 0, "Weight": 0.0, "Profit": 0.0})
                            weight_value = float(value)
                            if weight_value == 0:
                                weight_value = 0.1
                            subcategory_data[subcategory]['Weight'] += max(round(weight_value / total_weight * 100, 2), 0)
                        elif key not in ('TotalRevenue', 'TotalProfit', 'TotalWeightAllSubcategories', 'Year', 'Quarter', 'CountryRegionCode'):
                            subcategory = key
                            subcategory_data.setdefault(subcategory, {"Quantity": 0, "Weight": 0.0, "Profit": 0.0})
                            subcategory_data[subcategory]['Quantity'] += int(value)
                filtered_subcategory_data = {k: v for k, v in subcategory_data.items() if not (v['Quantity'] == 0 and v['Profit'] == 0.0)}
                grouped_by_subcategory[country][year][quarter] = filtered_subcategory_data

    return jsonify(grouped_by_subcategory)

def get_all_products():
    sql = text('SELECT * FROM salesinfo;')
    result = db.session.execute(sql) 
    data = result.mappings().all()

    group_data = {}
    for row in data:
        country = row['CountryRegionCode']
        if country not in group_data:
            group_data[country] = []
        group_data[country].append(dict(row))

    # data_dict = [dict(row) for row in data] 
    return jsonify(group_data), 200

def add_new_product(name,desc,weight, cost, subcategoryid):
    result = db.session.execute(
        text("CALL AddNewProduct(:name,:desc,:weight, :cost, :subcategoryid)"), 
        { 
            'name': name,
            'desc': desc,
            'weight': weight, 
            'cost': cost, 
            'subcategoryid': subcategoryid, 
        }
    )
    db.session.commit()
    socketio.emit('update_data', {'status': 'success', 'message': 'Product updated successfully'})
    return {"message": "product added successfully"}, 201

def delete_product(productid):
    result = db.session.execute(
        text("CALL DeleteProduct(:id)"), 
        { 
            'id': productid,
        }
    )
    db.session.commit()
    socketio.emit('update_data', {'status': 'success', 'message': 'Product updated successfully'})
    return {"message": "product deleted successfully"}, 201

def update_sales(productid, country, qty, sellprice, cost=None):
    result = db.session.execute(
        text("CALL UpdateProductSales(:productid, :country, :qty, :sellprice, :cost)"), 
        { 
            'productid': productid,
            'country':country,
            'qty':qty,
            'sellprice':sellprice,
            'cost':cost
        }
    )
    db.session.commit()
    socketio.emit('update_data', {'status': 'success', 'message': 'Product updated successfully'})
    return {"message": "updated successfully"}, 201

#support function for calcu

def calculate_combined_index(data_dict):
    combined_indices = {} 

    for year, products in data_dict.items():
        print(f"Năm {year}:")
        for product, values in products.items():
            profit = values["Profit"]
            quantity = values["Quantity"]
            weight = values["Weight"]
            
            if weight != 0:
                profit_weight_ratio = profit / weight
            else:
                profit_weight_ratio = profit / quantity
            
            profit_quantity_ratio = profit / quantity
            
            combined_index = (profit_weight_ratio + profit_quantity_ratio) / 2  
            
            if product not in combined_indices:
                combined_indices[product] = []
            combined_indices[product].append((year, combined_index))

    return combined_indices

def predict_future_index(composite_indices):
    output = {}
    for product, indices in composite_indices.items():
        years = np.array([int(year) for year, _ in indices]).reshape(-1, 1)
        index_values = np.array([index for _, index in indices])
        
        model = LinearRegression()
        
        model.fit(years, index_values)
        
        year_2015 = np.array([[2015]])
        predicted_index_2015 = model.predict(year_2015)
        
        output[product] = round(predicted_index_2015[0], 2)
    return output

def optimize_storage(predicted_indices):
    products = list(predicted_indices.keys())
    indices = np.array(list(predicted_indices.values()))
    
    c = -indices  
    
    A_eq = np.ones((1, len(products)))
    b_eq = np.array([1])
    
    bounds = [(0.001, 0.6) for _ in range(len(products))]
    
    result = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    
    if result.success:
        allocation = result.x
        allocation_dict = {products[i]: round(allocation[i] * 100, 2) for i in range(len(products))}
        return allocation_dict
    else:
        return "Không tìm thấy giải pháp tối ưu"

def combine_allocation(optimized_allocation, current_allocation, capacity = 1, min_percentage=0.001):
    total_allocated = sum(
        float(value) for product, value in current_allocation.items() if isinstance(value, (float, int))
    )
    
    final_allocation = current_allocation.copy()
    
    for product in set(optimized_allocation.keys()).union(current_allocation.keys()):
        try:
            current_alloc = float(final_allocation.get(product, 0))
            if current_alloc < min_percentage:
                additional_alloc = min_percentage - current_alloc
                if total_allocated + additional_alloc <= capacity:
                    final_allocation[product] = round(min_percentage, 4)
                    total_allocated += additional_alloc
                else:
                    final_allocation[product] = round(current_alloc + (capacity - total_allocated), 4)
                    total_allocated = capacity

            if total_allocated >= capacity:
                break
        except:
            print("skip")
    
    for product, desired_alloc in optimized_allocation.items():
        current_alloc = float(final_allocation.get(product, 0))
        
        if current_alloc < desired_alloc / 100:
            additional_alloc = desired_alloc / 100 - current_alloc
            if total_allocated + additional_alloc <= capacity:
                final_allocation[product] = round(current_alloc + additional_alloc, 4)
                total_allocated += additional_alloc
            else:
                final_allocation[product] = round(current_alloc + (capacity - total_allocated), 4)
                total_allocated = capacity
                
        if total_allocated >= capacity:
            break
    
    return final_allocation

#


def calcu_from_import(data):
    if(data['time'] == 'now'):
        time = datetime.now().month
        if 1 <= time <= 3:
            time = 1
        elif 4 <= time <= 6:
            time = 2
        elif 7 <= time <= 9:
            time = 3
        else:
            time = 4
    else: 
        time = int(data['time'])
    was = get_weight_and_subcategory().get_json()
    result = {} 
    for year, quarters in was[data['region']].items(): 
        if str(time) in quarters: 
            result[year] = quarters[str(time)] 
    # print(result)
    composite_indices = calculate_combined_index(result)
    predicted_indices = predict_future_index(composite_indices)
    # print(predicted_indices)
    optimized_allocation = optimize_storage(predicted_indices)
    # data_dict = json.loads(result)
    if data['inventory'] == '':
        capacity = 1
    else:
        capacity = float(data['inventory'])
    final_allocation = combine_allocation(optimized_allocation, data, capacity)
    return {"message": "No broblem!", "data": final_allocation}, 200


def test():
    return {"message": "No broblem!"}, 201