import { useEffect, useMemo, useState, useCallback } from "react";
import { marketApi } from "../../api/marketApi";

export default function Disputes() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState("");
  const [toast, setToast] = useState("");
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState("");
  // Track resolved IDs locally since backend removes them from query after reset
  const [resolvedIds, setResolvedIds] = useState(new Set());
  const [resolvedItems, setResolvedItems] = useState([]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getAdminDisputes();
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load disputes");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Merge live items with resolved items for full picture
  const allItems = useMemo(() => {
    const liveIds = new Set(items.map(d => String(d.id)));
    // Keep resolved items that are no longer in live list
    const pastResolved = resolvedItems.filter(d => !liveIds.has(String(d.id)));
    const merged = [
      ...items.map(d => ({
        ...d,
        status: resolvedIds.has(String(d.id)) ? "RESOLVED" : "OPEN",
      })),
      ...pastResolved,
    ];
    return merged;
  }, [items, resolvedIds, resolvedItems]);

  const handleResolve = async (supplierId, note) => {
    setResolving(supplierId);
    try {
      await marketApi.resolveDispute(supplierId, { note: note || "Resolved by admin" });
      // Track locally
      setResolvedIds(prev => new Set([...prev, String(supplierId)]));
      // Capture item before it disappears from live list
      const item = allItems.find(d => String(d.supplierId) === String(supplierId) || String(d.id) === String(supplierId));
      if (item) {
        setResolvedItems(prev => [
          ...prev.filter(i => String(i.id) !== String(item.id)),
          { ...item, status: "RESOLVED", resolvedNote: note, resolvedAt: new Date().toISOString() },
        ]);
      }
      showToast("Dispute resolved successfully ✓");
      setNoteModal(null);
      setNoteText("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to resolve dispute");
    } finally { setResolving(""); }
  };

  const counts = useMemo(() => ({
    all: allItems.length,
    open: allItems.filter(d => d.status === "OPEN").length,
    resolved: allItems.filter(d => d.status === "RESOLVED").length,
    critical: allItems.filter(d => d.disputeCount >= 3 && d.status === "OPEN").length,
  }), [allItems]);

  const filtered = useMemo(() => {
    let list = allItems;
    if (filter === "open") list = allItems.filter(d => d.status === "OPEN");
    else if (filter === "resolved") list = allItems.filter(d => d.status === "RESOLVED");
    else if (filter === "critical") list = allItems.filter(d => d.disputeCount >= 3 && d.status === "OPEN");

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.raisedBy || "").toLowerCase().includes(q) ||
        (d.email || "").toLowerCase().includes(q) ||
        (d.note || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [allItems, filter, search]);

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-semibold">
          {toast}
        </div>
      )}

      {/* Resolve Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-1">Resolve Dispute</h3>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <p className="font-semibold text-gray-800">{noteModal.raisedBy}</p>
              {noteModal.email && <p className="text-gray-500 text-xs">{noteModal.email}</p>}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>Disputes: <strong className="text-red-600">{noteModal.disputeCount}</strong></span>
                <span>Last: <strong>{noteModal.lastDisputeAt ? new Date(noteModal.lastDisputeAt).toLocaleDateString() : "—"}</strong></span>
              </div>
            </div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Resolution Note *</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Describe how this dispute was resolved, what action was taken..."
            />
            {!noteText.trim() && (
              <p className="text-xs text-amber-600 mt-1">Please add a resolution note for audit trail</p>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setNoteModal(null); setNoteText(""); }}
                className="flex-1 border border-gray-200 rounded-xl py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => handleResolve(noteModal.supplierId, noteText)}
                disabled={resolving === noteModal.supplierId}
                className="flex-1 bg-green-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {resolving === noteModal.supplierId ? "Resolving..." : "✓ Mark as Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Disputes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Supplier performance disputes and resolution tracking</p>
        </div>
        <button onClick={load} disabled={loading}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
          {loading
            ? <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            : "↻ Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total",        val: counts.all,      color: "bg-blue-50 border-blue-200",    text: "text-blue-700",   d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
          { label: "Open",         val: counts.open,     color: "bg-red-50 border-red-200",      text: "text-red-700",    d: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" },
          { label: "Critical (3+)",val: counts.critical, color: "bg-orange-50 border-orange-200",text: "text-orange-700", d: "M13 10V3L4 14h7v7l9-11h-7z" },
          { label: "Resolved",     val: counts.resolved, color: "bg-green-50 border-green-200",  text: "text-green-700",  d: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" },
        ].map(({ label, val, color, text, d }) => (
          <div key={label} className={`${color} border rounded-2xl p-4`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`${text} opacity-60 mb-2`}><path d={d}/></svg>
            <p className={`text-3xl font-black ${text}`}>{val}</p>
            <p className="text-xs mt-1 text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {[["all", "All"], ["open", "Open"], ["critical", "Critical"], ["resolved", "Resolved"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${filter === k ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
              {l} ({counts[k] ?? counts.all})
            </button>
          ))}
        </div>
        <input
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          placeholder="Search by supplier name, email..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Disputes list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-gray-100 rounded-2xl bg-white">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-semibold text-gray-600">No disputes found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === "all" ? "Platform health looks great!" : `No ${filter} disputes`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <div key={d.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                d.status === "RESOLVED" ? "border-green-100 bg-green-50/10 opacity-80" :
                d.disputeCount >= 3 ? "border-red-200 bg-red-50/10" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                    d.status === "RESOLVED" ? "bg-green-100" :
                    d.disputeCount >= 3 ? "bg-red-100" : "bg-orange-100"
                  }`}>
                    {d.status === "RESOLVED" ? "✅" : d.disputeCount >= 3 ? "🚨" : "⚠️"}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-900">{d.raisedBy}</p>
                      {d.email && <p className="text-xs text-gray-400">{d.email}</p>}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        d.status === "OPEN" ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"
                      }`}>
                        {d.status}
                      </span>
                      {d.disputeCount >= 3 && d.status === "OPEN" && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          CRITICAL — {d.disputeCount} disputes
                        </span>
                      )}
                    </div>

                    {d.note && <p className="text-sm text-gray-600 mb-2">{d.note}</p>}

                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                      <span>Total disputes: <strong className="text-gray-700">{d.disputeCount}</strong></span>
                      <span>Last: <strong>{d.lastDisputeAt ? new Date(d.lastDisputeAt).toLocaleDateString() : "—"}</strong></span>
                      {d.resolvedAt && (
                        <span className="text-green-600">Resolved: <strong>{new Date(d.resolvedAt).toLocaleDateString()}</strong></span>
                      )}
                    </div>

                    {/* Resolution note if resolved */}
                    {d.status === "RESOLVED" && d.resolvedNote && (
                      <div className="mt-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-700">
                        <span className="font-semibold">Resolution: </span>{d.resolvedNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {d.status === "OPEN" && (
                    <>
                      <button
                        onClick={() => { setNoteModal(d); setNoteText(""); }}
                        disabled={!!resolving}
                        className="bg-green-600 text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
                      >
                        ✓ Resolve
                      </button>
                      {d.disputeCount >= 2 && (
                        <a href="/admin/suppliers" className="text-xs text-center text-orange-600 hover:underline font-semibold">
                          View Supplier →
                        </a>
                      )}
                    </>
                  )}
                  {d.status === "RESOLVED" && (
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                      ✓ Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {counts.all === 0 && !loading && (
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">Disputes appear here when suppliers have a non-zero dispute count in their performance record</p>
        </div>
      )}
    </div>
  );
}
