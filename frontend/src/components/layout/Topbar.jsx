import { 
  FiMenu, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiShield, 
  FiPackage, 
  FiShoppingBag 
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    switch (user?.role) {
      case "admin":
        return <FiShield size={14} className="text-primary" />;
      case "warehouse_manager":
        return <FiPackage size={14} className="text-primary" />;
      case "store_manager":
        return <FiShoppingBag size={14} className="text-primary" />;
      default:
        return null;
    }
  };

  const formatRole = (role) => {
    if (!role) return "";
    return role.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div className="w-full bg-base-100 border-b border-base-300 px-4 py-3 flex items-center justify-between shadow-sm">
      
      {/* LEFT: Mobile Menu Button */}
      <button 
        className="md:hidden btn btn-ghost btn-sm"
        onClick={onMenuClick}
      >
        <FiMenu size={20} />
      </button>

      {/* CENTER: Page Title */}
      <h2 className="text-lg md:text-xl font-semibold tracking-wide">
        Dashboard
      </h2>

      {/* RIGHT: User Menu */}
      <div className="flex items-center gap-3">
        
        {/* ROLE BADGE WITH ICON */}
        <span className="badge badge-primary badge-outline hidden sm:flex items-center gap-1 text-sm px-3 py-2">
          {getRoleIcon()}
          {formatRole(user?.role)}
        </span>

        {/* Avatar + Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-9 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </label>

          <ul
            tabIndex={0}
            className="dropdown-content z-[100] menu p-2 shadow-lg bg-base-100 rounded-xl w-52 border border-base-300"
          >
            <li className="menu-title px-2 text-xs opacity-70">Account</li>

            <li>
              <a className="flex items-center gap-2">
                <FiUser size={16} />
                Profile
              </a>
            </li>

            <li>
              <a className="flex items-center gap-2">
                <FiSettings size={16} />
                Settings
              </a>
            </li>

            <li className="mt-1 pt-1 border-t border-base-300">
              <button
                className="flex items-center gap-2 text-error"
                onClick={logout}
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default Topbar;
