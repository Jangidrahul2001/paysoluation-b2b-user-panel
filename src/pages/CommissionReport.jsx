import {
  ArrowUpRight,
  Calendar,
  Percent,
  TrendingUp,
  Clock,
  ChevronDown,
  IndianRupee
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from "date-fns";
import { createPortal } from "react-dom";
import { useState, useRef, useEffect, useMemo } from 'react';
import { Select } from '../components/ui/Select';
import { butteryDropdown } from "../lib/animations";
import ClickToCopy from '../components/ui/ClickToCopy';
import { DataTable } from '../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { useClickOutside } from "../hooks/use-click-outside";
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from '../api/apiEndpoints';
import { toast } from 'sonner';
import { formatDate, formatDateForBackend, formatToINR, handleValidationError } from '../utils/helperFunction';
import ExpandableMessage from '../components/ui/ExpandableMessage';

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
    emerald: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-100",
      text: "text-emerald-700",
      gradient: "from-white to-emerald-50",
    },
    voilet: {
      bg: "bg-violet-100",
      icon: "text-violet-600",
      border: "border-violet-100",
      text: "text-violet-700",
      gradient: "from-white to-violet-50",
    },
    indigo: {
      bg: "bg-indigo-100",
      icon: "text-indigo-600",
      border: "border-indigo-100",
      text: "text-indigo-700",
      gradient: "from-white to-indigo-50",
    },
    orange: {
      bg: "bg-orange-100",
      icon: "text-orange-600",
      border: "border-orange-100",
      text: "text-orange-700",
      gradient: "from-white to-orange-50",
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
        {(
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight">
              {subLabel1 || "Total Earned"}
            </span>
            <span className={cn("text-xl font-black", styles.text)}>
              {count && count}
              {amount && formatToINR(amount)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function CommissionReport() {
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState("All");
  const [date, setDate] = useState({ from: null, to: null });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [reportData, setReportData] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [stats, setStats] = useState({});
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  useClickOutside(calendarRef, () => setIsCalendarOpen(false));

  // Fetch services for dropdown
  const { refetch: fetchServices } = useFetch(
    apiEndpoints.allServiceList,
    {
      onSuccess: (data) => {
        if (data.success) {
          const services = [
            { label: "All Services", value: "All" },
            ...data.data.map(service => ({
              label: service.name || service.serviceName,
              value: service.name || service.serviceName
            }))
          ];
          setServiceOptions(services);
        }
      },
      onError: (error) => {
        console.log("Error fetching services:", error);
        toast.error(handleValidationError(error) || "Failed to fetch services");
      }
    },
    true
  );

  const { refetch: fetchCommissionStats } = useFetch(
    `${apiEndpoints.fetchCommissionStats}?service=${serviceFilter === "All" ? "" : serviceFilter}${date.from ? `&from=${formatDateForBackend(date.from)}` : ""}${date.to ? `&to=${formatDateForBackend(date.to)}` : ""}`,
    {
      onSuccess: (data) => {
        if (data.success && data?.data) {
          setStats(data?.data || {});
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log("Error fetching commission stats:", error);
        toast.error(handleValidationError(error) || "Failed to fetch commission stats");
        setIsLoading(false);
      }
    },
    false
  );

  // Fetch commission reports with pagination
  const { refetch: fetchReports } = useFetch(
    `${apiEndpoints.commissionReport}?service=${serviceFilter === "All" ? "" : serviceFilter}${date.from ? `&from=${formatDateForBackend(date.from)}` : ""}${date.to ? `&to=${formatDateForBackend(date.to)}` : ""}&search=${search}&page=${pageIndex + 1}&limit=${pageSize}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setReportData(data.data || []);
          setTotalRecords(data.pagination?.total || 0);

        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log("Error fetching commission reports:", error);
        toast.error(handleValidationError(error) || "Failed to fetch commission reports");
        setIsLoading(false);
      }
    },
    false
  );

  // Fetch data when filters change
  useEffect(() => {
    setIsLoading(true);
    fetchReports();
    fetchCommissionStats();
  }, [serviceFilter, date, search]);

  // Fetch data when pagination changes
  useEffect(() => {
    if (pageIndex > 0 || pageSize !== 10) {
      fetchReports();
    }
  }, [pageIndex, pageSize]);

  const handlePageChange = ({ pageIndex: newPage, pageSize: newSize }) => {
    setPageIndex(newPage - 1);
    setPageSize(newSize);
    setIsLoading(true);
  };

  const handleReset = () => {
    setDate({ from: null, to: null });
    setServiceFilter("All");
    setSearch("");
    setPageIndex(0);
  };

  const columns = useMemo(
    () => [
      {
        header: "SR.NO.",
        accessorKey: "id",
        center: true,
        className: "w-16",
        cell: ({ row, index }) => (
          <span className="text-[12px] text-slate-500">
            {pageIndex * pageSize + index + 1}
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
        header: "COMMISSION",
        accessorKey: "amount",
        center: true,
        cell: ({ row }) => (
          <span className="text-[14px] font-black text-slate-600">
            {formatToINR(row.original.amount)}
          </span>
        ),
      },
      {
        header: "MESSAGE",
        accessorKey: "description",
        className: "min-w-[150px]",
        cell: ({ row }) => (
          <ExpandableMessage text={row.original.description} />
        ),
      },

    ],
    [pageIndex, pageSize.serviceFilter],
  );

  const actions = (
    <div className="relative z-[100] flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
      {/* Service Selection */}
      <div className="flex-1 sm:flex-none sm:min-w-[160px]">
        <Select
          placeholder="Select Service"
          options={serviceOptions}
          value={serviceFilter}
          onChange={setServiceFilter}
          className="!h-10 !rounded-full !bg-white border-slate-200 shadow-sm !text-[11px] !font-black !tracking-widest"
        />
      </div>

      {/* Date Range Picker */}
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
                  handleReset();
                  setIsCalendarOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Calendar */}
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
                      handleReset();
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

  return (
    <PageLayout
      title="Commission Report"
      subtitle="Summarizing your total earnings and distributions"
      actions={actions}
      className="max-w-[1600px] mx-auto py-4"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 mb-2">


        <StatCard
          label="Commission Count"
          count={stats?.totalCount || 0}
          type="emerald"
          subLabel1="Total Commission"
          icon={IndianRupee}
        />

        <StatCard
          label="Total Commission "
          amount={stats?.grossCommission || 0}
          type="voilet"
          subLabel1="Gross Commission"
          icon={IndianRupee}
        />
        <StatCard
          label="Total Tds"
          amount={stats?.totalTds || 0}
          type="orange"
          subLabel1="Total Tds"
          icon={IndianRupee}
        />
        <StatCard
          label="Total Commission "
          amount={stats?.netCommission || 0}
          type="indigo"
          subLabel1="Net Commission"
          icon={IndianRupee}
        />

      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Commission Distribution Logs</h2>
        </div>
        <DataTable
          fileName="commission_report"
          searchPlaceholder="Search by reference ID, description..."
          searchValue={search}
          searchChange={(e) => setSearch(e.target.value)}
          columns={columns}
          data={reportData}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPaginationChange={handlePageChange}
        />
      </div>
    </PageLayout>
  );
}
