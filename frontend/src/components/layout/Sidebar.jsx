import { NavLink } from "react-router-dom";

const Sidebar = ({ onClose }) => {
  const linkClass =
    "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-base-200 transition text-sm";
  const activeClass = "bg-base-200 font-semibold";

  return (
    <aside className="w-64 h-full bg-base-100 border-r border-base-300 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-base-300 flex items-center justify-between">
        <h2 className="text-xl font-bold">Retail SCM</h2>

        {/* Close button for mobile */}
        {onClose && (
          <button
            className="btn btn-sm btn-circle md:hidden"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          📊 <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/suppliers"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          🏭 <span>Suppliers</span>
        </NavLink>
        <NavLink
          to="/warehouses"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          🏬 <span>Warehouses</span>
        </NavLink>
        <NavLink
          to="/stores"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          🛒 <span>Stores</span>
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ""}`
          }
        >
          📦 <span>Orders</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
