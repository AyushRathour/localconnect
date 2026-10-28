import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookingStatusBadge } from '../../components/common/BookingStatusBadge';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Bell,
  MapPin,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.getCustomerDashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load customer stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#16324F] text-white p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#F4B942] uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-bold mt-1">Hello, {user?.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track your home service appointments, reviews, and saved addresses.
          </p>
        </div>

        <Link
          to="/services"
          className="px-4 py-2.5 bg-[#0F9D8A] hover:bg-[#0C7E6F] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shrink-0 shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Bookings
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tabular-nums mt-1 block">
            {stats?.totalBookings ?? 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Pending
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums mt-1 block">
            {stats?.pendingCount ?? 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
            Active / On-Site
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0F9D8A] tabular-nums mt-1 block">
            {stats?.activeCount ?? 0}
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Completed
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#15803D] tabular-nums mt-1 block">
            {stats?.completedCount ?? 0}
          </span>
        </div>
      </div>

      {/* Recent Bookings & Notifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Bookings (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#16324F]">Recent Service Bookings</h2>
              <p className="text-xs text-slate-500">Your latest requested visits and appointments</p>
            </div>
            <Link
              to="/customer/bookings"
              className="text-xs font-bold text-[#0F9D8A] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading bookings...</div>
          ) : stats?.recentBookings?.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">You haven't requested any services yet.</p>
              <Link
                to="/services"
                className="inline-block text-xs font-bold text-[#16324F] hover:underline"
              >
                Browse available services
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats?.recentBookings?.map((b: any) => (
                <div key={b._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{b.serviceTitle}</span>
                      <BookingStatusBadge status={b.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500">
                      {b.businessName} · {b.requestedDate} at {b.startTime}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Ref: {b.bookingReference}
                    </span>
                  </div>

                  <Link
                    to={`/customer/bookings/${b._id}`}
                    className="px-3 py-1.5 text-xs font-semibold text-[#16324F] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Column (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#16324F] flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <span>Notifications</span>
            </h3>
            <Link
              to="/customer/notifications"
              className="text-xs font-bold text-[#0F9D8A] hover:underline"
            >
              See all
            </Link>
          </div>

          {stats?.recentNotifications?.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center italic">No new notifications.</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentNotifications?.map((n: any) => (
                <div key={n._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-[#172B4D]">{n.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block tabular-nums">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
