import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import { useAuth } from "../context/AuthContext";
import { ADMIN_AUTH_EVENT, getStoredAdminAuth } from "../utils/adminAuth";

function MainLayout() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => Boolean(getStoredAdminAuth()?.token));

  useEffect(() => {
    const syncAdmin = () => setIsAdminLoggedIn(Boolean(getStoredAdminAuth()?.token));
    window.addEventListener("storage", syncAdmin);
    window.addEventListener(ADMIN_AUTH_EVENT, syncAdmin);

    return () => {
      window.removeEventListener("storage", syncAdmin);
      window.removeEventListener(ADMIN_AUTH_EVENT, syncAdmin);
    };
  }, []);

  const onDashboardRoute =
    location.pathname.startsWith("/admin") || location.pathname.startsWith("/client-portal");

  const hidePublicNavbar = onDashboardRoute || (!loading && (isAuthenticated || isAdminLoggedIn));

  return (
    <div className="min-h-screen">
      {!hidePublicNavbar && <Navbar />}
      <main>
        <Outlet />
      </main>
      <Footer />
      {!onDashboardRoute && <WhatsAppButton />}
    </div>
  );
}

export default MainLayout;
