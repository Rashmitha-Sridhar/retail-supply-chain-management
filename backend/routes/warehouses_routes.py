from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from config.db import mongo
import re

warehouses = Blueprint("warehouses", __name__)

# ------------------------------------------
# Helper: Auto Generate Warehouse Code
# ------------------------------------------
def generate_next_code():
    last_wh = (
        mongo.db.warehouses
        .find()
        .sort("_id", -1)
        .limit(1)
    )
    last_wh = list(last_wh)

    if not last_wh:
        return "WH-001"

    last_code = last_wh[0].get("warehouse_code", "WH-000")
    try:
        num = int(last_code.split("-")[1])
    except:
        num = 0

    next_code = f"WH-{num + 1:03d}"
    return next_code


# ------------------------------------------
# Serialize warehouse
# ------------------------------------------
def serialize_wh(wh):
    return {
        "id": str(wh["_id"]),
        "warehouse_code": wh.get("warehouse_code"),
        "name": wh.get("name"),
        "location": wh.get("location"),
        "address": wh.get("address"),
        "capacity": wh.get("capacity"),
        "current_stock": wh.get("current_stock"),
        "manager_name": wh.get("manager_name"),
        "contact_phone": wh.get("contact_phone")
    }


# ------------------------------------------
# Validation logic
# ------------------------------------------
def validate_warehouse(data, is_update=False):
    errors = {}

    required_fields = ["name", "location", "capacity", "manager_name", "contact_phone"]

    if not is_update:
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                errors[field] = f"{field.replace('_', ' ').title()} is required"

    # Name
    if "name" in data:
        if len(data["name"].strip()) < 3:
            errors["name"] = "Name must be at least 3 characters"

    # Location
    if "location" in data:
        if len(data["location"].strip()) < 3:
            errors["location"] = "Location must be at least 3 characters"

    # Capacity
    if "capacity" in data:
        try:
            cap = int(data["capacity"])
            if cap <= 0:
                errors["capacity"] = "Capacity must be greater than 0"
        except:
            errors["capacity"] = "Capacity must be a number"

    # Current stock
    if "current_stock" in data:
        try:
            stock = int(data["current_stock"])
            if stock < 0:
                errors["current_stock"] = "Current stock cannot be negative"
        except:
            errors["current_stock"] = "Current stock must be a number"

    # Manager name
    if "manager_name" in data:
        if not re.match(r"^[A-Za-z\s]{3,50}$", data["manager_name"]):
            errors["manager_name"] = "Manager name must contain only letters"

    # Phone
    if "contact_phone" in data:
        if not re.match(r"^[0-9]{10}$", data["contact_phone"]):
            errors["contact_phone"] = "Phone must be exactly 10 digits"

    return errors


# ------------------------------------------
# CREATE warehouse
# ------------------------------------------
@warehouses.route("/", methods=["POST"])
@jwt_required()
def add_warehouse():
    data = request.json
    errors = validate_warehouse(data)

    if errors:
        return jsonify({"errors": errors}), 400

    warehouse_code = generate_next_code()

    new_wh = {
        "warehouse_code": warehouse_code,
        "name": data["name"],
        "location": data["location"],
        "address": data.get("address", ""),
        "capacity": int(data["capacity"]),
        "current_stock": 0,   # Always starts with 0
        "manager_name": data["manager_name"],
        "contact_phone": data["contact_phone"]
    }

    mongo.db.warehouses.insert_one(new_wh)

    return jsonify({"message": "Warehouse added", "warehouse_code": warehouse_code}), 201


# ------------------------------------------
# GET all warehouses
# ------------------------------------------
@warehouses.route("/", methods=["GET"])
@jwt_required()
def get_warehouses():
    data = mongo.db.warehouses.find()
    warehouses_list = [serialize_wh(w) for w in data]
    return jsonify(warehouses_list), 200


# ------------------------------------------
# UPDATE warehouse
# ------------------------------------------
@warehouses.route("/<id>", methods=["PUT"])
@jwt_required()
def update_warehouse(id):
    try:
        wh = mongo.db.warehouses.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not wh:
        return jsonify({"error": "Warehouse not found"}), 404

    data = request.json
    errors = validate_warehouse(data, is_update=True)

    if errors:
        return jsonify({"errors": errors}), 400

    if "capacity" in data:
        new_cap = int(data["capacity"])
        if new_cap < wh["current_stock"]:
            return jsonify({"error": "Capacity cannot be lower than current stock"}), 400

    mongo.db.warehouses.update_one({"_id": ObjectId(id)}, {"$set": data})

    return jsonify({"message": "Warehouse updated"}), 200


# ------------------------------------------
# DELETE warehouse
# ------------------------------------------
@warehouses.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_warehouse(id):
    try:
        wh = mongo.db.warehouses.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not wh:
        return jsonify({"error": "Warehouse not found"}), 404

    mongo.db.warehouses.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Warehouse deleted"}), 200
