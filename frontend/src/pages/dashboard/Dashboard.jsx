// src/pages/dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  FiTrendingUp,
  FiArchive,
  FiHome,
  FiBox,
  FiPieChart,
  FiAlertTriangle,
  FiXCircle,
  FiTruck,
  FiLayers,
  FiAward,
} from "react-icons/fi";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInventory: 0,
    warehouseInventory: 0,
    storeInventory: 0,
    capacityUtilization: 0,
    lowStock: 0,
    outOfStock: 0,
    suppliers: 0,
    warehouses: 0,
    uniqueProducts: 0,
    topProduct: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const results = await Promise.allSettled([
          api.get("/stats/totalInventory"),      // 0
          api.get("/stats/warehouseInventory"),  // 1
          api.get("/stats/storeInventory"),      // 2
          api.get("/stats/capacityUtilization"), // 3
          api.get("/stats/lowStock"),            // 4
          api.get("/stats/outOfStock"),          // 5
          api.get("/stats/suppliersCount"),      // 6
          api.get("/stats/warehousesCount"),     // 7
          api.get("/stats/stock/unique"),        // 8
          api.get("/stats/stock/top"),           // 9
        ]);

        const getVal = (res, key, fallback = 0) =>
          res.status === "fulfilled" && res.value?.data?.[key] !== undefined
            ? res.value.data[key]
            : fallback;

        const totalInventory        = getVal(results[0], "totalInventory");
        const warehouseInventory    = getVal(results[1], "warehouseInventory");
        const storeInventory        = getVal(results[2], "storeInventory");
        const capacityUtilization   = getVal(results[3], "capacityUtilization");
        const lowStock              = getVal(results[4], "lowStockCount");
        const outOfStock            = getVal(results[5], "outOfStockCount");
        const suppliers             = getVal(results[6], "suppliersCount");
        const warehouses            = getVal(results[7], "warehousesCount");
        const uniqueProducts        = getVal(results[8], "uniqueProducts");
        const topProduct            =
          results[9].status === "fulfilled"
            ? results[9].value?.data?.topProduct || null
            : null;

        setStats({
          totalInventory,
          warehouseInventory,
          storeInventory,
          capacityUtilization,
          lowStock,
          outOfStock,
          suppliers,
          warehouses,
          uniqueProducts,
          topProduct,
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
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
    <div className="space-y-10">
      {/* Heading */}
      <header>
        <h1 className="text-3xl font-bold mb-1">Dashboard Overview</h1>
        <p className="text-base-content/60 text-sm">
          Supply chain insights at a glance.
        </p>
      </header>

      {/* =========== INVENTORY OVERVIEW =========== */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Inventory Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Total Inventory"
            value={stats.totalInventory}
            icon={<FiTrendingUp className="text-primary text-3xl" />}
          />
          <StatCard
            title="Warehouse Inventory"
            value={stats.warehouseInventory}
            icon={<FiArchive className="text-accent text-3xl" />}
          />
          <StatCard
            title="Store Inventory"
            value={stats.storeInventory}
            icon={<FiBox className="text-info text-3xl" />}
          />
          <StatCard
            title="Capacity Utilization"
            value={stats.capacityUtilization + "%"}
            icon={<FiPieChart className="text-warning text-3xl" />}
          />
        </div>
      </section>

      {/* =========== STOCK HEALTH =========== */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Stock Health</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Unique Products"
            value={stats.uniqueProducts}
            icon={<FiLayers className="text-primary text-3xl" />}
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
            title="Top Stocked Product"
            value={
              stats.topProduct
                ? `${stats.topProduct.product_name} (${stats.topProduct.available_qty})`
                : "N/A"
            }
            icon={<FiAward className="text-success text-3xl" />}
          />
        </div>
      </section>

      {/* =========== BUSINESS METRICS =========== */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Business Metrics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="Suppliers"
            value={stats.suppliers}
            icon={<FiTruck className="text-success text-3xl" />}
          />
          <StatCard
            title="Warehouses"
            value={stats.warehouses}
            icon={<FiHome className="text-accent text-3xl" />}
          />
        </div>
      </section>

      {/* =========== CHART & ACTIVITY =========== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
          <h2 className="text-lg font-semibold mb-4">Inventory Trend</h2>
          <div className="h-64 flex items-center justify-center text-base-content/40">
            Chart will appear here
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

          <div className="space-y-4">
            <ActivityItem text="Warehouse added new stock" />
            <ActivityItem text="New store added to network" />
            <ActivityItem text="Supplier restocked items" />
          </div>
        </div>
      </section>
    </div>
  );
};

// ---------- COMPONENTS ----------

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

const ActivityItem = ({ text }) => (
  <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-all duration-200">
    <span className="text-success text-xl">✓</span>
    <p className="text-sm">{text}</p>
  </div>
);

export default Dashboard;
