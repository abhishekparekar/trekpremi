import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import ScrollProgress from './components/ScrollProgress';
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDetail from './pages/TripDetail';
import CategoryDetail from './pages/CategoryDetail';
import Booking from './pages/Booking';
import About from './pages/About';
import Contact from './pages/Contact';
import GalleryPage from './pages/GalleryPage';
import TestimonialsPage from './pages/TestimonialsPage';
import TermsAndConditions from './pages/TermsAndConditions';
import CancellationRefundPolicy from './pages/CancellationRefundPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';

import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTrips from './pages/admin/Trips';
import AdminBookings from './pages/admin/Bookings';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminCategories from './pages/admin/Categories';
import AdminGallery from './pages/admin/Gallery';
import AdminLeads from './pages/admin/Leads';

function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <>
      <ScrollProgress />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="trips" element={<Trips />} />
          <Route path="trip/:id" element={<TripDetail />} />
          <Route path="category/:id" element={<CategoryDetail />} />
          <Route path="booking/:tripId" element={<Booking />} />

          <Route path="contact" element={<Contact />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="cancellation-policy" element={<CancellationRefundPolicy />} />
          <Route path="refund-policy" element={<CancellationRefundPolicy />} />
          <Route path="cancellation-and-refund-policy" element={<CancellationRefundPolicy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="trips" element={<AdminTrips />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="gallery" element={<AdminGallery />} />
        </Route>
      </Routes>

    </>
  );
}

export default App;
