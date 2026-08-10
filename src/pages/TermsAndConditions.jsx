import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Scale, Building2, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  const termsList = [
    {
      id: 1,
      title: "Account Registration & Accuracy",
      content: "To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account."
    },
    {
      id: 2,
      title: "Disclaimer of Warranties",
      content: "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law."
    },
    {
      id: 3,
      title: "User Risk & Assessment",
      content: "Your use of our Services and the website is solely at your own risk and discretion. You are required to independently assess and ensure that the Services meet your requirements."
    },
    {
      id: 4,
      title: "Proprietary Rights & Intellectual Property",
      content: "The contents of the Website and the Services are proprietary to Us and you will not have any authority to claim any intellectual property rights, title, or interest in its contents."
    },
    {
      id: 5,
      title: "Unauthorized Use",
      content: "You acknowledge that unauthorized use of the Website or the Services may lead to action against you as per these Terms or applicable laws."
    },
    {
      id: 6,
      title: "Service Charges",
      content: "You agree to pay us the charges associated with availing the Services."
    },
    {
      id: 7,
      title: "Lawful Use Requirement",
      content: "You agree not to use the website and/ or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you."
    },
    {
      id: 8,
      title: "Third-Party Links",
      content: "You agree and acknowledge that website and the Services may contain links to other third party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third party websites."
    },
    {
      id: 9,
      title: "Binding Contract",
      content: "You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with us for the Services."
    },
    {
      id: 10,
      title: "Refunds & Eligibility",
      content: "You shall be entitled to claim a refund of the payment made by you in case we are not able to provide the Service. The timelines for such return and refund will be according to the specific Service you have availed or within the time period provided in our policies (as applicable). In case you do not raise a refund claim within the stipulated time, then this would make you ineligible for a refund."
    },
    {
      id: 11,
      title: "Force Majeure",
      content: "Notwithstanding anything contained in these Terms, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event."
    },
    {
      id: 12,
      title: "Governing Law",
      content: "These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India."
    },
    {
      id: 13,
      title: "Jurisdiction",
      content: "All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in Aurangabad, MH."
    },
    {
      id: 14,
      title: "Contact & Concerns",
      content: "All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website."
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
            <ShieldCheck size={16} /> Legal &amp; Policy
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black font-poppins tracking-tight mb-3"
          >
            Terms &amp; Conditions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-gray-300 font-medium"
          >
            Last updated on 30-07-2026 15:54:15
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
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Agreement Overview</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Website Owner: <span className="font-semibold text-gray-800">SWAPNALI PADMAKAR ANNADATE</span></p>
            </div>
          </div>
          
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              These Terms and Conditions, along with privacy policy or other terms (“Terms”) constitute a binding agreement by and between <span className="font-semibold text-gray-800">SWAPNALI PADMAKAR ANNADATE</span>, (“Website Owner” or “we” or “us” or “our”) and you (“you” or “your”) and relate to your use of our website, goods (as applicable) or services (as applicable) (collectively, “Services”).
            </p>
            <p>
              By using our website and availing the Services, you agree that you have read and accepted these Terms (including the Privacy Policy). We reserve the right to modify these Terms at any time and without assigning any reason. It is your responsibility to periodically review these Terms to stay informed of updates.
            </p>
          </div>
        </motion.div>

        {/* Section Heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#F5B301]/20 text-[#111111] flex items-center justify-center font-bold">
            <Scale size={18} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">Terms of Use</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          The use of this website or availing of our Services is subject to the following terms of use:
        </p>

        {/* Clauses List */}
        <div className="space-y-4">
          {termsList.map((term, index) => (
            <motion.div
              key={term.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * index }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200/80 hover:border-[#0A2540]/30 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <span className="w-7 h-7 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {term.id}
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">{term.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{term.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Footer Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 bg-gradient-to-br from-[#0A2540] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-8 shadow-md"
        >
          <h3 className="text-lg font-bold mb-2 font-poppins">Need Clarification on Our Terms?</h3>
          <p className="text-sm text-gray-200 mb-6 leading-relaxed">
            All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#F5B301] text-gray-950 font-bold px-6 py-3 rounded-xl text-xs hover:bg-[#E5A100] transition-colors"
            >
              <Mail size={16} /> Contact Us
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

export default TermsAndConditions;
