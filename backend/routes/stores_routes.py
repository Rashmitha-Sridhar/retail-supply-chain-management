from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from datetime import datetime
from config.db import mongo

stores = Blueprint("stores", __name__)

# ======================================================
# Helper: Auto-generate next Store Code
# ======================================================
def generate_next_store_code():
    last_store = (
        mongo.db.stores.find().sort("_id", -1).limit(1)
    )

    last_store = list(last_store)

    if not last_store:
        return "ST-001"

    last_code = last_store[0].get("store_code", "ST-000")

    try:
        num = int(last_code.split("-")[1])
    except:
        num = 0

    return f"ST-{num + 1:03d}"


# ======================================================
# Helper: Serialize Store Document
# ======================================================
def serialize_store(s):
    return {
        "id": str(s["_id"]),
        "store_code": s.get("store_code"),
        "name": s.get("name"),
        "location": s.get("location"),
        "address": s.get("address"),
        "warehouse_id": str(s.get("warehouse_id")),
        "warehouse_code": s.get("warehouse_code"),
        "manager_name": s.get("manager_name"),
        "contact_phone": s.get("contact_phone"),
        "current_stock": s.get("current_stock", 0),
        "created_at": s.get("created_at"),
    }


# ======================================================
# CREATE STORE
# ======================================================
@stores.route("/", methods=["POST"])
@jwt_required()
def add_store():
    data = request.json

    # ---- BASIC REQUIRED VALIDATIONS ----
    required = ["name", "location", "address", "manager_name", "contact_phone", "warehouse_id"]

    for field in required:
        if field not in data or not str(data[field]).strip():
            return jsonify({"error": f"{field.replace('_', ' ').title()} is required"}), 400

    # ---- NAME VALIDATION ----
    if len(data["name"]) < 3 or not data["name"].replace(" ", "").isalpha():
        return jsonify({"error": "Name must contain at least 3 alphabetic characters"}), 400

    # ---- LOCATION VALIDATION ----
    if not data["location"].replace(" ", "").isalpha():
        return jsonify({"error": "Location must contain only letters"}), 400

    # ---- ADDRESS VALIDATION ----
    if len(data["address"]) < 5:
        return jsonify({"error": "Address must be at least 5 characters"}), 400

    # ---- MANAGER NAME VALIDATION ----
    if len(data["manager_name"]) < 3 or not data["manager_name"].replace(" ", "").isalpha():
        return jsonify({"error": "Manager name must be valid letters"}), 400

    # ---- CONTACT PHONE VALIDATION ----
    if not data["contact_phone"].isdigit() or len(data["contact_phone"]) != 10:
        return jsonify({"error": "Contact phone must be exactly 10 digits"}), 400

    # ---- VERIFY WAREHOUSE EXISTS ----
    try:
        warehouse = mongo.db.warehouses.find_one({"_id": ObjectId(data["warehouse_id"])})
    except:
        return jsonify({"error": "Invalid warehouse ID"}), 400

    if not warehouse:
        return jsonify({"error": "Warehouse not found"}), 404

    warehouse_code = warehouse.get("warehouse_code")

    # ---- AUTO GENERATE STORE CODE ----
    store_code = generate_next_store_code()

    # ---- CREATE STORE DOCUMENT ----
    new_store = {
        "store_code": store_code,
        "name": data["name"],
        "location": data["location"],
        "address": data["address"],
        "warehouse_id": warehouse["_id"],
        "warehouse_code": warehouse_code,
        "manager_name": data["manager_name"],
        "contact_phone": data["contact_phone"],
        "current_stock": 0,
        "created_at": datetime.utcnow().isoformat()
    }

    mongo.db.stores.insert_one(new_store)

    return jsonify({
        "message": "Store added successfully",
        "store_code": store_code
    }), 201


# ======================================================
# GET ALL STORES
# ======================================================
@stores.route("/", methods=["GET"])
@jwt_required()
def get_stores():
    data = mongo.db.stores.find()
    stores_list = [serialize_store(s) for s in data]
    return jsonify(stores_list), 200


# ======================================================
# GET STORE BY ID
# ======================================================
@stores.route("/<id>", methods=["GET"])
@jwt_required()
def get_store(id):
    try:
        s = mongo.db.stores.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not s:
        return jsonify({"error": "Store not found"}), 404

    return jsonify(serialize_store(s)), 200


# ======================================================
# UPDATE STORE
# ======================================================
@stores.route("/<id>", methods=["PUT"])
@jwt_required()
def update_store(id):
    try:
        s = mongo.db.stores.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not s:
        return jsonify({"error": "Store not found"}), 404

    data = request.json

    # You may add validation here too (optional)
    mongo.db.stores.update_one({"_id": ObjectId(id)}, {"$set": data})

    return jsonify({"message": "Store updated successfully"}), 200


# ======================================================
# DELETE STORE
# ======================================================
@stores.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_store(id):
    try:
        s = mongo.db.stores.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not s:
        return jsonify({"error": "Store not found"}), 404

    mongo.db.stores.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Store deleted successfully"}), 200
