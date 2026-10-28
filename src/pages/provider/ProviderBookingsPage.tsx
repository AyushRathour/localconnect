import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BookingStatusBadge } from '../../components/common/BookingStatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  Check,
} from 'lucide-react';

export const ProviderBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getProviderBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await api.acceptBooking(id);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to accept booking.');
    }
  };

  const handleOpenReject = (id: string) => {
    setRejectId(id);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    try {
      setRejectSubmitting(true);
      await api.rejectBooking(rejectId, rejectReason || 'Provider unavailable');
      setRejectModalOpen(false);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking.');
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string, note?: string) => {
    try {
      await api.updateBookingStatus(id, newStatus, note);
      loadBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'confirmed') return ['accepted', 'confirmed'].includes(b.status);
    if (filter === 'in_progress') return b.status === 'in_progress';
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">Booking Requests & Schedule</h1>
          <p className="text-xs text-slate-500">
            Accept incoming requests, manage active on-site service jobs, and log completion.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
        {[
          { id: 'all', label: 'All Jobs' },
          { id: 'pending', label: 'Pending Requests' },
          { id: 'confirmed', label: 'Confirmed / Scheduled' },
          { id: 'in_progress', label: 'On-Site In-Progress' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              filter === tab.id
                ? 'bg-white text-[#16324F] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No bookings match this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((bkg) => (
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
                  Received {new Date(bkg.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-2">
                  <h3 className="text-base font-bold text-[#172B4D]">
                    {bkg.service?.title || 'Service Job'}
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
                        {bkg.addressSnapshot?.addressLine}, {bkg.addressSnapshot?.area}
                      </span>
                    </div>
                  </div>

                  {bkg.customer && (
                    <div className="pt-1 text-xs text-slate-600 flex items-center gap-4 flex-wrap">
                      <span>
                        Client: <strong>{bkg.customer.name}</strong>
                      </span>
                      {bkg.customer.phone && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{bkg.customer.phone}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {bkg.customerNotes && (
                    <p className="text-xs text-slate-400 italic">"{bkg.customerNotes}"</p>
                  )}
                </div>

                {/* Right Action buttons based on controlled state machine */}
                <div className="md:col-span-4 flex flex-col sm:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 space-y-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block">Service Amount</span>
                    <span className="text-xl font-bold text-[#16324F] tabular-nums">
                      ₹{bkg.totalAmount}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* If pending: Accept or Reject */}
                    {bkg.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(bkg._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleOpenReject(bkg._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {/* If accepted: Confirm or Start Service */}
                    {bkg.status === 'accepted' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(bkg._id, 'confirmed', 'Provider confirmed slot.')
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0F9D8A] hover:bg-[#0C7E6F] rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Slot</span>
                      </button>
                    )}

                    {/* If confirmed: Start On-Site Service */}
                    {(bkg.status === 'confirmed' || bkg.status === 'accepted') && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            bkg._id,
                            'in_progress',
                            'Technician arrived on premise and commenced work.'
                          )
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Work (On-Site)</span>
                      </button>
                    )}

                    {/* If in_progress: Complete Service */}
                    {bkg.status === 'in_progress' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            bkg._id,
                            'completed',
                            'Service completed to customer satisfaction.'
                          )
                        }
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Completed</span>
                      </button>
                    )}

                    {bkg.status === 'completed' && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                        Job Completed ✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decline Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Decline Booking Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter a reason for declining this appointment. This will be sent as a notification to the customer:
          </p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Current slot is booked or out of immediate transit reach..."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={rejectSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
            >
              {rejectSubmitting ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
