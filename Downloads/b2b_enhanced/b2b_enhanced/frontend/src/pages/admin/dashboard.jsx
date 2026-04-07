import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { marketApi } from "../../api/marketApi";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className="tabular-nums text-xs text-slate-400 font-mono">{now.toLocaleTimeString("en-IN")}</span>;
}

const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}><path d={d} /></svg>
);

const ICONS = {
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  factory:  "M2 20V9l7-7 7 7v11H2z M9 20v-6h4v6 M16 20V9",
  file:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  target:   "M22 12h-4l-3 9L9 3l-3 9H2",
  quote:    "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  check:    "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  trend:    "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  arrow:    "M5 12h14 M12 5l7 7-7 7",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  x:        "M18 6L6 18M6 6l12 12",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  ban:      "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  message:  "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

const StatusDot = ({ state }) => {
  const map = { CONFIRMED:"bg-emerald-500", SUBMITTED:"bg-amber-400", REJECTED:"bg-red-400", CLARIFICATION_REQUIRED:"bg-orange-400", CLOSED:"bg-slate-300" };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${map[state]||"bg-slate-300"}`} />;
};

const PipelineStep = ({ label, val, total, color }) => {
  const pct = total > 0 ? Math.round((val/total)*100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }}
          className={`h-full rounded-full ${color}`} />
      </div>
      <span className="text-xs font-bold text-slate-700 w-8 text-right shrink-0">{val}</span>
      <span className="text-[10px] text-slate-400 w-8 shrink-0">{pct}%</span>
    </div>
  );
};

const KPIRow = ({ label, value, good, warn }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-600">{label}</span>
    <span className={`text-sm font-bold ${good?"text-emerald-600":warn?"text-orange-500":"text-slate-800"}`}>{value}</span>
  </div>
);

// Quick Action Sub-buttons per section
function QuickActions({ type, navigate }) {
  const actions = {
    buyers: [
      { label:"Verify Pending", icon:ICONS.check, color:"text-emerald-600 hover:bg-emerald-50", fn:()=>navigate("/admin/buyers") },
      { label:"Add Buyer",      icon:ICONS.plus,  color:"text-blue-600 hover:bg-blue-50",     fn:()=>navigate("/admin/buyers") },
      { label:"View Restricted",icon:ICONS.lock,  color:"text-red-600 hover:bg-red-50",       fn:()=>navigate("/admin/buyers") },
    ],
    suppliers: [
      { label:"Approve New",    icon:ICONS.check,   color:"text-emerald-600 hover:bg-emerald-50", fn:()=>navigate("/admin/suppliers") },
      { label:"Set SQI",        icon:ICONS.star,    color:"text-amber-600 hover:bg-amber-50",     fn:()=>navigate("/admin/suppliers") },
      { label:"Lead Access",    icon:ICONS.zap,     color:"text-violet-600 hover:bg-violet-50",   fn:()=>navigate("/admin/suppliers") },
    ],
    rfqs: [
      { label:"Validate RFQs",  icon:ICONS.check,   color:"text-emerald-600 hover:bg-emerald-50", fn:()=>navigate("/admin/rfqs") },
      { label:"Shortlist Suppliers", icon:ICONS.users, color:"text-blue-600 hover:bg-blue-50",   fn:()=>navigate("/admin/rfqs") },
      { label:"Reject Invalid", icon:ICONS.ban,     color:"text-red-600 hover:bg-red-50",        fn:()=>navigate("/admin/rfqs") },
    ],
    leads: [
      { label:"Create Lead",    icon:ICONS.plus,    color:"text-blue-600 hover:bg-blue-50",       fn:()=>navigate("/admin/leads") },
      { label:"View Purchased", icon:ICONS.eye,     color:"text-violet-600 hover:bg-violet-50",   fn:()=>navigate("/admin/leads") },
      { label:"Export Data",    icon:ICONS.download,color:"text-orange-600 hover:bg-orange-50",   fn:()=>navigate("/admin/leads") },
    ],
  };
  const list = actions[type] || [];
  return (
    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
      {list.map((a, i) => (
        <button key={i} onClick={a.fn}
          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors ${a.color}`}>
          <Icon d={a.icon} size={11} />{a.label}
        </button>
      ))}
    </div>
  );
}

