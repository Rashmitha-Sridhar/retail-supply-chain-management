import { useState, useEffect } from "react";
import api from "../../api/axios";

const AddSupplierModal = ({ onClose, reload }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // -----------------------
  // VALIDATION RULES
  // -----------------------
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Name must contain only letters";
        return null;

      case "email":
        if (!value) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email";
        return null;

      case "phone":
        if (!value) return "Phone is required";
        if (!/^[0-9]{10}$/.test(value)) return "Phone must be exactly 10 digits";
        return null;

      case "address":
        if (!value.trim()) return "Address is required";
        if (value.length < 5) return "Address must be at least 5 characters";
        return null;

      default:
        return null;
    }
  };

  // Validate on form change
  useEffect(() => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);

    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);

  // -----------------------
  // HANDLE INPUT CHANGE
  // -----------------------
  const handleChange = (e) => {
    let { name, value } = e.target;

    // Restrict phone to digits only, no formats
    if (name === "phone") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) value = value.slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // -----------------------
  // HANDLE BLUR
  // -----------------------
  const handleBlur = (e) => {
    const field = e.target.name;
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // -----------------------
  // SUBMIT
  // -----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    try {
      await api.post("/suppliers/", form);
      reload();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">

        <h2 className="text-xl font-bold mb-4">Add Supplier</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* NAME */}
          <div>
            <input
              type="text"
              name="name"
              className={`input input-bordered w-full ${
                touched.name && errors.name ? "input-error" : touched.name ? "input-success" : ""
              }`}
              placeholder="Supplier Name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.name && errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <input
              type="email"
              name="email"
              className={`input input-bordered w-full ${
                touched.email && errors.email ? "input-error" : touched.email ? "input-success" : ""
              }`}
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <input
              type="text"
              name="phone"
              className={`input input-bordered w-full ${
                touched.phone && errors.phone ? "input-error" : touched.phone ? "input-success" : ""
              }`}
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={10}
            />
            {touched.phone && errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* ADDRESS */}
          <div>
            <textarea
              name="address"
              className={`textarea textarea-bordered w-full ${
                touched.address && errors.address
                  ? "textarea-error"
                  : touched.address
                  ? "textarea-success"
                  : ""
              }`}
              placeholder="Supplier Address"
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={3}
            />
            {touched.address && errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-purple" disabled={!isValid || loading}>
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Add"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddSupplierModal;
