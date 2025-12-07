import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import Suppliers from "./pages/suppliers/Suppliers";
import Warehouses from "./pages/warehouses/Warehouses";
import Stocks from "./pages/stocks/Stocks";
import Stores from "./pages/stores/Stores";
import Orders from "./pages/orders/Orders";

// Layout + Protection
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* AUTH ROUTES */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* All dashboard pages live inside MainLayout */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="stores" element={<Stores />} />
            <Route path="orders" element={<Orders />} />
          </Route>

          {/* DEFAULT REDIRECTS */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
