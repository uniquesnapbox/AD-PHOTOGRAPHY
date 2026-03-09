import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import { logApiError, parseJsonSafe } from "../utils/apiLogger";
import { clearStoredAdminAuth, getStoredAdminAuth } from "../utils/adminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function AdminBookings() {
  const [auth, setAuth] = useState(() => getStoredAdminAuth());
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    if (!auth?.token) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await parseJsonSafe(res);

      if (!res.ok) {
        logApiError("Admin bookings fetch failed", {
          status: res.status,
          response: data,
        });
        setError(data?.message || "Failed to load bookings.");
        if (res.status === 401) {
          clearStoredAdminAuth();
          setAuth(null);
        }
        return;
      }

      setBookings(data.bookings || []);
    } catch (err) {
      logApiError("Admin bookings request error", {
        error: err?.message || err,
      });
      setError("Unable to connect to backend API.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth?.token) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${auth.token}` },
        });
      }
    } catch (err) {
      logApiError("Admin logout request error", {
        error: err?.message || err,
      });
    } finally {
      clearStoredAdminAuth();
      setAuth(null);
    }
  };

  const updateStatus = async (booking, status) => {
    if (!auth?.token) return;

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

    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJsonSafe(res);
      if (!res.ok) {
        logApiError("Admin booking status update failed", {
          status: res.status,
          response: data,
          bookingId: booking.id,
          payload,
        });
        setError(data?.message || "Failed to update booking status.");
        return;
      }

      await loadBookings();
    } catch (err) {
      logApiError("Admin booking status update request error", {
        error: err?.message || err,
        bookingId: booking.id,
      });
      setError("Unable to update booking status.");
    }
  };

  useEffect(() => {
    if (auth?.token) {
      loadBookings();
    }
  }, [auth?.token]);

  if (!auth?.token) return <Navigate to="/login" replace />;

  return (
    <>
      <SEO title="Admin Bookings" path="/admin/bookings" description="Admin booking dashboard." />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading eyebrow="Admin" title="Bookings Dashboard" description="Manage all booking, payment and invoice status." />

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-700">
              Logged in as: <span className="font-semibold">{auth?.admin?.email}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/admin/clients" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">
                Manage Clients
              </Link>
              <Link to="/admin/payment-settings" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">
                Payment Settings
              </Link>
              <Link to="/admin/blog" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">
                Manage Blog
              </Link>
              <button type="button" className="btn-primary" onClick={loadBookings}>Refresh</button>
              <button type="button" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold" onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

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
                        <button className="rounded bg-slate-900 px-2 py-1 text-white" onClick={() => updateStatus(booking, "pending")}>Pending</button>
                        <button className="rounded bg-emerald-600 px-2 py-1 text-white" onClick={() => updateStatus(booking, "approved")}>Approve</button>
                        <button className="rounded bg-red-600 px-2 py-1 text-white" onClick={() => updateStatus(booking, "rejected")}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && bookings.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={10}>No bookings found.</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={10}>Loading bookings...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

export default AdminBookings;
