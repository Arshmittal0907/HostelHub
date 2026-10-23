import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['APPROVED', 'ACTIVE', 'PRESENT', 'COMPLETED', 'PAID', 'AVAILABLE', 'RESOLVED', 'CLOSED'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['PENDING', 'PENDING_APPROVAL', 'PENDING_VERIFICATION', 'SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'BOOKED', 'APPEALED'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['REJECTED', 'ABSENT', 'MISSED', 'OVERDUE', 'BLOCKED', 'CANCELLED', 'SUSPENDED'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['OCCUPIED', 'LEAVE', 'COLLECTED'].includes(normalized)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['MAINTENANCE', 'LATE', 'TRANSFERRED', 'WAIVED'].includes(normalized)) {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
