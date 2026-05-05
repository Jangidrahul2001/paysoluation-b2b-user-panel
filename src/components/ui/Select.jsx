import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "../../lib/utils";

// Inline animations to keep component self-contained
const modernDropdown = {
  transition: {
    type: "spring",
    stiffness: 450,
    damping: 38,
    mass: 0.8
  }
};

const checkmarkAnimation = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", stiffness: 500, damping: 30 }
};

export function Select({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  label,
  disabled,
  className,
  searchable = true,
  theme = "light",
  error,
}) {
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, placement: "bottom" });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = (isInitial = false) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 320; // Estimated max height including search

      const openUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setCoords(prev => ({
        top: rect.bottom + scrollY + 8,
        bottom: (window.innerHeight - rect.top) + 8,
        left: rect.left + scrollX,
        width: rect.width,
        placement: isInitial ? (openUpwards ? "top" : "bottom") : prev.placement,
      }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOnTrigger =
        triggerRef.current && triggerRef.current.contains(event.target);
      const isClickOnDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target);

      if (!isClickOnTrigger && !isClickOnDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updatePosition(true);
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", () => updatePosition(false));
      window.addEventListener("scroll", () => updatePosition(false), true);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", () => updatePosition(false));
      window.removeEventListener("scroll", () => updatePosition(false), true);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    setSearchQuery(""); // Reset search on open
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const filteredOptions = options.filter((opt) =>
    opt?.label?.toLowerCase()?.includes(searchQuery?.toLowerCase()),
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        onChange(filteredOptions[highlightedIndex].value);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      {label && <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={cn(
          "flex items-center justify-between w-full px-4 h-10 text-sm rounded-xl transition-all duration-300 outline-none active:scale-[0.99] border",
          error
            ? isDark
              ? "border-red-500/50 bg-slate-800 text-white ring-4 ring-red-500/10"
              : "border-red-500 bg-red-50/30 ring-4 ring-red-50"
            : isDark
              ? isOpen
                ? "border-indigo-500/30 bg-slate-800 ring-4 ring-indigo-500/10 text-white"
                : "bg-slate-800/40 border-white/10 text-slate-100 hover:bg-slate-700/60"
              : isOpen
                ? "border-indigo-600 bg-white ring-4 ring-indigo-50/70 shadow-sm"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        <span
          className={cn(
            "truncate transition-colors",
            selectedOption
              ? isDark ? "text-white font-black" : "text-slate-900 font-bold"
              : isDark ? "text-slate-400/80 font-bold" : "text-slate-400 font-medium"
          )}
        >
          {selectedOption ? (selectedOption.shortLabel || selectedOption.label) : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-all duration-300 shrink-0",
            isOpen ? "rotate-180" : "rotate-0",
            isDark
              ? isOpen ? "text-blue-400" : "text-slate-500"
              : isOpen ? "text-slate-900" : "text-slate-400"
          )}
        />
      </button>

      {error && (
        <p className={cn(
          "mt-1.5 text-xs font-medium ml-1",
          isDark ? "text-red-400" : "text-red-600"
        )}>
          {error}
        </p>
      )}

      {/* Dropdown Menu via Portal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{
                opacity: 0,
                y: coords.placement === "top" ? 8 : -8,
                scale: 0.98
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: coords.placement === "top" ? 8 : -8,
                scale: 0.98
              }}
              transition={modernDropdown.transition}
              style={{
                position: "fixed",
                top: coords.placement === "bottom" ? coords.top : "auto",
                bottom: coords.placement === "top" ? coords.bottom : "auto",
                left: coords.left,
                width: coords.width,
                zIndex: 99999,
                transformOrigin: coords.placement === "top" ? "bottom center" : "top center",
              }}
              className={cn(
                "border rounded-[1.5rem] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto ring-1",
                isDark
                  ? "bg-slate-800 border-white/10 ring-white/5"
                  : "bg-white border-slate-100 ring-slate-900/3"
              )}
            >
              {/* Search Header (for bottom placement) */}
              {searchable && coords.placement === "bottom" && (
                <div className={cn(
                  "px-3 py-3 border-b sticky top-0 backdrop-blur-md z-10",
                  isDark ? "bg-slate-950/80 border-white/10" : "bg-white/80 border-slate-100/50"
                )}>
                  <div className="relative">
                    <Search size={14} className={cn(
                      "absolute left-3.5 top-1/2 -translate-y-1/2",
                      isDark ? "text-slate-500" : "text-indigo-500"
                    )} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search options..."
                      className={cn(
                        "w-full h-9 pl-9 pr-3 text-xs border rounded-xl focus:outline-none transition-all placeholder:text-slate-400 font-bold",
                        isDark
                          ? "bg-slate-800 border-white/10 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30"
                          : "bg-slate-50/50 text-slate-700 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/40"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus={true}
                    />
                  </div>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto py-1.5 scrollbar-none">
                {filteredOptions.length === 0 ? (
                  <div className="px-4 py-6 text-xs text-slate-400 text-center font-medium">
                    No results found
                  </div>
                ) : (
                  filteredOptions.map((option, index) => {
                    const isSelected = value === option.value;
                    return (
                      <motion.div
                        key={index}
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "flex items-center justify-between px-4 py-2.5 text-[12px] cursor-pointer transition-all group mx-1.5 rounded-xl mb-0.5 last:mb-0",
                          isSelected
                            ? isDark ? "bg-indigo-600 text-white font-black shadow-lg shadow-indigo-600/20" : "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/10"
                            : isDark
                              ? index === highlightedIndex ? "bg-white/10 text-white font-black" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                              : index === highlightedIndex ? "bg-slate-100 text-slate-900 font-black" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-bold flex-1 group-hover:translate-x-0.5 transition-transform duration-200">
                          {option.label}
                        </span>
                        {isSelected && (
                          <motion.div {...checkmarkAnimation}>
                            <Check className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Search Footer (for top placement) */}
              {searchable && coords.placement === "top" && (
                <div className={cn(
                  "px-3 py-3 border-t sticky bottom-0 backdrop-blur-md z-10",
                  isDark ? "bg-slate-950/80 border-white/10" : "bg-white/80 border-slate-100/50"
                )}>
                  <div className="relative">
                    <Search size={14} className={cn(
                      "absolute left-3.5 top-1/2 -translate-y-1/2",
                      isDark ? "text-slate-500" : "text-indigo-500"
                    )} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search options..."
                      className={cn(
                        "w-full h-9 pl-9 pr-3 text-xs border rounded-xl focus:outline-none transition-all placeholder:text-slate-400 font-bold",
                        isDark
                          ? "bg-slate-800 border-white/10 text-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30"
                          : "bg-slate-50/50 text-slate-700 border-slate-200 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400/40"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus={true}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
