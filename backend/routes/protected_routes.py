from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

protected = Blueprint("protected", __name__)

@protected.route("/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    return jsonify({"message": "You are authorized"}), 200
