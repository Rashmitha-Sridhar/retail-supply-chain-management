import { useState } from "react";
import api from "../../api/axios";

const AddSupplierModal = ({ onClose, reload }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",  
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
      await api.post("/suppliers/", form);
      reload();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
        
        <h2 className="text-xl font-bold mb-4">Add Supplier</h2>

        {error && (
          <div className="alert alert-error py-2 mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Name */}
          <input
            type="text"
            name="name"
            className="input input-bordered w-full"
            placeholder="Supplier Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            className="input input-bordered w-full"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />

          {/* Phone */}
          <input
            type="text"
            name="phone"
            className="input input-bordered w-full"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          {/* Address */}
          <textarea
            name="address"
            className="textarea textarea-bordered w-full"
            placeholder="Supplier Address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            required
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>

            <button className="btn btn-purple" disabled={loading}>
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
