import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { RatingStars } from '../components/common/RatingStars';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  User,
  Star,
  Sparkles,
  Phone,
} from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking Form State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [customAddress, setCustomAddress] = useState({
    addressLine: '',
    area: '',
    city: 'Bengaluru',
    postalCode: '560038',
  });
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [requestedDate, setRequestedDate] = useState<string>(tomorrowStr);
  const [startTime, setStartTime] = useState<string>('10:00');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    async function loadService() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getService(id);
        if (res.success && res.data) {
          setService(res.data);
          if (res.data.serviceAreas && res.data.serviceAreas.length > 0) {
            setCustomAddress((prev) => ({ ...prev, area: res.data.serviceAreas[0] }));
          }
        } else {
          setError('Service not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load service details.');
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [id]);

  useEffect(() => {
    async function loadUserAddresses() {
      if (user && user.role === 'customer') {
        try {
          const res = await api.getAddresses();
          if (res.success && res.data && res.data.length > 0) {
            setAddresses(res.data);
            const defaultAddr = res.data.find((a: any) => a.isDefault) || res.data[0];
            setSelectedAddressId(defaultAddr._id);
          } else {
            setUseCustomAddress(true);
          }
        } catch {
          setUseCustomAddress(true);
        }
      } else {
        setUseCustomAddress(true);
      }
    }

    loadUserAddresses();
  }, [user]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (user.role !== 'customer') {
      setBookingError('Only accounts with the customer role can place service bookings. Please switch to a customer account.');
      return;
    }

    if (!requestedDate || !startTime) {
      setBookingError('Please select both a service date and time slot.');
      return;
    }

    if (useCustomAddress || addresses.length === 0) {
      if (!customAddress.addressLine.trim() || !customAddress.area.trim()) {
        setBookingError('Please enter street address and neighborhood area.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload: any = {
        serviceId: service._id,
        providerId: service.providerId,
        requestedDate,
        startTime,
        customerNotes,
      };

      if (!useCustomAddress && selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.customAddress = customAddress;
      }

      const res = await api.createBooking(payload);
      if (res.success && res.data) {
        setBookingSuccess(res.data);
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[#16324F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-xl border border-slate-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#172B4D]">Service Unavailable</h2>
        <p className="text-sm text-slate-500 mt-1 mb-5">{error || 'This service could not be located.'}</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#16324F] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Service Directory</span>
        </Link>
      </div>
    );
  }

  const isProviderApproved = service.provider?.verificationStatus === 'approved';

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/services" className="hover:text-slate-900 transition-colors">
          Services
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{service.title}</span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Service Details & Provider Credibility (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded">
                {service.category?.name || 'Home Service'}
              </span>
              {service.provider && (
                <VerificationBadge status={service.provider.verificationStatus} size="md" />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F] leading-snug">
              {service.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {service.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-[#0F9D8A] shrink-0" />
                <span>
                  <strong>Duration:</strong> {service.estimatedDuration}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-[#0F9D8A] shrink-0" />
                <span>
                  <strong>Pricing:</strong> {service.pricingType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 col-span-2 sm:col-span-1">
                <MapPin className="w-4 h-4 text-[#0F9D8A] shrink-0" />
                <span className="truncate">
                  <strong>Service Areas:</strong> {service.serviceAreas.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Provider Card */}
          {service.provider && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#16324F] text-white flex items-center justify-center font-bold text-xl shrink-0">
                    {service.provider.businessName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/providers/${service.provider._id}`}
                        className="text-lg font-bold text-[#172B4D] hover:text-[#16324F] transition-colors"
                      >
                        {service.provider.businessName}
                      </Link>
                      <VerificationBadge status={service.provider.verificationStatus} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {service.provider.experienceYears} years experience · Verified Independent Professional
                    </p>
                    <div className="mt-2">
                      <RatingStars
                        rating={service.provider.averageRating || 5.0}
                        reviewCount={service.provider.reviewCount || 0}
                        size="md"
                      />
                    </div>
                  </div>
                </div>

                <Link
                  to={`/providers/${service.provider._id}`}
                  className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-[#16324F] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  View Profile
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {service.provider.description}
              </p>

              {service.provider.skills && service.provider.skills.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Certified Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.provider.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Genuine Client Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#16324F]">Verified Client Reviews</h3>
                <p className="text-xs text-slate-500">
                  Reviews can only be submitted following verified completion of a booking.
                </p>
              </div>
              {service.provider && (
                <RatingStars
                  rating={service.provider.averageRating || 5.0}
                  reviewCount={service.provider.reviewCount || 0}
                  size="md"
                />
              )}
            </div>

            {service.reviews && service.reviews.length > 0 ? (
              <div className="space-y-4">
                {service.reviews.map((rev: any) => (
                  <div
                    key={rev._id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                          {rev.customerName?.charAt(0) || 'C'}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{rev.customerName}</span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                          Verified Booking
                        </span>
                      </div>
                      <RatingStars rating={rev.rating} showCount={false} size="sm" />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                    <span className="text-[10px] text-slate-400 block tabular-nums">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No public reviews for this provider yet. Book now to be among the first!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Booking Purchase Module (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-6">
            {/* Price Header */}
            <div className="pb-4 border-b border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Service Fee</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tabular-nums">
                  ₹{service.price}
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {service.pricingType.replace('_', ' ')}
              </span>
            </div>

            {!isProviderApproved && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Provider Verification In-Progress</span>
                </p>
                <p>
                  This provider has submitted documents and is awaiting final admin verification. Online bookings will open immediately upon approval.
                </p>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Date Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Requested Date</span>
                </label>
                <input
                  type="date"
                  min={tomorrowStr}
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  disabled={!isProviderApproved}
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16324F]"
                  required
                />
              </div>

              {/* Time Slot Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Service Time Slot</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={!isProviderApproved}
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16324F]"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (1 hr visit window)
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Address */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Service Address</span>
                </label>

                {addresses.length > 0 && !useCustomAddress ? (
                  <div className="space-y-2">
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    >
                      {addresses.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.label}: {a.addressLine}, {a.area}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setUseCustomAddress(true)}
                      className="text-[11px] text-[#0F9D8A] hover:underline"
                    >
                      + Enter a different address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Flat / House / Street Address"
                      value={customAddress.addressLine}
                      onChange={(e) =>
                        setCustomAddress({ ...customAddress, addressLine: e.target.value })
                      }
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Neighborhood / Area"
                        value={customAddress.area}
                        onChange={(e) =>
                          setCustomAddress({ ...customAddress, area: e.target.value })
                        }
                        className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={customAddress.postalCode}
                        onChange={(e) =>
                          setCustomAddress({ ...customAddress, postalCode: e.target.value })
                        }
                        className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                      />
                    </div>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseCustomAddress(false)}
                        className="text-[11px] text-slate-500 hover:underline"
                      >
                        Use saved address instead
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Specific Requirements (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master bedroom switchboard trips when AC is switched on..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              {/* Booking Error Banner */}
              {bookingError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={submitting || !isProviderApproved}
                className="w-full py-3 px-4 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Request Booking</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>✓ No immediate online payment required.</p>
              <p>✓ Provider will accept and lock your requested time slot.</p>
              <p>✓ Free cancellation permitted prior to technician arrival.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Success Confirmation Modal */}
      {bookingSuccess && (
        <Modal
          isOpen={true}
          onClose={() => navigate('/customer/bookings')}
          title="Booking Request Confirmed"
        >
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 bg-emerald-100 text-[#15803D] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-[#16324F]">
                Reference: {bookingSuccess.bookingReference}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your service request has been queued and dispatched to {service.provider?.businessName}.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 text-left border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{service.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-semibold text-slate-800">
                  {bookingSuccess.requestedDate} at {bookingSuccess.startTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service Location:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                  {bookingSuccess.addressSnapshot.area}, {bookingSuccess.addressSnapshot.city}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700">Estimated Amount:</span>
                <span className="font-bold text-[#16324F] tabular-nums">
                  ₹{bookingSuccess.totalAmount}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate('/customer/bookings')}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#16324F] rounded-lg hover:bg-[#102438] transition-colors"
              >
                View in My Bookings
              </button>
              <button
                onClick={() => navigate('/services')}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Browse More Services
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
