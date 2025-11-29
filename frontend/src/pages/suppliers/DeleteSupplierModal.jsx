import api from "../../api/axios";

const DeleteSupplierModal = ({ supplier, onClose, reload }) => {
  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${supplier.id}`);
      reload();
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h3 className="text-lg font-bold mb-3">Delete Supplier?</h3>
        <p className="text-base-content/70 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{supplier.name}</span>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-error text-white" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSupplierModal;
