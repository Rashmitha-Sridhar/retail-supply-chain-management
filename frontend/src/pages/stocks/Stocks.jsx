import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiPlus, FiHome, FiBox, FiSearch } from "react-icons/fi";
import AddStockModal from "./AddStockModal";
import EditStockModal from "./EditStockModal";

const Stocks = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [editStock, setEditStock] = useState(null);
  const [search, setSearch] = useState("");
  

  // ✅ Load Warehouses
  const loadWarehouses = async () => {
    try {
      const res = await api.get("/warehouses/");
      setWarehouses(res.data || []);
    } catch (err) {
      console.error("Failed to load warehouses:", err);
    }
  };

  // ✅ Load Stock
  const loadStock = async (warehouse_id) => {
    if (!warehouse_id) return;

    setLoading(true);
    try {
      const res = await api.get(`/stock/${warehouse_id}`);
      setStock(res.data.stock || {});
    } catch (err) {
      console.error("Failed to fetch stock:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  useEffect(() => {
    if (selectedWarehouse) {
      loadStock(selectedWarehouse);
    }
  }, [selectedWarehouse]);

  // ✅ Search Filter
  {
    filteredProducts.map(([product, detail]) => (
      <div
        key={product}
        className="p-4 border border-base-300 rounded-xl bg-base-100 shadow hover:shadow-lg transition"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FiBox size={18} />
            {product}
          </h3>

          {/* ✅ EDIT BUTTON */}
          <button
            className="btn btn-xs btn-outline"
            onClick={() =>
              setEditStock({
                warehouse_id: selectedWarehouse,
                product_name: product,
                qty: detail.qty,
                unit: detail.unit,
              })
            }
          >
            Edit
          </button>
        </div>

        <div className="mt-2 text-base-content/70">
          <p>
            <span className="font-semibold">Quantity: </span>
            {detail.qty} {detail.unit}
          </p>
        </div>
      </div>
    ));
  }

  return (
    <div className="space-y-6">
      {/* ✅ HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Stock</h1>
          <p className="text-base-content/60">
            View and manage inventory stored in warehouses.
          </p>
        </div>

        <button
          className="btn btn-purple flex items-center gap-2"
          onClick={() => setOpenAdd(true)}
          disabled={!selectedWarehouse}
        >
          <FiPlus size={18} /> Add Stock
        </button>
      </div>

      {/* ✅ WAREHOUSE SELECT */}
      <div className="bg-base-100 p-4 rounded-xl shadow flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 font-semibold">
          <FiHome size={20} /> Choose Warehouse:
        </div>

        <select
          className="select select-bordered w-full sm:max-w-xs"
          value={selectedWarehouse || ""}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
        >
          <option value="" disabled>
            Select a warehouse
          </option>

          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.warehouse_code} — {wh.name}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ SEARCH */}
      {selectedWarehouse && (
        <div className="bg-base-100 p-4 rounded-xl shadow flex items-center gap-3">
          <FiSearch className="text-base-content/60" size={20} />
          <input
            type="text"
            placeholder="Search product..."
            className="input input-bordered w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* ✅ STOCK GRID */}
      {selectedWarehouse && (
        <div className="bg-base-100 p-6 rounded-xl shadow">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-base-content/60 py-6">
              No stock items found.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map(([product, detail]) => (
                <div
                  key={product}
                  className="p-4 border border-base-300 rounded-xl bg-base-100 shadow hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FiBox size={18} />
                      {product}
                    </h3>

                    {/* ✅ EDIT BUTTON */}
                    <button
                      className="btn btn-xs btn-secondary"
                      onClick={() =>
                        setEditStock({
                          warehouse_id: selectedWarehouse,
                          product_name: product,
                          available_qty: detail.qty,
                          unit: detail.unit,
                        })
                      }
                    >
                      Edit
                    </button>
                  </div>

                  <div className="mt-2 text-base-content/70">
                    <p>
                      <span className="font-semibold">Quantity: </span>
                      {detail.qty} {detail.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ ADD MODAL */}
      {openAdd && (
        <AddStockModal
          warehouseList={warehouses}
          defaultWarehouse={selectedWarehouse}
          onClose={() => setOpenAdd(false)}
          reload={() => loadStock(selectedWarehouse)}
        />
      )}

      {/* ✅ EDIT MODAL */}
      {editStock && (
        <EditStockModal
          stock={editStock}
          warehouseList={warehouses}
          onClose={() => setEditStock(null)}
          reload={() => loadStock(selectedWarehouse)}
        />
      )}
    </div>
  );
};

export default Stocks;
