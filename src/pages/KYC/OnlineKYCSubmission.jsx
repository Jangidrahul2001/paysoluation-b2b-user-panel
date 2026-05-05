import { toast } from "sonner";
import { format, isValid } from "date-fns";
import {
  User,
  Store,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { usePost } from "../../hooks/usePost";
import { useNavigate } from "react-router-dom";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { apiEndpoints } from "../../api/apiEndpoints";
import React, { useState, useEffect, useRef, forwardRef } from "react";
import { aadharRegex, emailRegex, formatEmailInput, formatNumberInput, gstRegex, handleValidationError, ifscRegex, nameWithSpaceRegex, panRegex, phoneRegex, pincodeRegex } from "../../utils/helperFunction";
import { CustomSingleCalendar } from "../../components/dashboard/CustomSingleCalendar";

const InputField = forwardRef(({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  required = true,
  error,
  readOnly = false,
  ...props
}, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
        {label}{required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      ref={ref}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      readOnly={readOnly}
      className={`w-full h-12 border rounded-2xl px-4 text-sm font-semibold placeholder:text-slate-400 transition-all outline-none ${readOnly ? "bg-slate-50/30 border-indigo-600/20 cursor-not-allowed text-slate-700" : error ? "bg-white border-red-500 focus:border-red-500 text-slate-700" : "bg-white border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 text-slate-700"}`}
      {...props}
    />
    {error && (
      <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>
    )}
  </div>
));

const SelectField = ({
  label,
  name,
  options = [],
  placeholder,
  value,
  onChange,
  required = true,
  error,
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full h-12 bg-white/50 border rounded-2xl px-4 text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all hover:bg-white appearance-none ${error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-indigo-600/20 focus:border-indigo-600"}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${error ? "text-red-400" : "text-slate-400"}`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>
    )}
  </div>
);

const DatePickerField = ({ label, value, onChange, error, required = true, maxDate }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const clickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const displayDate = value ? (isValid(new Date(value)) ? format(new Date(value), "dd MMM yyyy") : "") : "";

  return (
    <div className="flex flex-col relative" ref={containerRef}>
      <div className="h-5 px-1 flex items-center mb-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-12 bg-white/50 border rounded-2xl px-4 text-sm font-semibold text-slate-700 flex items-center justify-between transition-all hover:bg-white focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-indigo-600/20"}`}
        >
          <span className={!value ? "text-slate-400 font-normal" : ""}>
            {value ? displayDate : "Select Date"}
          </span>
          <Calendar size={16} className={`transition-colors ${isOpen ? "text-indigo-600" : "text-slate-400"}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-50 p-4 z-50"
            >
              <CustomSingleCalendar
                selectedDate={value ? new Date(value) : null}
                onDateSelect={(date) => {
                  onChange({ target: { name: "dob", value: format(date, "yyyy-MM-dd") } });
                  setIsOpen(false);
                }}
                maxDate={maxDate}
                onReset={() => {
                  onChange({ target: { name: "dob", value: "" } });
                  setIsOpen(false);
                }}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
      <div className="min-h-[14px] mt-1 pr-1">
        {error && (
          <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1">
            <AlertCircle size={10} /> {error}
          </p>
        )}
      </div>
    </div>
  );
};

const SectionTab = ({ active, completed, icon: Icon, label }) => (
  <div
    className={`flex flex-col items-center gap-2.5 relative z-10 transition-all duration-500 ${active ? "scale-105" : "scale-100"}`}
  >
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${active ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" : completed ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-white border-slate-100 text-slate-300"}`}
    >
      {completed ? <Check size={20} strokeWidth={3} /> : <Icon size={18} strokeWidth={active ? 2.5 : 2} />}
    </div>
    <div className="flex flex-col items-center">
      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${active ? "text-indigo-600" : "text-slate-400"}`}>
        {label}
      </span>
      {active && (
        <m.div
          layoutId="activeTab"
          className="w-1 h-1 rounded-full bg-indigo-600 mt-1"
        />
      )}
    </div>
  </div>
);

