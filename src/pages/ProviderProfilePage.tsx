import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { RatingStars } from '../components/common/RatingStars';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Briefcase,
  Star,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProvider() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.getProvider(id);
        if (res.success && res.data) {
          setProvider(res.data);
        } else {
          setError('Provider not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load provider profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[#16324F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-3 text-sm text-slate-500">Loading professional profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-white rounded-xl border border-slate-200 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#172B4D]">Provider Not Found</h2>
        <p className="text-sm text-slate-500 mt-1 mb-5">{error || 'This provider is not active.'}</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#16324F] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services</span>
        </Link>
      </div>
    );
  }

  const isApproved = provider.verificationStatus === 'approved';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/services" className="hover:text-slate-900 transition-colors">
          Services
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-medium truncate max-w-xs">{provider.businessName}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#16324F] text-white flex items-center justify-center font-bold text-2xl shrink-0">
              {provider.businessName.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F]">
                  {provider.businessName}
                </h1>
                <VerificationBadge status={provider.verificationStatus} size="md" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Primary Contact: {provider.user?.name || 'Authorized Service Professional'}
              </p>
              <div className="pt-1">
                <RatingStars
                  rating={provider.averageRating || 5.0}
                  reviewCount={provider.reviewCount || 0}
                  size="md"
                />
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 text-xs text-slate-500">
            <span className="font-semibold text-slate-800 text-sm">
              {provider.experienceYears} Years in Practice
            </span>
            <span>{provider.services?.length || 0} Active Services</span>
          </div>
        </div>

        {/* Bio & Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            About the Professional
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
            {provider.description}
          </p>
        </div>

        {/* Skills and Service Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Skills & Tools
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {provider.skills?.map((s: string) => (
                <span
                  key={s}
                  className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Service Neighborhoods
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {provider.serviceAreas?.map((a: string) => (
                <span
                  key={a}
                  className="text-xs bg-teal-50 text-[#0F9D8A] px-2.5 py-1 rounded-md font-medium flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{a}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services List by this Provider */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#16324F]">
            Services by {provider.businessName}
          </h2>
          <p className="text-xs text-slate-500">
            Select a service to view availability and book an appointment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provider.services?.map((srv: any) => (
            <div
              key={srv._id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#172B4D] leading-snug">{srv.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {srv.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{srv.estimatedDuration}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Rate</span>
                  <span className="text-base font-bold text-[#16324F] tabular-nums">
                    ₹{srv.price}
                  </span>
                </div>

                <Link
                  to={`/services/${srv._id}`}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#16324F] hover:bg-[#102438] rounded-lg transition-colors"
                >
                  View & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Reviews Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-[#16324F]">Client Feedback & Ratings</h3>
            <p className="text-xs text-slate-500">
              Authentic reviews submitted by customers following completed jobs.
            </p>
          </div>
          <RatingStars
            rating={provider.averageRating || 5.0}
            reviewCount={provider.reviewCount || 0}
            size="md"
          />
        </div>

        {provider.reviews && provider.reviews.length > 0 ? (
          <div className="space-y-4">
            {provider.reviews.map((r: any) => (
              <div
                key={r._id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {r.customerName?.charAt(0) || 'C'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{r.customerName}</span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                      Verified Completion
                    </span>
                  </div>
                  <RatingStars rating={r.rating} showCount={false} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  "{r.comment}"
                </p>
                <span className="text-[10px] text-slate-400 block tabular-nums">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No reviews yet for this provider.</p>
        )}
      </div>
    </div>
  );
};
