import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  Info,
  Copy,
  CheckCircle2,
  QrCode,
  Building2,
  CreditCard,
  Calendar,
  FileText,
  Banknote,
  Send,
  Rocket,
  PenTool,
  LayoutDashboard,
  Image as ImageIcon,
  Wallet,
  ArrowRight,
  Activity,
  Zap,
} from "lucide-react";
import { Select } from "../../components/ui/Select";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { TableActions } from "../../components/ui/TableExportActions";
import { useFetch } from "../../hooks/useFetch";
import { apiEndpoints } from "../../api/apiEndpoints";
import { usePost } from "../../hooks/usePost";
import {

  formatAlphaNumeric,
  formatDate,
  formatNumberInput,
  formatUtrInput,
  handleValidationError,
  validateUtrLength,
} from "../../utils/helperFunction";
import { Input } from "../../components/ui/Input";
import { format } from "date-fns";
import { CustomSingleCalendar } from "../../components/dashboard/CustomSingleCalendar";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import ClickToCopy from "../../components/ui/ClickToCopy";
import StatusBadge from "../../components/ui/StatusBadge";
import ImageModal from "../../components/ui/ImageModal";
import { ActionButtons } from "../../components/ui/ActionButton";
import ExpandableMessage from "../../components/ui/ExpandableMessage";




const PAYMENT_MODES = [
  { value: "upi", label: "UPI" },
  { value: "imps", label: "IMPS" },
  { value: "neft", label: "NEFT" },
];

