import { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { marketApi } from "../api/marketApi";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}><path d={d} /></svg>
);

const ICONS = {
  menu:         "M4 6h16M4 12h16M4 18h16",
  chevronRight: "M9 18l6-6-6-6",
  chevronDown:  "M6 9l6 6 6-6",
  dashboard:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  buyers:       "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  suppliers:    "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  rfqs:         "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  leads:        "M22 12h-4l-3 9L9 3l-3 9H2",
  quotes:       "M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  disputes:     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  logs:         "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  profile:      "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8",
  settings:     "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
  bell:         "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  logout:       "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  search:       "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  chat:         "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  sun:          "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 100 14A7 7 0 0012 5z",
  moon:         "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  star:         "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  flowHealth:   "M22 12h-4l-3 9L9 3l-3 9H2",
};

// Nav groups — Buyer | Supplier | Admin
const NAV_GROUPS = [
  {
    label: "Overview",
    icon: "dashboard",
    accent: null,
    items: [
      { path: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    ],
  },
  {
    label: "Buyer",
    icon: "buyers",
    accent: "blue",
    dot: "bg-blue-400",
    items: [
      { path: "/admin/buyers", label: "All Buyers",  icon: "buyers", badgeKey: "pendingBuyers" },
      { path: "/admin/rfqs",   label: "Buyer RFQs",  icon: "rfqs",   badgeKey: "rfqs"          },
      { path: "/admin/quotes", label: "Quotes",      icon: "quotes"                            },
    ],
  },
  {
    label: "Supplier",
    icon: "suppliers",
    accent: "emerald",
    dot: "bg-emerald-400",
    items: [
      { path: "/admin/suppliers",    label: "All Suppliers", icon: "suppliers", badgeKey: "pendingSuppliers" },
      { path: "/admin/leads",        label: "Lead Market",   icon: "leads"                                   },
      { path: "/admin/subscription", label: "Subscriptions", icon: "star"                                    },
    ],
  },
  {
    label: "Admin",
    icon: "logs",
    accent: "violet",
    dot: "bg-violet-400",
    items: [
      { path: "/admin/disputes",    label: "Disputes",    icon: "disputes",    badgeKey: "disputes" },
      { path: "/admin/flow-health", label: "Flow Health", icon: "flowHealth"                       },
      { path: "/admin/logs",        label: "Admin Logs",  icon: "logs"                             },
      { path: "/admin/chat",        label: "Chat",        icon: "chat"                             },
      { path: "/admin/profile",     label: "Profile",     icon: "profile"                          },
      { path: "/admin/settings",    label: "Settings",    icon: "settings"                         },
    ],
  },
];

const ACCENT = {
  blue:    { activeBg: "bg-blue-50 border-blue-200",       activeText: "text-blue-700",    pill: "bg-blue-400",    hover: "hover:bg-blue-50/60 hover:text-blue-700"    },
  emerald: { activeBg: "bg-emerald-50 border-emerald-200", activeText: "text-emerald-700", pill: "bg-emerald-400", hover: "hover:bg-emerald-50/60 hover:text-emerald-700" },
  violet:  { activeBg: "bg-violet-50 border-violet-200",   activeText: "text-violet-700",  pill: "bg-violet-400",  hover: "hover:bg-violet-50/60 hover:text-violet-700"  },
};

const NOTIFS = [
  { text: "3 buyers pending verification", time: "5m ago", unread: true, c: "bg-amber-500" },
  { text: "New dispute raised — SupplierX", time: "20m ago", unread: true, c: "bg-red-500" },
  { text: "RFQ-009 needs clarification", time: "1h ago", unread: true, c: "bg-blue-500" },
  { text: "Platform health check passed", time: "3h ago", unread: false, c: "bg-emerald-500" },
];

function NavGroup({ group, activePath, collapsed, navigate, liveBadges }) {
  const hasActive = group.items.some(i => activePath === i.path || (i.path !== "/admin/dashboard" && activePath.startsWith(i.path)));
  const [open, setOpen] = useState(hasActive || !group.accent);
  const acc = group.accent ? ACCENT[group.accent] : null;
  const groupBadge = group.items.reduce((sum, i) => sum + (i.badgeKey ? liveBadges[i.badgeKey] || 0 : 0), 0);

  return (
    <div className="mb-1">
      {/* Group header button */}
      {!collapsed ? (
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-surface-2 transition-colors group mb-0.5">
          <div className="flex items-center gap-2">
            {group.dot && <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${group.dot}`} />}
            <span className={`text-[10px] font-black uppercase tracking-widest ${acc ? acc.activeText : "text-text-muted"}`}>
              {group.label}
            </span>
            {groupBadge > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black px-1 py-0.5 rounded-full animate-pulse min-w-[16px] text-center">
                {groupBadge}
              </span>
            )}
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
            <Icon d={ICONS.chevronDown} size={11} className="text-text-muted" />
          </motion.span>
        </button>
      ) : (
        group.dot && <div className="h-px bg-border mx-3 my-1.5" />
      )}

      {/* Items */}
      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            initial={collapsed ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden">
            <div className={`space-y-0.5 ${!collapsed && group.accent ? "pl-3 border-l-2 border-border ml-2.5" : ""}`}>
              {group.items.map(item => {
                const isActive = activePath === item.path || (item.path !== "/admin/dashboard" && activePath.startsWith(item.path));
                const badge = item.badgeKey ? (liveBadges[item.badgeKey] || 0) : 0;
                return (
                  <motion.button key={item.path}
                    onClick={() => navigate(item.path)}
                    whileHover={{ x: collapsed ? 0 : 2 }}
                    title={collapsed ? item.label : ""}
                    className={`w-full flex items-center gap-2.5 py-2 rounded-xl text-[13px] font-medium
                      transition-all relative
                      ${collapsed ? "justify-center px-0" : "px-2.5"}
                      ${isActive
                        ? acc ? `${acc.activeBg} ${acc.activeText} border` : "bg-primary/10 border border-primary/20 text-primary"
                        : `text-text-muted ${acc ? acc.hover : "hover:bg-surface-2 hover:text-text"}`}`}>
                    {isActive && (
                      <motion.div layoutId={`pill-${group.label}`}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full ${acc ? acc.pill : "bg-primary"}`} />
                    )}
                    <Icon d={ICONS[item.icon]} size={14} className="shrink-0" />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                    {!collapsed && badge > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 animate-pulse">
                        {badge}
                      </span>
                    )}
                    {collapsed && badge > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-surface" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [liveBadges, setLiveBadges] = useState({ rfqs:0, disputes:0, pendingBuyers:0, pendingSuppliers:0 });

  const loadBadges = useCallback(async () => {
    try {
      const res = await marketApi.getAdminOverview();
      const ov = res.data;
      setLiveBadges({
        rfqs:             (ov?.rfqs?.submitted||0)+(ov?.rfqs?.clarificationRequired||0),
        disputes:          ov?.suppliers?.pending||0,
        pendingBuyers:     ov?.buyers?.pendingVerification||0,
        pendingSuppliers:  ov?.suppliers?.pending||0,
      });
    } catch {}
  }, []);

  useEffect(() => { loadBadges(); const t = setInterval(loadBadges, 60000); return () => clearInterval(t); }, [loadBadges]);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const activePath = location.pathname;
  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const activeItem = allItems.find(n => n.path === activePath || (n.path !== "/admin/dashboard" && activePath.startsWith(n.path)));
  const activeLabel = activeItem?.label ?? "Dashboard";
  const activeGroup = NAV_GROUPS.find(g => g.items.includes(activeItem));
  const unreadCount = NOTIFS.filter(n => n.unread).length;
  const totalUrgent = Object.values(liveBadges).reduce((a, b) => a + b, 0);

  const adminUser = (() => { try { return JSON.parse(localStorage.getItem("cs_user")||"{}"); } catch { return {}; } })();
  const adminName    = adminUser?.name  || "Admin";
  const adminEmail   = adminUser?.email || "admin@platform.com";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("cs_user"); navigate("/login"); };

  return (
    <div className="flex h-screen bg-background text-text font-sans overflow-hidden">

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 252 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-surface text-text flex flex-col shrink-0 z-30 overflow-hidden border-r border-border">

        {/* Logo */}
        <div className="flex items-center gap-3 px-3.5 py-4 border-b border-border shrink-0 min-w-0">
          <button onClick={() => setCollapsed(c => !c)}
            className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md hover:bg-primary-hover transition-colors relative">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            {collapsed && totalUrgent > 0 && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border border-surface flex items-center justify-center">
                <span className="text-[7px] font-black text-white">{totalUrgent}</span>
              </div>
            )}
          </button>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-8 }} transition={{ duration:0.18 }} className="flex-1 min-w-0">
                <p className="text-[14px] font-black tracking-tight leading-none whitespace-nowrap">
                  Control<span className="text-primary">Source</span>
                </p>
                <p className="text-[9px] text-text-muted uppercase tracking-widest mt-0.5">Admin Panel</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && totalUrgent > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse shrink-0">
              {totalUrgent}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 pt-3 overflow-y-auto pb-3">
          {NAV_GROUPS.map(group => (
            <NavGroup key={group.label} group={group} activePath={activePath}
              collapsed={collapsed} navigate={navigate} liveBadges={liveBadges} />
          ))}
        </nav>

        {/* User */}
        <div className={`border-t border-border p-3 shrink-0 flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shrink-0">
            {adminInitial}
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div key="u" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text truncate leading-none">{adminName}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 truncate">{adminEmail}</p>
                </div>
                <button onClick={handleLogout}
                  className="text-text-muted hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-surface-2 shrink-0" title="Logout">
                  <Icon d={ICONS.logout} size={13} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="bg-surface border-b border-border px-5 py-3 flex items-center gap-4 shrink-0 z-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-text-muted">Admin</span>
            {activeGroup?.accent && (
              <>
                <Icon d={ICONS.chevronRight} size={10} className="text-text-muted" />
                <span className={`font-semibold ${ACCENT[activeGroup.accent]?.activeText}`}>{activeGroup.label}</span>
              </>
            )}
            <Icon d={ICONS.chevronRight} size={10} className="text-text-muted" />
            <span className="font-bold text-text">{activeLabel}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden md:block">
            <Icon d={ICONS.search} size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input placeholder="Search buyers, suppliers, RFQs…"
              className="w-56 pl-9 pr-4 py-1.5 bg-surface-2 border border-border rounded-xl text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
          </div>

          {/* Dark mode toggle */}
          <motion.button whileTap={{scale:0.92}} onClick={() => setDarkMode(d => !d)}
            className="p-2 rounded-xl hover:bg-surface-2 transition-colors text-text-muted">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={darkMode?"sun":"moon"}
                initial={{opacity:0,rotate:-30,scale:0.7}} animate={{opacity:1,rotate:0,scale:1}}
                exit={{opacity:0,rotate:30,scale:0.7}} transition={{duration:0.18}} className="block">
                <Icon d={darkMode ? ICONS.sun : ICONS.moon} size={16} />
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Notifications */}
          <div className="relative">
            <motion.button whileTap={{scale:0.92}} onClick={() => setNotifOpen(o => !o)}
              className="p-2 rounded-xl hover:bg-surface-2 transition-colors relative">
              <Icon d={ICONS.bell} size={16} className="text-text-muted" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface animate-pulse" />}
            </motion.button>
            <AnimatePresence>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <motion.div initial={{opacity:0,y:8,scale:0.96}} animate={{opacity:1,y:0,scale:1}}
                    exit={{opacity:0,y:8,scale:0.96}} transition={{duration:0.15}}
                    className="absolute right-0 top-11 w-76 bg-background border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <p className="text-sm font-black text-text">Notifications</p>
                      {unreadCount > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">{unreadCount} new</span>}
                    </div>
                    <div className="divide-y divide-border max-h-64 overflow-y-auto">
                      {NOTIFS.map((n, i) => (
                        <div key={i} className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface transition-colors ${n.unread?"bg-primary/5":""}`}>
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.c}`} />
                          <div className="flex-1">
                            <p className={`text-xs leading-relaxed ${n.unread?"font-semibold text-text":"text-text-muted"}`}>{n.text}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-border">
                      <button className="w-full text-xs font-bold text-primary hover:text-primary-hover py-1.5 rounded-lg hover:bg-primary/5 transition-colors">View all notifications</button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm">{adminInitial}</div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-text leading-none">{adminName}</p>
              <p className="text-[10px] text-text-muted">Administrator</p>
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
