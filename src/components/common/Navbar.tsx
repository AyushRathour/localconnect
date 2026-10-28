import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  X,
  User as UserIcon,
  Bell,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, providerProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-[#16324F] flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-[#16324F] text-white flex items-center justify-center font-black text-lg">
            L
          </span>
          <span>LocalConnect</span>
        </Link>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#64748B]">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 hover:text-[#16324F] ${
                isActive ? 'text-[#16324F] font-semibold' : ''
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 hover:text-[#16324F] ${
                isActive ? 'text-[#16324F] font-semibold' : ''
              }`
            }
          >
            Find Services
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 hover:text-[#16324F] ${
                isActive ? 'text-[#16324F] font-semibold' : ''
              }`
            }
          >
            How It Works
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 hover:text-[#16324F] ${
                isActive ? 'text-[#16324F] font-semibold' : ''
              }`
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Zone 3: 1 Primary Action / User Profile */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-7 h-7 rounded-full bg-[#16324F] text-white text-xs font-semibold flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0F9D8A] bg-teal-50 px-1.5 py-0.5 rounded">
                  {user.role}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-[#172B4D] truncate">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#172B4D] hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      <span>Dashboard</span>
                    </Link>

                    {user.role === 'customer' && (
                      <Link
                        to="/customer/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#172B4D] hover:bg-slate-50 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>My Bookings</span>
                      </Link>
                    )}

                    {user.role === 'provider' && (
                      <Link
                        to="/provider/verification"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#172B4D] hover:bg-slate-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-slate-500" />
                        <span>Verification Status</span>
                      </Link>
                    )}

                    <Link
                      to={user.role === 'admin' ? '/admin/dashboard' : `/${user.role}/notifications`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#172B4D] hover:bg-slate-50 transition-colors"
                    >
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span>Notifications</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-[#172B4D] hover:text-[#16324F] transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-[#16324F] rounded-lg hover:bg-[#102438] transition-colors whitespace-nowrap shrink-0 shadow-xs"
              >
                Join LocalConnect
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              to={getDashboardPath()}
              className="p-2 text-slate-600 hover:text-slate-900"
              aria-label="Dashboard"
            >
              <UserIcon className="w-5 h-5" />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Home
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Find Services
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            How It Works
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Contact
          </Link>

          <div className="border-t border-slate-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2 px-4 text-sm font-medium text-white bg-[#16324F] rounded-lg"
                >
                  Go to {user.role.toUpperCase()} Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center py-2 text-sm font-medium text-rose-600"
                >
                  Sign Out ({user.name})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm font-medium bg-[#16324F] text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
