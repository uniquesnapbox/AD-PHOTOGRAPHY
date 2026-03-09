import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Portfolio from "./pages/Portfolio";
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
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="services" element={<Services />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="contact" element={<Contact />} />
        <Route path="booking" element={<Booking />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="login" element={<Login />} />
        <Route path="admin/bookings" element={<AdminBookings />} />
        <Route path="admin/clients" element={<AdminClients />} />
        <Route path="admin/blog" element={<AdminBlog />} />
        <Route path="admin/payment-settings" element={<AdminPaymentSettings />} />
        <Route
          path="client-portal"
          element={
            <ProtectedRoute>
              <ClientPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="selected-images"
          element={
            <ProtectedRoute>
              <SelectedImages />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/:bookingId"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
