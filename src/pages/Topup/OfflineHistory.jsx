import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { useClickOutside } from "../../hooks/use-click-outside";
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  Clock,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  IndianRupee,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Filter,
  Image as ImageIcon,
  Building2,
  Calendar
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { butteryDropdown } from "../../lib/animations";
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { cn } from '../../lib/utils';
import { PageLayout } from '../../components/layout/PageLayout';
import { CustomDualCalendar } from '../../components/dashboard/CustomDualCalendar';
import { useFetch } from "../../hooks/useFetch";
import { apiEndpoints } from "../../api/apiEndpoints";
import { formatDate, handleValidationError } from "../../utils/helperFunction";
import { toast } from "sonner";
import ImageModal from "../../components/ui/ImageModal";
import ClickToCopy from '../../components/ui/ClickToCopy';
import { ActionButtons } from '../../components/ui/ActionButton';
import ExpandableMessage from '../../components/ui/ExpandableMessage';

const StatCard = ({ label, count, amount, type, icon: Icon, subLabel1, subLabel2 }) => {
  const styles = {
    success: {
      bg: "bg-emerald-100", icon: "text-emerald-600", border: "border-emerald-100", text: "text-emerald-700",
      gradient: "from-white to-emerald-50"
    },
    failed: {
      bg: "bg-rose-100", icon: "text-rose-600", border: "border-rose-100", text: "text-rose-700",
      gradient: "from-white to-rose-50"
    },
    pending: {
      bg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-100", text: "text-amber-700",
      gradient: "from-white to-amber-50"
    }
  }[type];

  return (
    <motion.div
      whileHover={{ shadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}
      className={cn(
        "p-5 rounded-2xl bg-gradient-to-tr border shadow-sm transition-all duration-300 h-full",
        styles.gradient,
        styles.border
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2.5 rounded-xl", styles.bg)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none translate-y-[1px]">{label}</p>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">{subLabel1 || "Req Count"}</span>
          <span className={cn("text-base font-black", styles.text)}>{count}</span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-tight">{subLabel2 || "Total Volume"}</span>
          <span className={cn("text-base font-black", styles.text)}>₹{amount?.toLocaleString() || 0}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function OfflineHistory() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: 'All',
    search: '',
    userId: ""
  });

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState({ from: null, to: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [columnVisibility, setColumnVisibility] = useState({});

  // Data State
  const [topupRequests, setTopupRequests] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    approved: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 }
  });

  // Modal State
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const calendarRef = useRef(null);
  useClickOutside(calendarRef, () => setIsCalendarOpen(false), "#mobile-calendar-portal");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { refetch: fetchHistory } = useFetch(
    `${apiEndpoints.fetchTopUpRequest}?page=${pageIndex}&limit=${pageSize}&userId=${filters.userId}&search=${filters.search}&status=${filters.status === 'All' ? '' : filters.status}&from=${date.from ? format(date.from, "yyyy-MM-dd") : ""}&to=${date.to ? format(date.to, "yyyy-MM-dd") : ""}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setTopupRequests(data?.data || []);
          setTotalRecords(data?.pagination?.total || 0);

        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch topup history");
        setIsLoading(false);
      },
    },
    false
  );

  const { refetch: fetchTopupStats } = useFetch(
    `${apiEndpoints.fetchOfflineTopupStats}?status=${filters.status === 'All' ? '' : filters.status}&userId=${filters.userId}&from=${date.from ? format(date.from, "yyyy-MM-dd") : ""}&to=${date.to ? format(date.to, "yyyy-MM-dd") : ""}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data, "offline topuprequest");
          setStats({
            approved: { count: data?.data?.approved?.count || 0, amount: data?.data?.approved?.amount || 0 },
            pending: { count: data?.data?.pending?.count || 0, amount: data?.data?.pending?.amount || 0 },
            rejected: { count: data?.data?.rejected?.count || 0, amount: data?.data?.rejected?.amount || 0 }
          })

        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch topup stats");
        setIsLoading(false);
      },
    },
    false
  )

  useEffect(() => {
    fetchTopupStats();
  }, [date, filters.userId]);

  useEffect(() => {
    fetchHistory();
  }, [pageIndex, pageSize, filters.status, date, filters.search, filters.userId]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchHistory();
  };

  const handleReset = () => {
    setDate({ from: null, to: null });
    setFilters({ status: 'All', search: '', userId: "" });
    setPageIndex(1);
  };

  const columns = useMemo(() => [
    {
      header: "SR.NO.",
      center: true,
      cell: ({ row, index }) => <span className="text-[12px]  text-slate-500">

        {(pageIndex - 1) * pageSize + index + 1}</span>
    },
    {
      header: "REFERENCE ID",
      accessorKey: "referenceId",
      center: true,
      cell: ({ row }) => (
          <ClickToCopy text={row.original.referenceId} className="bg-indigo-50/50 px-2 whitespace-nowrap py-1 rounded-lg border border-indigo-100/50">
          <span className="text-[11px] font-bold text-indigo-600 font-mono tracking-tight">
            {row.original.referenceId}
          </span>
        </ClickToCopy>
      )
    },
    {
      header: "REQUEST DATE",
      accessorKey: "createdAt",
      center: true,
      cell: ({ row }) => {

        return (
            <span className="text-[11px] whitespace-nowrap  text-slate-500 uppercase tracking-tight">{formatDate(row.original.createdAt)}</span>
        

        );
      }
    },
    {
      header: "PAYMENT DATE",
      accessorKey: "paymentDate",
      center: true,
      cell: ({ row }) => {

        return (
          <div className="flex flex-col gap-0.5 whitespace-nowrap">
            <span className="text-[11px]  text-slate-500 uppercase tracking-tight">{formatDate(row.original.paymentDate)}</span>
          </div>
        );
      }
    },
    {
      header: "PAYMENT METHOD",
      accessorKey: "mode",
      center: true,
      cell: ({ row }) => (

          <span className="text-[12px] font-bold text-slate-500 uppercase tracking-tight">{row.original.mode || "N/A"}</span>
        
      )
    },

    {
      header: "BANK UTR NO.",
      accessorKey: "utrNumber",
      center: true,
      cell: ({ row }) => (
        <ClickToCopy text={row.original.utrNumber} className="bg-indigo-50/50 px-2 py-1 rounded-lg border border-indigo-100/50">

          <span className="text-[11px] font-bold text-slate-500 font-mono tracking-tight">
            {row.original.utrNumber}
          </span>
        </ClickToCopy>
      )
    },
    {
      header: "TXN AMOUNT",
      accessorKey: "amount",
      center: true,
      cell: ({ row }) => <span className="text-[11px]  text-slate-900 tracking-tight">₹{row.original.amount?.toLocaleString() || 0}</span>
    },
    {
      header: "PROOF",
      accessorKey: "paymentProof",
      center: true,
      cell: ({ row }) => (
        <ActionButtons
          onView={() => {
            if (row.original.paymentProof) {

              setSelectedImage(`${import.meta.env.VITE_API_URL}${row.original.paymentProof}`);
              setIsImageModalOpen(true);
            }
            else {
              toast.error("No proof found");
            }
          }}
          viewTitle='View Proof'
        />

      )
    },
    {
      header: "STATUS",
      accessorKey: "status",
      center: true,
      cell: ({ row }) => <div className="flex justify-center">
        <StatusBadge status={row.original.status} />
      </div>
    },
    {
      header: "DESCRIPTION",
      accessorKey: "rejectionReason",
      center: true,
      cell: ({ row }) => (
        <ExpandableMessage text={row.original.rejectionReason || "Offline topup request"}/>
      )
    },

  ], [selectedImage, pageIndex, pageSize]);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      <div className="flex-1 sm:flex-none sm:w-[160px] min-w-[130px]">
        <Select
          options={[
            { label: 'All Status', value: 'All' },
            { label: 'Approved', value: 'approved' },
            { label: 'Pending', value: 'pending' },
            { label: 'Rejected', value: 'rejected' },
          ]}
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          placeholder="Filter"
          className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[12px] !font-bold"
        />
      </div>

      {/* Date Picker */}
      <div className="relative flex-1 sm:flex-none sm:w-auto min-w-[160px]" ref={calendarRef}>
        <div
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={cn(
            "h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-indigo-500/50 hover:bg-slate-50 transition-all group select-none",
            !date?.from && "text-slate-400",
            isCalendarOpen && "border-indigo-500/50 ring-4 ring-indigo-500/10"
          )}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
            <span className="whitespace-nowrap">
              {date?.from ? (
                date.to ? (
                  <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
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
            isCalendarOpen ? "rotate-180 text-indigo-600" : "text-slate-600"
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
                onApply={() => setIsCalendarOpen(false)}
                onReset={() => { handleReset(); setIsCalendarOpen(false); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
                    onApply={() => setIsCalendarOpen(false)}
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
      title="Fund Request Audit"
      subtitle="Comprehensive history of all offline wallet top-up requests"
      actions={headerActions}
      className="max-w-[1600px] mx-auto"
    >
      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 mb-8">
        <StatCard
          label="Total Approved"
          count={stats.approved.count}
          amount={stats.approved.amount}
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
          label="Total Rejected"
          count={stats.rejected.count}
          amount={stats.rejected.amount}
          type="failed"
          icon={XCircle}
        />
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Fund Request Audit</h2>
        </div>
        <DataTable
          fileName="fund_request_audit"
          searchPlaceholder='"Search by UTR or Reference..."'
          searchValue={filters.search}
          searchChange={(e) => setFilters({ ...filters, search: e.target.value })}
          columns={columns}
          data={topupRequests}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPaginationChange={({ pageIndex, pageSize }) => {
            setPageIndex(pageIndex);
            setPageSize(pageSize);
          }}
        />
      </div>

      {/* Image Modal Integration */}
      <ImageModal
        images={[selectedImage]}
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImage(null);
        }}
      />
    </PageLayout>
  );
}
