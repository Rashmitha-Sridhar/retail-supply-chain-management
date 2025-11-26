import { useEffect, useState } from "react";
import api from "../../api/axios";

const Dashboard = () => {
  const [stats, setStats] = useState({
    inventoryCount: 0,
    lowStock: 0,
    outOfStock: 0,
    suppliers: 0,
    warehouses: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch stats from backend
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          invRes,
          lowRes,
          outRes,
          supplierRes,
          warehouseRes,
        ] = await Promise.all([
          api.get("/stats/inventoryCount"),
          api.get("/stats/lowStock"),
          api.get("/stats/outOfStock"),
          api.get("/stats/suppliersCount"),
          api.get("/stats/warehousesCount"),
        ]);

        setStats({
          inventoryCount: invRes.data.inventoryCount,
          lowStock: lowRes.data.lowStockCount,
          outOfStock: outRes.data.outOfStockCount,
          suppliers: supplierRes.data.suppliersCount,
          warehouses: warehouseRes.data.warehousesCount,
        });
      } catch (err) {
        console.error("Dashboard stats fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">Total Inventory Items</div>
          <div className="stat-value text-primary">{stats.inventoryCount}</div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">Low Stock</div>
          <div className="stat-value text-warning">{stats.lowStock}</div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">Out of Stock</div>
          <div className="stat-value text-error">{stats.outOfStock}</div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">Suppliers</div>
          <div className="stat-value">{stats.suppliers}</div>
        </div>

        <div className="stat bg-base-100 rounded-xl shadow">
          <div className="stat-title">Warehouses</div>
          <div className="stat-value">{stats.warehouses}</div>
        </div>
      </div>

      {/* CHART & TABLE PLACEHOLDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART SECTION */}
        <div className="bg-base-100 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Inventory Trend</h2>
          <div className="h-64 flex items-center justify-center text-base-content/50">
            {/* Replace with Recharts later */}
            Chart will appear here
          </div>
        </div>

        {/* RECENT ORDERS / ACTIVITY */}
        <div className="bg-base-100 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <ul className="space-y-3">
            <li className="p-3 bg-base-200 rounded-lg">
              ✓ Warehouse updated new stock
            </li>
            <li className="p-3 bg-base-200 rounded-lg">
              ✓ Store requested supplier restock
            </li>
            <li className="p-3 bg-base-200 rounded-lg">
              ✓ New order processed
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
