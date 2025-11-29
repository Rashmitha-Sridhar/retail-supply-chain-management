from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from config.db import mongo

suppliers = Blueprint("suppliers", __name__)

# Serialize MongoDB document
def serialize_supplier(s):
    return {
        "id": str(s["_id"]),
        "name": s.get("name"),
        "contact_person": s.get("contact_person"),
        "email": s.get("email"),
        "phone": s.get("phone"),
        "address": s.get("address"),
        "created_at": s.get("created_at")
    }

# CREATE SUPPLIER
@suppliers.route("/", methods=["POST"])
@jwt_required()
def add_supplier():
    data = request.json

    required = ["name", "email", "phone"]
    if any(field not in data for field in required):
        return jsonify({"error": "Missing required fields"}), 400

    new_supplier = {
        "name": data["name"],
        "contact_person": data.get("contact_person", ""),
        "email": data["email"],
        "phone": data["phone"],
        "address": data.get("address", "")
    }

    mongo.db.suppliers.insert_one(new_supplier)
    return jsonify({"message": "Supplier added successfully"}), 201

# GET ALL SUPPLIERS
@suppliers.route("/", methods=["GET"])
@jwt_required()
def get_suppliers():
    data = mongo.db.suppliers.find()
    suppliers_list = [serialize_supplier(s) for s in data]
    return jsonify(suppliers_list), 200

# GET SUPPLIER BY ID
@suppliers.route("/<id>", methods=["GET"])
@jwt_required()
def get_supplier(id):
    try:
        supplier = mongo.db.suppliers.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    return jsonify(serialize_supplier(supplier)), 200

# UPDATE SUPPLIER
@suppliers.route("/<id>", methods=["PUT"])
@jwt_required()
def update_supplier(id):
    try:
        supplier = mongo.db.suppliers.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    data = request.json
    mongo.db.suppliers.update_one({"_id": ObjectId(id)}, {"$set": data})
    return jsonify({"message": "Supplier updated successfully"}), 200

# DELETE SUPPLIER
@suppliers.route("/<id>", methods=["DELETE"])
@jwt_required()
def delete_supplier(id):
    try:
        supplier = mongo.db.suppliers.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid ID"}), 400

    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    mongo.db.suppliers.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Supplier deleted successfully"}), 200
