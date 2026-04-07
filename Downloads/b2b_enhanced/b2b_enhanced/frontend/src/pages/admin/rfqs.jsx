import { useEffect, useMemo, useState } from "react";
import { marketApi } from "../../api/marketApi";

const statusStyle = {
  SUBMITTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  UNDER_VALIDATION: "bg-blue-50 text-blue-700 border-blue-200",
  CLARIFICATION_REQUIRED: "bg-orange-50 text-orange-700 border-orange-200",
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

const statCardStyles = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    value: "text-blue-700",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-200",
    value: "text-yellow-700",
  },
  green: {
    card: "bg-green-50 border-green-200",
    value: "text-green-700",
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

const Badge = ({ s }) => (
  <span className={`border rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${statusStyle[s] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
    {s}
  </span>
);

const getExpectedDelivery = (rfq) =>
  rfq?.timeLine?.expectedDeliveryDate ||
  rfq?.timeLine?.expectedDelivery ||
  rfq?.timeline?.expectedDeliveryDate ||
  rfq?.timeline?.expectedDelivery;

const formatExpectedDelivery = (rfq) => {
  const value = getExpectedDelivery(rfq);
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : parsed.toLocaleDateString();
};

const RFQDetailModal = ({ rfq, onClose, onConfirm, onReject, loading, error }) => {
  const [rejectReason, setRejectReason] = useState("");
  const [mode, setMode] = useState("view");

  if (!rfq) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{rfq.title || "Untitled RFQ"}</h2>
          <button onClick={onClose} className="text-xl font-bold text-gray-400 hover:text-gray-700">x</button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Badge s={rfq.state} />
            {rfq.visibleToSuppliers && (
              <span className="rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                SELLABLE
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-500">Type:</span> <span className="font-medium">{rfq.rfqType || "-"}</span></div>
            <div><span className="text-gray-500">Created:</span> <span className="font-medium">{rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : "-"}</span></div>
          </div>

          <div className="border-t pt-3">
            <p className="mb-1 font-semibold text-gray-700">Engineering Details</p>
            <p className="rounded bg-gray-50 p-2 text-xs text-gray-600">
              {rfq.engineeringDetails?.description || rfq.description || "No description provided"}
            </p>
          </div>

          <div className="border-t pt-3">
            <p className="mb-2 font-semibold text-gray-700">Budget and Quantity</p>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
              <span>Min Budget: <strong>Rs {rfq.budgetRange?.min?.toLocaleString() || "-"}</strong></span>
              <span>Max Budget: <strong>Rs {rfq.budgetRange?.max?.toLocaleString() || "-"}</strong></span>
              <span>Trial Qty: <strong>{rfq.quantity?.trial || "-"}</strong></span>
              <span>Bulk Qty: <strong>{rfq.quantity?.bulk || "-"}</strong></span>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="mb-1 font-semibold text-gray-700">Timeline</p>
            <p className="text-xs text-gray-600">
              Expected Delivery: <strong>{formatExpectedDelivery(rfq)}</strong>
            </p>
          </div>

          {rfq.adminValidation?.clarifications?.length > 0 && (
            <div className="border-t pt-3">
              <p className="mb-1 font-semibold text-orange-700">Clarifications Required</p>
              <ul className="space-y-1 text-xs text-orange-600">
                {rfq.adminValidation.clarifications.map((c, i) => <li key={i}>- {c}</li>)}
              </ul>
            </div>
          )}

          {rfq.adminValidation?.rejectionReason && (
            <div className="border-t pt-3">
              <p className="mb-1 font-semibold text-red-700">Rejection Reason</p>
              <p className="rounded bg-red-50 p-2 text-xs text-red-600">{rfq.adminValidation.rejectionReason}</p>
            </div>
          )}

          {mode === "reject" && (
            <div className="border-t pt-3">
              <label className="text-sm font-medium text-red-700">Rejection Reason</label>
              <textarea
                className="mt-1 w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this RFQ is being rejected..."
              />
            </div>
          )}
        </div>

        {error && <p className="mt-3 rounded bg-red-50 p-2 text-sm text-red-600">{error}</p>}

        {rfq.state === "SUBMITTED" && (
          <div className="mt-5 flex gap-2">
            {mode === "view" && (
              <>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Confirm and Create Leads"}
                </button>
                <button
                  onClick={() => setMode("reject")}
                  className="flex-1 rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  Reject
                </button>
              </>
            )}
            {mode === "reject" && (
              <>
                <button onClick={() => setMode("view")} className="flex-1 rounded-lg border py-2 text-sm font-medium hover:bg-gray-50">Back</button>
                <button
                  onClick={() => onReject(rejectReason)}
                  disabled={loading || !rejectReason.trim()}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "..." : "Confirm Rejection"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function RFQs() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [pRes, aRes] = await Promise.all([marketApi.getPendingRfqs(), marketApi.getAllRfqs()]);
      setPending(Array.isArray(pRes.data) ? pRes.data : []);
      const payload = aRes.data;
      setAll(Array.isArray(payload) ? payload : Array.isArray(payload?.rfqs) ? payload.rfqs : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load RFQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleConfirm = async () => {
    setActionLoading(true);
    setActionError("");
    try {
      const res = await marketApi.confirmRfq(selected._id);
      showToast(`RFQ confirmed. ${res.data?.leadsCreated || 0} leads created for ${res.data?.matchedSuppliers || 0} suppliers.`);
      setSelected(null);
      await load();
    } catch (e) {
      setActionError(e?.response?.data?.message || "Failed to confirm RFQ");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    setActionError("");
    try {
      await marketApi.rejectRfq(selected._id, reason);
      showToast("RFQ rejected");
      setSelected(null);
      await load();
    } catch (e) {
      setActionError(e?.response?.data?.message || "Failed to reject RFQ");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAll = useMemo(() => {
    let list = all;
    if (filterState !== "all") list = list.filter((r) => r.state === filterState);
    if (search) {
      const query = search.toLowerCase();
      list = list.filter((r) =>
        (r.title || "").toLowerCase().includes(query) ||
        (r.rfqType || "").toLowerCase().includes(query) ||
        (r._id || "").toLowerCase().includes(query)
      );
    }
    return list;
  }, [all, filterState, search]);

  const stats = useMemo(() => ({
    total: all.length,
    pending: pending.length,
    confirmed: all.filter((r) => r.state === "CONFIRMED").length,
    rejected: all.filter((r) => r.state === "REJECTED").length,
    sellable: all.filter((r) => r.visibleToSuppliers).length,
  }), [all, pending]);

  return (
    <div className="space-y-5 p-6">
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RFQ Validation</h1>
          <p className="mt-1 text-sm text-gray-500">Confirm RFQs to trigger supplier matching and lead creation</p>
        </div>
        <button onClick={load} disabled={loading} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Total RFQs", val: stats.total, color: "blue" },
          { label: "Pending Validation", val: stats.pending, color: "yellow" },
          { label: "Confirmed", val: stats.confirmed, color: "green" },
          { label: "Rejected", val: stats.rejected, color: "red" },
          { label: "Sellable (Live)", val: stats.sellable, color: "purple" },
        ].map(({ label, val, color }) => {
          const styles = statCardStyles[color];
          return (
            <div key={label} className={`rounded-xl border p-3 text-center ${styles.card}`}>
              <p className={`text-2xl font-bold ${styles.value}`}>{val}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          );
        })}
      </div>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {pending.length > 0 && (
        <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-4">
          <h2 className="mb-3 font-bold text-yellow-800">Needs Validation ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-lg border border-yellow-200 bg-white p-3">
                <div>
                  <p className="font-semibold text-gray-900">{r.title || "Untitled RFQ"}</p>
                  <p className="text-xs text-gray-500">{r.rfqType} - {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelected(r);
                      setActionError("");
                    }}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Review
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await marketApi.confirmRfq(r._id);
                        showToast(`Confirmed! ${res.data?.leadsCreated || 0} leads created`);
                        await load();
                      } catch (e) {
                        setError(e?.response?.data?.message || "Error");
                      }
                    }}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Quick Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b bg-gray-50 p-4 sm:flex-row">
          <h2 className="flex-1 font-bold text-gray-800">All RFQs</h2>
          <div className="flex flex-wrap gap-1">
            {["all", "SUBMITTED", "CONFIRMED", "REJECTED", "CLARIFICATION_REQUIRED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterState(s)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                  filterState === s ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
          <input
            className="rounded-lg border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {["Title", "Type", "Budget", "Timeline", "Status", "Sellable", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAll.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.title || "Untitled"}</p>
                    <p className="text-xs text-gray-400">{r._id?.slice(-8)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">{r.rfqType || "-"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {r.budgetRange?.min && r.budgetRange?.max
                      ? `Rs ${r.budgetRange.min.toLocaleString()} - Rs ${r.budgetRange.max.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{formatExpectedDelivery(r)}</td>
                  <td className="px-4 py-3"><Badge s={r.state} /></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${r.visibleToSuppliers ? "text-green-600" : "text-gray-400"}`}>
                      {r.visibleToSuppliers ? "Yes" : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelected(r);
                        setActionError("");
                      }}
                      className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAll.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-400">
            <p>No RFQs found</p>
          </div>
        )}
      </div>

      {selected && (
        <RFQDetailModal
          rfq={selected}
          onClose={() => setSelected(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
          loading={actionLoading}
          error={actionError}
        />
      )}
    </div>
  );
}
