import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  Star,
  Bell,
  User,
  ShieldCheck,
  Wrench,
  Clock,
  Briefcase,
  Users,
  Layers,
  FileText,
  Activity,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, providerProfile, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const customerNav = [
    { to: '/customer/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/customer/bookings', label: 'My Bookings', icon: Calendar },
    { to: '/customer/addresses', label: 'Saved Addresses', icon: MapPin },
    { to: '/customer/reviews', label: 'My Reviews', icon: Star },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
    { to: '/customer/profile', label: 'Account Profile', icon: User },
  ];

  const providerNav = [
    { to: '/provider/dashboard', label: 'Overview & Stats', icon: LayoutDashboard },
    { to: '/provider/bookings', label: 'Booking Requests', icon: Calendar },
    { to: '/provider/services', label: 'Service Listings', icon: Wrench },
    { to: '/provider/verification', label: 'Verification Center', icon: ShieldCheck },
    { to: '/provider/availability', label: 'Working Schedule', icon: Clock },
    { to: '/provider/reviews', label: 'Client Feedback', icon: Star },
    { to: '/provider/profile', label: 'Business Profile', icon: Briefcase },
    { to: '/provider/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminNav = [
    { to: '/admin/dashboard', label: 'Platform Metrics', icon: LayoutDashboard },
    { to: '/admin/verifications', label: 'Verification Queue', icon: ShieldCheck },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/services', label: 'Service Catalog', icon: Wrench },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/bookings', label: 'Platform Bookings', icon: Calendar },
    { to: '/admin/reviews', label: 'Review Moderation', icon: Star },
    { to: '/admin/audit-logs', label: 'System Audit Logs', icon: Activity },
  ];

  const navLinks =
    user?.role === 'admin' ? adminNav : user?.role === 'provider' ? providerNav : customerNav;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="text-base font-bold text-[#16324F] flex items-center gap-1.5">
            <span className="w-6 h-6 rounded bg-[#16324F] text-white flex items-center justify-center font-bold text-xs">
              L
            </span>
            <span>LocalConnect</span>
          </Link>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#16324F] bg-slate-100 px-2 py-0.5 rounded">
          {user?.role}
        </span>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8F0] flex flex-col transform transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-[#16324F] flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#16324F] text-white flex items-center justify-center font-black text-sm">
              L
            </span>
            <span>LocalConnect</span>
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F9D8A] bg-teal-50 px-2 py-0.5 rounded">
            {user?.role}
          </span>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="text-xs text-slate-500 font-medium">Logged in user</p>
          <p className="text-sm font-semibold text-[#172B4D] truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          {user?.role === 'provider' && providerProfile && (
            <div className="mt-2 text-xs flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-semibold capitalize ${
                  providerProfile.verificationStatus === 'approved'
                    ? 'text-emerald-700'
                    : providerProfile.verificationStatus === 'pending'
                    ? 'text-amber-700'
                    : 'text-slate-600'
                }`}
              >
                {providerProfile.verificationStatus.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to.endsWith('/dashboard')}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#16324F] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
