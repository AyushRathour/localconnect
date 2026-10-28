import React from 'react';
import { PackageOpen } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
      <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
        {icon || <PackageOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-[#172B4D] mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-[#16324F] rounded-lg hover:bg-[#102438] transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
