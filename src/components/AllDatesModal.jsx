import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const isSaturday = (dateStr) => {
  if (!dateStr) return false;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return dateObj.getDay() === 6;
};

const AllDatesModal = ({ isOpen, onClose, trip }) => {
  const navigate = useNavigate();

  if (!isOpen || !trip) return null;

  // Extract dates from the actual trip data
  const defaultPickup = (trip.pickupLocations && trip.pickupLocations.length > 0) ? trip.pickupLocations[0] : null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const realDates = [
    ...(trip.availableDates || []).map((d, i) => ({
      id: `avail-${i}`,
      type: 'Date',
      date: d,
      city: 'Chhatrapati Sambhajinagar',
      time: defaultPickup?.time || (isSaturday(d) ? '10:00 PM' : '6:00 AM'),
      location: defaultPickup?.location || 'Departure Point',
      address: defaultPickup?.address || trip.location || '',
      price: trip.price || 0
    })),
    ...(trip.pickupLocations || []).filter(p => p.date).map((p, i) => ({
      id: p.id || `pickup-${i}`,
      type: 'Pickup',
      date: p.date,
      city: p.city || 'Chhatrapati Sambhajinagar',
      time: p.time || (isSaturday(p.date) ? '10:00 PM' : '6:00 AM'),
      location: p.location || 'Departure Point',
      address: p.address || '',
      price: p.price ?? trip.price ?? 0
    }))
  ]
  .filter(item => {
    const d = new Date(item.date);
    return !isNaN(d.getTime()) && d >= now;
  })
  .sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
          >
            {/* Compact Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 bg-gray-50/80">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-gray-900">All Departure Dates</h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[11px] rounded-full">
                    {realDates.length} Batches
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium truncate max-w-[280px] sm:max-w-xs">{trip.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Compact Dates List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {realDates.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs font-medium">
                  No upcoming dates configured for this trip yet.
                </div>
              ) : (
                realDates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      navigate(`/booking/${trip.id}?date=${item.date}&city=${encodeURIComponent(item.city || '')}`);
                    }}
                    className="flex items-center justify-between p-3 bg-white hover:bg-blue-50/40 border border-gray-200 hover:border-blue-300 rounded-xl shadow-2xs transition-all cursor-pointer group"
                  >
                    {/* Left: Date & City Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-blue-100 text-gray-700 group-hover:text-blue-700 flex items-center justify-center flex-shrink-0 transition-colors">
                        <CalendarIcon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                            {formatDate(item.date)}
                          </span>
                          <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-semibold flex-shrink-0">
                            {item.city}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium truncate">
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-amber-500 flex-shrink-0" />
                            {item.time}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 truncate">
                            <MapPin size={11} className="text-rose-500 flex-shrink-0" />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Price & Book Button */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <div className="text-right">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase">Price</span>
                        <span className="text-xs font-extrabold text-gray-900">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 group-hover:shadow-md"
                      >
                        Book <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AllDatesModal;
