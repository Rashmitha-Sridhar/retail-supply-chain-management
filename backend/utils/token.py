import datetime
from flask_jwt_extended import create_access_token

def generate_token(identity):
    expires = datetime.timedelta(hours=12)
    return create_access_token(identity=identity, expires_delta=expires)
