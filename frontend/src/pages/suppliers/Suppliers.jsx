import { useEffect, useState } from "react";
import api from "../../api/axios";
import AddSupplierModal from "./AddSupplierModal";
import EditSupplierModal from "./EditSupplierModal";
import DeleteSupplierModal from "./DeleteSupplierModal";
import { FiPlus, FiEdit, FiTrash2, FiSearch } from "react-icons/fi";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [deleteSupplier, setDeleteSupplier] = useState(null);

  // Load supplier data
  const loadSuppliers = async () => {
    try {
      const res = await api.get("/suppliers/");
      setSuppliers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // FILTERED LIST
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-base-content/60">
            Manage and view all registered suppliers.
          </p>
        </div>

        <button
          className="btn btn-purple flex items-center gap-2"
          onClick={() => setOpenAdd(true)}
        >
          <FiPlus size={18} /> Add Supplier
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-base-100 p-4 rounded-xl shadow flex items-center gap-3">
        <FiSearch className="text-base-content/60" size={20} />
        <input
          type="text"
          placeholder="Search suppliers..."
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE + MOBILE CARD VIEW */}
      {/* RESPONSIVE SECTION */}
      {/* RESPONSIVE SECTION */}
      <div className="bg-base-100 p-6 rounded-xl shadow">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <p className="text-center py-10 text-base-content/60">
            No suppliers found.
          </p>
        ) : (
          <>
            {/* MOBILE + TABLET: CARD VIEW (1 column mobile, 2 column tablet) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filteredSuppliers.map((s) => (
                <div
                  key={s.id}
                  className="card bg-base-100 p-4 border shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-2">{s.name}</h3>

                  <p className="text-sm">
                    <b>Email:</b> {s.email}
                  </p>
                  <p className="text-sm">
                    <b>Phone:</b> +91 {s.phone}
                  </p>
                  <p className="text-sm">
                    <b>Address:</b> {s.address}
                  </p>

                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => setEditSupplier(s)}
                    >
                      <FiEdit size={14} />
                    </button>

                    <button
                      className="btn btn-xs btn-error text-white"
                      onClick={() => setDeleteSupplier(s)}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP — FULL TABLE */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th className="max-w-[250px]">Address</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSuppliers.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td className="whitespace-nowrap">+91 {s.phone}</td>
                      <td className="max-w-[250px] truncate">{s.address}</td>

                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setEditSupplier(s)}
                          >
                            <FiEdit size={16} />
                          </button>

                          <button
                            className="btn btn-sm btn-error text-white"
                            onClick={() => setDeleteSupplier(s)}
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

      {/* ADD MODAL */}
      {openAdd && (
        <AddSupplierModal
          onClose={() => setOpenAdd(false)}
          reload={loadSuppliers}
        />
      )}

      {/* EDIT MODAL */}
      {editSupplier && (
        <EditSupplierModal
          supplier={editSupplier}
          onClose={() => setEditSupplier(null)}
          reload={loadSuppliers}
        />
      )}

      {/* DELETE MODAL */}
      {deleteSupplier && (
        <DeleteSupplierModal
          supplier={deleteSupplier}
          onClose={() => setDeleteSupplier(null)}
          reload={loadSuppliers}
        />
      )}
    </div>
  );
};

export default Suppliers;
