// import { forwardRef } from 'react';
// import { cn } from '../../lib/utils'; // Adjust path if needed

// const AdminSelect = forwardRef(({ className, label, error, options = [], children, containerClassName, ...props }, ref) => {
//   return (
//     <div className={cn("space-y-2", containerClassName)}>
//       {label && (
//         <label className="text-sm font-bold text-slate-700 block">
//           {label}
//         </label>
//       )}
//       <div className="relative group">
//         <select
//           className={cn(
//             "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer",
//             error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
//             className
//           )}
//           ref={ref}
//           {...props}
//         >
//             {children ? children : options.map((opt, idx) => (
//                 <option key={idx} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
//             ))}
//         </select>
//         {/* Custom Arrow */}
//         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//             <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//             </svg>
//         </div>
//       </div>
//       {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
//     </div>
//   );
// });

// AdminSelect.displayName = "AdminSelect";

// export { AdminSelect };
