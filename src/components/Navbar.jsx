import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, MapPin, Home, Compass, Info, Camera, Star, PhoneCall, Phone, MessageCircle } from 'lucide-react';
import { useCachedTrips } from '../firebaseCache';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [trips, setTrips] = useState([]);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = useCachedTrips((data) => {
      setTrips(data);
    });
    return () => unsubscribe();
  }, []);

  // Typewriter effect for search placeholder
  useEffect(() => {
    if (!trips || trips.length === 0) return;

    let currentIndex = 0;
    let currentText = '';
    let isDeleting = false;
    let typingSpeed = 100;
    let timeout;
    let isActive = true;

    const type = () => {
      if (!isActive) return;
      
      const fullText = trips[currentIndex]?.title || '';
      if (!fullText) {
        currentIndex = (currentIndex + 1) % trips.length;
        timeout = setTimeout(type, 100);
        return;
      }
      
      if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
        typingSpeed = 30;
      } else {
        currentText = fullText.substring(0, currentText.length + 1);
        typingSpeed = 60 + Math.random() * 40;
      }
      
      if (desktopInputRef.current) desktopInputRef.current.placeholder = currentText;
      if (mobileInputRef.current) mobileInputRef.current.placeholder = currentText;
      
      if (!isDeleting && currentText === fullText) {
        typingSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && currentText === '') {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % trips.length;
        typingSpeed = 500;
      }
      
      timeout = setTimeout(type, typingSpeed);
    };

    timeout = setTimeout(type, 1000);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [trips]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = searchContainerRef.current && !searchContainerRef.current.contains(event.target);
      const isOutsideMobile = mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(event.target);
      if (isOutsideDesktop && isOutsideMobile) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    setIsScrolled(window.scrollY > 10);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { 
    setIsMobileMenuOpen(false); 
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Tours & Treks', path: '/trips', icon: Compass },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Gallery', path: '/gallery', icon: Camera },
    { name: 'Testimonials', path: '/testimonials', icon: Star },
    { name: 'Contact Us', path: '/contact', icon: PhoneCall },
  ];

  const isTransparentPage = location.pathname === '/' || location.pathname.startsWith('/category/') || location.pathname.startsWith('/trip/');
  const isTransparent = isTransparentPage && !isScrolled;

  const isActive = (path) => {
    const [p, q] = path.split('?');
    if (q) {
      return location.pathname === p && location.search === `?${q}`;
    }
    return location.pathname === path;
  };

  const searchResults = searchQuery.trim() 
    ? trips.filter(t => 
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.location?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(`/trip/${searchResults[0].id}`);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isTransparent ? 'bg-transparent border-transparent' : 'bg-white shadow-sm border-b border-[#ebebeb]'}`}>
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-[64px] md:h-20">
            
            {/* Left - Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/trek_premi.png"
                  alt="Trek Premi"
                  className="h-12 w-12 md:h-14 md:w-14 object-contain rounded-full bg-white p-0.5 shadow-sm border border-gray-100"
                />
                <span className={`text-xl md:text-2xl font-bold font-poppins tracking-tight transition-colors duration-300 ${isTransparent ? 'text-white' : 'text-[#0A2540]'}`}>
                  Trek Premi
                </span>
              </Link>
            </div>

            {/* Center - Desktop Search Pill */}
            <div className="flex-1 mx-4 hidden md:block" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full h-[48px] rounded-full bg-white border border-[#dddddd] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition-shadow duration-200 pl-5 pr-2 py-2 cursor-text focus-within:bg-[#f7f7f7]">
                <input
                  ref={desktopInputRef}
                  type="text"
                  placeholder="Search destinations, treks..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  className="flex-1 w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-[#222222] placeholder:text-[#717171] font-medium"
                />
                <button type="submit" className="bg-[#1B365D] p-2 rounded-full ml-2 flex-shrink-0 flex items-center justify-center hover:bg-[#0F233F] transition-colors shadow-sm">
                  <Search size={16} className="text-white" strokeWidth={2.5} />
                </button>

                {/* Suggestions Dropdown */}
                {isSearchFocused && searchQuery.trim() && (
                  <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-[0_8px_28px_rgba(0,0,0,0.15)] border border-[#ebebeb] overflow-hidden z-[100] py-2">
                    {searchResults.length > 0 ? (
                      searchResults.map(trip => (
                        <Link 
                          key={trip.id}
                          to={`/trip/${trip.id}`}
                          onClick={() => {
                            setSearchQuery('');
                            setIsSearchFocused(false);
                          }}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-[#f7f7f7] transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={trip.images?.[0] || '/placeholder.jpg'} alt={trip.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-[#222222] truncate">{trip.title}</h4>
                            <p className="text-xs text-[#717171] truncate flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="flex-shrink-0" /> <span className="truncate">{trip.location}</span>
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="px-5 py-4 text-sm text-[#717171] text-center">
                        No matching trips found
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'text-[#0d9488] font-bold'
                      : isTransparent ? 'text-white hover:text-amber-300' : 'text-gray-700 hover:text-[#0d9488]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right - Mobile Menu Hamburger Toggle Button */}
            <div className="flex items-center justify-end flex-shrink-0 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-2 transition-colors rounded-xl border ${
                  isTransparent
                    ? 'text-white border-white/30 bg-black/20 hover:bg-white/20'
                    : 'text-gray-900 border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                aria-label="Open Navigation Menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Persistent Mobile Search Bar */}
          <div ref={mobileSearchContainerRef} className="px-4 pb-3 pt-1 block md:hidden relative">
            <form onSubmit={handleSearchSubmit} className="border w-full border-gray-300 shadow-sm rounded-full bg-white">
              <div className="flex items-center gap-2 px-2 py-2 w-[95%] mx-auto">
                <Search size={16} className="text-[#717171]" />
                <input 
                  ref={mobileInputRef}
                  id="searchInput" 
                  className="border-none bg-transparent focus:outline-none w-full text-sm text-[#222222]" 
                  placeholder="Search destinations, treks..." 
                  type="text" 
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                />
              </div>
            </form>

            {/* Mobile Search Suggestions */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute top-[calc(100%+4px)] left-4 right-4 bg-white rounded-xl border border-[#ebebeb] shadow-lg overflow-hidden z-[100]">
                {searchResults.length > 0 ? (
                  searchResults.map(trip => (
                    <Link 
                      key={trip.id}
                      to={`/trip/${trip.id}`}
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchFocused(false);
                      }}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-[#f7f7f7] transition-colors border-b border-[#f0f0f0] last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={trip.images?.[0] || '/placeholder.jpg'} alt={trip.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-[#222222] truncate">{trip.title}</h4>
                        <p className="text-xs text-[#717171] truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="flex-shrink-0" /> <span className="truncate">{trip.location}</span>
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm text-[#717171] text-center">
                    No matching trips found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROPER MOBILE NAVIGATION SIDEBAR / DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Dark Overlay Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Right Slide-in Sidebar Drawer Container */}
          <div className="fixed top-0 right-0 bottom-0 w-[290px] max-w-[85vw] bg-white shadow-2xl z-[110] flex flex-col justify-between p-5 animate-in slide-in-from-right duration-300">
            
            {/* Sidebar Header */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <img src="/trek_premi.png" alt="Trek Premi" className="h-10 w-10 object-contain rounded-full bg-white p-0.5 shadow-sm border border-gray-200" />
                  <div>
                    <span className="text-lg font-extrabold text-gray-900 font-poppins block leading-none">Trek Premi</span>
                    <span className="text-[10px] font-bold text-[#0d9488] uppercase tracking-wider block mt-0.5">Travel Partner</span>
                  </div>
                </Link>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                  aria-label="Close Menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Items List */}
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const active = isActive(link.path);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-extrabold transition-all ${
                        active
                          ? 'bg-[#F5B301]/20 text-amber-900 border-l-4 border-[#F5B301]'
                          : 'text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-[#0d9488]' : 'text-gray-500'} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Direct Actions Footer */}
            <div className="border-t border-gray-100 pt-4 space-y-2.5">
              <a
                href="https://wa.me/919970280549"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <MessageCircle size={16} fill="white" /> Chat on WhatsApp
              </a>

              <a
                href="tel:+919970280549"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Phone size={15} /> Call Helpline
              </a>

              <p className="text-[10px] text-center text-gray-400 font-semibold pt-1">
                © Trek Premi • All rights reserved
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
