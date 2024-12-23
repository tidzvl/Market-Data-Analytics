#
# File: models.py
# Author: TiDz
# Contact: nguyentinvs123@gmail.com
# Created on Mon Dec 23 2024
# Description: 
# Useage: 
#

from app import db

class SalesInfo(db.Model):
    __tablename__ = 'salesinfo'
    ProductID = db.Column(db.Integer, primary_key=True)
    TotalQtySold = db.Column(db.Integer)
    TotalLine = db.Column(db.Numeric)
    CountryRegionCode = db.Column(db.String(3), db.ForeignKey('countryregion.CountryRegionCode'), primary_key=True)
    Weight = db.Column(db.Numeric)
    StandardCost = db.Column(db.Numeric)
    TotalCost = db.Column(db.Numeric)
    TotalProfit = db.Column(db.Numeric)
    ProfitPerProduct = db.Column(db.Numeric)
    ProductSubcategoryID = db.Column(db.Integer, db.ForeignKey('productsubcategory.ProductSubcategoryID'))
    SubcategoryName = db.Column(db.String(255))
    CategoryName = db.Column(db.String(255))

class QuarterlySalesInfo(db.Model):
    __tablename__ = 'quarterlysalesinfo'
    StartDate = db.Column(db.Date, primary_key=True)
    EndDate = db.Column(db.Date, primary_key=True)
    ProductID = db.Column(db.Integer, primary_key=True)
    Weight = db.Column(db.Numeric)
    OrderQty = db.Column(db.Integer)
    LineTotal = db.Column(db.Numeric)
    CountryRegionCode = db.Column(db.String(3), db.ForeignKey('countryregion.CountryRegionCode'), primary_key=True)
    ProductSubcategoryID = db.Column(db.Integer, db.ForeignKey('productsubcategory.ProductSubcategoryID'))
    SubcategoryName = db.Column(db.String(255))
    CategoryName = db.Column(db.String(255))

class CountryRegion(db.Model):
    __tablename__ = 'countryregion'
    CountryRegionCode = db.Column(db.String(3), primary_key=True)
    CountryRegionName = db.Column(db.String(255))

class ProductSubcategory(db.Model):
    __tablename__ = 'productsubcategory'
    ProductSubcategoryID = db.Column(db.Integer, primary_key=True)
    SubcategoryName = db.Column(db.String(255))
    CategoryName = db.Column(db.String(255))