const OfflineTopup = () => {
  const navigate = useNavigate();
  const [bankList, setBankList] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    amount: "",
    mode: "",
    paymentDate: "",
    utrNumber: "",
    paymentProof: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [topupRequests, setTopupRequests] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = React.useRef(null);
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

  const {
    data,
    error,
    refetch: refetchBankList,
  } = useFetch(
    `${apiEndpoints.fetchAdminBankList}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data?.data?.map((bank) => {
            return {
              ...bank,
              label: bank.bankName,
              value: bank._id,
            };
          });
          setBankList(temp);

          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.log("error in fetching user data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { refetch: refetchTopUpRequest } = useFetch(
    `${apiEndpoints.fetchTopUpRequest}?page=${pageIndex}&limit=${pageSize}&search=${search}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setTopupRequests(data.data || []);
          setTotalRecords(data?.pagination?.total || 0);
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.log("error in fetching topup request data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    false,
  );

  useEffect(() => {
    refetchTopUpRequest();
  }, [pageIndex, pageSize]);

  const handlePageChange = (newPageIndex, newPageSize) => {
    if (newPageIndex !== pageIndex || newPageSize !== pageSize) {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    }
  };

  const { post: createTopUpRequest } = usePost(
    apiEndpoints?.createTopUpRequest,
    {
      onSuccess: (data) => {
        console.log(data);
        if (data.success) {
          toast.success(
            data.message || "TopUp Request submitted successfully!",
          );
          setFormData({
            amount: "",
            mode: "",
            paymentDate: "",
            utrNumber: "",
            paymentProof: null,
          });
          setFilePreview(null);
          setSelectedBank(null);
          refetchTopUpRequest();
        }
        setIsFormLoading(false);
      },
      onError: (error) => {
        console.error("Submission topup request error:", error);
        setIsFormLoading(false);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
  );

  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);


  const columns = React.useMemo(() => [
    {
      header: "SR.NO.",
      center: true,
      cell: ({ row, index }) => <span className="text-[12px]  text-slate-500">
        {(pageIndex - 1) * pageSize + index + 1}
      </span>
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
          <span className="text-[11px]  text-slate-500 uppercase tracking-tight">{formatDate(row.original.createdAt)}</span>


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
      cell: ({ row }) => <span className="text-[12px] font-bold text-slate-900 font-mono tracking-tighter">₹{row.original.amount?.toLocaleString() || 0}</span>
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
      cell: ({ row }) => (
        <ExpandableMessage
          text={row.original.rejectionReason || "Offline topup request"}
        />
      )
    },

  ], [selectedImage, pageIndex, pageSize]);


  const handleBankChange = (bankValue) => {
    const bank = bankList.find((b) => b.value === bankValue);
    setSelectedBank(bank);
    setFormData((prev) => ({ ...prev, bank_id: bankValue }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      setFormData((prev) => ({ ...prev, [name]: formatNumberInput(value, 8) }));
    } else if (name === 'utrNumber') {
      setFormData((prev) => ({
        ...prev,
        [name]: formatUtrInput(value, formData.mode)
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
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

      setFormData((prev) => ({ ...prev, paymentProof: file }));
      setErrors((prev) => ({ ...prev, paymentProof: "" }));
      // Create preview for image files
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };




  // Update validateForm function
  const validateForm = () => {
    const newErrors = {};

    if (!selectedBank) {
      newErrors.bank = "Please select a bank";
      toast.error("Please select a bank");
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    if (formData.amount > 10000000) {
      newErrors.amount = "Please enter a amount less than 1 crore";
    }

    if (!formData.mode) {
      newErrors.mode = "Please select payment mode";
    }

    if (!formData.utrNumber) {
      newErrors.utrNumber = "Please enter UTR number";
    } else if (!validateUtrLength(formData.utrNumber, formData.mode)) {
      const minLength = formData.mode?.toLowerCase() === 'upi' ? 12 :
        formData.mode?.toLowerCase() === 'imps' ? 16 : 22;
      newErrors.utrNumber = `UTR must be at least ${minLength} characters for ${formData.mode?.toUpperCase()}`;
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Please select payment date";
    } else if (new Date(formData.paymentDate) > new Date()) {
      newErrors.paymentDate = "Payment date cannot be in the future";
    }

    if (!formData.paymentProof) {
      newErrors.paymentProof = "Please upload payment proof";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsFormLoading(true);

    const data = new FormData();

    // Personal Details
    data.append("paymentProof", formData.paymentProof);
    data.append("amount", formData.amount);
    data.append("mode", formData.mode);
    data.append("utrNumber", formData.utrNumber);
    data.append("paymentDate", formData.paymentDate);
    data.append("receiverBank", formData.bank_id);

    createTopUpRequest(data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const actions = (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span className="text-xs sm:text-sm text-[var(--content-text-muted)] font-medium">Terminal Active</span>
    </div>
  );

  return (
    <PageLayout
      title="Offline Topup"
      subtitle="Manual payment gateway for wallet recharge"
      actions={actions}
      className="max-w-[1600px] mx-auto py-4"
    >

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative items-stretch">
        {/* Left Column: Form & Selection (7 cols) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col h-full w-full">
          {/* Payment Details Form Card */}
          <div className="bg-gradient-to-tr from-white via-white to-indigo-50/40 rounded-[2rem] border border-indigo-100/60 shadow-sm p-5 sm:p-7 relative flex flex-col h-full w-full group">
            {/* Background Decoration - Isolated overflow to allow dropdowns/calendars to pop out */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] pointer-events-none">
              <div className="absolute top-[-20px] right-[-20px] opacity-[0.05] blur-md transition-transform duration-700 group-hover:scale-110">
                <Banknote size={200} strokeWidth={0.5} className="text-indigo-600" />
              </div>
            </div>

            <div className="relative z-10 flex flex-col h-full w-full">
              <div className="flex items-center justify-between pb-6 border-b border-indigo-100/30 relative z-10 mb-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Submit Payment Details</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter manual transaction info</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-50/50 border border-indigo-100 text-indigo-500 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-indigo-500/10">
                  <Zap size={20} className="fill-indigo-500 stroke-indigo-500 opacity-80" />
                </div>
              </div>

              {/* Bank Selection */}
              <div className="mb-8 relative z-50">

                <Select
                  label="Select Bank"
                  placeholder="Search and Select Bank..."
                  options={bankList}
                  name={"bankName"}
                  value={formData.bank_id}
                  onChange={handleBankChange}
                  searchable={true}
                  error={errors.bankname}
                />
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 flex-1 flex flex-col"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Amount"
                    icon={Banknote}
                    placeholder="Enter Amount"
                    type="number"
                    name="amount"
                    error={errors.amount}
                    value={formData.amount}
                    onChange={handleInputChange}

                  />

                  <div>
                    <label className="text-xs font-bold text-[var(--content-text-muted)] uppercase tracking-wider ml-1 block mb-1.5">
                      Payment Mode
                    </label>
                    <Select
                      placeholder="Select Mode"
                      options={PAYMENT_MODES}
                      value={formData.mode}
                      name="mode"
                      error={errors.mode}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          mode: val,
                        }))
                      }
                    />
                  </div>

                  <Input
                    label="UTR / Ref Number"
                    icon={Info}
                    placeholder="Enter UTR"
                    name="utrNumber"
                    value={formData.utrNumber}
                    onChange={handleInputChange}

                    error={errors.utrNumber}
                  />

                  <div className="relative" ref={calendarRef}>
                    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block mb-1.5 ml-1">
                      Payment Date
                    </label>
                    <div
                      onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                      className={cn(
                        "w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl px-4 flex items-center justify-between text-sm font-bold tracking-tight transition-all cursor-pointer hover:border-indigo-400 hover:bg-white group",
                        errors.paymentDate && "border-red-500 ring-4 ring-red-500/5",
                        formData.paymentDate && "bg-white border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={16} className={cn("transition-colors", formData.paymentDate ? "text-indigo-600" : "text-slate-200 group-hover:text-indigo-400")} />
                        <span className={cn(formData.paymentDate ? "text-slate-800" : "text-slate-300")}>
                          {formData.paymentDate ? format(new Date(formData.paymentDate), "MMM dd, yyyy") : "Select Date"}
                        </span>
                      </div>
                    </div>
                    {errors.paymentDate && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1 mt-1.5">{errors.paymentDate}</p>}

                    <AnimatePresence>
                      {isCalendarOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 6, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full z-[100] origin-top-right w-fit min-w-full sm:min-w-0"
                        >
                          <CustomSingleCalendar
                            selectedDate={formData.paymentDate ? new Date(formData.paymentDate) : null}
                            onDateSelect={(day) => {
                              setFormData({ ...formData, paymentDate: format(day, "yyyy-MM-dd") });
                              setIsCalendarOpen(false);
                              if (errors.paymentDate) setErrors({ ...errors, paymentDate: "" });
                            }}
                            onReset={() => {
                              setFormData({ ...formData, paymentDate: "" });
                              setIsCalendarOpen(false);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Proof Upload with Premium Look */}
                <div className="space-y-4 flex-1 flex flex-col">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 block opacity-60">
                    Payment Verification Payload
                  </label>
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center w-full min-h-[160px] flex-1 rounded-3xl cursor-pointer bg-white border border-indigo-100 shadow-sm  hover:shadow-indigo-500/5 transition-all duration-500 group overflow-hidden relative",
                      filePreview && "border-indigo-600 ring-4 ring-indigo-50"
                    )}
                  >
                    {filePreview ? (
                      <div className="w-full h-full flex items-center justify-center p-3 relative group/preview">
                        <div className="relative h-full max-h-[140px] flex items-center justify-center shadow-2xl rounded-2xl overflow-hidden">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="h-full w-auto object-contain bg-white scale-125 saturate-125"
                          />
                          <div className="absolute inset-0 bg-indigo-600/60 flex flex-col items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity backdrop-blur-sm">
                            <div className="bg-white/20 p-2.5 rounded-full mb-2 backdrop-blur-xl border border-white/20">
                              <Upload className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-white text-[9px] font-black tracking-widest uppercase">
                              RE-UPLOAD PROOF
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 transition-transform duration-700 group-hover:scale-105">
                        {formData.paymentProof ? (
                          <div className="flex flex-col items-center gap-4 text-emerald-600 font-bold p-6">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10 border border-emerald-100">
                              <FileText size={24} />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                {formData.paymentProof.name}
                              </p>
                              <div className="inline-flex mt-2 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-emerald-500/20">
                                Payload Locked
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-4  transition-transform shadow-inner border border-indigo-100/50">
                              <ImageIcon className="w-6 h-6 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div className="text-center px-6">
                              <p className="mb-1 text-xs text-slate-900 font-bold tracking-tight">
                                UPLOAD TRANSACTION PROOF
                              </p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                                PDF, JPG, PNG Supported
                              </p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-60">
                                MAX. 200KB
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".jpeg,.jpg,.pdf,.png"
                    />
                  </label>
                  {errors.paymentProof && (
                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1">
                      {errors.paymentProof}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-auto">
                  <Button
                    type="submit"
                    disabled={isFormLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-600/20 py-4 sm:py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
                  >
                    {isFormLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison / QR Details (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col ">
          <AnimatePresence mode="wait">
            {selectedBank ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="flex flex-col gap-4 w-full"
              >
                {/* QR Code Card */}
                <div className="bg-gradient-to-tr from-white via-white to-indigo-50/40 rounded-[2rem] border border-indigo-100/80 shadow-sm p-5 flex flex-col items-center text-center relative overflow-hidden flex-none justify-center group w-full h-auto">
                  <div className="flex items-center justify-between pb-5 border-b border-indigo-100/30 relative z-10 mb-6 w-full px-1">
                    <div className="space-y-1 text-left">
                      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Scan & Pay</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AUTOMATIC DETECTION</p>
                    </div>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-emerald-50/50 border border-emerald-100 text-emerald-500 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:rotate-6">
                      <QrCode size={18} className="stroke-[2]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center w-full">
                    <div className="p-2.5 bg-white border border-indigo-100 shadow-xl shadow-indigo-500/5 rounded-3xl relative w-full max-w-[150px] aspect-square flex items-center justify-center transition-transform duration-500 hover:scale-105">
                      <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
                        <img
                          src={`${import.meta.env.VITE_API_URL}${selectedBank.qrCode}`}
                          alt="QR Code"
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                    </div>
                  </div>

                  {/* UPI ID */}
                  <div className="mt-4 w-full max-w-[280px] mx-auto">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-2 text-center opacity-60">
                      UPI ID
                    </p>
                    <div className="flex items-center gap-2 bg-indigo-50/30 rounded-full border border-indigo-100/50 px-4 py-2 group hover:border-indigo-400/40 transition-colors">
                      <p className="font-mono font-bold text-slate-800 text-xs tracking-wide truncate flex-1 min-w-0 text-center group-hover:text-indigo-600 transition-colors">
                        {selectedBank.upiId || "Not Available"}
                      </p>
                      {selectedBank.upiId && (
                        <button
                          onClick={() => copyToClipboard(selectedBank.upiId)}
                          className="text-indigo-600 bg-white p-1 rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95 flex-shrink-0"
                        >
                          <Copy size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Details Card */}
                <div className="bg-gradient-to-tr from-white via-white to-indigo-50/40 rounded-[2rem] border border-indigo-100/60 shadow-sm p-5 relative overflow-hidden flex-none flex flex-col justify-center w-full h-auto">
                  <div className="flex items-center justify-between pb-5 border-b border-indigo-100/30 relative z-10 mb-6 w-full px-1">
                    <div className="space-y-1 text-left">
                      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Bank Details</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">BENEFICIARY INFO</p>
                    </div>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-indigo-50/50 border border-indigo-100 text-indigo-500 shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:-rotate-6">
                      <Building2 size={18} className="stroke-[2]" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full relative z-10 justify-center h-auto">
                    {[
                      { label: "Bank Name", value: selectedBank.bankName },
                      { label: "Account Number", value: selectedBank.accountNumber },
                      { label: "IFSC Code", value: selectedBank.ifscCode },
                      { label: "Beneficiary Name", value: selectedBank.accountHolderName, noCopy: true },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black ml-1 group-hover:text-indigo-400 transition-colors opacity-70">
                          {item.label}
                        </p>
                        <div className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-indigo-100/40 group hover:border-indigo-400/40 transition-colors w-full overflow-hidden shadow-sm shadow-indigo-500/5">
                          <div className="flex items-center justify-between gap-1 overflow-hidden w-full">
                            <p className={cn(
                              "font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate pr-2 flex-1 min-w-0 ",
                              item.label !== "Beneficiary Name" ? "font-mono text-xs" : "text-xs"
                            )}>
                              {item.value}
                            </p>
                            {!item.noCopy && (
                              <button
                                onClick={() => copyToClipboard(item.value)}
                                className="text-indigo-600 bg-white p-1.5 rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95 flex-shrink-0"
                              >
                                <Copy size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[2rem] border border-indigo-100/60 border-dashed shadow-sm p-8 flex flex-col items-center justify-center text-center h-full relative overflow-hidden group w-full min-h-[500px]"
              >
                <div className="absolute inset-0 bg-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-indigo-600/10 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border border-indigo-100 group-hover:scale-110 transition-transform duration-500">
                    <Building2
                      size={40}
                      className="text-slate-300 opacity-40 group-hover:opacity-100 group-hover:text-indigo-600 transition-all duration-500"
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">
                  Select a Bank
                </h3>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed relative z-10 max-w-[200px] opacity-60">
                  Choose a bank from the panel to view scan details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Report Table Section with Unified Design */}
      <div className="mx-2 mt-8 space-y-4">
        {/* Navigation Action */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">Recent Requests</h3>
          </div>
          <Button
            onClick={() => navigate('/topup/history')}
            variant="ghost"
            className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            View Full Audit
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* <div className="rounded-[2rem] border border-indigo-200/60 bg-gradient-to-tr from-white via-white to-indigo-50/40 shadow-sm overflow-hidden relative z-10 transition-all"> */}
        {/* Unified Filter & Action Header */}
        {/* <div className="flex flex-col lg:flex-row items-center justify-between gap-5 p-5 border-b border-indigo-100/30 bg-indigo-50/20 relative z-20">
            <div className="flex flex-wrap items-center gap-3">
              <TableActions
                data={topupRequests}
                columns={columns.map(c => ({
                  header: c.header,
                  accessorKey: c.accessorKey,
                  id: c.accessorKey
                }))}
                fileName="offline_topup_report"
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
              />
            </div>

            <div className="flex items-center justify-center lg:justify-end gap-4 w-full lg:w-auto px-1">
              <div className="w-full max-w-[400px] lg:w-auto relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors z-10" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full h-10 bg-white/70 border border-indigo-100 text-slate-800 text-[13px] font-bold rounded-xl focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none pl-11 pr-5 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div> */}

        {/* <div className="p-0"> */}
        <DataTable
          searchPlaceholder="Search transactions..."
          fileName="offline_topup_report"
          searchChange={(e) => setSearch(e.target.value)}
          columns={columns}
          data={topupRequests}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          totalRecords={totalRecords}
          pageSize={pageSize}
          onPaginationChange={({ pageIndex, pageSize }) => {
            handlePageChange(pageIndex, pageSize);
            setIsLoading(true);
          }}
        />
        {/* </div>
        </div> */}
        {/* Image Modal Integration */}
        <ImageModal
          images={[selectedImage]}
          isOpen={isImageModalOpen}
          onClose={() => {
            setIsImageModalOpen(false);
            setSelectedImage(null);
          }}
        />
      </div>
    </PageLayout>
  );
};

export default OfflineTopup;
