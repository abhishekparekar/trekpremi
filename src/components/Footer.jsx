import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Compass, ArrowRight } from 'lucide-react';

// WhatsApp icon SVG
const WhatsAppIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tours & Treks', path: '/trips' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
  ];

  const popularCategories = [
    { name: 'Monsoon Treks', path: '/trips' },
    { name: 'Fort Treks', path: '/trips' },
    { name: 'Weekend Getaways', path: '/trips' },
    { name: 'Himalayan Treks', path: '/trips' },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/trekpremii?igsh=N3U3ZGVhNmExZDRq&utm_source=qr', label: 'Instagram' },
    { icon: WhatsAppIcon, href: 'https://wa.me/919970280549', label: 'WhatsApp' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#030712] text-white pt-6 pb-20 lg:pt-10 lg:pb-8 border-t border-slate-800">
      
      {/* Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-teal-500 to-amber-500" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Compact Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-8 pb-6">

          {/* BRAND COLUMN (Compact) */}
          <div className="lg:col-span-4 space-y-2.5">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/trek_premi.png"
                alt="Trek Premi"
                className="h-11 w-11 sm:h-14 sm:w-14 object-contain rounded-full bg-white p-0.5 shadow-md ring-2 ring-amber-400/50"
              />
              <div>
                <span className="text-lg sm:text-2xl font-extrabold text-white tracking-tight font-poppins block leading-tight">
                  Trek Premi
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 tracking-wide uppercase block">
                  Your Dream Travel Partner
                </span>
              </div>
            </Link>

            <p className="text-slate-300 text-xs leading-relaxed font-normal">
              Your trusted trekking &amp; travel partner. We curate extraordinary fort treks, scenic adventures, and group tours.
            </p>

            {/* Compact Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-[#F5B301] hover:text-gray-950 text-slate-200 border border-slate-700 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-95"
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* 2-COLUMN GRID ON MOBILE FOR QUICK LINKS & CATEGORIES (Compact Side-by-Side) */}
          <div className="grid grid-cols-2 lg:col-span-4 gap-4">
            
            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 border-b border-amber-400/40 pb-1 inline-block">
                Quick Links
              </h4>
              <ul className="space-y-1.5 text-xs">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1 truncate"
                    >
                      <ArrowRight size={10} className="text-amber-400 flex-shrink-0" />
                      <span className="truncate">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tour Categories */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 border-b border-amber-400/40 pb-1 inline-block">
                Categories
              </h4>
              <ul className="space-y-1.5 text-xs">
                {popularCategories.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      to={cat.path}
                      className="text-slate-300 hover:text-amber-400 transition-colors font-medium flex items-center gap-1 truncate"
                    >
                      <Compass size={11} className="text-teal-400 flex-shrink-0" />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* CONTACT INFO COLUMN (Compact) */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 border-b border-amber-400/40 pb-1 inline-block">
              Contact &amp; Address
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 bg-slate-800/40 border border-slate-700/60 p-2.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-slate-300 leading-snug">
                  Sai Vihar Colony, MIDC, Ranjangaon Shenpunji, Waluj, Wadgaon Kolhati, Maharashtra 431001
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/60 p-2.5 rounded-xl">
                <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold">
                  <a href="tel:+919970280549" className="text-slate-200 hover:text-amber-400 transition-colors">+91 9970280549</a>
                  <span className="text-slate-600">|</span>
                  <a href="tel:+919156434444" className="text-slate-200 hover:text-amber-400 transition-colors">+91 9156434444</a>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/60 p-2.5 rounded-xl">
                <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <a href="mailto:trekpremi01@gmail.com" className="text-slate-200 hover:text-amber-400 transition-colors font-semibold truncate">
                  trekpremi01@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM COMPACT COPYRIGHT BAR */}
        <div className="border-t border-slate-800/80 pt-4 mt-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-400 font-medium text-center sm:text-left">
            <p>© {currentYear} <span className="text-amber-400 font-bold">Trek Premi</span>. All rights reserved.</p>
            <div className="flex flex-wrap gap-3 sm:gap-5 justify-center">
              <Link to="/privacy-policy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link>
              <span>•</span>
              <Link to="/refund-policy" className="hover:text-amber-400 transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
