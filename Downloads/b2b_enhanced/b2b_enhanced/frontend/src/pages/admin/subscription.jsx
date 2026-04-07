import { useState } from "react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 999,
    titleClass: "text-blue-700",
    features: ["5 lead purchases/day", "10 active RFQs", "Basic analytics", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 2499,
    titleClass: "text-purple-700",
    features: ["15 lead purchases/day", "30 active RFQs", "Advanced analytics", "Priority support", "SQI boost"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 7999,
    titleClass: "text-green-700",
    features: ["Unlimited leads", "Unlimited RFQs", "Custom analytics", "Dedicated manager", "Exclusive leads", "Custom SQI"],
  },
];

const supplierPlans = [
  {
    id: "basic",
    name: "Basic",
    price: 1499,
    titleClass: "text-blue-700",
    features: ["3 lead purchases/day", "Standard visibility", "Basic profile", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 3999,
    titleClass: "text-purple-700",
    features: ["10 lead purchases/day", "Priority visibility", "Enhanced profile", "Priority support", "SQI calculation"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 9999,
    titleClass: "text-yellow-700",
    features: ["Unlimited leads", "Exclusive access", "Premium profile", "24/7 support", "Guaranteed leads", "Platinum SQI boost"],
  },
];

const statCardStyles = {
  blue: {
    card: "bg-blue-50 border-blue-200",
    value: "text-blue-700",
  },
  green: {
    card: "bg-green-50 border-green-200",
    value: "text-green-700",
  },
  red: {
    card: "bg-red-50 border-red-200",
    value: "text-red-700",
  },
  purple: {
    card: "bg-purple-50 border-purple-200",
    value: "text-purple-700",
  },
};

const mockSubscriptions = [
  { id: 1, entity: "Acme Corp (Buyer)", plan: "Growth", status: "active", amount: 2499, nextBilling: "2026-04-26", type: "buyer" },
  { id: 2, entity: "TechFab India (Supplier)", plan: "Pro", status: "active", amount: 3999, nextBilling: "2026-04-15", type: "supplier" },
  { id: 3, entity: "Global Parts (Buyer)", plan: "Starter", status: "expired", amount: 999, nextBilling: "-", type: "buyer" },
  { id: 4, entity: "PrecisionMfg (Supplier)", plan: "Basic", status: "active", amount: 1499, nextBilling: "2026-04-20", type: "supplier" },
];

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState("overview");
  const [subs, setSubs] = useState(mockSubscriptions);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAction = (action, sub) => {
    if (action === "cancel") {
      setSubs((current) => current.map((item) => item.id === sub.id ? { ...item, status: "cancelled" } : item));
      showToast(`Subscription cancelled for ${sub.entity}`);
      return;
    }

    if (action === "renew") {
      setSubs((current) => current.map((item) => (
        item.id === sub.id
          ? {
              ...item,
              status: "active",
              nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            }
          : item
      )));
      showToast(`Subscription renewed for ${sub.entity}`);
      return;
    }

    showToast(`Upgrade flow initiated for ${sub.entity}`);
  };

  const stats = {
    active: subs.filter((sub) => sub.status === "active").length,
    expired: subs.filter((sub) => sub.status === "expired" || sub.status === "cancelled").length,
    revenue: subs.filter((sub) => sub.status === "active").reduce((sum, sub) => sum + sub.amount, 0),
    total: subs.length,
  };

  return (
    <div className="space-y-5 p-6">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-gray-900">Subscriptions</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manage platform subscription plans and billing</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Subscribers", val: stats.total, color: "blue" },
          { label: "Active", val: stats.active, color: "green" },
          { label: "Expired/Cancelled", val: stats.expired, color: "red" },
          { label: "Monthly Revenue", val: `Rs ${stats.revenue.toLocaleString()}`, color: "purple" },
        ].map(({ label, val, color }) => {
          const styles = statCardStyles[color];
          return (
            <div key={label} className={`rounded-xl border p-4 text-center ${styles.card}`}>
              <p className={`text-2xl font-black ${styles.value}`}>{val}</p>
              <p className="mt-0.5 text-xs text-gray-500">{label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {[["overview", "Overview"], ["buyer-plans", "Buyer Plans"], ["supplier-plans", "Supplier Plans"], ["manage", "Manage"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${activeTab === key ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b bg-gray-50 p-4">
              <h3 className="font-bold text-gray-800">Active Subscriptions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    {["Entity", "Plan", "Type", "Amount", "Next Billing", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{sub.entity}</td>
                      <td className="px-4 py-3"><span className="font-semibold text-blue-600">{sub.plan}</span></td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${sub.type === "buyer" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-orange-200 bg-orange-50 text-orange-700"}`}>
                          {sub.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold">Rs {sub.amount.toLocaleString()}/mo</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{sub.nextBilling}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${sub.status === "active" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-600"}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {sub.status === "active" && (
                            <button onClick={() => handleAction("cancel", sub)} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-100">
                              Cancel
                            </button>
                          )}
                          {sub.status !== "active" && (
                            <button onClick={() => handleAction("renew", sub)} className="rounded-lg border border-green-200 bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700 hover:bg-green-100">
                              Renew
                            </button>
                          )}
                          <button onClick={() => handleAction("upgrade", sub)} className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100">
                            Upgrade
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "buyer-plans" && (
        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${plan.popular ? "border-purple-300" : "border-gray-100"}`}>
              {plan.popular && <div className="bg-purple-600 py-1.5 text-center text-xs font-bold text-white">Most Popular</div>}
              <div className="space-y-4 p-5">
                <div>
                  <h3 className={`text-xl font-black ${plan.titleClass}`}>{plan.name}</h3>
                  <p className="mt-2 text-3xl font-black text-gray-900">
                    Rs {plan.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-400">/month</span>
                  </p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">+</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => showToast(`${plan.name} plan selected for buyers`)}
                  className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${plan.popular ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Select {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "supplier-plans" && (
        <div className="grid gap-5 md:grid-cols-3">
          {supplierPlans.map((plan) => (
            <div key={plan.id} className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${plan.popular ? "border-purple-300" : "border-gray-100"}`}>
              {plan.popular && <div className="bg-purple-600 py-1.5 text-center text-xs font-bold text-white">Most Popular</div>}
              <div className="space-y-4 p-5">
                <div>
                  <h3 className={`text-xl font-black ${plan.titleClass}`}>{plan.name}</h3>
                  <p className="mt-2 text-3xl font-black text-gray-900">
                    Rs {plan.price.toLocaleString()}
                    <span className="text-sm font-normal text-gray-400">/month</span>
                  </p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">+</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => showToast(`${plan.name} plan selected for suppliers`)}
                  className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${plan.popular ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  Select {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "manage" && (
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-gray-800">Subscription Configuration</h3>
          <p className="text-sm text-gray-500">Manage platform-wide subscription settings and pricing rules.</p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Default Daily Lead Limit (Free)", val: "3", hint: "Leads per day without subscription" },
              { label: "Lead Base Price (Rs)", val: "100", hint: "Base price before SQI discount" },
              { label: "Trial Period (days)", val: "7", hint: "Free trial for new suppliers" },
              { label: "Lead Expiry (days)", val: "7", hint: "How long leads stay available" },
            ].map(({ label, val, hint }) => (
              <div key={label} className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                <input defaultValue={val} className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400">{hint}</p>
              </div>
            ))}
          </div>
          <button onClick={() => showToast("Settings saved successfully")} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            Save Configuration
          </button>
        </div>
      )}
    </div>
  );
}
