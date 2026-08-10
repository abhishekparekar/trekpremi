import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Star, Shield, ArrowRight, Calendar, X, Share2, Heart, ChevronRight, ChevronLeft,
  Loader2, Mountain, ChevronDown, Check, Compass, Plus, Minus, Users, Download, ArrowDown, ArrowUp,
  MessageCircle, Utensils, Info, AlertCircle, PhoneCall, Camera, Briefcase
} from 'lucide-react';
import { getTripById, getTrips, saveLead } from '../firebase';
import AllDatesModal from '../components/AllDatesModal';
import LeadCaptureModal from '../components/LeadCaptureModal';

const formatItineraryText = (text) => {
  if (!text) return '';
  return text.replace(/([.,])(?!\d)\s*(?!$)/g, '$1\n');
};

const isSaturday = (dateStr) => {
  if (!dateStr) return false;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  return dateObj.getDay() === 6;
};

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [relatedTrips, setRelatedTrips] = useState([]);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // Modal states
  const [showGallery, setShowGallery] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Active section tab & scroll states
  const [activeTab, setActiveTab] = useState('Highlight');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // City filter for Dates section
  const [selectedCity, setSelectedCity] = useState('');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const tabContainerRef = useRef(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await getTripById(id);
        if (tripData) {
          setTrip(tripData);
        }
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
    window.scrollTo(0, 0);
  }, [id]);

  // Handle scroll events (Scroll-to-top & Scroll-Spy)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      const sections = [
        { id: 'section-highlight', tab: 'Highlight' },
        { id: 'section-itinerary', tab: 'Itinerary' },
        { id: 'section-inc-exc', tab: 'Inc. & Exc.' },
        { id: 'section-costing', tab: 'Costing' },
        { id: 'section-dates', tab: 'Dates' },
        { id: 'section-things-to-carry', tab: 'Things to Carry' },
      ];

      const isMobile = window.innerWidth < 768;
      const scrollPosition = window.scrollY + (isMobile ? 210 : 160);

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          if (scrollPosition >= el.offsetTop) {
            setActiveTab(sections[i].tab);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tabName, sectionId) => {
    setActiveTab(tabName);
    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const yOffset = isMobile ? -180 : -150;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const yOffset = isMobile ? -180 : -150;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // City Prices calculation dynamically from Firestore
  const cityPrices = useMemo(() => {
    if (!trip) return [];
    const map = new Map();

    if (trip.pickupLocations && trip.pickupLocations.length > 0) {
      trip.pickupLocations.forEach(p => {
        const cityName = p.city || 'Pune';
        const cityPrice = p.price ?? trip.price ?? 0;
        if (!map.has(cityName)) {
          map.set(cityName, cityPrice);
        }
      });
    }

    if (map.size === 0) {
      map.set('Standard Package', trip?.price || 0);
    }

    return Array.from(map.entries()).map(([city, price]) => ({ city, price }));
  }, [trip]);

  // Departure Dates processing dynamically from Firestore
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const allDepartureDates = useMemo(() => {
    if (!trip) return [];
    const defaultPickup = (trip.pickupLocations && trip.pickupLocations.length > 0) ? trip.pickupLocations[0] : null;

    return [
      ...(trip.availableDates || []).map(d => ({
        date: d,
        type: 'available',
        city: defaultPickup?.city || 'Pune',
        price: trip.price,
        pickupLocation: defaultPickup?.location || 'Departure Point',
        address: defaultPickup?.address || trip.location || '',
        time: defaultPickup?.time || (isSaturday(d) ? '10:00 PM' : '6:00 AM')
      })),
      ...(trip.pickupLocations || []).filter(p => p.date).map(p => ({
        date: p.date,
        type: 'pickup',
        city: p.city || 'Pune',
        price: p.price ?? trip.price,
        pickupLocation: p.location || 'Departure Point',
        address: p.address,
        time: p.time || (isSaturday(p.date) ? '10:00 PM' : '6:00 AM')
      }))
    ]
      .filter(item => {
        const d = new Date(item.date);
        return !isNaN(d.getTime()) && d >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [trip]);

  // Extract cities for filter dynamically
  const availableCities = useMemo(() => {
    const set = new Set();
    cityPrices.forEach(c => set.add(c.city));
    allDepartureDates.forEach(d => { if (d.city) set.add(d.city); });
    if (set.size === 0) set.add('Pune');
    return Array.from(set);
  }, [cityPrices, allDepartureDates]);

  useEffect(() => {
    if (availableCities.length > 0 && !selectedCity) {
      setSelectedCity(availableCities[0]);
    }
  }, [availableCities]);

  // Group dates by Month for Calendar view dynamically
  const monthGroupedDates = useMemo(() => {
    const filtered = selectedCity
      ? allDepartureDates.filter(d => d.city === selectedCity)
      : allDepartureDates;

    const map = new Map();
    filtered.forEach(item => {
      const d = new Date(item.date);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
      }
    });

    return Array.from(map.entries());
  }, [allDepartureDates, selectedCity]);

  const currentMonthData = monthGroupedDates[currentMonthIndex] || monthGroupedDates[0];
  const nextUpcomingDeparture = allDepartureDates.length > 0 ? allDepartureDates[0] : null;

  const handleBooking = (dateStr = '', cityName = '') => {
    const dateToUse = dateStr || (allDepartureDates.length > 0 ? allDepartureDates[0].date : '');
    const cityToUse = cityName || selectedCity || (cityPrices.length > 0 ? cityPrices[0].city : '');
    navigate(`/booking/${id}?date=${dateToUse}&city=${encodeURIComponent(cityToUse)}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: trip?.title || 'Trek Premi', url: url });
      } catch (err) {
        console.log('User canceled share');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    setIsLeadModalOpen(true);
  };

  const handleLeadSubmit = async ({ name, phone, city }) => {
    await saveLead(phone, {
      name,
      city,
      lastDownloadedTripId: id,
      lastDownloadedTripTitle: trip.title
    });
    executeDownloadPDF();
  };

  const executeDownloadPDF = () => {
    const cleanText = (text) => {
      if (!text) return '';
      return text
        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
        .replace(/[\u2600-\u27BF]/g, '')
        .replace(/[\uE000-\uF8FF]/g, '')
        .trim();
    };

    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(cleanText(trip.title), 14, y);
      y += 10;
      doc.setFontSize(16);
      doc.setTextColor(0, 128, 0);
      doc.text(`Price: Rs. ${trip.price}`, 14, y);
      y += 15;

      if (trip.highlights && trip.highlights.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Highlights', 14, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        trip.highlights.forEach(h => {
          doc.text(`• ${cleanText(h)}`, 18, y);
          y += 6;
        });
        y += 5;
      }

      if (trip.description) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('About this trip', 14, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(cleanText(trip.description), 180);
        doc.text(splitDesc, 14, y);
        y += (splitDesc.length * 6) + 10;
      }

      if (y > 250) { doc.addPage(); y = 20; }

      if (trip.itinerary && trip.itinerary.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Itinerary', 14, y);
        y += 8;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        trip.itinerary.forEach(day => {
          doc.setFont('helvetica', 'bold');
          doc.text(`Day ${day.day}: ${cleanText(day.title)}`, 14, y);
          y += 6;
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(cleanText(day.description), 180);
          doc.text(lines, 18, y);
          y += lines.length * 6 + 4;
          if (y > 270) { doc.addPage(); y = 20; }
        });
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Inclusions', 14, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      (trip.inclusions || []).forEach(item => {
        doc.text(`• ${cleanText(item)}`, 18, y);
        y += 6;
      });

      doc.save(`${cleanText(trip.title).replace(/\s+/g, '_')}_Itinerary.pdf`);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <Loader2 className="w-9 h-9 text-[#0d9488] animate-spin" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-center px-4">
          <Mountain className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tour Package Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">The requested trip could not be found or may have been removed.</p>
          <Link to="/trips" className="bg-[#0d9488] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0f766e] transition-colors inline-block">
            Explore Packages
          </Link>
        </div>
      </div>
    );
  }

  const imagesList = (trip.images && trip.images.length > 0) ? trip.images : ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80'];

  const tabsList = [
    { name: 'Highlight', id: 'section-highlight' },
    { name: 'Itinerary', id: 'section-itinerary' },
    { name: 'Inc. & Exc.', id: 'section-inc-exc' },
    { name: 'Costing', id: 'section-costing' },
    { name: 'Dates', id: 'section-dates' },
    { name: 'Things to Carry', id: 'section-things-to-carry' },
  ];

  return (
    <div className="min-h-screen bg-[#f7faf9] text-gray-900 pb-24 lg:pb-16 pt-28 md:pt-20">

      {/* Main Responsive Grid Container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between py-3 mb-2 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-1.5 overflow-hidden truncate">
            <Link to="/" className="hover:text-[#0d9488] transition-colors">Home</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
            <Link to="/trips" className="hover:text-[#0d9488] transition-colors">Tours</Link>
            <ChevronRight size={14} className="flex-shrink-0" />
            <span className="font-semibold text-gray-900 truncate">{trip.title}</span>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs font-bold text-[#0d9488] bg-[#0d9488]/10 hover:bg-[#0d9488]/20 px-3 py-1.5 rounded-full transition-colors flex-shrink-0 ml-2"
          >
            <Share2 size={13} /> Share
          </button>
        </div>

        {/* Responsive Widescreen Grid: Left (Content) & Right (Sidebar for Laptop/PC/iPad) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-8 min-w-0">

            {/* Top Cover Gallery / Carousel */}
            <div className="relative w-full h-[220px] xs:h-[280px] sm:h-[360px] md:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md bg-gray-900 group mb-5">
              <img
                src={imagesList[currentImgIdx]}
                alt={trip.title}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />

              {/* Navigation Arrows */}
              {imagesList.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImgIdx((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95 z-10"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImgIdx((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95 z-10"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full z-10">
                    {imagesList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImgIdx(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentImgIdx ? 'bg-white w-5' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setShowGallery(true)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3.5 py-1.5 rounded-full backdrop-blur-md transition-colors flex items-center gap-1.5 z-10"
              >
                <Camera size={14} /> Photos ({imagesList.length})
              </button>
            </div>

            {/* Title & Meta Badges */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                {trip.title}
              </h1>

              {/* Meta Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="bg-[#e6f4f1] border border-[#b2dfdb] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
                  <Clock className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                  <span className="truncate">{trip.days || 3}Days / {trip.nights || 2}Night</span>
                </div>

                <div className="bg-[#e6f4f1] border border-[#b2dfdb] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
                  <Users className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                  <span className="truncate">Age {trip.ageLimit || '12-45'}</span>
                </div>

                <div className="bg-[#e6f4f1] border border-[#b2dfdb] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
                  <Compass className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                  <span className="truncate">{trip.categoryName || 'Group Tour'}</span>
                </div>

                <div className="bg-[#e6f4f1] border border-[#b2dfdb] px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-800">
                  <MapPin className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                  <span className="truncate">{trip.location || 'India'}</span>
                </div>
              </div>
            </div>

            {/* About Section Card */}
            <div className="bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                About {trip.title}
              </h2>
              <div className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-line font-medium pb-6">
                {trip.description}
              </div>

              {/* Scroll anchor arrow */}
              <div className="absolute left-1/2 -bottom-4 -translate-x-1/2">
                <button
                  onClick={() => scrollToSection('section-highlight')}
                  className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md hover:bg-[#0d9488] transition-colors transform active:scale-95"
                  title="Scroll to details"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>

            {/* FIXED STICKY NAVIGATION TAB BAR WITH BRAND YELLOW BG & BLACK TEXT */}
            <div
              ref={tabContainerRef}
              className="sticky top-[114px] md:top-[80px] z-40 bg-[#F5B301] py-2.5 px-3 rounded-xl sm:rounded-2xl shadow-md mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar w-full border border-amber-500/50"
            >
              {tabsList.map((t) => {
                const isActive = activeTab === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => handleTabClick(t.name, t.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-black text-[#F5B301] underline underline-offset-4 decoration-2 shadow-md scale-[1.02]'
                        : 'text-gray-950 hover:bg-black/10'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>

            {/* MAIN CONTENT CARDS */}
            <div className="space-y-6 sm:space-y-8">

              {/* HIGHLIGHTS CARD */}
              <div id="section-highlight" className="scroll-mt-48 md:scroll-mt-36 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  {trip.title} Highlights
                </h3>

                {trip.highlights && trip.highlights.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      {trip.highlights.slice(0, 6).map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/50 border border-teal-100">
                          <MapPin className="w-4 h-4 text-[#0d9488] mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-800">{h}</span>
                        </div>
                      ))}
                    </div>

                    {trip.highlights.length > 6 && (
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-2">Other Highlights :</h4>
                        <ul className="space-y-1.5 font-medium text-xs sm:text-sm text-gray-700">
                          {trip.highlights.slice(6).map((h, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[#0d9488] font-bold">•</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm italic">Detailed highlights will be shared upon booking.</p>
                )}
              </div>

              {/* ITINERARY CARD */}
              <div id="section-itinerary" className="scroll-mt-48 md:scroll-mt-36 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
                  Our Itinerary
                </h3>

                {trip.itinerary && trip.itinerary.length > 0 ? (
                  <div className="space-y-5">
                    {trip.itinerary.map((day, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#0d9488] text-white text-xs font-black px-2.5 py-0.5 rounded-md">
                            Day {day.day}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-gray-900">
                            {day.title}
                          </h4>
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-line pl-0.5 mb-2">
                          {formatItineraryText(day.description)}
                        </p>

                        {day.showMealIcon !== false && (
                          <div className="mt-3 p-3 bg-teal-50/80 border border-teal-200 rounded-xl flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0d9488] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Utensils size={16} />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs sm:text-sm text-gray-900 mb-0.5">Meals Included</h5>
                              <p className="text-xs text-gray-600 font-medium">
                                • {day.meals || 'Breakfast & Veg/Non-Veg Meals as per itinerary plan'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs sm:text-sm text-amber-900 font-medium">
                      <span className="font-bold text-red-600">*Note:</span> The timings mentioned in itinerary are tentative. The actual schedule will be shared in the WhatsApp group or provided on your tickets.
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-xs sm:text-sm italic">Custom itinerary details available upon request.</p>
                )}
              </div>

              {/* INC & EXC CARD */}
              <div id="section-inc-exc" className="scroll-mt-48 md:scroll-mt-36 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
                  Inclusions &amp; Exclusions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Inclusions */}
                  <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-4">
                    <h4 className="font-bold text-sm sm:text-base text-emerald-900 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      Inclusions
                    </h4>
                    {(trip.inclusions || []).length > 0 ? (
                      <ul className="space-y-2">
                        {(trip.inclusions || []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-800 font-medium">
                            <Check size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">Standard transport &amp; stay included.</p>
                    )}
                  </div>

                  {/* Exclusions */}
                  <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-4">
                    <h4 className="font-bold text-sm sm:text-base text-rose-900 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                        <X size={14} strokeWidth={3} />
                      </div>
                      Exclusions
                    </h4>
                    {(trip.exclusions || []).length > 0 ? (
                      <ul className="space-y-2">
                        {(trip.exclusions || []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-800 font-medium">
                            <X size={14} className="text-rose-500 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">Personal expenses &amp; optional activities not included.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* COSTING CARD */}
              <div id="section-costing" className="scroll-mt-48 md:scroll-mt-36 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Costing
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-gray-200 w-full">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-amber-400 text-gray-900 font-bold">
                        <th className="py-3 px-4 sm:px-6 border-b border-gray-200 w-1/2">Price From</th>
                        <th className="py-3 px-4 sm:px-6 border-b border-gray-200 w-1/2">Starting Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white font-semibold text-gray-800">
                      {cityPrices.map(({ city, price }) => (
                        <tr key={city} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4 sm:px-6">{city}</td>
                          <td className="py-3 px-4 sm:px-6 font-extrabold text-gray-900">
                            Rs. {price?.toLocaleString('en-IN')}/-
                          </td>
                        </tr>
                      ))}
                      {cityPrices.length === 0 && (
                        <tr>
                          <td className="py-3 px-4 sm:px-6">Base Package</td>
                          <td className="py-3 px-4 sm:px-6 font-extrabold">Rs. {trip.price?.toLocaleString('en-IN')}/-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-2">*All prices subject to +5% GST as applicable.</p>
              </div>

              {/* DATES CARD */}
              <div id="section-dates" className="scroll-mt-48 md:scroll-mt-36 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Available Dates
                </h3>

                {/* City Selection Radio Pills */}
                <div className="mb-4">
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">Select a City:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableCities.map((city) => {
                      const isSelected = selectedCity === city;
                      return (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setCurrentMonthIndex(0);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-emerald-500 text-white' : 'border border-gray-300'}`}>
                            {isSelected ? <Check size={10} strokeWidth={3} /> : null}
                          </span>
                          {city}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Calendar Month Header */}
                {monthGroupedDates.length > 0 ? (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm font-bold text-gray-700">
                        Available Dates for {selectedCity || 'All Cities'}:
                      </span>
                      {monthGroupedDates.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentMonthIndex === 0}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 disabled:opacity-30"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-xs font-bold text-gray-900">
                            {currentMonthData ? currentMonthData[0] : ''}
                          </span>
                          <button
                            onClick={() => setCurrentMonthIndex((prev) => Math.min(monthGroupedDates.length - 1, prev + 1))}
                            disabled={currentMonthIndex === monthGroupedDates.length - 1}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700 disabled:opacity-30"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Batch Date Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {currentMonthData && currentMonthData[1].map((item, idx) => {
                        const dateObj = new Date(item.date);
                        const formattedStr = !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                          : item.date;

                        return (
                          <div
                            key={idx}
                            onClick={() => handleBooking(item.date, item.city)}
                            className="relative bg-white border border-gray-300 rounded-2xl p-3 text-center cursor-pointer hover:border-emerald-500 hover:shadow-xs transition-all pt-4"
                          >
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                              Available
                            </div>
                            <p className="text-xs sm:text-sm font-extrabold text-gray-900 mt-1">
                              {formattedStr}
                            </p>
                            <p className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-0.5">
                              ₹{item.price?.toLocaleString('en-IN')} / person
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No scheduled upcoming dates found for this selection.</p>
                )}

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-2 rounded-full border border-gray-900 text-gray-900 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-colors"
                  >
                    View Full Departure Schedule
                  </button>
                </div>
              </div>

              {/* THINGS TO CARRY CARD */}
              <div id="section-things-to-carry" className="scroll-mt-48 md:scroll-mt-36 bg-[#ffffff] border border-gray-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Things to Carry
                </h3>
                {trip.thingsToCarry && trip.thingsToCarry.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trip.thingsToCarry.map((item, i) => (
                      <span key={i} className="px-3.5 py-2 bg-gray-100 text-gray-800 font-semibold text-xs sm:text-sm rounded-xl border border-gray-200 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-[#0d9488]" /> {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-700 font-medium">
                    <span className="px-3.5 py-2 bg-gray-100 rounded-xl flex items-center gap-1.5"><Briefcase size={14} className="text-[#0d9488]" /> Comfortable Rucksack</span>
                    <span className="px-3.5 py-2 bg-gray-100 rounded-xl flex items-center gap-1.5"><Briefcase size={14} className="text-[#0d9488]" /> Trekking Shoes</span>
                    <span className="px-3.5 py-2 bg-gray-100 rounded-xl flex items-center gap-1.5"><Briefcase size={14} className="text-[#0d9488]" /> Water Bottle (2L)</span>
                    <span className="px-3.5 py-2 bg-gray-100 rounded-xl flex items-center gap-1.5"><Briefcase size={14} className="text-[#0d9488]" /> Warm Jacket / Raincoat</span>
                    <span className="px-3.5 py-2 bg-gray-100 rounded-xl flex items-center gap-1.5"><Briefcase size={14} className="text-[#0d9488]" /> Original ID Proof</span>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT STICKY BOOKING SIDEBAR FOR LAPTOP, PC & IPAD */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl space-y-5">
              
              {/* Header Price Tag */}
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Starting Price</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{trip.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-gray-500">/ person</span>
                </div>
                <span className="text-xs font-bold text-red-500 block mt-0.5">+5% GST applicable</span>
              </div>

              {/* Next Upcoming Departure Badge */}
              {nextUpcomingDeparture && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-3.5">
                  <span className="text-[10px] font-extrabold text-[#0d9488] uppercase tracking-wider block mb-0.5">Next Batch Schedule</span>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#0d9488]" /> {new Date(nextUpcomingDeparture.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-600 font-semibold mt-1 flex items-center gap-2">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-[#0d9488]" /> <span className="text-teal-700">{nextUpcomingDeparture.city}</span></span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-[#0d9488]" /> {nextUpcomingDeparture.time}</span>
                  </p>
                </div>
              )}

              {/* City Selection Pills */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Departure Location:</label>
                <div className="flex flex-wrap gap-1.5">
                  {cityPrices.map(({ city }) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        selectedCity === city
                          ? 'bg-[#0d9488] text-white border-[#0d9488]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleBooking()}
                  className="w-full bg-[#008080] hover:bg-[#006666] text-white font-extrabold py-3.5 rounded-2xl text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Book Now <ArrowRight size={18} />
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-2xl text-sm border border-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download Itinerary PDF
                </button>

                <a
                  href={`https://wa.me/919970280549?text=${encodeURIComponent(`Hi! I'm interested in booking *${trip.title}*. Please share details.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle size={18} fill="white" /> Chat on WhatsApp
                </a>
              </div>

              {/* Trust Badges Snippet */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600 font-semibold">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>100% Secure &amp; Verified Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Instant Confirmation &amp; Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>24x7 Expert Tour Assistance</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-3 sm:right-6 bottom-20 lg:bottom-8 z-40 flex flex-col items-center gap-2.5">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-500 text-gray-900 flex items-center justify-center shadow-lg transition-transform active:scale-95"
            title="Back to Top"
          >
            <ArrowUp size={20} strokeWidth={2.5} />
          </button>
        )}

        <a
          href={`https://wa.me/919970280549?text=${encodeURIComponent(`Hi! I'm interested in booking *${trip.title}*. Please share details.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 lg:hidden rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          title="Ask on WhatsApp"
        >

          <MessageCircle size={26} fill="white" />
        </a>
      </div>

      {/* Mobile Sticky Bottom Action Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-gray-900">
                Rs. {trip.price?.toLocaleString('en-IN')}/
              </span>
              <span className="text-xs font-semibold text-gray-500">person</span>
            </div>
            <p className="text-[10px] text-red-500 font-bold">+5% Gst</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-gray-300"
              title="Download Itinerary PDF"
            >
              PDF <Download size={14} />
            </button>
            <button
              onClick={() => handleBooking()}
              className="bg-[#008080] hover:bg-[#006666] text-white px-6 sm:px-8 py-2.5 rounded-xl font-black text-sm shadow-sm transition-all active:scale-95"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Photo Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-white z-[100] overflow-y-auto animate-in fade-in duration-300">
          <div className="sticky top-0 left-0 right-0 bg-white/95 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-gray-200 shadow-xs">
            <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 font-bold text-gray-900">
              <ChevronLeft size={24} /> Close Gallery
            </button>
            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-bold text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors">
              <Share2 size={16} /> Share
            </button>
          </div>

          <div className="max-w-[800px] mx-auto px-4 py-10 space-y-8">
            {imagesList.map((img, i) => (
              <img key={i} src={img} className="w-full object-cover rounded-2xl shadow-xs border border-gray-200" alt={`Trip view ${i + 1}`} />
            ))}
          </div>
        </div>
      )}

      {/* All Dates Modal */}
      <AllDatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trip={trip}
      />

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSubmit={handleLeadSubmit}
        tripTitle={trip?.title}
      />

    </div>
  );
};

export default TripDetail;
