import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login({ email: email.trim(), password });
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Redirection based on role
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: 'customer' | 'provider' | 'pending_provider' | 'admin') => {
    try {
      setSubmitting(true);
      setError(null);
      await quickLoginAs(role);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'provider' || role === 'pending_provider') navigate('/provider/dashboard');
      else navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4 sm:px-0 space-y-6">
      {/* Quick Demo Evaluation Panel */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F4B942] uppercase tracking-wider">
            1-Click Demo Evaluation Login
          </span>
          <span className="text-[10px] text-slate-400">Pre-seeded accounts</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('customer')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left transition-colors"
          >
            <p className="font-bold text-white">Customer</p>
            <p className="text-[10px] text-slate-400">Priya Sharma</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('provider')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left transition-colors"
          >
            <p className="font-bold text-emerald-400">Approved Provider</p>
            <p className="text-[10px] text-slate-400">Arun (Electrician)</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('pending_provider')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left transition-colors"
          >
            <p className="font-bold text-amber-400">Pending Provider</p>
            <p className="text-[10px] text-slate-400">Suresh (Appliance)</p>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left transition-colors"
          >
            <p className="font-bold text-[#F4B942]">Administrator</p>
            <p className="text-[10px] text-slate-400">Platform Admin</p>
          </button>
        </div>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-[#16324F]">Sign In to LocalConnect</h1>
          <p className="text-xs text-slate-500">
            Access your bookings, verification dashboard, or administration.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16324F]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#0F9D8A] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#16324F]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-[#16324F] hover:underline">
              Create Customer Account
            </Link>
          </p>
          <p>
            Are you a skilled technician or tradesperson?{' '}
            <Link to="/provider/register" className="font-semibold text-[#0F9D8A] hover:underline">
              Join as a Provider
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
