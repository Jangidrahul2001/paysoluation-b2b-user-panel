import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { LayoutGrid, ChevronRight } from "lucide-react";
import { servicesData } from "../../services/billPaymentService";

export const ServiceGrid = ({ services, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-gradient-to-tr from-white via-white to-indigo-50/40 p-4 sm:p-8 rounded-[2rem] sm:rounded-[32px] border border-indigo-100/60 flex flex-col items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-2xl" />
            <div className="h-4 bg-slate-50 rounded-md w-3/4" />
            <div className="h-2 bg-slate-50 rounded-md w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 relative">
      <AnimatePresence mode="popLayout" initial={false}>
        {services.map((s, i) => {
          const config = servicesData[s.name];
          const Icon = config?.icon || LayoutGrid;

          return (
            <motion.div
              key={s.name}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                duration: 0.15,
                ease: [0.23, 1, 0.32, 1], // Custom fast-out ease
                delay: i * 0.005 
              }}
              onClick={() => onSelect(s, Icon)}
              className="group relative bg-gradient-to-tr from-white via-white to-indigo-50/50 p-4 sm:p-5 rounded-3xl border border-indigo-200/60 shadow-sm transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center text-center"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700" />
              
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className={cn(
                  "w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-700 mb-2.5 sm:mb-4 shadow-inner ring-4 ring-white group-hover:scale-110",
                  config?.color || "bg-indigo-50 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white"
                )}>
                  <Icon size={18} className="sm:hidden" />
                  <Icon size={24} className="hidden sm:block" />
                </div>
                
                <h3 className="text-[11px] sm:text-[13px] font-black text-slate-800 mb-0.5 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate w-full">
                  {s.name}
                </h3>
                
                <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-3 sm:mb-4 opacity-60">
                  Provider
                </p>
                
                <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 rounded-full transition-all duration-500 shadow-sm">
                  <span className="text-[8px] sm:text-[9.5px] font-black uppercase tracking-widest text-slate-500">Pay</span>
                  <ChevronRight size={10} className="sm:hidden" />
                  <ChevronRight size={11} className="hidden sm:block group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
