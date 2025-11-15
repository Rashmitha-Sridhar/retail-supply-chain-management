from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from utils.hash import hash_password, verify_password
from utils.token import generate_token
from config.db import mongo
import datetime

auth = Blueprint('auth', __name__)

# REGISTER (Admin only later)
@auth.route('/register', methods=['POST'])
def register():
    data = request.json or {}

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not (name and email and password and role):
        return jsonify({"error": "All fields are required"}), 400

    existing = mongo.db.users.find_one({"email": email})
    if existing:
        return jsonify({"error": "Email already exists"}), 400

    password_hash = hash_password(password)

    user = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "created_at": datetime.datetime.utcnow()
    }

    mongo.db.users.insert_one(user)
    return jsonify({"message": "User created successfully"}), 201


# LOGIN
@auth.route('/login', methods=['POST'])
def login():
    data = request.json or {}

    email = data.get('email')
    password = data.get('password')

    if not (email and password):
        return jsonify({"error": "Email and password are required"}), 400

    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not verify_password(password, user['password_hash']):
        return jsonify({"error": "Invalid password"}), 401

    token = generate_token(str(user['_id']))

    return jsonify({
        "message": "Login successful",
        "token": token,
        "role": user['role'],
        "name": user['name']
    }), 200
