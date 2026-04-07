import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marketApi } from "../../api/marketApi";

const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}><path d={d} /></svg>
);

const ICONS = {
  wallet:   "M20 12V22H4V12 M22 7H2v5h20V7z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  credit:   "M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z M1 10h22",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4",
  trend:    "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  check:    "M20 6L9 17l-5-5",
  clock:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  plus:     "M12 5v14M5 12h14",
  minus:    "M5 12h14",
  arrow:    "M5 12h14M12 5l7 7-7 7",
  x:        "M18 6L6 18M6 6l12 12",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  info:     "M12 22a10 10 0 110-20 10 10 0 010 20zM12 8h.01M11 12h1v4h1",
  refresh:  "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  gift:     "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  barChart: "M18 20V10 M12 20V4 M6 20v-6",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  tag:      "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
};

// Add Credits Modal
const PLAN_PACKS = [
  { label: "Starter", credits: 5,  price: 999,  tag: null,     color: "border-slate-200 hover:border-slate-400" },
  { label: "Growth",  credits: 15, price: 2499, tag: "Popular", color: "border-primary hover:border-primary"    },
  { label: "Pro",     credits: 30, price: 4499, tag: "Best Value", color: "border-emerald-400 hover:border-emerald-500" },
  { label: "Custom",  credits: 50, price: 6999, tag: null,     color: "border-slate-200 hover:border-slate-400" },
];

