import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { format, addDays } from "date-fns";
import { useClickOutside } from "../hooks/use-click-outside";
import {
  Calendar as CalendarIcon,
  Search,
  RotateCcw,
  Download,
  Clock,
  ShieldCheck,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  IndianRupee,
  FileText,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap,
  Filter,
} from "lucide-react";
import StatusBadge from "../components/ui/StatusBadge";
import { useNavigate } from "react-router-dom";
import { butteryDropdown } from "../lib/animations";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { DataTable } from "../components/ui/DataTable";
import { TableActions } from "../components/ui/TableExportActions";
import { cn } from "../lib/utils";
import { PageLayout } from "../components/layout/PageLayout";
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar";
import { DownLineUserSelect } from "../components/ui/DownLineUserSelect";
import ClickToCopy from "../components/ui/ClickToCopy";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import {
  formatDate,
  formatDateForBackend,

  formatToINR,
  handleValidationError,
} from "../utils/helperFunction";
import { toast } from "sonner";
import { ActionButtons } from "../components/ui/ActionButton";
import ExpandableMessage from "../components/ui/ExpandableMessage";

const StatCard = ({
  label,
  count,
  amount,
  type,
  icon: Icon,
  subLabel1,
  subLabel2,
}) => {
  const styles = {
    success: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-100",
      text: "text-emerald-700",
      gradient: "from-white to-emerald-50",
    },
    failed: {
      bg: "bg-rose-100",
      icon: "text-rose-600",
      border: "border-rose-100",
      text: "text-rose-700",
      gradient: "from-white to-rose-50",
    },
    pending: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      border: "border-amber-100",
      text: "text-amber-700",
      gradient: "from-white to-amber-50",
    },
    refund: {
      bg: "bg-sky-100",
      icon: "text-sky-600",
      border: "border-sky-100",
      text: "text-sky-700",
      gradient: "from-white to-sky-50",
    },
    commission: {
      bg: "bg-violet-100",
      icon: "text-violet-600",
      border: "border-violet-100",
      text: "text-violet-700",
      gradient: "from-white to-violet-50",
    },
    charges: {
      bg: "bg-orange-100",
      icon: "text-orange-600",
      border: "border-orange-100",
      text: "text-orange-700",
      gradient: "from-white to-orange-50",
    },
    credit: {
      bg: "bg-teal-100",
      icon: "text-teal-600",
      border: "border-teal-100",
      text: "text-teal-700",
      gradient: "from-white to-teal-50",
    },
    debit: {
      bg: "bg-pink-100",
      icon: "text-pink-600",
      border: "border-pink-100",
      text: "text-pink-700",
      gradient: "from-white to-pink-50",
    },
  }[type];

  return (
    <motion.div
      whileHover={{ shadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
      className={cn(
        "p-5 rounded-2xl bg-gradient-to-tr border shadow-sm transition-all duration-300 h-full",
        styles.gradient,
        styles.border,
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2.5 rounded-xl", styles.bg)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none translate-y-[1px]">
          {label}
        </p>
      </div>
      <div className="space-y-2.5">
        {amount !== undefined ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-50 ">
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">
                {subLabel1 || "Txn Count"}
              </span>
              <span className={cn("text-base font-black", styles.text)}>
                {count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">
                {subLabel2 || "Amount"}
              </span>
              <span className={cn("text-base font-black", styles.text)}>
                {formatToINR(amount)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight">
              {subLabel1 || "Total Earned"}
            </span>
            <span className={cn("text-xl font-black", styles.text)}>
              ₹{count.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default function WalletLedger() {
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    userId: "",
    search: "",
  });

  const [stats, setStats] = useState({
    success: {
      count: 0,
      amount: 0,
    },
    pending: {
      count: 0,
      amount: 0,
    },
    failed: {
      count: 0,
      amount: 0,
    },
    refund: {
      count: 0,
      amount: 0,
    },
    commission: 0,
    charges: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalAmount: 0,
  });

  const [walletLedgerData, setWalletLedgerData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState({ from: null, to: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const calendarRef = useRef(null);
  useClickOutside(
    calendarRef,
    () => setIsCalendarOpen(false),
    "#mobile-calendar-portal",
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleReset = () => {
    setDate({ from: null, to: null });
    setFilters({ type: "", status: "", userId: "", search: "" });
  };

  const [columnVisibility, setColumnVisibility] = useState({});

  const { refetch: fetchWalletLedger } = useFetch(
    `${apiEndpoints.fetchWalletLedger}?page=${pageIndex}&limit=${pageSize}&search=${filters.search}&status=${filters.status}&from=${formatDateForBackend(date.from)}&to=${formatDateForBackend(date.to)}&user=${filters.userId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data);
          setWalletLedgerData(data?.data || []);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        setIsLoading(false);
        console.log("error in fetch wallet ledger data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );

  useEffect(() => {
    fetchWalletLedger();
  }, [
    date.to,
    date.from,
    filters.userId,
    filters.status,
    filters.search,
    pageIndex,
    pageSize,
  ]);

  const { refetch: fetchWalletLedgerStats } = useFetch(
    `${apiEndpoints.walletLedgerStats}?from=${formatDateForBackend(date.from)}&to=${formatDateForBackend(date.to)}&user=${filters.userId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setStats({
            success: {
              count: data?.data?.success?.count || 0,
              amount: data?.data?.success?.amount || 0,
            },
            pending: {
              count: data?.data?.pending?.count || 0,
              amount: data?.data?.pending?.amount || 0,
            },
            failed: {
              count: data?.data?.failed?.count || 0,
              amount: data?.data?.failed?.amount || 0,
            },
            refund: {
              count: data?.data?.refund?.count || 0,
              amount: data?.data?.refund?.amount || 0,
            },
            commission: data?.data?.totalCommission || 0,
            charges: data?.data?.totalCharges || 0,
            totalCredit: data?.data?.totalCredit || 0,
            totalDebit: data?.data?.totalDebit || 0,
            totalAmount: data?.data?.total?.commission || 0,
          });
        }
      },
      onError: (error) => {
        console.log("error in fetch wallet ledger data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );

  const handlePageChange = ({ pageIndex: newPage, pageSize: newSize }) => {
    setPageIndex(newPage);
    setPageSize(newSize);
    setIsLoading(true);
  };

  useEffect(() => {
    fetchWalletLedgerStats();
  }, [date.to, date.from, filters.userId]);

  const columns = React.useMemo(
    () => [
      {
        header: "SR.NO.",
        accessorKey: "id",
        center: true,
        className: "w-16",
        cell: ({ row, index }) => (
          <span className="text-[12px]  text-slate-500">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        ),
      },
      {
        header: "DATE",
        accessorKey: "createdAt",
        className: "min-w-[120px]",
        cell: ({ row }) => (

          <span className="text-[11px] whitespace-nowrap text-slate-600 uppercase tracking-tight">
            {formatDate(row.original.createdAt)}
          </span>

        ),
      },
      {
        header: "USER NAME",
        accessorKey: "userName",
        className: "transition-all min-w-[150px]",
        cell: ({ row }) => (
          <div className="flex flex-col whitespace-nowrap">
            <div className="flex items-center gap-1.5 ">
              <span className=" text-[13px] text-slate-900">
                {row.original.fullName}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 text-center font-medium tracking-tight">
              ( {row.original.userName} )
            </span>
          </div>
        ),
      },
      {
        header: "SERVICES NAME",
        accessorKey: "serviceType",
        className: "whitespace-nowrap min-w-[140px]",
        cell: ({ row }) => (
          <span className="text-[11px]  text-slate-800 uppercase tracking-tight">
            {row.original.serviceType || "---"}
          </span>
        ),
      },
      {
        header: "SERVICES CATEGORY",
        accessorKey: "serviceCategory",
        className: "whitespace-nowrap min-w-[140px]",
        cell: ({ row }) => (
          <span className="text-[11px]  text-slate-800 uppercase tracking-tight">
            {row.original.serviceCategory || "---"}
          </span>
        ),
      },
      {
        header: "Entry Type",
        accessorKey: "entryType",
        className: "whitespace-nowrap min-w-[140px]",
        cell: ({ row }) => (
          <span className="text-[11px]  text-slate-800 uppercase text-center">
            {row.original.entryType || "---"}
          </span>
        ),
      },
      {
        header: "REFERENCE ID",
        accessorKey: "referenceId",
        className: "whitespace-nowrap min-w-[200px]",
        cell: ({ row }) => (
          <ClickToCopy text={row.original.referenceId} className="bg-indigo-50/50 px-2 whitespace-nowrap py-1 rounded-lg border border-indigo-100/50">
            <span className="text-[11px] font-bold text-indigo-600 font-mono tracking-tight">
              {row.original.referenceId}
            </span>
          </ClickToCopy>
        ),
      },
      {
        header: "OPENING BAL",
        accessorKey: "openingBalance",
        center: true,
        cell: ({ row }) => (
          <span className="text-[13px]  text-slate-800">
            {formatToINR(row.original.openingBalance)}
          </span>
        ),
      },
      {
        header: "TXN AMOUNT",
        accessorKey: "amount",
        center: true,
        cell: ({ row }) => (
          <span className="text-[14px] font-black text-slate-600">
            {formatToINR(row.original.amount)}
          </span>
        ),
      },
      {
        header: "COMMISSION",
        accessorKey: "commission",
        center: true,
        cell: ({ row }) => (
          <span className="text-[13px]  text-slate-800">
            {formatToINR(row.original.commission)}
          </span>
        ),
      },
      {
        header: "CHARGES",
        accessorKey: "chargesAmount",
        center: true,
        cell: ({ row }) => (
          <span className="text-[13px] text-slate-800">
            {formatToINR(row.original.chargesAmount)}
          </span>
        ),
      },
      {
        header: "GST",
        accessorKey: "gst",
        center: true,
        cell: ({ row }) => (
          <span className="text-[13px] text-slate-800">
            {formatToINR(row.original.gstAmount)}
          </span>
        ),
      },
      {
        header: "TDS",
        accessorKey: "tds",
        center: true,
        cell: ({ row }) => (
          <span className="text-[13px]  text-slate-800">
            {formatToINR(row.original.tdsAmount)}
          </span>
        ),
      },
      {
        header: "CLOSING BAL",
        accessorKey: "closingBalance",
        center: true,
        className: "whitespace-nowrap",
        cell: ({ row }) => (
          <span className="text-[13px]  text-slate-800">
            {formatToINR(row.original.closingBalance)}
          </span>
        ),
      },

      {
        header: "TYPE",
        accessorKey: "type",
        center: true,
        cell: ({ row }) =>
          <span className={`text-[13px] font-bold capitalize ${row.original.type === "debit" ? "text-rose-500" : "text-emerald-500"}`}>{row.original.type}</span>
      },

      // {
      //   header: "STATUS",
      //   accessorKey: "status",
      //   center: true,
      //   cell: ({ row }) => <StatusBadge status={row.original.status} />,
      // },
      {
        header: "MESSAGE",
        accessorKey: "description",
        className: "min-w-[150px]",
        cell: ({ row }) => (
          <ExpandableMessage text={row.original.description} />
        ),
      },
      // {
      //   header: "ACTION",
      //   accessorKey: "action",
      //   center: true,
      //   cell: ({ row }) => (
      //     <ActionButtons
      //       onView={() =>
      //         row.original?._id &&
      //         navigate(`/wallet-ledger/details/${row.original._id}`)
      //       }
      //       viewTitle="View Ledger Details"
      //     />

      //   ),
      // },
    ],
    [pageIndex, pageSize],
  );

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">

      <div className="flex-1 sm:flex-none sm:w-[180px] min-w-[140px]">
        <DownLineUserSelect
          value={filters.userId}
          onChange={(value) => setFilters({ ...filters, userId: value })}
          className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
        />
      </div>

      {/* 2. Status Pill Dropdown */}
      <div className="flex-1 sm:flex-none sm:w-[150px] min-w-[130px]">
        <Select
          options={[
            { label: "All Status", value: "" },
            { label: "Success", value: "success" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
            { label: "Refund", value: "refund" },
          ]}
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          placeholder="Select Status"
          className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
        />
      </div>

      {/* 3. Date Picker Pill Trigger */}
      <div
        className="relative flex-1 sm:flex-none sm:w-auto min-w-[160px]"
        ref={calendarRef}
      >
        <div
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={cn(
            "h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-[#2f35cd]/50 hover:bg-slate-50 transition-all group select-none",
            !date?.from && "text-slate-400",
            isCalendarOpen && "border-[#2f35cd]/50 ring-4 ring-[#2f35cd]/10",
          )}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-slate-600 group-hover:text-[#2f35cd] transition-colors" />
            <span className="whitespace-nowrap">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                "Pick a date range"
              )}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-all duration-300 ml-1",
              isCalendarOpen ? "rotate-180 text-[#2f35cd]" : "text-slate-300",
            )}
          />
        </div>

        <AnimatePresence>
          {isCalendarOpen && !isMobile && (
            <motion.div
              {...butteryDropdown}
              className="absolute right-0 top-full mt-2 z-[9999] origin-top-right shadow-2xl rounded-2xl border border-slate-100 bg-white overflow-hidden ring-1 ring-slate-200/50 hidden sm:block"
              style={{ width: "max-content", maxWidth: "94vw" }}
            >
              <CustomDualCalendar
                date={date}
                setDate={setDate}
                onApply={() => {
                  setIsCalendarOpen(false);
                }}
                onReset={() => {
                  handleReset();
                  setIsCalendarOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portalled Mobile Calendar Overlay */}
        {createPortal(
          <AnimatePresence>
            {isCalendarOpen && isMobile && (
              <div
                id="mobile-calendar-portal"
                className="fixed inset-0 z-[99999] sm:hidden"
              >
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
                  transition={{
                    type: "spring",
                    damping: 22,
                    stiffness: 350,
                    mass: 0.5,
                  }}
                  className="absolute bottom-0 left-0 right-0 bg-white overflow-hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] origin-bottom"
                >
                  <CustomDualCalendar
                    date={date}
                    setDate={setDate}
                    onApply={() => {
                      setIsCalendarOpen(false);
                    }}
                    onReset={() => {
                      handleReset();
                      setIsCalendarOpen(false);
                    }}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </div>
    </div>
  );

  const navigate = useNavigate();

  const searchChange = (e) =>
    setFilters({ ...filters, search: e.target.value });

  const extraFilter = [
    {
      options: [
        { label: "All", value: "All" },
        { label: "Credit", value: "Credit" },
        { label: "Debit", value: "Debit" },
      ],
      value: filters.type,
      onChange: (value) => setFilters({ ...filters, type: value }),

      placeholder: "Txn Type",
    },
  ];

  return (
    <PageLayout
      title="Wallet Ledger"
      subtitle="Comprehensive Financial Statement • Real-time"
      actions={headerActions}
      className="max-w-[1600px] mx-auto py-4"
    >
      {/* Stats Summary Grid - Granular Step Down: 6-5-4-3-2-1 */}
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 mb-2">
        <StatCard
          label="Total Success"
          count={stats.success.count}
          amount={stats.success.amount}
          type="success"
          icon={CheckCircle2}
        />
        <StatCard
          label="Total Pending"
          count={stats.pending.count}
          amount={stats.pending.amount}
          type="pending"
          icon={Clock}
        />
        <StatCard
          label="Total Failed"
          count={stats.failed.count}
          amount={stats.failed.amount}
          type="failed"
          icon={XCircle}
        />
        <StatCard
          label="Total Refund"
          count={stats.refund.count}
          amount={stats.refund.amount}
          type="refund"
          icon={RefreshCw}
        />

        <StatCard
          label="Total Commission"
          count={stats.commission}
          type="commission"
          subLabel1="Total Earned"
          icon={IndianRupee}
        />
        <StatCard
          label="Total Charges"
          count={stats.charges}
          type="charges"
          subLabel1="Total Paid"
          icon={Zap}
        />
        <StatCard
          label="Total Credit"
          count={stats.totalCredit}
          type="credit"
          subLabel1="Total Amount"
          icon={TrendingUp}
        />
        <StatCard
          label="Total Debit"
          count={stats.totalDebit}
          type="debit"
          subLabel1="Total Amount"
          icon={TrendingDown}
        />
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
            Wallet Ledger History
          </h2>
        </div>
        <DataTable
          columns={columns}
          data={walletLedgerData}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPaginationChange={handlePageChange}
          fileName="wallet_report"
          searchPlaceholder="Search logs..."
          searchValue={filters.search}
          searchChange={searchChange}
          extraFilter={extraFilter}
        />
      </div>
    </PageLayout>
  );
}
