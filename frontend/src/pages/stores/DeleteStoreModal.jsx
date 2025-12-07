import api from "../../api/axios";

const DeleteStoreModal = ({ store, onClose, reload }) => {
  const handleDelete = async () => {
    try {
      await api.delete(`/stores/${store.id}`);
      reload();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete store");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-sm">

        <h2 className="text-xl font-bold mb-4 text-error">Delete Store</h2>

        <p className="mb-4">
          Are you sure you want to delete <b>{store.name}</b>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
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

export default DeleteStoreModal;
