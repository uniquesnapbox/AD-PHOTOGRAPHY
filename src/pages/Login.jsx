import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { logApiError, parseJsonSafe } from "../utils/apiLogger";
import { getStoredAdminAuth, setStoredAdminAuth } from "../utils/adminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function Login() {
  const { isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("client");
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const adminAuth = getStoredAdminAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/client-portal" replace />;
  if (adminAuth?.token) return <Navigate to="/admin/bookings" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("");
    setSubmitting(true);

    try {
      if (role === "client") {
        const result = await login(form);
        if (!result.ok) {
          setStatus(result.message);
          return;
        }
        navigate("/client-portal");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await parseJsonSafe(response);
      if (!response.ok) {
        logApiError("Admin login failed", {
          status: response.status,
          response: data,
          email: form.email,
        });
        setStatus(data?.message || "Admin login failed.");
        return;
      }

      setStoredAdminAuth({ token: data.token, admin: data.admin });
      navigate("/admin/bookings");
    } catch (error) {
      logApiError("Admin login request error", {
        error: error?.message || error,
        email: form.email,
      });
      setStatus("Unable to connect to backend API.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Login" path="/login" description="Client and admin login for AD Photography." />
      <section className="section-gap bg-white">
        <div className="container-wrap max-w-2xl">
          <SectionHeading
            eyebrow="Secure Access"
            title="Login"
            description="Use the same page for Client Portal and Admin Dashboard access."
            center
          />

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-soft"
          >
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-1">
              <button
                type="button"
                onClick={() => {
                  setRole("client");
                  setStatus("");
                }}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  role === "client"
                    ? "bg-brand-500 text-white"
                    : "text-slate-700 hover:bg-accent-100"
                }`}
              >
                Client Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("admin");
                  setStatus("");
                }}
                className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                  role === "admin"
                    ? "bg-brand-500 text-white"
                    : "text-slate-700 hover:bg-accent-100"
                }`}
              >
                Admin Login
              </button>
            </div>

            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:border-brand-500 focus:ring"
              />
            </label>

            {status && <p className="mt-3 text-sm text-red-600">{status}</p>}

            <button type="submit" disabled={submitting} className="btn-primary mt-5 disabled:opacity-70">
              {submitting ? "Please wait..." : role === "admin" ? "Login as Admin" : "Login as Client"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Login;
