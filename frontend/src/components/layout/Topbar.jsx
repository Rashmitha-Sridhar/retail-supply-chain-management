import { useAuth } from "../../context/AuthContext";

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 shadow-sm">
      {/* Mobile Menu Button */}
      <button
        className="btn btn-ghost btn-circle md:hidden"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <h1 className="text-lg font-semibold hidden md:block">
        Dashboard
      </h1>

      {/* User Profile */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="text-right">
            <div className="font-medium text-sm">{user.name}</div>
            <div className="text-xs text-base-content/60 capitalize">
              {user.role}
            </div>
          </div>
        )}

        <button className="btn btn-sm btn-outline" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
