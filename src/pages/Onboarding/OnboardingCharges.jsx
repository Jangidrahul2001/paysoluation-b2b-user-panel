import React, { act, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  QrCode,
  Calendar,
  Building2,
  Banknote,
  Upload,
  Info,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Copy as CopyIcon,
  X,
  FileText,
  CheckCircle2,
  Lock,
  Tag,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { apiEndpoints } from "../../api/apiEndpoints";
import { usePost } from "../../hooks/usePost";
import { data, useLocation, useNavigate } from "react-router-dom";
import { formatUtrInput, handleValidationError, InputSlice, validateUtrLength } from "../../utils/helperFunction";
import { useFetch } from "../../hooks/useFetch";
import { format, parseISO, isValid } from "date-fns";
import { CustomSingleCalendar } from "../../components/dashboard/CustomSingleCalendar";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../../store/slices/profileSlice";



const PAYMENT_MODES = [
  { value: "upi", label: "UPI Transfer" },
  { value: "imps", label: "IMPS" },
  { value: "neft", label: "NEFT / RTGS" },
];

const METHOD_OPTIONS = [
  { value: "coupon", label: "Use Coupon Code" },
  { value: "gateway", label: "Online Payment Gateway" },
  { value: "offline", label: "Offline Bank Transfer" },
];

const DatePickerField = ({ label, value, onChange, error, required = true, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const clickOutside = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const displayDate = value ? (isValid(new Date(value)) ? format(new Date(value), "dd MMM yyyy") : "") : "";

  return (
    <div className="flex flex-col" ref={containerRef}>
      <div className="h-5 px-1 flex items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
          {label} {required && <span className="text-indigo-600">*</span>}
        </label>
      </div>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-11 bg-white border rounded-2xl px-4 text-sm font-bold text-slate-700 flex items-center justify-between transition-all hover:border-slate-300 focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-indigo-500/10" : "border-slate-200 focus:ring-indigo-500/10"}`}
        >
          <span className={!value ? "text-slate-300 font-medium" : ""}>{value ? displayDate : "Select Date"}</span>
          <Calendar size={14} className={`transition-colors ${isOpen ? "text-indigo-600" : "text-slate-400"}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 mt-1.5 right-0 sm:left-0 origin-top-left"
            >
              <CustomSingleCalendar
                selectedDate={value ? new Date(value) : null}
                onDateSelect={(date) => {
                  onChange(format(date, "yyyy-MM-dd"));
                  setIsOpen(false);
                }}
                onReset={() => {
                  onChange("");
                  setIsOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="min-h-[14px] pl-1 mt-1">
        {error && (
          <p className={cn(
            "mt-1.5 text-xs font-medium text-red-600"
          )}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default function OnboardingCharges() {
  const navigate = useNavigate();
  const [bankOptions, setBankOptions] = useState([]);
  const { state } = useLocation();
  const [activationMethod, setActivationMethod] = useState("coupon");
  const [selectedBank, setSelectedBank] = useState(null);
  const [formData, setFormData] = useState({
    amount: state?.onBoardCharge || 0,
    mode: "",
    utr: "",
    date: "",
    proof: null,
    couponCode: ""
  });
  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);


  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) {
      dispatch(fetchProfile());
      return;
    }

    if (profile?.isPaymentRequired && profile?.idPaymentStatus && profile.idPaymentStatus === "pending") {
      navigate("/onboarding-charges", {
        state: { isKycOnline: profile?.isKycOnline, onBoardCharge: profile?.onBoardCharge },
        replace: true
      });
    }
    else if (profile?.isPaymentRequired && profile?.idPaymentStatus && profile.idPaymentStatus === "rejected") {
      navigate("/onboarding-charges", {
        state: { isKycOnline: profile?.isKycOnline, onBoardCharge: profile?.onBoardCharge },
        replace: true
      });
    }
    else if (profile?.isPaymentRequired && profile?.idPaymentStatus && profile.idPaymentStatus === "complete") {
      navigate("/onboarding-pending", { replace: true });
    }
    else if (profile.kycStatus === "pending" || profile.kycStatus === "rekyc") {
      navigate("/kyc", { replace: true });
    }
    else if (profile.kycStatus === "submitted") {
      navigate("/kyc-pending", { replace: true });
    }
    else if (profile.kycStatus === "approved") {
      navigate("/dashboard", { replace: true });
    }
    else if (profile.kycStatus === "rejected") {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isAuthenticated');
      navigate("/login", { replace: true });
    }
  }, [dispatch, profile, navigate]);


  const getUTRDetails = (mode) => {
    switch (mode) {
      case 'upi':
      case 'imps':
        return { label: "12-22 digits (numeric)" };
      case 'neft':
        return { label: "16-22 characters (alphanumeric)" };
      case 'rtgs':
        return { label: "22 characters (alphanumeric)" };
      default:
        return { label: "Max 22 characters" };
    }
  };

  const { refetch: fetchAdminBankList } = useFetch(
    `${apiEndpoints.fetchAdminBankList}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data)

          const temp = data.data.map((item) => ({ ...item, label: item.bankName, value: item._id }))
          setBankOptions(temp)
        }
      },
      onError: (error) => {
        console.log("error in fetch bank list data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );



  const handleBankSelect = (val) => {
    const bank = bankOptions.find(b => b._id === val);
    console.log(bank)
    setSelectedBank(bank);
    setFormData({
      amount: state?.onBoardCharge || 0,
      mode: "",
      utr: "",
      date: "",
      proof: null,
      couponCode: ""
    });
    setFilePreview(null);
    if (errors.bank) setErrors(prev => ({ ...prev, bank: "" }));
  };

  const handleInputChange = (name, value) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type - only allow JPEG/JPG
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPEG/JPG/PNG images are allowed");
        e.target.value = ''; // Clear the input
        return;
      }

      // Check file size (100KB = 100 * 1024 bytes)
      if (file.size > 100 * 1024) {
        toast.error("File size must be less than 100KB");
        e.target.value = ''; // Clear the input
        return;
      }

      setFormData(prev => ({ ...prev, proof: file }));
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
      if (errors.proof) setErrors(prev => ({ ...prev, proof: "" }));
    }
  };



  const handleSubmit = (e) => {
    e.preventDefault();

    // Hard Validation
    const newErrors = {};
    if (activationMethod === 'coupon') {
      if (!formData.couponCode) newErrors.couponCode = "Coupon code is required";
    } else if (activationMethod === 'offline') {
      if (!selectedBank) newErrors.bank = "Please select a bank account";
      if (!formData.mode) newErrors.mode = "Payment method is required";
      if (!formData.date) newErrors.date = "Transaction date is required";
      if (!formData.proof) newErrors.proof = "Payment screenshot is required";


      if (!formData.utr) {
        newErrors.utr = "UTR Number is required";
      } else if (formData.mode && !validateUtrLength(formData.utr, formData.mode)) {
        newErrors.utr = "UTR length is invalid for selected payment method";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }

    setIsLoading(true);
    if (activationMethod === 'coupon') {
      onBoardRequest({ couponCode: formData.couponCode });
    }
    if (activationMethod === 'offline') {
      const formDataSend = new FormData();
      formDataSend.append("amount", formData.amount);
      formDataSend.append("mode", formData.mode);
      formDataSend.append("receiverBank", selectedBank?._id);
      formDataSend.append("utrNumber", formData.utr);
      formDataSend.append("paymentDate", formData.date);
      formDataSend.append("paymentProof", formData.proof);
      onBoardRequest(formDataSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
  };

  const { post: onBoardRequest } = usePost(activationMethod === 'coupon' ? apiEndpoints.onboardByCoupon : apiEndpoints.onBoardOffline, {
    onSuccess: (res) => {
      if (res.success) {
        setIsLoading(false);
        toast.success(res.message || "Onboarding Charges paid successfully");
        console.log("activationMethod === 'offline'", activationMethod === 'offline')
        if (activationMethod === 'offline') {
          dispatch(fetchProfile());
        }
        else {
          if (state?.isKycOnline) {
            navigate("/kyc-online");
          } else {
            navigate("/kyc");
          }
        }
      }

    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Failed to redeem the coupon:', error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Details copied!");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] mt-10 pb-10 w-full px-2 sm:px-4 lg:px-6 animate-in fade-in duration-700 flex flex-col">

      {/* Unified Main Hub Card */}
      <div className="bg-white border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] sm:rounded-[3rem] overflow-hidden flex flex-col lg:flex-row flex-1 w-full">

        {/* Left Panel: The Pay-Desk Container (Dark) */}
        <div className="w-full lg:w-[400px] bg-[#0f172a] p-6 sm:p-10 relative overflow-hidden flex flex-col shrink-0">
          {/* Animated Mesh Gradients */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-slate-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase leading-none">Activation </h1>
            </div>

            <div className="space-y-2 mb-8">
              <h2 className="text-2xl sm:text-3xl font-[1000] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-500 leading-tight">
                Secure Account Activation
              </h2>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                Choose your preferred bank account below and scan the QR code to finish your setup.
              </p>
            </div>

            {/* Method & Bank Selectors inside Panel */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-8 flex flex-col gap-5">
              <div>
                <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2 sm:mb-3">Step 01: Activation Method</label>
                <Select
                  placeholder="Select Method"
                  searchable={false}
                  options={METHOD_OPTIONS}
                  value={activationMethod}
                  onChange={(val) => {
                    setActivationMethod(val);
                    if (val === 'gateway') setSelectedBank(null);
                  }}
                  theme="dark"
                  className="h-11"
                />
              </div>

              {activationMethod === 'offline' && (
                <div className="pt-4 border-t border-white/10">
                  <label className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] block mb-2 sm:mb-3">Step 02: Choose Bank Account</label>
                  <Select
                    placeholder="Select Account"
                    searchable={false}
                    options={bankOptions}
                    value={selectedBank?._id}
                    onChange={(val) => handleBankSelect(val)}
                    theme="dark"
                    className="h-11"
                    error={errors.bank}
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { icon: CheckCircle2, text: `One-time setup fee: ₹ ${state?.onBoardCharge}`, color: "text-emerald-400" },
                { icon: Lock, text: "Instant account unlocking", color: "text-blue-400" },
                { icon: Info, text: "Priority support (business hours)", color: "text-emerald-400" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <item.icon size={16} className={item.color} />
                  {item.text}
                </div>
              ))}
            </div>
            <div className="mt-auto pt-8">
              <button
                onClick={() => {
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("isAuthenticated");
                  navigate("/login", { replace: true });
                }}
                className="flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-sm">
                  <ArrowLeft size={18} className="group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1 opacity-50">Session</span>
                  <span className="text-xs font-black uppercase tracking-widest">Back to Login</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area: QR & Form Responsive Grid */}
        <div className="flex-1 bg-white p-4 sm:p-8 md:p-12 relative">
          <AnimatePresence mode="wait">
            {activationMethod === 'gateway' ? (
              <motion.div
                key="gateway"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 lg:py-0 min-h-[400px]"
              >
                <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-[2.5rem] bg-indigo-50 text-indigo-600 flex items-center justify-center animate-bounce duration-[6s]">
                  <CreditCard size={36} />
                </div>
                <div className="space-y-4 px-4 max-w-sm mx-auto">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Online Payment</h3>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">
                    Pay instantly via UPI, Credit Card, Debit Card, or Netbanking. Your account will be activated automatically.
                  </p>
                  <Button className="w-full mt-4 py-4 sm:py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 text-base sm:text-lg border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all">
                    Pay ₹{formData.amount} Securely
                  </Button>
                </div>
              </motion.div>
            ) : activationMethod === 'coupon' ? (
              <motion.div
                key="coupon"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center space-y-8 py-10 lg:py-0 w-full max-w-sm mx-auto min-h-[400px]"
              >
                <div className="text-center space-y-3 w-full">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100 animate-bounce duration-[6s]">
                    <Tag size={36} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Got a Coupon?</h3>
                  <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                    Enter your exclusive code to instantly wave off the onboarding charges and activate your account.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-5 bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <Input
                    label="Enter Coupon Code"
                    icon={Tag}
                    placeholder="e.g. FREE24, VIPPRO"
                    value={formData.couponCode}
                    onChange={(e) => handleInputChange('couponCode', InputSlice(e.target.value.toUpperCase(),20))}

                    error={errors.couponCode}
                    className="text-center text-lg tracking-widest uppercase font-bold text-emerald-700 bg-white shadow-inner"
                  />
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-4 text-base font-bold rounded-xl shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    {!isLoading && "Apply Code & Activate"}
                    {isLoading && "Verifying Code..."}
                  </Button>
                </form>
              </motion.div>
            ) : !selectedBank ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 lg:py-0 min-h-[400px]"
              >
                <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-[2.5rem] bg-indigo-50 text-indigo-500 flex items-center justify-center animate-bounce duration-[6s]">
                  <QrCode size={36} />
                </div>
                <div className="space-y-2 px-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Waiting for Selection...</h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm sm:text-base">Please select a bank account from the menu on the left to reveal payment details.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedBank.value}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col xl:flex-row gap-8 sm:gap-12"
              >
                {/* QR and Trust Details Section */}
                <div className="w-full xl:w-[320px] space-y-8 flex flex-col items-center xl:items-start shrink-0">
                  <div className="relative w-full flex justify-center xl:justify-start">
                    {/* Premium QR Container */}
                    <div className="relative group">
                      {/* Artistic Glow Background */}
                      <div className="absolute -inset-4 bg-indigo-600/5 blur-2xl rounded-[3rem] pointer-events-none" />


                      <div className="relative bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center min-w-[260px]">
                        <div className="relative bg-slate-50 p-4 rounded-[2rem] border border-slate-100/50 mb-5 overflow-hidden">
                          <img src={`${import.meta.env.VITE_API_URL}${selectedBank.qrCode}`} alt="Payment QR" className="w-48 sm:w-56 h-48 sm:h-56 object-contain mix-blend-multiply" />
                          {/* QR Frame Overlay */}
                          <div className="absolute inset-0 border-[8px] border-white/60 rounded-[2rem] pointer-events-none" />
                        </div>

                        <div className="space-y-3 w-full text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1.5">
                              <ShieldCheck size={12} className="text-emerald-500" />
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified QR</span>
                            </div>
                          </div>
                          <div className="pt-1">
                            <div className="h-0.5 w-8 bg-indigo-100 mx-auto mt-2 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full space-y-2 px-2 sm:px-0">
                    {[
                      { label: "A/C Number", value: selectedBank.accountNumber },
                      { label: "IFSC Code", value: selectedBank.ifscCode },
                      { label: "Payee Name", value: selectedBank.accountHolderName }
                    ].map((detail, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] ml-2">
                          {detail.label}
                        </label>
                        <div
                          className="bg-slate-50/50 h-12 sm:h-14 rounded-2xl border border-slate-100 hover:border-indigo-600/20 hover:bg-white hover:shadow-sm hover:shadow-indigo-600/5 transition-all cursor-pointer group flex items-center px-4"
                        >
                          <p className="flex-1 text-xs sm:text-[13px] font-black text-slate-800 tracking-tight truncate">
                            {detail.value}
                          </p>
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all ml-2 shrink-0 shadow-sm">
                            <CopyIcon size={12} onClick={() => copyToClipboard(detail.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submission Form Section */}
                <div className="flex-1 w-full flex flex-col">
                  {/* Form Header with Trust Signal */}
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2 sm:px-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
                        <div className="flex -space-x-1">
                          {[1, 2, 3].map(i => <div key={i} className="w-4 h-4 rounded-full border border-white bg-slate-200" />)}
                        </div>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-2">
                        Confirm Payment
                        <span className="text-indigo-600">.</span>
                      </h3>
                      <p className="text-slate-400 font-medium text-xs sm:text-sm mt-1">Provide your transfer details for manual verification.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="flex-1 space-y-6">
                    {/* Main Form Card */}
                    <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-5 sm:p-8 space-y-6 relative overflow-hidden">
                      {/* Background decoration */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                        <div className="space-y-1">
                          <Input label="Fee Amount" icon={Banknote} value={`₹ ${formData.amount}`} readOnly />
                          <p className="text-[10px] text-slate-400 font-bold ml-1 italic">* Non-refundable activation fee</p>
                        </div>

                        <DatePickerField
                          label="Transfer Date"
                          value={formData.date}
                          onChange={(val) => handleInputChange('date', val)}
                          error={errors.date}
                          maxDate={new Date()}
                        />

                        <div className="space-y-2 col-span-1 sm:col-span-2 md:col-span-1">
                          <label className="text-sm font-medium leading-none text-foreground/80">Payment Method</label>
                          <Select
                            placeholder="Select Method"
                            searchable={false}
                            options={PAYMENT_MODES}
                            value={formData.mode}
                            onChange={(val) => handleInputChange('mode', val)}

                            themeColor="indigo"
                            className="h-11"
                            error={errors.mode}
                          />
                        </div>
                        <Input
                          label="UTR / Reference No"
                          icon={Info}
                          placeholder={formData.mode ? `${getUTRDetails(formData.mode).label}` : "Enter UTR No"}
                          value={formData.utr}
                          onChange={(e) => {
                            const formatted = formatUtrInput(e.target.value, formData.mode);
                            handleInputChange('utr', formatted);
                          }}

                          maxLength={22}
                          error={errors.utr}
                        />
                      </div>

                      {/* Receipt Upload Zone */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium leading-none text-foreground/80 flex items-center gap-2">
                          Payment Screenshot
                        </label>
                        <div className={cn(
                          "relative rounded-2xl border-2 border-dashed transition-all duration-300 group min-h-[140px] flex items-center justify-center overflow-hidden",
                          filePreview ? "border-indigo-600 bg-indigo-50/20" : "border-slate-200 bg-white hover:border-indigo-600/40 hover:bg-indigo-50/5"
                        )}>
                          <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".jpg,.jpeg,.png" />


                          {filePreview ? (
                            <div className="flex items-center gap-5 w-full p-4 relative z-20">
                              <div className="relative group/img">
                                <img src={filePreview} className="w-20 h-20 rounded-xl object-cover shadow-2xl border-2 border-white transition-transform group-hover/img:scale-105" alt="Preview" />
                                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/img:opacity-100 rounded-xl transition-opacity flex items-center justify-center">
                                  <ArrowRight size={16} className="text-white rotate-45" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800 truncate">{formData.proof?.name}</p>
                                <p className="text-xs font-bold text-indigo-600 flex items-center gap-1.5">
                                  <CheckCircle2 size={14} /> Ready for verification
                                </p>
                              </div>
                              <button type="button" onClick={() => { setFilePreview(null); setFormData(p => ({ ...p, proof: null })) }} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 shadow-sm transition-all border border-slate-100"><X size={18} /></button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center p-6">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 group-hover:text-indigo-600 transition-all text-slate-400">
                                <Upload size={20} />
                              </div>
                              <p className="text-sm font-black text-slate-800">Drop your receipt here</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">JPEG/JPG only • Max 100KB</p>
                            </div>
                          )}
                        </div>
                        {errors.proof && (
                          <p className="text-xs font-medium text-red-600 mt-1 ml-1">
                            {errors.proof}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center pt-2 pb-4">
                      <Button
                        type="submit"
                        isLoading={isLoading}
                        className="w-full sm:max-w-md md:max-w-sm lg:max-w-xs py-4 sm:py-5 lg:py-6 text-sm sm:text-base lg:text-lg font-bold rounded-2xl sm:rounded-[2rem] shadow-sm bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95 group relative overflow-hidden border-2 border-indigo-400/20"
                      >
                        {!isLoading && (
                          <span className="flex items-center justify-center gap-2 relative z-10 w-full">
                            Confirm & Activate Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                        {isLoading && <span className="relative z-10">Validating Payment...</span>}
                      </Button>

                      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 opacity-40">
                        {['PCI Compliant', 'SSL Secured', 'Encrypted'].map(text => (
                          <div key={text} className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            <div className="w-1 h-1 rounded-full bg-slate-400" />
                            {text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="mt-8 sm:mt-12 text-center text-slate-400 space-y-2">
        <p className="text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 px-4">
          <ShieldCheck size={14} className="text-indigo-600" />
          Secure 256-bit SSL encrypted transaction.
        </p>
        <p className="text-[8px] sm:text-[10px] uppercase font-black tracking-widest opacity-50 px-4">© Pay Soluation • All Rights Reserved</p>
      </div>

    </div>
  );
}
