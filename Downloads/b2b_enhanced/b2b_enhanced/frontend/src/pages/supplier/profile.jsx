import { useEffect, useState, useCallback } from "react";
import { marketApi } from "../../api/marketApi";

const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}><path d={d} /></svg>
);
const ICONS = {
  edit:  "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  save:  "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8",
  check: "M20 6L9 17l-5-5",
  star:  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  lock:  "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  factory: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  cert:  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  plus:  "M12 5v14 M5 12h14",
  x:     "M18 6L6 18 M6 6l12 12",
};

const PROCESS_TYPES = ["MACHINING","CASTING","SHEET_METAL","FORGING","FABRICATION","INJECTION_MOULDING","OTHER"];

const levelStyles = {
  PLATINUM: { bar: "bg-purple-500", badge: "bg-purple-50 text-purple-700 border-purple-200", label: "💎 Platinum" },
  GOLD:     { bar: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "🥇 Gold"     },
  SILVER:   { bar: "bg-blue-400",   badge: "bg-blue-50 text-blue-700 border-blue-200",       label: "🥈 Silver"   },
  BRONZE:   { bar: "bg-orange-400", badge: "bg-orange-50 text-orange-600 border-orange-200", label: "🥉 Bronze"   },
};

const statusStyles = {
  APPROVED:          "bg-green-50 text-green-700 border-green-200",
  DOCUMENTS_PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW:      "bg-blue-50 text-blue-700 border-blue-200",
  RESTRICTED:        "bg-red-50 text-red-700 border-red-200",
  BLACKLISTED:       "bg-red-100 text-red-800 border-red-300",
};

