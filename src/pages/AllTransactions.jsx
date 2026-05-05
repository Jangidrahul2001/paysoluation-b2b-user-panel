import React, { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { format, set } from "date-fns";
import { useClickOutside } from "../hooks/use-click-outside";
import { butteryDropdown } from "../lib/animations";
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar";
import {
  Search,
  RotateCcw,
  History,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  ChevronDown,
  Calendar as CalendarIcon,
  X,
  CreditCard,
  Zap,
  Phone,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Hash,
  AlertCircle,
  Eye,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { DataTable } from "../components/ui/DataTable";
import { TableActions } from "../components/ui/TableExportActions";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import { cn } from "../lib/utils";
import { formatDate, formatToINR, handleValidationError, } from "../utils/helperFunction";
import { toast } from "sonner";



export default function AllTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState([])
  // const [pageIndex, setPageIndex] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  // const [statusFilter, setStatusFilter] = useState("All");
  // const [serviceFilter, setServiceFilter] = useState("All");
  const [columnVisibility, setColumnVisibility] = useState({});
  const searchInputRef = useRef(null);
  // const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  // const [date, setDate] = useState({ from: null, to: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const calendarRef = useRef(null);
  // useClickOutside(calendarRef, () => setIsCalendarOpen(false), "#mobile-calendar-portal");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  const { refetch: fetchTransactions } = useFetch(
    `${apiEndpoints.transactionSearch}?referenceId=${searchTerm}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data);
          setTransactions(data.data || []);
          setIsLoading(false)
        }
      },
      onError: (error) => {
        setIsLoading(false)
        console.log("error in transaction fetch data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );


  // const {
  //   data: txnData,
  //   loading: isLoading,
  //   refetch,
  // } = useFetch(
  //   `${apiEndpoints.transactionSearch}?page=${pageIndex}&limit=${pageSize}&search=${searchTerm}&status=${statusFilter === "All" ? "" : statusFilter}&service=${serviceFilter === "All" ? "" : serviceFilter}`,
  //   {},
  //   true
  // );

  const handleReset = () => {
    setSearchTerm("")
    setTransactions([])
    // setSearchTerm("");
    // setStatusFilter("All");
    // setServiceFilter("All");
    // setDate({ from: null, to: null });
    // setPageIndex(1);
    // refetch();
  };

  const handleSearch = () => {
    setIsLoading(true)
    fetchTransactions()
    // setPageIndex(1);
    // refetch();
  };



  // Detailed Transaction Card Component
  const TransactionCard = ({ txn, index }) => {
    const status = txn.status?.toLowerCase() || "pending";
    const config = {
      success: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/50", dot: "bg-emerald-500", label: "SUCCESS" },
      failed: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200/50", dot: "bg-rose-500", label: "FAILED" },
      pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/50", dot: "bg-amber-500", label: "PENDING" },
    }[status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200/50", dot: "bg-slate-500", label: "ENTRY" };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative bg-white rounded-[2rem] border border-slate-200 p-7 mb-6 shadow-sm transition-all duration-500"
      >
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1 space-y-5">
            {/* Top row: Status & ID */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                config.bg, config.text, config.border
              )}>
                {config.label}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-slate-50 text-[10px] font-black text-slate-500 border border-slate-200 font-mono tracking-widest">
                ID: {txn.referenceId || ""}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-slate-50 text-[10px] font-black text-slate-600 border border-slate-100/50 flex items-center gap-2 uppercase tracking-widest">
                <Calendar size={12} className="text-slate-300" />
                {formatDate(txn.createdAt)}
              </span>
            </div>

            {/* Middle row: Service Info */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Service: <span className="text-slate-900">{txn.serviceType || ""}</span>
              </div>
              {txn.category &&
                <div className="px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Category: <span className="text-slate-700">{txn.category || ""}</span>
                </div>
              }
            </div>
          </div>

          {/* Right Section: Status & Amount */}
          <div className="flex flex-col items-end gap-1.5 md:min-w-[140px]">
            <div className="px-4 py-1.5 rounded-full border border-slate-100/80 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2.5 bg-slate-50/20">
              <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm", config.dot)} />
              {status}
            </div>
            <h3 className="text-[28px] font-black text-slate-900 tracking-tight leading-none mt-2 tabular-nums">
              {formatToINR(txn.amount || 0)}
            </h3>
          </div>
        </div>

        {/* Info Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {/* Merchant Details */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100/80 rounded-[2rem] p-5 space-y-3.5 transition-all shadow-sm shadow-indigo-100/20">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
              Merchant Details
            </h4>
            <div className="space-y-3">
              <p className="text-[12px] font-bold text-slate-900 flex items-center justify-between">
                <span className="text-slate-400 font-medium tracking-tight">Mobile</span>
                <span>{txn.phone || "--"}</span>
              </p>
              <p className="text-[12px] font-bold text-slate-900 flex items-center justify-between gap-4">
                <span className="text-slate-400 font-medium tracking-tight">Email</span>
                <span className="truncate max-w-[150px] text-right text-indigo-900" title={txn.email || "--"}>
                  {txn.email || "--"}
                </span>
              </p>
            </div>
          </div>

          {/* Account */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/80 rounded-[2rem] p-5 space-y-3.5 transition-all shadow-sm shadow-emerald-100/20">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
              Account
            </h4>
            <div className="h-[60px] flex flex-col justify-center">
              <p className="text-[15px] font-black text-slate-900 tracking-wider font-mono">{txn.account || "---"}</p>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Beneficiary Node</p>
            </div>
          </div>

          {/* Bank UTR */}
          <div className="bg-gradient-to-br from-sky-50/80 to-white border border-sky-100/80 rounded-[2rem] p-5 space-y-3.5 transition-all shadow-sm shadow-sky-100/20">
            <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.3)]" />
              Bank UTR
            </h4>
            <div className="h-[60px] flex flex-col justify-center">
              <p className="text-[15px] font-black text-slate-900 tracking-wider font-mono">{txn.utr || txn.bankUtr || "---"}</p>
              <p className="text-[9px] font-bold text-sky-500 uppercase tracking-widest mt-1">Network Ref</p>
            </div>
          </div>

          {/* Remark */}
          <div className="bg-gradient-to-br from-amber-50/80 to-white border border-amber-100/80 rounded-[2rem] p-5 space-y-3.5 transition-all shadow-sm shadow-amber-100/20">
            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
              Remark
            </h4>
            <div className="h-[60px] flex flex-col justify-center">
              <p className={cn(
                "text-[12px] font-bold leading-relaxed",
                txn.error ? "text-rose-600 font-black" : "text-amber-700"
              )}>
                {txn.description || "Process completed successfully."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PageLayout
      title="Smart Transaction Search"
      subtitle="Search a single transaction from your user panel."
      // actions={
      //   <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      //     {/* Service Dropdown */}
      //     <div className="flex-1 sm:flex-none sm:w-[160px] min-w-[140px]">
      //       <Select
      //         options={[
      //           { label: "All Services", value: "All" },
      //           { label: "Mobile Recharge", value: "Recharge" },
      //           { label: "DTH Recharge", value: "DTH" },
      //           { label: "Bill Payment", value: "BBPS" },
      //           { label: "Money Transfer", value: "DMT" },
      //           { label: "AEPS Withdrawal", value: "AEPS" },
      //         ]}
      //         value={serviceFilter}
      //         onChange={(val) => setServiceFilter(val)}
      //         placeholder="Service"
      //         className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
      //       />
      //     </div>

      //     {/* Status Dropdown */}
      //     <div className="flex-1 sm:flex-none sm:w-[150px] min-w-[130px]">
      //       <Select
      //         options={[
      //           { label: "All Status", value: "All" },
      //           { label: "Success", value: "SUCCESS" },
      //           { label: "Pending", value: "PENDING" },
      //           { label: "Failed", value: "FAILED" },
      //         ]}
      //         value={statusFilter}
      //         onChange={(val) => setStatusFilter(val)}
      //         placeholder="Select Filter"
      //         className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
      //       />
      //     </div>

      //     {/* Date Picker Trigger */}
      //     <div className="relative w-full sm:w-auto" ref={calendarRef}>
      //       <div
      //         onClick={() => setIsCalendarOpen(!isCalendarOpen)}
      //         className={cn(
      //           "h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-indigo-500/50 hover:bg-slate-50 transition-all group select-none",
      //           !date?.from && "text-slate-400",
      //           isCalendarOpen && "border-indigo-500 ring-4 ring-indigo-500/10"
      //         )}
      //       >
      //         <div className="flex items-center gap-2.5">
      //           <CalendarIcon className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
      //           <span className="whitespace-nowrap">
      //             {date?.from ? (
      //               date.to ? (
      //                 <>
      //                   {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
      //                 </>
      //               ) : (
      //                 format(date.from, "LLL dd, y")
      //               )
      //             ) : (
      //               "Pick a date range"
      //             )}
      //           </span>
      //         </div>
      //         <ChevronDown className={cn(
      //           "w-3.5 h-3.5 transition-all duration-300 ml-1",
      //           isCalendarOpen ? "rotate-180 text-indigo-600" : "text-slate-300"
      //         )} />
      //       </div>

      //       <AnimatePresence>
      //         {isCalendarOpen && !isMobile && (
      //           <motion.div
      //             {...butteryDropdown}
      //             className="absolute right-0 top-full mt-2 z-[9999] origin-top-right shadow-2xl rounded-2xl border border-slate-100 bg-white overflow-hidden ring-1 ring-slate-200/50 hidden sm:block"
      //             style={{ width: "max-content", maxWidth: "94vw" }}
      //           >
      //             <CustomDualCalendar
      //               date={date}
      //               setDate={setDate}
      //               onApply={() => setIsCalendarOpen(false)}
      //               onReset={() => {
      //                 setDate({ from: null, to: null });
      //                 setIsCalendarOpen(false);
      //               }}
      //             />
      //           </motion.div>
      //         )}
      //       </AnimatePresence>

      //       {/* Mobile Calendar Portal */}
      //       {createPortal(
      //         <AnimatePresence>
      //           {isCalendarOpen && isMobile && (
      //             <div id="mobile-calendar-portal" className="fixed inset-0 z-[99999] sm:hidden">
      //               <motion.div
      //                 initial={{ opacity: 0 }}
      //                 animate={{ opacity: 1 }}
      //                 exit={{ opacity: 0 }}
      //                 onClick={() => setIsCalendarOpen(false)}
      //                 className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      //               />
      //               <motion.div
      //                 initial={{ y: "100%" }}
      //                 animate={{ y: 0 }}
      //                 exit={{ y: "100%" }}
      //                 transition={{ type: "spring", damping: 22, stiffness: 350, mass: 0.5 }}
      //                 className="absolute bottom-0 left-0 right-0 bg-white overflow-hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] origin-bottom"
      //               >
      //                 <CustomDualCalendar
      //                   date={date}
      //                   setDate={setDate}
      //                   onApply={() => setIsCalendarOpen(false)}
      //                   onReset={() => {
      //                     setDate({ from: null, to: null });
      //                     setIsCalendarOpen(false);
      //                   }}
      //                 />
      //               </motion.div>
      //             </div>
      //           )}
      //         </AnimatePresence>,
      //         document.body
      //       )}
      //     </div>
      //   </div>
      // }
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="flex flex-col gap-6">

        {/* --- Top Master Search Section: Minimalist Downsized --- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm relative overflow-hidden"
        >
          {/* Decorative Corner Element */}
          <div className="absolute top-6 right-8 flex">
            <div className="w-10 h-10 rounded-full bg-indigo-50/60 border border-indigo-100 flex items-center justify-center shadow-sm relative group cursor-default">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-xl group-hover:blur-2xl transition-all" />
              <Zap size={18} fill="currentColor" className="opacity-80 text-indigo-600" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-5">
            {/* Header: Title and Sub-label */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                Find Transactions
              </h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                SEARCH ANYTHING
              </p>
            </div>

            {/* Input Row: Label + Input + Actions */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 opacity-60">
                SEARCH
              </label>

              <div className="flex flex-col lg:flex-row items-stretch gap-3">
                <div className="relative group flex-1">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
                    <Search size={16} className="text-slate-300 group-focus-within:text-indigo-600 transition-all duration-300" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Reference ID, Mobile Number or Bank UTR..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full h-11 bg-white border border-slate-200 rounded-2xl pl-12 pr-24 text-[13px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all shadow-sm"
                  />


                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSearch}
                    className="h-11 px-8 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-950 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3 rounded-2xl border-none min-w-[140px]"
                  >
                    <Search size={14} className="stroke-[3px]" />
                    SEARCH
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="h-11 px-6 bg-white border border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all flex items-center gap-2.5 rounded-2xl group min-w-[120px]"
                  >
                    <RotateCcw size={14} className="stroke-[3px] group-hover:rotate-[-90deg] transition-transform duration-500" />
                    RESET
                  </Button>

                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- Results Section --- */}
        <div className="flex flex-col gap-4">
          {/* <div className="px-6 flex items-center justify-between mb-4 mt-2">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.25)]" />
              <div>
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Recent Activity</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-2">
                  Found <span className="text-slate-600 font-black">{transactions.length}</span> matches in current filter
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="h-10 px-4 flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 transition-all active:scale-95"
              >
                <div className={cn("transition-transform duration-700", isLoading && "rotate-180")}>
                  <RotateCcw size={14} />
                </div>
                Refresh
              </button>
            </div>
          </div> */}

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin mb-4" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Data...</p>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((txn, idx) => (
                <TransactionCard key={txn.id || idx} txn={txn} index={idx} />
              ))
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <h4 className="text-[13px] font-bold text-slate-900 mt-4">Search results will appear here</h4>
                  <p className="text-[10px] font-medium text-slate-400 max-w-[240px] text-center mt-1">Use the search bar above to find specific transactions by ID or Mobile number.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
