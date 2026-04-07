import { useEffect, useMemo, useState } from "react";
import { marketApi } from "../../api/marketApi";

const statusStyle = {
  AVAILABLE: "bg-blue-50 text-blue-700 border-blue-200",
  PURCHASED: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-gray-100 text-gray-500 border-gray-200",
  REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
};
const statStyles = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
};

export default function MyLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("purchased");
  const [toast, setToast] = useState("");
  const [quoteForms, setQuoteForms] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [expanded, setExpanded] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getSupplierLeads({ page: 1, limit: 100 });
      setLeads(res.data?.leads || []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.response?.data?.error || "Failed to load leads");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmitQuote = async (lead) => {
    const form = quoteForms[lead.rfqId] || {};
    if (!form.quotedPrice || !form.leadTimeDays) {
      setError("Please fill price and lead time before submitting.");
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
      showToast("Quote submitted to buyer! 🎉");
      setQuoteForms(p => ({ ...p, [lead.rfqId]: {} }));
      setExpanded(null);
    } catch (e) {
      setError(e?.response?.data?.error || e?.response?.data?.message || "Failed to submit quote");
    } finally { setSubmitting(p => ({ ...p, [lead.id]: false })); }
  };

  const filtered = useMemo(() => {
    if (filter === "purchased") return leads.filter(l => l.isPurchased);
    if (filter === "available") return leads.filter(l => !l.isPurchased);
    return leads;
  }, [leads, filter]);

  const stats = {
    total: leads.length,
    purchased: leads.filter(l => l.isPurchased).length,
    available: leads.filter(l => !l.isPurchased).length,
  };

  return (
    <div className="p-6 space-y-5">
      {toast && <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-semibold">✓ {toast}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">Purchased leads + quote submission</p>
        </div>
        <button onClick={load} disabled={loading} className="border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50">{loading ? "..." : "↻ Refresh"}</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", val: stats.total, color: "blue" },
          { label: "Purchased", val: stats.purchased, color: "green" },
          { label: "Available", val: stats.available, color: "orange" },
        ].map(({ label, val, color }) => (
          <div key={label} className={`rounded-xl border p-3 text-center ${statStyles[color] || statStyles.blue}`}>
            <p className="text-3xl font-black">{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

      <div className="flex gap-1">
        {[["all","All Leads"], ["purchased","Purchased"], ["available","Available"]].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${filter === k ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(lead => (
          <div key={lead.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${lead.isPurchased ? "border-green-100" : "border-gray-100"}`}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{lead.rfq?.title || "Untitled RFQ"}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle[lead.isPurchased ? "PURCHASED" : "AVAILABLE"]}`}>
                      {lead.isPurchased ? "PURCHASED" : "AVAILABLE"}
                    </span>
                    {lead.visibilityType && lead.visibilityType !== "NORMAL" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">{lead.visibilityType}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 mt-2">
                    <div><p className="text-[10px] text-gray-400">Type</p><p className="text-xs font-semibold text-gray-700">{lead.rfq?.type || "—"}</p></div>
                    <div><p className="text-[10px] text-gray-400">Budget</p><p className="text-xs font-semibold text-gray-700">{lead.rfq?.budgetRange?.min ? `₹${lead.rfq.budgetRange.min.toLocaleString()} – ₹${lead.rfq.budgetRange.max?.toLocaleString()}` : "—"}</p></div>
                    <div><p className="text-[10px] text-gray-400">Lead Score</p><p className="text-xs font-semibold text-gray-700">{lead.leadScore || 0}/100</p></div>
                    <div><p className="text-[10px] text-gray-400">Lead Price</p><p className="text-xs font-semibold text-gray-700">₹{lead.price?.toLocaleString() || "—"}</p></div>
                  </div>
                </div>
              </div>

              {lead.isPurchased && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-green-700">✓ Buyer identity revealed — Ready to quote</p>
                    <button onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                      className="text-xs text-blue-600 font-semibold hover:underline">
                      {expanded === lead.id ? "Collapse ↑" : "Submit Quote →"}
                    </button>
                  </div>

                  {expanded === lead.id && (
                    <div className="mt-3 bg-gray-50 rounded-xl p-4 space-y-3">
                      <h3 className="text-sm font-bold text-gray-700">Submit Quote</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Quoted Price (₹) *</label>
                          <input type="number" className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 75000" value={quoteForms[lead.rfqId]?.quotedPrice || ""}
                            onChange={e => setQuoteForms(p => ({ ...p, [lead.rfqId]: { ...p[lead.rfqId], quotedPrice: e.target.value } }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Lead Time (days) *</label>
                          <input type="number" className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 30" value={quoteForms[lead.rfqId]?.leadTimeDays || ""}
                            onChange={e => setQuoteForms(p => ({ ...p, [lead.rfqId]: { ...p[lead.rfqId], leadTimeDays: e.target.value } }))} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Remarks</label>
                          <input className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Optional notes..." value={quoteForms[lead.rfqId]?.remarks || ""}
                            onChange={e => setQuoteForms(p => ({ ...p, [lead.rfqId]: { ...p[lead.rfqId], remarks: e.target.value } }))} />
                        </div>
                      </div>
                      <button onClick={() => handleSubmitQuote(lead)} disabled={submitting[lead.id]}
                        className="w-full bg-green-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors">
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
          <div className="text-center py-16 border rounded-2xl bg-white">
            <p className="text-4xl mb-3">{filter === "purchased" ? "🎯" : "📋"}</p>
            <p className="text-lg font-semibold text-gray-600">
              {filter === "purchased" ? "No purchased leads yet" : "No leads found"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filter === "purchased" ? "Go to the Marketplace to purchase leads" : "Leads appear when admin confirms matching RFQs"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
