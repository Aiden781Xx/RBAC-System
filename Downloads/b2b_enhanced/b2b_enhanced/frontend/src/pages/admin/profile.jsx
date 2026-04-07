import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Get real admin user from localStorage
const getAdminUser = () => {
  try { return JSON.parse(localStorage.getItem("cs_user") || "{}"); } catch { return {}; }
};

const Btn = ({ children, variant = "primary", onClick, fullWidth }) => {
  const styles = {
    primary: "bg-primary hover:bg-primary-hover text-white border-primary",
    outline: "bg-transparent hover:bg-primary/10 text-primary border-border",
    ghost:   "bg-transparent hover:bg-surface text-text-muted border-transparent",
    danger:  "bg-danger hover:bg-danger/80 text-white border-danger",
  }[variant] || "";
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${styles} ${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-1.5 px-4 py-2 border rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-150`}
    >
      {children}
    </motion.button>
  );
};

const Field = ({ label, value, type = "text", editMode, defaultValue }) => (
  <div>
    <label className="text-[11px] text-text-muted font-bold uppercase tracking-wider block mb-1.5">{label}</label>
    {editMode
      ? <input
          defaultValue={defaultValue || value}
          type={type}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-background font-[inherit] outline-none focus:border-primary transition-colors box-border"
        />
      : <div className="text-sm font-semibold text-text">{value}</div>
    }
  </div>
);

const RECENT = [
  { action: "Verified buyer Acme Exports",    time: "Mar 5, 10:42 AM",  dotClass: "bg-primary"   },
  { action: "Confirmed RFQ-2841",             time: "Mar 5, 10:30 AM",  dotClass: "bg-accent"    },
  { action: "Rejected RFQ-2836",             time: "Feb 27, 11:20 AM", dotClass: "bg-danger"    },
  { action: "Restricted buyer Sharma & Sons", time: "Feb 26, 04:15 PM", dotClass: "bg-danger"    },
  { action: "Updated max suppliers RFQ-2837", time: "Feb 24, 09:00 AM", dotClass: "bg-accent"    },
];

const ACTIVITY = [
  { label: "Actions This Month", val: "47", colorClass: "text-primary"   },
  { label: "Buyers Verified",    val: "12", colorClass: "text-success"   },
  { label: "RFQs Reviewed",      val: "28", colorClass: "text-accent"    },
  { label: "Disputes Resolved",  val: "3",  colorClass: "text-danger"    },
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-background border border-border rounded-2xl overflow-hidden shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, action }) => (
  <div className="px-5 py-4 border-b border-border flex justify-between items-center">
    <div>
      <div className="font-bold text-text text-[15px]">{title}</div>
      {subtitle && <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>}
    </div>
    {action}
  </div>
);

export default function Profile() {
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const adminUser = getAdminUser();
  const adminName = adminUser?.name || "Admin";
  const adminEmail = adminUser?.email || "admin@platform.com";
  const adminInitial = adminName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cs_user");
    navigate("/login");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex justify-between items-start flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-text m-0">Profile</h1>
          <p className="text-sm text-text-muted mt-1">Your admin account details and activity</p>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "280px 1fr", alignItems: "start" }}>

        {/* Left column */}
        <div className="flex flex-col gap-4">

          {/* Avatar card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <Card>
              <div className="p-7 text-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
                  className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-primary-hover flex items-center justify-center mx-auto mb-4 text-3xl text-white font-extrabold shadow-lg"
                >
                  {adminInitial}
                </motion.div>
                <div className="text-xl font-extrabold text-text">{adminName}</div>
                <div className="text-sm text-text-muted mt-1 mb-3">{adminEmail}</div>
                <span className="bg-primary/10 text-primary-hover border border-primary/30 rounded-full px-3 py-0.5 text-xs font-semibold">
                  Super Admin
                </span>
                <div className="mt-5 flex flex-col gap-2">
                  <Btn variant="outline" fullWidth onClick={handleLogout}>Sign Out</Btn>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Activity stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: "easeOut" }}
          >
            <Card>
              <CardHeader title="Your Activity" />
              <div>
                {ACTIVITY.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.25 + i * 0.06 }}
                    className={`flex justify-between items-center px-5 py-3 ${i < ACTIVITY.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <span className="text-sm text-text-muted">{s.label}</span>
                    <span className={`font-extrabold text-[15px] ${s.colorClass}`}>{s.val}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Account details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
          >
            <Card>
              <CardHeader
                title="Account Details"
                action={!editMode && <Btn variant="outline" onClick={() => setEditMode(true)}>Edit</Btn>}
              />
              <div className="p-6 grid grid-cols-2 gap-5">
                <Field label="Full Name"    value={adminName}        editMode={editMode} />
                <Field label="Email"        value={adminEmail}   editMode={editMode} />
                <Field label="Phone"        value="—"       editMode={editMode} />
                <Field label="Role"         value="Administrator"          editMode={editMode} />
                <Field label="Organisation" value="ControlSource Platform" editMode={editMode} />
                <Field label="Location"     value="—"     editMode={editMode} />
              </div>
              <AnimatePresence>
                {editMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-6 pb-6 flex gap-2 overflow-hidden"
                  >
                    <Btn onClick={() => setEditMode(false)}>Save Changes</Btn>
                    <Btn variant="outline" onClick={() => setEditMode(false)}>Cancel</Btn>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          >
            <Card>
              <CardHeader title="Security" subtitle="Manage your password" />
              <div className="p-6 flex flex-col gap-4">
                {["Current Password", "New Password", "Confirm Password"].map((label, i) => (
                  <div key={i}>
                    <label className="text-xs text-text-muted font-semibold block mb-1.5">{label}</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-background font-[inherit] outline-none focus:border-primary transition-colors box-border"
                    />
                  </div>
                ))}
                <div><Btn>Update Password</Btn></div>
              </div>
            </Card>
          </motion.div>

          {/* Recent actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28, ease: "easeOut" }}
          >
            <Card>
              <CardHeader title="Recent Actions" subtitle="Your last 5 admin actions" />
              <div className="py-1">
                {RECENT.map((a, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: 0.35 + i * 0.06 }}
                    className={`flex items-center gap-3 px-5 py-3 ${i < RECENT.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${a.dotClass}`} />
                    <div className="flex-1 text-sm font-medium text-text">{a.action}</div>
                    <div className="text-[11px] text-text-muted whitespace-nowrap">{a.time}</div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}