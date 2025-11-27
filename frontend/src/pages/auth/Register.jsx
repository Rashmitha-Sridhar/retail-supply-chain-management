import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import registerImage from "../../assets/LoginRetailInventory.png";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // VALIDATION FUNCTIONS
  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    const parts = name.trim().split(" ");
    if (parts.length < 2) return "Please enter first and last name";
    if (parts.some((p) => p.length < 2)) return "Each name must be at least 2 letters";
    if (!/^[A-Za-z ]+$/.test(name)) return "Name must contain only alphabets";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[\w.-]+@gmail\.com$/;
    if (!emailRegex.test(email)) return "Only valid Gmail accounts allowed";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Must contain at least 1 uppercase letter";
    if (!/[a-z]/.test(password)) return "Must contain at least 1 lowercase letter";
    if (!/[0-9]/.test(password)) return "Must contain at least 1 number";
    if (/\s/.test(password)) return "Password cannot contain spaces";
    return "";
  };

  const validateRole = (role) => {
    if (!role) return "Please select a role";
    return "";
  };

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    // Live validation
    let err = "";
    if (name === "name") err = validateName(value);
    if (name === "email") err = validateEmail(value);
    if (name === "password") err = validatePassword(value);
    if (name === "role") err = validateRole(value);

    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  // CHECK IF FORM IS VALID
  const isFormValid = () => {
    return (
      !validateName(form.name) &&
      !validateEmail(form.email) &&
      !validatePassword(form.password) &&
      !validateRole(form.role)
    );
  };

  // SUBMIT FORM
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const pwdError = validatePassword(form.password);
    const roleError = validateRole(form.role);

    setErrors({
      name: nameError,
      email: emailError,
      password: pwdError,
      role: roleError,
    });

    if (nameError || emailError || pwdError || roleError) return;

    try {
      setLoading(true);
      await api.post("/auth/register", form);
      navigate("/auth/login");
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.response?.data?.error || "Registration failed",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-base-200">
      
      {/* LEFT IMAGE */}
      <div className="hidden md:flex items-center justify-center bg-base-100 p-6">
        <img
          src={registerImage}
          alt="Register Illustration"
          className="max-w-lg w-full"
        />
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-md bg-base-100 p-8 rounded-lg shadow-md">

          <h1 className="text-3xl font-bold text-center mb-2">
            Create Account
          </h1>

          <p className="text-center text-base-content/60 mb-6">
            Register to access your Retail Supply Chain System
          </p>

          {errors.form && (
            <div className="alert alert-error py-2 text-sm mb-4 rounded-lg">
              <span>{errors.form}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME */}
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                className="input input-bordered input-md w-full px-4 mt-1"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-error text-sm mt-1">{errors.name}</p>}
            </div>

            {/* EMAIL */}
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered input-md w-full px-4 mt-1"
                placeholder="Enter a valid email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-error text-sm mt-1">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                name="password"
                className="input input-bordered input-md w-full px-4 mt-1"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="text-error text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* ROLE */}
            <div className="form-control dropdown dropdown-bottom w-full">
              <label className="label mb-1">
                <span className="label-text font-medium">Select Role</span>
              </label>

              <select
                name="role"
                className="select select-bordered w-full mt-1 px-4 py-2"
                value={form.role}
                onChange={handleChange}
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="warehouse_manager">Warehouse Manager</option>
                <option value="store_manager">Store Manager</option>
              </select>

              {errors.role && <p className="text-error text-sm mt-1">{errors.role}</p>}
            </div>

            {/* BUTTON */}
            <button
              className="btn btn-primary w-full mt-2 transition-all duration-200 hover:scale-[1.02] hover:bg-primary-focus"
              disabled={!isFormValid() || loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
