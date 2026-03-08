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

  const updateStatus = async (booking, status) => {
    if (!auth.token) return;

    const payload = { status };

    if (status === "approved") {
      const existing = Number(booking.advance_amount ?? booking.advance_payment ?? 0);
      const value = window.prompt("Enter advance amount (INR)", existing > 0 ? String(existing) : "5000");
      if (value === null) return;

      const amount = Number(value);
      if (!Number.isFinite(amount) || amount <= 0) {
        setError("Please enter a valid advance amount greater than 0.");
        return;
      }

      payload.advance_amount = amount;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to update booking status.");
        return;
      }

      loadBookings();
    } catch {
      setError("Unable to update booking status.");
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
          <SectionHeading eyebrow="Admin" title="Bookings Dashboard" description="Manage all booking, payment and invoice status." />

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
              <p className="text-sm text-slate-700">
                Logged in as: <span className="font-semibold">{auth.admin?.email}</span>
              </p>
              <div className="flex gap-2">
                <button type="button" className="btn-primary" onClick={loadBookings}>Refresh</button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
                  onClick={clearAuth}
                >
                  Logout
                </button>
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
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Booking Status</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Advance</th>
                    <th className="px-4 py-3">Payment Ref</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{booking.name}</td>
                      <td className="px-4 py-3">{booking.event_type}</td>
                      <td className="px-4 py-3">{booking.event_date}</td>
                      <td className="px-4 py-3">{booking.phone}</td>
                      <td className="px-4 py-3">{booking.status}</td>
                      <td className="px-4 py-3">{booking.payment_status || "pending"}</td>
                      <td className="px-4 py-3">INR {Number(booking.advance_amount ?? booking.advance_payment ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3">{booking.payment_reference || "-"}</td>
                      <td className="px-4 py-3">{booking.invoice_number || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded bg-slate-900 px-2 py-1 text-white"
                            onClick={() => updateStatus(booking, "pending")}
                          >
                            Pending
                          </button>
                          <button
                            className="rounded bg-emerald-600 px-2 py-1 text-white"
                            onClick={() => updateStatus(booking, "approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="rounded bg-red-600 px-2 py-1 text-white"
                            onClick={() => updateStatus(booking, "rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!loading && bookings.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-slate-500" colSpan={10}>No bookings found.</td>
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