const KYCSubmission = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = Aadhaar Auth, 1 = Personal, 2 = Business, 3 = Banking
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [manualEntry, setManualEntry] = useState({ city: false, state: false });
  const [errors, setErrors] = useState({});

  // Aadhaar OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [clientId, setClientId] = useState("");
  const otpInputRef = useRef(null);

  useEffect(() => {
    if (otpSent) {
      const focusTimer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 200);
      return () => clearTimeout(focusTimer);
    }
  }, [otpSent]);

  // Form States
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    panNumber: "",
    businessPanNumber: "",
    aadharNumber: "",
    fatherName: "",
    gender: "",
    dob: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [businessInfo, setBusinessInfo] = useState({
    shopName: "",
    gstNumber: "",
    businessPanNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [bankInfo, setBankInfo] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  });
  const [documents, setDocuments] = useState({
    aadhaar: null,
    panFile: null,
    shopImage: null,
  });
  console.log(documents);

  const validateStep = (currentStep) => {
    let tempErrors = {};








    if (currentStep === 0) {
      if (!personalInfo.aadharNumber.trim())
        tempErrors.aadharNumber = "Aadhar Number is required";
      else if (!aadharRegex.test(personalInfo.aadharNumber))
        tempErrors.aadharNumber = "Aadhar must be 12 digits";
    }

    if (currentStep === 1) {
      if (!personalInfo.firstName.trim())
        tempErrors.firstName = "First Name is required";
      else if (!nameWithSpaceRegex.test(personalInfo.firstName?.trim())) {
        tempErrors.firstName = "Enter a valid first name";
      }
      if (!personalInfo.lastName.trim())
        tempErrors.lastName = "Last Name is required";
      else if (!nameWithSpaceRegex.test(personalInfo.lastName?.trim())) {
        tempErrors.lastName = "Enter a valid last name";
      }
      if (!personalInfo.fatherName.trim())
        tempErrors.fatherName = "Father's Name is required";
      else if (!nameWithSpaceRegex.test(personalInfo.fatherName?.trim())) {
        tempErrors.fatherName = "Enter a valid father name";
      }
      if (!personalInfo.gender) tempErrors.gender = "Gender is required";

      if (!personalInfo.email.trim()) tempErrors.email = "Email is required";
      else if (!emailRegex.test(personalInfo.email))
        tempErrors.email = "Invalid email format";

      if (!personalInfo.phone.trim()) tempErrors.phone = "Phone is required";
      else if (!phoneRegex.test(personalInfo.phone))
        tempErrors.phone = "Invalid phone number";

      if (!personalInfo.dob) tempErrors.dob = "Date of Birth is required";
      else {
        const today = new Date();
        const birthDate = new Date(personalInfo.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        if (age < 18) tempErrors.dob = "You must be at least 18 years old";
        if (birthDate > today) tempErrors.dob = "Date of Birth cannot be in the future";
      }

      if (!personalInfo.address.trim())
        tempErrors.personalAddress = "Address is required";
      // City and State are auto-filled but check anyway
      if (!personalInfo.city.trim())
        tempErrors.personalCity = "City is required";
      if (!personalInfo.state.trim())
        tempErrors.personalState = "State is required";

      if (!personalInfo.pincode.trim())
        tempErrors.personalPincode = "Pincode is required";
      else if (!pincodeRegex.test(personalInfo.pincode))
        tempErrors.personalPincode = "Invalid Pin code";
    }

    if (currentStep === 2) {
      if (!businessInfo.shopName.trim())
        tempErrors.shopName = "Shop Name is required";
      else if (!nameWithSpaceRegex.test(businessInfo.shopName?.trim())) {
        tempErrors.shopName = "Enter a valid shop name";
      }
      if (!businessInfo.address.trim())
        tempErrors.businessAddress = "Address is required";
      // City and State are auto-filled but check anyway
      if (!businessInfo.city.trim())
        tempErrors.businessCity = "City is required";
      if (!businessInfo.state.trim())
        tempErrors.businessState = "State is required";

      if (!businessInfo.pincode.trim())
        tempErrors.businessPincode = "Pincode is required";
      else if (!pincodeRegex.test(businessInfo.pincode))
        tempErrors.businessPincode = "Invalid Pin code";

      if (businessInfo.gstNumber) {
        if (!gstRegex.test(businessInfo.gstNumber))
          tempErrors.gstNumber = "Invalid GST Number";
      }
      // Identity Validation
      if (!personalInfo.panNumber.trim())
        tempErrors.panNumber = "Personal PAN is required";
      else if (!panRegex.test(personalInfo.panNumber))
        tempErrors.panNumber = "Invalid PAN format";

      if (!personalInfo.aadharNumber.trim())
        tempErrors.aadharNumber = "Aadhar Number is required";
      else if (!aadharRegex.test(personalInfo.aadharNumber))
        tempErrors.aadharNumber = "Aadhar must be 12 digits";

      if (businessInfo.businessPanNumber) {
        if (!panRegex.test(businessInfo.businessPanNumber))
          tempErrors.businessPanNumber = "Invalid PAN format";
      }

      // Document Validation
      if (!documents.aadhaar) toast.error("Please upload Aadhaar Card PDF");
      if (!documents.panFile)
        toast.error("Please upload Personal PAN Card PDF");
      if (!documents.shopImage) toast.error("Please upload Shop Photo PDF");

      if (!documents.aadhaar || !documents.panFile || !documents.shopImage) {
        setErrors(tempErrors);
        return false;
      }
    }

    if (currentStep === 3) {
      if (!bankInfo.accountHolderName.trim())
        tempErrors.accountHolderName = "Account Holder Name is required";
      else if (!nameWithSpaceRegex.test(bankInfo.accountHolderName?.trim())) {
        tempErrors.accountHolderName = "Enter a valid account holder name";
      }
      if (!bankInfo.bankName.trim())
        tempErrors.bankName = "Bank Name is required";
      if (!bankInfo.accountNumber.trim())
        tempErrors.accountNumber = "Account Number is required";
      else if (bankInfo.accountNumber.length < 9 || bankInfo.accountNumber.length > 18)
        tempErrors.accountNumber = "Account Number must be between 9 and 18 digits";
      if (!bankInfo.branchName.trim())
        tempErrors.branchName = "Branch Name is required";
      else if (!nameWithSpaceRegex.test(bankInfo.branchName?.trim())) {
        tempErrors.branchName = "Enter a valid branch name";
      }

      if (!bankInfo.ifscCode.trim())
        tempErrors.ifscCode = "IFSC Code is required";
      else if (!ifscRegex.test(bankInfo.ifscCode))
        tempErrors.ifscCode = "Invalid IFSC Code";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fill all required fields correctly");
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const { post: sendOtpApi, isLoading: isSendingOtp } = usePost(apiEndpoints?.sendAadharOtp || "/user/kyc/send-aadhar-otp", {
    onSuccess: (data) => {
      if (data.success) {
        toast.success("OTP sent to your Aadhaar linked mobile number.");
        setOtpSent(true);
        if (data.clientId || data.data?.clientId) {
          setClientId(data.clientId || data.data?.clientId);
        }
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  });

  const { post: verifyOtpApi, isLoading: isVerifyingOtp } = usePost(apiEndpoints?.verifyAadharOtp || "/user/kyc/verify-aadhar-otp", {
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Aadhaar Verified Successfully!");
        // Auto-fill details here
        const fetchedData = data.data || {};

        // Example mapping - adapt based on actual API payload
        setPersonalInfo(prev => ({
          ...prev,
          firstName: fetchedData.firstName || prev.firstName,
          lastName: fetchedData.lastName || prev.lastName,
          fatherName: fetchedData.fatherName || prev.fatherName,
          gender: fetchedData.gender ? fetchedData.gender.toLowerCase() : prev.gender,
          dob: fetchedData.dob || prev.dob, // standard YYYY-MM-DD format
          address: fetchedData.address?.street || fetchedData.address || prev.address,
          city: fetchedData.address?.city || fetchedData.city || prev.city,
          state: fetchedData.address?.state || fetchedData.state || prev.state,
          pincode: fetchedData.address?.pincode || fetchedData.address?.zip || prev.pincode,
        }));

        // Move to personal info step automatically
        setStep(1);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Verification failed. Please check OTP and try again.");
    }
  });

  const handleSendOtp = () => {
    const tempErrors = {};
    if (!personalInfo.aadharNumber || personalInfo.aadharNumber.length !== 12) {
      tempErrors.aadharNumber = "Aadhaar must be exactly 12 digits";
      setErrors(tempErrors);
      return;
    }
    setErrors({});


    // TEMPORARY BYPASS FOR UI TESTING:
    // Commented out the real API call so you can see the OTP page.
    // sendOtpApi({ aadharNumber: personalInfo.aadharNumber });

    // setOtpSent(true);
    // toast.success("OTP sent to your Aadhaar linked mobile number. (Test Mode)");
    sendOtpApi({ aadharNumber: personalInfo.aadharNumber });
  };

  const handleVerifyOtp = () => {
    const tempErrors = {};
    if (!otpValue) {
      tempErrors.otp = "Please enter OTP";
      setErrors(tempErrors);
      return;
    }
    setErrors({});

    // TEMPORARY BYPASS FOR UI TESTING:
    // Commented out the real API call so it moves to the next step.
    // verifyOtpApi({ aadharNumber: personalInfo.aadharNumber, otp: otpValue, clientId });

    // toast.success("Aadhaar Verified Successfully! (Test Mode)");
    // setStep(1); // Moves to personal detail page
    verifyOtpApi({ aadharNumber: personalInfo.aadharNumber, otp: otpValue, clientId });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setDocuments((prev) => ({ ...prev, [field]: file }));
      // toast.success(`Uploaded ${field.replace(/([A-Z])/g, " $1")}`);
    }
  };

  const { post: submitKyc } = usePost(apiEndpoints?.kycSubmission, {
    onSuccess: (data) => {
      console.log(data);
      if (data.success) {
        toast.success("KYC Submitted Successfully!", {
          description: "Your details have been sent to the Admin for approval.",
        });
        navigate("/kyc-pending");
      }
    },
    onError: (error) => {
      console.error("Submission error:", error);
      setIsLoading(false);
      toast.error(error.message || "Failed to submit KYC. Please try again.");
    },
  });

  const handleSubmit = async () => {
    setIsLoading(true);

    // try {
    const formData = new FormData();

    // Personal Details
    formData.append("firstName", personalInfo.firstName);
    formData.append("lastName", personalInfo.lastName);
    formData.append("fatherName", personalInfo.fatherName);
    formData.append("gender", personalInfo.gender);
    formData.append("email", personalInfo.email);
    formData.append("phone", personalInfo.phone);
    formData.append("dob", personalInfo.dob);

    formData.append("aadharNumber", personalInfo.aadharNumber);
    formData.append("panNumber", personalInfo.panNumber);

    // Business Details
    formData.append("shopName", businessInfo.shopName);
    formData.append("businessPanNumber", businessInfo.businessPanNumber);
    formData.append("gstNumber", businessInfo.gstNumber);

    formData.append("personalAddress", personalInfo.address);
    formData.append("personalCity", personalInfo.city);
    formData.append("personalState", personalInfo.state);
    formData.append("personalPincode", personalInfo.pincode);

    formData.append("businessAddress", businessInfo.address);
    formData.append("businessCity", businessInfo.city);
    formData.append("businessState", businessInfo.state);
    formData.append("businessPincode", businessInfo.pincode);

    // Banking Details
    formData.append("accountHolderName", bankInfo.accountHolderName);
    formData.append("bankName", bankInfo.bankName);
    formData.append("accountNumber", bankInfo.accountNumber);
    formData.append("ifscCode", bankInfo.ifscCode);
    formData.append("branchName", bankInfo.branchName);
    console.log(documents);

    // Documents
    if (documents.aadhaar) formData.append("aadharFile", documents.aadhaar);
    if (documents.panFile) formData.append("panFile", documents.panFile);
    if (documents.shopImage) formData.append("shopImage", documents.shopImage);
    console.log(Object.fromEntries(formData.entries()));

    submitKyc(formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const handleownPincodeChange = async (e) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    setPersonalInfo((prev) => ({ ...prev, pincode: value }));

    if (value.length === 6) {
      setIsFetchingPincode(true);
      setManualEntry({ city: false, state: false }); // Reset manual entry on new fetch
      const toastId = toast.loading("Fetching City & State...");
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${value}`,
        );
        const data = await response.json();

        if (data && data[0].Status === "Success") {
          const details = data[0].PostOffice[0];
          setPersonalInfo((prev) => ({
            ...prev,
            pincode: value,
            city: details.District, // Using District as City
            state: details.State,
          }));
          toast.success("City and State auto-filled!", { id: toastId });
          // Clear errors for city and state if they exist
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.city;
            delete newErrors.state;
            delete newErrors.pincode;
            return newErrors;
          });
        } else {
          toast.error("Invalid Pincode", { id: toastId });
          setPersonalInfo((prev) => ({
            ...prev,
            city: "",
            state: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching pincode:", error);
        toast.error("Failed to fetch location details", { id: toastId });
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    setBusinessInfo((prev) => ({ ...prev, pincode: value }));

    if (value.length === 6) {
      setIsFetchingPincode(true);
      setManualEntry({ city: false, state: false }); // Reset manual entry on new fetch
      const toastId = toast.loading("Fetching City & State...");
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${value}`,
        );
        const data = await response.json();

        if (data && data[0].Status === "Success") {
          const details = data[0].PostOffice[0];
          setBusinessInfo((prev) => ({
            ...prev,
            pincode: value,
            city: details.District, // Using District as City
            state: details.State,
          }));
          toast.success("City and State auto-filled!", { id: toastId });
          // Clear errors for city and state if they exist
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.city;
            delete newErrors.state;
            delete newErrors.pincode;
            return newErrors;
          });
        } else {
          toast.error("Invalid Pincode", { id: toastId });
          setBusinessInfo((prev) => ({
            ...prev,
            city: "",
            state: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching pincode:", error);
        toast.error("Failed to fetch location details", { id: toastId });
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen h-auto bg-[#F8FAFF] font-sans text-slate-900 py-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between px-6 md:px-12 mb-8 md:mb-10 gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/10 shrink-0">
            <ShieldCheck className="w-5 h-5 md:w-5.5 md:h-5.5" />
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="font-black text-lg md:text-2xl text-slate-800 tracking-tight leading-none mb-1 uppercase">
              Complete Your KYC
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              SECURE B2B PROTOCOL
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm transition-all hover:border-slate-200 shrink-0">
          <div className="flex -space-x-1.5 grayscale opacity-50 contrast-125">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full border border-white ${s <= (step === 0 ? 0 : step) ? "bg-indigo-600" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 pl-3">
            <span className="text-slate-800">Step {step}</span> <span className="text-slate-200 mx-0.5">/</span> 3
          </span>
        </div>
      </header>

      <div className="w-full max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        {step > 0 && (
          <div className="flex items-center justify-between relative mb-12 max-w-2xl mx-auto px-10">
            <div className="absolute top-5 left-14 right-14 h-px bg-slate-100 -z-0"></div>
            <div
              className="absolute top-5 left-14 h-px bg-indigo-600 -z-0 transition-all duration-700 ease-in-out"
              style={{ width: `calc(${Math.max(0, ((step - 1) / 2) * 100)}% - ${step === 3 ? "0px" : step === 2 ? "28px" : "56px"})` }}
            ></div>

            <SectionTab
              active={step === 1}
              completed={step > 1}
              icon={User}
              label="Personal"
              index={1}
            />
            <SectionTab
              active={step === 2}
              completed={step > 2}
              icon={Store}
              label="Business"
              index={2}
            />
            <SectionTab
              active={step === 3}
              completed={step > 3}
              icon={Banknote}
              label="Banking"
              index={3}
            />
          </div>
        )}

        {/* Form Container */}
        <m.div
          layout
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10 relative"
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <m.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-xl mx-auto py-8"
              >
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Aadhaar Verification
                  </h2>
                  <p className="text-slate-400 font-medium mt-1">
                    Please verify your Aadhaar to proceed with your fast-track KYC.
                  </p>
                </div>

                <div className="bg-slate-50/50 p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-inner space-y-6">
                  <InputField
                    label="Aadhaar Number"
                    name="aadharNumber"
                    value={personalInfo.aadharNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 12) {
                        setPersonalInfo({ ...personalInfo, aadharNumber: value });
                      }
                    }}
                    placeholder="Enter 12-digit Aadhaar Number"
                    error={errors.aadharNumber}
                  />

                  <AnimatePresence mode="wait">
                    {otpSent && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <InputField
                          autoFocus
                          ref={otpInputRef}
                          label="Enter OTP"
                          name="otp"
                          value={otpValue}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 6) {
                              setOtpValue(value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && otpValue.length === 6) {
                              handleVerifyOtp();
                            }
                          }}
                          placeholder="Enter 6-digit OTP sent to linked mobile"
                          error={errors.otp}
                        />
                      </m.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-2">
                    {!otpSent ? (
                      <Button
                        onClick={handleSendOtp}
                        disabled={personalInfo.aadharNumber.length !== 12 || isSendingOtp}
                        className="w-full h-12 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          "Send OTP via Aadhaar"
                        )}
                      </Button>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="w-full sm:w-1/3 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                        >
                          {isSendingOtp ? <Loader2 size={18} className="animate-spin" /> : "Resend OTP"}
                        </Button>
                        <Button
                          onClick={handleVerifyOtp}
                          disabled={otpValue.length !== 6 || isVerifyingOtp}
                          className="w-full sm:w-2/3 h-12 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isVerifyingOtp ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify & Proceed"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            )}

            {step === 1 && (
              <m.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Personal Details
                  </h2>
                  <p className="text-slate-400 font-medium">
                    Please enter your basic personal information.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  <InputField
                    label="First Name"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="e.g. Rahul"
                    error={errors.firstName}
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="e.g. Kumar"
                    error={errors.lastName}
                  />
                  <InputField
                    label="Father's Name"
                    name="fatherName"
                    value={personalInfo.fatherName}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        fatherName: e.target.value,
                      })
                    }
                    placeholder="Father's Name"
                    error={errors.fatherName}
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger
                        className={`w-full h-12 bg-white/50 border rounded-2xl px-4 text-sm font-semibold text-slate-700 flex items-center justify-between focus:outline-none focus:ring-2 transition-all hover:bg-white ${errors.gender ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"}`}
                      >
                        {personalInfo.gender ? (
                          personalInfo.gender.charAt(0).toUpperCase() +
                          personalInfo.gender.slice(1)
                        ) : (
                          <span className="text-slate-400">Select Gender</span>
                        )}
                        <ChevronDown size={16} className="text-slate-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[var(--radix-popper-anchor-width)] bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xl shadow-indigo-900/5 z-50">
                        {["male", "female", "other"].map((gender) => (
                          <DropdownMenuItem
                            key={gender}
                            onClick={() =>
                              setPersonalInfo({ ...personalInfo, gender })
                            }
                            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer capitalize transition-colors outline-none"
                          >
                            {gender}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {errors.gender && (
                      <p className="text-[10px] text-red-500 font-bold ml-1">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                  <InputField
                    label="Email Address"

                    name="email"
                    value={personalInfo.email}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        email: formatEmailInput(e.target.value),
                      })
                    }
                    placeholder="rahul@example.com"
                    error={errors.email}
                  />
                  <InputField
                    label="Phone Number"

                    name="phone"
                    value={personalInfo.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setPersonalInfo({
                          ...personalInfo,
                          phone: value,
                        });
                      }
                    }}
                    placeholder="+91 98765 43210"
                    error={errors.phone}
                  />
                  <DatePickerField
                    label="Date of Birth"
                    name="dob"
                    value={personalInfo.dob}
                    onChange={(e) =>
                      setPersonalInfo({ ...personalInfo, dob: e.target.value })
                    }
                    error={errors.dob}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                  />

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
                    <div className="relative">
                      <InputField
                        label="Pincode"
                        name="pincode"
                        value={personalInfo.pincode}
                        onChange={handleownPincodeChange}
                        placeholder="110001"
                        error={errors.personalPincode}
                      />
                      {isFetchingPincode && (
                        <div className="absolute right-3 top-[26px] text-indigo-600 animate-spin">
                          <Loader2 size={16} />
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      {isFetchingPincode ? (
                        <div className="space-y-1">
                          {/* <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                            State <span className="text-red-500">*</span>
                          </label> */}
                          <div className="w-full h-12 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                        </div>
                      ) : (
                        <InputField

                          name="state"
                          value={personalInfo.state}
                          onChange={(e) =>
                            setPersonalInfo({
                              ...personalInfo,
                              state: e.target.value,
                            })
                          }
                          placeholder="State"
                          error={errors.personalState}
                          required={true}
                        />
                      )}
                    </div>

                    <div className="relative">
                      {isFetchingPincode ? (
                        <div className="space-y-1">
                          {/* <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                            City <span className="text-red-500">*</span>
                          </label> */}
                          <div className="w-full h-12 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                        </div>
                      ) : (
                        <InputField
                          label="City"
                          name="city"
                          value={personalInfo.city}
                          onChange={(e) =>
                            setPersonalInfo({
                              ...personalInfo,
                              city: e.target.value,
                            })
                          }
                          placeholder="City"
                          error={errors.personalCity}
                          required={true}
                        />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <InputField
                      label="Address"
                      name="address"
                      value={personalInfo.address}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          address: e.target.value,
                        })
                      }
                      placeholder="Plot No, Street, Area"
                      error={errors.personalAddress}
                    />
                  </div>
                </div>
              </m.div>
            )}

            {step === 2 && (
              <m.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Business Information
                  </h2>
                  <p className="text-slate-400 font-medium">
                    Tell us about your shop or business.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField
                      label="Shop/Business Name"
                      name="shopName"
                      value={businessInfo.shopName}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          shopName: e.target.value,
                        })
                      }
                      placeholder="e.g. Rahul Enterprises"
                      error={errors.shopName}
                    />
                  </div>

                  <InputField
                    label="Business PAN Card (optional)"
                    name="businessPanNumber"
                    value={businessInfo.businessPanNumber}
                    onChange={(e) =>
                      setBusinessInfo({
                        ...businessInfo,
                        businessPanNumber: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="ABCDE1234F"
                    required={false}
                    error={errors.businessPanNumber}
                  />
                  <InputField
                    label="GST Number (Optional)"
                    name="gstNumber"
                    value={businessInfo.gstNumber}
                    onChange={(e) =>
                      setBusinessInfo({
                        ...businessInfo,
                        gstNumber: e.target.value,
                      })
                    }
                    placeholder="22AAAAA0000A1Z5"
                    required={false}
                    error={errors.gstNumber}
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Shop Address"
                      name="address"
                      value={businessInfo.address}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          address: e.target.value,
                        })
                      }
                      placeholder="Plot No, Street, Area"
                      error={errors.businessAddress}
                    />
                  </div>

                  <div className="relative">
                    <InputField
                      label="Pincode"
                      name="pincode"
                      value={businessInfo.pincode}
                      onChange={handlePincodeChange}
                      placeholder="110001"
                      error={errors.businessPincode}
                    />
                    {isFetchingPincode && (
                      <div className="absolute right-3 top-[34px] text-orange-500 animate-spin">
                        <Loader2 size={20} />
                      </div>
                    )}
                  </div>

                  {/* State Field */}
                  <div className="space-y-1.5 relative">
                    {/* <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                        State <span className="text-red-500">*</span>
                      </label> */}
                    {isFetchingPincode ? (
                      <div className="w-full h-12 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                    ) : (
                      <InputField
                        label="State"
                        name="state"
                        value={businessInfo.state}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            state: e.target.value,
                          })
                        }
                        placeholder="State"
                        error={errors.businessState}
                        required={false} // Label handles the asterisk
                      />
                    )}
                    {/* Hide label inside InputField since we render it manually here for loading state consistency, OR just use purely InputField if not loading? 
                           Actually, InputField has its own label. Let's reuse InputField completely if not loading.
                       */}
                  </div>

                  {/* City Field */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    {isFetchingPincode ? (
                      <div className="w-full h-12 bg-slate-100 rounded-2xl animate-pulse border border-slate-200" />
                    ) : (
                      <InputField
                        name="city"
                        value={businessInfo.city}
                        onChange={(e) =>
                          setBusinessInfo({
                            ...businessInfo,
                            city: e.target.value,
                          })
                        }
                        placeholder="City"
                        error={errors.businessCity}
                        required={false}
                      />
                    )}
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                      Owner Identification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField
                        label="Personal PAN Number"
                        name="panNumber"
                        value={personalInfo.panNumber}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            panNumber: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="ABCDE1234F"
                        error={errors.panNumber}
                      />
                      <InputField
                        label="Aadhar Number"
                        name="aadharNumber"
                        value={personalInfo.aadharNumber}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            aadharNumber: e.target.value,
                          })
                        }
                        placeholder="12 Digit Aadhar Number"
                        error={errors.aadharNumber}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Upload Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DocumentUploadBox
                      label="Aadhaar Card"
                      field="aadhaar"
                      onChange={handleFileChange}
                      file={documents.aadhaar}
                    />
                    <DocumentUploadBox
                      label="Personal PAN Card"
                      field="panFile"
                      onChange={handleFileChange}
                      file={documents.panFile}
                    />
                    <DocumentUploadBox
                      label="Shop Photo (Selfie)"
                      field="shopImage"
                      onChange={handleFileChange}
                      file={documents.shopImage}
                    />
                  </div>
                </div>
              </m.div>
            )}

            {step === 3 && (
              <m.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    Banking Details
                  </h2>
                  <p className="text-slate-400 font-medium">
                    For settlements and commissions.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Account Holder Name"
                    name="accountHolderName"
                    value={bankInfo.accountHolderName}
                    onChange={(e) =>
                      setBankInfo({
                        ...bankInfo,
                        accountHolderName: e.target.value,
                      })
                    }
                    placeholder="Same as bank records"
                    error={errors.accountHolderName}
                  />
                  <InputField
                    label="Bank Name"
                    name="bankName"
                    value={bankInfo.bankName}
                    onChange={(e) =>
                      setBankInfo({ ...bankInfo, bankName: e.target.value })
                    }
                    placeholder="e.g. HDFC Bank"
                    error={errors.bankName}
                  />
                  <InputField
                    label="Account Number"
                    name="accountNumber"
                    value={bankInfo.accountNumber}
                    onChange={(e) =>
                      setBankInfo({
                        ...bankInfo,
                        accountNumber: formatNumberInput(e.target.value, 18),
                      })
                    }
                    placeholder="0000000000"
                    error={errors.accountNumber}
                  />
                  <InputField
                    label="Branch Name"
                    name="branchName"
                    value={bankInfo.branchName}
                    onChange={(e) =>
                      setBankInfo({
                        ...bankInfo,
                        branchName: e.target.value,
                      })
                    }
                    placeholder="Same as bank records"
                    error={errors.branchName}
                  />
                  <InputField
                    label="IFSC Code"
                    name="ifscCode"
                    value={bankInfo.ifscCode}
                    onChange={(e) =>
                      setBankInfo({
                        ...bankInfo,
                        ifscCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="HDFC0001234"
                    error={errors.ifscCode}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step > 0 && (
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors h-auto"
                >
                  <ArrowLeft size={18} />
                  Previous
                </Button>
              ) : (
                <div></div> // Spacer
              )}

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 h-auto"
                >
                  Next Step
                  <ArrowRight size={18} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed h-auto"
                >
                  Submit KYC
                  {!isLoading && <Check size={18} />}
                </Button>
              )}
            </div>
          )}
        </m.div>
      </div>
    </div>
  );
};

