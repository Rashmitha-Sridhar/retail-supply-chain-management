import { useState, useEffect } from "react";
import api from "../../api/axios";

const AddStoreModal = ({ warehouses, onClose, reload }) => {

  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    warehouse_id: "",
    warehouse_code: "",
    manager_name: "",
    contact_phone: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // VALIDATION RULES
  // ---------------------------
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Store name is required";
        if (value.trim().length < 3) return "Store name must be at least 3 characters";
        return null;

      case "location":
        if (!value.trim()) return "Location is required";
        return null;

      case "address":
        if (!value.trim()) return "Address is required";
        if (value.trim().length < 5) return "Address should be at least 5 characters";
        return null;

      case "warehouse_id":
        if (!value) return "Select a warehouse";
        return null;

      case "manager_name":
        if (!value.trim()) return "Manager name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only letters allowed";
        return null;

      case "contact_phone":
        if (!value) return "Contact phone required";
        if (!/^[0-9]{10}$/.test(value)) return "Phone must be exactly 10 digits";
        return null;

      default:
        return null;
    }
  };

  // ---------------------------
  // Validate entire form
  // ---------------------------
  useEffect(() => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);

  // ---------------------------
  // HANDLE INPUT CHANGE
  // ---------------------------
  const handleChange = (e) => {
    let { name, value } = e.target;

    // phone must be digits only
    if (name === "contact_phone") {
      value = value.replace(/[^0-9]/g, "");
      if (value.length > 10) value = value.slice(0, 10);
    }

    // when warehouse is selected → auto fill warehouse_code
    if (name === "warehouse_id") {
      const wh = warehouses.find((w) => w.id === value);
      setForm((prev) => ({
        ...prev,
        warehouse_id: value,
        warehouse_code: wh?.warehouse_code || "",
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const field = e.target.name;
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // ---------------------------
  // SUBMIT FORM
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    try {
      await api.post("/stores/", form);
      reload();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg">

        <h2 className="text-xl font-bold mb-4">Add Store</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Store Name */}
          <div>
            <input
              name="name"
              className={`input input-bordered w-full ${
                touched.name && errors.name ? "input-error" : touched.name ? "input-success" : ""
              }`}
              placeholder="Store Name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.name && errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Location */}
          <div>
            <input
              name="location"
              className={`input input-bordered w-full ${
                touched.location && errors.location ? "input-error" : touched.location ? "input-success" : ""
              }`}
              placeholder="Location (City)"
              value={form.location}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.location && errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <textarea
              name="address"
              className={`textarea textarea-bordered w-full ${
                touched.address && errors.address ? "textarea-error" : touched.address ? "textarea-success" : ""
              }`}
              placeholder="Full Address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.address && errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Warehouse Dropdown */}
          <div>
            <select
              name="warehouse_id"
              className={`select select-bordered w-full ${
                touched.warehouse_id && errors.warehouse_id
                  ? "select-error"
                  : touched.warehouse_id
                  ? "select-success"
                  : ""
              }`}
              value={form.warehouse_id}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.warehouse_code} — {w.name}
                </option>
              ))}
            </select>

            {touched.warehouse_id && errors.warehouse_id && (
              <p className="text-red-500 text-sm mt-1">{errors.warehouse_id}</p>
            )}
          </div>

          {/* Manager Name */}
          <div>
            <input
              name="manager_name"
              className={`input input-bordered w-full ${
                touched.manager_name && errors.manager_name
                  ? "input-error"
                  : touched.manager_name
                  ? "input-success"
                  : ""
              }`}
              placeholder="Store Manager Name"
              value={form.manager_name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.manager_name && errors.manager_name && (
              <p className="text-red-500 text-sm mt-1">{errors.manager_name}</p>
            )}
          </div>

          {/* Manager Phone */}
          <div>
            <input
              name="contact_phone"
              className={`input input-bordered w-full ${
                touched.contact_phone && errors.contact_phone
                  ? "input-error"
                  : touched.contact_phone
                  ? "input-success"
                  : ""
              }`}
              placeholder="Manager Phone (10 digits)"
              value={form.contact_phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {touched.contact_phone && errors.contact_phone && (
              <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-purple" disabled={!isValid || loading}>
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Add Store"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddStoreModal;
