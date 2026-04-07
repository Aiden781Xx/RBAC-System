import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marketApi } from "../../api/marketApi";
import { exportToCsv } from "../../utils/csvExport";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}><path d={d} /></svg>
);

const ICONS = {
  plus:      "M12 5v14M5 12h14",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  filter:    "M22 3H2l8 9.46V19l4 2V12.46L22 3z",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  edit:      "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:     "M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
  x:         "M18 6L6 18M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  calendar:  "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  arrow:     "M5 12h14M12 5l7 7-7 7",
  arrowL:    "M19 12H5M12 19l-7-7 7-7",
  info:      "M12 22a10 10 0 110-20 10 10 0 010 20zM12 8h.01M11 12h1v4h1",
  users:     "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  clock:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  trending:  "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  copy:      "M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2M8 4a2 2 0 012-2h4a2 2 0 012 2M8 4h8",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  send:      "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  alert:     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  messageCircle: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  link:      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  award:     "M12 15a3 3 0 100-6 3 3 0 000 6zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
  fileText:  "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  repeat:    "M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3",
  moreH:     "M12 13a1 1 0 100-2 1 1 0 000 2zM19 13a1 1 0 100-2 1 1 0 000 2zM5 13a1 1 0 100-2 1 1 0 000 2z",
  attach:    "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
};

const CATEGORIES = ["CNC Machining","Sheet Metal","Investment Casting","Injection Molding","PCB Fabrication","Electronics Assembly","3D Printing","Die Casting","Forging","Stamping"];

const RFQ_TYPE_MAP = {
  MACHINING:"CNC Machining", CASTING:"Investment Casting", SHEET_METAL:"Sheet Metal",
  FORGING:"Forging", FABRICATION:"Sheet Metal", INJECTION_MOULDING:"Injection Molding", OTHER:"Other",
};

const API_TO_DISPLAY_STATUS = {
  SUBMITTED:"Pending", UNDER_VALIDATION:"Validated",
  CLARIFICATION_REQUIRED:"Clarification", CONFIRMED:"Matched",
  REJECTED:"Rejected", CLOSED:"Closed",
};

const STATUS_STYLE = {
  Matched:"bg-emerald-50 text-emerald-700 border border-emerald-200",
  Validated:"bg-blue-50 text-blue-700 border border-blue-200",
  Pending:"bg-amber-50 text-amber-700 border border-amber-200",
  Clarification:"bg-orange-50 text-orange-700 border border-orange-200",
  Closed:"bg-slate-100 text-slate-500 border border-slate-200",
  Rejected:"bg-red-50 text-red-700 border border-red-200",
  Awarded:"bg-emerald-50 text-emerald-700 border border-emerald-200",
  New:"bg-primary/10 text-primary border border-primary/20",
};

const Badge = ({ s }) => (
  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLE[s] || "bg-surface-2 text-text-muted"}`}>{s}</span>
);
const SqiBadge = ({ v }) => {
  const c = v >= 90 ? "bg-emerald-500" : v >= 80 ? "bg-blue-500" : "bg-amber-500";
  return <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${c}`}>{v} SQI</span>;
};
const ProgressBar = ({ p, thin }) => (
  <div className={`w-full bg-surface-2 rounded-full overflow-hidden ${thin ? "h-1" : "h-1.5"}`}>
    <motion.div initial={{ width:0 }} animate={{ width:`${p}%` }} transition={{ duration:0.9, delay:0.1 }}
      className={`h-full rounded-full ${p === 100 ? "bg-text-muted" : "bg-primary"}`} />
  </div>
);

