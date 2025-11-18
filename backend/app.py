from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from routes.protected_routes import protected
from config.db import init_db, mongo
from routes.auth_routes import auth
from routes.stats_routes import stats

# Load environment variables first
load_dotenv()

# Initialize Flask App
app = Flask(__name__)

# CORS
CORS(app)

# JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET")
jwt = JWTManager(app)

# Initialize Database (IMPORTANT: must be AFTER app = Flask)
init_db(app)

print("Loaded MONGO_URI:", os.getenv("MONGO_URI"))
print("CONFIG MONGO_URI:", app.config.get("MONGO_URI"))
print("Mongo Object:", mongo)
print("Mongo DB Object:", mongo.db)

app.register_blueprint(stats, url_prefix="/stats")

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

if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
