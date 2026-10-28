import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { RatingStars } from '../components/common/RatingStars';
import {
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  Star,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catsRes, srvsRes] = await Promise.all([
          api.getCategories(),
          api.getFeaturedServices(),
        ]);
        if (catsRes.success && catsRes.data) setCategories(catsRes.data);
        if (srvsRes.success && srvsRes.data) setFeaturedServices(srvsRes.data);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedArea.trim()) params.set('area', selectedArea.trim());
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. Academic Mini Project Demo Quick Switcher */}
      <section className="bg-slate-900 text-white py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center">
            <span className="text-slate-300 font-medium">
              Instant 1-Click Evaluation Accounts:
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => quickLoginAs('customer')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors whitespace-nowrap"
            >
              Customer (Priya)
            </button>
            <button
              onClick={() => quickLoginAs('provider')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 transition-colors whitespace-nowrap"
            >
              Approved Provider (Arun)
            </button>
            <button
              onClick={() => quickLoginAs('pending_provider')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 transition-colors whitespace-nowrap"
            >
              Pending Provider (Suresh)
            </button>
            <button
              onClick={() => quickLoginAs('admin')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[#F4B942] font-semibold transition-colors whitespace-nowrap"
            >
              Administrator (Admin)
            </button>
          </div>
        </div>
      </section>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Search Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F9D8A] bg-teal-50 border border-teal-200/60 rounded px-2.5 py-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Independent & Admin-Verified Local Professionals</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#16324F] tracking-tight leading-[1.15]">
              Find Trusted Local Professionals Near You.
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
              Discover skilled electricians, plumbers, carpenters, and cleaners. Compare transparent prices, check verification status, and book reliable service visits directly.
            </p>

            {/* Real Search Box */}
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 sm:p-3 rounded-2xl shadow-lg border border-slate-200/80 flex flex-col sm:flex-row items-stretch gap-2"
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Service (e.g. Electrician, AC Repair)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-[#172B4D] placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex-1 flex items-center gap-2 px-3 py-2">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Area (e.g. Indiranagar, HSR)"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full text-sm text-[#172B4D] placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#16324F] hover:bg-[#102438] text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Suggestions */}
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              <span className="font-medium text-slate-700">Popular:</span>
              {['Electrician', 'Plumber', 'Home Cleaning', 'AC Repair'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchQuery(term);
                    navigate(`/services?search=${encodeURIComponent(term)}`);
                  }}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Graphic Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0F9D8A]">Live Verification Feed</p>
                  <h3 className="text-base font-bold text-[#16324F]">Verified Local Tradespeople</h3>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Sample Approved Provider Snippet */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[#172B4D]">Apex Electricals</h4>
                    <p className="text-xs text-slate-500">Arun Patel · Indiranagar & HSR</p>
                  </div>
                  <VerificationBadge status="approved" size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <RatingStars rating={4.9} reviewCount={28} />
                  <span className="font-bold text-[#16324F]">₹499 starting</span>
                </div>
              </div>

              {/* Sample Approved Provider 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[#172B4D]">SparkleClean Specialists</h4>
                    <p className="text-xs text-slate-500">Anita Desai · Koramangala & JP Nagar</p>
                  </div>
                  <VerificationBadge status="approved" size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <RatingStars rating={4.9} reviewCount={34} />
                  <span className="font-bold text-[#16324F]">₹1,199 fixed</span>
                </div>
              </div>

              {/* Trust Metric Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-slate-100">
                <div className="p-2">
                  <p className="text-lg font-bold text-[#16324F] tabular-nums">100%</p>
                  <p className="text-[11px] text-slate-500">Doc Checked</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-bold text-[#16324F] tabular-nums">0%</p>
                  <p className="text-[11px] text-slate-500">Hidden Fees</p>
                </div>
                <div className="p-2">
                  <p className="text-lg font-bold text-[#16324F] tabular-nums">4.8★</p>
                  <p className="text-[11px] text-slate-500">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Service Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F9D8A]">Explore Expertise</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#16324F]">Popular Service Categories</h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-[#16324F] hover:text-[#0F9D8A] transition-colors flex items-center gap-1"
          >
            <span>All Services</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/services?category=${cat.slug}`}
              className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-[#0F9D8A] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-slate-50 group-hover:bg-teal-50 text-[#16324F] group-hover:text-[#0F9D8A] flex items-center justify-center transition-colors">
                  <CategoryIcon iconName={cat.icon || cat.slug} className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-[#0F9D8A] tabular-nums">
                  {cat.serviceCount || 0} listed
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#172B4D] group-hover:text-[#16324F] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Verified Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F9D8A]">Verified Quality</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#16324F]">Featured Services & Providers</h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-[#16324F] hover:text-[#0F9D8A] transition-colors flex items-center gap-1"
          >
            <span>View Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.slice(0, 6).map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between p-5 space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#0F9D8A] uppercase tracking-wide">
                    {service.category?.name || 'Home Service'}
                  </span>
                  {service.provider && (
                    <VerificationBadge status={service.provider.verificationStatus} size="sm" />
                  )}
                </div>

                <Link
                  to={`/services/${service._id}`}
                  className="block text-lg font-bold text-[#172B4D] hover:text-[#16324F] transition-colors leading-snug"
                >
                  {service.title}
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                {/* Provider Byline */}
                {service.provider && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{service.provider.businessName}</p>
                      <p className="text-slate-400">
                        {service.serviceAreas?.slice(0, 2)?.join(', ') || service.serviceArea || 'Bangalore'}
                      </p>
                    </div>
                    <RatingStars
                      rating={service.provider.averageRating || 5.0}
                      reviewCount={service.provider.reviewCount || 0}
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Service Price</span>
                  <span className="text-base font-bold text-[#16324F] tabular-nums">
                    ₹{service.price}
                    <span className="text-xs font-normal text-slate-500">
                      {' '}
                      ({((service.pricingType || service.priceType || 'fixed') as string).replace('_', ' ')})
                    </span>
                  </span>
                </div>

                <Link
                  to={`/services/${service._id}`}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-[#16324F] hover:bg-[#102438] rounded-lg transition-colors shadow-xs"
                >
                  View Details & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0F9D8A]">Simple & Transparent</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#16324F]">How LocalConnect Works</h2>
            <p className="text-sm text-slate-500">
              A reliable workflow designed to eliminate guesswork, double bookings, and unverified service calls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            <div className="p-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-[#16324F] flex items-center justify-center font-bold text-base">
                1
              </div>
              <h4 className="text-sm font-bold text-[#172B4D]">Discover Service</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by service category, pricing, locality, and verified badges.
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-[#16324F] flex items-center justify-center font-bold text-base">
                2
              </div>
              <h4 className="text-sm font-bold text-[#172B4D]">Compare Credentials</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Inspect experience, customer reviews, verified documents, and areas served.
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-[#16324F] flex items-center justify-center font-bold text-base">
                3
              </div>
              <h4 className="text-sm font-bold text-[#172B4D]">Schedule Online</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick your date and working slot with locked transparent service prices.
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-[#16324F] flex items-center justify-center font-bold text-base">
                4
              </div>
              <h4 className="text-sm font-bold text-[#172B4D]">Track Progress</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Follow real-time status: Accepted, Confirmed, On-Site In-Progress, Completed.
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-[#16324F] flex items-center justify-center font-bold text-base">
                5
              </div>
              <h4 className="text-sm font-bold text-[#172B4D]">Rate & Review</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit an authenticated review only after verified completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Why Choose LocalConnect & Transparency Disclosure */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#16324F] text-white rounded-3xl p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F4B942]">
              Security & Accountability
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Why Homeowners & Skilled Trades Choose LocalConnect
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Unlike unmoderated classifieds, LocalConnect mandates administrative verification for service providers before they can accept bookings. We store verifiable audit logs and ensure price integrity directly in the database.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F9D8A] shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200">
                  <strong>Controlled Verification:</strong> Government photo ID and trade license review queue.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F9D8A] shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200">
                  <strong>Double-Booking Prevention:</strong> Atomic time-slot reservation prevents overlapping customer appointments.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#0F9D8A] shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200">
                  <strong>Tamper-Proof Reviews:</strong> Only customers with a verified completed booking can submit ratings.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0F9D8A]" />
              <span>Platform Verification Disclosure</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              LocalConnect checks submitted credentials (photo identification and relevant certificates). While verification increases safety and accountability, identity checks do not eliminate all commercial risks or guarantee subjective job outcomes.
            </p>
            <p className="text-xs text-slate-400">
              Customers and providers are encouraged to discuss project specifics, verify scope upon arrival, and inspect completed work prior to sign-off.
            </p>
            <div className="pt-2">
              <Link
                to="/provider/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F9D8A] hover:bg-[#0C7E6F] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Register as a Professional Provider</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
