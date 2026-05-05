import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle, Clock, Info, ShieldCheck, AlertCircle, CircleDashed } from 'lucide-react';

const StatusBadge = ({ status, className }) => {
  const normalizedStatus = status?.toUpperCase() || '';

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      // Success / Positive
      case 'SUCCESS':
      case 'APPROVED':
      case 'ACTIVE':
      case 'COMPLETED':
      case 'ASSIGNED':
      case 'RESOLVED':
      case 'UNUSED':
      case 'DELIVERED':
        return {
          style: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          icon: <CheckCircle2 className="h-3.5 w-3.5 stroke-[2px]" />
        };

      case 'VERIFIED':
        return {
          style: 'bg-indigo-50 text-indigo-600 border-indigo-200',
          icon: <ShieldCheck className="h-3.5 w-3.5 stroke-[2px]" />
        };

      // Pending / Warning
      case 'PENDING':
      case 'PROCESSING':
      case 'INITIATED':
      case 'SHIPPED':
        return {
          style: 'bg-amber-50 text-amber-600 border-amber-200',
          icon: <Clock className="h-3.5 w-3.5 stroke-[2px]" />
        };

      // Danger / Negative
      case 'FAILED':
      case 'REJECTED':
      case 'DEACTIVATED':
      case 'EXPIRED':
      case 'USED':
      case 'CANCELLED':
        return {
          style: 'bg-rose-50 text-rose-600 border-rose-200',
          icon: <XCircle className="h-3.5 w-3.5 stroke-[2px]" />
        };

      // Info / Neutral
      case 'REFUND':
      case 'SUBMITTED':
      case 'REVERSED':
      case 'PENDING_API':
        return {
          style: 'bg-blue-50 text-blue-600 border-blue-200',
          icon: <Info className="h-3.5 w-3.5 stroke-[2px]" />
        };

      case 'RE-KYC':
        return {
          style: 'bg-purple-50 text-purple-600 border-purple-200',
          icon: <AlertCircle className="h-3.5 w-3.5 stroke-[2px]" />
        };

      case 'INACTIVE':
        return {
          style: 'bg-slate-50 text-slate-500 border-slate-200',
          icon: <AlertCircle className="h-3.5 w-3.5 stroke-[2px]" />
        };

      default:
        return {
          style: 'bg-slate-50 text-slate-600 border-slate-200',
          icon: <CircleDashed className="h-3.5 w-3.5 stroke-[2px]" />
        };
    }
  };

  const { style, icon } = getStatusConfig();

  return (
    <span className={cn(
      "px-3 py-1.5 rounded-xl text-[10px] font-bold border inline-flex items-center gap-1.5 uppercase tracking-wider transition-all duration-200",
      style,
      className
    )}>
      {icon}
      {normalizedStatus}
    </span>
  );
};

export default StatusBadge;
