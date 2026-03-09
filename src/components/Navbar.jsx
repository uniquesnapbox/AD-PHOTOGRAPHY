import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { company } from "../data/siteData";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
  { label: "Booking", to: "/booking" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileWorkOpen, setMobileWorkOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isWorkActive =
    location.pathname.startsWith("/services") || location.pathname.startsWith("/portfolio");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="container-wrap">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
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
            <div className="group relative">
              <button
                type="button"
                className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
                  isWorkActive ? "text-brand-500" : "text-slate-700 group-hover:text-brand-500"
                }`}
              >
                Work
                <span className="text-xs">v</span>
              </button>
              <div className="invisible absolute left-0 top-full z-50 mt-3 w-56 rounded-lg border border-slate-200 bg-white p-2 opacity-0 shadow-soft transition-all group-hover:visible group-hover:opacity-100">
                <NavLink
                  to="/services"
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                    }`
                  }
                >
                  Services
                </NavLink>
                <NavLink
                  to="/portfolio"
                  className={({ isActive }) =>
                    `mt-1 block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                    }`
                  }
                >
                  Portfolio
                </NavLink>
              </div>
            </div>

            {navItems.map((item) => (
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

            <NavLink
              to={isAuthenticated ? "/client-portal" : "/login"}
              className={({ isActive }) =>
                `text-sm font-semibold transition-colors ${
                  isActive ? "text-brand-500" : "text-slate-700 hover:text-brand-500"
                }`
              }
            >
              {isAuthenticated ? "Client Portal" : "Login"}
            </NavLink>
            {isAuthenticated && (
              <button
                type="button"
                onClick={logout}
                className="text-sm font-semibold text-slate-700 transition-colors hover:text-brand-500"
              >
                Logout
              </button>
            )}
          </nav>

          <button
            type="button"
            className="rounded-md p-2 text-slate-700 md:hidden"
            onClick={() =>
              setOpen((prev) => {
                const next = !prev;
                if (!next) setMobileWorkOpen(false);
                return next;
              })
            }
            aria-label="Toggle menu"
          >
            <span className="block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
            <span className="mt-1.5 block h-0.5 w-5 bg-current" />
          </button>
        </div>

        {open && (
          <nav className="space-y-2 border-t border-slate-200 py-3 md:hidden">
            <button
              type="button"
              onClick={() => setMobileWorkOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold ${
                isWorkActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
              }`}
            >
              <span>Work</span>
              <span className="text-xs">{mobileWorkOpen ? "^" : "v"}</span>
            </button>
            {mobileWorkOpen && (
              <div className="space-y-1 pl-3">
                <NavLink
                  to="/services"
                  onClick={() => {
                    setOpen(false);
                    setMobileWorkOpen(false);
                  }}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                    }`
                  }
                >
                  Services
                </NavLink>
                <NavLink
                  to="/portfolio"
                  onClick={() => {
                    setOpen(false);
                    setMobileWorkOpen(false);
                  }}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                    }`
                  }
                >
                  Portfolio
                </NavLink>
              </div>
            )}

            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  setOpen(false);
                  setMobileWorkOpen(false);
                }}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-semibold ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to={isAuthenticated ? "/client-portal" : "/login"}
              onClick={() => {
                setOpen(false);
                setMobileWorkOpen(false);
              }}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-semibold ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-accent-100"
                }`
              }
            >
              {isAuthenticated ? "Client Portal" : "Login"}
            </NavLink>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                  setMobileWorkOpen(false);
                }}
                className="block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-accent-100"
              >
                Logout
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
