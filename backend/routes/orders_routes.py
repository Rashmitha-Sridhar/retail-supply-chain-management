from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from datetime import datetime
from config.db import mongo

orders = Blueprint("orders", __name__)

# Serialize helper
def serialize_order(o):
    return {
        "id": str(o["_id"]),
        "item_name": o["item_name"],
        "quantity": o["quantity"],
        "store_id": str(o["store_id"]),
        "warehouse_id": str(o["warehouse_id"]),
        "supplier_id": str(o["supplier_id"]),
        "status": o.get("status", "pending"),
        "created_at": o.get("created_at")
    }

# ----------------------------------------
# CREATE ORDER
# ----------------------------------------
@orders.route("/add", methods=["POST"])
@jwt_required()
def add_order():
    data = request.json

    required = ["item_name", "quantity", "store_id", "warehouse_id", "supplier_id"]
    if any(f not in data for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    order = {
        "item_name": data["item_name"],
        "quantity": int(data["quantity"]),
        "store_id": ObjectId(data["store_id"]),
        "warehouse_id": ObjectId(data["warehouse_id"]),
        "supplier_id": ObjectId(data["supplier_id"]),
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    mongo.db.orders.insert_one(order)
    return jsonify({"message": "Order created successfully"}), 201


# ----------------------------------------
# GET ALL ORDERS
# ----------------------------------------
@orders.route("/", methods=["GET"])
@jwt_required()
def get_orders():
    orders_data = mongo.db.orders.find()
    result = [serialize_order(o) for o in orders_data]
    return jsonify(result), 200


# ----------------------------------------
# GET ORDER BY ID
# ----------------------------------------
@orders.route("/<id>", methods=["GET"])
@jwt_required()
def get_order(id):
    order = mongo.db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(serialize_order(order)), 200


# ----------------------------------------
# UPDATE ORDER (status or quantity)
# ----------------------------------------
@orders.route("/<id>", methods=["PUT"])
@jwt_required()
def update_order(id):
    data = request.json
    order = mongo.db.orders.find_one({"_id": ObjectId(id)})
    
    if not order:
        return jsonify({"error": "Order not found"}), 404

    mongo.db.orders.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )

    return jsonify({"message": "Order updated successfully"}), 200


# ----------------------------------------
# DELETE ORDER
# ----------------------------------------
@orders.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_order(id):
    order = mongo.db.orders.find_one({"_id": ObjectId(id)})
    if not order:
        return jsonify({"error": "Order not found"}), 404

    mongo.db.orders.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Order deleted successfully"}), 200
