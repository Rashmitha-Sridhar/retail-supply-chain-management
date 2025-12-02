import { useState, useEffect } from "react";
import api from "../../api/axios";

const AddWarehouseModal = ({ onClose, reload }) => {
  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    capacity: "",
    manager_name: "",
    contact_phone: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});

  // ---------------------------
  // FRONTEND VALIDATION RULES
  // ---------------------------
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        return null;

      case "location":
        if (!value.trim()) return "Location is required";
        if (value.length < 3) return "Location must be at least 3 characters";
        return null;

      case "capacity":
        if (!value) return "Capacity is required";
        if (isNaN(value) || parseInt(value) <= 0)
          return "Capacity must be a positive number";
        return null;

      case "manager_name":
        if (!value.trim()) return "Manager name is required";
        if (!/^[A-Za-z\s]{3,50}$/.test(value))
          return "Manager name must contain only letters";
        return null;

      case "contact_phone":
        if (!value.trim()) return "Phone is required";
        if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
        return null;

      default:
        return null;
    }
  };

  // Evaluate form validity in real-time
  useEffect(() => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);

  // Input change handler
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "contact_phone") {
      value = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setBackendErrors({});
  };

  // Focus Blur Handler
  const handleBlur = (e) => {
    const field = e.target.name;
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    setLoading(true);
    setBackendErrors({});

    try {
      await api.post("/warehouses/", {
        ...form,
        capacity: parseInt(form.capacity),
      });

      reload();
      onClose();
    } catch (err) {
      const be = err.response?.data?.errors || {};
      setBackendErrors(be);

      if (err.response?.data?.error) {
        alert(err.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field) =>
    touched[field] && (errors[field] || backendErrors[field])
      ? "input-error"
      : touched[field]
      ? "input-success"
      : "";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Warehouse</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* NAME */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Warehouse Name"
              className={`input input-bordered w-full ${fieldClass("name")}`}
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {(touched.name && errors.name) || backendErrors.name ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.name || backendErrors.name}
              </p>
            ) : null}
          </div>

          {/* LOCATION */}
          <div>
            <input
              type="text"
              name="location"
              placeholder="Location"
              className={`input input-bordered w-full ${fieldClass("location")}`}
              value={form.location}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {(touched.location && errors.location) || backendErrors.location ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.location || backendErrors.location}
              </p>
            ) : null}
          </div>

          {/* ADDRESS */}
          <div>
            <textarea
              name="address"
              placeholder="Address"
              rows={3}
              className="textarea textarea-bordered w-full"
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          {/* CAPACITY */}
          <div>
            <input
              type="number"
              name="capacity"
              placeholder="Capacity (units)"
              className={`input input-bordered w-full ${fieldClass("capacity")}`}
              value={form.capacity}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {(touched.capacity && errors.capacity) || backendErrors.capacity ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.capacity || backendErrors.capacity}
              </p>
            ) : null}
          </div>

          {/* MANAGER NAME */}
          <div>
            <input
              type="text"
              name="manager_name"
              placeholder="Manager Name"
              className={`input input-bordered w-full ${fieldClass(
                "manager_name"
              )}`}
              value={form.manager_name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {(touched.manager_name && errors.manager_name) ||
            backendErrors.manager_name ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.manager_name || backendErrors.manager_name}
              </p>
            ) : null}
          </div>

          {/* PHONE */}
          <div>
            <input
              type="text"
              name="contact_phone"
              placeholder="Manager Phone (10 digits)"
              className={`input input-bordered w-full ${fieldClass(
                "contact_phone"
              )}`}
              value={form.contact_phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {(touched.contact_phone && errors.contact_phone) ||
            backendErrors.contact_phone ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.contact_phone || backendErrors.contact_phone}
              </p>
            ) : null}
          </div>

          {/* ACTION BUTTONS */}
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

export default AddWarehouseModal;
