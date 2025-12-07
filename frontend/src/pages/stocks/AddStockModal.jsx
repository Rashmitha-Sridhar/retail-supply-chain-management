import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiX } from "react-icons/fi";

const AddStockModal = ({
  onClose,
  reload,
  warehouseList,
  defaultWarehouse,
}) => {
  const [form, setForm] = useState({
    warehouse_id: defaultWarehouse || "",
    product_name: "",
    qty: "",
    unit: "",
    notes: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // FRONTEND VALIDATION
  // -----------------------------
  const validateField = (name, value) => {
    switch (name) {
      case "warehouse_id":
        if (!value) return "Select a warehouse";
        return null;

      case "product_name":
        if (!value.trim()) return "Product name is required";
        if (value.trim().length < 2)
          return "Product name must be at least 2 characters";
        return null;

      case "qty":
        if (!value) return "Quantity is required";
        if (isNaN(value) || parseInt(value) <= 0)
          return "Quantity must be a positive number";
        return null;

      case "unit":
        if (!value) return "Unit is required";
        return null;

      default:
        return null;
    }
  };

  // Real-time validation
  useEffect(() => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);

  // -----------------------------
  // Input Handling
  // -----------------------------
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "qty") {
      value = value.replace(/[^0-9]/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setBackendErrors({});
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // -----------------------------
  // Submit Handler
  // -----------------------------
  const handleSubmit = async (e) => {
    console.log("Sending FULL body →", {
      warehouse_id: form.warehouse_id,
      qty_added: form.qty,
    });

    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setBackendErrors({});

    try {
      await api.post("/stock/", {
        warehouse_id: form.warehouse_id,
        product_name: form.product_name.trim(),
        qty_added: parseInt(form.qty),
        unit: form.unit,
        notes: form.notes.trim(),
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

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 btn btn-ghost btn-sm"
          onClick={onClose}
        >
          <FiX size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4">Add Stock</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* WAREHOUSE SELECT */}
          <div>
            <select
              name="warehouse_id"
              className={`select select-bordered w-full ${fieldClass(
                "warehouse_id"
              )}`}
              value={form.warehouse_id}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select Warehouse</option>

              {warehouseList.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.warehouse_code} — {wh.name}
                </option>
              ))}
            </select>

            {(touched.warehouse_id && errors.warehouse_id) ||
            backendErrors.warehouse_id ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.warehouse_id || backendErrors.warehouse_id}
              </p>
            ) : null}
          </div>

          {/* PRODUCT NAME */}
          <div>
            <input
              type="text"
              name="product_name"
              placeholder="Product Name"
              className={`input input-bordered w-full ${fieldClass(
                "product_name"
              )}`}
              value={form.product_name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {(touched.product_name && errors.product_name) ||
            backendErrors.product_name ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.product_name || backendErrors.product_name}
              </p>
            ) : null}
          </div>

          {/* QUANTITY */}
          <div>
            <input
              type="text"
              name="qty"
              placeholder="Quantity"
              className={`input input-bordered w-full ${fieldClass("qty")}`}
              value={form.qty}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {(touched.qty && errors.qty) || backendErrors.qty ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.qty || backendErrors.qty}
              </p>
            ) : null}
          </div>

          {/* UNIT */}
          <div>
            <select
              name="unit"
              className={`select select-bordered w-full ${fieldClass("unit")}`}
              value={form.unit}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="" disabled>Select unit</option>
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="litre">litre</option>
              <option value="trays">trays</option>
            </select>

            {(touched.unit && errors.unit) || backendErrors.unit ? (
              <p className="text-red-500 text-sm mt-1">
                {errors.unit || backendErrors.unit}
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
                "Add Stock"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
