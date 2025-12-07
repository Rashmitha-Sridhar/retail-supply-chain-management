import { useEffect, useState } from "react";
import api from "../../api/axios";

import AddStoreModal from "./AddStoreModal";
import EditStoreModal from "./EditStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";

import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [deleteStore, setDeleteStore] = useState(null);

  // -------------------------------
  // LOAD STORES + WAREHOUSES
  // -------------------------------
  const loadStores = async () => {
    try {
      const res = await api.get("/stores/");
      setStores(res.data || []);
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWarehouses = async () => {
    try {
      const res = await api.get("/warehouses/");
      setWarehouses(res.data || []);
    } catch (err) {
      console.error("Failed to fetch warehouses:", err);
    }
  };

  useEffect(() => {
    loadStores();
    loadWarehouses();
  }, []);

  // -------------------------------
  // FILTERED LIST
  // -------------------------------
  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(search.toLowerCase())
  );

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Stores</h1>
          <p className="text-base-content/60">
            Manage and view all your retail stores.
          </p>
        </div>

        <button className="btn btn-purple flex items-center gap-2" onClick={() => setOpenAdd(true)}>
          <FiPlus size={18} /> Add Store
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-base-100 p-4 rounded-xl shadow flex items-center gap-3">
        <FiSearch className="text-base-content/60" size={20} />
        <input
          type="text"
          placeholder="Search stores..."
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MAIN SECTION */}
      <div className="bg-base-100 p-6 rounded-xl shadow">

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredStores.length === 0 ? (
          <p className="text-center py-10 text-base-content/60">No stores found.</p>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="text-base">
                    <th>Store Code</th>
                    <th>Name</th>
                    <th>Warehouse</th>
                    <th>Manager</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStores.map((store) => (
                    <tr key={store.id}>
                      <td>{store.store_code}</td>
                      <td>{store.name}</td>
                      <td>{store.warehouse_code}</td>
                      <td>{store.manager_name}</td>
                      <td>+91 {store.contact_phone}</td>
                      <td>{store.location}</td>

                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setEditStore(store)}
                          >
                            <FiEdit size={16} />
                          </button>

                          <button
                            className="btn btn-sm btn-error text-white"
                            onClick={() => setDeleteStore(store)}
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

            {/* MOBILE + TABLET CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 md:hidden">
              {filteredStores.map((store) => (
                <div key={store.id} className="border rounded-xl p-4 space-y-2 shadow-sm">
                  
                  <h3 className="font-semibold text-lg">{store.name}</h3>
                  <p className="text-sm text-base-content/70">
                    <strong>Store Code:</strong> {store.store_code}
                  </p>

                  <p className="text-sm text-base-content/70">
                    <strong>Warehouse:</strong> {store.warehouse_code}
                  </p>

                  <p className="text-sm text-base-content/70">
                    <strong>Manager:</strong> {store.manager_name}
                  </p>

                  <p className="text-sm text-base-content/70">
                    <strong>Phone:</strong> +91 {store.contact_phone}
                  </p>

                  <p className="text-sm text-base-content/70">
                    <strong>Location:</strong> {store.location}
                  </p>

                  {/* CARD ACTIONS */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button className="btn btn-sm btn-outline" onClick={() => setEditStore(store)}>
                      <FiEdit size={16} />
                    </button>

                    <button
                      className="btn btn-sm btn-error text-white"
                      onClick={() => setDeleteStore(store)}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODALS */}
      {openAdd && (
        <AddStoreModal
          warehouses={warehouses}
          onClose={() => setOpenAdd(false)}
          reload={loadStores}
        />
      )}

      {editStore && (
        <EditStoreModal
          store={editStore}
          warehouses={warehouses}
          onClose={() => setEditStore(null)}
          reload={loadStores}
        />
      )}

      {deleteStore && (
        <DeleteStoreModal
          store={deleteStore}
          onClose={() => setDeleteStore(null)}
          reload={loadStores}
        />
      )}
    </div>
  );
};

export default Stores;
