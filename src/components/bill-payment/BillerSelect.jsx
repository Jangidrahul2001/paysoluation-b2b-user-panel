import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Building2, ChevronDown, Search, Check, Loader2 } from "lucide-react";

export const BillerSelect = ({ label, placeholder, options, value, onChange, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options?.filter((option) =>
    option?.billerName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5 mb-2.5 block">
        {label}
      </label>
      <div className="relative group">
        <div
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          className={cn(
            "w-full h-11 pl-4 pr-4 flex items-center justify-between bg-slate-50/80 border border-slate-200 rounded-2xl cursor-pointer transition-all duration-300",
            isOpen
              ? "border-indigo-600 ring-4 ring-indigo-500/5 bg-white"
              : "hover:border-indigo-200 hover:bg-white",
            isLoading && "opacity-60 cursor-not-allowed",
          )}
        >
          <div className="flex items-center gap-3 w-full overflow-hidden">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                isOpen
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-400 border border-slate-100",
              )}
            >
              <Building2 size={14} />
            </div>
            <div className="flex flex-col items-start truncate">
              <span
                className={cn(
                  "text-[13px] font-bold truncate w-full text-left tracking-tight",
                  value ? "text-slate-800" : "text-slate-400",
                )}
              >
                {isLoading && !value
                  ? "Initializing list..."
                  : value?.billerName || placeholder}
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 text-slate-400 ml-2">
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
            ) : (
              <ChevronDown size={14} className={cn("transition-transform duration-300")} />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden ring-1 ring-slate-900/5 min-w-[280px] sm:min-w-0"
            >
              <div className="p-3 bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300 transition-all tracking-tight"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-[280px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <button
                      key={option?._id}
                      onClick={() => {
                        onChange(option);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl text-[12px] font-bold transition-all flex items-center justify-between group",
                        value?._id === option?._id
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600",
                      )}
                    >
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black tracking-widest shrink-0",
                            value?._id === option._id
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-400 group-hover:bg-white",
                          )}
                        >
                          {option.billerName?.charAt(0)}
                        </div>
                        <span className="truncate uppercase font-black tracking-tight">{option.billerName}</span>
                      </div>
                      {value?._id === option?._id && <Check size={14} className="text-white shrink-0 ml-2" />}
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                    <Search size={32} strokeWidth={1.5} className="mb-3 text-slate-400" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No providers found</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
