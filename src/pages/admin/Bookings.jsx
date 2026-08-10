import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, X, Loader2, CheckCircle, Clock, AlertCircle, Phone, Mail, Calendar, ChevronDown, CreditCard, Banknote, Eye, Check, Download } from 'lucide-react';
import { subscribeToBookings, updateBookingStatus, updateBookingPaymentStatus } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';

const getPaymentStatusText = (status) => {
  if (!status || status === 'pending') return 'Pending';
  if (status === 'half-paid') return 'Half Paid';
  if (status === 'paid') return 'Paid';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
};

const getStatusText = (status) => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  useEffect(() => {
    console.log('Admin Bookings: Setting up subscription...');
    const unsubscribe = subscribeToBookings((data) => {
      console.log('Admin Bookings: Bookings loaded:', data.length);
      setBookings(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone?.includes(searchTerm) ||
      booking.tripName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || booking.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleUpdatePaymentStatus = async (id, paymentStatus) => {
    try {
      await updateBookingPaymentStatus(id, paymentStatus);
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    confirmed: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200'
  };

  const paymentStatusColors = {
    pending: 'bg-blue-50 text-blue-700 border border-blue-200',
    'half-paid': 'bg-orange-50 text-orange-700 border border-orange-200',
    'paid': 'bg-green-50 text-green-700 border border-green-200'
  };

  const statusIcons = {
    pending: Clock,
    confirmed: CheckCircle,
    cancelled: AlertCircle
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-gray-400 text-xs mt-0.5">{bookings.length} bookings total</p>
        </div>
      </div>

      <div className="p-3 sm:p-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, phone or trip..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500" 
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Booking Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select 
                value={paymentFilter} 
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Payment Pending</option>
                <option value="half-paid">Half Paid</option>
                <option value="paid">Fully Paid</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto min-w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold uppercase text-gray-500 tracking-wider">
                  <th className="py-2.5 px-3 whitespace-nowrap">Customer</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Contact</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Trip</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Travelers</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Amount</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Payment</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map((booking) => {
                  const StatusIcon = statusIcons[booking.status] || Clock;
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setSelectedBookingDetail(booking)}>
                      <td className="py-2.5 px-3 align-middle">
                        <div className="text-gray-900 font-bold text-xs">{booking.name}</div>
                        {booking.email && <div className="text-gray-400 text-[11px]">{booking.email}</div>}
                      </td>
                      <td className="py-2.5 px-3 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                            <Phone size={13} className="text-gray-400" /> {booking.phone}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-middle">
                        <div className="text-gray-900 font-bold text-xs truncate max-w-[180px]">{booking.tripName || 'N/A'}</div>
                        <div className="text-gray-500 text-[11px] font-medium">{booking.selectedDate}</div>
                        {booking.city && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-700 font-bold mt-0.5">
                            <span className="px-1 py-0.2 bg-blue-50 border border-blue-200 rounded">{booking.city}</span>
                            <span className="text-gray-400 font-normal truncate max-w-[110px]">{booking.pickupLocation}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 align-middle text-gray-600 text-xs">{booking.travelers}</td>
                      <td className="py-2.5 px-3 align-middle text-gray-600 text-xs">{booking.bookingDate || 'N/A'}</td>
                      <td className="py-2.5 px-3 align-middle">
                        <div className="text-gray-900 font-bold text-xs">₹{booking.amount?.toLocaleString() || 0}</div>
                        {booking.amountToPay && <div className="text-gray-400 text-[11px]">Pay: ₹{booking.amountToPay.toLocaleString()}</div>}
                      </td>
                      <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-nowrap ${paymentStatusColors[booking.paymentStatus] || paymentStatusColors.pending}`}>
                          <CreditCard size={12} className="flex-shrink-0" />
                          {getPaymentStatusText(booking.paymentStatus)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-nowrap ${statusColors[booking.status] || statusColors.pending}`}>
                          <StatusIcon size={12} className="flex-shrink-0" />
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <select 
                            value={booking.status || 'pending'} 
                            onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 text-xs focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setExpandedBooking(expandedBooking === booking.id ? null : booking.id); }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Expand Payment Details"
                          >
                            <ChevronDown size={15} className={`transition-transform ${expandedBooking === booking.id ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* EXPANDED PAYMENT DETAILS */}
            {expandedBooking && (
              <div className="border-t border-gray-200 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                {bookings
                  .filter(b => b.id === expandedBooking)
                  .map(booking => (
                    <div key={booking.id} className="max-w-4xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard size={20} className="text-blue-600" />
                        Payment Details & Management for {booking.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Payment Summary */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider">Payment Summary</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Total Amount:</span>
                              <span className="font-bold text-gray-900">₹{booking.amount?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Payment Type:</span>
                              <span className="font-bold text-gray-900">{booking.paymentType === 'half' ? '50% Advance' : 'Full'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded border border-blue-200">
                              <span className="text-gray-600 font-semibold">Amount Due:</span>
                              <span className="font-bold text-blue-700">₹{booking.amountToPay?.toLocaleString() || booking.amount?.toLocaleString() || 0}</span>
                            </div>
                            {booking.paymentType === 'half' && (
                              <div className="flex justify-between items-center text-sm text-orange-600">
                                <span className="font-semibold">Remaining:</span>
                                <span className="font-bold">₹{((booking.amount || 0) / 2).toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bank Details */}
                        {booking.bankDetails && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider flex items-center gap-2">
                              <Banknote size={14} className="text-green-600" />
                              Bank Account Details
                            </p>
                            <div className="space-y-2 text-sm">
                              <div>
                                <p className="text-xs text-gray-400">Account Name</p>
                                <p className="font-bold text-gray-900">{booking.bankDetails.accountName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Account Number</p>
                                <p className="font-bold text-gray-900 font-mono text-xs">{booking.bankDetails.accountNumber}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-gray-400">IFSC</p>
                                  <p className="font-bold text-gray-900 text-xs font-mono">{booking.bankDetails.ifsc}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Branch</p>
                                  <p className="font-bold text-gray-900 text-xs">{booking.bankDetails.branch}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Payment Status & Screenshots */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider">Payment Status</p>
                          <div className="space-y-3">
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${paymentStatusColors[booking.paymentStatus] || paymentStatusColors.pending}`}>
                              {booking.paymentStatus?.replace('-', ' ').toUpperCase() || 'PENDING'}
                            </div>

                            {/* Screenshot Section */}
                            {booking.paymentScreenshot && (
                              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-3">
                                <p className="text-xs font-bold text-green-900 mb-2 flex items-center gap-1">
                                  <Check size={14} /> Screenshot Uploaded
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setSelectedImage(booking.paymentScreenshot)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white text-xs font-bold py-2 rounded hover:bg-green-700 transition"
                                  >
                                    <Eye size={12} /> View
                                  </button>
                                  <a
                                    href={booking.paymentScreenshot}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs font-bold py-2 rounded hover:bg-blue-700 transition"
                                  >
                                    <Download size={12} />
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Status Update Buttons */}
                      <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
                        <p className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider">Update Payment Status</p>
                        <div className="flex gap-2 flex-wrap">
                          {['pending', 'half-paid', 'paid'].map(status => (
                            <button
                              key={status}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                booking.paymentStatus === status
                                  ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                              onClick={() => handleUpdatePaymentStatus(booking.id, status)}
                            >
                              {status.replace('-', ' ').toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* BOOKING DETAIL MODAL - CENTERED WITH OVERLAY */}
            {selectedBookingDetail && createPortal(
              <AnimatePresence>
                <div
                  className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
                  onClick={() => setSelectedBookingDetail(null)}
                >
                  <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                      <div>
                        <h2 className="text-base font-bold text-gray-900">{selectedBookingDetail.name}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{selectedBookingDetail.tripName}</p>
                      </div>
                      <button
                        onClick={() => setSelectedBookingDetail(null)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      >
                        <X size={18} className="text-gray-500" />
                      </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                      {/* Customer + Trip row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-wider">Customer</p>
                          <p className="text-sm font-bold text-gray-900">{selectedBookingDetail.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{selectedBookingDetail.phone}</p>
                          {selectedBookingDetail.email && <p className="text-xs text-gray-500 truncate">{selectedBookingDetail.email}</p>}
                          <p className="text-xs text-gray-400 mt-1">Booked: {selectedBookingDetail.bookingDate || 'N/A'}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <p className="text-[10px] font-bold uppercase text-blue-500 mb-2 tracking-wider">Trip &amp; Departure</p>
                          <p className="text-sm font-bold text-gray-900">{selectedBookingDetail.tripName}</p>
                          <p className="text-xs text-gray-700 font-semibold mt-0.5">Date: {selectedBookingDetail.selectedDate}</p>
                          {selectedBookingDetail.city && (
                            <p className="text-xs text-blue-700 font-bold mt-0.5">City: {selectedBookingDetail.city}</p>
                          )}
                          {selectedBookingDetail.pickupLocation && (
                            <p className="text-xs text-gray-600">Pickup: {selectedBookingDetail.pickupLocation}</p>
                          )}
                          <p className="text-xs text-gray-600">Travelers: {selectedBookingDetail.travelers} Persons</p>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                        <p className="text-[10px] font-bold uppercase text-green-500 mb-2 tracking-wider">Payment Summary</p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-bold text-gray-900">₹{selectedBookingDetail.amount?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Payment Type</span>
                            <span className="font-semibold text-gray-800">{selectedBookingDetail.paymentType === 'half' ? '50% Advance' : 'Full Payment'}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t border-green-200 pt-1.5">
                            <span className="font-semibold text-gray-700">Amount to Pay</span>
                            <span className="font-bold text-green-700">₹{selectedBookingDetail.amountToPay?.toLocaleString() || selectedBookingDetail.amount?.toLocaleString() || 0}</span>
                          </div>
                          {selectedBookingDetail.paymentType === 'half' && (
                            <div className="flex justify-between text-xs text-orange-600">
                              <span>Remaining Balance</span>
                              <span className="font-bold">₹{((selectedBookingDetail.amount || 0) / 2).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Row */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Booking Status</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${statusColors[selectedBookingDetail.status] || statusColors.pending}`}>
                            {getStatusText(selectedBookingDetail.status)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 tracking-wider">Payment Status</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${paymentStatusColors[selectedBookingDetail.paymentStatus] || paymentStatusColors.pending}`}>
                            {getPaymentStatusText(selectedBookingDetail.paymentStatus)}
                          </span>
                        </div>
                      </div>

                      {/* Update Payment Status Buttons */}
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-wider">Update Payment Status</p>
                        <div className="flex gap-2">
                          {[
                            { key: 'pending', label: 'Pending', color: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' },
                            { key: 'half-paid', label: 'Half Paid', color: 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100' },
                            { key: 'paid', label: '✓ Mark Paid', color: 'bg-green-500 text-white hover:bg-green-600' },
                          ].map(({ key, label, color }) => (
                            <button
                              key={key}
                              onClick={() => {
                                handleUpdatePaymentStatus(selectedBookingDetail.id, key);
                                setSelectedBookingDetail(prev => ({ ...prev, paymentStatus: key }));
                              }}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${color} ${
                                selectedBookingDetail.paymentStatus === key ? 'ring-2 ring-offset-1 ring-current' : ''
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bank Details */}
                      {selectedBookingDetail.bankDetails && (
                        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                          <p className="text-[10px] font-bold uppercase text-yellow-600 mb-2 tracking-wider flex items-center gap-1">
                            <Banknote size={12} /> Bank Details
                          </p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                            <div>
                              <p className="text-gray-400 text-[10px]">Account Name</p>
                              <p className="font-bold text-gray-900">{selectedBookingDetail.bankDetails.accountName}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-[10px]">Account Number</p>
                              <p className="font-bold text-gray-900 font-mono">{selectedBookingDetail.bankDetails.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-[10px]">IFSC</p>
                              <p className="font-bold text-gray-900 font-mono">{selectedBookingDetail.bankDetails.ifsc}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-[10px]">Branch</p>
                              <p className="font-bold text-gray-900">{selectedBookingDetail.bankDetails.branch}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Screenshot */}
                      {selectedBookingDetail.paymentScreenshot ? (
                        <div className="bg-green-50 rounded-xl p-3 border-2 border-green-200">
                          <p className="text-[10px] font-bold uppercase text-green-600 mb-2 tracking-wider flex items-center gap-1">
                            <Check size={12} /> Payment Proof
                          </p>
                          <img
                            src={selectedBookingDetail.paymentScreenshot}
                            alt="Payment Screenshot"
                            className="w-full max-h-48 object-contain rounded-lg border border-green-200 cursor-pointer hover:opacity-90 transition"
                            onClick={() => {
                              setSelectedImage(selectedBookingDetail.paymentScreenshot);
                              setSelectedBookingDetail(null);
                            }}
                          />
                          <p className="text-[10px] text-green-600 text-center mt-1">Click to view full size</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200 text-center">
                          <p className="text-xs text-gray-400">No payment screenshot uploaded</p>
                        </div>
                      )}

                      {/* Emergency Contact */}
                      {selectedBookingDetail.emergencyContact && (selectedBookingDetail.emergencyContact.name || selectedBookingDetail.emergencyContact.phone) && (
                        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                          <p className="text-[10px] font-bold uppercase text-red-500 mb-2 tracking-wider">Emergency Contact</p>
                          <p className="text-xs font-bold text-gray-900">{selectedBookingDetail.emergencyContact.name}</p>
                          <p className="text-xs text-gray-600">{selectedBookingDetail.emergencyContact.phone}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-100 shrink-0 flex gap-2">
                      <button
                        onClick={() => setSelectedBookingDetail(null)}
                        className="flex-1 py-2 border border-gray-300 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition"
                      >
                        Close
                      </button>
                      {selectedBookingDetail.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => {
                            handleUpdatePaymentStatus(selectedBookingDetail.id, 'paid');
                            setSelectedBookingDetail(prev => ({ ...prev, paymentStatus: 'paid' }));
                          }}
                          className="flex-1 py-2 bg-green-500 text-white font-bold text-sm rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-1.5"
                        >
                          <Check size={15} /> Mark as Paid
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>
              </AnimatePresence>,
              document.body
            )}

            {/* IMAGE MODAL */}
            {selectedImage && createPortal(
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4" onClick={() => setSelectedImage(null)}>
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Payment Screenshot</h3>
                    <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <img src={selectedImage} alt="Payment" className="w-full h-auto max-h-96 object-contain" />
                </motion.div>
              </div>,
              document.body
            )}
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
