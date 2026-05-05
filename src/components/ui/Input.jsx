import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { m } from 'framer-motion';

const Input = forwardRef(({ className, type, icon: Icon, rightElement, label, error, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500">
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 md:h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition-all duration-200 outline-none placeholder:text-slate-300",
            "focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5",
            "hover:border-slate-300",
            Icon && "pl-11",
            rightElement && "pr-11",
            error && "border-red-500 focus:ring-red-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className={cn(
          "mt-1.5 text-xs font-medium text-red-600"
        )}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
