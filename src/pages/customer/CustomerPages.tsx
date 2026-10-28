import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { RatingStars } from '../../components/common/RatingStars';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Bell,
  Star,
  User,
  Phone,
  Mail,
} from 'lucide-react';

// 1. Customer Addresses Page
export const CustomerAddressesPage: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: 'Home',
    addressLine: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    isDefault: false,
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.getAddresses();
      if (res.success && res.data) setAddresses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      label: 'Home',
      addressLine: '',
      area: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      isDefault: addresses.length === 0,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: any) => {
    setEditingId(addr._id);
    setFormData({
      label: addr.label,
      addressLine: addr.addressLine,
      area: addr.area,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateAddress(editingId, formData);
      } else {
        await api.createAddress(formData);
      }
      setModalOpen(false);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    try {
      await api.deleteAddress(id);
      loadAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">Saved Addresses</h1>
          <p className="text-xs text-slate-500">
            Manage service delivery locations for rapid booking checkouts.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#16324F] hover:bg-[#102438] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#16324F] bg-slate-100 px-2 py-0.5 rounded">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[11px] font-semibold text-[#0F9D8A] bg-teal-50 px-2 py-0.5 rounded">
                      Default Location
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800 pt-1">{addr.addressLine}</p>
                <p className="text-xs text-slate-500">
                  {addr.area}, {addr.city}, {addr.state} - {addr.postalCode}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                  aria-label="Edit address"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Saved Address' : 'Add New Service Address'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Address Label
            </label>
            <select
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Flat / House / Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              placeholder="e.g. Flat 402, Green Glen Palms"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Neighborhood Area *
              </label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                placeholder="e.g. Indiranagar"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                placeholder="e.g. 560038"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 text-[#0F9D8A] rounded border-slate-300"
            />
            <span className="text-xs font-medium text-slate-800">Set as default service address</span>
          </label>

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
              className="px-4 py-2 text-xs font-bold text-white bg-[#16324F] hover:bg-[#102438] rounded-lg"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// 2. Customer Reviews Page
export const CustomerReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        // Find user's completed bookings that have reviews
        const res = await api.getMyBookings();
        if (res.success && res.data) {
          const userReviews = res.data
            .filter((b: any) => b.review)
            .map((b: any) => ({
              ...b.review,
              serviceTitle: b.service?.title,
              providerBusiness: b.provider?.businessName,
              bookingReference: b.bookingReference,
            }));
          setReviews(userReviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">My Service Reviews</h1>
        <p className="text-xs text-slate-500">
          Reviews you have submitted for completed service appointments.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Star className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">You haven't submitted any reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D]">{r.serviceTitle}</h3>
                  <p className="text-xs text-slate-500">{r.providerBusiness}</p>
                </div>
                <RatingStars rating={r.rating} showCount={false} size="sm" />
              </div>
              <p className="text-xs text-slate-700 italic">"{r.comment}"</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Booking {r.bookingReference}</span>
                <span className="tabular-nums">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. Customer Notifications Page
export const CustomerNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.success && res.data) setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    loadNotifs();
  };

  const handleMarkOneRead = async (id: string) => {
    await api.markNotificationRead(id);
    loadNotifs();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">Notifications</h1>
          <p className="text-xs text-slate-500">
            Real-time updates regarding service bookings, confirmations, and alerts.
          </p>
        </div>
        {notifications.some((n) => !n.readAt) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#0F9D8A] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">You're all caught up! No notifications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.readAt ? 'bg-white' : 'bg-teal-50/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#172B4D]">{n.title}</h4>
                  {!n.readAt && (
                    <span className="w-2 h-2 rounded-full bg-[#0F9D8A]" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-slate-400 block tabular-nums">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {!n.readAt && (
                <button
                  onClick={() => handleMarkOneRead(n._id)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 4. Customer Profile Page
export const CustomerProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg(null);
      const res = await api.updateCustomerProfile({ name, phone });
      if (res.success) {
        setMsg('Profile updated successfully.');
        await refreshUser();
      }
    } catch (err: any) {
      setMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">Account Settings</h1>
        <p className="text-xs text-slate-500">Manage your profile details and contact number.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {msg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full text-xs sm:text-sm p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400">Email cannot be changed directly.</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mobile Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
