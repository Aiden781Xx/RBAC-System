import { useEffect, useState } from "react";
import { marketApi } from "../../api/marketApi";

const statusStyle = {
  AVAILABLE: "bg-blue-50 text-blue-700 border-blue-200",
  PURCHASED: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-gray-100 text-gray-500 border-gray-200",
  REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
};

const visibilityBadge = {
  PRIORITY: "bg-purple-50 text-purple-700 border-purple-200",
  EXCLUSIVE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  NORMAL: "bg-gray-50 text-gray-600 border-gray-200",
};
const statStyles = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  green: "bg-green-50 border-green-200 text-green-700",
};

const Badge = ({ label, cls }) => (
  <span className={`border rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${cls}`}>
    {label}
  </span>
);

const rfqTypeIcons = {
  MACHINING: "⚙️", CASTING: "🔩", SHEET_METAL: "🔧",
  FORGING: "🔨", FABRICATION: "🏗️", INJECTION_MOULDING: "💉", OTHER: "📦",
};

export default function LeadMarketplace() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [quoteForms, setQuoteForms] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [purchasing, setPurchasing] = useState({});
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  // Track which rfqIds have been quoted this session to prevent duplicates
  const [quotedRfqIds, setQuotedRfqIds] = useState(new Set());

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const loadLeads = async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getSupplierLeads({ page: 1, limit: 50 });
      setLeads(res.data?.leads || []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e?.message || "Failed to load leads");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadLeads(); }, []);

  const onPurchase = async (lead) => {
    setPurchasing(p => ({ ...p, [lead.id]: true }));
    setError("");
    try {
      const res = await marketApi.purchaseLead(lead.rfqId);
      showToast(`Lead purchased! ${res.data?.remainingToday ?? "?"} purchases remaining today.`);
      await loadLeads();
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e?.message || "Failed to purchase lead");
    } finally { setPurchasing(p => ({ ...p, [lead.id]: false })); }
  };

  const onSubmitQuote = async (lead) => {
    const form = quoteForms[lead.rfqId] || {};
    if (!form.quotedPrice || !form.leadTimeDays) {
      setError("Please enter price and lead time before submitting");
      return;
    }
    setSubmitting(p => ({ ...p, [lead.id]: true }));
    setError("");
    try {
      await marketApi.submitQuote(lead.rfqId, {
        quotedPrice: Number(form.quotedPrice),
        leadTimeDays: Number(form.leadTimeDays),
        remarks: form.remarks || "",
      });
      showToast("Quote submitted successfully! Buyer will review.");
      setQuoteForms(p => ({ ...p, [lead.rfqId]: {} }));
      setExpandedQuote(null);
      setQuotedRfqIds(prev => new Set([...prev, String(lead.rfqId)]));
      await loadLeads();
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || e?.message || "Failed to submit quote");
    } finally { setSubmitting(p => ({ ...p, [lead.id]: false })); }
  };

  const filtered = filterStatus === "all"
    ? leads
    : filterStatus === "purchased" ? leads.filter(l => l.isPurchased)
    : leads.filter(l => !l.isPurchased);

  const stats = {
    total: leads.length,
    available: leads.filter(l => !l.isPurchased).length,
    purchased: leads.filter(l => l.isPurchased).length,
  };

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-medium max-w-sm">
          ✓ {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Marketplace</h1>
          <p className="text-sm text-gray-500 mt-1">Purchase leads to reveal buyer identity, then submit your quote</p>
        </div>
        <button onClick={loadLeads} disabled={loading} className="text-sm border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50">
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Leads", val: stats.total, color: "blue" },
          { label: "Available", val: stats.available, color: "orange" },
          { label: "Purchased", val: stats.purchased, color: "green" },
        ].map(({ label, val, color }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${statStyles[color] || statStyles.blue}`}>
            <p className="text-2xl font-bold">{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "available", "purchased"].map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              filterStatus === f ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Leads list */}
      <div className="space-y-3">
        {filtered.map(lead => (
          <div key={lead.id} className={`border rounded-2xl bg-white shadow-sm overflow-hidden transition-all ${
            lead.visibilityType === "PRIORITY" ? "border-purple-300 ring-1 ring-purple-100" :
            lead.visibilityType === "EXCLUSIVE" ? "border-yellow-400 ring-1 ring-yellow-100" : "border-gray-200"
          }`}>
            {/* Lead header */}
            <div className="p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{rfqTypeIcons[lead.rfq?.type] || "📦"}</div>
                <div>
                  <p className="font-semibold text-gray-900">{lead.rfq?.title || "Untitled RFQ"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lead.rfq?.type || "—"}</p>
                  {lead.rfq?.budgetRange && (
                    <p className="text-xs text-gray-500 mt-1">
                      Budget: ₹{lead.rfq.budgetRange.min?.toLocaleString()} – ₹{lead.rfq.budgetRange.max?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex gap-1.5 flex-wrap justify-end">
                  <Badge
                    label={lead.isPurchased ? "PURCHASED" : "AVAILABLE"}
                    cls={statusStyle[lead.isPurchased ? "PURCHASED" : "AVAILABLE"]}
                  />
                  {lead.visibilityType && lead.visibilityType !== "NORMAL" && (
                    <Badge label={lead.visibilityType} cls={visibilityBadge[lead.visibilityType]} />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">₹{lead.price?.toLocaleString() || "—"}</p>
                  <p className="text-xs text-gray-400">lead price</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xs text-gray-500">Score:</div>
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${lead.leadScore || 0}%` }} />
                  </div>
                  <div className="text-xs font-semibold text-gray-700">{lead.leadScore || 0}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4">
              {!lead.isPurchased ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onPurchase(lead)}
                    disabled={purchasing[lead.id]}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50 transition-colors"
                  >
                    {purchasing[lead.id] ? "Purchasing..." : `🔓 Purchase Lead — ₹${lead.price?.toLocaleString()}`}
                  </button>
                  <p className="text-xs text-gray-400">Reveals buyer identity & contact details</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                      ✓ Buyer identity revealed
                    </span>
                    {quotedRfqIds.has(String(lead.rfqId)) ? (
                      <span className="text-xs text-blue-700 font-semibold bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                        📋 Quote Submitted — Awaiting buyer review
                      </span>
                    ) : (
                      <>
                        {expandedQuote !== lead.id ? (
                          <button
                            onClick={() => setExpandedQuote(lead.id)}
                            className="text-sm text-blue-600 font-semibold hover:underline"
                          >
                            Submit Quote →
                          </button>
                        ) : (
                          <button
                            onClick={() => setExpandedQuote(null)}
                            className="text-sm text-gray-500 hover:underline"
                          >
                            Collapse ↑
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {expandedQuote === lead.id && !quotedRfqIds.has(String(lead.rfqId)) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">Submit Your Quote</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Quoted Price (₹) *</label>
                          <input
                            type="number"
                            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 50000"
                            value={quoteForms[lead.rfqId]?.quotedPrice || ""}
                            onChange={e => setQuoteForms(p => ({
                              ...p, [lead.rfqId]: { ...(p[lead.rfqId] || {}), quotedPrice: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Lead Time (days) *</label>
                          <input
                            type="number"
                            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 30"
                            value={quoteForms[lead.rfqId]?.leadTimeDays || ""}
                            onChange={e => setQuoteForms(p => ({
                              ...p, [lead.rfqId]: { ...(p[lead.rfqId] || {}), leadTimeDays: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Remarks</label>
                          <input
                            className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional notes..."
                            value={quoteForms[lead.rfqId]?.remarks || ""}
                            onChange={e => setQuoteForms(p => ({
                              ...p, [lead.rfqId]: { ...(p[lead.rfqId] || {}), remarks: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => onSubmitQuote(lead)}
                        disabled={submitting[lead.id]}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
                      >
                        {submitting[lead.id] ? "Submitting..." : "✓ Submit Quote to Buyer"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400 border rounded-2xl bg-white">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-medium">No leads available</p>
            <p className="text-sm mt-1">
              {filterStatus === "purchased"
                ? "You haven't purchased any leads yet"
                : "New leads will appear when admin confirms RFQs matching your capabilities"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
