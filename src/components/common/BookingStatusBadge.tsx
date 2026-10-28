import React from 'react';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

interface Props {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

export const BookingStatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const config: Record<BookingStatus, { label: string; bg: string; text: string; border: string }> = {
    pending: {
      label: 'Pending Approval',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    accepted: {
      label: 'Accepted by Provider',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
    },
    in_progress: {
      label: 'In Progress (On-Site)',
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
    },
    completed: {
      label: 'Service Completed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
    },
    rejected: {
      label: 'Declined by Provider',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
    },
  };

  const item = config[status] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${item.bg} ${item.text} ${item.border} whitespace-nowrap shrink-0 ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      {item.label}
    </span>
  );
};
