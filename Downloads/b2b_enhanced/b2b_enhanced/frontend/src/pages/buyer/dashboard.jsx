 import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import { marketApi } from "../../api/marketApi";
import { exportToCsv } from "../../utils/csvExport";


const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  check: "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  rfq: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  trending: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  pause: "M10 4H6v16h4V4zM18 4h-4v16h4V4z",
  filter: "M22 3H2l8 9.46V19l4 2V12.46L22 3z",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  plus: "M12 5v14M5 12h14",
  clock: "M12 22a10 10 0 110-20 10 10 0 010 20zM12 6v6l4 2",
  arrow: "M5 12h14M12 5l7 7-7 7",
};

const STATUS_MAP = {
  Matched: "bg-success-soft text-success border border-success",
  "Quotes Due": "bg-warning-soft text-warning border border-warning",
  Validated: "bg-info-soft text-info border border-info",
  Pending: "bg-surface-2 text-text-muted border border-border",
  New: "bg-info-soft text-info border border-info",
  Reviewed: "bg-secondary text-white border border-secondary",
  "In Production": "bg-warning-soft text-warning border border-warning",
  Delivered: "bg-success-soft text-success border border-success",
  Shipped: "bg-info-soft text-info border border-info",
};

const Badge = ({ s }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_MAP[s] || "bg-surface-2 text-text-muted"}`}>
    {s}
  </span>
);

const SqiBadge = ({ v }) => {
  const c = v >= 90 ? "bg-success" : v >= 80 ? "bg-secondary" : "bg-warning";
  return <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-full ${c}`}>{v} SQI</span>;
};

const ProgressBar = ({ p }) => (
  <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
    <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }}
      transition={{ duration: 0.9, delay: 0.2 }}
      className="h-full bg-primary rounded-full" />
  </div>
);

