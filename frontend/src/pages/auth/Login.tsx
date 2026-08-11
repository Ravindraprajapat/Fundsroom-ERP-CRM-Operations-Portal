import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Eye, EyeOff, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";
import api from "../../services/api.ts";
import type { LoginResponse } from "../../types/auth.types.ts";

interface ApiResponse {
  success: boolean;
  data: LoginResponse;
  message?: string;
}

const demoAccounts = [
  { role: "Admin", email: "admin@fundsroom.com", password: "Admin@123" },
  { role: "Sales", email: "sales@fundsroom.com", password: "Sales@123" },
  { role: "Warehouse", email: "warehouse@fundsroom.com", password: "Warehouse@123" },
  { role: "Accounts", email: "accounts@fundsroom.com", password: "Accounts@123" },
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({ email: "", password: "" });

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    const errors = {
      email: trimmedEmail ? (isValidEmail(trimmedEmail) ? "" : "Please enter a valid email address.") : "Email address is required.",
      password: trimmedPassword ? "" : "Password is required.",
    };

    if (errors.email || errors.password) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<ApiResponse>("/auth/login", { email: trimmedEmail, password: trimmedPassword });
      const { user, token } = res.data.data;
      login(user, token);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "Invalid email or password.";
      if (err?.code === "ERR_NETWORK" || !err?.response) {
        message = "Unable to connect to the backend server (http://localhost:5000). Please check if backend service is running.";
      } else if (err?.response?.data?.message) {
        message = err.response.data.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const handleUseDemo = (account: { email: string; password: string }) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
    setFieldErrors({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <section className="relative hidden w-full flex-1 overflow-hidden bg-slate-950 text-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_25%)]" />
          <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-slate-800 opacity-80" />
          <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full border border-slate-700 opacity-60" />
          <div className="relative z-10 flex flex-col justify-center px-12 py-16 xl:px-20 xl:py-24">
            <span className="mb-6 inline-flex items-center rounded-2xl bg-slate-800/90 px-4 py-2 text-sm font-semibold tracking-wide text-slate-200 ring-1 ring-white/10">
              <ShieldCheck className="mr-2 h-4 w-4 text-orange-400" />
              Secure ERP for modern teams
            </span>
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Fundsroom ERP
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Manage your business. Simplify your operations. Customers, inventory, orders, billing and operations — all in one professional ERP workspace.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                "Customers",
                "Inventory",
                "Orders",
                "Billing",
              ].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-sm shadow-slate-950/10">
                  <p className="text-sm font-medium text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <main className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[45%] lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_18px_80px_rgba(15,23,42,0.08)] sm:p-10">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm shadow-slate-900/10">
                    <span className="text-lg font-semibold">F</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Fundsroom ERP</p>
                    <p className="text-xs text-slate-400">Enterprise operations platform</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Welcome back</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Sign in to your Fundsroom ERP account
                </h2>
                <p className="mt-3 text-sm text-slate-500">
                  Enter your credentials to access dashboards, orders, inventory and billing.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className={`w-full rounded-2xl border px-4 py-3 pl-11 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-orange-400/40 ${
                          fieldErrors.email ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200 bg-white"
                        }`}
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">Use your Fundsroom ERP email address.</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-orange-400/40 ${
                          fieldErrors.password ? "border-red-300 bg-red-50 focus:border-red-400" : "border-slate-200 bg-white"
                        }`}
                        disabled={loading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">Your password must be kept private.</p>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                        disabled={loading}
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
                      onClick={(e) => e.preventDefault()}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-slate-950/20 transition duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <span className="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900 transition hover:text-slate-950"
                  onClick={() => setDemoOpen((value) => !value)}
                >
                  <span>Demo accounts</span>
                  {demoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {demoOpen && (
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    {demoAccounts.map((account) => (
                      <div
                        key={account.role}
                        className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{account.role}</p>
                          <p className="mt-1 text-sm text-slate-500">{account.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUseDemo(account)}
                          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 text-center text-xs leading-5 text-slate-500">
                <p>© 2026 Fundsroom ERP</p>
                <p>Secure business operations platform</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
