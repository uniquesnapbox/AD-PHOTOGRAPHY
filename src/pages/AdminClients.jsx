import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SectionHeading from "../components/SectionHeading";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const STORAGE_KEY = "ad_admin_auth";

function AdminClients() {
  const [auth, setAuth] = useState({ token: "", admin: null });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [clients, setClients] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      setClients([]);
      setDrafts({});
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

  const loadClients = async () => {
    if (!auth.token) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/clients`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Failed to load clients.");
        return;
      }

      const list = data.clients || [];
      setClients(list);

      const nextDrafts = {};
      list.forEach((client) => {
        nextDrafts[client.id] = client.drive_folder_id || "";
      });
      setDrafts(nextDrafts);
    } catch {
      setError("Unable to connect to backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      loadClients();
    }
  }, [auth.token]);

  const saveClientFolder = async (clientId) => {
    if (!auth.token) return;

    setSavingId(clientId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ drive_folder_id: drafts[clientId] || "" }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Failed to update Drive folder ID.");
        return;
      }

      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId
            ? { ...client, drive_folder_id: data.client?.drive_folder_id || "" }
            : client
        )
      );

      setMessage(`Client #${clientId} updated successfully.`);
    } catch {
      setError("Unable to connect to backend API.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <SEO title="Admin Clients" path="/admin/clients" description="Manage client Google Drive folder IDs." />
      <section className="section-gap bg-white">
        <div className="container-wrap">
          <SectionHeading
            eyebrow="Admin"
            title="Client Gallery Management"
            description="View clients and update Google Drive folder IDs used in client portal gallery."
          />

          {!auth.token ? (
            <form
              onSubmit={handleLogin}
              className="mt-6 max-w-xl rounded-xl border border-slate-200 p-5 shadow-soft"
            >
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
            <>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Logged in as: <span className="font-semibold">{auth.admin?.email}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to="/admin/bookings" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">
                    Admin Bookings
                  </Link>
                  <Link to="/admin/blog" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">
                    Admin Blog
                  </Link>
                  <Link to="/admin/payment-settings" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-accent-100">
                    Payment Settings
                  </Link>
                  <button type="button" className="btn-primary" onClick={loadClients}>
                    Refresh
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold"
                    onClick={clearAuth}
                  >
                    Logout
                  </button>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}

              <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full bg-white text-sm">
                  <thead className="bg-slate-50 text-left text-slate-700">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Drive Folder ID</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-t border-slate-200 align-top">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{client.name}</p>
                          <p className="text-xs text-slate-500">Client ID: {client.id}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{client.email}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={drafts[client.id] || ""}
                            onChange={(event) =>
                              setDrafts((prev) => ({ ...prev, [client.id]: event.target.value }))
                            }
                            className="w-full min-w-[320px] rounded-md border border-slate-300 px-3 py-2"
                            placeholder="Google Drive folder ID"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => saveClientFolder(client.id)}
                            disabled={savingId === client.id}
                            className="btn-primary disabled:opacity-60"
                          >
                            {savingId === client.id ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!loading && clients.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-slate-500" colSpan={4}>
                          No clients found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default AdminClients;

