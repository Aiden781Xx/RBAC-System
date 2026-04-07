// pages/buyer/settings.jsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  bell:    "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  lock:    "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  palette: "M12 2a10 10 0 110 20 10 10 0 010-20zM8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32",
  link:    "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  trash:   "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  eyeoff:  "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22",
  check:   "M20 6L9 17l-5-5",
  shield:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap:     "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  globe:   "M12 22a10 10 0 110-20 10 10 0 010 20zM2 12h20",
  mail:    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
};

const Toggle = ({ value, onChange }) => (
  <motion.button onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? "bg-primary" : "bg-surface-2"}`}>
    <motion.div
      animate={{ x: value ? 22 : 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
  </motion.button>
);

const Row = ({ label, desc, children }) => (
  <div className="flex items-center justify-between gap-6 py-4 border-b border-border last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-text">{label}</p>
      {desc && <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{desc}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SectionCard = ({ icon, title, children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface/50">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
        <Icon d={ICONS[icon]} size={15} />
      </div>
      <h3 className="font-bold text-text">{title}</h3>
    </div>
    <div className="px-6">{children}</div>
  </motion.div>
);

const TABS = ["Notifications", "Security", "Integrations", "Danger Zone"];

const STORAGE_KEY = "cs_buyer_settings";

const loadSettings = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
};

export default function BuyerSettings() {
  const saved_settings = loadSettings();
  const [tab, setTab] = useState("Notifications");
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const [notifs, setNotifs] = useState({
    emailQuotes: saved_settings.notifs?.emailQuotes ?? true,
    emailRFQ: saved_settings.notifs?.emailRFQ ?? true,
    emailOrders: saved_settings.notifs?.emailOrders ?? false,
    pushQuotes: saved_settings.notifs?.pushQuotes ?? true,
    pushMessages: saved_settings.notifs?.pushMessages ?? true,
    pushDeadlines: saved_settings.notifs?.pushDeadlines ?? true,
    weeklyReport: saved_settings.notifs?.weeklyReport ?? false,
    marketingEmails: saved_settings.notifs?.marketingEmails ?? false,
  });

  const [security, setSecurity] = useState({
    twoFactor: saved_settings.security?.twoFactor ?? false,
    sessionAlert: saved_settings.security?.sessionAlert ?? true,
    loginHistory: saved_settings.security?.loginHistory ?? true,
  });

  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });

  const [appearance, setAppearance] = useState({
    theme: saved_settings.appearance?.theme || (localStorage.getItem("theme") || "light"),
    density: saved_settings.appearance?.density || "Comfortable",
    language: saved_settings.appearance?.language || "English",
    timezone: saved_settings.appearance?.timezone || "Asia/Kolkata",
  });

  const [integrations, setIntegrations] = useState({
    slack: saved_settings.integrations?.slack ?? false,
    hubspot: saved_settings.integrations?.hubspot ?? false,
    quickbooks: saved_settings.integrations?.quickbooks ?? false,
    zapier: saved_settings.integrations?.zapier ?? false,
  });

  const setN   = k => v => setNotifs(p => ({ ...p, [k]: v }));
  const setSec = k => v => setSecurity(p => ({ ...p, [k]: v }));
  const setInt = k => v => setIntegrations(p => ({ ...p, [k]: v }));

  const save = () => {
    // Persist to localStorage
    const settings = { notifs, security, appearance, integrations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Apply theme immediately
    if (appearance.theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const savePassword = () => {
    setPwError("");
    if (!pwForm.current) { setPwError("Current password is required"); return; }
    if (pwForm.newPw.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
    // In real app: call API to change password
    setPwSaved(true);
    setPwForm({ current: "", newPw: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

  {/* Header */}
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-black text-text">Settings</h1>
      <p className="text-sm text-text-muted mt-0.5">Manage your account preferences</p>
    </div>
    <AnimatePresence>
      {saved && (
        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-xs font-bold text-success
            bg-success-soft border border-success/20 px-3 py-1.5 rounded-lg">
          <Icon d={ICONS.check} size={13} /> Changes saved
        </motion.span>
      )}
    </AnimatePresence>
  </motion.div>

  {/* Tab Pills */}
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
    className="flex gap-1.5 overflow-x-auto pb-1">
    {TABS.map(t => (
      <button key={t} onClick={() => setTab(t)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all
          ${tab === t
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : "bg-background text-text-muted border border-border hover:border-primary/40 hover:text-primary"}`}>
        {t}
      </button>
    ))}
  </motion.div>

  <AnimatePresence mode="wait">
    <motion.div key={tab}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
      className="space-y-4">

      {/* ── Notifications ── */}
      {tab === "Notifications" && (
        <>
          <SectionCard icon="mail" title="Email Notifications" delay={0}>
            <Row label="New Quotes Received" desc="Get emailed when suppliers submit new quotes.">
              <Toggle value={notifs.emailQuotes} onChange={setN("emailQuotes")} />
            </Row>
            <Row label="RFQ Status Updates" desc="Notifications when your RFQ status changes.">
              <Toggle value={notifs.emailRFQ} onChange={setN("emailRFQ")} />
            </Row>
            <Row label="Order Updates" desc="Email alerts for order status changes.">
              <Toggle value={notifs.emailOrders} onChange={setN("emailOrders")} />
            </Row>
            <Row label="Weekly Summary Report" desc="A weekly digest of your sourcing activity.">
              <Toggle value={notifs.weeklyReport} onChange={setN("weeklyReport")} />
            </Row>
            <Row label="Marketing Emails" desc="Product updates, tips, and ControlSource news.">
              <Toggle value={notifs.marketingEmails} onChange={setN("marketingEmails")} />
            </Row>
          </SectionCard>
          <SectionCard icon="bell" title="Push Notifications" delay={0.05}>
            <Row label="New Quotes" desc="Push alerts when new quotes arrive.">
              <Toggle value={notifs.pushQuotes} onChange={setN("pushQuotes")} />
            </Row>
            <Row label="New Messages" desc="Alerts for new supplier messages.">
              <Toggle value={notifs.pushMessages} onChange={setN("pushMessages")} />
            </Row>
            <Row label="Deadline Reminders" desc="Reminders 24h before RFQ deadlines.">
              <Toggle value={notifs.pushDeadlines} onChange={setN("pushDeadlines")} />
            </Row>
          </SectionCard>
          <div className="flex justify-end">
            <button onClick={save}
              className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20">
              Save Preferences
            </button>
          </div>
        </>
      )}

      {/* ── Security ── */}
      {tab === "Security" && (
        <>
          <SectionCard icon="shield" title="Account Security" delay={0}>
            <Row label="Two-Factor Authentication" desc="Add extra security with 2FA via authenticator app.">
              <Toggle value={security.twoFactor} onChange={setSec("twoFactor")} />
            </Row>
            <Row label="Login Activity Alerts" desc="Get notified on new device logins.">
              <Toggle value={security.sessionAlert} onChange={setSec("sessionAlert")} />
            </Row>
            <Row label="Login History" desc="Keep a history of recent login sessions.">
              <Toggle value={security.loginHistory} onChange={setSec("loginHistory")} />
            </Row>
          </SectionCard>

          <SectionCard icon="lock" title="Change Password" delay={0.05}>
            <div className="space-y-4 py-4">
              {[
                { label: "Current Password", key: "current" },
                { label: "New Password",     key: "newPw"   },
                { label: "Confirm Password", key: "confirm" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    {f.label}
                  </label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"}
                      value={pwForm[f.key]}
                      onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-surface border border-border rounded-xl
                        text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20
                        focus:border-primary transition" />
                    {f.key === "current" && (
                      <button onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                        <Icon d={showPw ? ICONS.eyeoff : ICONS.eye} size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {pwError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{pwError}</div>
              )}
              {pwSaved && (
                <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Password updated successfully</div>
              )}
              <button onClick={savePassword}
                className="bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20">
                Update Password
              </button>
            </div>
          </SectionCard>

          <SectionCard icon="globe" title="Active Sessions" delay={0.1}>
            {[
              { device: "MacBook Pro — Chrome", loc: "San Francisco, CA", time: "Current session", current: true  },
              { device: "iPhone 15 — Safari",   loc: "San Francisco, CA", time: "2 hours ago",     current: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted">
                  <Icon d={ICONS.globe} size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text">{s.device}</p>
                  <p className="text-xs text-text-muted">{s.loc} · {s.time}</p>
                </div>
                {s.current
                  ? <span className="text-xs font-bold text-success bg-success-soft px-2.5 py-1 rounded-full">Active</span>
                  : <button className="text-xs font-bold text-danger hover:text-danger px-2.5 py-1 rounded-lg hover:bg-danger/10 transition-colors">Revoke</button>
                }
              </div>
            ))}
          </SectionCard>
        </>
      )}


      {/* ── Integrations ── */}
      {tab === "Integrations" && (
        <SectionCard icon="link" title="Connected Apps" delay={0}>
          {[
            { key: "slack",      name: "Slack",      desc: "Get RFQ notifications in your Slack workspace.",     color: "bg-violet-100 text-violet-600", l: "S" },
            { key: "hubspot",    name: "HubSpot",    desc: "Sync supplier contacts and deals with HubSpot CRM.", color: "bg-orange-100 text-orange-600", l: "H" },
            { key: "quickbooks", name: "QuickBooks", desc: "Automatically sync orders and invoices.",            color: "bg-info/10 text-info",          l: "Q" },
            { key: "zapier",     name: "Zapier",     desc: "Connect with 3000+ apps via Zapier automations.",    color: "bg-warning/10 text-warning",    l: "Z" },
          ].map(app => (
            <div key={app.key} className="flex items-center gap-4 py-4 border-b border-border last:border-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${app.color}`}>
                {app.l}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text">{app.name}</p>
                <p className="text-xs text-text-muted leading-relaxed">{app.desc}</p>
              </div>
              <Toggle value={integrations[app.key]} onChange={setInt(app.key)} />
            </div>
          ))}
        </SectionCard>
      )}

      {/* ── Danger Zone ── */}
      {tab === "Danger Zone" && (
        <SectionCard icon="trash" title="Danger Zone" delay={0}>
          <div className="space-y-4 py-4">
            {[
              { label: "Export All Data",    desc: "Download a complete export of your account data.",                                                 btn: "Export Data",    cls: "border-border text-text hover:bg-surface"          },
              { label: "Deactivate Account", desc: "Temporarily disable your account. Your data is preserved and you can reactivate at any time.",     btn: "Deactivate",     cls: "border-warning/30 text-warning hover:bg-warning/10" },
              { label: "Delete Account",     desc: "Permanently delete your account and all associated data. This cannot be undone.",                  btn: "Delete Account", cls: "border-danger/30 text-danger hover:bg-danger/10"   },
            ].map((item, i) => (
              <div key={i}
                className={`flex items-center justify-between gap-6 p-4 rounded-xl border
                  ${i === 2 ? "border-danger/20 bg-danger/5" : "border-border bg-surface/50"}`}>
                <div>
                  <p className="text-sm font-bold text-text">{item.label}</p>
                  <p className="text-xs text-text-muted mt-0.5 leading-relaxed max-w-sm">{item.desc}</p>
                </div>
                <button className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors whitespace-nowrap ${item.cls}`}>
                  {item.btn}
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

    </motion.div>
  </AnimatePresence>
</div>
  );
}