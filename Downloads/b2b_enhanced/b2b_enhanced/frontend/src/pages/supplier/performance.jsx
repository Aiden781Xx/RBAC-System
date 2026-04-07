import { useEffect, useState } from "react";
import { marketApi } from "../../api/marketApi";

const meterStyles = {
  blue: { text: "text-blue-700", bar: "bg-blue-500" },
  green: { text: "text-green-700", bar: "bg-green-500" },
  purple: { text: "text-purple-700", bar: "bg-purple-500" },
  orange: { text: "text-orange-700", bar: "bg-orange-500" },
  cyan: { text: "text-cyan-700", bar: "bg-cyan-500" },
  yellow: { text: "text-yellow-700", bar: "bg-yellow-500" },
};

const Meter = ({ label, val, max = 100, color = "blue" }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`text-sm font-black ${(meterStyles[color] || meterStyles.blue).text}`}>{val}/{max}</span>
    </div>
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${(meterStyles[color] || meterStyles.blue).bar}`} style={{ width: `${(val/max)*100}%` }} />
    </div>
  </div>
);

const cardStyles = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  cyan: "bg-cyan-50 border-cyan-200 text-cyan-700",
};

export default function Performance() {
  const [supplier, setSupplier] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [sRes, lRes] = await Promise.allSettled([
        marketApi.getSupplierProfile(),
        marketApi.getSupplierLeads({ page: 1, limit: 100 }),
      ]);
      if (sRes.status === "fulfilled") setSupplier(sRes.value.data);
      if (lRes.status === "fulfilled") setLeads(lRes.value.data?.leads || []);
    } catch (e) { setError("Failed to load performance data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  const sqi = supplier?.SQI || {};
  const access = supplier?.leadAccess || {};
  const perf = supplier?.performance || {};

  const purchasedLeads = leads.filter(l => l.isPurchased);
  const availableLeads = leads.filter(l => !l.isPurchased);

  const conversionPct = access.totalQuotesSubmitted > 0
    ? ((access.totalLeadsConverted || 0) / access.totalQuotesSubmitted * 100).toFixed(1)
    : "0.0";

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Performance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your marketplace performance and lead stats</p>
        </div>
        <button onClick={load} disabled={loading}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5 text-gray-600">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? "animate-spin" : ""}><path d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Refresh
        </button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

      {/* SQI Score Card */}
      <div className={`rounded-2xl p-6 text-white ${sqi.score >= 85 ? "bg-gradient-to-br from-purple-600 to-purple-800" : sqi.score >= 70 ? "bg-gradient-to-br from-yellow-500 to-yellow-700" : sqi.score >= 50 ? "bg-gradient-to-br from-blue-600 to-blue-800" : "bg-gradient-to-br from-orange-500 to-orange-700"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-80">Supplier Quality Index</p>
            <p className="text-6xl font-black mt-1">{sqi.score || 0}</p>
            <p className="text-sm opacity-80 mt-1">Level: {sqi.level || "BRONZE"}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl">{sqi.level === "PLATINUM" ? "💎" : sqi.level === "GOLD" ? "🥇" : sqi.level === "SILVER" ? "🥈" : "🥉"}</p>
            <p className="text-xs opacity-70 mt-2">{sqi.score >= 20 ? "✓ Lead eligible" : "✗ Below threshold"}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Leads Available", val: availableLeads.length, icon: "🎯", color: "blue" },
          { label: "Leads Purchased", val: access.totalLeadsPurchased || 0, icon: "💳", color: "green" },
          { label: "Quotes Submitted", val: access.totalQuotesSubmitted || 0, icon: "📋", color: "purple" },
          { label: "Deals Won", val: access.totalLeadsConverted || 0, icon: "🏆", color: "yellow" },
        ].map(({ label, val, icon, color }) => (
          <div key={label} className={`border rounded-xl p-4 text-center ${cardStyles[color] || cardStyles.blue}`}>
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-2xl font-black">{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Conversion Rate */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">Lead Conversion Funnel</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Leads Available", val: leads.length, color: "blue" },
            { label: "Leads Purchased", val: access.totalLeadsPurchased || 0, color: "cyan" },
            { label: "Quotes Submitted", val: access.totalQuotesSubmitted || 0, color: "purple" },
            { label: "Won", val: access.totalLeadsConverted || 0, color: "green" },
          ].map(({ label, val, color }, i, arr) => (
            <div key={label} className="relative">
              <div className={`border rounded-xl p-3 text-center ${cardStyles[color] || cardStyles.blue}`}>
                <p className="text-2xl font-black">{val}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
              </div>
              {i < arr.length - 1 && <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 text-gray-300">→</div>}
            </div>
          ))}
        </div>
        <div className="mt-4 bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">Overall Conversion Rate</p>
          <p className="text-3xl font-black text-green-600">{conversionPct}%</p>
        </div>
      </div>

      {/* SQI Components */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">SQI Score Components</h3>
        <div className="space-y-4">
          <Meter label="Certifications (30% weight)" val={sqi.components?.certifications || 0} color="blue" />
          <Meter label="Process Capability (25% weight)" val={sqi.components?.processCapability || 0} color="green" />
          <Meter label="Export Maturity (25% weight)" val={sqi.components?.exportMaturity || 0} color="purple" />
          <Meter label="Platform Performance (20% weight)" val={sqi.components?.platformPerformance || 0} color="orange" />
        </div>
      </div>

      {/* Daily limit */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">Today's Lead Access</h3>
        <div className="space-y-3">
          <Meter label={`Used Today (${access.usedToday || 0} of ${access.dailyLimit || 3})`} val={access.usedToday || 0} max={access.dailyLimit || 3} color="blue" />
          <p className="text-sm text-gray-500">{(access.dailyLimit || 3) - (access.usedToday || 0)} purchases remaining today</p>
        </div>
      </div>

      {perf.disputeCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <h3 className="font-bold text-red-800 mb-2">⚠️ Active Disputes</h3>
          <p className="text-sm text-red-600">You have {perf.disputeCount} dispute(s) recorded. Resolve these to improve your SQI score.</p>
        </div>
      )}
    </div>
  );
}
