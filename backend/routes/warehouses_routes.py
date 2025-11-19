from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from config.db import mongo

warehouses = Blueprint("warehouses", __name__)

# Serialize helper
def serialize_wh(w):
    return {
        "id": str(w["_id"]),
        "name": w["name"],
        "location": w["location"],
        "capacity": w.get("capacity", 0),
        "manager": w.get("manager", "")
    }

# -----------------------------
# CREATE WAREHOUSE
# -----------------------------
@warehouses.route("/add", methods=["POST"])
@jwt_required()
def add_warehouse():
    data = request.json

    required = ["name", "location"]
    if any(f not in data for f in required):
        return jsonify({"error": "Missing required fields"}), 400

    new_warehouse = {
        "name": data["name"],
        "location": data["location"],
        "capacity": data.get("capacity", 0),
        "manager": data.get("manager", "")
    }

    mongo.db.warehouses.insert_one(new_warehouse)
    return jsonify({"message": "Warehouse added successfully"}), 201


# -----------------------------
# GET ALL WAREHOUSES
# -----------------------------
@warehouses.route("/", methods=["GET"])
@jwt_required()
def get_warehouses():
    data = mongo.db.warehouses.find()
    wh_list = [serialize_wh(w) for w in data]
    return jsonify(wh_list), 200


# -----------------------------
# GET BY ID
# -----------------------------
@warehouses.route("/<id>", methods=["GET"])
@jwt_required()
def get_warehouse(id):
    warehouse = mongo.db.warehouses.find_one({"_id": ObjectId(id)})
    if not warehouse:
        return jsonify({"error": "Warehouse not found"}), 404

    return jsonify(serialize_wh(warehouse)), 200


# -----------------------------
# UPDATE
# -----------------------------
@warehouses.route("/<id>", methods=["PUT"])
@jwt_required()
def update_warehouse(id):
    data = request.json

    warehouse = mongo.db.warehouses.find_one({"_id": ObjectId(id)})
    if not warehouse:
        return jsonify({"error": "Warehouse not found"}), 404

    mongo.db.warehouses.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )

    return jsonify({"message": "Warehouse updated successfully"}), 200


# -----------------------------
# DELETE
# -----------------------------
@warehouses.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_warehouse(id):
    warehouse = mongo.db.warehouses.find_one({"_id": ObjectId(id)})
    if not warehouse:
        return jsonify({"error": "Warehouse not found"}), 404

    mongo.db.warehouses.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Warehouse deleted successfully"}), 200
