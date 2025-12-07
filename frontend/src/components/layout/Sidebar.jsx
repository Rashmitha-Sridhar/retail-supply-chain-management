import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  FiHome,
  FiUsers,
  FiTruck,
  FiArchive,
  FiBox,
  FiLayers,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = ({ onClose }) => {
  const { logout } = useAuth();
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome size={18} /> },
    { name: "Suppliers", path: "/suppliers", icon: <FiUsers size={18} /> },
    { name: "Warehouses", path: "/warehouses", icon: <FiArchive size={18} /> },
    { name: "Stocks", path: "/stocks", icon: <FiLayers size={18} /> },
    { name: "Stores", path: "/stores", icon: <FiBox size={18} /> },
    { name: "Orders", path: "/orders", icon: <FiTruck size={18} /> },
  ];

  return (
    <div className="h-full w-64 bg-base-200 border-r border-base-300 flex flex-col shadow-lg">
      
      {/* Brand Header */}
      <div className="p-5 text-2xl font-bold tracking-wide border-b border-base-300">
        Retail SCM
      </div>

      {/* Menu Section */}
      <nav className="flex-1 p-3">
        {menuItems.map((item) => (
          <NavLink
            to={item.path}
            key={item.name}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all cursor-pointer
              ${
                isActive
                  ? "bg-primary text-primary-content shadow-md"
                  : "hover:bg-base-300"
              }`
            }
            onClick={onClose}
          >
            {item.icon}
            <span className="text-sm font-medium select-none">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout
      <div className="p-3 border-t border-base-300">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg w-full hover:bg-base-300 transition-all">
          <FiLogOut size={18} />
          <span className="text-sm font-medium" onClick={logout}>Logout</span>
        </button>
      </div> */}
    </div>
  );
};

export default Sidebar;