const DocumentUploadBox = ({ label, field, onChange, file }) => {
  const previewUrl = React.useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  return (
    <div className="border-2 border-dashed border-slate-200 rounded-3xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group h-48 flex flex-col items-center justify-center">
      <input
        type="file"
        onChange={(e) => {
          const selectedFile = e.target.files[0];
          if (selectedFile && selectedFile.type !== "application/pdf") {
            toast.error("Only PDF files are allowed");
            return;
          }
          onChange(e, field);
        }}
        className="absolute inset-0 opacity-0 cursor-pointer z-20"
        accept="application/pdf"
      />

      {file ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 relative z-10">
          <div className="relative w-full h-24 rounded-xl overflow-hidden shadow-sm border border-slate-100 bg-white">
            <iframe
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full pointer-events-none"
              title={label}
            />
            <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white/80 p-1.5 rounded-full backdrop-blur-sm">
                <Upload size={16} className="text-slate-700" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-0.5">
              <Check size={14} strokeWidth={3} />
              <p className="text-xs font-bold uppercase tracking-wider">
                Uploaded
              </p>
            </div>
            <p className="text-xs font-bold text-slate-700">{label}</p>
            <p className="text-[10px] text-slate-400 max-w-[150px] truncate mx-auto">
              {file.name}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 group-hover:text-slate-600 flex items-center justify-center transition-colors">
            <Upload size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 mt-1">Click to upload PDF</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCSubmission;
