import { useEffect, useMemo, useState } from "react";
import { marketApi } from "../../api/marketApi";

const statCardStyles = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    value: "text-blue-700",
  },
  green: {
    card: "bg-green-50 border-green-200",
    value: "text-green-700",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200",
    value: "text-yellow-700",
  },
  red: {
    card: "bg-red-50 border-red-200",
    value: "text-red-700",
  },
  purple: {
    card: "bg-purple-50 border-purple-200",
    value: "text-purple-700",
  },
};

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-green-50 text-green-700 border-green-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }[variant] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`${styles} border rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap`}>
      {children}
    </span>
  );
};

const statusBadge = (status) => {
  const map = {
    APPROVED: <Badge variant="success">APPROVED</Badge>,
    DOCUMENTS_PENDING: <Badge variant="warning">DOCS PENDING</Badge>,
    UNDER_REVIEW: <Badge variant="info">UNDER REVIEW</Badge>,
    RESTRICTED: <Badge variant="danger">RESTRICTED</Badge>,
    BLACKLISTED: <Badge variant="danger">BLACKLISTED</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
};

const sqiBadge = (level) => {
  const map = {
    PLATINUM: <Badge variant="purple">Platinum</Badge>,
    GOLD: <Badge variant="warning">Gold</Badge>,
    SILVER: <Badge variant="info">Silver</Badge>,
    BRONZE: <Badge>Bronze</Badge>,
  };
  return map[level] || <Badge>{level}</Badge>;
};

const SQIModal = ({ supplier, onClose, onSave }) => {
  const comps = supplier?.SQI?.components || {};
  const [form, setForm] = useState({
    certifications: comps.certifications || 0,
    processCapability: comps.processCapability || 0,
    exportMaturity: comps.exportMaturity || 0,
    platformPerformance: comps.platformPerformance || 0,
    adminNotes: supplier?.adminNotes || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preview = Math.round(
    form.certifications * 0.3 +
    form.processCapability * 0.25 +
    form.exportMaturity * 0.25 +
    form.platformPerformance * 0.2
  );

  const getLevel = (s) => s >= 85 ? "PLATINUM" : s >= 70 ? "GOLD" : s >= 50 ? "SILVER" : "BRONZE";

  const onSubmit = async () => {
    setLoading(true); setError("");
    try {
      await marketApi.setSupplierSQI(supplier._id, {
        certifications: Number(form.certifications),
        processCapability: Number(form.processCapability),
        exportMaturity: Number(form.exportMaturity),
        platformPerformance: Number(form.platformPerformance),
        adminNotes: form.adminNotes,
      });
      onSave();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update SQI");
    } finally { setLoading(false); }
  };

  const field = (label, key, weight) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label} <span className="text-gray-400 text-xs">({weight}% weight)</span>
      </label>
      <input
        type="number" min={0} max={100}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form[key]}
        onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-1">Set SQI Score</h2>
        <p className="text-sm text-gray-500 mb-4">
          {supplier?.userId?.name || "Supplier"} — {supplier?.userId?.email}
        </p>
        <div className="space-y-3">
          {field("Certifications", "certifications", 30)}
          {field("Process Capability", "processCapability", 25)}
          {field("Export Maturity", "exportMaturity", 25)}
          {field("Platform Performance", "platformPerformance", 20)}
          <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-700">Preview Score</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-700">{preview}</span>
              <span className="text-xs text-blue-500">{getLevel(preview)}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Admin Notes</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={form.adminNotes}
              onChange={(e) => setForm(p => ({ ...p, adminNotes: e.target.value }))}
              placeholder="Internal notes..."
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
          <button onClick={onSubmit} disabled={loading} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save SQI"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SupplierDetailModal = ({ supplier, onClose, onAction, loading, error }) => {
  if (!supplier) return null;
  const s = supplier;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{s.userId?.name || "Supplier"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{s.userId?.email}</span></div>
            <div><span className="text-gray-500">Status:</span> {statusBadge(s.supplierStatus)}</div>
            <div><span className="text-gray-500">Company:</span> <span className="font-medium">{s.companyId?.companyName || "—"}</span></div>
            <div><span className="text-gray-500">Country:</span> <span className="font-medium">{s.companyId?.country || "—"}</span></div>
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold mb-2 text-gray-700">SQI Score</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-600">{s.SQI?.score ?? 0}</span>
                {sqiBadge(s.SQI?.level)}
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                <span>Certifications: {s.SQI?.components?.certifications ?? 0}</span>
                <span>Process: {s.SQI?.components?.processCapability ?? 0}</span>
                <span>Export: {s.SQI?.components?.exportMaturity ?? 0}</span>
                <span>Performance: {s.SQI?.components?.platformPerformance ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold mb-2 text-gray-700">Capabilities</p>
            <div className="flex flex-wrap gap-1">
              {(s.capabilities?.processTypes || []).map(p => (
                <Badge key={p} variant="info">{p}</Badge>
              ))}
            </div>
            {s.capabilities?.toleranceRange && (
              <p className="text-xs text-gray-500 mt-1">Tolerance: {s.capabilities.toleranceRange}</p>
            )}
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold mb-2 text-gray-700">Certifications</p>
            {(s.certifications || []).length === 0
              ? <p className="text-gray-400 text-xs">None listed</p>
              : (s.certifications || []).map((c, i) => (
                  <div key={i} className="text-xs text-gray-600">• {c.name} {c.issuedBy ? `(${c.issuedBy})` : ""}</div>
                ))}
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold mb-2 text-gray-700">Lead Access</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <span>Daily Limit: {s.leadAccess?.dailyLimit ?? 3}</span>
              <span>Used Today: {s.leadAccess?.usedToday ?? 0}</span>
              <span>Total Purchased: {s.leadAccess?.totalLeadsPurchased ?? 0}</span>
              <span>Conversion Rate: {((s.leadAccess?.conversionRate || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>

          {s.adminNotes && (
            <div className="border-t pt-3">
              <p className="font-semibold mb-1 text-gray-700">Admin Notes</p>
              <p className="text-xs text-gray-600 bg-yellow-50 rounded p-2">{s.adminNotes}</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="flex gap-2 mt-5 flex-wrap">
          {s.supplierStatus !== "APPROVED" && (
            <button
              onClick={() => onAction("approve")}
              disabled={loading}
              className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "..." : "✓ Approve"}
            </button>
          )}
          {s.supplierStatus !== "RESTRICTED" && (
            <button
              onClick={() => onAction("restrict")}
              disabled={loading}
              className="flex-1 bg-yellow-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50"
            >
              {loading ? "..." : "⚠ Restrict"}
            </button>
          )}
          {s.supplierStatus === "RESTRICTED" && (
            <button
              onClick={() => onAction("approve")}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "..." : "↺ Reinstate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [sqiTarget, setSqiTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getAdminSuppliers({ limit: 100 });
      setSuppliers(res.data?.suppliers || res.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load suppliers");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (action) => {
    setActionLoading(true); setActionError("");
    try {
      if (action === "approve") {
        await marketApi.approveSupplier(selected._id);
        showToast("Supplier approved successfully");
      } else if (action === "restrict") {
        await marketApi.restrictSupplier(selected._id, { reason: "Admin restriction" });
        showToast("Supplier restricted");
      }
      setSelected(null);
      await load();
    } catch (e) {
      setActionError(e?.response?.data?.message || `Failed to ${action} supplier`);
    } finally { setActionLoading(false); }
  };

  const filtered = useMemo(() => {
    let list = suppliers;
    if (filter === "approved") list = list.filter(s => s.supplierStatus === "APPROVED");
    else if (filter === "pending") list = list.filter(s => ["DOCUMENTS_PENDING", "UNDER_REVIEW"].includes(s.supplierStatus));
    else if (filter === "restricted") list = list.filter(s => ["RESTRICTED", "BLACKLISTED"].includes(s.supplierStatus));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        (s.userId?.name || "").toLowerCase().includes(q) ||
        (s.userId?.email || "").toLowerCase().includes(q) ||
        (s.companyId?.companyName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [suppliers, filter, search]);

  const stats = useMemo(() => ({
    total: suppliers.length,
    approved: suppliers.filter(s => s.supplierStatus === "APPROVED").length,
    pending: suppliers.filter(s => ["DOCUMENTS_PENDING", "UNDER_REVIEW"].includes(s.supplierStatus)).length,
    restricted: suppliers.filter(s => ["RESTRICTED", "BLACKLISTED"].includes(s.supplierStatus)).length,
    avgSQI: suppliers.length
      ? Math.round(suppliers.reduce((sum, s) => sum + (s.SQI?.score || 0), 0) / suppliers.length)
      : 0,
  }), [suppliers]);

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-sm text-gray-500 mt-1">Approve, restrict, and manage SQI scores</p>
        </div>
        <button onClick={load} disabled={loading} className="text-sm border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50">
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", val: stats.total, color: "blue" },
          { label: "Approved", val: stats.approved, color: "green" },
          { label: "Pending", val: stats.pending, color: "yellow" },
          { label: "Restricted", val: stats.restricted, color: "red" },
          { label: "Avg SQI", val: stats.avgSQI, color: "purple" },
        ].map(({ label, val, color }) => {
          const styles = statCardStyles[color];
          return (
            <div key={label} className={`border rounded-xl p-3 text-center ${styles.card}`}>
              <p className={`text-2xl font-bold ${styles.value}`}>{val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {["all", "approved", "pending", "restricted"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          placeholder="Search by name, email, company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["Supplier", "Company", "Status", "SQI Score", "SQI Level", "Leads Bought", "Process Types", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{s.userId?.name || "—"}</p>
                    <p className="text-xs text-gray-500">{s.userId?.email || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.companyId?.companyName || "—"}</p>
                    <p className="text-xs text-gray-500">{s.companyId?.country || "—"}</p>
                  </td>
                  <td className="px-4 py-3">{statusBadge(s.supplierStatus)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${(s.SQI?.score || 0) >= 70 ? "bg-green-500" : (s.SQI?.score || 0) >= 50 ? "bg-yellow-500" : "bg-red-400"}`}
                          style={{ width: `${s.SQI?.score || 0}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-700">{s.SQI?.score ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{sqiBadge(s.SQI?.level)}</td>
                  <td className="px-4 py-3 text-gray-700">{s.leadAccess?.totalLeadsPurchased ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(s.capabilities?.processTypes || []).slice(0, 2).map(p => (
                        <Badge key={p} variant="info">{p}</Badge>
                      ))}
                      {(s.capabilities?.processTypes || []).length > 2 && (
                        <Badge>+{(s.capabilities?.processTypes || []).length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => { setSelected(s); setActionError(""); }}
                        className="bg-blue-600 text-white rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-blue-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setSqiTarget(s)}
                        className="bg-purple-600 text-white rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-purple-700"
                      >
                        SQI
                      </button>
                      {s.supplierStatus !== "APPROVED" && (
                        <button
                          onClick={async () => {
                            setActionLoading(true);
                            try {
                              await marketApi.approveSupplier(s._id);
                              showToast("Supplier approved");
                              await load();
                            } catch (e) { setError(e?.response?.data?.message || "Error"); }
                            setActionLoading(false);
                          }}
                          disabled={actionLoading}
                          className="bg-green-600 text-white rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No suppliers found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selected && (
        <SupplierDetailModal
          supplier={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          loading={actionLoading}
          error={actionError}
        />
      )}

      {sqiTarget && (
        <SQIModal
          supplier={sqiTarget}
          onClose={() => setSqiTarget(null)}
          onSave={() => { showToast("SQI updated successfully"); load(); }}
        />
      )}
    </div>
  );
}
