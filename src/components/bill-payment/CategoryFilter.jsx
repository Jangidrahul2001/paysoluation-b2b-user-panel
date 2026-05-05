import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { LayoutGrid } from "lucide-react";
import { categoryData } from "../../services/billPaymentService";

export const CategoryFilter = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="relative group/filter pb-2">
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
        {categories.map((cat, i) => {
          const isActive = selectedCategory === cat;
          const config = categoryData[cat] || { name: cat, icon: LayoutGrid };
          const Icon = config.icon;

          return (
            <button
              key={cat}
              id={`category-filter-${cat}`}
              onClick={() => onSelect(cat)}
              className={cn(
                "relative group flex items-center gap-2 h-10 px-4 rounded-xl whitespace-nowrap transition-all duration-500 shrink-0",
                "border outline-none",
                isActive 
                  ? "border-transparent text-white" 
                  : "bg-white border-indigo-100 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white shadow-sm"
              )}
            >
              {/* Active Background Glow */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Label & Icon */}
              <div className="relative z-10 flex items-center gap-2">
                <Icon size={13} strokeWidth={isActive ? 3 : 2} className={cn(
                   "transition-colors duration-500",
                   isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-500"
                )} />
                <span className={cn(
                   "text-[9.5px] font-black uppercase tracking-wider",
                   isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                )}>
                   {config.name}
                </span>
              </div>

              {/* Micro-Interaction Highlight */}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-indigo-50/10 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
