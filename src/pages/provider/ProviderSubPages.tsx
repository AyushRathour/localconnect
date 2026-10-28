import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RatingStars } from '../../components/common/RatingStars';
import { Clock, Star, Bell, Briefcase, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

// 1. Availability Management
export const ProviderAvailabilityPage: React.FC = () => {
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [status, setStatus] = useState<'active' | 'unavailable'>('active');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadAvail() {
      try {
        const res = await api.getProviderProfile();
        if (res.success && res.data?.availability?.[0]) {
          const a = res.data.availability[0];
          setDaysOfWeek(a.daysOfWeek || [1, 2, 3, 4, 5, 6]);
          setStartTime(a.startTime || '09:00');
          setEndTime(a.endTime || '18:00');
          setStatus(a.availabilityStatus || 'active');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAvail();
  }, []);

  const daysMap = [
    { num: 0, label: 'Sunday' },
    { num: 1, label: 'Monday' },
    { num: 2, label: 'Tuesday' },
    { num: 3, label: 'Wednesday' },
    { num: 4, label: 'Thursday' },
    { num: 5, label: 'Friday' },
    { num: 6, label: 'Saturday' },
  ];

  const toggleDay = (num: number) => {
    if (daysOfWeek.includes(num)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== num));
    } else {
      setDaysOfWeek([...daysOfWeek, num].sort());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg(null);
      await api.updateAvailability({
        daysOfWeek,
        startTime,
        endTime,
        availabilityStatus: status,
      });
      setMsg('Schedule updated successfully.');
    } catch (err: any) {
      setMsg(err.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">Working Schedule & Availability</h1>
        <p className="text-xs text-slate-500">
          Configure active appointment days and daily operating windows.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {msg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Availability Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Booking Availability Mode
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-[#16324F]"
                />
                <span>Active for Appointments</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'unavailable'}
                  onChange={() => setStatus('unavailable')}
                  className="text-[#16324F]"
                />
                <span>Temporary Vacation / Unavailable</span>
              </label>
            </div>
          </div>

          {/* Working Days */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Active Working Days
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {daysMap.map((d) => (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => toggleDay(d.num)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors text-left flex items-center justify-between ${
                    daysOfWeek.includes(d.num)
                      ? 'bg-teal-50 border-[#0F9D8A] text-[#16324F]'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <span>{d.label}</span>
                  {daysOfWeek.includes(d.num) && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D8A]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daily Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Daily End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            {saving ? 'Updating Schedule...' : 'Save Availability Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. Provider Reviews
export const ProviderReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setLoading(true);
        const profRes = await api.getProviderProfile();
        if (profRes.success && profRes.data?._id) {
          const revRes = await api.getProviderReviews(profRes.data._id);
          if (revRes.success && revRes.data) {
            setReviews(revRes.data);
          }
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
        <h1 className="text-2xl font-bold text-[#16324F]">Customer Feedback & Ratings</h1>
        <p className="text-xs text-slate-500">
          Reviews submitted by customers following completed service appointments.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <Star className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No client reviews logged yet.</p>
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
                  <h4 className="text-sm font-bold text-[#172B4D]">{r.customerName}</h4>
                  <p className="text-xs text-slate-500">Service: {r.serviceTitle}</p>
                </div>
                <RatingStars rating={r.rating} showCount={false} size="sm" />
              </div>
              <p className="text-xs text-slate-700 italic">"{r.comment}"</p>
              <span className="text-[10px] text-slate-400 block tabular-nums pt-1 border-t border-slate-100">
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 3. Provider Business Profile Edit
export const ProviderProfileEditPage: React.FC = () => {
  const { providerProfile, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    skills: '',
    experienceYears: '1',
    serviceAreas: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (providerProfile) {
      setFormData({
        businessName: providerProfile.businessName || '',
        description: providerProfile.description || '',
        skills: (providerProfile.skills || []).join(', '),
        experienceYears: String(providerProfile.experienceYears || 1),
        serviceAreas: (providerProfile.serviceAreas || []).join(', '),
      });
    }
  }, [providerProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg(null);
      await api.updateProviderProfile({
        businessName: formData.businessName,
        description: formData.description,
        skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(formData.experienceYears) || 1,
        serviceAreas: formData.serviceAreas.split(',').map((s) => s.trim()).filter(Boolean),
      });
      await refreshUser();
      setMsg('Business profile updated successfully.');
    } catch (err: any) {
      setMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">Business Profile Settings</h1>
        <p className="text-xs text-slate-500">
          Update trade details, competencies, and active service areas.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {msg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Business / Trade Name *
            </label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
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
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Skills & Core Tools (Comma separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Professional Biography
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 4. Provider Notifications
export const ProviderNotificationsPage: React.FC = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">Provider Notifications</h1>
          <p className="text-xs text-slate-500">
            Booking requests, schedule confirmations, and verification updates.
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
          <p className="text-xs text-slate-500">No notifications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 space-y-1 ${n.readAt ? 'bg-white' : 'bg-teal-50/40'}`}
            >
              <h4 className="text-xs font-bold text-[#172B4D]">{n.title}</h4>
              <p className="text-xs text-slate-600">{n.message}</p>
              <span className="text-[10px] text-slate-400 block tabular-nums">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
