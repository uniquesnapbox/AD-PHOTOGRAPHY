import { useEffect, useState } from "react";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const STORAGE_KEY = "ad_admin_auth";

function AdminBookings() {
  const [auth, setAuth] = useState({ token: "", admin: null });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.token) {
          setAuth(parsed);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
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
      setBookings([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Admin login failed.");
        return;
      }
      saveAuth({ token: data.token, admin: data.admin });
    } catch {
      setError("Unable to connect to backend API.");
    }
  };

  const loadBookings = async () => {
    if (!auth.token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to load bookings.");
      } else {
        setBookings(data.bookings || []);
      }
    } catch {
      setError("Unable to connect to backend API.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (!auth.token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) loadBookings();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (auth.token) {
      loadBookings();
    }
  }, [auth.token]);

  return (
    <>
      <SEO title="Admin Bookings" path="/admin/bookings" description="Admin booking dashboard." />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading eyebrow="Admin" title="Bookings Dashboard" description="Manage all booking requests." />

          {!auth.token ? (
            <form onSubmit={handleLogin} className="mt-6 max-w-xl rounded-xl border border-slate-200 p-5 shadow-soft">
              <p className="mb-3 text-sm text-slate-600">Admin Login</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Admin email"
                  required
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Admin password"
                  required
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
              <button type="submit" className="btn-primary mt-4">
                Login as Admin
              </button>
            </form>
          ) : (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700">Logged in as: <span className="font-semibold">{auth.admin?.email}</span></p>
              <div className="flex gap-2">
                <button type="button" className="btn-primary" onClick={loadBookings}>Refresh</button>
                <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={clearAuth}>Logout</button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {auth.token && (
            <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full bg-white text-sm">
                <thead className="bg-slate-50 text-left text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{b.name}</td>
                      <td className="px-4 py-3">{b.event_type}</td>
                      <td className="px-4 py-3">{b.event_date}</td>
                      <td className="px-4 py-3">{b.phone}</td>
                      <td className="px-4 py-3">{b.status}</td>
                      <td className="px-4 py-3">{b.advance_payment}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded bg-slate-900 px-2 py-1 text-white" onClick={() => updateStatus(b.id, "pending")}>Pending</button>
                          <button className="rounded bg-emerald-600 px-2 py-1 text-white" onClick={() => updateStatus(b.id, "approved")}>Approve</button>
                          <button className="rounded bg-red-600 px-2 py-1 text-white" onClick={() => updateStatus(b.id, "rejected")}>Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && bookings.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={7}>No bookings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminBookings;