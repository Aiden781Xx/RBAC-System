// layouts/buyerLayout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  menu: "M4 6h16M4 12h16M4 18h16",
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  rfq: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  profile: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  plus: "M12 5v14M5 12h14",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  help: "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01",
  chevron: "M9 18l6-6-6-6",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
};

const NAV = [
  { label: "Dashboard", icon: "dashboard", path: "/buyer/dashboard" },
  { label: "My RFQs", icon: "rfq", path: "/buyer/rfqs" },
  { label: "Chat", icon: "chat", path: "/buyer/chat", badge: 3 },
  { label: "Profile", icon: "profile", path: "/buyer/profile" },
  { label: "Settings", icon: "settings", path: "/buyer/settings" },
];

const NOTIFS = [
  { text: "New quote from Precision Works Inc", time: "2m ago", unread: true },
  { text: "RFQ-2024-002 deadline is tomorrow", time: "1h ago", unread: true },
  { text: "3 new supplier matches found", time: "3h ago", unread: true },
  { text: "Order ORD-2024-001 status updated", time: "1d ago", unread: false },
];

export default function BuyerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDark = () => {
    setDarkMode(prev => !prev);
  };
  
  const activePath = location.pathname;
  const activeLabel = NAV.find(n => n.path === activePath)?.label ?? "Dashboard";
  const unreadCount = NOTIFS.filter(n => n.unread).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cs_user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-text font-sans overflow-hidden">

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-surface text-text flex flex-col shrink-0 z-30 overflow-hidden border-r border-border"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border shrink-0 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md">
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="white"
              strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
                <p className="text-[15px] font-black tracking-tight leading-none whitespace-nowrap">
                  Control<span className="text-primary">Source</span>
                </p>
                <p className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5">
                  Buyer Portal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New RFQ Button */}
        <div className="px-3 pt-4 shrink-0">
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/buyer/rfqs")}
            className={`w-full flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white
              font-bold py-2.5 rounded-xl transition-colors
              ${collapsed ? "justify-center" : "px-4"}`}>
            <Icon d={ICONS.plus} size={16} />
            {!collapsed && <span className="text-sm whitespace-nowrap">New RFQ</span>}
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-5 space-y-0.5 overflow-y-auto pb-4">
          {!collapsed && (
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest px-2 mb-2">
              Navigation
            </p>
          )}
          {NAV.map(item => {
            const active = activePath === item.path ||
              (item.path !== "/buyer/dashboard" && activePath.startsWith(item.path));
            return (
              <motion.button key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: collapsed ? 0 : 2 }}
                title={collapsed ? item.label : ""}
                className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all relative
                  ${collapsed ? "justify-center" : "px-3"}
                  ${active
                    ? "bg-primary/10 border border-primary/20"
                    : "text-text-muted hover:bg-surface-2 hover:text-text"}`}>
                {active && (
                  <motion.div layoutId="nav-active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 bg-primary rounded-full" />
                )}
                <Icon d={ICONS[item.icon]} size={17} />
                {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Help */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div key="help-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} className="mx-3 mb-3 shrink-0">
              <div className="p-3.5 rounded-xl bg-surface-2 border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Icon d={ICONS.help} size={13} className="text-primary" />
                  <span className="text-xs font-bold text-text">Need Help?</span>
                </div>
                <p className="text-[11px] text-text-muted mb-2.5 leading-relaxed">
                  Contact support for sourcing assistance.
                </p>
                <button className="w-full text-[11px] font-bold py-1.5 rounded-lg
                  bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                  Get Support
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User row */}
        <div className={`border-t border-border p-3 shrink-0 flex items-center gap-3
          ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center
            text-white font-black text-sm shrink-0">
            T
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div key="user-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text truncate leading-none">TechCorp</p>
                  <p className="text-[11px] text-text-muted mt-0.5 truncate">buyer@techcorp.com</p>
                </div>
                <button onClick={handleLogout}
                  className="text-text-muted hover:text-danger transition-colors p-1 rounded-lg hover:bg-surface-2 shrink-0"
                  title="Logout">
                  <Icon d={ICONS.logout} size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="bg-surface border-b border-border px-5 py-3 flex items-center gap-4 shrink-0 z-20">

          {/* Collapse toggle */}
          <motion.button whileTap={{ scale: 0.93 }}
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl hover:bg-surface-2 transition-colors text-text-muted">
            <Icon d={ICONS.menu} size={18} />
          </motion.button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-text-muted">Buyer</span>
            <Icon d={ICONS.chevron} size={12} className="text-text-muted" />
            <span className="font-semibold text-text">{activeLabel}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden md:block">
            <Icon d={ICONS.search} size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input placeholder="Search RFQs, suppliers…"
              className="w-56 pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm
                placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30
                focus:border-primary transition" />
          </div>

          {/* ── Dark Mode Toggle ── */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={toggleDark}
            className="p-2 rounded-xl hover:bg-surface-2 transition-colors text-text-muted"
            title={darkMode ? "Switch to Light" : "Switch to Dark"}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={darkMode ? "moon" : "sun"}
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="block">
                <Icon d={darkMode ? ICONS.sun : ICONS.moon} size={18} />
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* ── Bell + Notification Dropdown ── */}
          <div className="relative">
            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-xl hover:bg-surface-2 transition-colors relative">
              <Icon d={ICONS.bell} size={18} className="text-text-muted" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-surface" />
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />

                  {/* Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-80 bg-background border border-border
                      rounded-2xl shadow-xl z-50 overflow-hidden">

                    {/* Dropdown header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="text-sm font-black text-text">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold text-primary bg-primary-soft
                          px-2 py-0.5 rounded-full border border-primary/20">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    {/* Notif list */}
                    <div className="divide-y divide-border max-h-72 overflow-y-auto">
                      {NOTIFS.map((n, i) => (
                        <motion.div key={i}
                          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer
                            hover:bg-surface ${n.unread ? "bg-primary/5" : ""}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0
                            ${n.unread ? "bg-primary" : "bg-border"}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed
                              ${n.unread ? "font-semibold text-text" : "text-text-muted"}`}>
                              {n.text}
                            </p>
                            <p className="text-[10px] text-text-muted mt-0.5">{n.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-border">
                      <button className="w-full text-xs font-bold text-primary hover:text-primary-hover
                        py-1.5 rounded-lg hover:bg-primary-soft transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center
              text-white font-black text-sm">
              T
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-text leading-none">TechCorp</p>
              <p className="text-[11px] text-text-muted">Industries</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
