import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import GenerateInvoice from "./pages/GenerateInvoice";
import InvoicePreview from "./pages/InvoicePreview";
import Reports from "./pages/Reports";
import EnterpriseInvoice from "./pages/EnterpriseInvoice";
import Inventory from "./pages/Inventory";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import OrderManagement from "./pages/OrderManagement";
import UserProducts from "./pages/UserProducts";
import UserClients from "./pages/UserClients";
import UserInventory from "./pages/UserInventory";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import "./styles/global.css";
// Navbar.css might be obsolete with new layout, but keeping global.css

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const onAuthChange = () => setIsAuth(!!localStorage.getItem("token"));
    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", onAuthChange);
    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onAuthChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!isAuth ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <EnterpriseInvoice />
                </AdminLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <Reports />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <Inventory />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <Clients />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <Settings />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <OrderManagement />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute adminOnly={true}>
                <AdminLayout>
                  <AddProduct />
                </AdminLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Protected User Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/generate-invoice"
          element={
            <ProtectedRoute>
              <UserLayout>
                <GenerateInvoice />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-products"
          element={
            <ProtectedRoute>
              <UserProducts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-clients"
          element={
            <ProtectedRoute>
              <UserClients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-inventory"
          element={
            <ProtectedRoute>
              <UserInventory />
            </ProtectedRoute>
          }
        />

        <Route path="/invoices/:id/preview" element={<InvoicePreview />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
