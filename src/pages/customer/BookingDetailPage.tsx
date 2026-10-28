import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { BookingStatusBadge } from '../../components/common/BookingStatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
} from 'lucide-react';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getBooking(id);
        if (res.success && res.data) {
          setBooking(res.data);
        } else {
          setError('Booking not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-400">Loading booking timeline...</div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-[#172B4D]">Booking Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'Unable to retrieve this booking.'}</p>
        <Link
          to="/customer/bookings"
          className="inline-block px-4 py-2 text-xs font-semibold text-white bg-[#16324F] rounded-lg"
        >
          Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500">
            {booking.bookingReference}
          </span>
          <BookingStatusBadge status={booking.status} size="sm" />
        </div>
      </div>

      {/* Main Booking Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wider">
              {booking.service?.category?.name || 'Local Service'}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#16324F] mt-1">
              {booking.service?.title || 'Service Appointment'}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Total Service Fee</span>
            <span className="text-2xl font-extrabold text-[#16324F] tabular-nums">
              ₹{booking.totalAmount}
            </span>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-400 block">
              Appointment Schedule
            </span>
            <div className="space-y-1 text-slate-700">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0F9D8A]" />
                <span className="font-semibold">{booking.requestedDate}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F9D8A]" />
                <span>
                  {booking.startTime} - {booking.endTime}
                </span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-400 block">
              Service Address
            </span>
            <div className="space-y-1 text-slate-700">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0F9D8A] shrink-0 mt-0.5" />
                <span>
                  {booking.addressSnapshot?.addressLine}, {booking.addressSnapshot?.area},{' '}
                  {booking.addressSnapshot?.city} - {booking.addressSnapshot?.postalCode}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Provider Details */}
        {booking.provider && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Professional
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-sm font-bold text-[#172B4D]">
                  {booking.provider.businessName}
                </p>
                <p className="text-slate-500">
                  Contact: {booking.provider.contactName || 'Lead Technician'}
                </p>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                {booking.provider.contactPhone && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{booking.provider.contactPhone}</span>
                  </span>
                )}
                {booking.provider.contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{booking.provider.contactEmail}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Lifecycle Timeline */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-[#16324F]">Status Lifecycle History</h3>
          <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {booking.statusHistory?.map((step: any, idx: number) => (
              <div key={idx} className="relative space-y-1 text-xs">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#16324F] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#16324F]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 uppercase tracking-wide">
                    {(step.status || '').replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {new Date(step.timestamp).toLocaleString()}
                  </span>
                </div>
                {step.note && <p className="text-slate-600">{step.note}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Client Review (if already reviewed) */}
        {booking.review && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Your Submitted Review</span>
              <RatingStars rating={booking.review.rating} showCount={false} size="sm" />
            </div>
            <p className="text-xs text-emerald-900 italic">"{booking.review.comment}"</p>
          </div>
        )}
      </div>
    </div>
  );
};
