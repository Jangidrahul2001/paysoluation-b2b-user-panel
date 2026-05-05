import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { useClickOutside } from "../hooks/use-click-outside";
import { ConfirmationModal } from "../modal/ConfirmationModal";
import ClickToCopy from "../components/ui/ClickToCopy";
import { butteryDropdown } from "../lib/animations";
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar";
import {
  Link as LinkIcon,
  Building2,
  User,
  Hash,
  FileCheck,
  Check,
  UploadCloud,
  ArrowRightLeft,
  Search,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  ArrowRight,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { DataTable } from "../components/ui/DataTable";
import { PageLayout } from "../components/layout/PageLayout";
import { Select } from "../components/ui/Select";
import { apiEndpoints } from "../api/apiEndpoints";
import { usePost } from "../hooks/usePost";
import { formatDate, formatDateForBackend, formatIfscInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, ifscRegex, nameWithSpaceRegex } from "../utils/helperFunction";
import { getBanks } from "indian-bank-ifsc";
import { useFetch } from "../hooks/useFetch";
import ImageModal from "../components/ui/ImageModal";
import { Input } from "../components/ui/Input";
import StatusBadge from "../components/ui/StatusBadge";
import { ActionButtons } from "../components/ui/ActionButton";

export default function AccountWhitelist() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    bankName: "",
    chequeImage: null,
    passbookOrBankStatement: null,
  });
  const [banksList, setBanksList] = useState([]);



  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [whitelistData, setWhitelistData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [date, setDate] = useState({ from: null, to: null });
  const [statusFilter, setStatusFilter] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const calendarRef = useRef(null);
  useClickOutside(calendarRef, () => setIsCalendarOpen(false), "#mobile-calendar-portal");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [columnVisibility, setColumnVisibility] = useState({});

  const { refetch: refetchAccountWhiteList } = useFetch(
    `${apiEndpoints.accountWhitelist}?page=${pageIndex}&limit=${pageSize}&search=${search}&status=${statusFilter}&from=${formatDateForBackend(date.from)}&to=${formatDateForBackend(date.to)}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setWhitelistData(data?.data || []);
          setTotalRecords(data?.pagination?.total || 0);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log("error in fetching whitelist account  ", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  const { refetch: fetchBankList } = useFetch(
    `${apiEndpoints.fetchAllBanks}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data.map((item) => ({ ...item, label: item.bankName, value: item.bankName }))
          setBanksList(temp || []);
        }
      },
      onError: (error) => {
        console.log("error in fetching banklist", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  useEffect(() => {
    refetchAccountWhiteList();
  }, [pageIndex, pageSize, search, statusFilter, date.to, date.from]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const { post: accountWhiteList } = usePost(apiEndpoints.accountWhitelist, {
    onSuccess: (res) => {
      toast.success(res.message || "Bank account whiteListed successfully");
      setFormData({
        accountNumber: "",
        ifscCode: "",
        accountHolderName: "",
        bankName: "",
        chequeImage: null,
        passbookOrBankStatement: null,
      });
      refetchAccountWhiteList();
    },
    onError: (error) => {
      console.error("Failed to whitelist bank account:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsLoading(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = "IFSC code is required";
    } else if (!ifscRegex.test(formData.ifscCode)) {
      newErrors.ifscCode = "Invalid IFSC format (e.g. HDFC0001234)";
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = "Account holder name is required";
    }
    else if (!nameWithSpaceRegex.test(formData.accountHolderName?.trim())) {
      newErrors.accountHolderName = "Enter a valid account holder name";
    }

    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.chequeImage)
      newErrors.chequeImage = "Cheque image is required";
    if (!formData.passbookOrBankStatement)
      newErrors.passbookOrBankStatement =
        "Passbook or 3 Months Bank Statement image is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      accountWhiteList(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Failed to whitelist bank account:", error);
      toast.error(handleValidationError(error) || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChequeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (200KB = 200 * 1024 bytes)
      const maxSize = 200 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 200KB");
        e.target.value = "";
        return;
      }

      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, JPG and PDF files are allowed");
        e.target.value = "";
        return;
      }

      setFormData({ ...formData, chequeImage: file });
      if (errors.chequeImage) setErrors({ ...errors, chequeImage: "" });
    }
  };

  const handlePassbookStatementChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // File size validation (200KB = 200 * 1024 bytes)
      const maxSize = 200 * 1024;
      if (file.size > maxSize) {
        toast.error("File size must be less than 200KB");
        e.target.value = "";
        return;
      }

      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG, JPG , PNG and PDF files are allowed");
        e.target.value = "";
        return;
      }

      setFormData({ ...formData, passbookOrBankStatement: file });
      if (errors.passbookOrBankStatement)
        setErrors({ ...errors, passbookOrBankStatement: "" });
    }
  };




  const tableColumns = [

    {
      header: "SR NO.",
      accessorKey: "id",
      center: true,
      cell: ({ row }) => <span className="text-[12px] text-slate-500">{(pageIndex - 1) * pageSize + row.index + 1}</span>,
    },
    {
      header: "DATE",
      accessorKey: "createdAt",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col py-1 items-center">
          <span className="text-[11px] whitespace-nowrap text-slate-700 uppercase tracking-tight">
            {formatDate(row.original.createdAt)}
          </span>
        </div>
      )
    },
    {
      accessorKey: "accountNumber",
      header: "Account Details",
      center: true,
      cell: ({ row }) => (
        <ClickToCopy text={row.original.accountNumber}>
          <div className="flex flex-col py-1 items-center">
            <span className="text-[13px] font-bold text-slate-800 tracking-tight">{row.original.accountNumber}</span>
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{row.original.bankName}</span>
          </div>
        </ClickToCopy>
      )
    },
    {
      accessorKey: "ifscCode",
      header: "IFSC",
      center: true,
      cell: ({ row }) => (
        <ClickToCopy text={row.original.ifscCode}>
          <span className="text-[12px]  text-slate-600 font-mono tracking-tight bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 uppercase">{row.original.ifscCode}</span>
        </ClickToCopy>
      )
    },
    {
      accessorKey: "accountHolderName",
      header: "Holder Name",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col items-center">
          <span className="text-[12px]  text-slate-700">{row.original.accountHolderName}</span>

        </div>
      )
    },
    {
      header: "Documents",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5 py-1 items-center">
          <button
            onClick={() => { setSelectedFile(`${import.meta.env.VITE_API_URL}${row.original.chequeImageUrl}`); setImageModalOpen(true); }}
            className="flex cursor-pointer items-center justify-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/50 w-fit"
          >
            <File size={12} strokeWidth={3} /> View Cheque
          </button>
          <button
            onClick={() => { setSelectedFile(`${import.meta.env.VITE_API_URL}${row.original.passbookOrBankStatementUrl}`); setImageModalOpen(true); }}
            className="flex cursor-pointer items-center justify-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors bg-blue-50/50 px-3 py-1 rounded-lg border border-blue-100/50 w-fit"
          >
            <File size={12} strokeWidth={3} /> View Statement
          </button>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "reason",
      center: true,
      cell: ({ row }) => (
        <span className="text-[12px] font-bold text-slate-600 font-mono tracking-tight uppercase">{row.original.reason || "-"}</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      center: true,
      cell: ({ row }) => (<div className="flex justify-center">
        <StatusBadge status={row.original.status} />
      </div>)
    }
  ];

  return (
    <>
      <ImageModal
        images={[selectedFile]}
        isOpen={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          setSelectedFile(null);
        }}
      />

      <PageLayout
        title="Account Whitelist"
        subtitle="Submit bank details and documentation for verification"
        actions={
          <div className="relative z-[100] flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex-1 sm:flex-none sm:w-[160px] min-w-[130px]">
              <Select
                options={[
                  { label: "All Status", value: "" },
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="Select Filter"
                className="!rounded-xl !h-10 !border-slate-200 shadow-sm !bg-white !px-4 !text-[13px] !font-bold"
              />
            </div>

            {/* Date Picker Trigger */}
            <div className="relative flex-1 sm:flex-none sm:w-auto min-w-[160px]" ref={calendarRef}>
              <div
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={cn(
                  "h-10 px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between sm:justify-start gap-2.5 text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-indigo-500/50 hover:bg-slate-50 transition-all group select-none",
                  !date?.from && "text-slate-400",
                  isCalendarOpen && "border-indigo-500 ring-4 ring-indigo-500/10"
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
                    style={{ width: "max-content", maxWidth: "94vw" }}
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
        }
        className="max-w-[1600px] mx-auto py-4"
      >
        <div className="flex flex-col gap-8 text-left">
          {/* Unified Entry Frame - Pro SaaS Architecture */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ zIndex: 60 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/50 relative group"
          >
            {/* High-Resolution Ambient Flare (Contained separately) */}
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full -mr-48 -mt-48 blur-[100px] group-hover:opacity-100 opacity-60 transition-opacity duration-1000" />
            </div>

            <div className="p-6 md:p-10 relative z-10 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

              {/* Left Segment: Core Intelligence Input */}
              <div className="flex-1 lg:pr-10 pb-10 lg:pb-0 space-y-9">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-lg">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Account Node</h3>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Configure Disbursement Endpoint</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                  <div className="space-y-2">

                    <Input
                      label="Account Number"
                      placeholder="0000 0000 0000"
                      className="!bg-slate-50/50 !border-slate-200/60 !rounded-xl !h-11 !text-[13px] !font-bold focus:!bg-white focus:!border-indigo-500/50 transition-all shadow-sm"
                      value={formData.accountNumber}
                      maxLength={18}
                      onChange={(e) => {
                        setFormData({ ...formData, accountNumber: formatNumberInput(e.target.value, 20) });
                        if (errors.accountNumber) setErrors({ ...errors, accountNumber: "" });
                      }}
                      error={errors.accountNumber}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="IFSC Code"
                      placeholder="ABCD0123456"
                      className="!bg-slate-50/50 !border-slate-200/60 !rounded-xl !h-11 !text-[13px] !font-bold focus:!bg-white focus:!border-indigo-500/50 transition-all shadow-sm uppercase"
                      value={formData.ifscCode}
                      maxLength={11}
                      onChange={(e) => {
                        setFormData({ ...formData, ifscCode: formatIfscInput(e.target.value.toUpperCase()) });
                        if (errors.ifscCode) setErrors({ ...errors, ifscCode: "" });
                      }}
                      error={errors.ifscCode}
                    />
                  </div>

                  <div className="space-y-2">

                    <Input
                      label="Identity Holder Name"
                      placeholder="Full Legal Name"
                      className="!bg-slate-50/50 !border-slate-200/60 !rounded-xl !h-11 !text-[13px] !font-bold focus:!bg-white focus:!border-indigo-500/50 transition-all shadow-sm"
                      value={formData.accountHolderName}
                      onChange={(e) => {
                        setFormData({ ...formData, accountHolderName: formatNameInputWithSpace(e.target.value, 50) });
                        if (errors.accountHolderName) setErrors({ ...errors, accountHolderName: "" });
                      }}
                      error={errors.accountHolderName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Select
                      label="Financial Institution"
                      placeholder="Select Banking Partner"
                      options={banksList}
                      searchable={true}
                      value={formData.bankName}
                      onChange={(val) => setFormData({ ...formData, bankName: val })}
                      error={errors.bankName}
                      className="!bg-slate-50/50 !border-slate-200/60 !rounded-xl !h-11 !text-[13px] !font-bold shadow-sm h-11"
                    />
                  </div>
                </form>


              </div>

              {/* Right Segment: Asset Portal & Execution */}
              <div className="w-full lg:w-[400px] lg:pl-10 pt-10 lg:pt-0 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-none">Compliance</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-80">Artifact Verification</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                      <UploadCloud size={18} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Compact Image Selectors */}
                    <div className="relative group/zone cursor-pointer">
                      <input type="file" accept=".jpeg,.jpg,.pdf,.png" onChange={handleChequeChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className={cn(
                        "p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between bg-slate-50/50 hover:bg-white hover:border-indigo-400/40 hover:shadow-xl hover:shadow-slate-200/50",
                        errors.chequeImage ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                            <FileCheck size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Cancelled Cheque</p>
                            <p className="text-[10px] font-bold text-slate-400  max-w-[150px] mt-0.5">
                              {formData.chequeImage ? formData.chequeImage.name : "Allowed: JPEG, PDF and PNG"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400  max-w-[150px] mt-0.5">
                              {formData.chequeImage ? formData.chequeImage.name : "Max (200KB)"}
                            </p>
                          </div>
                        </div>
                        {formData.chequeImage && <Check size={16} className="text-emerald-500" strokeWidth={3} />}
                      </div>
                    </div>
                    {errors.chequeImage && (
                      <p className={cn(
                        "mt-1.5 text-xs font-medium text-red-600"
                      )}>{errors.chequeImage}</p>
                    )}

                    <div className="relative group/zone cursor-pointer">
                      <input type="file" accept=".jpeg,.jpg,.pdf,.png" onChange={handlePassbookStatementChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      <div className={cn(
                        "p-4 rounded-2xl border-2 border-dashed transition-all flex items-center justify-between bg-slate-50/50 hover:bg-white hover:border-indigo-400/40 hover:shadow-xl hover:shadow-slate-200/50",
                        errors.passbookOrBankStatement ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
                      )}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-500 shadow-sm">
                            <UploadCloud size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Statement/Passbook</p>

                            <p className="text-[10px] font-bold text-slate-400  max-w-[150px] mt-0.5">
                              {formData.passbookOrBankStatement ? formData.passbookOrBankStatement.name : "Allowed: JPEG, PDF and PNG"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400  max-w-[150px] mt-0.5">
                              {formData.passbookOrBankStatement ? formData.passbookOrBankStatement.name : "Max (200KB)"}
                            </p>
                          </div>
                        </div>
                        {formData.passbookOrBankStatement && <Check size={16} className="text-emerald-500" strokeWidth={3} />}
                      </div>
                    </div>
                    {errors.passbookOrBankStatement && (
                      <p className={cn(
                        "mt-1.5 text-xs font-medium text-red-600"
                      )}>{errors.passbookOrBankStatement}</p>
                    )}
                  </div>
                </div>

                {/* Optimized Standard Action Button */}
                <div className="mt-6 space-y-4">
                  {Object.keys(errors).length > 0 && (
                    <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle size={12} className="text-rose-500 shrink-0" />
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none">Compliance Field Missing</span>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-slate-900/10 active:scale-[0.98] border-none group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">Submit for Verification</span>
                    <ArrowRight size={16} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>

            </div>
          </motion.div>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 px-1">
              <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Whitelist Registry</h2>
            </div>
            <DataTable
              searchPlaceholder="Search logs..."
              fileName="account_whitelist"
              searchChange={(e) => setSearch(e.target.value)}
              columns={tableColumns}
              data={whitelistData}
              isLoading={isLoading}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPaginationChange={({ pageIndex, pageSize }) => {
                handlePageChange(pageIndex, pageSize);
                setIsLoading(true);
              }}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              searchValue={search}
            />
          </div>
        </div>
      </PageLayout>
    </>
  );
}
