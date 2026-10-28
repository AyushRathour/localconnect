import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { BookingStatusBadge } from '../../components/common/BookingStatusBadge';
import { Modal } from '../../components/common/Modal';
import { RatingStars } from '../../components/common/RatingStars';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  AlertCircle,
  XCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const CustomerBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getMyBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancel = (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setCancelReason('');
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBookingId) return;
    try {
      setCancelSubmitting(true);
      setCancelError(null);
      const res = await api.cancelBooking(cancellingBookingId, cancelReason);
      if (res.success) {
        setCancelModalOpen(false);
        fetchBookings();
      }
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleOpenReview = (bkg: any) => {
    setReviewBooking(bkg);
    setRating(5);
    setComment('');
    setReviewError(null);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewBooking || !comment.trim()) {
      setReviewError('Please write a brief comment describing your experience.');
      return;
    }
    try {
      setReviewSubmitting(true);
      setReviewError(null);
      const res = await api.createReview({
        bookingId: reviewBooking._id,
        rating,
        comment: comment.trim(),
      });
      if (res.success) {
        setReviewModalOpen(false);
        fetchBookings();
      }
    } catch (err: any) {
      setReviewError(err.message || 'Failed to record review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') {
      return ['pending', 'accepted', 'confirmed', 'in_progress'].includes(b.status);
    }
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">My Service Bookings</h1>
          <p className="text-xs text-slate-500">
            View booking lifecycle status, service schedule, and submit verified reviews.
          </p>
        </div>

        <Link
          to="/services"
          className="px-4 py-2 bg-[#16324F] hover:bg-[#102438] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
        >
          Book Another Service
        </Link>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {[
          { id: 'all', label: 'All Bookings' },
          { id: 'active', label: 'Active & Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled / Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              statusFilter === tab.id
                ? 'bg-white text-[#16324F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#172B4D]">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings matching this filter.
          </p>
          <Link
            to="/services"
            className="inline-block py-2 px-4 text-xs font-bold text-white bg-[#16324F] rounded-lg mt-2"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((bkg) => {
            const canCancel = ['pending', 'accepted', 'confirmed'].includes(bkg.status);
            const isCompleted = bkg.status === 'completed';
            const hasReview = Boolean(bkg.review);

            return (
              <div
                key={bkg._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-600">
                      {bkg.bookingReference}
                    </span>
                    <BookingStatusBadge status={bkg.status} size="sm" />
                  </div>
                  <span className="text-xs text-slate-400 tabular-nums">
                    Booked on {new Date(bkg.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Left: Service & Provider details */}
                  <div className="md:col-span-8 space-y-2">
                    <h3 className="text-base font-bold text-[#172B4D]">
                      {bkg.service?.title || 'Home Service'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {bkg.requestedDate} at {bkg.startTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {bkg.addressSnapshot.area}, {bkg.addressSnapshot.city}
                        </span>
                      </div>
                    </div>

                    {bkg.provider && (
                      <p className="text-xs text-slate-500 pt-1">
                        <strong>Assigned Provider:</strong> {bkg.provider.businessName} (
                        {bkg.provider.contactName || 'Technician'})
                      </p>
                    )}

                    {bkg.customerNotes && (
                      <p className="text-xs text-slate-400 italic">
                        Note: "{bkg.customerNotes}"
                      </p>
                    )}
                  </div>

                  {/* Right: Price & Actions */}
                  <div className="md:col-span-4 flex flex-col sm:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 space-y-3">
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] text-slate-400 block">Total Amount</span>
                      <span className="text-xl font-bold text-[#16324F] tabular-nums">
                        ₹{bkg.totalAmount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/customer/bookings/${bkg._id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-[#16324F] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Timeline</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>

                      {canCancel && (
                        <button
                          onClick={() => handleOpenCancel(bkg._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      {isCompleted && !hasReview && (
                        <button
                          onClick={() => handleOpenReview(bkg)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F9D8A] hover:bg-[#0C7E6F] rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Rate & Review</span>
                        </button>
                      )}

                      {isCompleted && hasReview && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reviewed ({bkg.review.rating}★)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Service Booking"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you wish to cancel this booking? Please provide a reason to notify the service provider:
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Schedule conflict or resolved issue..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          />

          {cancelError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cancelError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
            >
              {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Rate & Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Your Completed Service"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Share authentic feedback regarding your experience with{' '}
            <strong>{reviewBooking?.provider?.businessName}</strong> for "{reviewBooking?.service?.title}".
          </p>

          {/* Star selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      rating >= s
                        ? 'fill-[#F4B942] text-[#F4B942]'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-slate-800 ml-2">{rating} of 5 Stars</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Your Feedback *
            </label>
            <textarea
              rows={4}
              placeholder="Describe punctuality, quality of work, and professionalism..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              required
            />
          </div>

          {reviewError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reviewError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={reviewSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-[#0F9D8A] hover:bg-[#0C7E6F] rounded-lg disabled:opacity-50"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
