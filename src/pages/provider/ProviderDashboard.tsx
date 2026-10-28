import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { BookingStatusBadge } from '../../components/common/BookingStatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import {
  ShieldCheck,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  XCircle,
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user, providerProfile, refreshUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getProviderDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickAccept = async (id: string) => {
    try {
      await api.acceptBooking(id);
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to accept booking.');
    }
  };

  const handleQuickReject = async (id: string) => {
    const reason = prompt('Please provide a reason for declining this request:');
    if (reason === null) return;
    try {
      await api.rejectBooking(id, reason || 'Schedule conflict');
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking.');
    }
  };

  const verificationStatus = stats?.verificationStatus || providerProfile?.verificationStatus || 'not_submitted';

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#16324F] text-white p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wider bg-teal-900/50 px-2.5 py-0.5 rounded">
              Provider Portal
            </span>
            <VerificationBadge status={verificationStatus} size="sm" />
          </div>
          <h1 className="text-2xl font-bold mt-2">
            {stats?.profile?.businessName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage your service listings, accept customer appointments, and review earnings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/provider/services"
            className="px-4 py-2.5 bg-[#0F9D8A] hover:bg-[#0C7E6F] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </Link>
          <Link
            to="/provider/verification"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#F4B942]" />
            <span>Verification</span>
          </Link>
        </div>
      </div>

      {/* Verification Notice Banner if not approved */}
      {verificationStatus !== 'approved' && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            verificationStatus === 'pending'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : verificationStatus === 'resubmission_required'
              ? 'bg-orange-50 border-orange-200 text-orange-800'
              : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-bold">
              {verificationStatus === 'pending'
                ? 'Your verification documents are currently under administrative review.'
                : verificationStatus === 'resubmission_required'
                ? 'Administrator requested document resubmission.'
                : 'Identity verification is required before accepting live customer bookings.'}
            </p>
            <p>
              {verificationStatus === 'pending'
                ? 'Our compliance team checks government IDs and licenses within 24 hours. You can prepare service listings in the meantime.'
                : 'Please submit your proof of identity and trade licenses in the Verification Center.'}
            </p>
            <Link
              to="/provider/verification"
              className="inline-block font-bold text-xs underline pt-1"
            >
              Open Verification Center →
            </Link>
          </div>
        </div>
      )}

      {/* Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Booking Requests
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tabular-nums mt-1 block">
            {stats?.totalRequests ?? 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Pending Actions
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums mt-1 block">
            {stats?.pendingCount ?? 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
            Upcoming Jobs
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0F9D8A] tabular-nums mt-1 block">
            {stats?.upcomingCount ?? 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Revenue Realized
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#15803D] tabular-nums mt-1 block">
            ₹{stats?.totalRevenue ?? 0}
          </span>
        </div>
      </div>

      {/* Incoming Requests & Schedule Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#16324F]">Recent Service Requests</h2>
            <p className="text-xs text-slate-500">
              Accept or decline pending customer bookings according to your capacity.
            </p>
          </div>
          <Link
            to="/provider/bookings"
            className="text-xs font-bold text-[#0F9D8A] hover:underline flex items-center gap-1"
          >
            <span>All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading requests...</div>
        ) : stats?.recentBookings?.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No booking requests received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats?.recentBookings?.map((b: any) => (
              <div
                key={b._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#172B4D]">{b.serviceTitle}</span>
                    <BookingStatusBadge status={b.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Client: <strong>{b.customerName}</strong> ({b.customerPhone || 'Verified Number'})
                  </p>
                  <p className="text-xs text-slate-600">
                    Schedule: {b.requestedDate} at {b.startTime} ({b.addressSnapshot?.area})
                  </p>
                  {b.customerNotes && (
                    <p className="text-xs text-slate-400 italic">"{b.customerNotes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-[#16324F] tabular-nums mr-2">
                    ₹{b.totalAmount}
                  </span>

                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleQuickAccept(b._id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleQuickReject(b._id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  <Link
                    to={`/customer/bookings/${b._id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-[#16324F] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
