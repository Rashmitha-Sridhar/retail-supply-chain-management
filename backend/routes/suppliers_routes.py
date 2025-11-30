from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from bson import ObjectId
from config.db import mongo
import re

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

    # Required fields
    required = ["name", "email", "phone"]
    for field in required:
        if field not in data or not data[field].strip():
            return jsonify({"error": f"{field} is required"}), 400

    # Name validation
    if len(data["name"]) < 3:
        return jsonify({"error": "Name must be at least 3 characters"}), 400
    if not re.match(r"^[A-Za-z\s]+$", data["name"]):
        return jsonify({"error": "Name must contain only letters"}), 400

    # Email validation
    if not re.match(r"^\S+@\S+\.\S+$", data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    # Phone validation
    if not data["phone"].isdigit() or len(data["phone"]) != 10:
        return jsonify({"error": "Phone must be 10 digits"}), 400

    # Address validation
    if len(data.get("address", "")) < 5:
        return jsonify({"error": "Address must be meaningful"}), 400

    # Insert
    mongo.db.suppliers.insert_one({
        "name": data["name"],
        "contact_person": data.get("contact_person", ""),
        "email": data["email"],
        "phone": data["phone"],
        "address": data.get("address", "")
    })

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
