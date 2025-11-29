from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from routes.protected_routes import protected
from config.db import init_db, mongo
from routes.auth_routes import auth
from routes.stats_routes import stats
from routes.suppliers_routes import suppliers
from routes.warehouses_routes import warehouses
from routes.stores_routes import stores
from routes.orders_routes import orders

# Load environment variables first
load_dotenv()

# Initialize Flask App
app = Flask(__name__)

# CORS
CORS(app,
     resources={r"/*": {"origins": "http://localhost:5173"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])



# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET")
jwt = JWTManager(app)

# Initialize Database (IMPORTANT: must be AFTER app = Flask)
init_db(app)

# print("Loaded MONGO_URI:", os.getenv("MONGO_URI"))
# print("CONFIG MONGO_URI:", app.config.get("MONGO_URI"))
# print("Mongo Object:", mongo)
# print("Mongo DB Object:", mongo.db)

@app.route('/')
def home():
    return jsonify({"message": "Retail Supply Chain API is running!"}), 200

@app.route('/test_db')
def test_db():
    try:
        collections = mongo.db.list_collection_names()
        return jsonify({"collections": collections}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register Blueprint
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(protected, url_prefix="/api")
app.register_blueprint(stats, url_prefix="/stats")
app.register_blueprint(suppliers, url_prefix="/suppliers")
app.register_blueprint(warehouses, url_prefix="/warehouses")
app.register_blueprint(stores, url_prefix="/stores")
app.register_blueprint(orders, url_prefix="/orders")

if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
