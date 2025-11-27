import re

ALLOWED_ROLES = {"admin", "warehouse_manager", "store_manager"}


def validate_name(name: str) -> str | None:
    if not name or not name.strip():
        return "Full name is required."
    name = name.strip()
    parts = name.split()

    if len(parts) < 2:
        return "Please enter your full name (first and last)."

    if any(len(p) < 2 for p in parts):
        return "Each part of your name should be at least 2 characters."

    if not re.match(r"^[A-Za-z ]+$", name):
        return "Name can only contain alphabets and spaces."

    return None


def validate_email(email: str, gmail_only: bool = True) -> str | None:
    if not email or not email.strip():
        return "Email is required."

    email = email.strip().lower()

    if gmail_only:
        gmail_regex = r"^[\w\.-]+@gmail\.com$"
        if not re.match(gmail_regex, email):
            return "Please enter a valid Gmail address."
    else:
        # simple general email check (not used right now)
        basic_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(basic_regex, email):
            return "Please enter a valid email address."

    return None


def validate_password(password: str, strict: bool = True) -> str | None:
    if not password:
        return "Password is required."

    if len(password) < 8:
        return "Password must be at least 8 characters long."

    if strict:
        if not re.search(r"[A-Z]", password):
            return "Password must contain at least one uppercase letter."
        if not re.search(r"[a-z]", password):
            return "Password must contain at least one lowercase letter."
        if not re.search(r"\d", password):
            return "Password must contain at least one number."
        if re.search(r"\s", password):
            return "Password cannot contain spaces."

    return None


def validate_role(role: str) -> str | None:
    if not role:
        return "Role is required."

    if role not in ALLOWED_ROLES:
        return "Invalid role selected."

    return None


def validate_register_payload(data: dict) -> str | None:
    """Return first validation error message, or None if valid."""
    name_err = validate_name(data.get("name"))
    if name_err:
        return name_err

    email_err = validate_email(data.get("email"), gmail_only=True)
    if email_err:
        return email_err

    pwd_err = validate_password(data.get("password"), strict=True)
    if pwd_err:
        return pwd_err

    role_err = validate_role(data.get("role"))
    if role_err:
        return role_err

    return None


def validate_login_payload(data: dict) -> str | None:
    """Return first validation error message, or None if valid."""
    email_err = validate_email(data.get("email"), gmail_only=True)
    if email_err:
        return email_err

    pwd_err = validate_password(data.get("password"), strict=False)
    if pwd_err:
        return pwd_err

    return None
