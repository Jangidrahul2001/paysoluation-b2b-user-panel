import React, { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfDay, getYear, setYear, setMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const MonthGrid = ({ monthDate, selectedDate, onDateSelect, onPrevMonth, onNextMonth, setViewMonth }) => {
  const [selectorType, setSelectorType] = useState(null); // 'month', 'year', null

  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weeks = [];
  let week = [];
  days.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="bg-white rounded-2xl p-2 w-[280px] relative overflow-hidden mx-auto">
      {/* Selector Overlays */}
      <AnimatePresence mode="wait">
        {selectorType === 'month' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[60] bg-white p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Month</span>
              <button onClick={() => setSelectorType(null)} className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">BACK</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((m, i) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setViewMonth(setMonth(monthDate, i)); setSelectorType(null); }}
                  className={cn(
                    "h-10 rounded-xl text-[12px] font-bold transition-all border",
                    monthDate.getMonth() === i
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectorType === 'year' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[60] bg-white p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Year</span>
              <button onClick={() => setSelectorType(null)} className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">BACK</button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {years.map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => { setViewMonth(setYear(monthDate, y)); setSelectorType(null); }}
                  className={cn(
                    "h-10 rounded-xl text-[12px] font-bold transition-all border",
                    getYear(monthDate) === y
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-indigo-200"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4 px-1 gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all shrink-0 active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Unified Navigation Pod */}
        <div className="flex items-center flex-1 justify-center">
          <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-100/50 rounded-xl p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectorType('month')}
              className="px-3 py-1 hover:bg-white hover:shadow-sm rounded-lg transition-all group flex items-center gap-1.5 active:scale-95"
            >
              <span className="text-[12.5px] font-black text-slate-800 tracking-tight">
                {format(monthDate, "MMMM")}
              </span>
              <ChevronDown size={10} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </button>

            <div className="h-4 w-[1px] bg-slate-200/60 mx-0.5" />

            <button
              type="button"
              onClick={() => setSelectorType('year')}
              className="px-3 py-1 hover:bg-white hover:shadow-sm rounded-lg transition-all group flex items-center gap-1.5 active:scale-95"
            >
              <span className="text-[12.5px] font-black text-slate-800 tracking-tight">
                {getYear(monthDate)}
              </span>
              <ChevronDown size={10} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all shrink-0 active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 opacity-60">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="h-6 flex items-center justify-center">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 text-center px-1">
        {weeks.map((week, wIndex) => (
          <React.Fragment key={wIndex}>
            {week.map((day, dIndex) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthDate);
              const isFutureDate = startOfDay(day) > startOfDay(new Date());

              const isDisabled = !isCurrentMonth || isFutureDate;

              return (
                <div key={dIndex} className="relative p-0 flex items-center justify-center h-8">
                  {isCurrentMonth && (
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => onDateSelect(day)}
                      className={cn(
                        "relative w-7 h-7 flex items-center justify-center rounded-full text-[11px] transition-all z-10 font-bold",
                        !isSelected && !isDisabled && "text-slate-600 hover:bg-slate-50 hover:text-indigo-600",
                        isSelected && "ring-1 ring-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-sm",
                        isDisabled && "opacity-20 cursor-not-allowed text-slate-300 pointer-events-none"
                      )}
                    >
                      {format(day, "d")}
                    </button>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export function CustomSingleCalendar({ selectedDate, onDateSelect, onReset }) {
  const [viewMonth, setViewMonth] = useState(selectedDate || new Date());

  const handlePrevMonth = (e) => {
    e.preventDefault(); e.stopPropagation();
    setViewMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault(); e.stopPropagation();
    setViewMonth(prev => addMonths(prev, 1));
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden rounded-[1.2rem] shadow-xl border border-slate-200/60 ring-1 ring-slate-950/[0.03] w-fit">
      <div className="p-3 bg-white">
        <MonthGrid
          monthDate={viewMonth}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          setViewMonth={setViewMonth}
        />
      </div>

      <div className="flex items-center justify-between p-2.5 px-4 border-t border-slate-50 bg-slate-50/30">
        <button
          type="button"
          onClick={onReset}
          className="text-slate-400 hover:text-red-500 font-black text-[9px] uppercase tracking-widest transition-colors"
        >
          CLEAR
        </button>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          {selectedDate ? format(selectedDate, "dd MMM yyyy") : "No Date"}
        </p>
      </div>
    </div>
  );
}
