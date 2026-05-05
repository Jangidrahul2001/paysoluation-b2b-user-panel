import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SelectSimple = ({ className, label, name, options = [], placeholder = "Select an option", value, onChange, error, required, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (isOpen) {
      const index = options.findIndex(opt => opt.value === value);
      setFocusedIndex(index >= 0 ? index : 0);
    }
  }, [isOpen, value, options]);

  const handleSelect = (optionValue) => {
    const event = {
      target: {
        name: name,
        value: optionValue
      }
    };
    onChange(event);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!isOpen && onOpen) {
      onOpen();
    }
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      setIsOpen(false);
      return;
    }

    if (!isOpen) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (onOpen) onOpen();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          handleSelect(options[focusedIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (isOpen && listRef.current && focusedIndex >= 0) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [focusedIndex, isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && <label className="text-xs font-black text-slate-700 uppercase tracking-tight ml-0.5">{label} {required && <span className="text-slate-500">*</span>}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm transition-all duration-200 outline-none",
            error ? "border-indigo-500 focus:ring-indigo-50" : "focus:ring-2 focus:ring-slate-100 focus:border-indigo-500",
            isOpen ? "ring-2 ring-slate-100 border-indigo-500 shadow-sm" : "hover:border-slate-200",
            !selectedOption ? "text-slate-300" : "text-slate-700 font-medium",
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown size={14} className={cn("shrink-0 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50"
            >
              <div ref={listRef}>
                {options.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-slate-400 font-medium">No options found.</div>
                ) : (
                  options.map((option, index) => (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "relative flex w-full cursor-pointer select-none items-center rounded-xl py-2.5 px-3 text-xs outline-none transition-all hover:bg-slate-50 hover:text-indigo-600 focus:bg-indigo-50",
                        option.value === value ? "bg-slate-50 font-bold text-indigo-600" : "text-slate-600",
                        index === focusedIndex ? "bg-slate-50 text-indigo-600" : ""
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      {option.value === value && (
                        <span className="absolute right-3 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
    </div>
  );
};

export { SelectSimple };
