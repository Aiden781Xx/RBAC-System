import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, FileText, TrendingUp, CreditCard, 
  Building2, Menu, X, Award, Bell, Sun, Moon, LogOut, ChevronRight, Search 
} from "lucide-react";
import { marketApi } from "../api/marketApi";

// Reuse the Icon component for consistent stroke and scaling
const Icon = ({ icon: IconComponent, size = 18, className = "" }) => (
  <IconComponent size={size} className={className} strokeWidth={1.8} />
);

export default function SupplierLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  
  // Real supplier data
  const [supplierProfile, setSupplierProfile] = useState(null);
  const [purchasedLeadsCount, setPurchasedLeadsCount] = useState(0);

  // Fetch real supplier profile for sidebar display
  useEffect(() => {
    (async () => {
      try {
        const res = await marketApi.getSupplierProfile();
        setSupplierProfile(res.data);
        const lRes = await marketApi.getSupplierLeads({ page: 1, limit: 100 });
        const leads = lRes.data?.leads || [];
        setPurchasedLeadsCount(leads.filter(l => l.isPurchased).length);
      } catch {}
    })();
  }, []);

  const totalSpent = (supplierProfile?.leadAccess?.totalLeadsPurchased || 0) * 150; // estimate
  const sqiScore = supplierProfile?.SQI?.score || 0;
  const sqiLevel = supplierProfile?.SQI?.level || "BRONZE";
  const supplierStatus = supplierProfile?.supplierStatus || "DOCUMENTS_PENDING";

  // Keep context props for backward compat with wallet page (wallet now uses direct API)
  const [walletBalance] = useState(0);
  const [leads, setLeads] = useState([]);
  const [myLeads, setMyLeads] = useState([]);
  const [ordersWon, setOrdersWon] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // THEME LOGIC
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const menu = [
    { path: "/supplier/dashboard", label: "Marketplace", icon: LayoutDashboard, end: true },
    { path: "/supplier/dashboard/myleads", label: "My Leads", icon: FileText },
    { path: "/supplier/dashboard/performance", label: "Performance", icon: Award },
    { path: "/supplier/dashboard/wallet", label: "Wallet", icon: CreditCard },
    { path: "/supplier/dashboard/profile", label: "Profile", icon: Building2 }
  ];

  const activeLabel = menu.find(m => location.pathname === m.path)?.label ?? "Dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cs_user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-text font-sans overflow-hidden transition-colors duration-300">
      
      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 85 }}
        className="bg-surface border-r border-border sticky top-0 h-screen hidden md:flex flex-col flex-shrink-0 z-40 transition-colors"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-primary rounded-xl flex-shrink-0 shadow-lg shadow-primary/20 flex items-center justify-center text-white font-black italic">S</div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-lg font-black tracking-tight whitespace-nowrap">Control<span className="text-primary">Source</span></h2>
                <p className="text-[9px] text-text-muted uppercase tracking-widest font-bold mt-0.5">Supplier Portal</p>
              </motion.div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 pt-6 space-y-1 overflow-y-auto">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm
                ${isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25" 
                  : "text-text-muted hover:text-primary hover:bg-surface-2"}
              `}
            >
              <Icon icon={item.icon} size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* PROFILE FOOTER */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center font-bold text-primary">PM</div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Precision Mfg</p>
                <button onClick={handleLogout} className="text-[10px] text-danger font-black uppercase hover:underline">Logout</button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 px-8 flex items-center justify-between border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-surface-2 rounded-xl text-text-muted transition-colors">
              <Icon icon={Menu} size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted font-medium">Supplier</span>
              <Icon icon={ChevronRight} size={14} className="text-text-muted" />
              <span className="font-bold text-text">{activeLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* SEARCH */}
            <div className="relative hidden lg:block">
              <Icon icon={Search} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input placeholder="Search RFQs..." className="pl-10 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64" />
            </div>

            {/* SUPPLIER STATUS - replaces fake wallet balance */}
            <div className="bg-surface-2 border border-border px-4 py-2 rounded-2xl hidden sm:flex flex-col items-center">
              <p className="text-[9px] font-black uppercase text-text-muted tracking-widest">SQI Score</p>
              <p className="text-sm font-black text-primary">{sqiScore} <span className="text-xs text-text-muted font-medium">{sqiLevel}</span></p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-surface-2 rounded-xl text-text-muted transition-colors">
                <Icon icon={darkMode ? Sun : Moon} size={20} />
              </button>
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-surface-2 rounded-xl text-text-muted transition-colors relative">
                <Icon icon={Bell} size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
              </button>
            </div>
          </div>
        </header>

        {/* DYNAMIC VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-8 max-w-[1600px] w-full mx-auto">
          <Outlet
            context={{
              walletBalance,
              leads,
              setLeads,
              myLeads,
              setMyLeads,
              ordersWon,
              setOrdersWon,
              transactions,
              setTransactions,
            }}
          />

          {/* FOOTER */}
          <footer className="mt-16 border-t border-border pt-10 pb-6 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-black italic">S</div>
                  <div>
                    <p className="font-black tracking-tight">Control<span className="text-primary">Source</span></p>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Supplier Portal</p>
                  </div>
                </div>
                <p className="text-text-muted font-medium mt-4 max-w-xl">
                  Discover verified RFQs, unlock leads using wallet credits, and track your marketplace performance—built for speed and clarity.
                </p>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-3">Company</p>
                <ul className="space-y-2 font-bold">
                  <li><button className="hover:text-primary transition-colors" onClick={() => navigate("/")}>Home</button></li>
                  <li><button className="hover:text-primary transition-colors" onClick={() => navigate("/register")}>Create account</button></li>
                  <li><button className="hover:text-primary transition-colors" onClick={handleLogout}>Login</button></li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-3">More features</p>
                <ul className="space-y-2 font-bold text-text-muted">
                  <li className="hover:text-primary transition-colors">Verified buyers & RFQs</li>
                  <li className="hover:text-primary transition-colors">Smart matching score</li>
                  <li className="hover:text-primary transition-colors">Wallet credits & unlocks</li>
                  <li className="hover:text-primary transition-colors">Performance insights</li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-text-muted font-bold">
              <p>© {new Date().getFullYear()} ControlSource. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <span className="hover:text-primary transition-colors cursor-default">Privacy</span>
                <span className="hover:text-primary transition-colors cursor-default">Terms</span>
                <span className="hover:text-primary transition-colors cursor-default">Support</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
