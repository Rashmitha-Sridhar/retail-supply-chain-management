import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard pages
import Dashboard from "./pages/dashboard/Dashboard";
import Suppliers from "./pages/suppliers/Suppliers";

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

            {/* we will add these later */}
            {/* <Route path="warehouses" element={<Warehouses />} /> */}
            {/* <Route path="stores" element={<Stores />} /> */}
            {/* <Route path="orders" element={<Orders />} /> */}
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
