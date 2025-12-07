import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiX } from "react-icons/fi";

const EditStockModal = ({ onClose, reload, stock }) => {
  const [form, setForm] = useState({
    warehouse_id: stock?.warehouse_id || "",
    product_name: stock?.product_name || "",
    current_qty: stock?.current_qty || 0,
    qty: "",
    unit: stock?.unit || "pcs",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Validation
  const validateField = (name, value) => {
    switch (name) {
      case "qty":
        if (!value) return "Quantity adjustment is required";
        if (isNaN(value)) return "Must be a number";
        if (parseInt(value) === 0) return "Value cannot be 0";
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [form]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "qty") value = value.replace(/[^0-9\-]/g, "");

    setBackendErrors({});
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // ✅ FIXED SUBMIT → uses POST /stock/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);

    try {
      await api.post("/stock/", {
        warehouse_id: form.warehouse_id,
        product_name: form.product_name.trim(),
        qty_added: parseInt(form.qty),
        unit: form.unit,
        notes: "Stock adjusted via dashboard",
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
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md relative">

        <button
          className="absolute top-3 right-3 btn btn-ghost btn-sm"
          onClick={onClose}
        >
          <FiX size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Stock</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* ✅ PRODUCT NAME */}
          <div>
            <label className="text-sm font-semibold">Product</label>
            <input
              type="text"
              className="input input-bordered w-full bg-base-200"
              disabled
              value={form.product_name}
            />
          </div>

          {/* ✅ CURRENT STOCK DISPLAY */}
          <div>
            <label className="text-sm font-semibold">Current Quantity</label>
            <input
              type="text"
              className="input input-bordered w-full bg-base-200"
              disabled
              value={`${form.current_qty} ${form.unit}`}
            />
          </div>

          {/* ✅ ADJUSTMENT INPUT */}
          <div>
            <label className="text-sm font-semibold">
              Adjust Quantity ( + add / - reduce )
            </label>
            <input
              type="text"
              name="qty"
              placeholder="Example: 50 or -20"
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

          {/* ✅ UNIT AUTO-SELECTED */}
          <div>
            <label className="text-sm font-semibold">Unit</label>
            <select
              name="unit"
              className="select select-bordered w-full"
              value={form.unit}
              onChange={handleChange}
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="litre">litre</option>
            </select>
          </div>

          {/* ✅ BUTTONS */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-purple" disabled={!isValid || loading}>
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditStockModal;