export default function SupplierProfile() {
  const [supplier, setSupplier] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [error,    setError]    = useState("");
  const [toast,    setToast]    = useState("");

  // Edit form state
  const [form, setForm] = useState({
    capabilities: { processTypes: [], toleranceRange: "", machineList: [] },
    exportExperience: { years: 0 },
    adminNotes: "",
  });

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getSupplierProfile();
      const s = res.data;
      setSupplier(s);
      setForm({
        capabilities: {
          processTypes: s.capabilities?.processTypes || [],
          toleranceRange: s.capabilities?.toleranceRange || "",
          machineList: s.capabilities?.machineList || [],
        },
        exportExperience: { years: s.exportExperience?.years || 0 },
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load profile");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await marketApi.updateSupplierProfile({ capabilities: form.capabilities, exportExperience: form.exportExperience });
      showToast("Profile updated successfully");
      setEditing(false);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update profile. Profile may be locked after approval.");
    } finally { setSaving(false); }
  };

  const toggleProcessType = (t) => {
    setForm(p => ({
      ...p,
      capabilities: {
        ...p.capabilities,
        processTypes: p.capabilities.processTypes.includes(t)
          ? p.capabilities.processTypes.filter(x => x !== t)
          : [...p.capabilities.processTypes, t],
      },
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!supplier) return (
    <div className="p-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">{error}</div>}
    </div>
  );

  const sqi    = supplier.SQI || {};
  const access = supplier.leadAccess || {};
  const perf   = supplier.performance || {};
  const lvlCfg = levelStyles[sqi.level] || levelStyles.BRONZE;
  const statusCls = statusStyles[supplier.supplierStatus] || "bg-gray-100 text-gray-700 border-gray-200";
  const isApproved = supplier.supplierStatus === "APPROVED";

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-semibold flex items-center gap-2">
          <Icon d={ICONS.check} size={13} className="text-white" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Supplier Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your factory profile and capabilities</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`border rounded-full px-3 py-1 text-xs font-bold ${statusCls}`}>
            {supplier.supplierStatus?.replace(/_/g, " ")}
          </span>
          {editing ? (
            <>
              <button onClick={() => { setEditing(false); setError(""); }}
                className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-600">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 bg-primary text-white rounded-xl px-4 py-1.5 text-sm font-semibold hover:bg-primary-hover disabled:opacity-60 transition">
                <Icon d={ICONS.save} size={13} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-600">
              <Icon d={ICONS.edit} size={13} />
              {isApproved ? "Edit Profile" : "Update Info"}
            </button>
          )}
        </div>
      </div>

      {isApproved && editing && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          ⚠️ Note: Approved supplier profiles have limited editable fields. Contact admin for major changes.
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

      {supplier.supplierStatus === "DOCUMENTS_PENDING" && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <h3 className="font-bold text-amber-900">⏳ Awaiting Admin Approval</h3>
          <p className="text-sm text-amber-700 mt-1">Your profile is under review. Ensure your capabilities are complete below.</p>
        </div>
      )}

      {/* SQI Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Icon d={ICONS.star} size={15} className="text-yellow-500" /> Supplier Quality Index
          </h3>
          <span className={`border rounded-full px-2.5 py-0.5 text-[11px] font-bold ${lvlCfg.badge}`}>
            {lvlCfg.label}
          </span>
        </div>
        <div className="flex items-end gap-4 mb-4">
          <div className="text-center">
            <p className="text-5xl font-black text-primary">{sqi.score || 0}</p>
            <p className="text-xs text-gray-400">/ 100</p>
          </div>
          <div className="flex-1">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${lvlCfg.bar}`} style={{ width: `${sqi.score || 0}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{sqi.score >= 85 ? "Excellent" : sqi.score >= 70 ? "Good" : sqi.score >= 50 ? "Average" : "Needs improvement"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Certifications",  val: sqi.components?.certifications || 0,    weight: "30%", color: "bg-blue-400"  },
            { label: "Process Cap.",    val: sqi.components?.processCapability || 0,  weight: "25%", color: "bg-violet-400"},
            { label: "Export Maturity", val: sqi.components?.exportMaturity || 0,     weight: "25%", color: "bg-cyan-400"  },
            { label: "Performance",     val: sqi.components?.platformPerformance || 0,weight: "20%", color: "bg-green-400" },
          ].map(({ label, val, weight, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
                <span className="text-xs font-bold text-gray-700">{val}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }} />
              </div>
              <p className="text-[9px] text-gray-400 mt-1">Weight: {weight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Icon d={ICONS.factory} size={15} className="text-gray-400" /> Manufacturing Capabilities
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Process Types</label>
            <div className="flex flex-wrap gap-2">
              {PROCESS_TYPES.map(t => {
                const active = editing
                  ? form.capabilities.processTypes.includes(t)
                  : (supplier.capabilities?.processTypes || []).includes(t);
                return (
                  <button key={t} type="button"
                    onClick={() => editing && toggleProcessType(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? "bg-primary text-white border-primary"
                        : editing
                          ? "border-gray-200 text-gray-500 hover:border-primary/40 hover:text-primary"
                          : "border-gray-200 text-gray-400"
                    } ${editing ? "cursor-pointer" : "cursor-default"}`}>
                    {t.replace(/_/g, " ")}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Tolerance Range</label>
            {editing ? (
              <input value={form.capabilities.toleranceRange}
                onChange={e => setForm(p => ({ ...p, capabilities: { ...p.capabilities, toleranceRange: e.target.value } }))}
                placeholder="e.g. ±0.01mm"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            ) : (
              <p className="text-sm text-gray-700">{supplier.capabilities?.toleranceRange || <span className="text-gray-400 italic">Not specified</span>}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Export Experience</label>
            {editing ? (
              <div className="flex items-center gap-3">
                <input type="number" min={0} max={50}
                  value={form.exportExperience.years}
                  onChange={e => setForm(p => ({ ...p, exportExperience: { years: Number(e.target.value) } }))}
                  className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <span className="text-sm text-gray-500">years of export experience</span>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                {(supplier.exportExperience?.years || 0)} year{(supplier.exportExperience?.years || 0) !== 1 ? "s" : ""}
                {supplier.exportExperience?.countries?.length ? ` · Countries: ${supplier.exportExperience.countries.join(", ")}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Certifications */}
      {supplier.certifications?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Icon d={ICONS.cert} size={15} className="text-gray-400" /> Certifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {supplier.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                <Icon d={ICONS.cert} size={13} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-green-800">{cert.name}</p>
                  {cert.issuedBy && <p className="text-[10px] text-green-600">{cert.issuedBy}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Access & Performance */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Icon d={ICONS.lock} size={15} className="text-gray-400" /> Lead Access
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Daily Limit",       val: access.dailyLimit || 3         },
              { label: "Used Today",        val: access.usedToday || 0          },
              { label: "Total Purchased",   val: access.totalLeadsPurchased || 0},
              { label: "Quotes Submitted",  val: access.totalQuotesSubmitted || 0},
              { label: "Deals Converted",   val: access.totalLeadsConverted || 0 },
              { label: "Exclusive Access",  val: access.exclusive ? "Yes" : "No" },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-bold text-gray-800">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Icon d={ICONS.star} size={15} className="text-gray-400" /> Performance
          </h3>
          <div className="space-y-2.5">
            {[
              { label: "Dispute Count",   val: perf.disputeCount || 0,          warn: (perf.disputeCount || 0) > 0 },
              { label: "Response Score",  val: perf.quoteSeriousnessScore || "—" },
              { label: "Buyer Feedback",  val: perf.buyerFeedbackScore || "—"   },
            ].map(({ label, val, warn }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                <span className={`text-sm font-bold ${warn ? "text-red-600" : "text-gray-800"}`}>{val}</span>
              </div>
            ))}
          </div>

          {perf.disputeCount > 0 && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-3">
              <p className="text-xs text-red-700 font-medium">⚠️ {perf.disputeCount} active dispute{perf.disputeCount > 1 ? "s" : ""}. Contact admin to resolve.</p>
            </div>
          )}

          {supplier.adminNotes && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Admin Note</p>
              <p className="text-xs text-blue-800">{supplier.adminNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