const StatCard = ({ label, value, icon, color, sub, delay }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-background rounded-2xl p-5 border border-border shadow-sm hover:shadow-md
      transition-shadow flex items-start gap-4 relative overflow-hidden group cursor-default">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${color}`}>
      <Icon d={ICONS[icon]} size={19} />
    </div>
    <div>
      <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-black text-text">{value}</p>
      {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
    </div>
    <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-[0.07]
      group-hover:scale-125 transition-transform duration-500 ${color}`} />
  </motion.div>
);

const TABS = ["Active RFQs", "Quotes Received", "Orders", "Analytics"];

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("Active RFQs");
  const [profile, setProfile] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [profRes, rfqRes] = await Promise.allSettled([
        marketApi.getBuyerProfile(),
        marketApi.getBuyerRfqs(),
      ]);
      if (profRes.status === "fulfilled") setProfile(profRes.value.data);
      if (rfqRes.status === "fulfilled") setRfqs(Array.isArray(rfqRes.value.data) ? rfqRes.value.data : []);

      // Load quotes for all RFQs
      if (rfqRes.status === "fulfilled" && rfqRes.value.data.length > 0) {
        const quotePromises = rfqRes.value.data.map(rfq => marketApi.getRfqQuotes(rfq._id));
        const quoteResults = await Promise.allSettled(quotePromises);
        const allQuotes = quoteResults
          .filter(res => res.status === "fulfilled")
          .flatMap((res, i) => res.value.data.map(q => ({ ...q, rfqId: rfqRes.value.data[i]._id, rfqTitle: rfqRes.value.data[i].title })));
        setQuotes(allQuotes);
      }
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: rfqs.length,
    confirmed: rfqs.filter(r => r.state === "CONFIRMED").length,
    pending: rfqs.filter(r => ["SUBMITTED", "UNDER_VALIDATION"].includes(r.state)).length,
  }), [rfqs]);

  const activeRfqs = useMemo(() => rfqs.filter(r => r.state !== "CLOSED" && r.state !== "REJECTED"), [rfqs]);

  const topSuppliers = useMemo(() => {
    // Group quotes by supplier and calculate avg SQI
    const supplierMap = {};
    quotes.forEach(q => {
      if (!supplierMap[q.supplierId]) {
        supplierMap[q.supplierId] = { name: q.supplierName || "Unknown", sqi: [], count: 0 };
      }
      supplierMap[q.supplierId].sqi.push(q.sqi || 80);
      supplierMap[q.supplierId].count += 1;
    });
    return Object.values(supplierMap)
      .map(s => ({ ...s, avgSqi: s.sqi.reduce((a, b) => a + b, 0) / s.sqi.length }))
      .sort((a, b) => b.avgSqi - a.avgSqi)
      .slice(0, 3);
  }, [quotes]);

  const monthlySummary = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const rfqsThisMonth = rfqs.filter(r => {
      const d = new Date(r.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const quotesThisMonth = quotes.filter(q => {
      const d = new Date(q.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    let savings = 0;
    let count = 0;
    quotes.forEach(q => {
      const rfq = rfqs.find(r => r._id === q.rfqId);
      if (rfq && rfq.budgetRange?.max && q.quotedPrice && q.quotedPrice < rfq.budgetRange.max) {
        savings += ((rfq.budgetRange.max - q.quotedPrice) / rfq.budgetRange.max);
        count++;
      }
    });

    return {
      rfqsCreated: rfqsThisMonth,
      quotesReceived: quotesThisMonth,
      avgSavings: count > 0 ? Math.round((savings / count) * 100) + "%" : "0%",
      activeSuppliers: new Set(quotes.map(q => q.supplierId)).size,
    };
  }, [rfqs, quotes]);

  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const rfqsCount = rfqs.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }).length;
      const ordersCount = quotes.filter(q => {
        const d = new Date(q.createdAt);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear() && q.status === 'accepted';
      }).length;
      months.push({ m: monthName, r: rfqsCount, o: ordersCount });
    }
    return months;
  }, [rfqs, quotes]);

  if (loading) return (
    <div className="flex items-center justify-center h-64 bg-background text-text">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 bg-background text-text">
      <div className="bg-danger-soft border border-danger text-danger rounded-xl p-4 text-sm max-w-md text-center">
        {error}
      </div>
    </div>
  );
  console.log({ profile, rfqs, quotes });
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-text">
            Welcome back, <span className="text-primary">{profile?.name?.toUpperCase() || "Buyer"}</span> 👋
          </h1>
          <p className="text-sm mt-1 text-text-muted">Here's your sourcing overview for today.</p>
        </div>
        
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="SQI Matches" value={quotes.length} icon="check" color="bg-primary" sub="Active matches" delay={0.05} />
        <StatCard label="Active RFQs" value={activeRfqs.length} icon="rfq" color="bg-secondary" sub="In progress" delay={0.10} />
        <StatCard label="Orders Won" value={quotes.filter(q => q.status === "ACCEPTED").length} icon="trending" color="bg-info" sub="Last 30 days" delay={0.15} />
        <StatCard label="Conversion Rate" value={stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) + "%" : "0%"} icon="dollar" color="bg-success" sub="+5% vs last month" delay={0.20} />
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Deadlines */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl shadow-sm p-5 bg-background border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Icon d={ICONS.clock} size={15} className="text-warning" />
            <p className="text-sm font-bold text-text">Upcoming Deadlines</p>
          </div>
          <div className="space-y-3">
            {activeRfqs.slice(0, 3).map(r => (
              <div key={r._id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate text-text">{r._id.slice(-8)}</p>
                  <p className="text-[11px] truncate text-text-muted">{r.rfqType}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] font-bold mb-0.5 text-text">{r.timeLine?.expectedDeliveryDate ? new Date(r.timeLine.expectedDeliveryDate).toLocaleDateString() : "TBD"}</p>
                  <Badge s={r.state === "CONFIRMED" ? "Matched" : r.state === "SUBMITTED" ? "Pending" : r.state === "UNDER_VALIDATION" ? "Validated" : "Pending"} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Suppliers */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30 }}
          className="rounded-2xl shadow-sm p-5 bg-background border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-sm font-bold text-text">Top Matched Suppliers</p>
          </div>
          <div className="space-y-3">
            {topSuppliers.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary
              flex items-center justify-center text-xs font-black shrink-0">
                  {s.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate text-text">{s.name}</p>
                  <p className="text-[11px] text-text-muted">{s.count} quotes</p>
                </div>
                <SqiBadge v={Math.round(s.avgSqi)} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl p-5 shadow-lg bg-primary text-white">
          <p className="text-sm font-bold opacity-75 mb-4">This Month's Summary</p>
          <div className="space-y-3.5">
            {[
              { l: "RFQs Created", v: monthlySummary.rfqsCreated },
              { l: "Quotes Received", v: monthlySummary.quotesReceived },
              { l: "Avg Savings", v: monthlySummary.avgSavings },
              { l: "Active Suppliers", v: monthlySummary.activeSuppliers },
            ].map(x => (
              <div key={x.l} className="flex justify-between items-center">
                <p className="text-xs opacity-70">{x.l}</p>
                <p className="text-base font-black">{x.v}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/buyer/profile")}
            className="mt-5 w-full flex items-center justify-center gap-1.5 text-xs font-bold
          py-2 rounded-xl transition-colors bg-white/15 hover:bg-white/25 border border-white/20">
            View Full Profile <Icon d={ICONS.arrow} size={12} />
          </button>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">

        {/* Tab Bar */}
        <div className="flex items-center border-b border-border px-5 pt-4 gap-1">
          <div className="flex gap-0.5 flex-1 overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative px-4 py-2.5 text-sm font-semibold whitespace-nowrap
              rounded-t-xl transition-colors
              ${tab === t ? "text-primary" : "text-text-muted hover:text-text"}`}>
                {t}
                {tab === t && (
                  <motion.div layoutId="dash-tab-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              const data = activeRfqs.map(r => ({
                ID: r._id,
                Type: r.rfqType,
                Status: r.state,
                Deadline: r.timeLine?.expectedDeliveryDate ? new Date(r.timeLine.expectedDeliveryDate).toLocaleDateString() : "TBD",
                Created: new Date(r.createdAt).toLocaleDateString()
              }));
              exportToCsv("active_rfqs.csv", data);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-text-muted
        hover:text-text px-3 py-2 rounded-lg hover:bg-surface transition-colors mb-1 shrink-0">
            <Icon d={ICONS.download} size={13} /> Export CSV
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="p-5">

            {/* Active RFQs */}
            {tab === "Active RFQs" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text">Active RFQ Requests</h3>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-text-muted
                px-3 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors">
                    <Icon d={ICONS.filter} size={12} /> Filter
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-text-muted uppercase tracking-wider border-b border-border">
                        {["RFQ ID", "Category", "Status", "Progress", "Suppliers", "Avg SQI", "Deadline", ""].map(h => (
                          <th key={h} className="pb-3 pr-4 font-semibold last:pr-0">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeRfqs.map((r, i) => (
                        <motion.tr key={r._id}
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border last:border-0 hover:bg-surface transition-colors group">
                          <td className="py-3.5 pr-4 font-mono text-xs font-semibold text-text whitespace-nowrap">{r._id.slice(-8)}</td>
                          <td className="py-3.5 pr-4 text-text whitespace-nowrap">{r.rfqType}</td>
                          <td className="py-3.5 pr-4"><Badge s={r.state === "CONFIRMED" ? "Matched" : r.state === "SUBMITTED" ? "Pending" : r.state === "UNDER_VALIDATION" ? "Validated" : "Pending"} /></td>
                          <td className="py-3.5 pr-4"><ProgressBar p={r.state === "CONFIRMED" ? 100 : r.state === "SUBMITTED" ? 25 : 50} /></td>
                          <td className="py-3.5 pr-4 text-text-muted text-xs whitespace-nowrap">{quotes.filter(q => q.rfqId === r._id).length} suppliers</td>
                          <td className="py-3.5 pr-4"><SqiBadge v={quotes.filter(q => q.rfqId === r._id).reduce((a, q) => a + (q.sqi || 80), 0) / Math.max(quotes.filter(q => q.rfqId === r._id).length, 1) || 80} /></td>
                          <td className="py-3.5 pr-4 text-text-muted text-xs whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Icon d={ICONS.calendar} size={11} />{r.timeLine?.expectedDeliveryDate ? new Date(r.timeLine.expectedDeliveryDate).toLocaleDateString() : "TBD"}
                            </span>
                          </td>
                         
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Quotes Received */}
            {tab === "Quotes Received" && (
              <>
                <h3 className="font-bold mb-4 text-text">Quotes Received</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-text-muted uppercase tracking-wider border-b border-border">
                        {["Supplier", "RFQ", "Amount", "Delivery", "SQI", "Status"].map(h => (
                          <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((q, i) => (
                        <motion.tr key={i}
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                          <td className="py-3.5 pr-4 font-semibold text-text whitespace-nowrap">{q.supplierName || "Unknown"}</td>
                          <td className="py-3.5 pr-4 font-mono text-xs text-text-muted">{q.rfqId.slice(-8)}</td>
                          <td className="py-3.5 pr-4 font-bold text-primary">₹{q.amount?.toLocaleString() || "TBD"}</td>
                          <td className="py-3.5 pr-4 text-xs text-text-muted">{q.deliveryTime || "TBD"}</td>
                          <td className="py-3.5 pr-4"><SqiBadge v={q.sqi || 80} /></td>
                          <td className="py-3.5"><Badge s={q.status === "ACCEPTED" ? "Reviewed" : "New"} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Orders */}
            {tab === "Orders" && (
              <>
                <h3 className="font-bold mb-4 text-text">Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-text-muted uppercase tracking-wider border-b border-border">
                        {["Order ID", "Supplier", "Amount", "Status", "Est. Delivery"].map(h => (
                          <th key={h} className="pb-3 pr-4 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.filter(q => q.status === "ACCEPTED").map((o, i) => (
                        <motion.tr key={i}
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                          <td className="py-3.5 pr-4 font-mono text-xs font-semibold text-text">ORD-{o._id.slice(-6)}</td>
                          <td className="py-3.5 pr-4 text-text">{o.supplierName || "Unknown"}</td>
                          <td className="py-3.5 pr-4 font-bold text-primary">₹{o.amount?.toLocaleString() || "TBD"}</td>
                          <td className="py-3.5 pr-4"><Badge s="Delivered" /></td>
                          <td className="py-3.5 text-xs text-text-muted">
                            <span className="flex items-center gap-1">
                              <Icon d={ICONS.calendar} size={11} />{o.deliveryTime || "TBD"}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Analytics */}
            {tab === "Analytics" && (
              <>
                <h3 className="font-bold mb-4 text-text">Analytics Overview</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { l: "Total RFQs", v: rfqs.length, ch: "+12%", up: true },
                    { l: "Avg Response", v: "3.2 days", ch: "-8%", up: true },
                    { l: "Avg Cost Savings", v: "18%", ch: "+5%", up: true },
                    { l: "Rejection Rate", v: quotes.length > 0 ? Math.round((quotes.filter(q => q.status === "REJECTED").length / quotes.length) * 100) + "%" : "0%", ch: "+2%", up: false },
                  ].map((k, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-surface rounded-xl p-4 border border-border">
                      <p className="text-[11px] text-text-muted font-semibold uppercase tracking-wide mb-1">{k.l}</p>
                      <p className="text-xl font-black text-text">{k.v}</p>
                      <p className={`text-xs font-bold mt-1 ${k.up ? "text-success" : "text-danger"}`}>
                        {k.ch} vs last quarter
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-surface rounded-xl p-5 border border-border">
                  <p className="text-sm font-bold text-text mb-0.5">Monthly RFQ Activity</p>
                  <p className="text-xs text-text-muted mb-5">RFQs created vs Orders won</p>
                  <div className="flex items-end gap-3 h-28">
                    {chartData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end gap-0.5">
                          <motion.div initial={{ height: 0 }}
                            animate={{ height: `${(d.r / Math.max(...chartData.map(x => x.r), 1)) * 112}px` }}
                            transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
                            className="flex-1 bg-primary rounded-t-md min-h-1" />
                          <motion.div initial={{ height: 0 }}
                            animate={{ height: `${(d.o / Math.max(...chartData.map(x => x.o), 1)) * 112}px` }}
                            transition={{ delay: i * 0.08 + 0.05, duration: 0.6, ease: "easeOut" }}
                            className="flex-1 bg-secondary rounded-t-md min-h-1" />
                        </div>
                        <p className="text-[10px] text-text-muted">{d.m}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-primary" />
                      <span className="text-xs text-text-muted">RFQs Created</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-secondary" />
                      <span className="text-xs text-text-muted">Orders Won</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}