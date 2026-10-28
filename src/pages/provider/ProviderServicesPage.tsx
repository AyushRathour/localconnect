import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Modal } from '../../components/common/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  MapPin,
  AlertCircle,
  Wrench,
  CheckCircle2,
} from 'lucide-react';

export const ProviderServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    price: '',
    pricingType: 'fixed',
    estimatedDuration: '1 hr',
    serviceAreas: 'Indiranagar, Koramangala',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsRes, profRes] = await Promise.all([
        api.getCategories(),
        api.getProviderProfile(),
      ]);

      if (catsRes.success && catsRes.data) setCategories(catsRes.data);

      if (profRes.success && profRes.data?._id) {
        const srvRes = await api.getServices({ providerId: profRes.data._id, verifiedOnly: 'false' });
        // filter by this provider
        const myServices = (srvRes.data || []).filter((s: any) => s.providerId === profRes.data._id);
        setServices(myServices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: '',
      categoryId: categories[0]?._id || '',
      description: '',
      price: '',
      pricingType: 'fixed',
      estimatedDuration: '1 hr',
      serviceAreas: 'Indiranagar, Koramangala',
    });
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: any) => {
    setEditingId(srv._id);
    setFormData({
      title: srv.title,
      categoryId: srv.categoryId,
      description: srv.description,
      price: String(srv.price),
      pricingType: srv.pricingType,
      estimatedDuration: srv.estimatedDuration,
      serviceAreas: srv.serviceAreas.join(', '),
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId || !formData.price) {
      setError('Please fill in title, category, and price.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        title: formData.title,
        categoryId: formData.categoryId,
        description: formData.description,
        price: Number(formData.price),
        pricingType: formData.pricingType,
        estimatedDuration: formData.estimatedDuration,
        serviceAreas: formData.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingId) {
        await api.updateProviderService(editingId, payload);
      } else {
        await api.createProviderService(payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this service?')) return;
    try {
      await api.deleteProviderService(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete service.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">My Service Offerings</h1>
          <p className="text-xs text-slate-500">
            Create and maintain your listed services, fixed rates, and durations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#16324F] hover:bg-[#102438] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading service catalog...</div>
      ) : services.length === 0 ? (
        <div className="p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-[#172B4D]">No Services Listed</h3>
          <p className="text-xs text-slate-500">
            Publish your first service listing so local customers can book appointments.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 px-4 py-2 text-xs font-bold text-white bg-[#16324F] rounded-lg"
          >
            Create First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F9D8A] uppercase tracking-wide">
                    {srv.category?.name || 'Local Service'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 capitalize">
                    {((srv.pricingType || srv.priceType || 'fixed') as string).replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#172B4D] leading-snug">{srv.title}</h3>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {srv.description}
                </p>

                <div className="pt-2 text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Duration: {srv.estimatedDuration}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{srv.serviceAreas.join(', ')}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-lg font-bold text-[#16324F] tabular-nums">
                  ₹{srv.price}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(srv)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                    aria-label="Edit service"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(srv._id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                    aria-label="Deactivate service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Service Listing' : 'Create New Service Offering'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              placeholder="e.g. Master Circuit Breaker Replacement"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pricing Structure
              </label>
              <select
                value={formData.pricingType}
                onChange={(e) => setFormData({ ...formData, pricingType: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="fixed">Fixed Price</option>
                <option value="starting_at">Starting At</option>
                <option value="hourly">Per Hour</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Price (₹) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                placeholder="499"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Estimated Duration
              </label>
              <input
                type="text"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                placeholder="e.g. 1.5 hrs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Service Areas (Comma separated)
            </label>
            <input
              type="text"
              value={formData.serviceAreas}
              onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              placeholder="Indiranagar, Koramangala, HSR Layout"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description & Scope of Work
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              placeholder="Explain what is included in the service, safety precautions, parts needed..."
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-[#16324F] hover:bg-[#102438] rounded-lg"
            >
              {submitting ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
