import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { company } from "../data/siteData";
import { useAuth } from "../context/AuthContext";
import {
  ADMIN_AUTH_EVENT,
  clearStoredAdminAuth,
  getStoredAdminAuth,
} from "../utils/adminAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const publicItems = [
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Booking", to: "/booking" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState(() => getStoredAdminAuth());
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const syncAdmin = () => setAdminAuth(getStoredAdminAuth());
    window.addEventListener("storage", syncAdmin);
    window.addEventListener(ADMIN_AUTH_EVENT, syncAdmin);

    return () => {
      window.removeEventListener("storage", syncAdmin);
      window.removeEventListener(ADMIN_AUTH_EVENT, syncAdmin);
    };
  }, []);

  const isAdminLoggedIn = Boolean(adminAuth?.token);
  const showPublicMenu = !isAdminLoggedIn && !isAuthenticated;

  const logoutAdmin = async () => {
    try {
      if (adminAuth?.token) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${adminAuth.token}` },
        });
      }
    } catch {
      // no-op
    } finally {
      clearStoredAdminAuth();
      setAdminAuth(null);
      setOpen(false);
    }
  };

  const logoutClient = async () => {
    await logout();
    setOpen(false);
  };

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="container-wrap">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="logo-box h-11 w-11 sm:h-12 sm:w-12">
              <img
                src="/logo.jpg"
                alt={`${company.name} logo`}
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
            <span className="text-lg font-bold tracking-wide text-ink">{company.name}</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {showPublicMenu &&
              publicItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors ${
                      isActive ? "text-brand-500" : "text-slate-700 hover:text-brand-500"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

            {showPublicMenu && (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive ? "text-brand-500" : "text-slate-700 hover:text-brand-500"
                  }`
                }
              >
                Login
              </NavLink>
            )}

            {isAdminLoggedIn && (
              <>
                <NavLink
                  to="/admin/bookings"
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors ${
                      isActive ? "text-brand-500" : "text-slate-700 hover:text-brand-500"
                    }`
                  }
                >
                  Admin Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="text-sm font-semibold text-slate-700 transition-colors hover:text-brand-500"
                >
                  Logout
                </button>
              </>
            )}

            {!isAdminLoggedIn && isAuthenticated && (
              <>
                <NavLink
                  to="/client-portal"
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors ${
                      isActive ? "text-brand-500" : "text-slate-700 hover:text-brand-500"
                    }`
                  }
                >
                  Client Portal
                </NavLink>
                <button
                  type="button"
                  onClick={logoutClient}
                  className="text-sm font-semibold text-slate-700 transition-colors hover:text-brand-500"
                >
                  Logout
                </button>
              </>
            )}
          </nav>

          <button
            type="button"
            className="rounded-md p-2 text-slate-700 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          </button>
        </div>

        {open && (
          <nav className="space-y-2 border-t border-slate-200 py-3 md:hidden">
            {showPublicMenu &&
              publicItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

            {showPublicMenu && (
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-semibold ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                  }`
                }
              >
                Login
              </NavLink>
            )}

            {isAdminLoggedIn && (
              <>
                <NavLink
                  to="/admin/bookings"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                    }`
                  }
                >
                  Admin Dashboard
                </NavLink>
                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-accent-100"
                >
                  Logout
                </button>
              </>
            )}

            {!isAdminLoggedIn && isAuthenticated && (
              <>
                <NavLink
                  to="/client-portal"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                    }`
                  }
                >
                  Client Portal
                </NavLink>
                <button
                  type="button"
                  onClick={logoutClient}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-accent-100"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
