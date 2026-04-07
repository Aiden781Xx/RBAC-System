import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_SETTINGS_KEY = "cs_admin_settings";
const loadAdminSettings = () => {
  try { return JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY) || "{}"); } catch { return {}; }
};

const Toggle = ({ label, description, value, onChange }) => (
  <div className="flex justify-between items-center py-3.5 border-b border-border last:border-b-0">
    <div>
      <div className="text-sm font-semibold text-text">{label}</div>
      {description && <div className="text-xs text-text-muted mt-0.5">{description}</div>}
    </div>
    <motion.div
      onClick={onChange}
      whileTap={{ scale: 0.92 }}
      className={`w-11 h-6 rounded-full cursor-pointer relative shrink-0 transition-colors duration-200 ${value ? "bg-primary" : "bg-border"}`}
    >
      <motion.div
        animate={{ left: value ? 22 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.75 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
        style={{ position: "absolute" }}
      />
    </motion.div>
  </div>
);

const Field = ({ label, defaultValue, type = "text" }) => (
  <div>
    <label className="text-xs text-text-muted font-semibold block mb-1.5">{label}</label>
    <input
      defaultValue={defaultValue}
      type={type}
      className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-background font-[inherit] outline-none focus:border-primary transition-colors box-border"
    />
  </div>
);

const Section = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: "easeOut" }}
    className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm"
  >
    <div className="px-5 py-4 border-b border-border">
      <div className="font-bold text-text text-[15px]">{title}</div>
      {subtitle && <div className="text-xs text-text-muted mt-0.5">{subtitle}</div>}
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

export default function Settings() {
  const _saved = loadAdminSettings();
  const [saved, setSaved] = useState(false);
  const [flags, setFlags] = useState({
    requireDrawings: _saved.requireDrawings ?? true,
    rfqAutoReject:   _saved.rfqAutoReject   ?? false,
    allowIndianBulk: _saved.allowIndianBulk ?? true,
    exclusiveLeads:  _saved.exclusiveLeads  ?? true,
    emailOnBuyer:    _saved.emailOnBuyer    ?? true,
    emailOnDispute:  _saved.emailOnDispute  ?? true,
  });

  const toggle = key => setFlags(f => ({ ...f, [key]: !f[key] }));

  const handleSave = () => {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(flags));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const DANGER_ITEMS = [
    { label: "Reset all SQI scores",   desc: "Resets all supplier SQI to default", btn: "Reset"  },
    { label: "Clear all pending RFQs", desc: "Deletes unvalidated RFQs in queue",  btn: "Clear"  },
    { label: "Export all data",         desc: "Download full platform data as CSV", btn: "Export" },
  ];

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
          <h1 className="text-2xl font-extrabold text-text m-0">Settings</h1>
          <p className="text-sm text-text-muted mt-1">Configure platform-wide operational rules and policies</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-5 py-2 border rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-200
            ${saved
              ? "bg-success text-white border-success"
              : "bg-primary hover:bg-primary-hover text-white border-primary"
            }`}
        >
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                ✓ Saved!
              </motion.span>
            ) : (
              <motion.span
                key="unsaved"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                Save All Changes
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Grid */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>

        {/* Lead Pricing */}
        <Section title="Lead Pricing" subtitle="Control how leads are priced and distributed" delay={0.08}>
          <div className="flex flex-col gap-4">
            <Field label="Base Lead Price (₹)"          defaultValue="4500" type="number" />
            <Field label="Exclusive Lead Premium (%)"   defaultValue="40"   type="number" />
            <Field label="Max Suppliers per Open RFQ"   defaultValue="4"    type="number" />
            <Field label="Max Suppliers per Exclusive"  defaultValue="1"    type="number" />
          </div>
        </Section>

        {/* Buyer Rules */}
        <Section title="Buyer Rules" subtitle="Restrictions and verification controls" delay={0.13}>
          <div className="flex flex-col gap-4">
            <Field label="Max RFQs per Buyer / Month"       defaultValue="10" type="number" />
            <Field label="Misuse Threshold (auto-restrict)" defaultValue="3"  type="number" />
            <Field label="Allowed Buyer Countries"          defaultValue="India, USA, Germany, Australia, UK" />
            <div>
              <label className="text-xs text-text-muted font-semibold block mb-1.5">Default Buyer State on Registration</label>
              <select
                defaultValue="pending_verification"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text bg-background font-[inherit] outline-none cursor-pointer focus:border-primary transition-colors"
              >
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Auto-Verified</option>
              </select>
            </div>
          </div>
        </Section>

        {/* SQI Thresholds */}
        <Section title="SQI Score Thresholds" subtitle="Score bands for supplier tiers" delay={0.18}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bronze Min"   defaultValue="0"  type="number" />
              <Field label="Silver Min"   defaultValue="50" type="number" />
              <Field label="Gold Min"     defaultValue="70" type="number" />
              <Field label="Platinum Min" defaultValue="85" type="number" />
            </div>
            <Field label="SQI Review Frequency (days)" defaultValue="30" type="number" />
          </div>
        </Section>

        {/* RFQ Rules */}
        <Section title="RFQ Rules" subtitle="Validation and hard-stop controls" delay={0.23}>
          <div className="pt-1">
            <Toggle label="Require drawings or design file"       description="RFQ blocked without attachment"           value={flags.requireDrawings} onChange={() => toggle("requireDrawings")} />
            <Toggle label="Auto-reject RFQs with no budget"       description="Hard stop on missing budget range"        value={flags.rfqAutoReject}    onChange={() => toggle("rfqAutoReject")} />
            <Toggle label="Allow Indian bulk buyers"              description="Domestic bulk orders enabled"             value={flags.allowIndianBulk}  onChange={() => toggle("allowIndianBulk")} />
            <Toggle label="Enable exclusive leads"                description="Admins can grant single-supplier access"  value={flags.exclusiveLeads}   onChange={() => toggle("exclusiveLeads")} />
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Email Notifications" subtitle="Trigger emails on key admin events" delay={0.28}>
          <div className="pt-1">
            <Toggle label="Email on new buyer registration" value={flags.emailOnBuyer}   onChange={() => toggle("emailOnBuyer")} />
            <Toggle label="Email on dispute opened"         value={flags.emailOnDispute} onChange={() => toggle("emailOnDispute")} />
          </div>
          <div className="mt-4">
            <Field label="Admin Notification Email" defaultValue="admin@platform.com" />
          </div>
        </Section>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.33, ease: "easeOut" }}
          className="bg-background border border-danger/30 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="px-5 py-4 border-b border-danger/20">
            <div className="font-bold text-danger text-[15px]">Danger Zone</div>
            <div className="text-xs text-text-muted mt-0.5">Irreversible platform actions</div>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {DANGER_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: 0.38 + i * 0.07 }}
                className="flex justify-between items-center px-4 py-3 bg-danger-soft border border-danger/20 rounded-xl"
              >
                <div>
                  <div className="text-sm font-semibold text-danger">{item.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-3.5 py-1.5 bg-danger hover:bg-danger/80 text-white border border-danger rounded-lg text-xs font-semibold cursor-pointer transition-colors duration-150"
                >
                  {item.btn}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}