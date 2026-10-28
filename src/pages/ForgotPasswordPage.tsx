import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.forgotPassword(email.trim());
      setSubmitted(true);
      if (res.demoToken) setDemoToken(res.demoToken);
    } catch (err: any) {
      setError(err.message || 'Failed to submit recovery request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-14 px-4 sm:px-0">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-[#16324F]">Reset Your Password</h1>
          <p className="text-xs text-slate-500">
            Enter your account email to receive a secure password recovery token.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 bg-emerald-100 text-[#15803D] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a password reset link has been dispatched.
            </p>
            {demoToken && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                <span className="font-semibold text-slate-700 block">Academic Demo Shortcut:</span>
                <Link
                  to={`/reset-password/${demoToken}?email=${encodeURIComponent(email)}`}
                  className="inline-block py-1.5 px-3 bg-[#16324F] text-white rounded text-xs font-semibold"
                >
                  Proceed with Demo Reset Token
                </Link>
              </div>
            )}
            <div className="pt-2">
              <Link to="/login" className="text-xs font-semibold text-[#16324F] hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {submitting ? 'Dispatching...' : 'Send Recovery Instructions'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
