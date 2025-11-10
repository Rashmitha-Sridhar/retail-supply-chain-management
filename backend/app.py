# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from pymongo import MongoClient
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET")
jwt = JWTManager(app)

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["retail_supply_chain"]

@app.route('/')
def home():
    return jsonify({"message": "Retail Supply Chain API is running!"}), 200

@app.route('/test_db')
def test_db():
    collections = db.list_collection_names()
    return jsonify({"collections": collections}), 200

if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
