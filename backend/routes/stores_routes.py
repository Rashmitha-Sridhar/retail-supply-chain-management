from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from config.db import mongo

stores = Blueprint("stores", __name__)

# Serialize function
def serialize_store(s):
    return {
        "id": str(s["_id"]),
        "item_name": s["item_name"],
        "category": s.get("category", ""),
        "quantity": s.get("quantity", 0),
        "price": s.get("price", 0),
        "supplier_id": str(s["supplier_id"]) if "supplier_id" in s else None,
        "warehouse_id": str(s["warehouse_id"]) if "warehouse_id" in s else None
    }

# -----------------------------
# CREATE STORE ITEM
# -----------------------------
@stores.route("/add", methods=["POST"])
@jwt_required()
def add_store_item():
    data = request.json

    required = ["item_name", "quantity", "price"]
    if any(field not in data for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    new_item = {
        "item_name": data["item_name"],
        "category": data.get("category", ""),
        "quantity": int(data["quantity"]),
        "price": float(data["price"]),
        "supplier_id": ObjectId(data["supplier_id"]) if "supplier_id" in data else None,
        "warehouse_id": ObjectId(data["warehouse_id"]) if "warehouse_id" in data else None
    }

    mongo.db.stores.insert_one(new_item)
    return jsonify({"message": "Store item added successfully"}), 201


# -----------------------------
# GET ALL STORE ITEMS
# -----------------------------
@stores.route("/", methods=["GET"])
@jwt_required()
def get_store_items():
    items = mongo.db.stores.find()
    result = [serialize_store(i) for i in items]
    return jsonify(result), 200


# -----------------------------
# GET STORE ITEM BY ID
# -----------------------------
@stores.route("/<id>", methods=["GET"])
@jwt_required()
def get_store_item(id):
    item = mongo.db.stores.find_one({"_id": ObjectId(id)})
    if not item:
        return jsonify({"error": "Item not found"}), 404

    return jsonify(serialize_store(item)), 200


# -----------------------------
# UPDATE STORE ITEM
# -----------------------------
@stores.route("/<id>", methods=["PUT"])
@jwt_required()
def update_store_item(id):
    data = request.json
    item = mongo.db.stores.find_one({"_id": ObjectId(id)})

    if not item:
        return jsonify({"error": "Item not found"}), 404

    mongo.db.stores.update_one(
        {"_id": ObjectId(id)},
        {"$set": data}
    )

    return jsonify({"message": "Store item updated successfully"}), 200


# -----------------------------
# DELETE STORE ITEM
# -----------------------------
@stores.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_store_item(id):
    item = mongo.db.stores.find_one({"_id": ObjectId(id)})

    if not item:
        return jsonify({"error": "Item not found"}), 404

    mongo.db.stores.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Store item deleted successfully"}), 200
