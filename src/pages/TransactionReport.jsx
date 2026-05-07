import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from "react-dom";
import {
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Calendar as CalendarIcon,
  ChevronDown,
  ShieldCheck,
  Eye,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { DataTable } from '../components/ui/DataTable';
import { TableActions } from '../components/ui/TableExportActions';
import { cn } from '../lib/utils';
import { PageLayout } from '../components/layout/PageLayout';
import { CustomDualCalendar } from '../components/dashboard/CustomDualCalendar';
import { format } from 'date-fns';
import { butteryDropdown, aliveHover, containerEntrance, listStagger } from '../lib/animations';
import { apiEndpoints } from '../api/apiEndpoints';
import { useFetch } from "../hooks/useFetch";
import { toast } from 'sonner';
import { formatDate, formatDateForBackend, formatToINR, handleValidationError } from '../utils/helperFunction';
import { useSelector } from 'react-redux';
import { DownLineUserSelect } from '../components/ui/DownLineUserSelect';
import ClickToCopy from '../components/ui/ClickToCopy';
import StatusBadge from '../components/ui/StatusBadge';
import { ActionButtons } from '../components/ui/ActionButton';

// --- Improved Sub-components ---

const StatCard = ({ label, count, amount, type, icon: Icon, subLabel1, subLabel2 }) => {
  const styles = {
    success: {
      bg: "bg-emerald-100",
      icon: "text-emerald-600",
      border: "border-emerald-100",
      text: "text-emerald-700",
      gradient: "from-white to-emerald-50"
    },
    failed: {
      bg: "bg-rose-100",
      icon: "text-rose-600",
      border: "border-rose-100",
      text: "text-rose-700",
      gradient: "from-white to-rose-50"
    },
    pending: {
      bg: "bg-amber-100",
      icon: "text-amber-600",
      border: "border-amber-100",
      text: "text-amber-700",
      gradient: "from-white to-amber-50"
    },
    commission: {
      bg: "bg-indigo-100",
      icon: "text-indigo-600",
      border: "border-indigo-100",
      text: "text-indigo-700",
      gradient: "from-white to-indigo-50"
    },
  }[type];

  return (
    <motion.div
      {...aliveHover}
      className={cn(
        "p-5 rounded-2xl bg-gradient-to-tr border shadow-sm transition-all duration-300 h-full cursor-default",
        styles.gradient,
        styles.border
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2.5 rounded-xl", styles.bg)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      </div>
      <div>
        {amount !== undefined ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{subLabel1 || "Total Count"}</span>
              <span className={cn("text-lg font-black", styles.text)}>{count}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{subLabel2 || "Total Volume"}</span>
              <span className={cn("text-lg font-black", styles.text)}>₹{amount.toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-transparent pb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{subLabel1 || "Total Earned"}</span>
              <span className={cn("text-2xl font-black", styles.text)}>₹{count.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function TransactionReport() {
  const navigate = useNavigate()
  const { service } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [optionsUserList, setOptionsUserList] = useState([]);
  const [statsData, setStatsData] = useState({});


  const [columnVisibility, setColumnVisibility] = useState({});
  const [search, setSearch] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(0); // Start from 0 for table pagination
  const [pageSize, setPageSize] = useState(10);
  const [reportData, setReportData] = useState([]);
  const [date, setDate] = useState({
    from: null,
    to: null
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  const [filters, setFilters] = useState({
    selectedUser: '',
    type: 'All'
  });

  const { data: profile } = useSelector((state) => state.profile);

  // Fetch user list for dropdown
  const { refetch: fetchUserList } = useFetch(
    `${apiEndpoints.fetchUser}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data.map((item) => {
            return {
              label: item.firstName + " " + item.lastName,
              value: item._id
            }
          })
          setOptionsUserList(temp);
        }
      },
      onError: (error) => {
        console.log("error in fetching userList", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const statsEndPoint = {
    recharge: "rechargeStats",
    bbps: "bbpsStats",
    "aeps1": "aeps1stats",
    "aeps2": "aeps2stats",
    dmt: "dmtStats",
    "xpress-payout": "xpressPayoutStats",
    "aeps-payout": "aepsPayoutStats",
  }

  // Fetch stats data
  const { refetch: refetchStatsData } = useFetch(
    `${apiEndpoints?.[statsEndPoint[service]]}?user=${filters.selectedUser === "" ? "" : filters.selectedUser}${date.from !== null ? `&from=${formatDateForBackend(date.from)}` : ""}${date.to !== null ? `&to=${formatDateForBackend(date.to)}` : ""}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setStatsData(data.data);
        }
      },
      onError: (error) => {
        console.log("error in fetching stats data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );

  const tableDataEndPoint = {
    recharge: "rechargeReports",
    bbps: "bbpsReports",
    "aeps1": "aeps1Reports",
    "aeps2": "aeps2Reports",
    dmt: "dmtReports",
    "xpress-payout": "xpressPayoutReports",
    "aeps-payout": "aepsPayoutReports",
  }

  // Fetch table data with proper pagination (pageIndex + 1 for API)
  const { refetch: refetchData } = useFetch(
    `${apiEndpoints?.[tableDataEndPoint[service]]}?user=${filters.selectedUser === "" ? "" || "" : filters.selectedUser
    }${date.from ? `&from=${formatDateForBackend(date.from)}` : ""
    }${date.to ? `&to=${formatDateForBackend(date.to)}` : ""
    }&search=${search}&page=${pageIndex + 1}&limit=${pageSize}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setReportData(data.data);
          setTotalRecords(data.pagination.total);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log("error in fetching reports data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  // Effect for stats data
  useEffect(() => {
    if (statsEndPoint[service] && apiEndpoints?.[statsEndPoint[service]]) {
      refetchStatsData();
    }

  }, [filters, service, date]);



  useEffect(() => {
    if (tableDataEndPoint[service] && apiEndpoints?.[tableDataEndPoint[service]]) {
      setIsLoading(true);
      refetchData();
    }

  }, [filters, search, service, date]);


  useEffect(() => {
    if (pageIndex > 0 || pageSize !== 10) {
      if (tableDataEndPoint[service] && apiEndpoints?.[tableDataEndPoint[service]]) {
        refetchData();
      }
    }
  }, [pageIndex, pageSize]);

  // Handle pagination change - pageIndex comes as 0-based from DataTable
  const handlePageChange = ({ pageIndex: newPage, pageSize: newSize }) => {

    setPageIndex(newPage - 1);
    setPageSize(newSize);
    setIsLoading(true)
  };

  const handleReset = () => {
    setDate({ from: null, to: null });
    setFilters({
      selectedUser: '',
      type: 'All'
    });
    setSearch("");
    setPageIndex(0); // Reset to first page
  };

  // Responsive check for portal
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns = [
    {
      header: "SR NO.",
      id: "srNo",
      center: true,
      className: "w-20",
      cell: ({ row, index }) => <span className="  text-slate-600  tracking-tight">
        {pageIndex * pageSize + index + 1}</span>
    },
    {
      header: "DATE",
      accessorKey: "createdAt",
      center: true,
      cell: ({ row }) => (
        <span className="  text-slate-600 whitespace-nowrap">
          {formatDate(row?.original?.createdAt) || row?.original?.createdAt}
        </span>
      )
    },
    {
      header: "NAME & USER ID",
      id: "nameUserId",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] \ text-slate-900 capitalize">{row?.original?.fullName} {row?.original?.user?.lastName}</span>
          </div>
          <span className="text-[11px] text-slate-500 \">({row.original?.userName})</span>
        </div>
      )
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
    ...(service === "aeps1" || service === "aeps2" ? [
      {
        header: "Category",
        accessorKey: "serviceType",
        center: true,
        cell: ({ row }) => <span className="  text-slate-600">{row.original.serviceType}</span>
      },] : []),
    {
      header: "TRANSACTION AMOUNT",
      accessorKey: "amount",
      center: true,
      cell: ({ row }) => <span className="text-sm font-black text-slate-900 tabular-nums">{formatToINR(row.original.amount)}</span>
    },
    {
      header: "COMMISSION",
      accessorKey: "commission",
      center: true,
      cell: ({ row }) => <span className="text-[12px]  text-slate-500">{formatToINR(row.original.commission)}</span>
    },
     {
      header: "Charge",
      accessorKey: "charge",
      center: true,
      cell: ({ row }) => <span className="text-[12px] 
       text-slate-500">{formatToINR(row.original.charge)}</span>
    },
     {
      header: "GST",
      accessorKey: "gstAmount",
      center: true,
      cell: ({ row }) => <span className="text-[12px] 
       text-slate-500">{formatToINR(row.original.gstAmount)}</span>
    },
    {
      header: "TDS",
      accessorKey: "tdsAmount",
      center: true,
      cell: ({ row }) => <span className="text-[12px] 
       text-slate-500">{formatToINR(row.original.tds)}</span>
    },
    {
      header: "STATUS",
      accessorKey: "status",
      center: true,
      cell: ({ row }) => (<div className="flex justify-center">
        <StatusBadge status={row.original.status} />
      </div>)
    },
    {
      header: "VIEW",
      id: "actions",
      center: true,
      cell: ({ row }) => (
        <ActionButtons
          onView={() => {
            navigate(
              `/transaction-report/${service}/${row.original?._id}`,
              {
                state: {
                  service
                },
              }
            );
          }}
          viewTitle="View Details"
        />
      )

    }
  ];

  const extraFilter = [
    {
      options:
        [
          { label: 'All', value: 'All' },
          { label: 'Credit', value: 'Credit' },
          { label: 'Debit', value: 'Debit' },
        ],
      value: filters.type,
      onChange: (value) => setFilters({ ...filters, type: value }),

      placeholder: "Txn Type"
    }
  ]

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
      <div className="flex-1 sm:flex-none sm:w-[180px] min-w-[140px]">
        <DownLineUserSelect placeholder='Select User' value={filters.selectedUser} onChange={(val) => setFilters(prev => ({ ...prev, selectedUser: val }))} className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold" />
      </div>

      <div className="relative flex-1 sm:flex-none sm:w-auto min-w-[160px]" ref={calendarRef}>
        <div
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className={cn(
            "h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-[#2f35cd]/50 hover:bg-slate-50 transition-all group select-none",
            !date?.from && "text-slate-400",
            isCalendarOpen && "border-[#2f35cd]/50 ring-4 ring-[#2f35cd]/10"
          )}
        >
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-[#2f35cd] transition-colors" />
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
            isCalendarOpen ? "rotate-180 text-[#2f35cd]" : "text-slate-300"
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
                onApply={() => { setIsCalendarOpen(false); }}
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
                  className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm"
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
                    onApply={() => { setIsCalendarOpen(false); }}
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
      title="Transaction Report"
      subtitle="Detailed breakdown of transactions and earnings."
      actions={headerActions}
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="flex flex-col gap-6 font-sans">
        {/* Stats Summary Cards */}
        <motion.div
          variants={listStagger.container}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2"
        >
          <motion.div variants={listStagger.item}>
            <StatCard
              label="Successful Txns"
              count={statsData?.success?.count || 0}
              amount={statsData?.success?.amount || 0}
              type="success"
              icon={CheckCircle2}
            />
          </motion.div>
          <motion.div variants={listStagger.item}>
            <StatCard
              label="Pending Txns"
              count={statsData?.pending?.count || 0}
              amount={statsData?.pending?.amount || 0}
              type="pending"
              icon={Clock}
            />
          </motion.div>
          <motion.div variants={listStagger.item}>
            <StatCard
              label="Failed Txns"
              count={statsData?.failed?.count || 0}
              amount={statsData?.failed?.amount || 0}
              type="failed"
              icon={XCircle}
            />
          </motion.div>
          <motion.div variants={listStagger.item}>
            <StatCard
              label="Total TXNS"
              count={statsData?.total?.count || 0}
              amount={statsData?.total?.commission || statsData?.total?.charges || 0}
              type="commission"
              subLabel1="Total TXNS"
              subLabel2={statsData?.total?.commission !== undefined ? "Total Commission" : "Total Charges"}
              icon={IndianRupee}
            />
          </motion.div>
        </motion.div>

        {/* Results Card Section */}
        <motion.div
          {...containerEntrance}
          className="overflow-visible"
        >
          {/* Action & Search Header */}
          {/* <div className="flex flex-col lg:flex-row items-center justify-between gap-5 p-4 border-b border-slate-50 bg-slate-50/30 relative z-20"> */}
          {/* <div className="flex flex-wrap items-center gap-3"> */}
          {/* <TableActions
                data={reportData}
                columns={columns}
                fileName="transaction_report"
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
              /> */}

          {/* Unique Dropdown Filter for Transaction Type */}
          {/* <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-[150px] min-w-[130px]">
                <div className="w-full relative group">
                  <Select
                    options={[
                      { label: 'All', value: 'All' },
                      { label: 'Credit', value: 'Credit' },
                      { label: 'Debit', value: 'Debit' },
                    ]}
                    value={filters.type}
                    onChange={(value) => setFilters({ ...filters, type: value })}
                    placeholder="Txn Type"
                    className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
                  />
                </div>
              </div> */}
          {/* </div> */}

          {/* <div className="flex items-center justify-center lg:justify-end gap-4 w-full lg:w-auto px-1">
              <div className="w-full max-w-[400px] lg:w-auto relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors z-10" />
                <input
                  type="text"
                  placeholder="Search by name, reference ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 bg-white border border-slate-100 text-slate-800 text-[13px] font-bold rounded-xl focus:ring-4 focus:ring-slate-900/5 transition-all outline-none pl-11 pr-5 placeholder:text-slate-200"
                />
              </div>
            </div> */}
          {/* </div> */}

          {/* <div className="p-0"> */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 px-1">
              <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Transaction Activity Logs</h2>
            </div>
            <DataTable
              searchPlaceholder="Search by name, reference ID..."
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
          {/* </div> */}
        </motion.div>
      </div>
    </PageLayout>
  );
}
