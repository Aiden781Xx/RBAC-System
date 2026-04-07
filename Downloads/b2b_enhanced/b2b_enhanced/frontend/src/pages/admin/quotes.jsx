import { useEffect, useMemo, useState } from "react";
import { marketApi } from "../../api/marketApi";

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
  purple: {
    card: "bg-purple-50 border-purple-200",
    value: "text-purple-700",
  },
};

const statusStyle = {
  SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
  ACCEPTED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  REVISED: "bg-orange-50 text-orange-700 border-orange-200",
};

const Badge = ({ s }) => (
  <span className={`border rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${statusStyle[s] || "bg-gray-100 text-gray-600"}`}>{s}</span>
);

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getAdminQuotes();
      const payload = res.data;
      setQuotes(Array.isArray(payload) ? payload : Array.isArray(payload?.quotes) ? payload.quotes : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load quotes");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    all: quotes.length,
    submitted: quotes.filter(q => q.status === "SUBMITTED").length,
    accepted: quotes.filter(q => q.status === "ACCEPTED").length,
    rejected: quotes.filter(q => q.status === "REJECTED").length,
  }), [quotes]);

  const totalValue = useMemo(() =>
    quotes.filter(q => q.status === "ACCEPTED").reduce((s, q) => s + (q.quotedPrice || 0), 0),
  [quotes]);

  const filtered = useMemo(() => {
    let list = status === "all" ? quotes : quotes.filter(q => q.status === status.toUpperCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(x =>
        (x.rfqId?.title || "").toLowerCase().includes(q) ||
        (x.supplierId?.userId?.name || "").toLowerCase().includes(q) ||
        (x.rfqId?.buyerId?.userId?.name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [quotes, status, search]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-1">All supplier quotes submitted to buyers</p>
        </div>
        <button onClick={load} disabled={loading} className="text-sm border rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-50">
          {loading ? "..." : "↻ Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", val: counts.all, color: "blue" },
          { label: "Pending", val: counts.submitted, color: "yellow" },
          { label: "Accepted", val: counts.accepted, color: "green" },
          { label: "Accepted Value (₹)", val: totalValue.toLocaleString(), color: "purple" },
        ].map(({ label, val, color }) => {
          const styles = statCardStyles[color];
          return (
            <div key={label} className={`border rounded-xl p-4 text-center ${styles.card}`}>
              <p className={`text-2xl font-bold ${styles.value}`}>{val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1">
          {Object.entries(counts).map(([k, v]) => (
            <button key={k} onClick={() => setStatus(k)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                status === k ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}>
              {k} ({v})
            </button>
          ))}
        </div>
        <input className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          placeholder="Search by RFQ, supplier..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["Quote ID", "RFQ", "Buyer", "Supplier", "Quoted Price", "Lead Time", "Remarks", "Status", "Date"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(q => (
                <tr key={q._id} className={`hover:bg-gray-50 ${q.status === "ACCEPTED" ? "bg-green-50/30" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">…{String(q._id).slice(-8)}</td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-medium text-gray-800">{q.rfqId?.title || q.rfqId?.rfqType || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-medium text-gray-700">{q.rfqId?.buyerId?.userId?.name || "—"}</p>
                    <p className="text-gray-400 text-[10px]">{q.rfqId?.buyerId?.userId?.email || ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-medium">{q.supplierId?.userId?.name || "—"}</p>
                    <p className="text-gray-400">{q.supplierId?.userId?.email || "—"}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹{(q.quotedPrice || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{q.leadTimeDays || 0} days</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{q.remarks || "—"}</td>
                  <td className="px-4 py-3"><Badge s={q.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400"><p>No quotes found</p></div>
        )}
      </div>
    </div>
  );
}
