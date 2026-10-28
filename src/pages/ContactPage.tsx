import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitContact(formData);
      if (res.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit contact message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#16324F]">Contact Support</h1>
        <p className="text-sm text-[#64748B]">
          Have a question about provider verification, a booking issue, or technical support? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info Sidebar (5 cols) */}
        <div className="md:col-span-5 bg-[#16324F] text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
          <div>
            <h3 className="text-lg font-bold">LocalConnect Help Desk</h3>
            <p className="text-xs text-slate-300 mt-1">
              Serving customers, trade professionals, and educational evaluators.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-200">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#0F9D8A] shrink-0" />
              <span>support@localconnect.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#0F9D8A] shrink-0" />
              <span>+91 80 4920 1800 (Mon - Sat, 9am - 7pm)</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#0F9D8A] shrink-0 mt-0.5" />
              <span>Indiranagar Tech Hub, Bengaluru, Karnataka 560038</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 text-xs text-slate-400 space-y-1">
            <p><strong>Response Time:</strong> Typically under 2 hours.</p>
            <p><strong>Urgent Booking Triage:</strong> Handled by active dispatch team.</p>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-[#15803D] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#16324F]">Message Sent Successfully</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for reaching out. We have logged your inquiry and a support representative will respond shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 px-4 py-2 text-xs font-semibold text-[#16324F] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    placeholder="e.g. Priya Sharma"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    placeholder="e.g. priya@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  placeholder="e.g. Question about provider verification"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Your Message *
                </label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  placeholder="Explain your inquiry in detail..."
                  required
                />
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
                className="w-full py-2.5 px-4 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
