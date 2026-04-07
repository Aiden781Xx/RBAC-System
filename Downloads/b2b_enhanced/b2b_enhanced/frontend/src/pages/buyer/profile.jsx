import { useEffect, useState } from "react";
import { marketApi } from "../../api/marketApi";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}><path d={d} /></svg>
);
const ICONS = {
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  save:     "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  phone:    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  building: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
  globe:    "M12 22a10 10 0 110-20 10 10 0 010 20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  rfq:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8",
  check:    "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
};

const STATUS_STYLE = {
  PENDING_VERIFICATION: "bg-amber-50 text-amber-700 border-amber-200",
  VERIFIED:             "bg-green-50 text-green-700 border-green-200",
  RESTRICTED:           "bg-red-50 text-red-700 border-red-200",
  BLACKLISTED:          "bg-red-100 text-red-800 border-red-300",
};

const Field = ({ label, value, editing, onChange, type = "text", placeholder }) => (
  <div>
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
    {editing ? (
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white transition" />
    ) : (
      <p className="text-sm text-slate-700 font-medium">{value || <span className="text-slate-300 italic">Not set</span>}</p>
    )}
  </div>
);

export default function BuyerProfile() {
  const [profile, setProfile]   = useState(null);
  const [rfqs, setRfqs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editing, setEditing]   = useState(false);
  const [toast, setToast]       = useState("");
  const [error, setError]       = useState("");
  const [form, setForm]         = useState({ exportIntent: false, purchaseAuthority: false });

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, rRes] = await Promise.allSettled([
        marketApi.getBuyerProfile(),
        marketApi.getBuyerRfqs(),
      ]);
      if (pRes.status === "fulfilled") {
        const p = pRes.value.data;
        setProfile(p);
        setForm({ exportIntent: p.exportIntent || false, purchaseAuthority: p.purchaseAuthority || false });
      }
      if (rRes.status === "fulfilled") setRfqs(Array.isArray(rRes.value.data) ? rRes.value.data : []);
    } catch { setError("Failed to load profile"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await marketApi.updateBuyerProfile(form);
      showToast("Profile updated successfully");
      setEditing(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const u = profile?.userId || {};
  const c = profile?.companyId || {};
  const stats = [
    { label: "Total RFQs",   val: rfqs.length,                                          icon: "rfq",   color: "text-blue-600"   },
    { label: "Confirmed",    val: rfqs.filter(r => r.state === "CONFIRMED").length,      icon: "check", color: "text-green-600"  },
    { label: "Pending",      val: rfqs.filter(r => ["SUBMITTED","UNDER_VALIDATION"].includes(r.state)).length, icon: "alert", color: "text-amber-600" },
    { label: "Misuse Flags", val: profile?.misuseCount || 0,                             icon: "lock",  color: (profile?.misuseCount || 0) > 0 ? "text-red-600" : "text-slate-400" },
  ];

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-semibold">
          ✓ {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Buyer account details and company info</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)}
                className="border border-slate-200 rounded-xl px-4 py-2 text-sm hover:bg-slate-50 text-slate-600 transition">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 bg-primary text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-primary-hover disabled:opacity-60 transition">
                <Icon d={ICONS.save} size={14} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-4 py-2 text-sm hover:bg-slate-50 text-slate-600 transition">
              <Icon d={ICONS.edit} size={14} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

      {/* Account Status Banner */}
      {profile?.buyerStatus && (
        <div className={`flex items-center gap-3 border rounded-2xl p-4 ${STATUS_STYLE[profile.buyerStatus] || "bg-slate-50 border-slate-200"}`}>
          <Icon d={profile.buyerStatus === "VERIFIED" ? ICONS.check : ICONS.alert} size={18} />
          <div>
            <p className="font-bold text-sm">Account Status: {profile.buyerStatus?.replace(/_/g, " ")}</p>
            {profile.buyerStatus === "PENDING_VERIFICATION" && (
              <p className="text-xs mt-0.5 opacity-80">Your account is pending admin verification. You can declare authorities while waiting.</p>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, val, icon, color }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
            <Icon d={ICONS[icon]} size={18} className={`mx-auto mb-2 ${color}`} />
            <p className={`text-2xl font-black ${color}`}>{val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Personal Info */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon d={ICONS.mail} size={15} className="text-slate-400" /> Contact Details
          </h3>
          <div className="space-y-4">
            <Field label="Full Name"  value={u.name}  editing={false} />
            <Field label="Email"      value={u.email} editing={false} />
            <Field label="Phone"      value={u.phone} editing={false} />
            <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${u.isEmailVerified ? "bg-green-500 border-green-500" : "border-slate-300"}`}>
                {u.isEmailVerified && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
              <span className="text-xs text-slate-500">Email {u.isEmailVerified ? "verified" : "not verified"}</span>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon d={ICONS.building} size={15} className="text-slate-400" /> Company Details
          </h3>
          <div className="space-y-4">
            <Field label="Company Name"        value={c.companyName}        editing={false} />
            <Field label="Country"             value={c.country}            editing={false} />
            <Field label="Registration Number" value={c.registrationNumber} editing={false} />
            <Field label="Website"             value={c.website}            editing={false} />
          </div>
        </div>

        {/* Platform Settings */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Icon d={ICONS.check} size={15} className="text-slate-400" /> Platform Declarations
          </h3>
          <div className="space-y-4">
            {[
              { key: "purchaseAuthority", label: "Purchase Authority", desc: "I have authority to make purchasing decisions for my company" },
              { key: "exportIntent",      label: "Export Intent",       desc: "We are looking to export sourced parts internationally" },
            ].map(({ key, label, desc }) => (
              <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                form[key] ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
              } ${!editing ? "cursor-default" : ""}`}>
                <div onClick={() => editing && setForm(f => ({ ...f, [key]: !f[key] }))}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    form[key] ? "bg-primary border-primary" : "border-slate-300"
                  }`}>
                  {form[key] && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${form[key] ? "text-primary" : "text-slate-700"}`}>{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Misuse Log */}
        {(profile?.misuseLogs?.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <Icon d={ICONS.alert} size={15} /> Misuse Flags ({profile.misuseCount})
            </h3>
            <div className="space-y-2">
              {profile.misuseLogs.map((log, i) => (
                <div key={i} className="bg-white border border-red-100 rounded-lg p-2.5">
                  <p className="text-xs text-red-700 font-medium">{log.reason}</p>
                  <p className="text-[10px] text-red-400 mt-0.5">{log.flaggedAt ? new Date(log.flaggedAt).toLocaleDateString() : "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Notes */}
      {profile?.adminNotes && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Admin Note</p>
          <p className="text-sm text-blue-800">{profile.adminNotes}</p>
        </div>
      )}
    </div>
  );
}
