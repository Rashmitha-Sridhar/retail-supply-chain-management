from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from utils.hash import hash_password, verify_password
from utils.token import generate_token
from config.db import mongo
import datetime
from utils.validators import validate_register_payload, validate_login_payload

auth = Blueprint('auth', __name__)


# ============================
#   REGISTER USER
# ============================
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    # 1) VALIDATE INPUT
    error_msg = validate_register_payload(data)
    if error_msg:
        return jsonify({"error": error_msg}), 400

    # 2) Extract cleaned data
    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]
    role = data["role"]

    # 3) Check if email already exists
    existing = mongo.db.users.find_one({"email": email})
    if existing:
        return jsonify({"error": "An account with this email already exists."}), 400

    # 4) Hash password
    password_hash = hash_password(password)

    # 5) Create user object
    user = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "created_at": datetime.datetime.utcnow()
    }

    mongo.db.users.insert_one(user)
    return jsonify({"message": "User created successfully"}), 201



# ============================
#   LOGIN USER
# ============================
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}

    # 1) VALIDATE INPUT
    error_msg = validate_login_payload(data)
    if error_msg:
        return jsonify({"error": error_msg}), 400

    email = data["email"].strip().lower()
    password = data["password"]

    # 2) Check if user exists
    user = mongo.db.users.find_one({"email": email})
    if not user:
        # Security best practice → never reveal whether email exists
        return jsonify({"error": "Invalid email or password."}), 401

    # 3) Check password
    if not verify_password(password, user['password_hash']):
        return jsonify({"error": "Invalid email or password."}), 401

    # 4) Generate token
    token = generate_token(identity=str(user['_id']))

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": user['role'],
        "name": user['name']
    }), 200
