import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

const AddOrderModal = ({ onClose, reload }) => {
  const [stores, setStores] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState({}); // { productName: { qty, unit } }

  const [form, setForm] = useState({
    store_id: "",
    supplier_id: "",
    priority: "medium",
    notes: "",
    items: [
      {
        product_name: "",
        requested_qty: "",
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ---------------------------
  // LOAD STORES + SUPPLIERS
  // ---------------------------
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [storesRes, suppliersRes] = await Promise.all([
          api.get("/stores/"),    // NOTE: trailing slash to match your backend
          api.get("/suppliers/"), // NOTE: same here
        ]);

        setStores(storesRes.data || []);
        setSuppliers(suppliersRes.data || []);
      } catch (err) {
        console.error("Failed to load stores/suppliers:", err);
        setError("Failed to load stores or suppliers. Please try again.");
      } finally {
        setLoadingMeta(false);
      }
    };

    loadMeta();
  }, []);

  // ---------------------------
  // LOAD WAREHOUSE STOCK WHEN STORE CHANGES
  // ---------------------------
  const handleStoreChange = async (storeId) => {
    setForm((prev) => ({ ...prev, store_id: storeId }));
    setWarehouseStock({});
    setError("");

    if (!storeId) return;

    const store = stores.find((s) => s.id === storeId);
    if (!store || !store.warehouse_id) {
      setError("Selected store is not linked to a warehouse.");
      return;
    }

    try {
      const res = await api.get(`/stock/${store.warehouse_id}`);
      // res.data.stock is expected to be an object: { "Milk 1L": { qty, unit }, ... }
      setWarehouseStock(res.data.stock || {});
    } catch (err) {
      console.error("Failed to load stock:", err);
      setError("Failed to load warehouse stock for this store.");
    }
  };

  // ---------------------------
  // FORM HELPERS
  // ---------------------------
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];

    if (field === "requested_qty") {
      value = value.replace(/[^0-9]/g, "");
    }

    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    setForm((prev) => ({ ...prev, items: newItems }));
    setError("");
  };

  const addItemRow = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_name: "", requested_qty: "" }],
    }));
  };

  const removeItemRow = (index) => {
    // Keep at least one row
    if (form.items.length === 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.store_id) errors.store_id = "Store is required";
    if (!form.supplier_id) errors.supplier_id = "Supplier is required";

    if (!form.items || form.items.length === 0) {
      errors.items = "At least one item is required";
    } else {
      form.items.forEach((item, idx) => {
        if (!item.product_name) {
          errors[`item_${idx}_product`] = "Select a product";
        }
        if (!item.requested_qty) {
          errors[`item_${idx}_qty`] = "Enter quantity";
        } else {
          const qtyNum = parseInt(item.requested_qty, 10);
          if (isNaN(qtyNum) || qtyNum <= 0) {
            errors[`item_${idx}_qty`] = "Quantity must be greater than 0";
          } else {
            const stockInfo = warehouseStock[item.product_name];
            if (stockInfo && qtyNum > stockInfo.qty) {
              errors[`item_${idx}_qty`] = `Only ${stockInfo.qty} ${stockInfo.unit} available`;
            }
          }
        }
      });
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------------------------
  // SUBMIT HANDLER
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Prepare payload expected by backend
      const payload = {
        store_id: form.store_id,
        supplier_id: form.supplier_id,
        priority: form.priority,
        notes: form.notes.trim(),
        items: form.items.map((it) => ({
          product_name: it.product_name,
          requested_qty: parseInt(it.requested_qty, 10),
        })),
      };

      const res = await api.post("/orders", payload);
      console.log("Order created:", res.data);

      await reload();
      onClose();
    } catch (err) {
      console.error("Order create error:", err);
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to place order. Please try again.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const productOptions = Object.entries(warehouseStock); // [ [name, {qty, unit}], ... ]

  // ---------------------------
  // UI
  // ---------------------------
  if (loadingMeta) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md flex items-center gap-3">
          <span className="loading loading-spinner loading-md" />
          <span>Loading order metadata...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-2xl relative">

        {/* Close */}
        <button
          className="absolute top-3 right-3 btn btn-ghost btn-sm"
          onClick={onClose}
        >
          <FiX size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4">Place New Order</h2>

        {error && (
          <div className="alert alert-error py-2 mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* STORE + SUPPLIER ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Store */}
            <div>
              <label className="label">
                <span className="label-text">Store</span>
              </label>
              <select
                name="store_id"
                className="select select-bordered w-full"
                value={form.store_id}
                onChange={(e) => handleStoreChange(e.target.value)}
              >
                <option value="">Select Store</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} {store.store_code ? `(${store.store_code})` : ""}
                  </option>
                ))}
              </select>
              {fieldErrors.store_id && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.store_id}</p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <label className="label">
                <span className="label-text">Supplier</span>
              </label>
              <select
                name="supplier_id"
                className="select select-bordered w-full"
                value={form.supplier_id}
                onChange={handleFieldChange}
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
              {fieldErrors.supplier_id && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldErrors.supplier_id}
                </p>
              )}
            </div>
          </div>

          {/* PRIORITY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                name="priority"
                className="select select-bordered w-full"
                value={form.priority}
                onChange={handleFieldChange}
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ITEMS SECTION */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Order Items</span>
              <button
                type="button"
                className="btn btn-sm btn-outline flex items-center gap-2"
                onClick={addItemRow}
              >
                <FiPlus size={14} /> Add Item
              </button>
            </div>

            {form.items.map((item, index) => {
              const stockInfo = warehouseStock[item.product_name] || null;
              return (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 items-end bg-base-200/60 p-3 rounded-lg"
                >
                  {/* Product */}
                  <div className="md:col-span-6">
                    <label className="label">
                      <span className="label-text">Product</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={item.product_name}
                      onChange={(e) =>
                        handleItemChange(index, "product_name", e.target.value)
                      }
                    >
                      <option value="">Select product</option>
                      {productOptions.map(([name, info]) => (
                        <option key={name} value={name}>
                          {name} — {info.qty} {info.unit} available
                        </option>
                      ))}
                    </select>
                    {fieldErrors[`item_${index}_product`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors[`item_${index}_product`]}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-4">
                    <label className="label">
                      <span className="label-text">Requested Qty</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={item.requested_qty}
                      onChange={(e) =>
                        handleItemChange(index, "requested_qty", e.target.value)
                      }
                    />
                    {fieldErrors[`item_${index}_qty`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldErrors[`item_${index}_qty`]}
                      </p>
                    )}
                    {stockInfo && !fieldErrors[`item_${index}_qty`] && (
                      <p className="text-xs text-base-content/60 mt-1">
                        Available: {stockInfo.qty} {stockInfo.unit}
                      </p>
                    )}
                  </div>

                  {/* Remove */}
                  <div className="md:col-span-2 flex justify-end md:justify-center">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm mt-6"
                      onClick={() => removeItemRow(index)}
                      disabled={form.items.length === 1}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            {fieldErrors.items && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.items}</p>
            )}
          </div>

          {/* NOTES */}
          <div>
            <label className="label">
              <span className="label-text">Notes (optional)</span>
            </label>
            <textarea
              name="notes"
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="Any special instructions or comments..."
              value={form.notes}
              onChange={handleFieldChange}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-purple"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderModal;
