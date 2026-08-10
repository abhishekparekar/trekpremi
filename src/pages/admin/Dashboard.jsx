import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Calendar, Users, Star, TrendingUp, DollarSign, Activity, Loader2 } from 'lucide-react';
import { subscribeToTrips, subscribeToBookings, subscribeToTestimonials } from '../../firebase';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      {trend && (
        <span className="text-green-600 text-xs font-semibold flex items-center gap-0.5">
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div className="text-xl font-bold text-gray-900 mb-0.5">{value}</div>
    <div className="text-gray-400 text-xs font-medium">{label}</div>
  </div>
);

const AdminDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTrips = subscribeToTrips((data) => setTrips(data));
    const unsubBookings = subscribeToBookings((data) => setBookings(data));
    const unsubTestimonials = subscribeToTestimonials((data) => setTestimonials(data));
    
    // Set loading to false after subscriptions are set up
    const timer = setTimeout(() => setLoading(false), 1000);
    
    return () => {
      unsubTrips();
      unsubBookings();
      unsubTestimonials();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const activeTrips = trips.filter(t => t.status === 'active').length;
  const featuredTrips = trips.filter(t => t.featured).length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
        <h1 className="text-lg sm:text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-xs mt-0.5">Welcome to Trek Premi Admin Panel</p>
      </div>

      <div className="p-3 sm:p-5 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard 
            icon={Mountain} 
            label="Total Trips" 
            value={trips.length} 
            color="bg-gradient-to-br from-primary-500 to-primary-600"
          />
          <StatCard 
            icon={Calendar} 
            label="Pending Bookings" 
            value={pendingBookings} 
            trend="+12%"
            color="bg-gradient-to-br from-yellow-500 to-orange-500"
          />
          <StatCard 
            icon={Users} 
            label="Testimonials" 
            value={testimonials.length} 
            color="bg-gradient-to-br from-green-500 to-emerald-500"
          />
          <StatCard 
            icon={DollarSign} 
            label="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            trend="+8%"
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Recent Bookings</h3>
              <Link to="/admin/bookings" className="text-primary-600 text-xs hover:underline font-semibold">View All</Link>
            </div>
            <div className="space-y-2">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0 text-xs">
                  <div className="min-w-0">
                    <div className="text-gray-900 font-semibold truncate max-w-[130px] sm:max-w-[180px]">{booking.name || 'Guest'}</div>
                    <div className="text-gray-400 text-[11px] truncate max-w-[130px] sm:max-w-[180px]">{booking.tripName || booking.tripId}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-gray-400 text-center py-3 text-xs">No bookings yet</p>
              )}
            </div>
          </div>

          {/* Active Trips */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Active Trips</h3>
              <Link to="/admin/trips" className="text-primary-600 text-xs hover:underline font-semibold">Manage</Link>
            </div>
            <div className="space-y-2">
              {trips.filter(t => t.status === 'active').slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center gap-2.5 py-1.5 border-b border-gray-100 last:border-0">
                  <img src={trip.images?.[0]} alt={trip.title} className="w-10 h-8 rounded object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-semibold text-xs truncate">{trip.title}</div>
                    <div className="text-gray-400 text-[11px]">₹{trip.price?.toLocaleString()}</div>
                  </div>
                  {trip.featured && <span className="text-yellow-500 text-xs">⭐</span>}
                </div>
              ))}
              {activeTrips === 0 && (
                <p className="text-gray-400 text-center py-3 text-xs">No active trips</p>
              )}
            </div>
          </div>

          {/* Recent Testimonials */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Recent Reviews</h3>
              <Link to="/admin/testimonials" className="text-primary-600 text-xs hover:underline font-semibold">Manage</Link>
            </div>
            <div className="space-y-2">
              {testimonials.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-2.5 py-1.5 border-b border-gray-100 last:border-0">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0">
                      {t.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-900 font-semibold text-xs truncate">{t.name}</div>
                    <div className="text-gray-400 text-[11px] truncate">{t.text}</div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={10} className="text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                </div>
              ))}
              {testimonials.length === 0 && (
                <p className="text-gray-400 text-center py-3 text-xs">No testimonials yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/admin/trips" className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <Mountain className="w-4.5 h-4.5 text-primary-600" />
              </div>
              <span className="text-gray-700 text-xs font-semibold">Manage Trips</span>
            </Link>
            <Link to="/admin/bookings" className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 text-yellow-600" />
              </div>
              <span className="text-gray-700 text-xs font-semibold">View Bookings</span>
            </Link>
            <Link to="/admin/gallery" className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-green-600" />
              </div>
              <span className="text-gray-700 text-xs font-semibold">Update Gallery</span>
            </Link>
            <Link to="/" className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <span className="text-gray-700 text-xs font-semibold">View Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
