# routes/stats_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from config.db import mongo

stats = Blueprint("stats", __name__)


# ---------- Helper to safely iterate qty ----------
def iter_stock_qty(stock):
  """
  stock: expected to be { product_name: { qty, unit } }
  Handles legacy/int/None safely.
  Yields integer quantities.
  """
  if not isinstance(stock, dict):
      return
  for item in stock.values():
      if not isinstance(item, dict):
          continue
      qty = item.get("qty", 0)
      try:
          qty = int(qty)
      except Exception:
          continue
      yield qty


def iter_stock_products(stock, products_accumulator):
  """
  Adds qty per product into products_accumulator dict.
  stock: same structure as above.
  """
  if not isinstance(stock, dict):
      return
  for name, item in stock.items():
      if not isinstance(item, dict):
          continue
      qty = item.get("qty", 0)
      try:
          qty = int(qty)
      except Exception:
          continue
      products_accumulator[name] = products_accumulator.get(name, 0) + qty


# =============================
# INVENTORY METRICS
# =============================

# TOTAL inventory = warehouse inventory + store inventory
@stats.route("/totalInventory", methods=["GET"])
@jwt_required()
def total_inventory():
    total = 0

    # From warehouses
    for wh in mongo.db.warehouses.find():
        stock = wh.get("current_stock", {})
        for qty in iter_stock_qty(stock):
            total += qty

    # From stores
    for st in mongo.db.stores.find():
        stock = st.get("current_stock", {})
        for qty in iter_stock_qty(stock):
            total += qty

    return jsonify({"totalInventory": total}), 200


# INVENTORY inside warehouses only
@stats.route("/warehouseInventory", methods=["GET"])
@jwt_required()
def warehouse_inventory():
    total = 0

    for wh in mongo.db.warehouses.find():
        stock = wh.get("current_stock", {})
        for qty in iter_stock_qty(stock):
            total += qty

    return jsonify({"warehouseInventory": total}), 200


# INVENTORY inside stores only
@stats.route("/storeInventory", methods=["GET"])
@jwt_required()
def store_inventory():
    total = 0

    for st in mongo.db.stores.find():
        stock = st.get("current_stock", {})
        for qty in iter_stock_qty(stock):
            total += qty

    return jsonify({"storeInventory": total}), 200


# CAPACITY UTILIZATION % = (sum qty in warehouses / sum warehouse capacity) * 100
@stats.route("/capacityUtilization", methods=["GET"])
@jwt_required()
def capacity_utilization():
    total_capacity = 0
    total_stock = 0

    for wh in mongo.db.warehouses.find():
        try:
            cap = int(wh.get("capacity", 0))
        except Exception:
            cap = 0

        total_capacity += cap

        stock = wh.get("current_stock", {})
        for qty in iter_stock_qty(stock):
            total_stock += qty

    if total_capacity == 0:
        return jsonify({"capacityUtilization": 0}), 200

    utilization = (total_stock / total_capacity) * 100
    return jsonify({"capacityUtilization": round(utilization, 2)}), 200


# =============================
# STOCK HEALTH METRICS
# =============================

@stats.route("/lowStock", methods=["GET"])
@jwt_required()
def low_stock():
    count = 0

    # Warehouses
    for wh in mongo.db.warehouses.find():
        stock = wh.get("current_stock", {})
        if isinstance(stock, dict):
            for item in stock.values():
                if not isinstance(item, dict):
                    continue
                qty = item.get("qty", 0)
                try:
                    qty = int(qty)
                except Exception:
                    continue
                if qty < 10:
                    count += 1

    # Stores
    for st in mongo.db.stores.find():
        stock = st.get("current_stock", {})
        if isinstance(stock, dict):
            for item in stock.values():
                if not isinstance(item, dict):
                    continue
                qty = item.get("qty", 0)
                try:
                    qty = int(qty)
                except Exception:
                    continue
                if qty < 10:
                    count += 1

    return jsonify({"lowStockCount": count}), 200


@stats.route("/outOfStock", methods=["GET"])
@jwt_required()
def out_of_stock():
    count = 0

    # Warehouses
    for wh in mongo.db.warehouses.find():
        stock = wh.get("current_stock", {})
        if isinstance(stock, dict):
            for item in stock.values():
                if not isinstance(item, dict):
                    continue
                qty = item.get("qty", 0)
                try:
                    qty = int(qty)
                except Exception:
                    continue
                if qty == 0:
                    count += 1

    # Stores
    for st in mongo.db.stores.find():
        stock = st.get("current_stock", {})
        if isinstance(stock, dict):
            for item in stock.values():
                if not isinstance(item, dict):
                    continue
                qty = item.get("qty", 0)
                try:
                    qty = int(qty)
                except Exception:
                    continue
                if qty == 0:
                    count += 1

    return jsonify({"outOfStockCount": count}), 200


# UNIQUE PRODUCT COUNT across ALL warehouses & stores
@stats.route("/stock/unique", methods=["GET"])
@jwt_required()
def unique_products():
    unique = set()

    for wh in mongo.db.warehouses.find():
        stock = wh.get("current_stock", {})
        if isinstance(stock, dict):
            for name in stock.keys():
                unique.add(name)

    for st in mongo.db.stores.find():
        stock = st.get("current_stock", {})
        if isinstance(stock, dict):
            for name in stock.keys():
                unique.add(name)

    return jsonify({"uniqueProducts": len(unique)}), 200


# TOP STOCKED PRODUCT across ALL warehouses & stores
@stats.route("/stock/top", methods=["GET"])
@jwt_required()
def top_stock():
    products = {}

    # Collect from warehouses
    for wh in mongo.db.warehouses.find():
        stock = wh.get("current_stock", {})
        iter_stock_products(stock, products)

    # Collect from stores
    for st in mongo.db.stores.find():
        stock = st.get("current_stock", {})
        iter_stock_products(stock, products)

    if not products:
        return jsonify({"topProduct": None}), 200

    top_name = max(products, key=products.get)

    return jsonify({
        "topProduct": {
            "product_name": top_name,
            "available_qty": products[top_name]
        }
    }), 200


# =============================
# SUPPLY PARTNER METRICS
# =============================

@stats.route("/suppliersCount", methods=["GET"])
@jwt_required()
def suppliers_count():
    count = mongo.db.suppliers.count_documents({})
    return jsonify({"suppliersCount": count}), 200


@stats.route("/warehousesCount", methods=["GET"])
@jwt_required()
def warehouses_count():
    count = mongo.db.warehouses.count_documents({})
    return jsonify({"warehousesCount": count}), 200
