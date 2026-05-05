import React, { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addDays, startOfDay } from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const MonthGrid = ({ monthDate, selectedRange, onDateSelect, onPrevMonth, onNextMonth, showNavPrev, showNavNext }) => {
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

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 w-full sm:w-[260px] border border-slate-100">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="w-8 h-8 flex items-center justify-center">
          {showNavPrev && (
            <button onClick={onPrevMonth} className="text-slate-400 hover:text-slate-900 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <h3 className="font-semibold text-sm text-slate-900">
          {format(monthDate, "MMMM yyyy")}
        </h3>
        <div className="w-8 h-8 flex items-center justify-center">
          {showNavNext && (
            <button onClick={onNextMonth} className="text-slate-400 hover:text-slate-900 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-medium text-slate-400 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d} className="h-6 sm:h-8 flex items-center justify-center">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-xs sm:text-sm">
        {weeks.map((week, wIndex) => (
          <React.Fragment key={wIndex}>
            {week.map((day, dIndex) => {
              const isSelectedStart = selectedRange?.from && isSameDay(day, selectedRange.from);
              const isSelectedEnd = selectedRange?.to && isSameDay(day, selectedRange.to);
              const isSelected = isSelectedStart || isSelectedEnd;
              const isInRange = selectedRange?.from && selectedRange?.to && isWithinInterval(day, { start: selectedRange.from, end: selectedRange.to });
              const isCurrentMonth = isSameMonth(day, monthDate);

              const fromDate = selectedRange?.from ? startOfDay(selectedRange.from) : null;
              const isFutureDate = startOfDay(day) > startOfDay(new Date());
              const isMaxRangeExceeded = fromDate && !selectedRange?.to &&
                (startOfDay(day) > addDays(addMonths(fromDate, 3), -1) || startOfDay(day) < addDays(subMonths(fromDate, 3), 1));
              const isDisabled = isMaxRangeExceeded || isFutureDate;

              return (
                <div key={dIndex} className="relative p-0 flex items-center justify-center h-8 sm:h-9">
                  {isInRange && !isSelectedStart && !isSelectedEnd && (
                    <div className="absolute inset-0 bg-blue-50/50 z-0 h-full" />
                  )}
                  {(isSelectedStart && selectedRange.to) && (
                    <div className="absolute top-0 bottom-0 right-0 left-1/2 bg-blue-50/50 z-0 h-full" />
                  )}
                  {(isSelectedEnd && selectedRange.from) && (
                    <div className="absolute top-0 bottom-0 left-0 right-1/2 bg-blue-50/50 z-0 h-full" />
                  )}

                  {isCurrentMonth && (
                    <button
                      disabled={isDisabled}
                      onClick={() => onDateSelect(day)}
                      className={cn(
                        "relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full mx-auto text-xs sm:text-xs transition-all z-10",
                        !isSelected && !isDisabled && "text-slate-600 hover:bg-slate-100",
                        isSelected && "bg-blue-600 text-white shadow-md shadow-blue-200 font-medium hover:bg-blue-700",
                        isInRange && !isSelected && !isDisabled && "text-blue-600 font-medium bg-transparent",
                        isDisabled && "opacity-40 cursor-not-allowed text-slate-400 bg-transparent"
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

export function CustomDualCalendar({ date, setDate, onApply, onReset }) {
  const [activePreset, setActivePreset] = useState("last7");
  const [leftMonth, setLeftMonth] = useState(new Date());
  const [rightMonth, setRightMonth] = useState(addMonths(new Date(), 1));


  const handlePrevMonth = () => {
    setLeftMonth(prev => subMonths(prev, 1));
    setRightMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setLeftMonth(prev => addMonths(prev, 1));
    setRightMonth(prev => addMonths(prev, 1));
  };

  const onDateSelect = (day) => {
    if (date?.from && date?.to) {
      // Reset if both selected, start new range
      setDate({ from: day, to: undefined });
    } else if (date?.from && !date?.to) {
      const newFrom = day < date.from ? day : date.from;
      const newTo = day < date.from ? date.from : day;

      const fromDay = startOfDay(newFrom);
      const toDay = startOfDay(newTo);

      // Limit the date range to exactly 3 calendar months (e.g., Dec 1 to Feb 28)
      if (toDay > addDays(addMonths(fromDay, 3), -1)) {
        toast.error("You can only filter reports for a maximum of 3 months at a time.");
        return; // Do not update state if maximum duration exceeded
      }

      setDate({ from: newFrom, to: newTo });
    } else {
      setDate({ from: day, to: undefined });
    }
    setActivePreset("custom"); // Select custom preset when manually picking
  };

  const presets = [
    { id: "today", label: "Today", action: () => setDate({ from: new Date(), to: new Date() }) },
    {
      id: "yesterday", label: "Yesterday", action: () => {
        const yesterday = addDays(new Date(), -1);
        setDate({ from: yesterday, to: yesterday });
      }
    },
    {
      id: "last7", label: "Last 7 Days", action: () => {
        const end = new Date();
        const start = addDays(end, -6);
        setDate({ from: start, to: end });
      }
    },
    {
      id: "thisMonth", label: "This Month", action: () => {
        const now = new Date();
        const start = startOfMonth(now);
        setDate({ from: start, to: now });
      }
    },
    {
      id: "custom", label: "Custom", action: () => {
        setDate({ from: undefined, to: undefined });
      }
    },
  ];

  return (
    <div className="flex flex-col bg-white max-w-[100vw] overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="order-1 lg:order-2 w-full lg:w-auto min-w-[140px] p-3 sm:p-4 lg:p-6 flex flex-col gap-2 sm:gap-3 border-b lg:border-b-0 lg:border-l border-slate-100 bg-slate-50">
          <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none max-w-[85vw] sm:max-w-none">
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => {
                  preset.action();
                  setActivePreset(preset.id);
                }}
                className={cn(
                  "px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm border whitespace-nowrap lg:w-full",
                  activePreset === preset.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-blue-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="order-2 lg:order-1 flex flex-col md:flex-row p-3 sm:p-4 gap-4 sm:gap-6 bg-white overflow-y-auto max-h-[65vh] lg:max-h-none justify-start pt-2 sm:pt-4 items-center md:items-start">
          <MonthGrid
            monthDate={leftMonth}
            selectedRange={date}
            onDateSelect={onDateSelect}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            showNavPrev={true}
            showNavNext={false}
          />
          <MonthGrid
            monthDate={rightMonth}
            selectedRange={date}
            onDateSelect={onDateSelect}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            showNavPrev={false}
            showNavNext={true}
          />
        </div>
      </div>

      {/* Apply / Reset Actions */}
      <div className="flex items-center justify-end gap-3 p-3 px-5 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onReset}
          className="border-slate-200 text-slate-500 hover:bg-slate-100 px-5 h-9 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all border bg-white"
        >
          Reset
        </button>
        <button
          onClick={onApply}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9 rounded-xl font-bold text-[11px] uppercase tracking-wide shadow-md shadow-blue-600/20 transition-all"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
