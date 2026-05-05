// import React, { forwardRef } from 'react';
// import { cn } from '../../lib/utils';
// import { Search } from 'lucide-react';

// const AdminInput = forwardRef(({ className, type = "text", label, icon: Icon, error, containerClassName, ...props }, ref) => {
//   return (
//     <div className={cn("space-y-2", containerClassName)}>
//       {label && (
//         <label className="text-sm font-bold text-slate-700 block">
//           {label}
//         </label>
//       )}
//       <div className="relative group">
//         {Icon && (
//           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500 pointer-events-none">
//             <Icon size={18} />
//           </div>
//         )}
//         <input
//           type={type}
//           className={cn(
//             "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200",
//             Icon && "pl-10",
//             error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
//             className
//           )}
//           ref={ref}
//           {...props}
//           onWheel={(e) => e.target.blur()}
//         />
//       </div>
//       {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
//     </div>
//   );
// });

// AdminInput.displayName = "AdminInput";

// export { AdminInput };
