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

      {/* TABLE SECTION */}
      <div className="bg-base-100 p-6 rounded-xl shadow overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <p className="text-center py-10 text-base-content/60">
            No suppliers found.
          </p>
        ) : (
          <table className="table w-full">
            <thead>
              <tr className="text-base">
                <th className="whitespace-nowrap">Name</th>
                <th className="whitespace-nowrap">Email</th>
                <th className="whitespace-nowrap w-32">Phone</th>
                <th className="max-w-xs">Address</th>
                <th className="text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.email}</td>
                  <td className="whitespace-nowrap">
                    {supplier.phone ? `+91 ${supplier.phone}` : "—"}
                  </td>
                  <td className="whitespace-nowrap">
                    {supplier.address || "—"}
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => setEditSupplier(supplier)}
                      >
                        <FiEdit size={16} />
                      </button>

                      <button
                        className="btn btn-sm btn-error text-white"
                        onClick={() => setDeleteSupplier(supplier)}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
