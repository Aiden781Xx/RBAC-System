import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

/* Pages */
import LandingPage from "./pages/home/landing";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";

// Admin Pages
import AdminDashboard from "./pages/admin/dashboard"; 
import Buyers from "./pages/admin/buyers";
import Disputes from "./pages/admin/disputes";
import AdminLogs from "./pages/admin/adminlog";
import Leads from "./pages/admin/leads";
import Suppliers from "./pages/admin/suppliers";
import RFQs from "./pages/admin/rfqs";
import Quotes from "./pages/admin/quotes";
import Profile from "./pages/admin/profile";
import Settings from "./pages/admin/settings";
import AdminChat from "./pages/admin/chat";
import FlowHealth from "./pages/admin/flowHealth";

/* Buyer */
import BuyerDashboard from "./pages/buyer/dashboard";
import BuyerRFQs from "./pages/buyer/rfq";
import BuyerChat from "./pages/buyer/chat";
import BuyerProfile from "./pages/buyer/profile";
import BuyerSettings from "./pages/buyer/setting";

/* Supplier */
import LeadMarketplace from "./pages/supplier/leads";
import MyLeads from "./pages/supplier/myLeads";
import Performance from "./pages/supplier/performance";
import Wallet from "./pages/supplier/wallet";
import SupplierProfile from "./pages/supplier/profile";

// Layouts
import AdminLayout from "./layouts/adminLayout";
import BuyerLayout from "./layouts/buyerLayout";
import SupplierLayout from "./layouts/supplierLayout";
import Subscriptions from "./pages/admin/subscription";

function RequireRole({ role, children }) {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("cs_user");
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.userType !== role) return <Navigate to="/login" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  /* ADMIN */
  {
    path: "/admin",
    element: <RequireRole role="admin"><AdminLayout /></RequireRole>,
    children: [
    { index: true,         element: <AdminDashboard /> },
    { path: "dashboard",   element: <AdminDashboard /> },
    { path: "buyers",      element: <Buyers /> },
    { path: "subscription",     element: <Subscriptions /> },
    { path: "logs",        element: <AdminLogs /> },
    { path: "leads",       element: <Leads /> },
    { path: "disputes",    element: <Disputes /> },
    { path: "suppliers",   element: <Suppliers /> },
    { path: "rfqs",        element: <RFQs /> },
    { path: "quotes",      element: <Quotes /> },
    { path: "profile",     element: <Profile /> },
    { path: "settings",    element: <Settings /> },
    { path: "chat",        element: <AdminChat /> },
    { path: "flow-health", element: <FlowHealth /> },
  ],
  },

  /* BUYER */
  {
    path: "/buyer",
    element: <RequireRole role="buyer"><BuyerLayout /></RequireRole>,
    children: [
      { index: true, element: <BuyerDashboard /> },
      { path: "dashboard", element: <BuyerDashboard /> },
      { path: "rfqs", element: <BuyerRFQs /> },
      { path: "chat", element: <BuyerChat /> },
      { path: "profile", element: <BuyerProfile /> },
      { path: "settings", element: <BuyerSettings /> },
    ],
  },

  /* SUPPLIER */
  {
    path: "/supplier/dashboard",
    element: <RequireRole role="supplier"><SupplierLayout /></RequireRole>,
    children: [
      { index: true, element: <LeadMarketplace /> },
      { path: "leads", element: <LeadMarketplace /> },
      { path: "myleads", element: <MyLeads /> },
      { path: "performance", element: <Performance /> },
      { path: "wallet", element: <Wallet /> },
      { path: "profile", element: <SupplierProfile /> }
    ]
  }
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}