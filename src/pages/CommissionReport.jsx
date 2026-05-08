import {
  ArrowUpRight,
  Calendar,
  Percent,
  TrendingUp,
  Clock,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { useState, useRef } from 'react';
import { Select } from '../components/ui/Select';
import { butteryDropdown } from "../lib/animations";
import ClickToCopy from '../components/ui/ClickToCopy';
import { DataTable } from '../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { useClickOutside } from "../hooks/use-click-outside";
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar";

// Service Mapping
const SERVICE_OPTIONS = [
  { label: "All Services", value: "All" },
  { label: "Mobile Recharge", value: "Recharge" },
  { label: "AEPS Payout", value: "AEPS" },
  { label: "DMT Transfer", value: "DMT" },
  { label: "Bill Payment", value: "Bill" },
];

// Mock Data
const COMMISSION_LOGS = [
  {
    id: 1,
    txnId: "COMM829102",
    receivedDate: "16 Feb 2026 05:00 PM",
    type: "Recharge",
    commission: 12.50,
    tds: 0.62,
    net: 11.88,
    currentBalance: 1013.88,
    description: "Commission for Jio Recharge TXN-38291"
  },
  {
    id: 2,
    txnId: "COMM829103",
    receivedDate: "16 Feb 2026 04:30 PM",
    type: "AEPS",
    commission: 8.00,
    tds: 0.40,
    net: 7.60,
    currentBalance: 1002.00,
    description: "Commission for AEPS Withdrawal TXN-38295"
  }
];

const StatCard = ({ title, value, icon: Icon, trend, color, type }) => {
  const styles = {
    indigo: { bg: "bg-indigo-100/50", icon: "text-indigo-600", border: "border-indigo-200/70", text: "text-indigo-700", gradient: "from-white to-indigo-50/50" },
    rose: { bg: "bg-rose-100/50", icon: "text-rose-600", border: "border-rose-200/70", text: "text-rose-700", gradient: "from-white to-rose-50/50" },
    emerald: { bg: "bg-emerald-100/50", icon: "text-emerald-600", border: "border-emerald-200/70", text: "text-emerald-700", gradient: "from-white to-emerald-50/50" },
    amber: { bg: "bg-amber-100/50", icon: "text-amber-600", border: "border-amber-200/70", text: "text-amber-700", gradient: "from-white to-amber-50/50" }
  }[color] || { bg: "bg-slate-100", icon: "text-slate-600", border: "border-slate-100", text: "text-slate-700", gradient: "from-white to-slate-50" };

  return (
    <motion.div
      className={cn(
        "p-6 rounded-[2rem] bg-gradient-to-tr border-1 shadow-sm transition-all duration-300 relative group overflow-hidden",
        styles.gradient,
        styles.border
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-2xl bg-white shadow-sm border border-slate-100 transition-transform group-hover:scale-110 duration-500", styles.icon)}>
            <Icon size={20} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">{title}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">System Node Status: Active</p>
          </div>
        </div>
        <div className={cn("px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest", styles.bg, styles.text, styles.border)}>
          Monthly
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h4 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{value}</h4>
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", trend === 'up' ? "bg-emerald-500" : "bg-rose-500")} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commission Logic Active</span>
          </div>
        </div>
        <div className={cn("w-10 h-10 rounded-full border flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity duration-500", styles.border)}>
          <ArrowUpRight size={18} className={cn(trend === 'down' && "rotate-90", styles.icon)} />
        </div>
      </div>
    </motion.div>
  );
};

export default function CommissionReport() {
  const [filters, setFilters] = useState({
    search: ''
  });
  const [serviceFilter, setServiceFilter] = useState("All");
  const [date, setDate] = useState({ from: null, to: null });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const [columnVisibility, setColumnVisibility] = useState({});
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useClickOutside(calendarRef, () => setIsCalendarOpen(false));

  const columns = [
    {
      header: "SR. No.",
      accessorKey: "id",
      center: true,
      className: "w-16",
      cell: ({ row }) => <span className="text-xs font-bold text-slate-500">{row.index + 1}</span>
    },
    {
      header: "TXN IDENTITY",
      accessorKey: "txnId",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <ClickToCopy text={row.original.txnId}>
            <span className="text-[13px] font-bold text-slate-900 leading-none">
              {row.original.txnId}
            </span>
          </ClickToCopy>
          <span className={cn(
            "w-fit px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border",
            row.original.type === 'Recharge' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
          )}>
            {row.original.type}
          </span>
        </div>
      )
    },
    {
      header: "EARNINGS (₹)",
      accessorKey: "commission",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-[13px] font-black text-slate-900 leading-none">₹{row.original.commission.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">TDS: -₹{row.original.tds.toFixed(2)}</p>
        </div>
      )
    },
    {
      header: "NET IMPACT",
      accessorKey: "net",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-[15px] font-black text-emerald-600 tracking-tighter leading-none">₹{row.original.net.toFixed(2)}</p>
          <p className="text-[10px] font-bold text-slate-400 tracking-tight uppercase">Bal: ₹{row.original.currentBalance.toFixed(2)}</p>
        </div>
      )
    },
    {
      header: "DESCRIPTION",
      accessorKey: "description",
      cell: ({ row }) => <p className="text-xs font-bold text-slate-500 max-w-[250px] leading-relaxed bottom-2">{row.original.description}</p>
    },
    {
      header: "DATE & TIME",
      accessorKey: "receivedDate",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="text-[13px] font-bold text-slate-900 leading-none">{row.original.receivedDate.split(' ').slice(0, 3).join(' ')}</p>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{row.original.receivedDate.split(' ').slice(3).join(' ')}</p>
        </div>
      )
    }
  ];

  const actions = (
    <div className="relative z-[100] flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
      {/* Service Selection Node */}
      <div className="flex-1 sm:flex-none sm:min-w-[160px]">
        <Select
          placeholder="Select Service"
          options={SERVICE_OPTIONS}
          value={serviceFilter}
          onChange={setServiceFilter}
          className="!h-10 !rounded-full !bg-white border-slate-200 shadow-sm !text-[11px] !font-black !tracking-widest"
        />
      </div>

      {/* Interactive Date Portal */}
      <div className="relative" ref={calendarRef}>
        <div
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={cn(
            "h-10 px-6 bg-white border border-slate-200/60 rounded-full flex items-center gap-3 text-[13px] font-bold text-slate-500 transition-all duration-300 cursor-pointer shadow-sm select-none hover:border-indigo-300 hover:bg-slate-50/50",
            isCalendarOpen && "border-indigo-500 ring-4 ring-indigo-500/10 text-indigo-600"
          )}
        >
          <Calendar size={16} className={cn("transition-colors", isCalendarOpen ? "text-indigo-600" : "text-slate-400")} />
          <span className="whitespace-nowrap">
            {date.from ? (
              date.to ? (
                <>{format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}</>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              "Pick a date range"
            )}
          </span>
          <ChevronDown size={14} className={cn("transition-transform duration-500 ml-1", isCalendarOpen ? "rotate-180 text-indigo-600" : "text-slate-300")} />
        </div>

        <AnimatePresence>
          {isCalendarOpen && !isMobile && (
            <motion.div
              {...butteryDropdown}
              className="absolute right-0 top-full mt-2 z-[9999] origin-top-right shadow-2xl rounded-3xl border border-slate-100 bg-white overflow-hidden ring-1 ring-slate-900/[0.03]"
            >
              <CustomDualCalendar
                date={date}
                setDate={setDate}
                onApply={() => setIsCalendarOpen(false)}
                onReset={() => {
                  setDate({ from: null, to: null });
                  setIsCalendarOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Calendar Bridge */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {isCalendarOpen && isMobile && (
              <div className="fixed inset-0 z-[1000] lg:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsCalendarOpen(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 shadow-2xl"
                >
                  <CustomDualCalendar
                    date={date}
                    setDate={setDate}
                    onApply={() => setIsCalendarOpen(false)}
                    onReset={() => {
                      setDate({ from: null, to: null });
                      setIsCalendarOpen(false);
                    }}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );

  const filteredLogs = COMMISSION_LOGS.filter(log => {
    const matchesService = serviceFilter === "All" || log.type === serviceFilter;
    const matchesSearch = log.txnId.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.type.toLowerCase().includes(filters.search.toLowerCase());

    // Date filtering logic (if date.from and date.to are set)
    const logDate = new Date(log.receivedDate);
    const fromDate = date.from ? new Date(date.from) : null;
    const toDate = date.to ? new Date(date.to) : null;

    const matchesDate = (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);

    return matchesService && matchesSearch && matchesDate;
  });

  return (
    <PageLayout
      title="Commission Report"
      subtitle="Summarizing your total earnings and distributions"
      actions={actions}
      className="max-w-[1600px] mx-auto py-4"
    >

      {/* 2. Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        <StatCard title="Gross Earnings" value="₹ 4,250.00" icon={ArrowUpRight} trend="up" color="indigo" />
        <StatCard title="TDS Deductions" value="₹ 212.50" icon={Percent} trend="down" color="rose" />
        <StatCard title="Net Profit" value="₹ 4,037.50" icon={TrendingUp} trend="up" color="emerald" />
        <StatCard title="Pending Payout" value="₹ 1,200.00" icon={Clock} trend="up" color="amber" />
      </div>
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Earnings Distribution Logs</h2>
        </div>
        <DataTable
          fileName="commission_report"
          searchPlaceholder="Search earnings..."
          searchValue={filters.search}
          searchChange={(e) => setFilters({ ...filters, search: e.target.value })}
          columns={columns}
          data={filteredLogs}
          isLoading={false}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          totalRecords={filteredLogs.length}
          pageSize={10}
        />
      </div>
    </PageLayout>
  );
}
