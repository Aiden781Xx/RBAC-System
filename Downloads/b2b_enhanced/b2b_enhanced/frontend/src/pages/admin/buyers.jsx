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
};

const actionToastMessage = {
  verify: "Buyer verified successfully",
  restrict: "Buyer restricted successfully",
  unrestrict: "Buyer unrestricted successfully",
  blacklist: "Buyer blacklisted successfully",
};

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-green-50 text-green-700 border-green-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
  }[variant] || "bg-gray-100 text-gray-700";
  return (
    <span className={`${styles} border rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap`}>
      {children}
    </span>
  );
};

const statusBadge = (status) => ({
  VERIFIED: <Badge variant="success">VERIFIED</Badge>,
  PENDING_VERIFICATION: <Badge variant="warning">PENDING</Badge>,
  RESTRICTED: <Badge variant="danger">RESTRICTED</Badge>,
  BLACKLISTED: <Badge variant="danger">BLACKLISTED</Badge>,
})[status] || <Badge>{status}</Badge>;

const BuyerModal = ({ buyer, onClose, onAction, loading, error }) => {
  if (!buyer) return null;
  const b = buyer;
  const u = b.userId || {};
  const c = b.companyId || {};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{u.name || "Buyer"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{u.email || "—"}</span></div>
            <div><span className="text-gray-500">Status:</span> {statusBadge(b.buyerStatus)}</div>
            <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{u.phone || "—"}</span></div>
            <div><span className="text-gray-500">Email Verified:</span> <span className={u.isEmailVerified ? "text-green-600 font-medium" : "text-red-600"}>{u.isEmailVerified ? "Yes" : "No"}</span></div>
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold mb-2 text-gray-700">Company Details</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <span>Company: <strong>{c.companyName || "—"}</strong></span>
              <span>Country: <strong>{c.country || "—"}</strong></span>
              <span>Website: <strong>{c.website || "—"}</strong></span>
              <span>Reg No: <strong>{c.registrationNumber || "—"}</strong></span>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold mb-2 text-gray-700">Platform Activity</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <span>Export Intent: <strong className={b.exportIntent ? "text-green-600" : "text-gray-400"}>{b.exportIntent ? "Yes" : "No"}</strong></span>
              <span>Purchase Auth: <strong className={b.purchaseAuthority ? "text-green-600" : "text-gray-400"}>{b.purchaseAuthority ? "Declared" : "Not declared"}</strong></span>
              <span>Total RFQs: <strong>{b.totalRfqs || 0}</strong></span>
              <span>Active RFQs: <strong>{b.activeRfqs || 0}</strong></span>
              <span>Misuse Count: <strong className={(b.misuseCount || 0) > 0 ? "text-red-600" : "text-gray-600"}>{b.misuseCount || 0}</strong></span>
            </div>
          </div>

          {(b.misuseLogs || []).length > 0 && (
            <div className="border-t pt-3">
              <p className="font-semibold mb-2 text-red-700">Misuse Logs</p>
              <div className="space-y-1">
                {b.misuseLogs.map((log, i) => (
                  <div key={i} className="text-xs bg-red-50 rounded p-2">
                    <p className="text-red-700">{log.reason}</p>
                    <p className="text-gray-400">{new Date(log.flaggedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {b.verifiedAt && (
            <div className="border-t pt-2">
              <p className="text-xs text-gray-500">Verified at: {new Date(b.verifiedAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mt-3 bg-red-50 rounded p-2">{error}</p>}

        <div className="flex gap-2 mt-5 flex-wrap">
          {b.buyerStatus === "PENDING_VERIFICATION" && (
            <button onClick={() => onAction("verify")} disabled={loading}
              className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
              {loading ? "..." : "✓ Verify Buyer"}
            </button>
          )}
          {(b.buyerStatus === "VERIFIED" || b.buyerStatus === "PENDING_VERIFICATION") && (
            <button onClick={() => onAction("restrict")} disabled={loading}
              className="flex-1 bg-yellow-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50">
              {loading ? "..." : "⚠ Restrict"}
            </button>
          )}
          {b.buyerStatus === "RESTRICTED" && (
            <>
              <button onClick={() => onAction("unrestrict")} disabled={loading}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {loading ? "..." : "↺ Unrestrict"}
              </button>
              <button onClick={() => onAction("blacklist")} disabled={loading}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                {loading ? "..." : "✕ Blacklist"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getAdminBuyers();
      const d = res.data;
      setBuyers(Array.isArray(d) ? d : Array.isArray(d?.buyers) ? d.buyers : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load buyers");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (action) => {
    setActionLoading(true); setActionError("");
    try {
      const id = selected._id;
      if (action === "verify") await marketApi.verifyBuyer(id);
      else if (action === "restrict") await marketApi.restrictBuyer(id);
      else if (action === "unrestrict") await marketApi.unrestrictBuyer(id);
      else if (action === "blacklist") await marketApi.blacklistBuyer(id);
      showToast(actionToastMessage[action] || "Buyer updated successfully");
      setSelected(null);
      await load();
    } catch (e) {
      setActionError(e?.response?.data?.message || `Failed to ${action} buyer`);
    } finally { setActionLoading(false); }
  };

  const filtered = useMemo(() => {
    let list = buyers;
    if (filter === "pending") list = list.filter(b => b.buyerStatus === "PENDING_VERIFICATION");
    else if (filter === "verified") list = list.filter(b => b.buyerStatus === "VERIFIED");
    else if (filter === "restricted") list = list.filter(b => ["RESTRICTED", "BLACKLISTED"].includes(b.buyerStatus));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        (b.userId?.name || "").toLowerCase().includes(q) ||
        (b.userId?.email || "").toLowerCase().includes(q) ||
        (b.companyId?.companyName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [buyers, filter, search]);

  const stats = useMemo(() => ({
    total: buyers.length,
    verified: buyers.filter(b => b.buyerStatus === "VERIFIED").length,
    pending: buyers.filter(b => b.buyerStatus === "PENDING_VERIFICATION").length,
    restricted: buyers.filter(b => ["RESTRICTED", "BLACKLISTED"].includes(b.buyerStatus)).length,
  }), [buyers]);

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm font-medium">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buyer Management</h1>
          <p className="text-sm text-gray-500 mt-1">Verify, restrict, and manage buyers</p>
        </div>
        <button onClick={load} disabled={loading} className="text-sm border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50">
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Buyers", val: stats.total, color: "blue" },
          { label: "Verified", val: stats.verified, color: "green" },
          { label: "Pending", val: stats.pending, color: "yellow" },
          { label: "Restricted", val: stats.restricted, color: "red" },
        ].map(({ label, val, color }) => {
          const styles = statCardStyles[color];
          return (
            <div key={label} className={`border rounded-xl p-4 text-center ${styles.card}`}>
              <p className={`text-3xl font-bold ${styles.value}`}>{val}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1">
          {["all", "pending", "verified", "restricted"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                filter === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}>
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
                {["Buyer", "Company", "Status", "Email Verified", "Purchase Auth", "Export Intent", "RFQs", "Misuse", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(b => (
                <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{b.userId?.name || "—"}</p>
                    <p className="text-xs text-gray-500">{b.userId?.email || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.companyId?.companyName || "—"}</p>
                    <p className="text-xs text-gray-500">{b.companyId?.country || "—"}</p>
                  </td>
                  <td className="px-4 py-3">{statusBadge(b.buyerStatus)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${b.userId?.isEmailVerified ? "text-green-600" : "text-red-500"}`}>
                      {b.userId?.isEmailVerified ? "✓ Yes" : "✕ No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${b.purchaseAuthority ? "text-green-600" : "text-gray-400"}`}>
                      {b.purchaseAuthority ? "✓ Yes" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${b.exportIntent ? "text-blue-600" : "text-gray-400"}`}>
                      {b.exportIntent ? "✓ Yes" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{b.totalRfqs || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${(b.misuseCount || 0) > 0 ? "text-red-600" : "text-gray-400"}`}>
                      {b.misuseCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => { setSelected(b); setActionError(""); }}
                        className="bg-blue-600 text-white rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-blue-700">
                        View
                      </button>
                      {b.buyerStatus === "PENDING_VERIFICATION" && (
                        <button
                          onClick={async () => {
                            try { await marketApi.verifyBuyer(b._id); showToast("Buyer verified"); await load(); }
                            catch (e) { setError(e?.response?.data?.message || "Error verifying"); }
                          }}
                          className="bg-green-600 text-white rounded-md px-2.5 py-1 text-xs font-semibold hover:bg-green-700">
                          Verify
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
            <p className="text-lg">No buyers found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {selected && (
        <BuyerModal
          buyer={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          loading={actionLoading}
          error={actionError}
        />
      )}
    </div>
  );
}
