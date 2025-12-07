# routes/stock_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from config.db import mongo
import datetime
import re

stock = Blueprint("stock", __name__)

# ------------------------------------------
# VALIDATION HELPERS
# ------------------------------------------
def validate_stock_entry(data):
    errors = {}

    required = ["warehouse_id", "product_name", "qty_added", "unit"]
    for field in required:
        if field not in data or not str(data[field]).strip():
            errors[field] = f"{field.replace('_', ' ').title()} is required"

    # product name
    if "product_name" in data:
        name = data["product_name"].strip()
        if len(name) < 2:
            errors["product_name"] = "Product name must be at least 2 characters"

    # qty added
    if "qty_added" in data:
        try:
            q = int(data["qty_added"])
            if q <= 0:
                errors["qty_added"] = "Quantity must be greater than 0"
        except:
            errors["qty_added"] = "Quantity must be a number"

    # unit
    if "unit" in data:
        if not re.match(r"^[A-Za-z]{2,10}$", data["unit"]):
            errors["unit"] = "Unit must be alphabetic (e.g., pcs, kg, L)"

    return errors


# ------------------------------------------
# ADD STOCK TO WAREHOUSE
# ------------------------------------------
@stock.route("/", methods=["POST"])
@jwt_required()
def add_stock():
    data = request.json or {}
    errors = validate_stock_entry(data)

    if errors:
        return jsonify({"errors": errors}), 400

    warehouse_id = data["warehouse_id"]

    # validate warehouse
    try:
        wh_obj_id = ObjectId(warehouse_id)
        warehouse = mongo.db.warehouses.find_one({"_id": wh_obj_id})
    except:
        return jsonify({"error": "Invalid warehouse_id"}), 400

    if not warehouse:
        return jsonify({"error": "Warehouse not found"}), 404

    product = data["product_name"].strip()
    qty_added = int(data["qty_added"])
    unit = data["unit"].strip().lower()
    notes = data.get("notes", "").strip()

    # ensure the stock dict exists
    current_stock = warehouse.get("current_stock", {})

    prev_qty = current_stock.get(product, {}).get("qty", 0)

    # update stock
    current_stock[product] = {
        "qty": prev_qty + qty_added,
        "unit": unit
    }

    mongo.db.warehouses.update_one(
        {"_id": wh_obj_id},
        {"$set": {"current_stock": current_stock}}
    )

    # log transaction
    now = datetime.datetime.utcnow()

    user_id = get_jwt_identity()
    user_doc = None
    added_by_name = None

    if user_id:
        try:
            user_doc = mongo.db.users.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                added_by_name = user_doc.get("name")
        except:
            pass

    transaction = {
        "warehouse_id": wh_obj_id,
        "warehouse_name": warehouse.get("name"),

        "product_name": product,
        "qty_added": qty_added,
        "unit": unit,
        "previous_qty": prev_qty,
        "new_qty": prev_qty + qty_added,

        "date": now,
        "notes": notes,

        "added_by": {
            "user_id": ObjectId(user_id) if user_id else None,
            "name": added_by_name
        }
    }

    mongo.db.stock_transactions.insert_one(transaction)

    return jsonify({
        "message": "Stock added successfully",
        "product": product,
        "previous_qty": prev_qty,
        "new_qty": prev_qty + qty_added
    }), 201



# ------------------------------------------
# GET STOCK FOR A WAREHOUSE
# ------------------------------------------
@stock.route("/<warehouse_id>", methods=["GET"])
@jwt_required()
def get_stock(warehouse_id):

    try:
        wh_obj_id = ObjectId(warehouse_id)
        warehouse = mongo.db.warehouses.find_one({"_id": wh_obj_id})
    except:
        return jsonify({"error": "Invalid warehouse_id"}), 400

    if not warehouse:
        return jsonify({"error": "Warehouse not found"}), 404

    return jsonify({
        "warehouse_id": warehouse_id,
        "warehouse_name": warehouse.get("name"),
        "stock": warehouse.get("current_stock", {})
    }), 200
