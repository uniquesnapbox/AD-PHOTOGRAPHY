import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ADMIN_AUTH_EVENT,
  clearStoredAdminAuth,
  getStoredAdminAuth,
} from "../utils/adminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const menuItems = [
  { label: "Bookings", to: "/admin/bookings" },
  { label: "Manage Clients", to: "/admin/clients" },
  { label: "Payment Settings", to: "/admin/payment-settings" },
  { label: "Manage Blog", to: "/admin/blog" },
];

function AdminDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(() => getStoredAdminAuth());

  useEffect(() => {
    const syncAuth = () => setAuth(getStoredAdminAuth());
    window.addEventListener("storage", syncAuth);
    window.addEventListener(ADMIN_AUTH_EVENT, syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener(ADMIN_AUTH_EVENT, syncAuth);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const logout = async () => {
    try {
      if (auth?.token) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
      }
    } catch {
      // no-op: local logout still proceeds
    } finally {
      clearStoredAdminAuth();
      navigate("/login", { replace: true });
    }
  };

  const currentTitle = useMemo(() => {
    const found = menuItems.find((item) => location.pathname.startsWith(item.to));
    return found?.label || "Admin Dashboard";
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-stone-100">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed left-4 top-4 z-[70] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm lg:hidden"
      >
        Menu
      </button>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white p-5 shadow-soft transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Dashboard</p>
            <h1 className="mt-2 text-xl font-bold text-ink">Admin Panel</h1>
            <p className="mt-2 text-xs text-slate-500">{auth?.admin?.email || "Administrator"}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-brand-500 text-white" : "text-slate-700 hover:bg-accent-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-accent-100"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={logout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-accent-100"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold text-slate-500">Admin</p>
          <h2 className="text-2xl font-bold text-ink">{currentTitle}</h2>
        </header>

        <main className="px-3 pb-8 pt-6 sm:px-5 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
