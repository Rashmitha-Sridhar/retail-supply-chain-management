import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import registerImage from "../../assets/LoginRetailInventory.png"; // reuse or change image

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "store_manager",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      navigate("/auth/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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

          {error && (
            <div className="alert alert-error py-2 text-sm mb-4 rounded-lg">
              <span>{error}</span>
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
                required
              />
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
                placeholder="Enter your corporate email"
                value={form.email}
                onChange={handleChange}
                required
              />
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
                required
              />
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
                <option value="admin">Admin</option>
                <option value="warehouse_manager">Warehouse Manager</option>
                <option value="store_manager">Store Manager</option>
              </select>
            </div>

            {/* REGISTER BUTTON */}
            <button
              className="btn btn-primary w-full mt-2 transition-all duration-200 hover:scale-[1.02] hover:bg-primary-focus"
              disabled={loading}
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
