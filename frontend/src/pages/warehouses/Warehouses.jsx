import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";

import AddWarehouseModal from "./AddWarehouseModal";
import EditWarehouseModal from "./EditWarehouseModal";
import DeleteWarehouseModal from "./DeleteWarehouseModal";

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState(null);
  const [deleteWarehouse, setDeleteWarehouse] = useState(null);

  // ✅ SINGLE FILTER SOURCE
  const filteredWarehouses = warehouses.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  // Load data
  const loadWarehouses = async () => {
    try {
      const res = await api.get("/warehouses/");
      setWarehouses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  // ✅ HELPER: TOTAL STOCK FROM OBJECT
  const getTotalStock = (stockObj) => {
    if (!stockObj || typeof stockObj !== "object") return 0;
    return Object.values(stockObj).reduce(
      (sum, item) => sum + (item.qty || 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-base-content/60">
            Manage all warehouse locations.
          </p>
        </div>

        <button
          className="btn btn-purple flex items-center gap-2"
          onClick={() => setOpenAdd(true)}
        >
          <FiPlus size={18} /> Add Warehouse
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-base-100 p-4 rounded-xl shadow flex items-center gap-3">
        <FiSearch className="text-base-content/60" size={20} />
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Search warehouses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE / CARDS */}
      <div className="bg-base-100 p-6 rounded-xl shadow">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <p className="text-center py-10 text-base-content/60">
            No warehouses found.
          </p>
        ) : (
          <>
            {/* 📱 MOBILE + 📲 TABLET — CARD VIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredWarehouses.map((w) => (
                <div
                  key={w.id}
                  className="card bg-base-100 p-4 border shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-2">{w.name}</h3>

                  <p className="text-sm">
                    <b>Code:</b> {w.warehouse_code}
                  </p>
                  <p className="text-sm">
                    <b>Location:</b> {w.location}
                  </p>
                  <p className="text-sm">
                    <b>Capacity:</b> {w.capacity} units
                  </p>

                  {/* ✅ SAFE OBJECT RENDER */}
                  <div className="text-sm mt-2">
                    <b>Stock:</b>
                    <div className="mt-1">
                      {w.current_stock &&
                      Object.keys(w.current_stock).length > 0 ? (
                        Object.entries(w.current_stock).map(
                          ([product, info]) => (
                            <span
                              key={product}
                              className="inline-block bg-base-200 rounded px-2 py-1 mr-1 mb-1 text-xs"
                            >
                              {product}: {info.qty} {info.unit}
                            </span>
                          )
                        )
                      ) : (
                        <span className="text-base-content/50">No stock</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => setEditWarehouse(w)}
                    >
                      <FiEdit size={14} />
                    </button>

                    <button
                      className="btn btn-xs btn-error text-white"
                      onClick={() => setDeleteWarehouse(w)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 💻 DESKTOP — TABLE VIEW */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Current Stock</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredWarehouses.map((w) => (
                    <tr key={w.id}>
                      <td className="font-semibold">{w.warehouse_code}</td>
                      <td>{w.name}</td>
                      <td className="max-w-[200px] truncate">{w.location}</td>
                      <td>{w.capacity} units</td>

                      {/* ✅ TOTAL STOCK NUMBER */}
                      <td>{getTotalStock(w.current_stock)} units</td>

                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setEditWarehouse(w)}
                          >
                            <FiEdit size={16} />
                          </button>

                          <button
                            className="btn btn-sm btn-error text-white"
                            onClick={() => setDeleteWarehouse(w)}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {openAdd && (
        <AddWarehouseModal
          onClose={() => setOpenAdd(false)}
          reload={loadWarehouses}
        />
      )}

      {editWarehouse && (
        <EditWarehouseModal
          warehouse={editWarehouse}
          onClose={() => setEditWarehouse(null)}
          reload={loadWarehouses}
        />
      )}

      {deleteWarehouse && (
        <DeleteWarehouseModal
          warehouse={deleteWarehouse}
          onClose={() => setDeleteWarehouse(null)}
          reload={loadWarehouses}
        />
      )}
    </div>
  );
};

export default Warehouses;
