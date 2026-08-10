import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText, Database, UserCheck, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const sections = [
    {
      id: 1,
      title: "1. Information We Collect",
      icon: Eye,
      content: "We collect personal information that you voluntarily provide to us when registering for a trek, making a booking, or contacting us. This includes your full name, phone number, email address, emergency contact details, payment information (such as transaction screenshots), and any specific travel preferences or requirements."
    },
    {
      id: 2,
      title: "2. How We Use Your Information",
      icon: FileText,
      content: "We use your personal data to process and confirm your trip bookings, send trip itineraries and meeting point updates, respond to your inquiries, issue payment receipts, ensure safety during treks, and communicate important updates regarding your scheduled group tours."
    },
    {
      id: 3,
      title: "3. Information Sharing & Third-Party Disclosure",
      icon: UserCheck,
      content: "We strictly respect your privacy. We do not sell, trade, or rent your personal information to third parties. We may share necessary details (such as names and contact details) with essential service partners (e.g., local trek guides, transport providers, and accommodation hosts) solely for the purpose of executing your booked trip safely and efficiently."
    },
    {
      id: 4,
      title: "4. Data Security",
      icon: Lock,
      content: "We implement robust technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Online payment details and uploaded proof screenshots are handled securely."
    },
    {
      id: 5,
      title: "5. Data Retention & Your Rights",
      icon: Database,
      content: "We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law. You have the right to request access to your personal data, ask for corrections, or request deletion of your information by contacting our support team."
    },
    {
      id: 6,
      title: "6. Cookies & Web Tracking",
      icon: ShieldCheck,
      content: "Our website may use browser cookies and similar local storage techniques to enhance your browsing experience, remember your preferences, and optimize site performance. You can choose to disable cookies through your browser settings at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] pt-20 pb-16">
      {/* Hero Header */}
      <div className="bg-[#0A2540] text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-4 text-[#F5B301] border border-white/10"
          >
            <ShieldCheck size={16} /> Data Protection &amp; Privacy
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black font-poppins tracking-tight mb-3"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-gray-300 font-medium"
          >
            Last updated on 30-07-2026
          </motion.p>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
        
        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200/80 mb-8"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0A2540] flex items-center justify-center flex-shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Privacy Commitment</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Website Owner: <span className="font-semibold text-gray-800">SWAPNALI PADMAKAR ANNADATE (Trek Premi)</span></p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            At <span className="font-semibold text-gray-800">Trek Premi</span> (operated by <span className="font-semibold text-gray-800">SWAPNALI PADMAKAR ANNADATE</span>), we value your trust and are committed to protecting your personal privacy. This Privacy Policy outlines how we collect, use, safeguard, and disclose your personal data when you visit our website or book our adventure services.
          </p>
        </motion.div>

        {/* Policy Sections */}
        <div className="space-y-5">
          {sections.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.07 * index }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80 hover:border-[#0A2540]/30 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0A2540] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <IconComponent size={20} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-gray-900 font-poppins">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Footer Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 bg-gradient-to-br from-[#0A2540] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-8 shadow-md"
        >
          <h3 className="text-lg font-bold mb-2 font-poppins">Privacy Concerns or Data Requests?</h3>
          <p className="text-sm text-gray-200 mb-6 leading-relaxed">
            If you have any questions regarding this Privacy Policy or wish to exercise your privacy rights, please contact our support team.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#F5B301] text-gray-950 font-bold px-6 py-3 rounded-xl text-xs hover:bg-[#E5A100] transition-colors"
            >
              <Mail size={16} /> Contact Support
            </Link>
            <a
              href="tel:+919156434444"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl text-xs transition-colors border border-white/20"
            >
              <Phone size={16} /> +91 9156434444
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
