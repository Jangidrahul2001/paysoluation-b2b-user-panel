import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  Wallet,
  Zap,
  Search,
  Fingerprint,
  ArrowLeftRight,
  Calendar as CalendarIcon,
  ChevronDown,
  RotateCcw,
  IndianRupee,

} from "lucide-react";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { TableActions } from "../components/ui/TableExportActions";
import { Select } from "../components/ui/Select";
import { PageLayout } from "../components/layout/PageLayout";
import { toast } from "sonner";
import { usePatch } from "../hooks/usePatch";
import { apiEndpoints } from "../api/apiEndpoints";
import {
  formatDateForBackend,
  formatDate,
  formatNumberInput,
  formatToINR,
  handleValidationError,
} from "../utils/helperFunction";
import { useFetch } from "../hooks/useFetch";
import { useDispatch, useSelector } from "react-redux";
import { fetchWallet } from "../store/slices/walletSlice";
import { cn } from "../lib/utils";
import { useClickOutside } from "../hooks/use-click-outside";
import { butteryDropdown } from "../lib/animations";
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar";
import ClickToCopy from "../components/ui/ClickToCopy";
import StatusBadge from "../components/ui/StatusBadge";
import { Input } from "../components/ui/Input";




export default function WalletTransfer() {
  const dispatch = useDispatch();
  const { data: wallet, loading: walletLoading } = useSelector((state) => state.wallet);
  const [formData, setFormData] = useState({ amount: "" });
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [txnType, setTxnType] = useState("All");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState({ from: null, to: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const calendarRef = useRef(null);

  useClickOutside(calendarRef, () => setIsCalendarOpen(false), "#mobile-calendar-portal");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Replicating original fetch signature exactly to avoid 404 if server is sensitive to URL construction
  const {
    data: txnData,
    refetch: refetchWalletTransferHistory,
  } = useFetch(
    `${apiEndpoints.walletTransferHistory}?page=${pageIndex}&limit=${pageSize}&search=${searchTerm}&from=${formatDateForBackend(date?.from)}&to=${formatDateForBackend(date?.to)}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setTransactions(data.data || []);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.log("error in fetching wallet transfer data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  useEffect(() => {
    refetchWalletTransferHistory();
  }, [pageIndex, pageSize, searchTerm, date, refetchWalletTransferHistory]);

  const handleReset = () => {
    setDate({ from: null, to: null });
    setSearchTerm("");
    setPageIndex(1);
    refetchWalletTransferHistory();
  };

  const handleSearch = () => {
    setPageIndex(1);
    refetchWalletTransferHistory();
  };

  const { patch: aepsToMainWalletTransfer, loading: isProcessing } = usePatch({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        setFormData({ amount: "" });
        refetchWalletTransferHistory();
        dispatch(fetchWallet());
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const handleTransfer = () => {
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(formData?.amount) > parseFloat(wallet?.aepsWallet - wallet?.aepsHoldAmount)) {
      toast.error("Amount must be less than wallet balance");
      return;
    }

    aepsToMainWalletTransfer(
      `${apiEndpoints.aepsToMainWalletTransfer}`,
      formData,
    );
  };

  const tableColumns = [
    {
      header: "SR.NO.",
      accessorKey: "id",
      center: true,
      cell: ({ row }) => <span className="text-[12px]  text-slate-500">{(pageIndex - 1) * pageSize + row.index + 1}</span>,
    },
    {
      header: "DATE",
      accessorKey: "createdAt",
      center: true,
      cell: ({ row }) => (
          <span className="text-[11px] whitespace-nowrap text-slate-700 uppercase tracking-tight">
            {formatDate(row.original.createdAt)}
          </span>
   
      )
    },
    {
      header: "REFERENCE ID",
      accessorKey: "referenceId",
      center: true,
      cell: ({ row }) => (
        <ClickToCopy text={row.original.referenceId} className="bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/50">
          <span className="text-[11px] font-bold text-indigo-600 font-mono tracking-tight">
            {row.original.referenceId}
          </span>
        </ClickToCopy>
      ),
    },
    {
      header: "AMOUNT",
      accessorKey: "amount",
      center: true,
      cell: ({ row }) => <span className="text-[14px] font-bold text-slate-700">₹{Number(row.original.amount).toLocaleString("en-IN")}</span>,
    },
    {
      header: "BEFORE WALLET",
      accessorKey: "openingBalance",
      center: true,
      cell: ({ row }) => <span className="text-[12px]  text-slate-700">₹{Number(row.original.openingBalance || 0).toLocaleString("en-IN")}</span>,
    },
    {
      header: "AFTER WALLET",
      accessorKey: "closingBalance",
      center: true,
      cell: ({ row }) => <span className="text-[12px]  text-indigo-700 bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/50">₹{Number(row.original.closingBalance || 0).toLocaleString("en-IN")}</span>,
    },
    {
      header: "STATUS",
      accessorKey: "status",
      center: true,
      cell: ({ row }) => <StatusBadge status={row.original.status || "Success"} />,
    },
  ];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date Picker Pill Trigger */}
      <div className="relative flex-1 sm:flex-none sm:w-auto min-w-[200px]" ref={calendarRef}>
        <div
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={cn(
            "h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-indigo-600/50 hover:bg-slate-50 transition-all group select-none",
            !date?.from && "text-slate-400",
            isCalendarOpen && "border-indigo-600/50 ring-4 ring-indigo-600/10"
          )}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            <span className="whitespace-nowrap">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                "Pick a date range"
              )}
            </span>
          </div>
          <ChevronDown className={cn(
            "w-3.5 h-3.5 transition-all duration-300 ml-1",
            isCalendarOpen ? "rotate-180 text-indigo-600" : "text-slate-300"
          )} />
        </div>

        <AnimatePresence>
          {isCalendarOpen && !isMobile && (
            <motion.div
              {...butteryDropdown}
              className="absolute right-0 top-full mt-2 z-[9999] origin-top-right shadow-2xl rounded-2xl border border-slate-100 bg-white overflow-hidden ring-1 ring-slate-200/50 hidden sm:block"
              style={{ width: 'max-content', maxWidth: '94vw' }}
            >
              <CustomDualCalendar
                date={date}
                setDate={setDate}
                onApply={() => { setIsCalendarOpen(false); handleSearch(); }}
                onReset={() => { handleReset(); setIsCalendarOpen(false); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portalled Mobile Calendar Overlay */}
        {createPortal(
          <AnimatePresence>
            {isCalendarOpen && isMobile && (
              <div id="mobile-calendar-portal" className="fixed inset-0 z-[99999] sm:hidden">
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
                  transition={{ type: "spring", damping: 22, stiffness: 350, mass: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 bg-white overflow-hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] origin-bottom"
                >
                  <CustomDualCalendar
                    date={date}
                    setDate={setDate}
                    onApply={() => { setIsCalendarOpen(false); handleSearch(); }}
                    onReset={() => { handleReset(); setIsCalendarOpen(false); }}
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

  return (
    <PageLayout
      title="Wallet Transfer"
      subtitle="Seamlessly move funds from AEPS Wallet to Main Wallet"
      className="max-w-[1600px] mx-auto py-4"
      actions={headerActions}
    >
      <div className="flex flex-col gap-6">

        {/* Transfer Section — Left Form + Right Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* Left: Transfer Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 bg-white rounded-[2rem] shadow-sm border border-slate-200/80 p-6 md:p-7 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Transfer Funds</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AEPS → Main Wallet</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600/5 text-indigo-600 flex items-center justify-center border border-indigo-500/10">
                <ArrowLeftRight size={18} />
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              {/* <label className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 ml-1">Amount (₹)</label> */}
              <div className="relative">
                {/* <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-3 border-r border-slate-200 bg-slate-50/50 rounded-l-xl pointer-events-none">
                  <span className={cn("text-sm font-black transition-colors", formData.amount ? "text-indigo-500" : "text-slate-300")}>₹</span>
                </div> */}
                <Input
                  label={"Amount (₹)"}
                  icon={IndianRupee}
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: formatNumberInput(e.target.value, 8) })}

                />
              </div>
            </div>

            {/* Transfer Button */}
            <Button
              onClick={handleTransfer}
              disabled={isProcessing}
              className="w-full !h-11 !rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold uppercase tracking-[0.12em] shadow-lg shadow-indigo-600/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 border-none group"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Zap size={15} className="transition-transform group-hover:scale-110" />
                  Execute Transfer
                </>
              )}
            </Button>
          </motion.div>

          {/* Right: Visual Transfer Flow Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-[2rem] p-6 md:p-7 relative overflow-hidden min-h-[200px]"
          >
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

            <div className="relative z-10 h-full flex flex-col justify-between gap-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transfer Flow</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider">Active</span>
                </div>
              </div>

              {/* Flow Visualization */}
              <div className="flex items-center gap-4">
                {/* Source */}
                <div className="flex-1 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Fingerprint size={14} className="text-amber-400" />
                    </div>
                    <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-wider">AEPS Wallet</span>
                  </div>
                  <p className="text-xl font-black text-white tracking-tight tabular-nums leading-none">
                    {walletLoading ? "..." : formatToINR(wallet?.aepsWallet)}
                  </p>
                  <p className="text-[9px] font-semibold text-slate-500 mt-1.5 uppercase tracking-wider">AEPS Wallet</p>

                </div>

                {/* Arrow connector */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-6 h-[1px] bg-gradient-to-r from-amber-500/40 to-indigo-500/40" />
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                    <ArrowLeftRight size={10} className="text-white/60" />
                  </div>
                  <div className="w-6 h-[1px] bg-gradient-to-r from-amber-500/40 to-indigo-500/40" />
                </div>

                {/* Destination */}
                <div className="flex-1 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <Wallet size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-[9px] font-bold text-indigo-400/80 uppercase tracking-wider">Main Wallet</span>
                  </div>
                  <p className="text-xl font-black text-white tracking-tight tabular-nums leading-none">
                    {walletLoading ? "..." : formatToINR(wallet?.mainWallet)}
                  </p>
                  <p className="text-[9px] font-semibold text-slate-500 mt-1.5 uppercase tracking-wider">Main Wallet</p>
                </div>
              </div>

              {/* Bottom info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="w-1 h-1 rounded-full bg-indigo-400" />
                  Instant settlement
                </div>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                  Zero charges
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transfer History Table Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-1">
            <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Transfer History Logs</h2>
          </div>
          <DataTable
            searchPlaceholder="Search ledger..."
            fileName="Wallet_Transfer_Logs"
            searchChange={(e) => setSearchTerm(e.target.value)}
            columns={tableColumns}
            data={transactions}
            isLoading={isLoading}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            totalRecords={totalRecords}
            pageSize={pageSize}
            onPaginationChange={({ pageIndex, pageSize }) => {
              setPageIndex(pageIndex);
              setPageSize(pageSize);
            }}
            searchValue={searchTerm}
          />
        </div>
      </div>
    </PageLayout>
  );
}
