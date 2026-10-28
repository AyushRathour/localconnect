import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { BookingStatusBadge } from '../../components/common/BookingStatusBadge';
import { RatingStars } from '../../components/common/RatingStars';
import { Modal } from '../../components/common/Modal';
import {
  ShieldCheck,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers,
  Wrench,
  Calendar,
  Star,
  Activity,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';

// 1. Admin Verifications Full Queue
export const AdminVerificationsPage: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState<any | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'resubmission_required'>('approved');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminVerifications(statusFilter);
      if (res.success && res.data) setProviders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, [statusFilter]);

  const handleOpenReview = (prof: any, dec: 'approved' | 'rejected' | 'resubmission_required') => {
    setSelectedProf(prof);
    setDecision(dec);
    setFeedback(dec === 'approved' ? '' : 'Please upload clearer documents.');
    setModalOpen(true);
  };

  const handleSaveDecision = async () => {
    if (!selectedProf) return;
    try {
      setSubmitting(true);
      await api.reviewVerification(selectedProf._id, decision, feedback);
      setModalOpen(false);
      loadVerifications();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">Provider Verification Queue</h1>
          <p className="text-xs text-slate-500">
            Review submitted identity cards, trade certificates, and manage verified badges.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
        >
          <option value="all">All Verification Statuses</option>
          <option value="pending">Pending Review Only</option>
          <option value="approved">Approved Providers</option>
          <option value="resubmission_required">Resubmission Required</option>
          <option value="rejected">Rejected Applications</option>
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading queue...</div>
      ) : providers.length === 0 ? (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
          <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500">No provider submissions matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#172B4D]">{p.businessName}</h3>
                  <VerificationBadge status={p.verificationStatus} size="sm" />
                </div>
                <span className="text-xs text-slate-400">
                  Contact: {p.user?.name} · {p.user?.phone} · {p.user?.email}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p><strong>Experience:</strong> {p.experienceYears} Years</p>
                  <p><strong>Areas:</strong> {p.serviceAreas?.join(', ')}</p>
                  <p><strong>Skills:</strong> {p.skills?.join(', ')}</p>
                  <p className="text-slate-500">{p.description}</p>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="font-bold text-slate-700 block">Submitted Verification Documents</span>
                  {p.documents && p.documents.length > 0 ? (
                    <div className="space-y-1">
                      {p.documents.map((d: any) => (
                        <div key={d._id} className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-slate-700">📄 {d.documentName}</span>
                          <span className="text-slate-400 capitalize">({d.documentType.replace('_', ' ')})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No document attachments uploaded.</p>
                  )}
                  {p.verificationFeedback && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                      <strong>Current Feedback:</strong> "{p.verificationFeedback}"
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenReview(p, 'approved')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleOpenReview(p, 'resubmission_required')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                >
                  Request Resubmission
                </button>
                <button
                  onClick={() => handleOpenReview(p, 'rejected')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Verification Decision: ${selectedProf?.businessName}`}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Decision
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="approved">Approve (Grant Verified Badge & Unlock Bookings)</option>
              <option value="resubmission_required">Request Resubmission (Feedback required)</option>
              <option value="rejected">Reject Application (Feedback required)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Reviewer Notes / Feedback to Provider
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Scans of identity card were blurred. Please resubmit high-resolution photo."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDecision}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-[#16324F] hover:bg-[#102438] rounded-lg"
            >
              {submitting ? 'Updating...' : 'Save Decision'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// 2. Admin Users Management
export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers({ role: roleFilter, search });
      if (res.success && res.data) setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.accountStatus === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change ${user.name}'s account status to ${nextStatus}?`)) return;
    try {
      await api.updateUserStatus(user._id, nextStatus);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">User Management</h1>
          <p className="text-xs text-slate-500">
            View all registered customers, service providers, and administrative accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="provider">Providers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Name & Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3">Registered</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{u.phone}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`font-semibold capitalize text-[10px] px-2 py-0.5 rounded ${
                        u.accountStatus === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                          u.accountStatus === 'active'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.accountStatus === 'active' ? 'Suspend' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. Admin Services Management
export const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await api.getServices({ verifiedOnly: 'false', limit: '50' });
      if (res.success && res.data) setServices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">Service Catalog Inspection</h1>
        <p className="text-xs text-slate-500">
          Global view of all service offerings created by registered providers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv._id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#0F9D8A] uppercase tracking-wider">
                {srv.category?.name}
              </span>
              <h3 className="text-sm font-bold text-[#172B4D]">{srv.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{srv.description}</p>
              <p className="text-[11px] text-slate-400 pt-1">
                Provider: <strong>{srv.provider?.businessName}</strong>
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-[#16324F]">₹{srv.price}</span>
              <span className="text-slate-400">{srv.estimatedDuration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Admin Categories Management
export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Briefcase');

  const loadCats = async () => {
    const res = await api.getAdminCategories();
    if (res.success && res.data) setCategories(res.data);
  };

  useEffect(() => {
    loadCats();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createCategory({ name, description, icon });
    setModalOpen(false);
    setName('');
    setDescription('');
    loadCats();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#16324F]">Service Categories</h1>
          <p className="text-xs text-slate-500">Manage categories and classifications.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#16324F] hover:bg-[#102438] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-[#172B4D]">{c.name}</h3>
            <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
            <p className="text-[11px] font-semibold text-[#0F9D8A] pt-1">
              {c.serviceCount || 0} active services
            </p>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              placeholder="e.g. Pest Control"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-[#16324F] rounded-lg"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// 5. Admin Bookings Monitor
export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookings() {
      try {
        setLoading(true);
        const res = await api.getAdminBookings();
        if (res.success && res.data) setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">Platform Bookings Directory</h1>
        <p className="text-xs text-slate-500">Monitor all transactions and appointment stages.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Service</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 font-mono font-bold text-slate-800">{b.bookingReference}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">{b.serviceTitle}</td>
                  <td className="px-5 py-3 text-slate-600">{b.customerName}</td>
                  <td className="px-5 py-3 text-slate-600">{b.providerBusinessName}</td>
                  <td className="px-5 py-3 text-slate-600">{b.requestedDate} {b.startTime}</td>
                  <td className="px-5 py-3 font-bold text-[#16324F] tabular-nums">₹{b.totalAmount}</td>
                  <td className="px-5 py-3">
                    <BookingStatusBadge status={b.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 6. Admin Reviews Moderation
export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminReviews();
      if (res.success && res.data) setReviews(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (id: string, status: string) => {
    await api.moderateReview(id, status);
    loadReviews();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">Review Moderation</h1>
        <p className="text-xs text-slate-500">Audit customer feedback and flag inappropriate remarks.</p>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-[#172B4D]">{r.customerName}</span>
                <span className="text-xs text-slate-400"> on provider {r.providerBusinessName}</span>
              </div>
              <RatingStars rating={r.rating} showCount={false} size="sm" />
            </div>
            <p className="text-xs text-slate-700 italic">"{r.comment}"</p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className={`capitalize font-semibold text-[11px] px-2 py-0.5 rounded ${
                r.moderationStatus === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {r.moderationStatus}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleModerate(r._id, 'approved')}
                  className="px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleModerate(r._id, 'flagged')}
                  className="px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-50 rounded"
                >
                  Flag
                </button>
                <button
                  onClick={() => handleModerate(r._id, 'hidden')}
                  className="px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 rounded"
                >
                  Hide
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Admin Audit Logs
export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await api.getAdminAuditLogs();
        if (res.success && res.data) setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">System Audit Logs</h1>
        <p className="text-xs text-slate-500">Immutable records of administrative and security events.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {logs.map((log) => (
          <div key={log._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#16324F] bg-slate-100 px-2 py-0.5 rounded">
                  {log.action}
                </span>
                <span className="text-slate-500">by {log.actorName} ({log.actorRole})</span>
              </div>
              {log.safeMetadata && (
                <p className="text-[11px] font-mono text-slate-400">
                  Target: {log.targetType} ({log.targetId}) · {JSON.stringify(log.safeMetadata)}
                </p>
              )}
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
