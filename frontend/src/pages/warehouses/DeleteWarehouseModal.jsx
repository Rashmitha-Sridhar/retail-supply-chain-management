import api from "../../api/axios";

const DeleteWarehouseModal = ({ warehouse, onClose, reload }) => {
  const handleDelete = async () => {
    try {
      await api.delete(`/warehouses/${warehouse.id}`);
      reload();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete warehouse");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4">Delete Warehouse</h2>

        <p className="mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{warehouse.name}</span>?
        </p>

        <div className="flex justify-center gap-3">
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

export default DeleteWarehouseModal;
