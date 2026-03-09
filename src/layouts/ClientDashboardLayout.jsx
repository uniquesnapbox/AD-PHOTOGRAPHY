import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { label: "Client Portal", to: "/client-portal" },
  { label: "Selected Images", to: "/client-portal/selected-images" },
];

function ClientDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const shareUrl = useMemo(() => {
    const text = encodeURIComponent(
      `AD Photography client portal: ${window.location.origin}/client-portal`
    );
    return `https://wa.me/?text=${text}`;
  }, []);

  const currentTitle = useMemo(() => {
    if (location.pathname.includes("/selected-images")) return "Selected Images";
    if (location.pathname.includes("/payment/")) return "Advance Payment";
    return "Client Portal";
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

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
            <h1 className="mt-2 text-xl font-bold text-ink">Client Area</h1>
            <p className="mt-2 text-xs text-slate-500">{user?.email || "Logged in client"}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/client-portal"}
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
              onClick={() => navigate("/client-portal?download=all")}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-accent-100"
            >
              Download All
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-accent-100"
            >
              Share on WhatsApp
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-accent-100"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold text-slate-500">Client</p>
          <h2 className="text-2xl font-bold text-ink">{currentTitle}</h2>
        </header>

        <main className="px-3 pb-8 pt-6 sm:px-5 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ClientDashboardLayout;
