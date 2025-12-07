import { useEffect, useState } from "react";
import api from "../../api/axios";
import AddOrderModal from "./AddOrderModal";
import EditOrderModal from "./EditOrderModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editOrder, setEditOrder] = useState(null);

  const loadOrders = async () => {
    const res = await api.get("/orders");
    setOrders(res.data);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statusBadge = (status) =>
    `badge ${
      status === "pending"
        ? "badge-warning"
        : status === "approved"
        ? "badge-info"
        : status === "delivered"
        ? "badge-success"
        : "badge-error"
    }`;

  return (
    <div className="space-y-6 p-5">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button className="btn btn-purple" onClick={() => setShowAdd(true)}>
          Add Order
        </button>
      </div>

      {/* 📱 MOBILE + 📲 TABLET — CARD VIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {orders.length === 0 ? (
          <p className="text-center col-span-full text-base-content/60 py-10">
            No orders found.
          </p>
        ) : (
          orders.map((o) => (
            <div
              key={o.id}
              className="card bg-base-100 p-4 border shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{o.order_code}</h3>
                <span className={statusBadge(o.status)}>
                  {o.status}
                </span>
              </div>

              <p className="text-sm">
                <b>Store:</b> {o.store_name}
              </p>
              <p className="text-sm">
                <b>Warehouse:</b> {o.warehouse_name}
              </p>
              <p className="text-sm capitalize">
                <b>Priority:</b> {o.priority}
              </p>

              <div className="flex justify-end mt-4">
                <button
                  className="btn btn-xs btn-default"
                  onClick={() => setEditOrder(o)}
                >
                  Manage
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 💻 DESKTOP — TABLE VIEW */}
      <div className="hidden lg:block overflow-x-auto bg-base-100 rounded-xl">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Store</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th>Priority</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-10 text-base-content/60"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_code}</td>
                  <td>{o.store_name}</td>
                  <td>{o.warehouse_name}</td>

                  <td>
                    <span className={statusBadge(o.status)}>
                      {o.status}
                    </span>
                  </td>

                  <td className="capitalize">{o.priority}</td>

                  <td className="text-right">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => setEditOrder(o)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showAdd && (
        <AddOrderModal
          onClose={() => setShowAdd(false)}
          reload={loadOrders}
        />
      )}

      {editOrder && (
        <EditOrderModal
          order={editOrder}
          onClose={() => setEditOrder(null)}
          reload={loadOrders}
        />
      )}
    </div>
  );
};

export default Orders;
