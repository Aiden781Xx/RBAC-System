import { useEffect, useMemo, useState } from "react";
import { marketApi } from "../../api/marketApi";

const stepDefs = [
  { key: "rfqCreated", label: "Created" },
  { key: "adminConfirmed", label: "Confirmed" },
  { key: "leadsCreated", label: "Leads" },
  { key: "leadPurchased", label: "Purchased" },
  { key: "quoteSubmitted", label: "Quoted" },
  { key: "quoteAccepted", label: "Accepted" },
  { key: "leadConverted", label: "Converted" },
];

const stateCls = {
  CONFIRMED: "bg-green-50 text-green-700 border-green-200",
  SUBMITTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  CLARIFICATION_REQUIRED: "bg-orange-50 text-orange-700 border-orange-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
};

function FlowDots({ flow }) {
  return (
    <div className="flex items-center gap-0.5">
      {stepDefs.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div
            className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold border ${flow[s.key] ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 text-gray-300"}`}
            title={s.label}
          >
            {flow[s.key] ? "✓" : i + 1}
          </div>
          {i < stepDefs.length - 1 && (
            <div className={`w-3 h-0.5 ${flow[s.key] && flow[stepDefs[i + 1]?.key] ? "bg-green-400" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function HealthBar({ value, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function FlowHealth() {
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [view, setView] = useState("table");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [flowRes, metricRes] = await Promise.all([
        marketApi.getAdminFlowHealth(),
        marketApi.getAdminMetrics(),
      ]);
      setItems(flowRes.data?.items || []);
      setMetrics(metricRes.data || null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load flow health");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (stateFilter !== "all") list = list.filter(r => r.state === stateFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r => (r.title || "").toLowerCase().includes(q) || r.rfqId.includes(q));
    }
    return list;
  }, [items, stateFilter, search]);

  const summary = useMemo(() => ({
    total: items.length,
    confirmed: items.filter(r => r.state === "CONFIRMED").length,
    withLeads: items.filter(r => r.flow.leadsCreated).length,
    withPurchase: items.filter(r => r.flow.leadPurchased).length,
    withQuote: items.filter(r => r.flow.quoteSubmitted).length,
    withAccepted: items.filter(r => r.flow.quoteAccepted).length,
    converted: items.filter(r => r.flow.leadConverted).length,
    overdue: items.filter(r => r.isOverdue).length,
    upcoming: items.filter(r => r.isUpcoming).length,
  }), [items]);

  const stateOptions = ["all", "SUBMITTED", "CONFIRMED", "REJECTED", "CLARIFICATION_REQUIRED", "CLOSED"];

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Flow Health</h1>
          <p className="text-sm text-gray-500 mt-0.5">End-to-end RFQ pipeline tracking — {summary.total} RFQs</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(v => v === "table" ? "cards" : "table")}
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-gray-50">
            {view === "table" ? "🃏 Cards" : "📊 Table"}
          </button>
          <button onClick={load} disabled={loading} className="border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
            {loading ? <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : "↻ Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

      {/* Funnel */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">Pipeline Conversion Funnel</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-5">
          {[
            { label: "RFQs Created",    val: summary.total,        d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",                   cls: "text-blue-500"   },
            { label: "Confirmed",       val: summary.confirmed,    d: "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",                              cls: "text-green-500"  },
            { label: "Leads Created",   val: summary.withLeads,    d: "M22 12h-4l-3 9L9 3l-3 9H2",                                                          cls: "text-cyan-500"   },
            { label: "Lead Purchased",  val: summary.withPurchase, d: "M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z M1 10h22",      cls: "text-violet-500" },
            { label: "Quote Submitted", val: summary.withQuote,    d: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",                          cls: "text-amber-500"  },
            { label: "Quote Accepted",  val: summary.withAccepted, d: "M20 6L9 17l-5-5",                                                                     cls: "text-emerald-500"},
            { label: "Converted",       val: summary.converted,    d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", cls: "text-orange-500" },
          ].map(({ label, val, d, cls }) => (
            <div key={label} className="text-center">
              <div className={`w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center bg-gray-50`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}><path d={d}/></svg>
              </div>
              <div className="text-2xl font-black text-gray-800">{val}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
              {summary.total > 0 && (
                <div className="text-[10px] text-gray-400">{Math.round((val / summary.total) * 100)}%</div>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            { label: "Confirmation Rate", val: summary.confirmed, total: summary.total },
            { label: "Lead Generation Rate", val: summary.withLeads, total: summary.confirmed },
            { label: "Purchase Rate", val: summary.withPurchase, total: summary.withLeads },
            { label: "Quote Rate", val: summary.withQuote, total: summary.withPurchase },
            { label: "Accept Rate", val: summary.withAccepted, total: summary.withQuote },
            { label: "Conversion Rate", val: summary.converted, total: summary.withAccepted },
          ].map(({ label, val, total }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-44 shrink-0">{label}</span>
              <div className="flex-1"><HealthBar value={val} total={total} /></div>
              <span className="text-xs text-gray-400 w-12 text-right shrink-0">{val}/{total || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total RFQs", val: metrics.totalRFQs },
            { label: "Total Leads", val: metrics.totalLeads },
            { label: "Purchases", val: metrics.totalPurchases },
            { label: "Conversion", val: `${((metrics.conversionRate || 0) * 100).toFixed(1)}%` },
            { label: "Avg SQI", val: metrics?.sqi?.avg ?? 0 },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-center">
              <p className="text-xl font-black text-gray-800">{val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {(summary.overdue > 0 || summary.upcoming > 0) && (
        <div className="flex gap-3 flex-wrap">
          {summary.overdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm font-semibold text-red-700">
              🚨 {summary.overdue} overdue RFQ{summary.overdue > 1 ? "s" : ""}
            </div>
          )}
          {summary.upcoming > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm font-semibold text-blue-700">
              📅 {summary.upcoming} due within 30 days
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {stateOptions.map(s => (
            <button key={s} onClick={() => setStateFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${stateFilter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
              {s === "all" ? `All (${items.length})` : `${s.replace(/_/g, " ")} (${items.filter(r => r.state === s).length})`}
            </button>
          ))}
        </div>
        <input
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          placeholder="Search by title or ID..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {view === "table" ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  {["RFQ", "State", "Created", "Pipeline", "Leads", "Purchased", "Quotes", "Accepted", "Delivery", "Alert"].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(row => (
                  <tr key={row.rfqId} className={`hover:bg-gray-50 ${row.isOverdue ? "bg-red-50/20" : ""}`}>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-gray-800 text-xs max-w-[140px] truncate">{row.title || "Untitled"}</p>
                      <p className="text-[10px] text-gray-400 font-mono">…{row.rfqId.slice(-6)}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stateCls[row.state] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {row.state?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2.5"><FlowDots flow={row.flow} /></td>
                    <td className="px-3 py-2.5 font-bold text-gray-700">{row.counts.leads}</td>
                    <td className="px-3 py-2.5 font-bold text-green-600">{row.counts.purchasedLeads}</td>
                    <td className="px-3 py-2.5 font-bold text-gray-700">{row.counts.quotes}</td>
                    <td className="px-3 py-2.5 font-bold text-blue-600">{row.counts.acceptedQuotes}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">
                      {row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {row.isOverdue ? <span className="text-[10px] font-bold text-red-600">🚨 OVERDUE</span>
                        : row.isUpcoming ? <span className="text-[10px] font-bold text-blue-600">📅 SOON</span>
                        : <span className="text-[10px] text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">No RFQs match your filter</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(row => (
            <div key={row.rfqId} className={`bg-white border rounded-2xl p-5 shadow-sm ${row.isOverdue ? "border-red-200" : "border-gray-100"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">{row.title || "Untitled RFQ"}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stateCls[row.state] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {row.state}
                    </span>
                    {row.isOverdue && <span className="text-[10px] font-bold text-red-600">🚨 OVERDUE</span>}
                    {row.isUpcoming && <span className="text-[10px] font-bold text-blue-600">📅 DUE SOON</span>}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {row.deliveryDate && <p className={row.isOverdue ? "text-red-600 font-semibold" : ""}>
                    {new Date(row.deliveryDate).toLocaleDateString()}
                  </p>}
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {stepDefs.map((s, i) => (
                  <div key={s.key} className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center">
                      <div className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold border-2 ${row.flow[s.key] ? "bg-green-500 border-green-500 text-white" : "bg-white border-gray-200 text-gray-400"}`}>
                        {row.flow[s.key] ? "✓" : i + 1}
                      </div>
                      {i < stepDefs.length - 1 && <div className={`w-4 h-0.5 ${row.flow[s.key] ? "bg-green-300" : "bg-gray-200"}`} />}
                    </div>
                    <p className="text-[9px] text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-xs">
                {[
                  ["Leads", row.counts.leads, "text-gray-700"],
                  ["Purchased", row.counts.purchasedLeads, "text-green-600"],
                  ["Quotes", row.counts.quotes, "text-gray-700"],
                  ["Accepted", row.counts.acceptedQuotes, "text-blue-600"],
                  ["Converted", row.counts.convertedLeads, "text-purple-600"],
                ].map(([label, val, cls]) => (
                  <span key={label} className="text-gray-500">{label}: <strong className={cls}>{val}</strong></span>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400 border rounded-2xl bg-white">
              <p className="text-3xl mb-2">📭</p>
              <p>No RFQs match your filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
