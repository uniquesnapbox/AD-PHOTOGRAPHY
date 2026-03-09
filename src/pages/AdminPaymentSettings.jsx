import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const STORAGE_KEY = "ad_admin_auth";

const initialForm = {
  upi_id: "",
  upi_name: "",
  bank_name: "",
  account_name: "",
  account_number: "",
  ifsc_code: "",
};

function AdminPaymentSettings() {
  const [auth, setAuth] = useState({ token: "", admin: null });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.token) {
        setAuth(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveAuth = (next) => {
    setAuth(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const clearAuth = async () => {
    try {
      if (auth.token) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
        });
      }
    } catch {
      // ignore
    } finally {
      setAuth({ token: "", admin: null });
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Admin login failed.");
        return;
      }

      saveAuth({ token: data.token, admin: data.admin });
    } catch {
      setError("Unable to connect to backend API.");
    }
  };

  const loadSettings = async () => {
    if (!auth.token) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payment-settings`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Unable to load payment settings.");
        return;
      }

      const settings = data.payment_settings || {};
      setForm({
        upi_id: settings.upi_id || "",
        upi_name: settings.upi_name || "",
        bank_name: settings.bank_name || "",
        account_name: settings.account_name || "",
        account_number: settings.account_number || "",
        ifsc_code: settings.ifsc_code || "",
      });
    } catch {
      setError("Unable to connect to backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      loadSettings();
    }
  }, [auth.token]);

  const onSave = async (event) => {
    event.preventDefault();
    if (!auth.token) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payment-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Unable to save payment settings.");
        return;
      }

      setMessage(data?.message || "Payment settings updated.");
      loadSettings();
    } catch {
      setError("Unable to connect to backend API.");
    } finally {
      setSaving(false);
    }
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <SEO title="Admin Payment Settings" path="/admin/payment-settings" description="Manage UPI and bank settings for client payments." />
      <section className="section-gap bg-white">
        <div className="container-wrap max-w-4xl">
          <SectionHeading
            eyebrow="Admin"
            title="Payment Settings"
            description="Configure UPI and bank account details used on the client payment page."
          />

          {!auth.token ? (
            <form onSubmit={handleLogin} className="mt-6 max-w-xl rounded-xl border border-slate-200 p-5 shadow-soft">
              <p className="mb-3 text-sm text-slate-600">Admin Login</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="email" value={loginForm.email} onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} placeholder="Admin email" required className="rounded-md border border-slate-300 px-3 py-2" />
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} placeholder="Admin password" required className="rounded-md border border-slate-300 px-3 py-2" />
              </div>
              <button type="submit" className="btn-primary mt-4">Login as Admin</button>
            </form>
          ) : (
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">Logged in as: <span className="font-semibold">{auth.admin?.email}</span></p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/admin/bookings" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">Bookings</Link>
                  <Link to="/admin/clients" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">Clients</Link>
                  <Link to="/admin/blog" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">Blog</Link>
                  <button type="button" className="btn-primary" onClick={loadSettings}>Refresh</button>
                  <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={clearAuth}>Logout</button>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}

              <form onSubmit={onSave} className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading settings...</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-slate-700">UPI ID
                      <input name="upi_id" value={form.upi_id} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="example@okaxis" />
                    </label>
                    <label className="text-sm font-medium text-slate-700">UPI Payee Name
                      <input name="upi_name" value={form.upi_name} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" placeholder="AD Photography" />
                    </label>
                    <label className="text-sm font-medium text-slate-700">Bank Name
                      <input name="bank_name" value={form.bank_name} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                    </label>
                    <label className="text-sm font-medium text-slate-700">Account Holder Name
                      <input name="account_name" value={form.account_name} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                    </label>
                    <label className="text-sm font-medium text-slate-700">Account Number
                      <input name="account_number" value={form.account_number} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                    </label>
                    <label className="text-sm font-medium text-slate-700">IFSC Code
                      <input name="ifsc_code" value={form.ifsc_code} onChange={onChange} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
                    </label>
                  </div>
                )}

                <button type="submit" disabled={saving || loading} className="btn-primary mt-5 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminPaymentSettings;
