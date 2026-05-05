import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const InputSimple = forwardRef(({ className, type, label, error, rightElement, ...props }, ref) => {
  return (
    <div className="space-y-1 relative">
      {label && <label className="text-xs font-black text-slate-700 uppercase tracking-tight ml-0.5">{label}</label>}
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100 focus-visible:border-indigo-500 transition-all duration-200",
            error && "border-red-500 focus-visible:ring-red-50",
            rightElement && "pr-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
});

InputSimple.displayName = "InputSimple";

export { InputSimple };
