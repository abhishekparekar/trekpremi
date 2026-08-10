import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowRight, User, Map, MapPin, ChevronLeft, ChevronRight, ShieldAlert, FileText, Upload, X, Check, Loader2 } from 'lucide-react';
import { addBooking, getTripById, uploadCompressedImage } from '../firebase';
import { motion } from 'framer-motion';

const isSaturday = (dateStr) => {
  if (!dateStr) return false;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return dateObj.getDay() === 6;
};

const Booking = () => {
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  
  const [trip, setTrip] = useState(null);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Chhatrapati Sambhajinagar');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [isCustomTrekkers, setIsCustomTrekkers] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState(null);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Initialize form data with URL params if available
  const [formData, setFormData] = useState({
    fullName: '', phone: '', date: '', trekkers: 1, paymentType: 'full'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  // Bank Details
  const bankDetails = {
    accountName: 'Trek Premi',
    accountNumber: '50200123374502',
    ifsc: 'HDFC0003671',
    branch: 'Waluj',
    accountType: 'Current Account',
    customerId: '363794306'
  };

  // Fetch Trip details and batches
  useEffect(() => {
    const fetchTripData = async () => {
      if (tripId && tripId !== 'direct-booking') {
        try {
          const tripData = await getTripById(tripId);
          if (tripData) {
            setTrip(tripData);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const defaultPickup = (tripData.pickupLocations && tripData.pickupLocations.length > 0) ? tripData.pickupLocations[0] : null;
            
            const batches = [
              ...(tripData.availableDates || []).map(d => ({
                date: d,
                city: 'Chhatrapati Sambhajinagar',
                price: tripData.price,
                time: defaultPickup?.time || (isSaturday(d) ? '10:00 PM' : '6:00 AM'),
                location: defaultPickup?.location || 'Departure Point'
              })),
              ...(tripData.pickupLocations || []).filter(p => p.date).map(p => ({
                date: p.date,
                city: p.city || 'Chhatrapati Sambhajinagar',
                price: p.price ?? tripData.price,
                time: p.time || (isSaturday(p.date) ? '10:00 PM' : '6:00 AM'),
                location: p.location || 'Departure Point'
              }))
            ]
            .filter(item => {
              const d = new Date(item.date);
              return !isNaN(d.getTime()) && d >= now;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

            setAvailableBatches(batches);
            const dateParam = searchParams.get('date');
            const cityParam = searchParams.get('city');

            if (cityParam) setSelectedCity(cityParam);

            if (!dateParam && batches.length > 0) {
              setFormData(prev => ({ ...prev, date: prev.date || batches[0].date }));
            }
          }
        } catch (err) {
          console.error("Error fetching trip for booking:", err);
        }
      }
    };
    fetchTripData();
  }, [tripId, searchParams]);

  // Extract unique cities configured for this specific trip from batches and pickup locations
  const availableCities = useMemo(() => {
    const citiesSet = new Set();

    if (availableBatches && availableBatches.length > 0) {
      availableBatches.forEach(b => {
        if (b.city && b.city.trim() !== '') {
          citiesSet.add(b.city.trim());
        }
      });
    }

    if (trip && trip.pickupLocations && trip.pickupLocations.length > 0) {
      trip.pickupLocations.forEach(p => {
        if (p.city && p.city.trim() !== '') {
          citiesSet.add(p.city.trim());
        }
      });
    }
    
    if (citiesSet.size === 0) {
      return ['Chhatrapati Sambhajinagar'];
    }
    
    return Array.from(citiesSet);
  }, [trip, availableBatches]);

  // Sync selected city if not set or param changes
  useEffect(() => {
    const cityParam = searchParams.get('city');
    if (cityParam) {
      setSelectedCity(cityParam);
    } else if (availableCities.length > 0 && !availableCities.includes(selectedCity)) {
      setSelectedCity(availableCities[0]);
    }
  }, [searchParams, availableCities]);

  // Filter batches matching selected city
  const cityFilteredBatches = useMemo(() => {
    if (!availableBatches || availableBatches.length === 0) return [];
    if (!selectedCity) return availableBatches;
    const filtered = availableBatches.filter(b => 
      b.city && b.city.toLowerCase() === selectedCity.toLowerCase()
    );
    return filtered.length > 0 ? filtered : availableBatches;
  }, [availableBatches, selectedCity]);

  // Current pricing per person based on selected batch & city
  const selectedBatch = useMemo(() => {
    return cityFilteredBatches.find(b => b.date === formData.date) || cityFilteredBatches[0] || null;
  }, [cityFilteredBatches, formData.date]);

  const currentPricePerPerson = selectedBatch?.price ?? trip?.price ?? 0;
  const currentTotalAmount = currentPricePerPerson * formData.trekkers;

  // Set initial date and trekkers from URL params
  useEffect(() => {
    const dateParam = searchParams.get('date');
    const trekkersParam = searchParams.get('trekkers');
    if (trekkersParam) {
      const val = parseInt(trekkersParam);
      setFormData(prev => ({
        ...prev,
        date: dateParam || prev.date,
        trekkers: val
      }));
      if (![1,2,3,4,5,6,7,8,9,10,15,20].includes(val)) {
        setIsCustomTrekkers(true);
      }
    } else if (dateParam) {
      setFormData(prev => ({
        ...prev,
        date: dateParam
      }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.paymentType === 'half' && !uploadedScreenshot) {
      setError('Please upload payment proof to proceed with 50% advance booking.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const paymentAmount = formData.paymentType === 'half' 
        ? currentTotalAmount / 2 
        : currentTotalAmount;

      let paymentStatus = 'pending';
      if (formData.paymentType === 'half' && uploadedScreenshot) paymentStatus = 'half-paid';
      else if (formData.paymentType === 'full' && uploadedScreenshot) paymentStatus = 'paid';

      const bookingData = {
        name: formData.fullName,
        email: '',
        phone: formData.phone,
        city: selectedCity,
        pickupLocation: selectedBatch?.location || 'Departure Point',
        departureTime: selectedBatch?.time || '10:00 PM',
        pricePerPerson: currentPricePerPerson,
        tripId: tripId || 'direct-booking',
        tripName: trip?.title || 'Trek Booking',
        selectedDate: formData.date,
        travelers: formData.trekkers,
        emergencyContact: { name: '', phone: '' },
        message: '',
        bookingDate: new Date().toISOString().split('T')[0],
        amount: currentTotalAmount,
        paymentType: formData.paymentType,
        amountToPay: paymentAmount,
        paymentStatus,
        paymentScreenshot: uploadedScreenshot || null,
        bankDetails: bankDetails
      };
      
      await addBooking(bookingData);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScreenshotUpload = async (file) => {
    if (!file) return;
    
    try {
      setScreenshotUploading(true);
      const screenshotUrl = await uploadCompressedImage(
        file,
        `bookings/payment-screenshot/${Date.now()}_${file.name}`,
        150
      );
      setUploadedScreenshot(screenshotUrl);
    } catch (err) {
      console.error('Screenshot upload error:', err);
      setError('Failed to upload screenshot. Please try again.');
    } finally {
      setScreenshotUploading(false);
    }
  };

  const inputClass = "w-full bg-[#f8f9fa] border-b-2 border-[#e5e5e5] px-4 py-3.5 text-[#111111] placeholder-[#9ca3af] focus:outline-none focus:border-[#F5B301] focus:bg-[#fff9e6] transition-all duration-300 rounded-t-xl text-sm";
  const labelClass = "block text-[#555] text-xs font-bold uppercase tracking-wider mb-2";
  const sectionClass = "bg-white rounded-3xl p-8 lg:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mb-8";

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center pt-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 max-w-xl text-center border border-[#e5e5e5] shadow-xl"
        >
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-[6px] border-green-100">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-[#111] mb-4">Booking Submitted!</h2>
          <p className="text-[#555] mb-8 leading-relaxed text-lg">Thank you for your booking request. Our experts will review your details and contact you within 24 hours to confirm your trek.</p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-[#111] text-white font-bold py-4 px-10 rounded-full hover:bg-[#F5B301] hover:text-[#111] transition-all duration-300 group">
            Return Home <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Hero Banner */}
      <div className="relative h-[35vh] min-h-[250px] w-full overflow-hidden">
        <img 
          src={trip?.image || "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2000"} 
          alt="Booking Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              {trip ? `Book ${trip.title}` : 'Reserve Your Adventure'}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light drop-shadow-sm">
              {trip?.duration ? `${trip.duration} | ₹${trip.price || 0} per person` : 'Just a few details to secure your spot in the wild.'}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[700px] mx-auto px-4 py-16 lg:py-20">
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 font-medium shadow-sm"
          >
            <AlertCircle size={24} className="flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f0f0f0]"
          >
            <div className="grid grid-cols-1 gap-5">
              
              {/* Step 1: Personal Details (2-column compact layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input 
                    type="text" 
                    name="fullName" 
                    required 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Enter your full name" 
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="+91 98765 43210" 
                  />
                </div>
              </div>

              {/* Step 2: Select Boarding City */}
              <div>
                <label className="text-[#111] font-bold text-sm block mb-2">Select Boarding City:</label>
                <div className="flex flex-wrap gap-2.5">
                  {availableCities.map((city) => {
                    const isSelected = selectedCity.toLowerCase() === city.toLowerCase();

                    return (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setSelectedCity(city);
                          const firstMatchingDate = availableBatches.find(b => b.city?.toLowerCase() === city.toLowerCase());
                          if (firstMatchingDate) {
                            setFormData(prev => ({ ...prev, date: firstMatchingDate.date }));
                          }
                        }}
                        className={`px-4 py-2 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#00a79d] border-[#00a79d] text-white shadow-xs'
                            : 'bg-white border-gray-300 text-gray-800 hover:border-gray-400'
                        }`}
                      >
                        <MapPin size={14} className={isSelected ? 'text-white' : 'text-gray-500'} />
                        <span>{city}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Select Pickup Location */}
              {(() => {
                const pickups = Array.from(new Set(cityFilteredBatches.map(b => `${b.location}-(${b.time})`)));
                if (pickups.length === 0) return null;

                return (
                  <div>
                    <label className="text-[#111] font-bold text-sm block mb-2">Select Pickup Location:</label>
                    <div className="flex flex-wrap gap-2.5">
                      {pickups.map((pStr, idx) => (
                        <div
                          key={idx}
                          className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-800 flex items-center gap-1.5 shadow-2xs"
                        >
                          <MapPin size={13} className="text-gray-500 flex-shrink-0" />
                          <span>{pStr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Step 4: Available Dates for {selectedCity} */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[#111] font-bold text-sm block">Available Dates for {selectedCity}:</label>
                  {availableBatches.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUseCustomDate(!useCustomDate)}
                      className="text-[11px] font-bold text-[#00a79d] hover:underline"
                    >
                      {useCustomDate ? 'Select from Available Dates' : 'Pick Custom Date'}
                    </button>
                  )}
                </div>

                {!useCustomDate ? (
                  <div className="border border-gray-300 rounded-2xl p-4 sm:p-5 bg-white shadow-2xs space-y-4">
                    {/* Month Header Navigation */}
                    <div className="flex items-center justify-center gap-6 border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      <span className="text-sm font-bold text-gray-900">
                        {cityFilteredBatches.length > 0 ? (
                          new Date(cityFilteredBatches[0].date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                        ) : (
                          'Upcoming Batches'
                        )}
                      </span>

                      <button
                        type="button"
                        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Date Cards with Green "Available" Top Badge */}
                    {cityFilteredBatches.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-xs font-medium">
                        No upcoming dates scheduled for {selectedCity} yet.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3.5 pt-2">
                        {cityFilteredBatches.map((b, idx) => {
                          const dateObj = new Date(b.date);
                          const formattedDate = !isNaN(dateObj.getTime())
                            ? dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : b.date;
                          const isSelected = formData.date === b.date;

                          return (
                            <div
                              key={idx}
                              onClick={() => setFormData(prev => ({ ...prev, date: b.date }))}
                              className={`relative pt-3 cursor-pointer transition-all ${
                                isSelected ? 'scale-[1.03]' : 'hover:scale-[1.01]'
                              }`}
                            >
                              {/* Green "Available" Top Pill */}
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 bg-[#10b981] text-white text-[10px] font-extrabold rounded-full shadow-2xs whitespace-nowrap">
                                Available
                              </div>

                              {/* Date Box */}
                              <div className={`px-4 py-3 rounded-xl border-2 text-center transition-all bg-white ${
                                isSelected
                                  ? 'border-[#00a79d] shadow-sm ring-1 ring-[#00a79d]'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}>
                                <span className="text-sm font-bold text-gray-900 block whitespace-nowrap mt-1">
                                  {formattedDate}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
                                  ₹{(b.price || currentPricePerPerson).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <input type="date" name="date" required value={formData.date} onChange={handleChange} className={inputClass} />
                )}
              </div>

              <div>
                <label className={labelClass}>Number of Trekkers *</label>
                <select 
                  name="trekkers" 
                  value={isCustomTrekkers ? "custom" : formData.trekkers} 
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomTrekkers(true);
                      setFormData(prev => ({ ...prev, trekkers: 16 }));
                    } else {
                      setIsCustomTrekkers(false);
                      setFormData(prev => ({ ...prev, trekkers: parseInt(e.target.value) }));
                    }
                  }} 
                  className={`${inputClass} cursor-pointer appearance-none bg-no-repeat`} 
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10,15,20].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>)}
                  <option value="custom">More than 15 (Custom)</option>
                </select>

                {isCustomTrekkers && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className={labelClass}>Enter Number of Trekkers (More than 15) *</label>
                    <input 
                      type="number" 
                      name="customTrekkers"
                      min="16"
                      required 
                      value={formData.trekkers} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || '';
                        setFormData(prev => ({ ...prev, trekkers: val }));
                      }} 
                      className={inputClass} 
                      placeholder="Enter count (e.g. 18)" 
                    />
                  </div>
                )}
              </div>

            </div>

            {/* PAYMENT OPTIONS */}
            <div className="mt-8 pt-8 border-t border-[#e5e5e5]">
              <label className={labelClass}>Payment Option *</label>
              <div className="space-y-3">

                {/* Full Payment */}
                <div className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: formData.paymentType === 'full' ? '#0a9fb5' : '#e5e5e5',
                    backgroundColor: formData.paymentType === 'full' ? '#e8f7f9' : '#f8f9fa'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: 'full' }))}
                >
                  <input 
                    type="radio" name="paymentType" value="full"
                    checked={formData.paymentType === 'full'}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-[#111]">Full Payment</p>
                    <p className="text-sm text-[#666]">Pay ₹{currentTotalAmount.toLocaleString('en-IN')} now</p>
                  </div>
                </div>

                {/* 50% Advance */}
                <div className="flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all"
                  style={{
                    borderColor: formData.paymentType === 'half' ? '#0a9fb5' : '#e5e5e5',
                    backgroundColor: formData.paymentType === 'half' ? '#e8f7f9' : '#f8f9fa'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, paymentType: 'half' }))}
                >
                  <input 
                    type="radio" name="paymentType" value="half"
                    checked={formData.paymentType === 'half'}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value }))}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-[#111]">50% Advance Payment</p>
                    <p className="text-sm text-[#666]">Pay ₹{(currentTotalAmount / 2).toLocaleString('en-IN')} now, rest later</p>
                  </div>
                </div>

              </div>
            </div>

            {/* BANK DETAILS & QR PAYMENT SECTION */}
            <div className="mt-8 pt-8 border-t border-[#e5e5e5]">
              <h3 className="text-lg font-bold text-[#111] mb-4">Bank &amp; UPI Payment Details</h3>
              <div className="bg-gradient-to-br from-[#0a9fb5]/5 to-[#0a9fb5]/10 rounded-2xl p-6 border-2 border-[#0a9fb5]/20">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  
                  {/* QR Code Card */}
                  <div className="w-full md:w-52 flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-[#0a9fb5]/20 shadow-sm text-center flex-shrink-0">
                    <span className="text-[10px] font-black uppercase text-[#0a9fb5] mb-2 tracking-wider bg-[#0a9fb5]/10 px-2.5 py-1 rounded-full">Scan &amp; Pay via UPI</span>
                    <div 
                      className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                      onClick={() => setShowQrModal(true)}
                    >
                      <img 
                        src="/trekpremi_qr.jpeg" 
                        alt="Trek Premi Payment QR Code" 
                        className="w-40 h-40 object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold rounded-xl">
                        Click to Enlarge
                      </div>
                    </div>
                    <p className="text-[11px] text-[#666] mt-2 font-medium">GPay • PhonePe • Paytm • BHIM</p>
                  </div>

                  {/* Bank Details Grid */}
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888] mb-1 tracking-wider">Account Name</p>
                      <p className="text-base font-bold text-[#111]">{bankDetails.accountName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888] mb-1 tracking-wider">Account Number</p>
                      <p className="text-base font-bold text-[#111] font-mono">{bankDetails.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888] mb-1 tracking-wider">IFSC Code</p>
                      <p className="text-base font-bold text-[#111] font-mono">{bankDetails.ifsc}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888] mb-1 tracking-wider">Branch</p>
                      <p className="text-base font-bold text-[#111]">{bankDetails.branch}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888] mb-1 tracking-wider">Account Type</p>
                      <p className="text-base font-bold text-[#111]">{bankDetails.accountType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-[#888] mb-1 tracking-wider">Customer ID</p>
                      <p className="text-base font-bold text-[#111] font-mono">{bankDetails.customerId}</p>
                    </div>
                  </div>

                </div>
                
                <div className="mt-6 p-4 bg-[#fff9e6] border-l-4 border-[#F5B301] rounded-lg">
                  <p className="text-sm text-[#666] font-medium">
                    <span className="font-bold text-[#111]">Amount to Pay ({selectedCity}):</span> ₹{(formData.paymentType === 'half' ? currentTotalAmount / 2 : currentTotalAmount).toLocaleString('en-IN')}
                  </p>
                  {formData.paymentType === 'half' && (
                    <p className="text-sm text-[#666] font-medium mt-2">
                      <span className="font-bold text-[#111]">Remaining Amount:</span> ₹{(currentTotalAmount / 2).toLocaleString('en-IN')} (to be paid later)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PAYMENT SCREENSHOT UPLOAD - for full & half payment */}
            {(formData.paymentType === 'full' || formData.paymentType === 'half') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 pt-8 border-t border-[#e5e5e5]"
              >
                <h3 className="text-lg font-bold text-[#111] mb-1 flex items-center gap-2">
                  <Upload size={20} className="text-[#0a9fb5]" />
                  Upload Payment Proof
                  {formData.paymentType === 'full' && <span className="text-xs font-normal text-[#999] ml-1">(Optional)</span>}
                  {formData.paymentType === 'half' && <span className="text-xs font-normal text-red-400 ml-1">(Required)</span>}
                </h3>
                <p className="text-sm text-[#666] mb-4">
                  {formData.paymentType === 'half' 
                    ? 'Upload screenshot of your 50% advance transfer — required to confirm booking.'
                    : 'Upload screenshot of your full payment transfer for faster confirmation.'}
                </p>

                {!uploadedScreenshot ? (
                  <div 
                    className="border-2 border-dashed border-[#e5e5e5] rounded-2xl p-8 text-center hover:border-[#0a9fb5] transition-colors cursor-pointer group"
                    onClick={() => document.getElementById('screenshotInput').click()}
                  >
                    <input 
                      id="screenshotInput"
                      type="file" 
                      accept="image/*"
                      onChange={(e) => { if (e.target.files?.[0]) handleScreenshotUpload(e.target.files[0]); }}
                      disabled={screenshotUploading}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-[#f3f4f6] group-hover:bg-[#0a9fb5]/10 rounded-lg flex items-center justify-center transition-all">
                        <Upload size={28} className="text-[#999] group-hover:text-[#0a9fb5] transition-colors" />
                      </div>
                      {screenshotUploading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 size={18} className="animate-spin text-[#0a9fb5]" />
                          <p className="font-bold text-[#0a9fb5]">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-[#111]">Click to upload payment screenshot</p>
                          <p className="text-xs text-[#999]">JPG, PNG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-900">Screenshot uploaded successfully!</p>
                      <p className="text-sm text-green-700">Your payment will be verified before confirmation</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedScreenshot(null)}
                      className="text-green-600 hover:text-green-700 px-3 py-1 border border-green-300 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
                    >
                      Change
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-[#f0f0f0]">
              <p className="text-[#717171] text-xs text-center sm:text-left leading-relaxed">
                By booking, you agree to our <Link to="/terms" className="text-[#111] font-bold hover:underline">Terms &amp; Conditions</Link> &amp; <Link to="/privacy-policy" className="text-[#111] font-bold hover:underline">Privacy Policy</Link>.
              </p>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-[#111] text-white font-bold py-4 px-12 rounded-full hover:bg-[#F5B301] hover:text-[#111] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </motion.div>
        </form>
      </div>

      {/* QR Code Modal for Lightbox Preview */}
      {showQrModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowQrModal(false)}
        >
          <div className="relative bg-white p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-[#111] mb-1">Scan QR Code to Pay</h3>
            <p className="text-xs text-[#666] mb-4">Scan using GPay, PhonePe, Paytm, or any UPI App</p>
            <div className="bg-white p-3 rounded-2xl border-2 border-[#0a9fb5]/30 inline-block shadow-sm">
              <img 
                src="/trekpremi_qr.jpeg" 
                alt="Trek Premi Payment QR Code" 
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-xl mx-auto"
              />
            </div>
            <p className="text-sm font-bold text-[#0a9fb5] mt-4">Trek Premi Official QR Code</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
