import React from 'react';
import { cn } from '../../lib/utils';

export const BentoCard = ({ children, className, ...props }) => {
  return (
    <div className={cn("bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
};
