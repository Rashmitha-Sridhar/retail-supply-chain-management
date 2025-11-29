import { useState } from "react";
import api from "../../api/axios";

const EditSupplierModal = ({ supplier, onClose, reload }) => {
  const [form, setForm] = useState({
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address || "",  
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.put(`/suppliers/${supplier.id}`, form);
      reload();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
        
        <h2 className="text-xl font-bold mb-4">Edit Supplier</h2>

        {error && (
          <div className="alert alert-error py-2 mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            className="input input-bordered w-full"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            className="input input-bordered w-full"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            className="input input-bordered w-full"
            value={form.phone}
            onChange={handleChange}
            required
          />

          {/*  Address */}
          <textarea
            name="address"
            className="textarea textarea-bordered w-full"
            value={form.address}
            onChange={handleChange}
            rows={3}
            required
          />

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-purple" disabled={loading}>
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

export default EditSupplierModal;
