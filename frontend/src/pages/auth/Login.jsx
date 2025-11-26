import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import loginImage from "../../assets/LoginRetailInventory.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await api.post("/auth/login", form);
      const { token, name, role } = res.data;

      login(token, { name, role });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-base-200">
      {/* LEFT FORM */}
      <div className="flex items-center justify-center p-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">Welcome Back</h1>

          <p className="text-center text-base-content/60 mb-6">
            Log in to access your Retail Supply Chain System
          </p>

          {error && (
            <div className="alert alert-error mb-4 py-2 text-sm rounded-lg">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                className="input input-bordered input-md w-full px-4 mt-1"
                placeholder="Enter your registered email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label mb-1">
                <span className="label-text font-medium">Password</span>
              </label>
              <input
                type="password"
                name="password"
                className="input input-bordered input-md w-full px-4 mt-1"
                placeholder="Enter your secure password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                <span className="select-none">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:underline select-none">
                Forgot Password?
              </button>
            </div>

            {/* Login button */}
            <button
              className="btn btn-primary w-full mt-2 transition-all duration-200 hover:scale-[1.02] hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Login"
              )}
            </button>


            {/* OPTIONAL: Google login disabled for now */}
            {/*
            <button className="btn btn-outline w-full mt-2 opacity-50 cursor-not-allowed">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5"
              />
              Sign in with Google (coming soon)
            </button>
            */}
          </form>

          {/* Register */}
          <p className="text-center mt-6 text-sm">
            Don’t have an account?{" "}
            <Link to="/auth/register" className="text-primary font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="hidden md:flex items-center justify-center bg-base-100 p-6">
        <img
          src={loginImage}
          alt="Login Illustration"
          className="max-w-lg w-full"
        />
      </div>
    </div>
  );
};

export default Login;
