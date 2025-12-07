# routes/orders_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from config.db import mongo
import datetime

orders = Blueprint("orders", __name__)

ALLOWED_STATUSES = {"pending", "approved", "dispatched", "delivered", "cancelled"}
ALLOWED_PRIORITIES = {"low", "medium", "high", "urgent"}

# -------------------------
# HELPERS
# -------------------------
def generate_next_order_code():
    last = list(mongo.db.orders.find().sort("_id", -1).limit(1))
    if not last:
        return "ORD-001"
    last_code = last[0].get("order_code", "ORD-000")
    num = int(last_code.split("-")[1])
    return f"ORD-{num + 1:03d}"

def serialize_order(o):
    return {
        "id": str(o["_id"]),
        "order_code": o["order_code"],
        "store_id": str(o["store_id"]),
        "store_name": o["store_name"],
        "warehouse_id": str(o["warehouse_id"]),
        "warehouse_name": o["warehouse_name"],
        "supplier_id": str(o["supplier_id"]),
        "supplier_name": o["supplier_name"],
        "items": o["items"],
        "status": o["status"],
        "priority": o["priority"],
        "requested_date": o["requested_date"],
        "approved_date": o["approved_date"],
        "dispatched_date": o["dispatched_date"],
        "delivered_date": o["delivered_date"],
        "requested_by": o["requested_by"],
        "approved_by": o["approved_by"],
        "delivery_agent": o["delivery_agent"],
        "notes": o["notes"],
        "last_updated": o["last_updated"],
    }

# -------------------------
# CREATE ORDER
# -------------------------
@orders.route("", methods=["POST"])
@jwt_required()
def create_order():
    data = request.json or {}

    required = ["store_id", "supplier_id", "items", "priority"]
    for f in required:
        if f not in data:
            return jsonify({"error": f"{f} is required"}), 400

    # Validate store
    try:
        store = mongo.db.stores.find_one({"_id": ObjectId(data["store_id"])})
    except:
        return jsonify({"error": "Invalid store_id"}), 400
    if not store:
        return jsonify({"error": "Store not found"}), 404

    # Auto warehouse from store
    try:
        warehouse = mongo.db.warehouses.find_one(
            {"_id": ObjectId(store["warehouse_id"])}
        )
    except:
        return jsonify({"error": "Invalid warehouse mapping"}), 400
    if not warehouse:
        return jsonify({"error": "Warehouse not found"}), 404

    # Validate supplier
    try:
        supplier = mongo.db.suppliers.find_one(
            {"_id": ObjectId(data["supplier_id"])}
        )
    except:
        return jsonify({"error": "Invalid supplier_id"}), 400
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404

    # Validate items against warehouse stock
    stock = warehouse.get("current_stock", {})
    validated_items = []

    for i, item in enumerate(data["items"]):
        pname = item.get("product_name", "").strip()
        qty = int(item.get("requested_qty", 0))

        if pname not in stock:
            return jsonify({"error": f"{pname} not found in warehouse"}), 400

        available = stock[pname]["qty"]
        unit = stock[pname]["unit"]

        if qty <= 0:
            return jsonify({"error": "Quantity must be greater than 0"}), 400

        if qty > available:
            return jsonify({
                "error": f"Insufficient stock for {pname}",
                "available": available
            }), 400

        validated_items.append({
            "product_name": pname,
            "requested_qty": qty,
            "approved_qty": None,
            "unit": unit
        })

    priority = data["priority"].lower()
    if priority not in ALLOWED_PRIORITIES:
        return jsonify({"error": "Invalid priority"}), 400

    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})

    now = datetime.datetime.utcnow()
    order_doc = {
        "order_code": generate_next_order_code(),
        "store_id": ObjectId(data["store_id"]),
        "store_name": store["name"],
        "warehouse_id": warehouse["_id"],
        "warehouse_name": warehouse["name"],
        "supplier_id": supplier["_id"],
        "supplier_name": supplier["name"],
        "items": validated_items,
        "status": "pending",
        "priority": priority,
        "requested_date": now,
        "approved_date": None,
        "dispatched_date": None,
        "delivered_date": None,
        "requested_by": user["name"],
        "approved_by": None,
        "delivery_agent": None,
        "notes": data.get("notes", ""),
        "last_updated": now
    }

    mongo.db.orders.insert_one(order_doc)
    return jsonify({"message": "Order placed successfully"}), 201

# -------------------------
# LIST ORDERS
# -------------------------
@orders.route("", methods=["GET"])
@jwt_required()
def list_orders():
    orders_list = [serialize_order(o) for o in mongo.db.orders.find()]
    return jsonify(orders_list), 200

# -------------------------
# UPDATE / CANCEL ORDER
# -------------------------
@orders.route("/<id>", methods=["PUT"])
@jwt_required()
def update_order(id):
    data = request.json or {}

    try:
        order = mongo.db.orders.find_one({"_id": ObjectId(id)})
    except:
        return jsonify({"error": "Invalid order id"}), 400

    if not order:
        return jsonify({"error": "Order not found"}), 404

    if order["status"] != "pending":
        return jsonify({"error": "Only pending orders can be modified"}), 400

    updates = {}

    if "status" in data:
        status = data["status"].lower()
        if status not in ALLOWED_STATUSES:
            return jsonify({"error": "Invalid status"}), 400
        updates["status"] = status

        if status == "cancelled":
            updates["last_updated"] = datetime.datetime.utcnow()
            mongo.db.orders.update_one({"_id": ObjectId(id)}, {"$set": updates})
            return jsonify({"message": "Order cancelled"}), 200

    updates["last_updated"] = datetime.datetime.utcnow()
    mongo.db.orders.update_one({"_id": ObjectId(id)}, {"$set": updates})
    return jsonify({"message": "Order updated"}), 200
