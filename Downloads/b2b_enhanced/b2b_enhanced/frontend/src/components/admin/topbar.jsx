import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

const Icon = ({ d, size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ROUTE_LABELS = {
  "/admin/dashboard": "Dashboard",
  "/admin/buyers":    "Buyers",
  "/admin/suppliers": "Suppliers",
  "/admin/rfqs":      "RFQs",
  "/admin/leads":     "Leads",
  "/admin/quotes":    "Quotes",
  "/admin/disputes":  "Disputes",
  "/admin/logs":      "Admin Logs",
  "/admin/profile":   "Profile",
  "/admin/settings":  "Settings",
};

const NOTIFICATIONS = [
  { text: "New buyer awaiting verification", time: "2 min ago",  dot: "#d97706" },
  { text: "RFQ-2840 needs clarification",    time: "15 min ago", dot: "#dc2626" },
  { text: "Dispute D-103 opened",            time: "1 hr ago",   dot: "#dc2626" },
  { text: "Lead L-503 purchased",            time: "2 hr ago",   dot: "#16a34a" },
];

export default function Topbar() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const pageName = ROUTE_LABELS[location.pathname] || "Admin";

  return (
    <div style={{
      height: 58, background: "#ffffff", borderBottom: "1px solid #e5e0f7",
      display: "flex", alignItems: "center", padding: "0 24px",
      gap: 16, flexShrink: 0, position: "sticky", top: 0, zIndex: 10,
    }}>
      {/* Breadcrumb */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#6b6285" }}>Admin</span>
        <Icon d="M9 18l6-6-6-6" size={12} color="#6b6285" />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1033" }}>{pageName}</span>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" size={14} color="#6b6285" />
        </div>
        <input
          placeholder="Search anything…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: 240, padding: "7px 12px 7px 32px",
            border: "1px solid #e5e0f7", borderRadius: 8, fontSize: 13,
            color: "#1e1033", background: "#ffffff", fontFamily: "inherit", outline: "none",
          }}
        />
      </div>

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setNotifOpen(o => !o)} style={{
          background: "#f3f0ff", border: "1px solid #e5e0f7", borderRadius: 8,
          width: 36, height: 36, cursor: "pointer", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" size={16} color="#6b6285" />
          <div style={{
            position: "absolute", top: 7, right: 8, width: 7, height: 7,
            borderRadius: "50%", background: "#dc2626", border: "1.5px solid #fff",
          }} />
        </button>

        {notifOpen && (
          <div style={{
            position: "absolute", top: 44, right: 0, width: 300, background: "#fff",
            border: "1px solid #e5e0f7", borderRadius: 12,
            boxShadow: "0 8px 24px rgba(133,81,220,0.12)", zIndex: 100, overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: "1px solid #e5e0f7",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1e1033" }}>Notifications</span>
              <span style={{ fontSize: 11, color: "#8551dc", cursor: "pointer", fontWeight: 600 }}>Mark all read</span>
            </div>
            {NOTIFICATIONS.map((n, i) => (
              <div key={i}
                style={{
                  padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
                  cursor: "pointer", transition: "background 0.12s",
                  borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid #e5e0f7" : "none",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#faf9ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.dot, flexShrink: 0, marginTop: 4 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#1e1033", fontWeight: 500 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: "#6b6285", marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <Link to="/admin/profile" style={{ textDecoration: "none" }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%", cursor: "pointer",
          background: "linear-gradient(135deg, #8551dc, #7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>R</span>
        </div>
      </Link>
    </div>
  );
}