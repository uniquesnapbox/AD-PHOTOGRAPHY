import { Navigate, Route, Routes, useParams } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import ClientDashboardLayout from "./layouts/ClientDashboardLayout";
import Home from "./pages/Home";
import Work from "./pages/Work";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import ClientPortal from "./pages/ClientPortal";
import SelectedImages from "./pages/SelectedImages";
import AdminBookings from "./pages/AdminBookings";
import AdminClients from "./pages/AdminClients";
import AdminBlog from "./pages/AdminBlog";
import AdminPaymentSettings from "./pages/AdminPaymentSettings";
import Payment from "./pages/Payment";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import NotFound from "./pages/NotFound";

function LegacyPaymentRedirect() {
  const { bookingId } = useParams();
  return <Navigate to={`/client-portal/payment/${bookingId}`} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="work" element={<Work />} />
        <Route path="about" element={<About />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="contact" element={<Contact />} />
        <Route path="booking" element={<Booking />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="login" element={<Login />} />
        <Route path="services" element={<Navigate to="/work" replace />} />
        <Route path="portfolio" element={<Navigate to="/work" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboardLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="bookings" replace />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="payment-settings" element={<AdminPaymentSettings />} />
        <Route path="*" element={<Navigate to="/admin/bookings" replace />} />
      </Route>

      <Route
        path="/client-portal"
        element={
          <ProtectedRoute>
            <ClientDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientPortal />} />
        <Route path="selected-images" element={<SelectedImages />} />
        <Route path="payment/:bookingId" element={<Payment />} />
        <Route path="*" element={<Navigate to="/client-portal" replace />} />
      </Route>

      <Route
        path="/selected-images"
        element={
          <ProtectedRoute>
            <Navigate to="/client-portal/selected-images" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute>
            <LegacyPaymentRedirect />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