// Stat Card with sub-actions
const StatCard = ({ title, value, sub, icon, iconBg, to, urgent, trend, children }) => (
  <Link to={to||"#"}
    className={`group relative bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all overflow-hidden block
      ${urgent?"border-red-200":"border-slate-100"}`}>
    {urgent && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-400 to-orange-400" />}
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none">{title}</p>
        <p className={`text-3xl font-black mt-2 leading-none ${urgent?"text-red-600":"text-slate-800"}`}>
          {value ?? <span className="text-slate-300">—</span>}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1.5 ${trend>=0?"text-emerald-600":"text-red-500"}`}>
            <Icon d={trend>=0?"M23 6l-9.5 9.5-5-5L1 18":"M1 6l9.5 9.5 5-5L23 18"} size={10} />
            <span className="text-[10px] font-bold">{Math.abs(trend)} this week</span>
          </div>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg||"bg-slate-100"}`}>
        <Icon d={icon} size={18} className="opacity-70" />
      </div>
    </div>
    {children}
  </Link>
);

const SectionHeader = ({ title, linkTo, badge }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h3>
      {badge > 0 && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">{badge}</span>}
    </div>
    {linkTo && <Link to={linkTo} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">View all <Icon d={ICONS.arrow} size={11} /></Link>}
  </div>
);

const tabs = [
  { id:"overview",    label:"Overview"    },
  { id:"pipeline",    label:"Pipeline"    },
  { id:"rfqs",        label:"RFQs"        },
  { id:"performance", label:"Performance" },
];

export default function AdminDashboard() {
  const [overview,  setOverview]  = useState(null);
  const [metrics,   setMetrics]   = useState(null);
  const [flow,      setFlow]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [ov, mt, fh] = await Promise.all([
        marketApi.getAdminOverview(),
        marketApi.getAdminMetrics(),
        marketApi.getAdminFlowHealth(),
      ]);
      setOverview(ov.data);
      setMetrics(mt.data);
      setFlow(fh.data);
      setLastRefresh(new Date());
    } catch(e) {
      setError(e?.response?.data?.message || "Failed to load dashboard data");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ov = overview || {};
  const mt = metrics  || {};
  const fh = flow     || {};

  const urgentCount = (ov.buyers?.pendingVerification||0) + (ov.rfqs?.submitted||0) + (ov.rfqs?.clarificationRequired||0);

  return (
    <div className="p-6 space-y-6 max-w-7xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform overview · <LiveClock /></p>
          {lastRefresh && <p className="text-[10px] text-slate-400 mt-0.5">Last refreshed {lastRefresh.toLocaleTimeString("en-IN")}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {urgentCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-red-700">{urgentCount} action{urgentCount>1?"s":""} needed</span>
            </div>
          )}
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors">
            <Icon d={ICONS.refresh} size={13} className={`text-slate-500 ${loading?"animate-spin":""}`} />
            <span className="text-sm text-slate-600">Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          <Icon d={ICONS.alert} size={13} className="shrink-0" />{error}
        </div>
      )}

      {/* Urgent Banner */}
      {urgentCount > 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon d={ICONS.alert} size={13} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Urgent Actions Required</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ov.buyers?.pendingVerification > 0 && (
              <Link to="/admin/buyers" className="bg-white border border-amber-200 rounded-xl p-3 hover:shadow-sm transition-all flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Icon d={ICONS.users} size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-lg font-black text-amber-700">{ov.buyers.pendingVerification}</p>
                  <p className="text-xs text-slate-500">Buyers pending verification</p>
                </div>
              </Link>
            )}
            {ov.rfqs?.submitted > 0 && (
              <Link to="/admin/rfqs" className="bg-white border border-amber-200 rounded-xl p-3 hover:shadow-sm transition-all flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon d={ICONS.file} size={15} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-black text-blue-700">{ov.rfqs.submitted}</p>
                  <p className="text-xs text-slate-500">RFQs pending validation</p>
                </div>
              </Link>
            )}
            {ov.rfqs?.clarificationRequired > 0 && (
              <Link to="/admin/rfqs" className="bg-white border border-orange-200 rounded-xl p-3 hover:shadow-sm transition-all flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Icon d={ICONS.alert} size={15} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-lg font-black text-orange-700">{ov.rfqs.clarificationRequired}</p>
                  <p className="text-xs text-slate-500">RFQs need clarification</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab===t.id?"bg-white shadow-sm text-slate-900":"text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading dashboard…</p>
          </div>
        </div>
      )}

      {/* ── OVERVIEW TAB ── */}
      {!loading && activeTab==="overview" && (
        <div className="space-y-6">

          {/* Buyers Section */}
          <div>
            <SectionHeader title="Buyers" linkTo="/admin/buyers" badge={ov.buyers?.pendingVerification||0} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Buyers</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{ov.buyers?.total ?? "—"}</p>
                    {ov.buyers?.newThisWeek !== undefined && (
                      <div className="flex items-center gap-1 mt-1.5 text-emerald-600">
                        <Icon d={ICONS.trend} size={10} />
                        <span className="text-[10px] font-bold">+{ov.buyers.newThisWeek} this week</span>
                      </div>
                    )}
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon d={ICONS.users} size={18} className="text-blue-600 opacity-70" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-50">
                  {[
                    { l:"Verified",  v:ov.buyers?.verified,             c:"text-emerald-600" },
                    { l:"Pending",   v:ov.buyers?.pendingVerification,   c:"text-amber-600"   },
                    { l:"Restricted",v:ov.buyers?.restricted,            c:"text-red-500"     },
                  ].map(({ l,v,c }) => (
                    <div key={l} className="text-center">
                      <p className={`text-xl font-black ${c}`}>{v??0}</p>
                      <p className="text-[10px] text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>
                <QuickActions type="buyers" navigate={navigate} />
              </div>
              <StatCard title="Pending Verification" value={ov.buyers?.pendingVerification} icon={ICONS.clock}
                iconBg="bg-amber-50 text-amber-600" to="/admin/buyers" urgent={ov.buyers?.pendingVerification > 0}
                sub="needs admin action" />
              <StatCard title="New This Week" value={ov.buyers?.newThisWeek} icon={ICONS.trend}
                iconBg="bg-purple-50 text-purple-600" to="/admin/buyers" />
            </div>
          </div>

          {/* Suppliers Section */}
          <div>
            <SectionHeader title="Suppliers" linkTo="/admin/suppliers" badge={ov.suppliers?.pending||0} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Suppliers</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{ov.suppliers?.total ?? "—"}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon d={ICONS.factory} size={18} className="opacity-70" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-50">
                  {[
                    { l:"Approved",  v:ov.suppliers?.approved, c:"text-emerald-600" },
                    { l:"Pending",   v:ov.suppliers?.pending,  c:"text-amber-600"   },
                    { l:"Restricted",v:ov.suppliers?.restricted,c:"text-red-500"    },
                  ].map(({ l,v,c }) => (
                    <div key={l} className="text-center">
                      <p className={`text-xl font-black ${c}`}>{v??0}</p>
                      <p className="text-[10px] text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>
                <QuickActions type="suppliers" navigate={navigate} />
              </div>
              <StatCard title="Pending Approval" value={ov.suppliers?.pending} icon={ICONS.clock}
                iconBg="bg-amber-50 text-amber-600" to="/admin/suppliers" urgent={ov.suppliers?.pending > 0} />
              <StatCard title="Avg SQI" value={mt.sqi?.avg ? mt.sqi.avg.toFixed(0) : "—"} icon={ICONS.star}
                iconBg="bg-amber-50 text-amber-600" to="/admin/suppliers" />
            </div>
          </div>

          {/* RFQs Section */}
          <div>
            <SectionHeader title="RFQs" linkTo="/admin/rfqs" badge={(ov.rfqs?.submitted||0)+(ov.rfqs?.clarificationRequired||0)} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total RFQs</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{ov.rfqs?.total ?? "—"}</p>
                    {ov.rfqs?.newThisWeek !== undefined && (
                      <div className="flex items-center gap-1 mt-1.5 text-emerald-600">
                        <Icon d={ICONS.trend} size={10} />
                        <span className="text-[10px] font-bold">+{ov.rfqs.newThisWeek} this week</span>
                      </div>
                    )}
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Icon d={ICONS.file} size={18} className="text-blue-600 opacity-70" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-slate-50">
                  {[
                    { l:"Confirmed",v:ov.rfqs?.confirmed,            c:"text-emerald-600" },
                    { l:"Pending",  v:ov.rfqs?.submitted,            c:"text-amber-600"   },
                    { l:"Clarif.",  v:ov.rfqs?.clarificationRequired,c:"text-orange-600"  },
                    { l:"Rejected", v:ov.rfqs?.rejected,             c:"text-red-500"     },
                  ].map(({ l,v,c }) => (
                    <div key={l} className="text-center">
                      <p className={`text-lg font-black ${c}`}>{v??0}</p>
                      <p className="text-[9px] text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>
                <QuickActions type="rfqs" navigate={navigate} />
              </div>
              <StatCard title="Needs Validation" value={ov.rfqs?.submitted} icon={ICONS.clock}
                iconBg="bg-amber-50 text-amber-600" to="/admin/rfqs" urgent={ov.rfqs?.submitted > 0} sub="action required" />
              <StatCard title="Overdue RFQs" value={ov.rfqs?.overdueRfqs} icon={ICONS.alert}
                iconBg="bg-red-50 text-red-500" to="/admin/rfqs" urgent={ov.rfqs?.overdueRfqs > 0} sub="past delivery date" />
            </div>
          </div>

          {/* Marketplace Section */}
          <div>
            <SectionHeader title="Lead Marketplace" linkTo="/admin/leads" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:col-span-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</p>
                    <p className="text-3xl font-black text-slate-800 mt-1">{ov.leads?.total ?? "—"}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Icon d={ICONS.target} size={18} className="text-cyan-600 opacity-70" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-50">
                  {[
                    { l:"Available", v:ov.leads?.available,    c:"text-blue-600"   },
                    { l:"Purchased", v:ov.leads?.purchased,    c:"text-emerald-600" },
                    { l:"Expiring",  v:ov.leads?.expiringSoon, c:"text-orange-600"  },
                  ].map(({ l,v,c }) => (
                    <div key={l} className="text-center">
                      <p className={`text-xl font-black ${c}`}>{v??0}</p>
                      <p className="text-[10px] text-slate-400">{l}</p>
                    </div>
                  ))}
                </div>
                <QuickActions type="leads" navigate={navigate} />
              </div>
              <StatCard title="Quotes Total" value={ov.quotes?.total} icon={ICONS.quote}
                iconBg="bg-violet-50 text-violet-600" to="/admin/quotes" />
              <StatCard title="Quotes Accepted" value={ov.quotes?.accepted} icon={ICONS.check}
                iconBg="bg-emerald-50 text-emerald-600" to="/admin/quotes" />
            </div>
          </div>
        </div>
      )}

      {/* ── PIPELINE TAB ── */}
      {!loading && activeTab==="pipeline" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-1">Lead Conversion Pipeline</h3>
              <p className="text-xs text-slate-400 mb-5">End-to-end flow from RFQ to deal closed</p>
              <div className="space-y-3">
                <PipelineStep label="RFQs Created"      val={mt.totalRFQs||0}      total={mt.totalRFQs||1}      color="bg-blue-500" />
                <PipelineStep label="Leads Generated"   val={mt.totalLeads||0}     total={mt.totalRFQs||1}      color="bg-cyan-500" />
                <PipelineStep label="Leads Purchased"   val={mt.totalPurchases||0} total={mt.totalLeads||1}     color="bg-violet-500" />
                <PipelineStep label="Quotes Submitted"  val={mt.totalQuotes||0}    total={mt.totalPurchases||1} color="bg-amber-500" />
                <PipelineStep label="Deals Converted"   val={Math.round((mt.conversionRate||0)*(mt.totalQuotes||0))} total={mt.totalQuotes||1} color="bg-emerald-500" />
              </div>
              <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-xs text-slate-400">Overall conversion rate</span>
                <span className="text-xl font-black text-emerald-600">{((mt.conversionRate||0)*100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-slate-800 mb-1">Recent RFQ Status</h3>
              <p className="text-xs text-slate-400 mb-4">Per-RFQ pipeline state</p>
              <div className="space-y-2.5">
                {(fh.items||[]).slice(0,7).map(item => (
                  <div key={item.rfqId} className="flex items-center gap-3">
                    <StatusDot state={item.state} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{item.title||"Untitled"}</p>
                      <p className="text-[10px] text-slate-400">{item.state}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 shrink-0">
                      <span>{item.counts.leads} leads</span>
                      <span>{item.counts.quotes} quotes</span>
                      {item.isOverdue && <span className="text-red-500 font-bold">OVERDUE</span>}
                    </div>
                  </div>
                ))}
                {(!fh.items||fh.items.length===0) && (
                  <p className="text-sm text-slate-400 text-center py-6">No RFQ data yet</p>
                )}
              </div>
              <Link to="/admin/flow-health" className="flex items-center justify-center gap-1 mt-4 pt-3 border-t border-slate-50 text-xs font-semibold text-primary hover:underline">
                View full pipeline <Icon d={ICONS.arrow} size={11} />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">RFQ Flow Health</h3>
                <p className="text-xs text-slate-400 mt-0.5">{fh.total||0} RFQs tracked end-to-end</p>
              </div>
              <Link to="/admin/flow-health" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Full view <Icon d={ICONS.arrow} size={10} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["RFQ Title","State","Leads","Purchased","Quotes","Accepted","Delivery",""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(fh.items||[]).slice(0,10).map(item => (
                    <tr key={item.rfqId} className={`hover:bg-slate-50 transition-colors ${item.isOverdue?"bg-red-50/20":""}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-700 text-xs max-w-[160px] truncate">{item.title||"—"}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">…{item.rfqId.slice(-6)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <StatusDot state={item.state} />
                          <span className="text-[11px] font-semibold text-slate-600">{item.state?.replace(/_/g," ")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-700 text-sm">{item.counts.leads}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 text-sm">{item.counts.purchasedLeads}</td>
                      <td className="px-4 py-3 font-bold text-slate-700 text-sm">{item.counts.quotes}</td>
                      <td className="px-4 py-3 font-bold text-blue-600 text-sm">{item.counts.acceptedQuotes}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{item.deliveryDate?new Date(item.deliveryDate).toLocaleDateString("en-IN"):"—"}</td>
                      <td className="px-4 py-3">
                        {item.isOverdue && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">Overdue</span>}
                        {item.isUpcoming && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">Due Soon</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!fh.items||fh.items.length===0) && (
              <div className="text-center py-12 text-slate-400">
                <Icon d={ICONS.file} size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No RFQ flow data yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RFQs TAB ── */}
      {!loading && activeTab==="rfqs" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total RFQs"       value={ov.rfqs?.total}                  icon={ICONS.file}   iconBg="bg-blue-50 text-blue-600"    to="/admin/rfqs" trend={ov.rfqs?.newThisWeek} />
            <StatCard title="Needs Validation"  value={ov.rfqs?.submitted}              icon={ICONS.clock}  iconBg="bg-amber-50 text-amber-600"  to="/admin/rfqs" urgent={ov.rfqs?.submitted>0} sub="submit → validate" />
            <StatCard title="Live (Confirmed)"  value={ov.rfqs?.confirmed}              icon={ICONS.check}  iconBg="bg-emerald-50 text-emerald-600" to="/admin/rfqs" />
            <StatCard title="Clarification"     value={ov.rfqs?.clarificationRequired}  icon={ICONS.alert}  iconBg="bg-orange-50 text-orange-600" to="/admin/rfqs" urgent={ov.rfqs?.clarificationRequired>0} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Rejected"      value={ov.rfqs?.rejected}       icon={ICONS.lock}  iconBg="bg-red-50 text-red-500"   to="/admin/rfqs" />
            <StatCard title="Closed"        value={ov.rfqs?.closed}         icon={ICONS.lock}  iconBg="bg-slate-100 text-slate-500" to="/admin/rfqs" />
            <StatCard title="Due in 30 Days" value={ov.rfqs?.upcomingDelivery} icon={ICONS.clock} iconBg="bg-purple-50 text-purple-600" sub="confirmed RFQs" />
            <StatCard title="Overdue"       value={ov.rfqs?.overdueRfqs}    icon={ICONS.alert} iconBg="bg-red-50 text-red-500" to="/admin/rfqs" urgent={ov.rfqs?.overdueRfqs>0} sub="delivery date passed" />
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">RFQ State Distribution</h3>
            <div className="space-y-3">
              {[
                { label:"Submitted (Awaiting Validation)", val:ov.rfqs?.submitted||0,              color:"bg-amber-400"   },
                { label:"Confirmed (Live)",                val:ov.rfqs?.confirmed||0,              color:"bg-emerald-500" },
                { label:"Clarification Required",         val:ov.rfqs?.clarificationRequired||0,  color:"bg-orange-400"  },
                { label:"Rejected",                       val:ov.rfqs?.rejected||0,               color:"bg-red-400"     },
                { label:"Closed",                         val:ov.rfqs?.closed||0,                 color:"bg-slate-300"   },
              ].map(({ label,val,color }) => (
                <PipelineStep key={label} label={label} val={val} total={ov.rfqs?.total||1} color={color} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
              <Link to="/admin/rfqs"
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover px-4 py-2 rounded-xl transition-colors">
                <Icon d={ICONS.check} size={12} /> Go to RFQ Management
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── PERFORMANCE TAB ── */}
      {!loading && activeTab==="performance" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Platform KPIs</h3>
            <div className="space-y-0.5">
              <KPIRow label="Total RFQs Created"    value={mt.totalRFQs||0} />
              <KPIRow label="Total Leads Generated"  value={mt.totalLeads||0} />
              <KPIRow label="Leads Purchased"        value={mt.totalPurchases||0} />
              <KPIRow label="Quotes Submitted"       value={mt.totalQuotes||0} />
              <KPIRow label="Lead Conversion Rate"   value={`${((mt.conversionRate||0)*100).toFixed(1)}%`} good />
              <KPIRow label="Avg Supplier SQI"       value={(mt.sqi?.avg||0).toFixed(1)} good={(mt.sqi?.avg||0)>=50} warn={(mt.sqi?.avg||0)<30} />
              <KPIRow label="Highest SQI"            value={mt.sqi?.max||0} />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Top Suppliers by SQI</h3>
              <Link to="/admin/suppliers" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">All suppliers <Icon d={ICONS.arrow} size={10} /></Link>
            </div>
            <div className="space-y-4">
              {(mt.sqi?.topSuppliers||[]).map((s, i) => {
                const rankStyles = ["bg-amber-100 text-amber-700","bg-slate-100 text-slate-600","bg-orange-50 text-orange-600"];
                const levelStyles = { PLATINUM:"bg-purple-100 text-purple-700 border-purple-200", GOLD:"bg-amber-100 text-amber-700 border-amber-200", SILVER:"bg-slate-100 text-slate-600 border-slate-200", BRONZE:"bg-orange-50 text-orange-600 border-orange-200" };
                return (
                  <div key={s._id} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${rankStyles[i]||"bg-slate-100 text-slate-500"}`}>{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{s.userId?.name||`Supplier ${i+1}`}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width:`${s.SQI?.score||0}%` }} />
                        </div>
                        <span className="text-xs font-black text-slate-700 w-7 text-right">{s.SQI?.score||0}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${levelStyles[s.SQI?.level]||levelStyles.BRONZE}`}>{s.SQI?.level||"BRONZE"}</span>
                  </div>
                );
              })}
              {(!mt.sqi?.topSuppliers||mt.sqi.topSuppliers.length===0) && (
                <div className="text-center py-8">
                  <Icon d={ICONS.users} size={28} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No approved suppliers yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 md:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4">Platform Health Rates</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label:"Buyer Verified",     pct:ov.buyers?.total>0?Math.round((ov.buyers.verified/ov.buyers.total)*100):0,         color:"bg-emerald-500" },
                { label:"Suppliers Approved", pct:ov.suppliers?.total>0?Math.round((ov.suppliers.approved/ov.suppliers.total)*100):0, color:"bg-blue-500"    },
                { label:"RFQs Confirmed",     pct:ov.rfqs?.total>0?Math.round((ov.rfqs.confirmed/ov.rfqs.total)*100):0,               color:"bg-violet-500"  },
                { label:"Leads Purchased",    pct:ov.leads?.total>0?Math.round((ov.leads.purchased/ov.leads.total)*100):0,            color:"bg-amber-500"   },
              ].map(({ label,pct,color }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4">
                  <p className={`text-2xl font-black mb-2 ${pct>=70?"text-emerald-600":pct>=40?"text-amber-600":"text-red-500"}`}>{pct}%</p>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }}
                      className={`h-full ${color} rounded-full`} />
                  </div>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-50">
              <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">Pipeline Depth</p>
              <div className="flex items-end gap-3">
                {[
                  { label:"RFQs",   val:mt.totalRFQs||0,      color:"bg-blue-400"    },
                  { label:"Leads",  val:mt.totalLeads||0,     color:"bg-cyan-400"    },
                  { label:"Bought", val:mt.totalPurchases||0, color:"bg-violet-400"  },
                  { label:"Quotes", val:mt.totalQuotes||0,    color:"bg-amber-400"   },
                ].map(({ label,val,color }) => {
                  const maxVal = Math.max(mt.totalRFQs||1, 1);
                  const h = Math.max(8, Math.round((val/maxVal)*72));
                  return (
                    <div key={label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[11px] font-bold text-slate-600">{val}</span>
                      <motion.div initial={{ height:0 }} animate={{ height:`${h}px` }} transition={{ duration:0.8 }}
                        className={`w-full ${color} rounded-t-lg opacity-80`} />
                      <span className="text-[10px] text-slate-400">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
