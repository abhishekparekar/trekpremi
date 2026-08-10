import { motion } from 'framer-motion';
import { RefreshCw, ShieldAlert, Clock, AlertTriangle, CheckCircle2, Mail, Phone, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const CancellationRefundPolicy = () => {
  const policies = [
    {
      id: 1,
      title: "Cancellation Requests & Timelines",
      icon: Clock,
      content: "Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them."
    },
    {
      id: 2,
      title: "Perishable & Special Items",
      icon: AlertTriangle,
      content: "SWAPNALI PADMAKAR ANNADATE does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good."
    },
    {
      id: 3,
      title: "Damaged or Defective Items Reporting",
      icon: ShieldAlert,
      content: "In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within 7 Days of receipt of the products. In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 7 Days of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision."
    },
    {
      id: 4,
      title: "Warranty Claims & Refund Processing Time",
      icon: RefreshCw,
      content: "In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them. In case of any Refunds approved by SWAPNALI PADMAKAR ANNADATE, it’ll take 6-8 Days for the refund to be processed to the end customer."
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
            <RefreshCw size={16} /> Cancellation &amp; Refund
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-black font-poppins tracking-tight mb-3"
          >
            Cancellation &amp; Refund Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm text-gray-300 font-medium"
          >
            Last updated on 30-07-2026 15:55:26
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
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Customer Assistance Promise</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Entity: <span className="font-semibold text-gray-800">SWAPNALI PADMAKAR ANNADATE</span></p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-800">SWAPNALI PADMAKAR ANNADATE</span> believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy, the terms detailed below apply.
          </p>
        </motion.div>

        {/* Policy List */}
        <div className="space-y-5">
          {policies.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * index }}
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

        {/* Key Highlights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-[#F5B301] text-gray-950 flex items-center justify-center flex-shrink-0 font-bold">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Refund Timeline Notice</h4>
            <p className="text-xs text-gray-600 mt-0.5">Approved refunds are processed to the original payment method within <strong>6-8 Days</strong>.</p>
          </div>
        </motion.div>

        {/* Contact Footer Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-gradient-to-br from-[#0A2540] to-[#1E3A8A] text-white rounded-2xl p-6 sm:p-8 shadow-md"
        >
          <h3 className="text-lg font-bold mb-2 font-poppins">Questions Regarding Cancellations or Refunds?</h3>
          <p className="text-sm text-gray-200 mb-6 leading-relaxed">
            Our customer service team is here to assist you with any questions or support requests.
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

export default CancellationRefundPolicy;