// Pipeline Tracker
const PIPELINE_STEPS = ["SUBMITTED","UNDER_VALIDATION","CONFIRMED","CLOSED"];
const STEP_LABELS = { SUBMITTED:"Submitted", UNDER_VALIDATION:"Validated", CONFIRMED:"Matched", CLOSED:"Done" };
function PipelineTracker({ state }) {
  const cur = PIPELINE_STEPS.indexOf(state);
  return (
    <div className="flex items-center gap-0 mt-3">
      {PIPELINE_STEPS.map((s, i) => {
        const done = i <= cur; const active = i === cur;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${active?"border-white bg-white text-primary":done?"border-white/60 bg-white/20 text-white":"border-white/20 bg-white/10 text-white/40"}`}>
                <span className="text-[8px] font-black">{done&&!active ? "✓" : i+1}</span>
              </div>
              <p className={`text-[8px] mt-0.5 font-bold whitespace-nowrap ${active?"text-white":done?"text-white/70":"text-white/30"}`}>
                {STEP_LABELS[s]}
              </p>
            </div>
            {i < PIPELINE_STEPS.length-1 && <div className={`flex-1 h-px mb-3 ${i<cur?"bg-white/60":"bg-white/20"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// Action Menu
function ActionMenu({ rfq, onClose, onCloseRfq, onDuplicate }) {
  const actions = [
    { icon:ICONS.repeat, label:"Duplicate RFQ", color:"text-indigo-600", fn:()=>{ onDuplicate(rfq); onClose(); } },
    { icon:ICONS.link, label:"Copy Link", color:"text-violet-600", fn:()=>{ navigator.clipboard?.writeText(window.location.href+"?rfq="+rfq._id); onClose(); } },
    { icon:ICONS.download, label:"Export Details", color:"text-orange-600", fn:()=>{ onClose(); } },
    { icon:ICONS.messageCircle, label:"Message Suppliers", color:"text-emerald-600", fn:()=>{ onClose(); } },
    { divider:true },
    { icon:ICONS.x, label:"Close RFQ", color:"text-red-600", fn:()=>{ onCloseRfq(rfq._id); onClose(); } },
  ];
  return (
    <motion.div initial={{ opacity:0, scale:0.92, y:-4 }} animate={{ opacity:1, scale:1, y:0 }}
      exit={{ opacity:0, scale:0.92, y:-4 }} transition={{ duration:0.12 }}
      className="absolute right-0 top-8 z-50 bg-background border border-border rounded-xl shadow-xl w-48 py-1">
      {actions.map((a, i) => a.divider ? <div key={i} className="h-px bg-border mx-2 my-1" /> : (
        <button key={i} onClick={a.fn}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-surface transition-colors ${a.color}`}>
          <Icon d={a.icon} size={12} />{a.label}
        </button>
      ))}
    </motion.div>
  );
}

// Create Modal
const STEPS = ["Basic Info","Requirements","Review"];
function CreateModal({ onClose, onCreate, prefill, buyerStatus, requiresPurchaseAuthority, onDeclarePurchaseAuthority }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title:prefill?.title||"", category:prefill?.category||"",
    quantity:prefill?.quantity?.bulk||"", unit:"pcs",
    budget_min:"", budget_max:"", deadline:"",
    description:prefill?.description||"", designRequest:false, priority:"NORMAL",
  });
  const [creating, setCreating] = useState(false);
  const [declaringAuthority, setDeclaringAuthority] = useState(false);
  const [error, setError] = useState("");

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));
  const inputCls = "w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";
  const labelCls = "block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5";

  const canNext = () => {
    if (step===0) return form.title && form.category;
    if (step===1) return form.quantity && form.deadline && form.description;
    return true;
  };

  const handleCreate = async () => {
    setCreating(true); setError("");
    if (buyerStatus !== "VERIFIED") {
      setError("Your buyer account must be verified before submitting an RFQ.");
      setCreating(false);
      return;
    }
    if (requiresPurchaseAuthority) {
      setError("Purchase authority declaration required before submitting this RFQ.");
      setCreating(false);
      return;
    }
    try {
      const rfqTypeMap = {"CNC Machining":"MACHINING","Investment Casting":"CASTING","Sheet Metal":"SHEET_METAL","Injection Molding":"INJECTION_MOULDING","Forging":"FORGING","Other":"OTHER"};
      await marketApi.createRfq({
        title:form.title, rfqType:rfqTypeMap[form.category]||"OTHER",
        description:form.description, drawings:form.designRequest?[]:["placeholder.pdf"],
        designRequest:form.designRequest,
        quantity:{bulk:Number(form.quantity), trial:Number(form.quantity)},
        budgetRange:{min:Number(form.budget_min)||0, max:Number(form.budget_max)||0},
        timeline:{expectedDelivery:form.deadline},
      });
      onCreate(); onClose();
    } catch(e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.response?.data?.errors?.[0] ||
        e?.response?.data?.errors?.[0]?.msg ||
        e?.message;
      setError(typeof msg==="string"?msg:JSON.stringify(msg)||"Failed to create RFQ");
    } finally { setCreating(false); }
  };

  const handleDeclareAuthority = async () => {
    setDeclaringAuthority(true); setError("");
    try {
      const success = await onDeclarePurchaseAuthority();
      if (!success) {
        setError("Failed to declare purchase authority");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to declare purchase authority");
    } finally {
      setDeclaringAuthority(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}}
        exit={{opacity:0,scale:0.95,y:20}} transition={{type:"spring",stiffness:300,damping:30}}
        className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden z-10">
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary to-primary/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">{prefill?"Duplicate RFQ":"Create New RFQ"}</h2>
              <p className="text-xs text-white/70 mt-0.5">Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Icon d={ICONS.x} size={16} /></button>
          </div>
        </div>
        <div className="flex gap-1 px-6 pt-4">
          {STEPS.map((s,i)=>(
            <div key={i} className="flex-1">
              <div className={`h-1 rounded-full transition-colors ${i<=step?"bg-primary":"bg-surface-2"}`} />
              <p className={`text-[10px] mt-1 font-semibold ${i===step?"text-primary":"text-text-muted"}`}>{s}</p>
            </div>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}
            exit={{opacity:0,x:-20}} transition={{duration:0.18}}
            className="px-6 py-5 space-y-4">
            {step===0 && (<>
              <div><label className={labelCls}>RFQ Title *</label>
                <input value={form.title} onChange={set("title")} placeholder="e.g. Aluminum CNC Bracket Q2 2025" className={inputCls} /></div>
              <div><label className={labelCls}>Category *</label>
                <select value={form.category} onChange={set("category")} className={inputCls}>
                  <option value="">Select a category…</option>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Quantity *</label>
                  <input type="number" value={form.quantity} onChange={set("quantity")} placeholder="500" className={inputCls} /></div>
                <div><label className={labelCls}>Unit</label>
                  <select value={form.unit} onChange={set("unit")} className={inputCls}>
                    {["pcs","sets","kg","meters","liters","boxes"].map(u=><option key={u}>{u}</option>)}
                  </select></div>
              </div>
              <div><label className={labelCls}>Priority</label>
                <div className="flex gap-2">
                  {["URGENT","HIGH","NORMAL","LOW"].map(p=>(
                    <button key={p} onClick={()=>setForm(f=>({...f,priority:p}))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors
                        ${form.priority===p?"bg-primary text-white border-primary":"border-border text-text-muted hover:bg-surface"}`}>
                      {p==="URGENT"?"🔥":p==="HIGH"?"⚡":p==="NORMAL"?"·":"↓"} {p}
                    </button>
                  ))}
                </div></div>
            </>)}
            {step===1 && (<>
              <div><label className={labelCls}>Description & Specs *</label>
                <textarea value={form.description} onChange={set("description")} rows={4}
                  placeholder="Material specs, tolerances, finish requirements, packaging…"
                  className={`${inputCls} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Budget Min (₹)</label>
                  <input type="number" value={form.budget_min} onChange={set("budget_min")} placeholder="50000" className={inputCls} /></div>
                <div><label className={labelCls}>Budget Max (₹)</label>
                  <input type="number" value={form.budget_max} onChange={set("budget_max")} placeholder="100000" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Required By *</label>
                <input type="date" value={form.deadline} onChange={set("deadline")} className={inputCls} /></div>
              <label className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border cursor-pointer hover:bg-surface-2 transition-colors">
                <input type="checkbox" checked={form.designRequest}
                  onChange={e=>setForm(f=>({...f,designRequest:e.target.checked}))} className="w-4 h-4" />
                <span className="text-sm font-medium text-text">🎨 Request design assistance from supplier</span>
              </label>
            </>)}
            {step===2 && (<>
              <div className="bg-surface rounded-xl border border-border divide-y divide-border overflow-hidden">
                {[
                  {l:"Title",v:form.title||"—"},{l:"Category",v:form.category||"—"},
                  {l:"Quantity",v:form.quantity?`${form.quantity} ${form.unit}`:"—"},
                  {l:"Priority",v:form.priority},{l:"Budget",v:form.budget_min?`₹${Number(form.budget_min).toLocaleString()} – ₹${Number(form.budget_max).toLocaleString()}`:"—"},
                  {l:"Deadline",v:form.deadline||"—"},{l:"Design Help",v:form.designRequest?"Yes":"No"},
                ].map(row=>(
                  <div key={row.l} className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-xs text-text-muted font-semibold">{row.l}</p>
                    <p className="text-xs font-bold text-text">{row.v}</p>
                  </div>
                ))}
              </div>
              {requiresPurchaseAuthority && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-amber-800 uppercase tracking-wide">Purchase Authority Required</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Declare purchase authority before submitting this RFQ. Your draft details will stay here.
                    </p>
                  </div>
                  <button onClick={handleDeclareAuthority} disabled={declaringAuthority}
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50">
                    {declaringAuthority ? "Saving..." : "Declare Now"}
                  </button>
                </div>
              )}
              {form.description && (
                <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Description</p>
                  <p className="text-sm text-text bg-surface rounded-xl p-3 border border-border leading-relaxed">{form.description}</p></div>
              )}
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
            </>)}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface/50">
          <button onClick={()=>step>0?setStep(s=>s-1):onClose()}
            className="flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-text px-4 py-2 rounded-xl hover:bg-surface-2">
            <Icon d={ICONS.arrowL} size={13} />{step===0?"Cancel":"Back"}
          </button>
          {step<STEPS.length-1 ? (
            <button onClick={()=>canNext()&&setStep(s=>s+1)}
              className={`flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl transition-colors
                ${canNext()?"bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20":"bg-surface-2 text-text-muted cursor-not-allowed"}`}>
              Continue <Icon d={ICONS.arrow} size={13} />
            </button>
          ) : (
            <button onClick={handleCreate} disabled={creating || requiresPurchaseAuthority || buyerStatus !== "VERIFIED"}
              className="flex items-center gap-1.5 text-sm font-bold bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {creating?"Submitting…":"Submit RFQ"} <Icon d={ICONS.send} size={13} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Detail Drawer
function DetailDrawer({ rfq, quotes, onClose, onAcceptQuote, accepting }) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = ["overview","quotes","timeline","docs"];
  const progressPct = rfq.state==="CONFIRMED"?75:rfq.state==="SUBMITTED"?25:rfq.state==="UNDER_VALIDATION"?50:rfq.state==="CLOSED"?100:40;

  return (
    <motion.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}}
      exit={{opacity:0,x:40}} transition={{type:"spring",stiffness:300,damping:30}}
      className="w-108 shrink-0 bg-background border-l border-border flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border shrink-0 bg-gradient-to-br from-primary to-primary/80">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="font-mono text-[10px] text-white/50 mb-0.5">{rfq._id?.slice(-12)}</p>
            <h3 className="font-black text-white text-sm leading-tight">{rfq.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge s={API_TO_DISPLAY_STATUS[rfq.state]||rfq.state} />
              <span className="text-[11px] text-white/60">{RFQ_TYPE_MAP[rfq.rfqType]||rfq.rfqType}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white shrink-0"><Icon d={ICONS.x} size={15} /></button>
        </div>
        <PipelineTracker state={rfq.state} />
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0 bg-surface">
        {tabs.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors
              ${activeTab===t?"text-primary border-b-2 border-primary bg-background":"text-text-muted hover:text-text"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab==="overview" && (
          <div className="p-5 space-y-4">
            <div className="bg-surface rounded-xl border border-border p-4">
              <div className="flex justify-between mb-2">
                <p className="text-xs font-bold text-text">Sourcing Progress</p>
                <p className="text-xs font-black text-primary">{progressPct}%</p>
              </div>
              <ProgressBar p={progressPct} />
              <p className="text-[10px] text-text-muted mt-1.5">
                {rfq.state==="SUBMITTED"?"Awaiting admin validation":rfq.state==="UNDER_VALIDATION"?"Admin is reviewing your RFQ":rfq.state==="CONFIRMED"?"Matched — review supplier quotes":"RFQ closed"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {icon:ICONS.users,label:"Responses",val:quotes.length>0?`${quotes.length} suppliers`:"None yet"},
                {icon:ICONS.star,label:"Best SQI",val:quotes.length>0?`${Math.max(...quotes.map(q=>q.sqi||80))}`:"—"},
                {icon:ICONS.calendar,label:"Deadline",val:rfq.timeLine?.expectedDeliveryDate?new Date(rfq.timeLine.expectedDeliveryDate).toLocaleDateString("en-IN"):"—"},
                {icon:ICONS.copy,label:"Quantity",val:`${rfq.quantity?.bulk||0} pcs`},
                {icon:ICONS.trending,label:"Budget",val:rfq.budgetRange?`₹${(rfq.budgetRange.min/1000).toFixed(0)}k–${(rfq.budgetRange.max/1000).toFixed(0)}k`:"—"},
                {icon:ICONS.clock,label:"Created",val:new Date(rfq.createdAt).toLocaleDateString("en-IN")},
              ].map((f,i)=>(
                <div key={i} className="bg-surface rounded-xl p-3 border border-border">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon d={f.icon} size={11} className="text-text-muted" />
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wide">{f.label}</p>
                  </div>
                  <p className="text-xs font-black text-text">{f.val}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Specifications</p>
              <p className="text-sm text-text leading-relaxed bg-surface p-3 rounded-xl border border-border">{rfq.description||"No description provided."}</p>
            </div>
            {rfq.state==="CLARIFICATION_REQUIRED" && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
                <Icon d={ICONS.alert} size={14} className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-orange-700">Action Required</p>
                  <p className="text-xs text-orange-600 mt-0.5">Admin needs clarification on your RFQ.</p>
                  <button className="mt-1.5 text-xs font-bold text-orange-700 underline">Respond Now →</button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab==="quotes" && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Supplier Quotes</p>
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{quotes.length} received</span>
            </div>
            {quotes.length===0 ? (
              <div className="text-center py-10 bg-surface rounded-xl border border-border">
                <Icon d={ICONS.clock} size={28} className="mx-auto mb-2 text-text-muted opacity-40" />
                <p className="text-sm font-semibold text-text-muted">No quotes yet</p>
                <p className="text-xs text-text-muted mt-1">Suppliers respond once your RFQ is confirmed</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {[...quotes].sort((a,b)=>(a.quotedPrice||0)-(b.quotedPrice||0)).map((q,i)=>(
                  <motion.div key={q._id}
                    initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                    className={`bg-surface rounded-xl p-3.5 border transition-all
                      ${q.status==="ACCEPTED"?"border-emerald-300 bg-emerald-50/40":i===0?"border-primary/40 bg-primary/5":"border-border hover:border-primary/30"}`}>
                    {i===0&&q.status!=="ACCEPTED" && (
                      <div className="flex items-center gap-1 mb-2">
                        <Icon d={ICONS.star} size={10} className="text-amber-500" />
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-wide">Best Price</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                          {(q.supplierName||"S")[0]}
                        </div>
                        <p className="text-xs font-bold text-text">{q.supplierName||"Unknown Supplier"}</p>
                      </div>
                      <Badge s={q.status==="ACCEPTED"?"Awarded":"New"} />
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-base font-black text-primary">₹{q.quotedPrice?.toLocaleString()}</p>
                        <p className="text-[10px] text-text-muted">{q.leadTimeDays} days delivery</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <SqiBadge v={q.sqi||80} />
                        {q.status!=="ACCEPTED"&&rfq.state==="CONFIRMED" && (
                          <button onClick={()=>onAcceptQuote(rfq._id,q._id)} disabled={accepting===q._id}
                            className="bg-emerald-500 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold hover:bg-emerald-600 disabled:opacity-50">
                            {accepting===q._id?"…":"Award"}
                          </button>
                        )}
                      </div>
                    </div>
                    {q.remarks && <p className="text-[11px] text-text-muted mt-2 italic border-t border-border pt-2">"{q.remarks}"</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab==="timeline" && (
          <div className="p-5 space-y-3">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Activity Timeline</p>
            {[
              {icon:ICONS.send,label:"RFQ Submitted",time:new Date(rfq.createdAt).toLocaleString("en-IN"),done:true},
              {icon:ICONS.check,label:"Admin Validation",time:rfq.state!=="SUBMITTED"?"Completed":"Pending",done:rfq.state!=="SUBMITTED"},
              {icon:ICONS.users,label:"Supplier Matching",time:rfq.state==="CONFIRMED"?`${quotes.length} matched`:"Pending",done:rfq.state==="CONFIRMED"},
              {icon:ICONS.award,label:"Quote Selection",time:"Pending",done:false},
              {icon:ICONS.zap,label:"Order Placed",time:"Pending",done:false},
            ].map((e,i)=>(
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${e.done?"bg-primary":"bg-surface-2 border border-border"}`}>
                    <Icon d={e.icon} size={13} className={e.done?"text-white":"text-text-muted"} />
                  </div>
                  {i<4 && <div className={`w-px h-6 mt-1 ${e.done?"bg-primary/40":"bg-border"}`} />}
                </div>
                <div className="pb-3">
                  <p className={`text-xs font-bold ${e.done?"text-text":"text-text-muted"}`}>{e.label}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{e.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab==="docs" && (
          <div className="p-5 space-y-3">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Attachments</p>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Icon d={ICONS.attach} size={24} className="mx-auto text-text-muted opacity-40 mb-2" />
              <p className="text-sm font-semibold text-text-muted">No documents attached</p>
              <button className="mt-3 text-xs font-bold text-primary border border-primary/30 px-4 py-1.5 rounded-lg hover:bg-primary/5">+ Upload Files</button>
            </div>
            {rfq.designRequest && (
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-3 flex items-center gap-2">
                <Icon d={ICONS.fileText} size={13} className="text-violet-600" />
                <p className="text-xs font-semibold text-violet-700">Design Request: Supplier will provide drawings</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-border bg-surface/50 flex gap-2 shrink-0">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-bold text-text-muted hover:bg-surface transition-colors">Close</button>
        {rfq.state==="CONFIRMED" && (
          <button className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover flex items-center justify-center gap-1.5">
            <Icon d={ICONS.users} size={12} /> Compare Quotes
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Main
const ALL_STATUSES = ["All","Matched","Validated","Pending","Clarification","Closed","Rejected"];
const ALL_CATEGORIES = ["All",...CATEGORIES];

export default function BuyerRFQs() {
  const [buyerProfile, setBuyerProfile] = useState(null);
  const [rfqs, setRfqs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [sortBy, setSortBy] = useState("created");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState("");
  const [error, setError] = useState("");
  const [prefillRfq, setPrefillRfq] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [declaringAuthority, setDeclaringAuthority] = useState(false);

  const loadRfqs = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [profileRes, rfqRes] = await Promise.allSettled([
        marketApi.getBuyerProfile(),
        marketApi.getBuyerRfqs(),
      ]);

      if (profileRes.status === "fulfilled") {
        setBuyerProfile(profileRes.value.data || null);
      }

      if (rfqRes.status === "fulfilled") {
        const payload = rfqRes.value.data;
        setRfqs(Array.isArray(payload) ? payload : Array.isArray(payload?.rfqs) ? payload.rfqs : []);
      } else {
        throw rfqRes.reason;
      }
    } catch(e) { setError(e?.response?.data?.error||e?.message||"Failed to load RFQs"); }
    finally { setLoading(false); }
  }, []);

  const loadQuotes = async (rfqId) => {
    try { const res = await marketApi.getRfqQuotes(rfqId); setQuotes(Array.isArray(res.data)?res.data:[]); }
    catch { setQuotes([]); }
  };

  const onAcceptQuote = async (rfqId, quoteId) => {
    setAccepting(quoteId);
    try { await marketApi.acceptQuote(rfqId,quoteId); await loadQuotes(rfqId); await loadRfqs(); }
    catch(e) { setError(e?.response?.data?.error||"Failed to accept quote"); }
    finally { setAccepting(""); }
  };

  const onCloseRfq = async (rfqId) => {
    try { await marketApi.closeRfq(rfqId); await loadRfqs(); }
    catch(e) { setError(e?.response?.data?.error||"Failed to close RFQ"); }
  };

  const canCreateRfq = buyerProfile?.buyerStatus === "VERIFIED";
  const requiresPurchaseAuthority = buyerProfile && !buyerProfile.purchaseAuthority;
  const requiresVerification = buyerProfile && buyerProfile.buyerStatus !== "VERIFIED";

  const openCreateFlow = (prefill = null) => {
    if (requiresVerification) {
      setError("Your buyer account must be verified before creating an RFQ.");
      return;
    }
    setError("");
    setPrefillRfq(prefill);
    setShowCreate(true);
  };

  const handleDeclarePurchaseAuthority = async () => {
    setDeclaringAuthority(true);
    setError("");
    try {
      await marketApi.declarePurchaseAuthority({ hasAuthority: true });
      await loadRfqs();
      return true;
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to declare purchase authority");
      return false;
    } finally {
      setDeclaringAuthority(false);
    }
  };

  useEffect(() => { loadRfqs(); }, [loadRfqs]);
  useEffect(() => {
    const h = () => setOpenMenuId(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const filtered = rfqs.filter(r => {
    const q = search.toLowerCase();
    if (q && !r.title?.toLowerCase().includes(q) && !r._id?.toLowerCase().includes(q)) return false;
    if (statusFilter!=="All" && API_TO_DISPLAY_STATUS[r.state]!==statusFilter) return false;
    if (categoryFilter!=="All" && RFQ_TYPE_MAP[r.rfqType]!==categoryFilter) return false;
    return true;
  }).sort((a,b) => {
    if (sortBy==="deadline") return new Date(a.timeLine?.expectedDeliveryDate||"2099")-new Date(b.timeLine?.expectedDeliveryDate||"2099");
    if (sortBy==="status") return (a.state||"").localeCompare(b.state||"");
    return new Date(b.createdAt)-new Date(a.createdAt);
  });

  const stats = {
    total:rfqs.length,
    active:rfqs.filter(r=>!["CLOSED","REJECTED"].includes(r.state)).length,
    pending:rfqs.filter(r=>["SUBMITTED","UNDER_VALIDATION","CLARIFICATION_REQUIRED"].includes(r.state)).length,
    quotes:rfqs.reduce((n,r)=>n+(r.quoteCount||0),0),
    urgent:rfqs.filter(r=>r.state==="CLARIFICATION_REQUIRED").length,
  };

  const openDetail = (r) => { setSelectedRfq(r); loadQuotes(r._id); };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Header */}
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
            className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-text tracking-tight">My RFQs</h1>
              <p className="text-sm text-text-muted mt-0.5">Manage and track your sourcing requests</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={()=>{
                const data = filtered.map(r=>({ID:r._id,Title:r.title,Status:r.state,Category:r.rfqType,Created:new Date(r.createdAt).toLocaleDateString()}));
                exportToCsv("rfqs.csv",data);
              }} className="flex items-center gap-2 text-text-muted hover:text-text hover:bg-surface border border-border text-sm font-bold py-2.5 px-4 rounded-xl transition-colors">
                <Icon d={ICONS.download} size={13} /> Export
              </button>
              <motion.button whileTap={{scale:0.97}} whileHover={{scale:1.02}}
                onClick={()=>openCreateFlow()}
                className={`flex items-center gap-2 text-sm font-bold py-2.5 px-5 rounded-xl transition-colors shadow-lg ${canCreateRfq ? requiresPurchaseAuthority ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" : "bg-primary hover:bg-primary-hover text-white shadow-primary/20" : "bg-surface-2 text-text-muted shadow-transparent"}`}>
                <Icon d={ICONS.plus} size={14} /> New RFQ
              </motion.button>
            </div>
          </motion.div>

          {requiresPurchaseAuthority && (
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Icon d={ICONS.alert} size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-900">Purchase Authority Declaration Required</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Declare purchase authority before you create RFQs. {buyerProfile?.buyerStatus !== "VERIFIED" ? "Admin verification is also still required after declaration." : ""}
                  </p>
                </div>
              </div>
              <button onClick={handleDeclarePurchaseAuthority} disabled={declaringAuthority}
                className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50">
                {declaringAuthority ? "Saving..." : "Declare Now"}
              </button>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.05}}
            className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {label:"Total RFQs",val:stats.total,color:"text-text",bg:"bg-background border-border"},
              {label:"Active",val:stats.active,color:"text-emerald-600",bg:"bg-emerald-50 border-emerald-200"},
              {label:"Pending",val:stats.pending,color:"text-amber-600",bg:"bg-amber-50 border-amber-200"},
              {label:"Quotes",val:stats.quotes,color:"text-blue-600",bg:"bg-blue-50 border-blue-200"},
              {label:"Need Attention",val:stats.urgent,color:"text-red-600",bg:stats.urgent>0?"bg-red-50 border-red-300":"bg-background border-border",pulse:stats.urgent>0},
            ].map((s,i)=>(
              <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                className={`rounded-2xl border p-4 shadow-sm ${s.bg}`}>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wide">{s.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                  {s.pulse&&s.val>0 && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
            <Icon d={ICONS.alert} size={13} />{error}
          </div>}

          {/* Toolbar */}
          <div className="bg-background rounded-2xl border border-border shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Icon d={ICONS.search} size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, ID…"
                  className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                className="text-sm font-semibold text-text bg-surface border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0">
                <option value="created">Newest First</option>
                <option value="deadline">By Deadline</option>
                <option value="status">By Status</option>
              </select>
              <button onClick={()=>setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl border transition-colors shrink-0
                  ${showFilters?"bg-primary text-white border-primary":"border-border text-text-muted hover:bg-surface"}`}>
                <Icon d={ICONS.filter} size={13} /> Filters
              </button>
              <div className="flex bg-surface-2 rounded-xl p-0.5 shrink-0">
                {["table","card"].map(v=>(
                  <button key={v} onClick={()=>setViewMode(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode===v?"bg-background text-text shadow-sm":"text-text-muted"}`}>
                    {v==="table"?"≡ List":"⊞ Grid"}
                  </button>
                ))}
              </div>
            </div>
            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                  exit={{height:0,opacity:0}} transition={{duration:0.2}} className="overflow-hidden">
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Status:</p>
                      {ALL_STATUSES.map(s=>(
                        <button key={s} onClick={()=>setStatusFilter(s)}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors
                            ${statusFilter===s?"bg-primary text-white":"bg-surface-2 text-text-muted hover:bg-border"}`}>{s}</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap w-full">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wide">Category:</p>
                      <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}
                        className="text-xs font-semibold text-text bg-surface border border-border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20">
                        {ALL_CATEGORIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-text-muted font-semibold">
              Showing <span className="text-text font-bold">{filtered.length}</span> of <span className="text-text font-bold">{rfqs.length}</span> RFQs
            </p>
            {(statusFilter!=="All"||categoryFilter!=="All"||search) && (
              <button onClick={()=>{setSearch("");setStatusFilter("All");setCategoryFilter("All");}}
                className="text-xs font-bold text-primary">Clear filters ×</button>
            )}
          </div>

          {/* Table */}
          {viewMode==="table" && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
              {loading&&<div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
              {!loading && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] text-text-muted uppercase tracking-wider bg-surface border-b border-border">
                        {["RFQ / Title","Category","Status","Progress","Quotes","Deadline","Actions"].map(h=>(
                          <th key={h} className="px-4 py-3 font-bold whitespace-nowrap last:text-right">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length===0 && (
                        <tr><td colSpan={7} className="text-center py-12 text-text-muted">
                          <Icon d={ICONS.search} size={28} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No RFQs found. Create your first one!</p>
                        </td></tr>
                      )}
                      {filtered.map((r,i)=>(
                        <motion.tr key={r._id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
                          onClick={()=>openDetail(r)}
                          className={`border-b border-border last:border-0 cursor-pointer group transition-colors
                            ${selectedRfq?._id===r._id?"bg-primary/5":"hover:bg-surface"}`}>
                          <td className="px-4 py-3.5">
                            <p className="font-mono text-[10px] text-text-muted">{r._id?.slice(-8)}</p>
                            <p className="font-bold text-text text-sm mt-0.5 flex items-center gap-1.5">
                              {r.state==="CLARIFICATION_REQUIRED" && <Icon d={ICONS.alert} size={11} className="text-orange-500 shrink-0" />}
                              {r.title}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[11px] bg-surface-2 text-text-muted px-2.5 py-1 rounded-lg font-semibold">
                              {RFQ_TYPE_MAP[r.rfqType]||r.rfqType}
                            </span>
                          </td>
                          <td className="px-4 py-3.5"><Badge s={API_TO_DISPLAY_STATUS[r.state]||r.state} /></td>
                          <td className="px-4 py-3.5 w-28">
                            <ProgressBar p={r.state==="CONFIRMED"?75:r.state==="SUBMITTED"?25:50} thin />
                            <p className="text-[10px] text-text-muted font-semibold mt-0.5">
                              {r.state==="CONFIRMED"?"75%":r.state==="SUBMITTED"?"25%":"50%"}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-bold text-text">{r.quoteCount||0}</span>
                            <span className="text-xs text-text-muted"> quotes</span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-text-muted whitespace-nowrap">
                            {r.timeLine?.expectedDeliveryDate?new Date(r.timeLine.expectedDeliveryDate).toLocaleDateString("en-IN"):"—"}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 justify-end" onClick={e=>e.stopPropagation()}>
                              <button onClick={()=>openDetail(r)}
                                className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-text-muted opacity-0 group-hover:opacity-100 transition-all">
                                <Icon d={ICONS.eye} size={13} />
                              </button>
                              <div className="relative">
                                <button onClick={e=>{e.stopPropagation();setOpenMenuId(openMenuId===r._id?null:r._id);}}
                                  className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted opacity-0 group-hover:opacity-100 transition-all">
                                  <Icon d={ICONS.moreH} size={13} />
                                </button>
                                <AnimatePresence>
                                  {openMenuId===r._id && (
                                    <ActionMenu rfq={r} onClose={()=>setOpenMenuId(null)}
                                      onCloseRfq={onCloseRfq}
                                      onDuplicate={(r)=>openCreateFlow(r)} />
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Cards */}
          {viewMode==="card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.length===0 && (
                <div className="col-span-3 text-center py-12 text-text-muted bg-background rounded-2xl border border-border">
                  <Icon d={ICONS.search} size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No RFQs found.</p>
                </div>
              )}
              {filtered.map((r,i)=>(
                <motion.div key={r._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                  className={`bg-background rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer group
                    ${selectedRfq?._id===r._id?"border-primary shadow-primary/10":"border-border hover:border-primary/30"}`}>
                  <div className={`h-1.5 rounded-t-2xl ${r.state==="CONFIRMED"?"bg-emerald-400":r.state==="SUBMITTED"?"bg-amber-400":r.state==="CLARIFICATION_REQUIRED"?"bg-orange-400":"bg-border"}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-text-muted">{r._id?.slice(-8)}</p>
                        <p className="font-bold text-text text-sm mt-0.5 leading-tight">{r.title}</p>
                      </div>
                      <Badge s={API_TO_DISPLAY_STATUS[r.state]||r.state} />
                    </div>
                    <span className="text-[11px] bg-surface-2 text-text-muted px-2 py-0.5 rounded-lg font-semibold">
                      {RFQ_TYPE_MAP[r.rfqType]||r.rfqType}
                    </span>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-muted">Progress</span>
                        <span className="font-bold text-primary">{r.state==="CONFIRMED"?"75%":r.state==="SUBMITTED"?"25%":"50%"}</span>
                      </div>
                      <ProgressBar p={r.state==="CONFIRMED"?75:r.state==="SUBMITTED"?25:50} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
                      <div className="text-center">
                        <p className="text-sm font-black text-text">{r.quoteCount||0}</p>
                        <p className="text-[10px] text-text-muted">Quotes</p>
                      </div>
                      <div className="text-center border-x border-border">
                        <p className="text-sm font-black text-text">{r.quantity?.bulk||"—"}</p>
                        <p className="text-[10px] text-text-muted">Qty</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-black text-text">
                          {r.timeLine?.expectedDeliveryDate?new Date(r.timeLine.expectedDeliveryDate).toLocaleDateString("en-IN",{month:"short",day:"numeric"}):"—"}
                        </p>
                        <p className="text-[10px] text-text-muted">Due</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={()=>openDetail(r)}
                        className="flex-1 py-2 text-xs font-bold rounded-xl border border-border hover:bg-surface text-text-muted flex items-center justify-center gap-1">
                        <Icon d={ICONS.eye} size={11} /> View
                      </button>
                      <button onClick={()=>openCreateFlow(r)}
                        className="flex-1 py-2 text-xs font-bold rounded-xl border border-border hover:bg-surface text-text-muted flex items-center justify-center gap-1">
                        <Icon d={ICONS.repeat} size={11} /> Duplicate
                      </button>
                      {r.state==="CLARIFICATION_REQUIRED" && (
                        <button className="flex-1 py-2 text-xs font-bold rounded-xl bg-orange-500 text-white flex items-center justify-center gap-1">
                          <Icon d={ICONS.alert} size={11} /> Respond
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedRfq && <DetailDrawer rfq={selectedRfq} quotes={quotes} onClose={()=>setSelectedRfq(null)} onAcceptQuote={onAcceptQuote} accepting={accepting} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCreate && <CreateModal
          onClose={()=>{setShowCreate(false);setPrefillRfq(null);}}
          onCreate={loadRfqs}
          prefill={prefillRfq}
          buyerStatus={buyerProfile?.buyerStatus}
          requiresPurchaseAuthority={!!requiresPurchaseAuthority}
          onDeclarePurchaseAuthority={handleDeclarePurchaseAuthority}
        />}
      </AnimatePresence>
    </div>
  );
}