function AddCreditsModal({ onClose }) {
  const [selected, setSelected] = useState(1);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 1500));
    setDone(true);
    setPaying(false);
    setTimeout(onClose, 1800);
  };

  const pack = PLAN_PACKS[selected];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:20 }} transition={{ type:"spring", stiffness:300, damping:30 }}
        className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
        <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary to-primary/80 flex items-center justify-between">
          <div>
            <h2 className="font-black text-white text-base">Add Lead Credits</h2>
            <p className="text-xs text-white/70 mt-0.5">Choose a pack to purchase lead credits</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Icon d={ICONS.x} size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {done ? (
            <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }}
              className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon d={ICONS.check} size={24} className="text-emerald-600" />
              </div>
              <p className="font-black text-text text-lg">Payment Successful!</p>
              <p className="text-sm text-text-muted mt-1">{pack.credits} lead credits added to your wallet</p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                {PLAN_PACKS.map((p, i) => (
                  <button key={i} onClick={() => setSelected(i)}
                    className={`relative p-3.5 rounded-xl border-2 text-left transition-all ${p.color} ${selected === i ? "shadow-md" : "opacity-80"}`}>
                    {p.tag && (
                      <span className={`absolute -top-2 left-3 text-[9px] font-black px-2 py-0.5 rounded-full ${p.tag === "Popular" ? "bg-primary text-white" : "bg-emerald-500 text-white"}`}>
                        {p.tag}
                      </span>
                    )}
                    <p className="text-xs font-bold text-text-muted">{p.label}</p>
                    <p className="text-xl font-black text-text mt-0.5">{p.credits} <span className="text-sm font-semibold text-text-muted">credits</span></p>
                    <p className="text-sm font-bold text-primary mt-1">₹{p.price.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted">₹{Math.round(p.price/p.credits)}/credit</p>
                  </button>
                ))}
              </div>

              <div className="bg-surface rounded-xl border border-border p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted font-semibold">Total</p>
                  <p className="text-xl font-black text-text">₹{pack.price.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-muted">You get</p>
                  <p className="text-lg font-black text-primary">{pack.credits} credits</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                <Icon d={ICONS.shield} size={13} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-700 font-medium">Secure payment via Razorpay. Credits never expire.</p>
              </div>

              <button onClick={handlePay} disabled={paying}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-black rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {paying ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                ) : (
                  <><Icon d={ICONS.credit} size={15} /> Pay ₹{pack.price.toLocaleString()}</>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Withdraw Modal
function WithdrawModal({ balance, onClose }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const max = Math.min(balance * 200, 50000);

  const handleWithdraw = async () => {
    if (!amount || Number(amount) <= 0 || Number(amount) > max) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setDone(true);
    setProcessing(false);
    setTimeout(onClose, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity:0, scale:0.95, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:20 }} transition={{ type:"spring", stiffness:300, damping:30 }}
        className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
        <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-600 to-emerald-500 flex items-center justify-between">
          <h2 className="font-black text-white text-base">Withdraw Earnings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Icon d={ICONS.x} size={15} /></button>
        </div>
        <div className="p-5 space-y-4">
          {done ? (
            <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon d={ICONS.check} size={24} className="text-emerald-600" />
              </div>
              <p className="font-black text-text text-lg">Withdrawal Requested!</p>
              <p className="text-sm text-text-muted mt-1">₹{Number(amount).toLocaleString()} will be credited in 2-3 business days</p>
            </motion.div>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide">Available to withdraw</p>
                <p className="text-2xl font-black text-emerald-700">₹{max.toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Amount (₹)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount" max={max}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition" />
                <div className="flex gap-2 mt-2">
                  {[1000,2500,5000].map(v => (
                    <button key={v} onClick={() => setAmount(Math.min(v, max).toString())}
                      className="flex-1 text-xs font-bold py-1.5 rounded-lg border border-border hover:bg-surface text-text-muted transition-colors">
                      ₹{v >= 1000 ? (v/1000)+"k" : v}
                    </button>
                  ))}
                  <button onClick={() => setAmount(max.toString())}
                    className="flex-1 text-xs font-bold py-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-50 text-emerald-700 transition-colors">
                    Max
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Method</label>
                <div className="flex gap-2">
                  {[{v:"bank",l:"Bank Transfer"},{v:"upi",l:"UPI"}].map(m => (
                    <button key={m.v} onClick={() => setMethod(m.v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${method===m.v?"bg-emerald-500 text-white border-emerald-500":"border-border text-text-muted hover:bg-surface"}`}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleWithdraw} disabled={processing || !amount || Number(amount)<=0}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {processing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</> : "Request Withdrawal"}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Main Wallet
export default function Wallet() {
  const [supplier, setSupplier] = useState(null);
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, lRes] = await Promise.allSettled([
        marketApi.getSupplierProfile(),
        marketApi.getSupplierLeads({ page:1, limit:100 }),
      ]);
      if (sRes.status==="fulfilled") setSupplier(sRes.value.data);
      if (lRes.status==="fulfilled") {
        const payload = lRes.value.data;
        const parsedLeads = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.leads)
            ? payload.leads
            : [];
        setLeads(parsedLeads);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const access      = supplier?.leadAccess || {};
  const purchased   = leads.filter(l => l.isPurchased);
  const totalSpent  = purchased.reduce((sum, l) => sum + (l.price||0), 0);
  const dailyUsed   = access.usedToday || 0;
  const dailyLimit  = access.dailyLimit || 3;
  const remaining   = Math.max(0, dailyLimit - dailyUsed);
  const totalPurchased = access.totalLeadsPurchased || 0;
  const usagePct    = Math.min(100, (dailyUsed/dailyLimit)*100);

  const txns = purchased.slice(0, 30).map(l => ({
    id:     l._id || l.id,
    label:  l.rfq?.title || "Lead Purchase",
    type:   l.rfq?.type  || "—",
    amount: l.price || 0,
    date:   l.purchasedAt ? new Date(l.purchasedAt).toLocaleDateString("en-IN") : "—",
    status: "purchased",
  }));

  // Mock weekly usage data
  const weeklyData = [1, 0, 2, 3, 1, dailyUsed, 0].map((v, i) => ({ day: ["M","T","W","T","F","Sa","Su"][i], v }));
  const weeklyMax = Math.max(...weeklyData.map(d => d.v), 1);

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight">Wallet & Credits</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage your lead credits and earnings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl border border-border hover:bg-surface text-text-muted transition-colors">
            <Icon d={ICONS.refresh} size={15} />
          </button>
          <button onClick={() => setShowWithdraw(true)}
            className="flex items-center gap-2 text-sm font-bold border border-emerald-300 text-emerald-700 hover:bg-emerald-50 py-2.5 px-4 rounded-xl transition-colors">
            <Icon d={ICONS.minus} size={13} /> Withdraw
          </button>
          <motion.button whileTap={{ scale:0.97 }} whileHover={{ scale:1.02 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 text-sm font-bold bg-primary hover:bg-primary-hover text-white py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-primary/20">
            <Icon d={ICONS.plus} size={13} /> Add Credits
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:"Total Spent",       val:`₹${totalSpent.toLocaleString()}`, icon:"wallet",  bg:"bg-violet-50 border-violet-200",  text:"text-violet-700" },
          { label:"Leads Purchased",   val:totalPurchased,                    icon:"lock",    bg:"bg-blue-50 border-blue-200",      text:"text-blue-700"   },
          { label:"Today Remaining",   val:remaining,                         icon:"zap",     bg:remaining>0?"bg-emerald-50 border-emerald-200":"bg-red-50 border-red-200", text:remaining>0?"text-emerald-700":"text-red-600" },
          { label:"Daily Limit",       val:dailyLimit,                        icon:"shield",  bg:"bg-slate-50 border-slate-200",    text:"text-slate-700"  },
        ].map(({ label,val,icon,bg,text }) => (
          <motion.div key={label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            className={`${bg} border rounded-2xl p-4 shadow-sm`}>
            <Icon d={ICONS[icon]} size={16} className={`${text} opacity-60 mb-2`} />
            <p className={`text-2xl font-black ${text}`}>{val}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily Usage Bar */}
      <div className="bg-background border border-border rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-black text-text">Today's Lead Usage</h3>
            <p className="text-xs text-text-muted mt-0.5">Resets at midnight IST</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-text">{dailyUsed}<span className="text-base text-text-muted font-semibold">/{dailyLimit}</span></p>
            <p className="text-xs text-text-muted">credits used</p>
          </div>
        </div>
        <div className="w-full h-3 bg-surface-2 rounded-full overflow-hidden">
          <motion.div initial={{ width:0 }} animate={{ width:`${usagePct}%` }} transition={{ duration:0.8 }}
            className={`h-full rounded-full ${usagePct >= 100 ? "bg-red-400" : usagePct >= 70 ? "bg-amber-400" : "bg-primary"}`} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-text-muted">
            {remaining > 0 ? `${remaining} purchase${remaining!==1?"s":""} remaining today` : "Daily limit reached"}
          </p>
          <p className={`text-xs font-bold ${usagePct>=100?"text-red-600":usagePct>=70?"text-amber-600":"text-emerald-600"}`}>
            {usagePct.toFixed(0)}% used
          </p>
        </div>

        {/* Upgrade prompt if near limit */}
        {remaining <= 1 && (
          <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
            className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon d={ICONS.info} size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-amber-700">
                {remaining === 0 ? "Daily limit reached. Add more credits or wait until midnight." : "Only 1 credit left today!"}
              </p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="shrink-0 text-xs font-black text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors">
              Add Credits
            </button>
          </motion.div>
        )}
      </div>

      {/* Tabs: History | Analytics | Plans */}
      <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-border bg-surface">
          {["history","analytics","plans"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors
                ${activeTab===t?"text-primary border-b-2 border-primary bg-background":"text-text-muted hover:text-text"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* HISTORY TAB */}
        {activeTab==="history" && (
          <div>
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.clock} size={14} className="text-text-muted" />
                <h3 className="font-bold text-text text-sm">Purchase History</h3>
                <span className="text-[10px] text-text-muted">({txns.length} records)</span>
              </div>
            </div>
            {txns.length === 0 ? (
              <div className="text-center py-14">
                <Icon d={ICONS.wallet} size={32} className="mx-auto text-text-muted opacity-30 mb-3" />
                <p className="text-text-muted font-semibold">No purchases yet</p>
                <p className="text-sm text-text-muted mt-1">Purchase leads from the marketplace to see history</p>
                <button className="mt-3 text-xs font-bold text-primary border border-primary/30 px-4 py-1.5 rounded-lg hover:bg-primary/5">
                  Browse Marketplace →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {txns.map((t, i) => (
                  <motion.div key={t.id||i} initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay: i*0.03 }}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon d={ICONS.lock} size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{t.label}</p>
                      <p className="text-xs text-text-muted">{t.type} · {t.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-red-600">−₹{t.amount.toLocaleString()}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Icon d={ICONS.check} size={10} className="text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 font-semibold">Purchased</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab==="analytics" && (
          <div className="p-5 space-y-5">
            <div>
              <h3 className="font-bold text-text mb-3">Weekly Credit Usage</h3>
              <div className="flex items-end gap-2 h-24">
                {weeklyData.map(({ day, v }, i) => {
                  const h = weeklyMax > 0 ? Math.max(4, Math.round((v/weeklyMax)*80)) : 4;
                  const isToday = i === 5;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-[10px] font-bold text-text-muted">{v>0?v:""}</p>
                      <div className={`w-full rounded-t-lg transition-all ${isToday?"bg-primary":"bg-primary/30"}`}
                        style={{ height:`${h}px` }} />
                      <p className={`text-[10px] font-bold ${isToday?"text-primary":"text-text-muted"}`}>{day}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Avg Daily Use",  val:`${(totalPurchased/30||0).toFixed(1)}`,  sub:"per day" },
                { label:"Total Spent",    val:`₹${(totalSpent/1000).toFixed(1)}k`,     sub:"all time" },
                { label:"Per Lead Cost",  val:totalPurchased>0?`₹${Math.round(totalSpent/totalPurchased)}`:"—", sub:"avg price" },
              ].map(({ label,val,sub }) => (
                <div key={label} className="bg-surface rounded-xl border border-border p-3.5 text-center">
                  <p className="text-xl font-black text-text">{val}</p>
                  <p className="text-[10px] text-text-muted font-semibold mt-0.5">{sub}</p>
                  <p className="text-[10px] text-text-muted">{label}</p>
                </div>
              ))}
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Credit Health Score</p>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-black ${remaining > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {remaining > 0 ? "Good" : "Low"}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-text-muted">
                    {remaining > 1
                      ? `You have ${remaining} credits remaining today. Your usage pattern looks healthy.`
                      : remaining === 1
                      ? "Only 1 credit left! Consider adding more to avoid missing leads."
                      : "Daily limit reached. Add credits or wait for midnight reset."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PLANS TAB */}
        {activeTab==="plans" && (
          <div className="p-5 space-y-4">
            <p className="text-sm text-text-muted">Choose a credit pack to purchase more leads. Credits never expire and roll over.</p>
            <div className="grid grid-cols-2 gap-3">
              {PLAN_PACKS.map((p, i) => (
                <motion.div key={i} whileHover={{ y:-2 }}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${p.color} ${i===1?"shadow-md":"shadow-sm"}`}
                  onClick={() => setShowAdd(true)}>
                  {p.tag && (
                    <span className={`absolute -top-2.5 left-4 text-[9px] font-black px-2 py-0.5 rounded-full ${p.tag==="Popular"?"bg-primary text-white":"bg-emerald-500 text-white"}`}>
                      {p.tag}
                    </span>
                  )}
                  <p className="text-xs font-bold text-text-muted">{p.label} Pack</p>
                  <p className="text-2xl font-black text-text mt-1">{p.credits} <span className="text-sm text-text-muted font-semibold">credits</span></p>
                  <p className="text-base font-black text-primary mt-1">₹{p.price.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">₹{Math.round(p.price/p.credits)}/credit</p>
                  <div className="mt-3 pt-3 border-t border-border">
                    <button onClick={() => setShowAdd(true)}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-colors ${i===1?"bg-primary text-white hover:bg-primary-hover":"border border-border text-text hover:bg-surface"}`}>
                      Buy Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2">
              <Icon d={ICONS.gift} size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-700">Enterprise Plan Available</p>
                <p className="text-xs text-blue-600 mt-0.5">Need 100+ credits/month? Contact us for custom pricing and priority support.</p>
                <button className="mt-2 text-xs font-black text-blue-700 underline">Contact Sales →</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && <AddCreditsModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showWithdraw && <WithdrawModal balance={totalPurchased} onClose={() => setShowWithdraw(false)} />}
      </AnimatePresence>
    </div>
  );
}
