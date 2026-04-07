import { useEffect, useMemo, useState, useCallback } from "react";
import { marketApi } from "../../api/marketApi";

const statusStyle = {
  AVAILABLE: "bg-blue-50 text-blue-700 border-blue-200",
  PURCHASED: "bg-green-50 text-green-700 border-green-200",
  EXPIRED: "bg-gray-100 text-gray-500 border-gray-200",
  REFUNDED: "bg-orange-50 text-orange-700 border-orange-200",
};

const visStyle = {
  PRIORITY: "bg-purple-50 text-purple-700 border-purple-200",
  EXCLUSIVE: "bg-yellow-50 text-yellow-700 border-yellow-200",
  NORMAL: "bg-gray-50 text-gray-600 border-gray-200",
};

const Badge = ({ s }) => (
  <span className={`border rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${statusStyle[s] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
    {s}
  </span>
);

function DeleteModal({ lead, onClose, onConfirm, loading }) {
  if (!lead) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="font-bold text-lg text-gray-900 mb-2">Delete Lead?</h3>
        <p className="text-sm text-gray-500 mb-1">RFQ: <strong>{lead.rfqId?.title || "—"}</strong></p>
        <p className="text-sm text-gray-500 mb-4">Supplier: <strong>{lead.supplierId?.userId?.name || "—"}</strong></p>
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
          This action is irreversible. The supplier will lose access to this lead.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
            {loading ? "Deleting..." : "Delete Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ lead, onClose, onSave }) {
  const [form, setForm] = useState({
    status: lead?.status || "AVAILABLE",
    visibilityType: lead?.visibilityType || "NORMAL",
    price: lead?.price || 0,
    leadScore: lead?.leadScore || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setLoading(true); setError("");
    try {
      await marketApi.updateAdminLead(lead._id, form);
      onSave();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to update lead");
    } finally { setLoading(false); }
  };

  if (!lead) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Edit Lead</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>
        <p className="text-xs text-gray-500 mb-4">ID: <span className="font-mono">…{String(lead._id).slice(-8)}</span></p>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {["AVAILABLE", "PURCHASED", "EXPIRED", "REFUNDED"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Visibility Type</label>
            <select className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.visibilityType} onChange={e => setForm(p => ({ ...p, visibilityType: e.target.value }))}>
              {["NORMAL", "PRIORITY", "EXCLUSIVE"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Lead Price (₹)</label>
            <input type="number" className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Lead Score (0–100)</label>
            <input type="number" min={0} max={100} className="w-full border rounded-xl px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.leadScore} onChange={e => setForm(p => ({ ...p, leadScore: Number(e.target.value) }))} />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2 text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={onSubmit} disabled={loading}
            className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [editLead, setEditLead] = useState(null);
  const [deleteLead, setDeleteLead] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await marketApi.getAdminLeadsManagement({ page: 1, limit: 100 });
      const payload = res.data;
      setLeads(Array.isArray(payload) ? payload : Array.isArray(payload?.leads) ? payload.leads : []);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load leads");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tabs = useMemo(() => ({
    all: leads.length,
    purchased: leads.filter(l => l.status === "PURCHASED").length,
    available: leads.filter(l => l.status === "AVAILABLE").length,
    expired: leads.filter(l => l.status === "EXPIRED").length,
    refunded: leads.filter(l => l.status === "REFUNDED").length,
  }), [leads]);

  const filtered = useMemo(() => {
    let list = tab === "all" ? leads : leads.filter(l => l.status === tab.toUpperCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        (l.rfqId?.rfqType || "").toLowerCase().includes(q) ||
        (l.supplierId?.userId?.name || "").toLowerCase().includes(q) ||
        (l.rfqId?.title || "").toLowerCase().includes(q) ||
        (l.supplierId?.userId?.email || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, tab, search]);

  const revenue = useMemo(() =>
    leads.filter(l => l.status === "PURCHASED").reduce((sum, l) => sum + (l.price || 0), 0),
  [leads]);

  const handleDelete = async () => {
    if (!deleteLead) return;
    setDeleting(true);
    try {
      await marketApi.deleteAdminLead(deleteLead._id);
      showToast("Lead deleted successfully");
      setDeleteLead(null);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to delete lead");
    } finally { setDeleting(false); }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-semibold animate-pulse">
          ✓ {toast}
        </div>
      )}

      {editLead && (
        <EditModal lead={editLead} onClose={() => setEditLead(null)} onSave={() => { showToast("Lead updated"); load(); }} />
      )}
      {deleteLead && (
        <DeleteModal lead={deleteLead} onClose={() => setDeleteLead(null)} onConfirm={handleDelete} loading={deleting} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Lead Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all lead purchases and marketplace activity</p>
        </div>
        <button onClick={load} disabled={loading}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
          {loading ? <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : "↻ Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Leads",   val: tabs.all,                          iconD: "M22 12h-4l-3 9L9 3l-3 9H2",                                              iconCls: "text-blue-500",   bg: "bg-blue-50"   },
          { label: "Purchased",     val: tabs.purchased,                    iconD: "M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z M1 10h22", iconCls: "text-green-500",  bg: "bg-green-50"  },
          { label: "Available",     val: tabs.available,                    iconD: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z M7 11V7a5 5 0 0110 0v4", iconCls: "text-cyan-500",   bg: "bg-cyan-50"   },
          { label: "Expired",       val: tabs.expired,                      iconD: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2", iconCls: "text-gray-400",   bg: "bg-gray-50"   },
          { label: "Revenue (₹)",   val: `₹${revenue.toLocaleString()}`,   iconD: "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",                 iconCls: "text-purple-500", bg: "bg-purple-50" },
        ].map(({ label, val, iconD, iconCls, bg }) => (
          <div key={label} className={`${bg} border border-gray-100 rounded-2xl p-4 shadow-sm`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`${iconCls} mb-2 opacity-70`}><path d={iconD}/></svg>
            <p className="text-2xl font-black text-gray-800">{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 flex-wrap">
          {Object.entries(tabs).map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                tab === k ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}>
              {k} ({v})
            </button>
          ))}
        </div>
        <input
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          placeholder="Search by RFQ title, supplier name, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                {["Lead ID", "RFQ Title", "Type", "Supplier", "Price", "Score", "Visibility", "Status", "Purchased At", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(l => (
                <tr key={l._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">…{String(l._id).slice(-8)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 text-xs max-w-[160px] truncate">{l.rfqId?.title || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{l.rfqId?.rfqType || "—"}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-800">{l.supplierId?.userId?.name || "—"}</p>
                    <p className="text-xs text-gray-400">{l.supplierId?.userId?.email || "—"}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">₹{(l.price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${l.leadScore || 0}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{l.leadScore || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${visStyle[l.visibilityType] || visStyle.NORMAL}`}>
                      {l.visibilityType || "NORMAL"}
                    </span>
                  </td>
                  <td className="px-4 py-3"><Badge s={l.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {l.purchasedAt ? new Date(l.purchasedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditLead(l)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        title="Edit lead"
                      >
                        ✏️ Edit
                      </button>
                      {l.status !== "PURCHASED" && (
                        <button
                          onClick={() => setDeleteLead(l)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                          title="Delete lead"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-3">📭</p>
            <p className="font-medium">No leads found</p>
            <p className="text-sm mt-1">Leads are created automatically when admin confirms RFQs</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Showing {filtered.length} of {leads.length} leads • Leads auto-generate when admin confirms an RFQ
      </p>
    </div>
  );
}
