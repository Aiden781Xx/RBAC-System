import { createBrowserRouter } from "react-router-dom";

import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/admin/Dashboard";
import BuyerDashboard from "../pages/buyer/Dashboard";
import SupplierDashboard from "../pages/supplier/dashboard";
import SupplierProfile from "../pages/supplier/profile";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/buyer",
    element: <BuyerDashboard />,
  },
  {
    // main supplier dashboard route
    path: "/supplier",
    element: <SupplierDashboard />,
  },
  {
    // legacy/alternate path that was causing 404 in browser address bar
    path: "/supplier-dashboard",
    element: <SupplierDashboard />,
  },
  {
    // profile page for suppliers
    path: "/supplier/profile",
    element: <SupplierProfile />,
  },
]);
