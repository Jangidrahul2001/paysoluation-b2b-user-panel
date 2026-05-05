import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { format, set } from "date-fns";
import {
  Wallet,
  IndianRupee,
  Users as UsersIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  RotateCcw,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  Search,
  Eye,
  Users,
  Fingerprint,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { cn } from "../lib/utils";
import { useClickOutside } from "../hooks/use-click-outside";
import { butteryDropdown } from "../lib/animations";
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar";
import { Input } from "../components/ui/Input";
import { PageLayout } from "../components/layout/PageLayout";
import { DataTable } from "../components/ui/DataTable";
import { TableActions } from "../components/ui/TableExportActions";
import { ConfirmationModal } from "../modal/ConfirmationModal";

import { toast } from "sonner";
import { usePost } from "../hooks/usePost";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import { formatDate, formatDateForBackend, formatNumberInput, formatToINR, handleValidationError } from "../utils/helperFunction";
import { DownLineUserSelect } from "../components/ui/DownLineUserSelect";
import ClickToCopy from "../components/ui/ClickToCopy";
import { fetchWallet } from "../store/slices/walletSlice";
import { useDispatch, useSelector } from "react-redux";



export default function UserWalletRefill() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ userId: "", amount: "" });
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [recentRefills, setRecentRefills] = useState([]);
  const [search, setSearch] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [userFilter, setUserFilter] = useState("All");
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errors, setErrors] = useState({});
  const { data: wallet, loading: walletLoading } = useSelector((state) => state.wallet);

  // Pagination states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(false);

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

  const { refetch: fetchUserProfile } = useFetch(
    `${apiEndpoints.fetchUserProfileForWalletRefill}?userId=${formData.userId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setSelectedUser(data.data)
        }
      },
      onError: (error) => {
        console.log("error in fetching wallet refill history data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );




  const { refetch: fetchRefillHistory } = useFetch(
    `${apiEndpoints.walletRefillHistory}?page=${pageIndex}&limit=${pageSize}&search=${search}&user=${userFilter}&from=${formatDateForBackend(date?.from)}&to=${formatDateForBackend(date?.to)}`,

    {
      onSuccess: (data) => {
        if (data.success) {
          setRecentRefills(data.data || []);
          setTotalRecords(data?.pagination?.total || 0);
        }
        setIsTableLoading(false);
      },
      onError: (error) => {
        console.log("error in fetching wallet refill history data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsTableLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    setIsTableLoading(true);
    fetchRefillHistory();
  }, [date, pageIndex, pageSize, search, userFilter]);

  const { data: userData } = useFetch(
    `${apiEndpoints.fetchUser}?page=1&limit=1000`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setUsers(data.data || []);
        }
      },
      onError: (error) => {
        console.error("Error fetching users", error);
      },
    },
    true
  );

  const userOptions = users.map((u) => ({
    value: u._id,
    label: `${u.firstName} ${u.lastName} (${u.userName})`,
  }));

  const { post: createWalletRefill, isLoading: isProcessing } = usePost(
    `${apiEndpoints.createWalletRefill}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(`Successfully added ₹${formData.amount} to user's wallet!`);
          fetchRefillHistory();
          setFormData({ userId: "", amount: "" });
          dispatch(fetchWallet());
          setSelectedUser(null);
          setShowModal(false);
          setErrors({});
        }
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Refill failed");
        setShowModal(false);
        setErrors({});
      },
    }
  );

  const handleProcessRefill = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = "Please select a user";
    }
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    if (parseFloat(formData?.amount) > parseFloat(wallet?.mainWallet - wallet?.mainHoldAmount)) {
      newErrors.amount = "Amount must be less than wallet balance";
    
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setShowModal(true);
  };


  const handleConfirmRefill = async () => {

    try {
      await createWalletRefill({
        userId: formData.userId,
        amount: Number(formData.amount)
      });
    } catch (error) {
      console.error("Wallet refill error:", error);
    }
  };

  const handleReset = () => {
    setDate({ from: null, to: null });
    setUserFilter("All");
    setSearch("");


  };

  const handleSearch = () => {
    ;
  };

  // Handle pagination change
  const handlePaginationChange = ({ pageIndex: newPageIndex, pageSize: newPageSize }) => {
    setPageIndex(newPageIndex);
    setPageSize(newPageSize);

  };

  // Handle search change with debounce
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Handle user filter change
  const handleUserFilterChange = (value) => {
    setUserFilter(value);


  };

  useEffect(() => {
    if (formData.userId) {
      fetchUserProfile();
    } else {
      setSelectedUser(null);
    }
  }, [formData.userId]);

  const tableColumns = [
    {
      header: "SR.NO.",
      accessorKey: "id",
      center: true,
      cell: ({ row }) => <span className="text-[12px]  text-slate-500">{((pageIndex - 1) * pageSize) + row.index + 1}</span>,
    },
    {
      header: "DATE",
      accessorKey: "createdAt",
      center: true,
      cell: ({ row }) => (
          <span className="text-[11px]  text-slate-700 uppercase whitespace-nowrap tracking-tight">
            {formatDate(row.original.createdAt)}
          </span>
       
      )
    },
    {
      header: "USER NAME",
      accessorKey: "name",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col py-1 items-center">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[12px]  text-slate-800 tracking-tight">{row.original.name}</span>
          </div>
          <ClickToCopy text={row.original.userName} >
            <span className="text-[9px]  text-slate-500 uppercase tracking-widest leading-none mt-0.5">({row.original.userName})</span>
          </ClickToCopy>
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
      ),
    },
    {
      header: "TXN AMOUNT",
      accessorKey: "amount",
      center: true,
      cell: ({ row }) => <span className="text-[14px] font-bold text-slate-700">{formatToINR(row.original.amount)}</span>,
    },
    {
      header: "Before WALLET",
      accessorKey: "openingBalance",
      center: true,
      cell: ({ row }) => <span className="text-[12px]  text-slate-700  ">{formatToINR(row.original.openingBalance || 0)}</span>,
    },
    {
      header: "AFTER WALLET",
      accessorKey: "closingBalance",
      center: true,
      cell: ({ row }) => <span className="text-[12px]  text-slate-700 ">{formatToINR(row.original.closingBalance || 0)}</span>,
    },
  ];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-3">
      {/* User Filter Dropdown */}
      <div className="flex-1 sm:flex-none sm:w-[180px] min-w-[140px]">

        <DownLineUserSelect removeOwn={true} value={userFilter} onChange={handleUserFilterChange} className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold" />
        {/* <Select
          options={[
            { label: 'All Users', value: 'All' },
            ...Array.from(new Set(users.map(u => u.userName))).map(name => ({ label: name, value: name }))
          ]}
          value={userFilter}
          onChange={handleUserFilterChange}
          placeholder="Select User"
          className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
        /> */}
      </div>

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
      title="User Wallet Refill"
      subtitle="Directly manage and top-up user wallet balances"
      className="max-w-[1600px] mx-auto py-4"
      actions={headerActions}
    >
      <div className="flex flex-col gap-8">
        {/* Top Control Grid - Perfectly Balanced Symmetrical Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch relative z-20">

          {/* Refill Initiation Card */}
          <motion.div
            className="bg-gradient-to-br from-indigo-50/20 via-white to-slate-50/30 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200/60 relative group transition-all duration-500 overflow-visible"
          >
            {/* Soft Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-white to-slate-50/30 opacity-100 pointer-events-none rounded-[2rem]" />

            <div className="p-6 md:p-8 space-y-7 relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Process Refill</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Instant Wallet Credit System
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/5 text-indigo-600 flex items-center justify-center border border-indigo-500/10 transition-all hover:scale-105 shadow-sm">
                  <Zap size={20} fill="currentColor" className="opacity-80" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="space-y-2">

                  <Select
                    label={"Registered User"}
                    placeholder="Select a registered user..."
                    options={userOptions}
                    value={formData.userId}
                    onChange={(val) => { setFormData({ ...formData, userId: val }); setErrors(prev => ({ ...prev, userId: "" })) }}
                    searchable={true}
                    error={errors.userId}
                    className="!bg-white/60 !backdrop-blur-sm  !border-slate-200/80 !shadow-sm !rounded-xl !h-11 !text-sm !font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="Refill Amount (₹)"
                    name="amount"
                    placeholder="e.g. 5000"
                    value={formData.amount}
                    error={errors.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: formatNumberInput(e.target.value, 8) });
                      setErrors(prev => ({ ...prev, amount: "" }))
                    }}
                    className="!bg-white/60 !backdrop-blur-sm !border-slate-200/80 !shadow-sm !rounded-xl !h-11 !text-sm !font-bold !placeholder-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleProcessRefill}
                  disabled={isProcessing}
                  className="w-full !h-11 !rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none group"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Zap size={18} className="transition-transform group-hover:scale-110 group-hover:rotate-12" />
                      Complete Wallet Refill
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* User Preview Insights Card */}
          <motion.div
            className="h-full bg-gradient-to-br from-indigo-50/20 via-white to-slate-50/30 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-200/60 relative group transition-all duration-500 overflow-visible flex flex-col"
          >
            <div className="p-6 md:p-8 space-y-7 relative z-10 flex-1 flex flex-col">
              {/* Dynamic Abstract Background */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">User Profile Insights</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    Verification Protocol
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedUser && (
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-50/50 px-4 py-2 rounded-2xl border border-indigo-200/50 flex flex-col items-start min-w-[120px] shadow-sm transition-all hover:bg-indigo-100/50 group">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wallet size={10} className="text-indigo-600" />
                          <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest leading-none">Main Wallet</span>
                        </div>
                        <span className="text-[15px] font-black text-indigo-900 leading-none">{formatToINR(selectedUser.mainWallet)}</span>
                      </div>
                      <div className="bg-amber-50/50 px-4 py-2 rounded-2xl border border-amber-200/50 flex flex-col items-start min-w-[120px] shadow-sm transition-all hover:bg-amber-100/50 group">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Fingerprint size={10} className="text-amber-600" />
                          <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">AEPS Wallet</span>
                        </div>
                        <span className="text-[15px] font-black text-amber-900 leading-none">{formatToINR(selectedUser.aepsWallet)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <AnimatePresence mode="wait">
                  {selectedUser ? (
                    <motion.div
                      key={selectedUser._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full space-y-2"
                    >
                      <div className="space-y-2 px-0.5">
                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">User Identification</label>
                        <div className="bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-sm rounded-xl h-11 px-4 flex items-center group hover:border-indigo-100/50 transition-colors">
                          <div className="flex items-center gap-3 relative z-10 w-full">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-[10px] font-black shadow-md shrink-0">
                              <span>{selectedUser?.name?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between">
                              <h4 className="text-[13px] font-bold text-slate-900 truncate">
                                {selectedUser.name}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedUser.userName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mt-4">
                        <div className="space-y-2 px-0.5">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Mobile Number</label>
                          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-sm rounded-xl h-11 px-4 flex items-center text-sm font-bold text-slate-800 truncate">
                            {selectedUser.phone || "N/A"}
                          </div>
                        </div>
                        <div className="space-y-2 px-0.5">
                          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">Email ID</label>
                          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/80 shadow-sm rounded-xl h-11 px-4 flex items-center text-[12px] font-bold text-indigo-600 truncate">
                            {selectedUser.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center space-y-6"
                    >
                      <div className="relative inline-block">
                        <div className="w-18 h-18 rounded-full bg-slate-50/80 border-2 border-dashed border-slate-200 flex items-center justify-center group-hover:border-indigo-300 transition-colors duration-500">
                          <Users size={22} className="text-slate-300 group-hover:text-indigo-400 transition-colors duration-500" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-slate-100 shadow-xl flex items-center justify-center">
                          <Search size={16} className="text-slate-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[13px] font-black text-slate-800 tracking-tight uppercase leading-none">No profile selected</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-[250px] mx-auto leading-relaxed">Choose a direct user to verify wallet credentials & limits</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3 px-1">
            <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Wallet Refill History</h2>
          </div>
          <DataTable
            searchPlaceholder="Search logs..."
            fileName="Wallet_Refill_Logs"
            searchChange={handleSearchChange}
            columns={tableColumns}
            data={recentRefills}
            isLoading={isTableLoading}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            totalRecords={totalRecords}
            pageSize={pageSize}
            searchValue={search}
            onPaginationChange={handlePaginationChange}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmRefill}
        title="Authorize Refill"
        description="Please confirm the user credentials and top-up amount below."
        confirmText={isProcessing ? "Processing..." : "Confirm & Authorize"}
        cancelText="Cancel"
      >
        <div className="bg-slate-50 w-full p-5 rounded-3xl border border-slate-100 flex flex-col gap-4 mt-5 relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Account</span>
            <span className="text-sm font-black text-slate-800">
              {selectedUser ? `${selectedUser.name} ` : "-"}
            </span>
          </div>
          <div className="flex justify-between items-end relative z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">Refill Volume</span>
            <span className="text-3xl font-black text-emerald-600 tracking-tighter">
              {formatToINR(formData?.amount || 0)}
            </span>
          </div>

          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -mr-12 -mt-12" />
        </div>
      </ConfirmationModal>
    </PageLayout>
  );
}
