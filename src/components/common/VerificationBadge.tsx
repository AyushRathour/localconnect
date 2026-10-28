import React from 'react';
import { ShieldCheck, Clock, AlertCircle, FileX } from 'lucide-react';

interface Props {
  status: 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'resubmission_required';
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const VerificationBadge: React.FC<Props> = ({ status, size = 'sm', showDetails = false }) => {
  if (status === 'approved') {
    return (
      <span
        title="Identity and professional credentials verified by LocalConnect Admin"
        className={`inline-flex items-center gap-1 font-medium text-[#15803D] bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0 ${
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base px-2.5 py-1'
        }`}
      >
        <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Verified Provider</span>
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span
        title="Documents submitted and awaiting administrator review"
        className={`inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 border border-amber-200/60 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Verification Pending</span>
      </span>
    );
  }

  if (status === 'resubmission_required') {
    return (
      <span
        title="Administrator requested resubmission of identity or trade documents"
        className={`inline-flex items-center gap-1 font-medium text-orange-700 bg-orange-50 border border-orange-200/60 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Resubmission Required</span>
      </span>
    );
  }

  if (status === 'rejected') {
    return (
      <span
        title="Verification application rejected"
        className={`inline-flex items-center gap-1 font-medium text-rose-700 bg-rose-50 border border-rose-200/60 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <FileX className="w-3.5 h-3.5" />
        <span>Verification Rejected</span>
      </span>
    );
  }

  return (
    <span
      title="Provider has not yet submitted identity verification documents"
      className={`inline-flex items-center gap-1 font-medium text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 whitespace-nowrap shrink-0 ${
        size === 'sm' ? 'text-xs' : 'text-sm'
      }`}
    >
      <span>Unverified Profile</span>
    </span>
  );
};
