import { useEffect, useState } from "react";
import api from "../../api/axios";
import { FiTrendingUp, FiAlertTriangle, FiXCircle, FiTruck, FiHome } from "react-icons/fi";

const Dashboard = () => {
  const [stats, setStats] = useState({
    inventoryCount: 0,
    lowStock: 0,
    outOfStock: 0,
    suppliers: 0,
    warehouses: 0,
  });

  const [loading, setLoading] = useState(true);

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
    <div className="space-y-8">

      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold mb-1">Dashboard Overview</h1>
        <p className="text-base-content/60 text-sm">
          A quick snapshot of your retail supply chain operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <StatCard
          title="Total Inventory Items"
          value={stats.inventoryCount}
          icon={<FiTrendingUp className="text-primary text-3xl" />}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={<FiAlertTriangle className="text-warning text-3xl" />}
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={<FiXCircle className="text-error text-3xl" />}
        />
        <StatCard
          title="Suppliers"
          value={stats.suppliers}
          icon={<FiTruck className="text-info text-3xl" />}
        />
        <StatCard
          title="Warehouses"
          value={stats.warehouses}
          icon={<FiHome className="text-accent text-3xl" />}
        />
      </div>

      {/* Content Grid (Charts + Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Trend Chart Placeholder */}
        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
          <h2 className="text-lg font-semibold mb-4">Inventory Trend</h2>
          <div className="h-64 flex items-center justify-center text-base-content/40">
            Chart will appear here
          </div>
        </div>

        {/* Recent Activity — Premium Look */}
        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          <div className="space-y-4">

            <ActivityItem text="Warehouse updated new stock" />
            <ActivityItem text="Store requested supplier restock" />
            <ActivityItem text="New order processed" />

          </div>
        </div>

      </div>
    </div>
  );
};


// -------------------------------
// COMPONENTS
// -------------------------------

// Stats Card Component
const StatCard = ({ title, value, icon }) => (
  <div className="bg-base-100 rounded-xl shadow-md p-5 border border-base-300 hover:shadow-xl transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-base-content/60">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
      </div>
      <div>{icon}</div>
    </div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ text }) => (
  <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-all duration-200">
    <span className="text-success text-xl">✓</span>
    <p className="text-sm">{text}</p>
  </div>
);

export default Dashboard;
