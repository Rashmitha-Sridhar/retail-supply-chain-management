import { FiX, FiTrash2 } from "react-icons/fi";
import api from "../../api/axios";


const EditOrderModal = ({ order, onClose, reload }) => {
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await api.put(`/orders/${order.id}`, {
        status: "cancelled",
      });

      reload();
      onClose();
    } catch (err) {
      alert("Failed to cancel order");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg relative">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 btn btn-ghost btn-sm"
          onClick={onClose}
        >
          <FiX size={18} />
        </button>

        <h2 className="text-xl font-bold mb-4">Order Details</h2>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <p><b>Order:</b> {order.order_code}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Store:</b> {order.store_name}</p>
          <p><b>Warehouse:</b> {order.warehouse_name}</p>
          <p><b>Priority:</b> {order.priority}</p>
        </div>

        {/* Items */}
        <div className="mb-5">
          <h3 className="font-semibold mb-2">Ordered Items</h3>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between bg-base-200 p-2 rounded text-sm"
              >
                <span>{item.product_name}</span>
                <span>
                  {item.requested_qty} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mb-4">
            <p className="text-sm opacity-70">Notes</p>
            <p className="text-sm">{order.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-purple mr-2" onClick={onClose}>
            Close
          </button>

          {order.status === "pending" && (
            <button
              className="btn btn-error text-white flex items-center gap-2"
              onClick={handleCancel}
            >
              <FiTrash2 /> Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
