import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { RatingStars } from '../components/common/RatingStars';
import { EmptyState } from '../components/common/EmptyState';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filters state from URL query
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const area = searchParams.get('area') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const verifiedOnly = searchParams.get('verifiedOnly') !== 'false'; // default true
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local filter inputs
  const [searchInput, setSearchInput] = useState(search);
  const [areaInput, setAreaInput] = useState(area);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success && res.data) setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const params: Record<string, string> = {
          page: String(page),
          limit: '9',
          sort,
          verifiedOnly: String(verifiedOnly),
        };
        if (search) params.search = search;
        if (category && category !== 'all') params.category = category;
        if (area) params.area = area;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (minRating) params.minRating = minRating;

        const res = await api.getServices(params);
        if (res.success && res.data) {
          setServices(res.data);
          if (res.meta) {
            setTotal(res.meta.total);
            setTotalPages(res.meta.totalPages);
          }
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [search, category, area, minPrice, maxPrice, minRating, verifiedOnly, sort, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1'); // reset page on filter change
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set('search', searchInput.trim());
    else next.delete('search');
    if (areaInput.trim()) next.set('area', areaInput.trim());
    else next.delete('area');
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setAreaInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(
    search || (category && category !== 'all') || area || minPrice || maxPrice || minRating || !verifiedOnly || sort !== 'relevance'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#16324F]">
            Local Service Directory
          </h1>
          <p className="text-sm text-[#64748B]">
            Browse certified professionals with upfront pricing, genuine client reviews, and verified documents.
          </p>
        </div>

        {/* Search & Location Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch gap-2"
        >
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 border-b md:border-b-0 md:border-r border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by service, trade, or provider..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full text-sm text-[#172B4D] placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex-1 flex items-center gap-2 px-3 py-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Filter by neighborhood / area (e.g. Indiranagar)"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              className="w-full text-sm text-[#172B4D] placeholder-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#16324F] hover:bg-[#102438] text-white font-medium text-sm rounded-lg transition-colors shrink-0"
          >
            Update Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-[#172B4D] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filter Results</span>
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Service Category
            </label>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.slug}>
                  {c.name} ({c.serviceCount || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Verification Badge Toggle */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Provider Trust
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => updateParam('verifiedOnly', String(e.target.checked))}
                className="w-4 h-4 text-[#0F9D8A] rounded border-slate-300 focus:ring-[#0F9D8A]"
              />
              <span className="font-medium text-slate-900">Verified Providers Only</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Filters for providers whose legal ID and credentials have been approved by admin.
            </p>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Minimum Rating
            </label>
            <div className="space-y-1">
              {[
                { label: 'Any Rating', val: '' },
                { label: '4.5 & above', val: '4.5' },
                { label: '4.0 & above', val: '4.0' },
              ].map((item) => (
                <label key={item.val} className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === item.val}
                    onChange={() => updateParam('minRating', item.val)}
                    className="text-[#16324F]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Services Listings Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Count Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-800 tabular-nums">{services.length}</span> of{' '}
              <span className="font-bold text-slate-800 tabular-nums">{total}</span> verified services
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-slate-800 font-medium focus:outline-none"
              >
                <option value="relevance">Relevance & Status</option>
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse p-5 space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-6 bg-slate-100 rounded w-3/4" />
                  <div className="h-12 bg-slate-100 rounded w-full" />
                  <div className="h-8 bg-slate-100 rounded w-1/2 mt-auto" />
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              title="No Services Found"
              description="No services matched your current search filters. Try adjusting price bounds, category, or clear search queries."
              actionText="Reset All Filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between p-5 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#0F9D8A] uppercase tracking-wide">
                        {service.category?.name || 'Local Service'}
                      </span>
                      {service.provider && (
                        <VerificationBadge status={service.provider.verificationStatus} size="sm" />
                      )}
                    </div>

                    <Link
                      to={`/services/${service._id}`}
                      className="block text-base font-bold text-[#172B4D] hover:text-[#16324F] transition-colors leading-snug"
                    >
                      {service.title}
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Provider Info */}
                    {service.provider && (
                      <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <Link
                            to={`/providers/${service.provider._id}`}
                            className="font-semibold text-slate-800 hover:text-[#16324F] transition-colors truncate max-w-[150px]"
                          >
                            {service.provider.businessName}
                          </Link>
                          <RatingStars
                            rating={service.provider.averageRating || 5.0}
                            reviewCount={service.provider.reviewCount || 0}
                          />
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px] truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{service.serviceAreas.slice(0, 3).join(', ')}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Standard Rate</span>
                      <span className="text-base font-bold text-[#16324F] tabular-nums">
                        ₹{service.price}
                      </span>
                    </div>

                    <Link
                      to={`/services/${service._id}`}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#16324F] hover:bg-[#102438] rounded-lg transition-colors shadow-xs"
                    >
                      Book Visit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-600 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => updateParam('page', String(page + 1))}
                className="p-2 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
