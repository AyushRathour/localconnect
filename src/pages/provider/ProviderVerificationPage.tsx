import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import {
  ShieldCheck,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileX,
  Lock,
} from 'lucide-react';

export const ProviderVerificationPage: React.FC = () => {
  const { providerProfile, refreshUser } = useAuth();
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Submission Form State
  const [docType1, setDocType1] = useState('id_proof');
  const [docFile1Name, setDocFile1Name] = useState('Aadhaar_National_ID_FrontBack.pdf');
  const [docType2, setDocType2] = useState('trade_license');
  const [docFile2Name, setDocFile2Name] = useState('Electrical_Contractor_Trade_License.pdf');
  const [licenseNumber, setLicenseNumber] = useState('TRD-2026-KA-9912');
  const [yearsInPractice, setYearsInPractice] = useState('5');
  const [complianceNotes, setComplianceNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error: boolean } | null>(null);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.getVerificationStatus();
      if (res.success && res.data) {
        setStatusData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      setSubmitting(true);
      const documents = [
        { documentType: docType1, documentName: docFile1Name },
        { documentType: docType2, documentName: docFile2Name },
      ];

      const res = await api.submitVerification({
        documents,
        businessRegistrationNumber: licenseNumber,
        yearsInPractice,
        notes: complianceNotes,
      });

      if (res.success) {
        setMsg({ text: 'Verification submission received! Queued for administrative review.', error: false });
        await refreshUser();
        await loadStatus();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to submit verification.', error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const currentStatus = statusData?.status || providerProfile?.verificationStatus || 'not_submitted';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#16324F]">Provider Verification Center</h1>
        <p className="text-xs text-slate-500">
          Submit identification and trade licenses to receive the verified provider badge and unlock customer bookings.
        </p>
      </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Verification Standing
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-xl font-bold text-[#16324F] capitalize">
                {(currentStatus || 'pending').replace('_', ' ')}
              </h2>
              <VerificationBadge status={currentStatus} size="md" />
            </div>
          </div>

          {statusData?.approvedAt && (
            <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Approved on {new Date(statusData.approvedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Feedback Alert if Rejected or Resubmission */}
        {statusData?.feedback && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Administrator Review Feedback</span>
            </p>
            <p className="italic">"{statusData.feedback}"</p>
          </div>
        )}

        {/* Submitted Documents History */}
        {statusData?.documents && statusData.documents.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Archived Submission Records
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {statusData.documents.map((doc: any) => (
                <div
                  key={doc._id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#16324F]" />
                    <div>
                      <p className="font-semibold text-slate-800">{doc.documentName}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{(doc.documentType || 'document').replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold capitalize text-[11px] px-1.5 py-0.5 rounded ${
                      doc.reviewStatus === 'approved'
                        ? 'text-emerald-700 bg-emerald-50'
                        : doc.reviewStatus === 'rejected'
                        ? 'text-rose-700 bg-rose-50'
                        : 'text-amber-700 bg-amber-50'
                    }`}
                  >
                    {doc.reviewStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission Form (Available when not submitted, rejected, or resubmission required) */}
      {currentStatus !== 'approved' && currentStatus !== 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#16324F]">
              {currentStatus === 'resubmission_required' || currentStatus === 'rejected'
                ? 'Resubmit Corrected Credentials'
                : 'Submit Verification Documents'}
            </h3>
            <p className="text-xs text-slate-500">
              Upload clear scans of your government identification and trade certifications for compliance review.
            </p>
          </div>

          {msg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                msg.error
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {msg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            {/* Document 1: Government Photo ID */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>1. Government Photo Identification *</span>
                </label>
                <span className="text-[10px] text-slate-400">Strictly Private Document</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={docType1}
                  onChange={(e) => setDocType1(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="id_proof">National ID / Aadhaar Card</option>
                  <option value="id_proof">Driving License</option>
                  <option value="id_proof">Passport</option>
                </select>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                  <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={docFile1Name}
                    onChange={(e) => setDocFile1Name(e.target.value)}
                    className="w-full text-xs text-slate-800 focus:outline-none"
                    placeholder="FileName.pdf"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Document 2: Trade License / Certification */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>2. Professional Trade Certification / License *</span>
                </label>
                <span className="text-[10px] text-slate-400">Strictly Private Document</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={docType2}
                  onChange={(e) => setDocType2(e.target.value)}
                  className="text-xs p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="trade_license">Trade License / Diploma Certificate</option>
                  <option value="business_registration">Shop & Establishment / GST Certificate</option>
                  <option value="certifications">Apprenticeship & Safety Certificate</option>
                </select>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs">
                  <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={docFile2Name}
                    onChange={(e) => setDocFile2Name(e.target.value)}
                    className="w-full text-xs text-slate-800 focus:outline-none"
                    placeholder="Certificate_Scan.pdf"
                    required
                  />
                </div>
              </div>
            </div>

            {/* License Registration Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Registration / Certificate ID Number
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. TRD-2026-KA-9912"
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Verified Years in Active Practice
                </label>
                <input
                  type="number"
                  min="1"
                  value={yearsInPractice}
                  onChange={(e) => setYearsInPractice(e.target.value)}
                  className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Compliance Reviewer Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Clarification Notes for Administrator Reviewer (Optional)
              </label>
              <textarea
                rows={2}
                value={complianceNotes}
                onChange={(e) => setComplianceNotes(e.target.value)}
                placeholder="Mention any licensing boards, municipal registrations, or special certifications..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 space-y-1">
              <p>🔒 <strong>Security Policy:</strong> Uploaded identity records are stored in secure private storage. They will never appear in customer search responses or public profiles.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#16324F] hover:bg-[#102438] text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
            >
              {submitting ? 'Submitting to Queue...' : 'Submit Verification Application'}
            </button>
          </form>
        </div>
      )}

      {currentStatus === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs text-center space-y-3">
          <Clock className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-[#16324F]">Application Under Review</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your verification documents have been received by the platform compliance desk. Verification decisions are generally completed within 24 hours.
          </p>
        </div>
      )}
    </div>
  );
};
