import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { AuthContext } from "../../contexts/AuthContext";

const EyeOn  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const Check  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const ROLES = [
  { key: "buyer",    label: "Buyer",    icon: "🏢", desc: "Source engineering parts globally" },
  { key: "supplier", label: "Supplier", icon: "🏭", desc: "Win verified B2B RFQs" },
  { key: "admin",    label: "Admin",    icon: "⚙️", desc: "Manage the platform" },
];

const Field = ({ label, hint, children }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-semibold text-text">{label}</label>
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </div>
    {children}
  </div>
);

const Input = ({ className = "", ...props }) => (
  <input {...props}
    className={`w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition text-sm ${className}`} />
);

export default function RegisterPage() {
  const [userType, setUserType] = useState("buyer");
  const [name, setName]               = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [agreed, setAgreed]           = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const pwStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const pwLabel  = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const pwColor  = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][pwStrength];

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(s); } catch {} };
  }, []);

  const handleRedirect = (ut) => {
    if (ut === "admin") navigate("/admin/dashboard");
    else if (ut === "supplier") navigate("/supplier/dashboard/leads");
    else navigate("/buyer/dashboard");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!agreed) { setError("Please accept the Terms & Conditions"); return; }
    if (!name.trim()) { setError("Full name is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPw) { setError("Passwords do not match"); return; }
    if (userType !== "admin" && !companyName.trim()) { setError("Company name is required"); return; }

    setLoading(true);
    try {
      if (userType === "buyer") {
        await authApi.register("buyer", { name, email: email.trim().toLowerCase(), password, phone: "0000000000", companyName, companyType: "BUYER" });
        setSuccess("Account created! Redirecting to login…");
        setTimeout(() => navigate("/login"), 1500);
      } else if (userType === "supplier") {
        await authApi.register("supplier", { name, email: email.trim().toLowerCase(), password, companyName, capabilities: ["OTHER"] });
        setSuccess("Supplier account created! Awaiting admin approval.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const payload = { name, email: email.trim().toLowerCase(), password };
        if (setupSecret.trim()) payload.setupSecret = setupSecret.trim();
        const res = await authApi.register("admin", payload);
        const { token, admin } = res.data || {};
        if (token && admin) {
          login({ token, user: { id: admin.id, profileId: admin.id, name: admin.name, email: admin.email, userType: "admin" } });
          navigate("/admin/dashboard");
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.errors?.[0]?.msg || err?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const onGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) { setError("Google Sign-In not configured. Set VITE_GOOGLE_CLIENT_ID in .env"); return; }
    if (userType === "admin") { setError("Google sign-up is not available for admin accounts"); return; }
    if (!agreed) { setError("Please accept the Terms & Conditions first"); return; }
    setError(""); setGoogleLoading(true);

    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await authApi.googleAuth(response.credential, userType);
          const { token, user } = res.data || {};
          if (!token) throw new Error("Token missing");
          login({ token, user });
          handleRedirect(userType);
        } catch (err) {
          setError(err?.response?.data?.error || "Google sign-up failed");
        } finally { setGoogleLoading(false); }
      },
    });
    window.google?.accounts.id.prompt((n) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        setGoogleLoading(false);
        setError("Google popup was blocked. Allow popups or use email/password.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8 px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <span className="font-black text-text text-lg tracking-tight">ControlSource</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-black text-text mb-1">Create account</h1>
          <p className="text-text-muted text-sm mb-6">Join the platform and start sourcing smarter</p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {ROLES.map(r => (
              <button key={r.key} type="button" onClick={() => { setUserType(r.key); setError(""); setSuccess(""); }}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                  userType === r.key
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 bg-surface-2"
                }`}>
                {userType === r.key && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check />
                  </div>
                )}
                <span className="text-xl">{r.icon}</span>
                <span className={`text-xs font-bold ${userType === r.key ? "text-primary" : "text-text"}`}>{r.label}</span>
                <span className="text-[10px] text-text-muted leading-tight hidden sm:block">{r.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <Input type="text" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} required />
              </Field>
              {userType !== "admin" && (
                <Field label="Company Name">
                  <Input type="text" placeholder="Acme Corp" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                </Field>
              )}
            </div>

            <Field label="Email Address">
              <Input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </Field>

            <Field label="Password" hint={password ? <span className={`text-xs font-semibold ${["","text-red-500","text-amber-500","text-blue-500","text-green-600"][pwStrength]}`}>{pwLabel}</span> : null}>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} placeholder="Create a strong password" value={password}
                  onChange={e => setPassword(e.target.value)} required className="pr-11" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition">
                  {showPw ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {password && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwColor : "bg-border"}`} />
                  ))}
                </div>
              )}
            </Field>

            <Field label="Confirm Password">
              <Input type="password" placeholder="Re-enter password" value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)} required />
              {confirmPw && password !== confirmPw && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </Field>

            {userType === "admin" && (
              <Field label="Admin Setup Secret" hint="Optional">
                <Input type="password" placeholder="Leave blank if you're the first admin"
                  value={setupSecret} onChange={e => setSetupSecret(e.target.value)} />
                <p className="text-xs text-text-muted mt-1">Only required if another admin exists and the server has ADMIN_SETUP_SECRET set.</p>
              </Field>
            )}

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <div onClick={() => setAgreed(p => !p)}
                className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition flex-shrink-0 ${agreed ? "bg-primary border-primary" : "border-border bg-surface-2"}`}>
                {agreed && <Check />}
              </div>
              <span className="text-sm text-text-muted">
                I agree to the{" "}
                <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
              </span>
            </label>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm bg-primary hover:bg-primary-hover disabled:opacity-60 transition shadow-sm">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeOpacity=".25" strokeWidth="4"/><path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="4" strokeLinecap="round"/></svg>
                  Creating account…
                </span>
              ) : "Create Account"}
            </button>
          </form>

          {userType !== "admin" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border"/>
                <span className="text-xs text-text-muted font-medium">OR</span>
                <div className="flex-1 h-px bg-border"/>
              </div>
              <button onClick={onGoogleClick} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-white hover:bg-surface-2 transition text-sm font-semibold text-text disabled:opacity-60 shadow-sm">
                {googleLoading ? (
                  <svg className="animate-spin w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="4"/><path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-text-muted mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
