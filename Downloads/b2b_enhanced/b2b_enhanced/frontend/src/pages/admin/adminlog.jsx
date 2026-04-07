import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { marketApi } from "../../api/marketApi";

/* ─── SVG Icon system ─────────────────────────────── */
const Icon = ({ d, size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);
const ICONS = {
  rfq:      "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  lead:     "M22 12h-4l-3 9L9 3l-3 9H2",
  quote:    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  buyer:    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8",
  supplier: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  check:    "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  x:        "M18 6L6 18 M6 6l12 12",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  plus:     "M12 5v14 M5 12h14",
  cart:     "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0",
  wrench:   "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  pause:    "M10 9H4v6h6V9z M20 9h-6v6h6V9z",
  play:     "M5 3l14 9-14 9V3z",
  search:   "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  filter:   "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
};

const TYPE_CONFIG = {
  rfq:      { icon: "rfq",      bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",   ring: "ring-blue-100",   label: "RFQ",      dot: "bg-blue-500"   },
  lead:     { icon: "lead",     bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200",ring: "ring-emerald-100",label: "Lead",     dot: "bg-emerald-500"},
  quote:    { icon: "quote",    bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200", ring: "ring-violet-100", label: "Quote",    dot: "bg-violet-500" },
  buyer:    { icon: "buyer",    bg: "bg-cyan-50",    text: "text-cyan-700",    border: "border-cyan-200",   ring: "ring-cyan-100",   label: "Buyer",    dot: "bg-cyan-500"   },
  supplier: { icon: "supplier", bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200", ring: "ring-orange-100", label: "Supplier", dot: "bg-orange-500" },
};

const ACTION_CONFIG = {
  CONFIRMED:  { icon: "check",  fg: "text-emerald-600", bg: "bg-emerald-50" },
  ACCEPTED:   { icon: "check",  fg: "text-emerald-600", bg: "bg-emerald-50" },
  VERIFIED:   { icon: "check",  fg: "text-emerald-600", bg: "bg-emerald-50" },
  APPROVED:   { icon: "check",  fg: "text-emerald-600", bg: "bg-emerald-50" },
  PURCHASED:  { icon: "cart",   fg: "text-violet-600",  bg: "bg-violet-50"  },
  REJECTED:   { icon: "x",      fg: "text-red-600",     bg: "bg-red-50"     },
  BLACKLISTED:{ icon: "x",      fg: "text-red-600",     bg: "bg-red-50"     },
  RESTRICTED: { icon: "lock",   fg: "text-orange-600",  bg: "bg-orange-50"  },
  SUBMITTED:  { icon: "plus",   fg: "text-blue-600",    bg: "bg-blue-50"    },
  CREATED:    { icon: "plus",   fg: "text-blue-600",    bg: "bg-blue-50"    },
  RESOLVED:   { icon: "wrench", fg: "text-cyan-600",    bg: "bg-cyan-50"    },
};

function getActionCfg(action = "") {
  for (const [k, v] of Object.entries(ACTION_CONFIG)) {
    if (action.toUpperCase().includes(k)) return v;
  }
  return { icon: "rfq", fg: "text-slate-500", bg: "bg-slate-50" };
}

const timeAgo = (d) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(d).toLocaleDateString();
};

const StatusChip = ({ action }) => {
  const cfg = getActionCfg(action);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.fg}`}>
      <Icon d={ICONS[cfg.icon]} size={9} />
      {action?.replace(/_/g, " ")}
    </span>
  );
};

export default function AdminLogs() {
  const [logs, setLogs]           = useState([]);
  const [type, setType]           = useState("all");
  const [search, setSearch]       = useState("");
  const [view, setView]           = useState("timeline");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [autoRefresh, setAuto]    = useState(true);
  const [lastUpdated, setLast]    = useState(null);
  const [expanded, setExpanded]   = useState(null);
  const intervalRef               = useRef(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getAdminLogs();
      setLogs(Array.isArray(res.data) ? res.data : []);
      setLast(new Date());
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load logs");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (autoRefresh) intervalRef.current = setInterval(load, 30000);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, load]);

  const counts = useMemo(() => ({
    all: logs.length,
    rfq: logs.filter(l => l.type === "rfq").length,
    lead: logs.filter(l => l.type === "lead").length,
    quote: logs.filter(l => l.type === "quote").length,
    buyer: logs.filter(l => l.type === "buyer").length,
    supplier: logs.filter(l => l.type === "supplier").length,
  }), [logs]);

  const filtered = useMemo(() => {
    let list = type === "all" ? logs : logs.filter(l => l.type === type);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l => (l.action || "").toLowerCase().includes(q) || (l.target || "").toLowerCase().includes(q) || (l.status || "").toLowerCase().includes(q));
    }
    return list;
  }, [logs, type, search]);

  const handleExport = () => {
    const rows = [["Time","Type","Action","Target","Status","Value"],...filtered.map(l=>[l.time ? new Date(l.time).toLocaleString():"",l.type||"",l.action||"",l.target||"",l.status||"",l.value||""])];
    const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = `admin-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Activity Log</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time platform events
            {lastUpdated && <span className="ml-2 text-slate-400">· {timeAgo(lastUpdated)}</span>}
            {autoRefresh && <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block"/>live</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setAuto(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${autoRefresh ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
            <Icon d={autoRefresh ? ICONS.pause : ICONS.play} size={12} />
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 transition">
            <Icon d={ICONS.download} size={12} />Export CSV
          </button>
          <button onClick={() => setView(v => v === "timeline" ? "table" : "timeline")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 transition">
            <Icon d={view === "timeline" ? ICONS.filter : ICONS.lead} size={12} />
            {view === "timeline" ? "Table" : "Timeline"}
          </button>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 text-slate-600 transition disabled:opacity-50">
            <Icon d={ICONS.refresh} size={12} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Type filter pills with counts */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {[["all","All"],["rfq","RFQ"],["lead","Lead"],["quote","Quote"],["buyer","Buyer"],["supplier","Supplier"]].map(([k,l]) => {
          const cfg = TYPE_CONFIG[k];
          const active = type === k;
          return (
            <button key={k} onClick={() => setType(k)}
              className={`relative flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${
                active
                  ? `${cfg?.border || "border-slate-300"} ${cfg?.bg || "bg-slate-50"} shadow-sm`
                  : "border-slate-100 bg-white hover:border-slate-200"
              }`}>
              {cfg && active && <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? (cfg?.bg || "bg-slate-50") : "bg-slate-50"}`}>
                <Icon d={ICONS[cfg?.icon || "rfq"]} size={13} className={active ? (cfg?.text || "text-slate-600") : "text-slate-400"} />
              </div>
              <span className={`text-xs font-black ${active ? (cfg?.text || "text-slate-700") : "text-slate-500"}`}>
                {counts[k]}
              </span>
              <span className={`text-[10px] font-medium ${active ? (cfg?.text || "text-slate-600") : "text-slate-400"}`}>{l}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          <Icon d={ICONS.x} size={14} className="shrink-0" />{error}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Icon d={ICONS.search} size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white"
          placeholder="Search logs by action, target, status…"
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <Icon d={ICONS.x} size={14} />
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Showing <strong>{Math.min(filtered.length, 150)}</strong> of <strong>{filtered.length}</strong> events
      </p>

      {/* Timeline View */}
      {view === "timeline" && (
        <div className="space-y-1.5">
          {filtered.slice(0, 150).map((l, i) => {
            const tc  = TYPE_CONFIG[l.type] || TYPE_CONFIG.rfq;
            const ac  = getActionCfg(l.action);
            const isX = expanded === i;
            return (
              <div key={l.id || i}
                onClick={() => setExpanded(isX ? null : i)}
                className={`group bg-white border rounded-xl transition-all cursor-pointer ${
                  isX ? "border-slate-300 shadow-md" : "border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}>
                <div className="flex items-center gap-3 p-3">
                  {/* Type icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.bg} ${tc.border} border`}>
                    <Icon d={ICONS[tc.icon]} size={15} className={tc.text} />
                  </div>

                  {/* Action icon */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${ac.bg}`}>
                    <Icon d={ICONS[ac.icon]} size={11} className={ac.fg} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border ${tc.bg} ${tc.text} ${tc.border}`}>
                        {tc.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">{l.action}</span>
                      {l.value && (
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
                          ₹{Number(l.value).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 truncate">{l.target}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(l.time)}</span>
                    {l.status && <StatusChip action={l.status} />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isX && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 rounded-b-xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div><p className="text-slate-400 font-semibold mb-0.5">Time</p><p className="text-slate-700 font-medium">{l.time ? new Date(l.time).toLocaleString() : "—"}</p></div>
                    <div><p className="text-slate-400 font-semibold mb-0.5">Action</p><p className="text-slate-700 font-mono font-bold">{l.action}</p></div>
                    <div><p className="text-slate-400 font-semibold mb-0.5">Target</p><p className="text-slate-700 truncate">{l.target || "—"}</p></div>
                    <div><p className="text-slate-400 font-semibold mb-0.5">Status</p><p className={`font-bold ${ac.fg}`}>{l.status || "—"}</p></div>
                    <div><p className="text-slate-400 font-semibold mb-0.5">Type</p><p className={`font-bold ${tc.text}`}>{tc.label}</p></div>
                    {l.value && <div><p className="text-slate-400 font-semibold mb-0.5">Value</p><p className="text-violet-600 font-bold">₹{Number(l.value).toLocaleString()}</p></div>}
                    {l.id && <div className="col-span-full"><p className="text-slate-400 font-semibold mb-0.5">Event ID</p><p className="text-slate-500 font-mono text-[10px]">{l.id}</p></div>}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl bg-white">
              <Icon d={ICONS.search} size={32} className="mx-auto text-slate-200 mb-3" />
              <p className="font-semibold text-slate-500">No logs match your filter</p>
              <p className="text-sm text-slate-400 mt-1">Try clearing the search or selecting a different type</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Time","Type","Action","Target","Status","Value"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.slice(0, 150).map((l, i) => {
                  const tc = TYPE_CONFIG[l.type] || TYPE_CONFIG.rfq;
                  const ac = getActionCfg(l.action);
                  return (
                    <tr key={l.id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{l.time ? new Date(l.time).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tc.bg} ${tc.text} ${tc.border}`}>
                          <Icon d={ICONS[tc.icon]} size={9} />
                          {tc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-semibold text-slate-700">{l.action}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate">{l.target || "—"}</td>
                      <td className="px-4 py-3">{l.status ? <StatusChip action={l.status} /> : <span className="text-xs text-slate-300">—</span>}</td>
                      <td className="px-4 py-3 text-xs font-bold text-violet-600">{l.value ? `₹${Number(l.value).toLocaleString()}` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <Icon d={ICONS.search} size={28} className="mx-auto text-slate-200 mb-3" />
              <p>No logs found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
