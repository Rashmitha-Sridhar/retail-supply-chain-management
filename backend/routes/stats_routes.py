from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config.db import mongo

stats = Blueprint("stats", __name__)

# TOTAL COUNT OF ITEMS IN INVENTORY
@stats.route("/inventoryCount", methods=["GET"])
@jwt_required()
def inventory_count():
    count = mongo.db.stores.count_documents({})
    return jsonify({"inventoryCount": count})

# LOW STOCK ITEMS (quantity < 10)
@stats.route("/lowStock", methods=["GET"])
@jwt_required()
def low_stock():
    low = mongo.db.stores.count_documents({"quantity": {"$lt": 10}})
    return jsonify({"lowStockCount": low})

# OUT OF STOCK ITEMS (quantity = 0)
@stats.route("/outOfStock", methods=["GET"])
@jwt_required()
def out_of_stock():
    zero = mongo.db.stores.count_documents({"quantity": 0})
    return jsonify({"outOfStockCount": zero})

# TOTAL SUPPLIERS
@stats.route("/suppliersCount", methods=["GET"])
@jwt_required()
def suppliers_count():
    suppliers = mongo.db.suppliers.count_documents({})
    return jsonify({"suppliersCount": suppliers})

# TOTAL WAREHOUSES
@stats.route("/warehousesCount", methods=["GET"])
@jwt_required()
def warehouses_count():
    warehouses = mongo.db.warehouses.count_documents({})
    return jsonify({"warehousesCount": warehouses})
