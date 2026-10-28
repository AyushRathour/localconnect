import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProf, setSelectedProf] = useState<any | null>(null);
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'resubmission_required'>('approved');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, verifsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAdminVerifications('pending'),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (verifsRes.success && verifsRes.data) setPendingVerifications(verifsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReview = (prof: any, dec: 'approved' | 'rejected' | 'resubmission_required') => {
    setSelectedProf(prof);
    setDecision(dec);
    setFeedback(dec === 'approved' ? '' : 'Please provide clearer documentation.');
    setError(null);
    setReviewModalOpen(true);
  };

  const handleSaveDecision = async () => {
    if (!selectedProf) return;
    if (decision !== 'approved' && !feedback.trim()) {
      setError('Feedback is required to explain the decision to the provider.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.reviewVerification(selectedProf._id, decision, feedback);
      setReviewModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#16324F] text-white p-6 sm:p-8 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#F4B942] uppercase tracking-wider">
            System Administration
          </span>
          <h1 className="text-2xl font-bold mt-1">Platform Operations Control</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Audit compliance, review trade certifications, and monitor platform health.
          </p>
        </div>

        <Link
          to="/admin/verifications"
          className="px-4 py-2.5 bg-[#0F9D8A] hover:bg-[#0C7E6F] text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification Queue ({stats?.pendingVerificationsCount || 0})</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Users
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tabular-nums mt-1 block">
            {(stats?.totalCustomers || 0) + (stats?.totalProviders || 0)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats?.totalCustomers} customers · {stats?.totalProviders} providers
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
            Pending Verifications
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums mt-1 block">
            {stats?.pendingVerificationsCount ?? 0}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Requires admin action</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
            Approved Providers
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#0F9D8A] tabular-nums mt-1 block">
            {stats?.approvedProvidersCount ?? 0}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">Active on storefront</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Bookings
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#16324F] tabular-nums mt-1 block">
            {stats?.totalBookings ?? 0}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {stats?.completedBookingsCount} completed · {stats?.cancelledBookingsCount} cancelled
          </span>
        </div>
      </div>

      {/* Verification Queue Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#16324F]">
              Provider Verification Queue
            </h2>
            <p className="text-xs text-slate-500">
              Providers awaiting documentary examination and verification approval.
            </p>
          </div>
          <Link
            to="/admin/verifications"
            className="text-xs font-bold text-[#0F9D8A] hover:underline flex items-center gap-1"
          >
            <span>Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading queue...</div>
        ) : pendingVerifications.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Verification Queue is Empty</p>
            <p className="text-[11px] text-slate-400">All provider applications have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingVerifications.map((p) => (
              <div
                key={p._id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#172B4D]">{p.businessName}</h3>
                    <span className="text-xs text-slate-500">({p.user?.name})</span>
                    <VerificationBadge status={p.verificationStatus} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600">
                    Trade: {p.skills?.join(', ')} · {p.experienceYears} yrs exp · Areas: {p.serviceAreas?.join(', ')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Documents submitted: {p.documents?.map((d: any) => d.documentName).join(', ') || 'ID proofs attached'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenReview(p, 'approved')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleOpenReview(p, 'resubmission_required')}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  >
                    Request Resubmit
                  </button>
                  <button
                    onClick={() => handleOpenReview(p, 'rejected')}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent System Audit Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-[#16324F] flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>Platform Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-500">Security and administrative action traceability</p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs font-bold text-[#0F9D8A] hover:underline">
            View All Logs
          </Link>
        </div>

        {stats?.recentLogs?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No audit logs recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats?.recentLogs?.slice(0, 6).map((log: any) => (
              <div key={log._id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#16324F]">{log.action}</span>
                    <span className="text-slate-400">on {log.targetType}</span>
                  </div>
                  {log.safeMetadata && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      {JSON.stringify(log.safeMetadata)}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Decision Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review Application: ${selectedProf?.businessName}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p><strong>Provider:</strong> {selectedProf?.businessName} ({selectedProf?.user?.name})</p>
            <p><strong>Decision:</strong> <span className="font-bold uppercase text-[#16324F]">{decision.replace('_', ' ')}</span></p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Decision Type
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="approved">Approve Verification (Grant Badge & Allow Bookings)</option>
              <option value="resubmission_required">Request Resubmission (Ask for clearer files)</option>
              <option value="rejected">Reject Verification (Decline Profile)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Feedback to Provider {decision !== 'approved' && '*'}
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Scans of identity card were blurred. Please resubmit high-resolution photo."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDecision}
              disabled={submitting}
              className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors ${
                decision === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : decision === 'rejected'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {submitting ? 'Recording...' : `Confirm ${decision.replace('_', ' ')}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
