import React, { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Store,
  Banknote,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Upload,
  ChevronDown,
  Loader2,
  File,
  ShieldCheck,
  AlertCircle,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { CustomSingleCalendar } from "../../components/dashboard/CustomSingleCalendar";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { usePost } from "../../hooks/usePost";
import { useFetch } from "../../hooks/useFetch";
import { apiEndpoints } from "../../api/apiEndpoints";
import { aadharRegex, emailRegex, formatAadharInput, formatGstInput, formatIfscInput, formatNameInputWithSpace, formatNumberInput, formatPanInput, gstRegex, handleValidationError, ifscRegex, InputSlice, nameWithSpaceRegex, panRegex, phoneRegex, pincodeRegex } from "../../utils/helperFunction";
import { useDispatch } from "react-redux";
import { fetchProfile } from "../../store/slices/profileSlice";
import { Skeleton } from "../../components/ui/skeleton";






const DatePickerField = ({ label, value, onChange, error, required = true, maxDate, disabled = false }) => {
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

  const handleDateSelect = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    onChange({ target: { value: formattedDate } });
    setIsOpen(false);
  };

  const handleReset = () => {
    onChange({ target: { value: "" } });
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col mb-1" ref={containerRef}>
      <div className="h-5 px-1 flex items-center">
        {label && <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>}
      </div>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-11 bg-white border rounded-2xl px-4 text-sm font-bold text-slate-700 flex items-center justify-between transition-all focus:outline-none focus:ring-2 ${disabled ? "bg-slate-50/30 cursor-not-allowed border-indigo-600/20" :
            error ? "border-red-500 focus:ring-indigo-500/10 hover:border-slate-300" :
              "border-slate-200 focus:ring-indigo-500/10 hover:border-slate-300"
            }`}
        >
          <span className={!value ? "text-slate-300 font-medium" : ""}>{value ? displayDate : "Select Date"}</span>
          <Calendar size={14} className={`transition-colors ${isOpen ? "text-indigo-600" : "text-slate-400"}`} />
        </button>

        {/* Calendar Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute top-full left-0 mt-2 z-50">
            <CustomSingleCalendar
              selectedDate={value ? new Date(value) : null}
              onDateSelect={handleDateSelect}
              onReset={handleReset}
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 mt-0.5">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
};


const SectionTab = ({ active, completed, icon: Icon, label }) => (
  <div
    className={`flex flex-col items-center gap-2.5 relative z-10 transition-all duration-500 ${active ? "scale-105" : "scale-100"}`}
  >
    <div
      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${active ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20" : completed ? "bg-emerald-50 border-indigo-100 text-emerald-500" : "bg-white border-slate-100 text-slate-300"}`}
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

const KYCLoadingSkeleton = () => (
  <div className="w-full min-h-screen h-auto bg-[#F8FAFF] font-sans text-slate-900 py-10">
    {/* Header Skeleton */}
    <header className="flex flex-col sm:flex-row items-center justify-between px-6 md:px-12 mb-8 md:mb-10 gap-6">
      <div className="flex items-center gap-4 text-center sm:text-left">
        <Skeleton className="w-10 h-10 md:w-11 md:h-11 rounded-2xl" />
        <div className="flex flex-col items-center sm:items-start">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100">
        <Skeleton className="h-4 w-20" />
      </div>
    </header>

    <div className="w-full px-4 md:px-6">
      {/* Progress Bar Skeleton */}
      <div className="flex items-center justify-between relative mb-12 max-w-4xl mx-auto px-10">
        <div className="absolute top-5 left-12 right-12 h-px bg-slate-100"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2.5 relative z-10">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Form Container Skeleton */}
      <div className="bg-white max-w-7xl mx-auto rounded-[2rem] shadow-sm border border-slate-50 p-6 md:p-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl hidden sm:block" />
        </div>

        {/* Form Fields Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>

        {/* Navigation Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-16 pt-8 border-t border-slate-50 gap-4">
          <Skeleton className="h-12 w-32 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

const KYCSubmission = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fetchingProfile, setIsFetchingProfile] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [manualEntry, setManualEntry] = useState({ city: false, state: false });
  const [errors, setErrors] = useState({});
  const [bankList, setBankList] = useState([]);
  const [reKyc, setReKyc] = useState(false);
  const [existingFiles, setExistingFiles] = useState({
    aadharFileUrl: null,
    panFileUrl: null,
    shopImageUrl: null,
    blankChequeUrl: null
  });
  const dispatch = useDispatch();
  const [rejectionReason, setRejectionReason] = useState("");
  const [rekycSection, setReKycSection] = useState({
    personalDetailStatus: "approved", businessDetailStatus: "approved", identityDetailStatus: "approved", bankDetailStatus: "approved"
  });




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
  });
  const [documents, setDocuments] = useState({
    aadhaar: null,
    panFile: null,
    shopImage: null,
    blankCheque: null,
  });




  const { refetch: fetchUserProfile } = useFetch(
    `${apiEndpoints.fetchProfile}`,
    {
      onSuccess: (data) => {
        console.log("data", data);
        if (data.success) {

          if (data.data.kycStatus === "approved") navigate("/dashboard");
          if (data.data.kycStatus === "submitted") navigate("/kyc-pending");
          if (data.data.kycStatus === "rekyc") { setReKyc(true); }
          if (data.data.kycStatus === "rejected") {
            localStorage.removeItem('authToken');
            localStorage.removeItem('isAuthenticated');
            navigate("/login", { replace: true });
          }
          if (data?.data?.isPaymentRequired && data?.data?.idPaymentStatus && (data?.data?.idPaymentStatus === "pending" || data?.data?.idPaymentStatus === "rejected")) {

            navigate("/onboarding-charges", { state: { isKycOnline: data.data.isKycOnline, onBoardCharge: data.data.onBoardCharge } });
          }
          else if (data?.data?.isPaymentRequired && data?.data?.idPaymentStatus && data?.data?.idPaymentStatus === "complete") {

            navigate("/onboarding-pending");
          }


          setPersonalInfo((prev) => ({
            ...prev,
            firstName: data.data.firstName,
            lastName: data.data.lastName,
            email: data.data.email,
            phone: data.data.phone,
          }));
          setIsFetchingProfile(false);
        }
      },
      onError: (error) => {
        setIsFetchingProfile(false)
        console.log("error in user profile data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { refetch: fetchKycDetails } = useFetch(
    `${apiEndpoints.fetchKycDetails}`,
    {
      onSuccess: (data) => {
        console.log("data", data);
        if (data?.success) {
          setPersonalInfo({
            firstName: data?.data?.firstName || "",
            lastName: data?.data?.lastName || "",
            email: data?.data?.email || "",
            phone: data?.data?.phone || "",
            panNumber: data?.data?.panNumber || "",
            aadharNumber: data?.data?.aadharNumber || "",
            fatherName: data?.data?.fatherName || "",
            gender: data?.data?.gender || "",
            dob: data?.data?.dob || "",
            address: data?.data?.personalAddress?.address || "",
            city: data?.data?.personalAddress?.city || "",
            state: data?.data?.personalAddress?.state || "",
            pincode: data?.data?.personalAddress?.pincode || "",
          });
          setBusinessInfo({
            shopName: data?.data.shopName || "",
            gstNumber: data?.data.gstNumber || "",
            businessPanNumber: data?.data.businessPanNumber || "",
            address: data?.data?.businessAddress?.address || "",
            city: data?.data?.businessAddress?.city || "",
            state: data?.data?.businessAddress?.state || "",
            pincode: data?.data?.businessAddress?.pincode || "",
          });

          setBankInfo({
            accountHolderName: data?.data.accountHolderName || "",
            accountNumber: data?.data.accountNumber || "",
            ifscCode: data?.data.ifscCode || "",
            bankName: data?.data.bankName || "",
          });
          setExistingFiles({
            aadharFileUrl: data?.data?.identityDetailStatus === "approved" ? data?.data?.aadharFileUrl : null,
            panFileUrl: data?.data?.identityDetailStatus === "approved" ? data?.data?.panFileUrl : null,
            shopImageUrl: data?.data?.businessDetailStatus === "approved" ? data?.data?.shopImageUrl : null,
            blankChequeUrl: data?.data?.bankDetailStatus === "approved" ? data?.data?.blankChequeUrl : null
          });
          setRejectionReason(data?.data?.rejectionReason || "")
          setReKycSection({
            personalDetailStatus: data?.data?.personalDetailStatus || "approved",
            businessDetailStatus: data?.data?.businessDetailStatus || "approved",
            identityDetailStatus: data?.data?.identityDetailStatus || "approved",
            bankDetailStatus: data?.data?.bankDetailStatus || "approved"
          })
        }
      },
      onError: (error) => {
        console.log("error in user kyc details data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );
  useEffect(() => {
    if (reKyc) {
      fetchKycDetails()
    }
  }, [
    reKyc
  ])
  // Fetch Banks
  useFetch(
    `${apiEndpoints.fetchAllBanks}`,
    {
      onSuccess: (data) => {
        if (data.success && Array.isArray(data.data)) {
          const formattedBanks = data.data.map((bank) => ({
            label: bank.bankName,
            value: bank.bankName,
          }));
          setBankList(formattedBanks);
        }
      },
    },
    true
  );

  const validateStep = (currentStep) => {
    let tempErrors = {};
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
        tempErrors.aadharNumber = "Aadhaar Number is required";
      else if (!aadharRegex.test(personalInfo.aadharNumber))
        tempErrors.aadharNumber = "Aadhaar must be 12 digits";

      if (businessInfo.businessPanNumber) {
        if (!panRegex.test(businessInfo.businessPanNumber))
          tempErrors.businessPanNumber = "Invalid PAN format";
      }

      // Document Validation
      if (!documents.aadhaar && !existingFiles.aadharFileUrl)
        tempErrors.aadhaar = "Please upload Aadhaar Card";

      if (!documents.panFile && !existingFiles.panFileUrl)
        tempErrors.panFile = "Please upload Personal PAN Card";

      if (!documents.shopImage && !existingFiles.shopImageUrl)
        tempErrors.shopImage = "Please upload Shop Photo";

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


      if (!bankInfo.ifscCode.trim())
        tempErrors.ifscCode = "IFSC Code is required";
      else if (!ifscRegex.test(bankInfo.ifscCode))
        tempErrors.ifscCode = "Invalid IFSC Code";
      if (!documents.blankCheque && !existingFiles.blankChequeUrl)
        tempErrors.blankCheque = "Please upload blank cheque";



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

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG, and PDF files are allowed");
      e.target.value = ""; // Clear the input
      return;
    }

    if (file.size > 200 * 1024) {
      toast.error("File size must be less than 200KB");
      e.target.value = ''; // Clear the input
      return;
    }

    if (file) {
      setDocuments((prev) => ({ ...prev, [field]: file }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
     
    }
  };

  const { post: reuploadKyc } = usePost(apiEndpoints?.reUploadKyc, {
    onSuccess: (data) => {
      console.log(data);
      if (data.success) {
        toast.success("KYC Submitted Successfully!", {
          description: "Your details have been sent to the Admin for approval.",
        });
        dispatch(fetchProfile())
        fetchUserProfile()

        // navigate("/kyc-pending");
      }
    },
    onError: (error) => {
      console.error("Submission error:", error);
      setIsLoading(false);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const { post: submitKyc } = usePost(apiEndpoints?.kycSubmission, {
    onSuccess: (data) => {
      console.log(data);
      if (data.success) {
        toast.success("KYC Submitted Successfully!", {
          description: "Your details have been sent to the Admin for approval.",
        });
        dispatch(fetchProfile())
        fetchUserProfile()
      }
    },
    onError: (error) => {
      console.error("Submission error:", error);
      setIsLoading(false);
      toast.error(handleValidationError(error) || "Something went wrong");
    },
  });

  const { refetch: fetchBankList } = useFetch(
    `${apiEndpoints.fetchAllBanks}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data.map((item) => ({ ...item, label: item.bankName, value: item.bankName }))
          setBankList(temp);
        }
      },
      onError: (error) => {
        console.log("error in bank list data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }
    setIsLoading(true);

    // try {
    const formData = new FormData();
    let sections = []

    if (reKyc) {
      if (rekycSection.identityDetailStatus === "rejected") {
        const identityInfoSection = {
          section: "identity", data: {
            aadharNumber: personalInfo.aadharNumber,
            panNumber: personalInfo.panNumber
          }
        }
        sections.push(identityInfoSection)
      }
      if (rekycSection.personalDetailStatus === "rejected") {
        const personalInfoSection = {
          section: "personal", data: {
            firstName: personalInfo.firstName,

            lastName: personalInfo.lastName,
            fatherName: personalInfo.fatherName,
            gender: personalInfo.gender,
            email: personalInfo.email,
            phone: personalInfo.phone,
            dob: personalInfo.dob,
            personalAddress: personalInfo.address,
            personalCity: personalInfo.city,
            personalState: personalInfo.state,
            personalPincode: personalInfo.pincode,
            aadharNumber: personalInfo.aadharNumber,
            panNumber: personalInfo.panNumber
          }
        }
        sections.push(personalInfoSection)
      }

      if (rekycSection.businessDetailStatus === "rejected") {
        const businessInfoSection = {
          section: "business", data: {
            shopName: businessInfo.shopName,
            businessPanNumber: businessInfo.businessPanNumber,
            gstNumber: businessInfo.gstNumber,
            businessAddress: businessInfo.address,
            businessCity: businessInfo.city,
            businessState: businessInfo.state,
            businessPincode: businessInfo.pincode,
          }
        }
        if (documents.shopImage) formData.append("shopImage", documents.shopImage);

        sections.push(businessInfoSection)
      }
      if (rekycSection.bankDetailStatus === "rejected") {
        const bankInfoSection = {
          section: "bank", data: {
            accountHolderName: bankInfo.accountHolderName,
            bankName: bankInfo.bankName,
            accountNumber: bankInfo.accountNumber,
            ifscCode: bankInfo.ifscCode,

          }
        }
        if (documents.blankCheque) formData.append("blankCheque", documents.blankCheque);
        sections.push(bankInfoSection)
      }

      if (rekycSection.identityDetailStatus === "rejected") {
        if (documents.aadhaar) formData.append("aadharFile", documents.aadhaar);
        if (documents.panFile) formData.append("panFile", documents.panFile);

      }
      formData.append("sections", JSON.stringify(sections));

      reuploadKyc(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    else {
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

      console.log(documents);

      // Documents
      if (documents.aadhaar) formData.append("aadharFile", documents.aadhaar);
      if (documents.panFile) formData.append("panFile", documents.panFile);
      if (documents.shopImage) formData.append("shopImage", documents.shopImage);
      if (documents.blankCheque) formData.append("blankCheque", documents.blankCheque);
      console.log(Object.fromEntries(formData.entries()));

      submitKyc(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }


  };

  const handleownPincodeChange = async (e) => {
    const value = formatNumberInput(e.target.value, 6);



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
          setErrors((prev) => ({ ...prev, personalPincode: null, personalState: null, personalCity: null }));

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
        toast.error(handleValidationError(error) || "Something went wrong");
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  const handlePincodeChange = async (e) => {
    const value = formatNumberInput(e.target.value, 6);

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
          setErrors((prev) => ({ ...prev, businessPincode: null, businessState: null, businessCity: null }));
          toast.success("City and State auto-filled!", { id: toastId });

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
        toast.error(handleValidationError(error) || "Something went wrong");
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  if (fetchingProfile) {
    return <KYCLoadingSkeleton />;
  }

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
        <div className="hidden sm:flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm transition-all hover:border-slate-200">
          <div className="flex -space-x-1.5 grayscale opacity-50 contrast-125">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full border border-white ${s <= step ? "bg-indigo-600" : "bg-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 pl-3">
            <span className="text-slate-800">Step {step}</span> <span className="text-slate-200 mx-0.5">/</span> 3
          </span>
        </div>
      </header>

      <div className="w-full px-4 md:px-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between relative mb-12 max-w-4xl mx-auto px-10">
          <div className="absolute top-5 left-12 right-12 h-px bg-slate-100 -z-0"></div>
          <div
            className="absolute top-5 left-12 h-px bg-indigo-600 -z-0 transition-all duration-700 ease-in-out"
            style={{ width: `calc(${((step - 1) / 2) * 100}% - ${step === 3 ? "0px" : step === 2 ? "24px" : "48px"})` }}
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
        {reKyc && rejectionReason && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white max-w-7xl mx-auto rounded-[2rem] shadow-sm border border-red-100 p-6 md:p-8 mb-6 relative overflow-hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={20} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-red-600 tracking-tight leading-none mb-2 uppercase">
                  KYC Rejected
                </h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {rejectionReason}
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">
                  Please update the required information and resubmit
                </p>
              </div>
            </div>
          </m.div>
        )}

        {/* Form Container */}
        <m.div
          layout
          className="bg-white max-w-7xl mx-auto rounded-[2rem] shadow-sm border border-slate-50 p-6 md:p-10 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <m.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
                      Personal Details
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Please enter your basic personal information.
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <FileText size={24} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => {
                      // setPersonalInfo({
                      //   ...personalInfo,
                      //   firstName: formatNameInputWithSpace(e.target.value, 50),
                      // });
                    }}
                    placeholder="e.g. Rahul"
                    error={errors.firstName}
                    disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={personalInfo.lastName}
                    // onChange={(e) =>
                    //   setPersonalInfo({
                    //     ...personalInfo,
                    //     lastName: formatNameInputWithSpace(e.target.value, 50),
                    //   })
                    // }
                    placeholder="e.g. Kumar"
                    error={errors.lastName}
                    disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                  />
                  <Input
                    label="Father's Name"
                    name="fatherName"
                    value={personalInfo.fatherName}
                    onChange={(e) => {
                      setPersonalInfo({
                        ...personalInfo,
                        fatherName: formatNameInputWithSpace(e.target.value, 100),
                      })
                      if (errors.fatherName) { setErrors({ ...errors, fatherName: null }) }
                    }
                    }
                    placeholder="Father's Name"
                    error={errors.fatherName}
                    disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                  />
                  <div className="space-y-1.5 flex flex-col">
                    <Select
                      label="Gender"
                      value={personalInfo.gender}
                      onChange={(value) => {
                        setPersonalInfo({ ...personalInfo, gender: value })
                        if (errors.gender) { setErrors({ ...errors, gender: null }) }
                      }}
                      options={[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                        { label: "Other", value: "other" }
                      ]}
                      placeholder="Select Gender"
                      searchable={false}
                      disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                      error={errors.gender}
                    />

                  </div>
                  <Input
                    label="Email Address"

                    name="email"
                    value={personalInfo.email}
                    // onChange={(e) =>
                    //   setPersonalInfo({
                    //     ...personalInfo,
                    //     email: e.target.value,
                    //   })
                    // }
                    readOnly={true}
                    disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                    placeholder=""
                    error={errors.email}
                  />
                  <Input
                    label="Phone Number"

                    name="phone"
                    value={personalInfo.phone}
                    disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                    readOnly={true}
                    // onChange={(e) => {

                    //   setPersonalInfo({
                    //     ...personalInfo,
                    //     phone: formatNumberInput(e.target.value,10),
                    //   });

                    // }}
                    placeholder=""
                    error={errors.phone}
                  />
                  <DatePickerField
                    label="Date of Birth"
                    value={personalInfo.dob}
                    onChange={(e) => {
                      setPersonalInfo({ ...personalInfo, dob: e.target.value });
                      if (errors.dob) { setErrors({ ...errors, dob: null }) }
                    }
                    }
                    disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                    error={errors.dob}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                  />

                  <Input
                    label="Address"
                    name="address"
                    value={personalInfo.address}
                    onChange={(e) => {
                      setPersonalInfo({
                        ...personalInfo,
                        address: InputSlice(e.target.value, 200),
                      })
                      if (errors.personalAddress) { setErrors({ ...errors, personalAddress: null }) }
                    }
                    }
                    disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                    placeholder="Plot No, Street, Area"
                    error={errors.personalAddress}
                  />
                  <div className="relative">
                    <Input
                      label="Pincode"
                      name="pincode"
                      value={personalInfo.pincode}
                      onChange={handleownPincodeChange}
                      placeholder=""
                      disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                      error={errors.personalPincode}
                    />
                    {isFetchingPincode && (
                      <div className="absolute right-4 top-[38px] text-orange-500 animate-spin">
                        <Loader2 size={16} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 relative">
                    {isFetchingPincode ? (
                      <div className="w-full h-11 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                    ) : (
                      <Input
                        label="State"
                        name="state"
                        value={personalInfo.state}
                        disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                        onChange={(e) => {
                          setPersonalInfo({
                            ...personalInfo,
                            state: formatNameInputWithSpace(e.target.value, 50),
                          })
                          if (errors.personalState) { setErrors({ ...errors, personalState: null }) }
                        }
                        }
                        placeholder="State"
                        error={errors.personalState}
                        required={false} // Label handles the asterisk
                      />
                    )}
                  </div>
                  <div className="space-y-1.5 relative">
                    {isFetchingPincode ? (
                      <div className="w-full h-11 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                    ) : (
                      <Input
                        label="City"
                        name="city"
                        disabled={reKyc && rekycSection.personalDetailStatus === "approved"}
                        value={personalInfo.city}
                        onChange={(e) => {
                          setPersonalInfo({
                            ...personalInfo,
                            city: formatNameInputWithSpace(e.target.value, 50),
                          })
                          if (errors.personalCity) {
                            setErrors({ ...errors, personalCity: null })
                          }
                        }
                        }
                        placeholder="City"
                        error={errors.personalCity}
                        required={false}
                      />
                    )}
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
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
                      Business Info
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Tell us about your shop or business.
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <Store size={24} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Shop/Business Name"
                      name="shopName"
                      value={businessInfo.shopName}
                      onChange={(e) => {
                        setBusinessInfo({
                          ...businessInfo,
                          shopName: InputSlice(e.target.value, 100),
                        })
                        if (errors.shopName) { setErrors({ ...errors, shopName: null }) }
                      }
                      }
                      disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                      placeholder="e.g. Rahul Enterprises"
                      error={errors.shopName}
                    />
                  </div>

                  <Input
                    label="Business PAN Card (optional)"
                    name="businessPanNumber"
                    value={businessInfo.businessPanNumber}
                    onChange={(e) => {
                      setBusinessInfo({
                        ...businessInfo,
                        businessPanNumber: formatPanInput(e.target.value.toUpperCase()),
                      })
                      if (errors.businessPanNumber) { setErrors({ ...errors, businessPanNumber: null }) }
                    }
                    }
                    disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                    placeholder="ABCDE1234F"
                    required={false}
                    error={errors.businessPanNumber}
                  />
                  <Input
                    label="GST Number (Optional)"
                    name="gstNumber"
                    value={businessInfo.gstNumber}
                    onChange={(e) => {
                      setBusinessInfo({
                        ...businessInfo,
                        gstNumber: formatGstInput(e.target.value.toUpperCase()),
                      })
                      if (errors.gstNumber) { setErrors({ ...errors, gstNumber: null }) }
                    }
                    }
                    disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                    placeholder="22AAAAA0000A1Z5"
                    required={false}
                    error={errors.gstNumber}
                    onBlur={() => {
                      if (businessInfo.gstNumber && businessInfo.businessPanNumber === "") {
                        setBusinessInfo({
                          ...businessInfo,
                          businessPanNumber: businessInfo.gstNumber.slice(2, 12),
                        })
                      }
                    }}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Shop Address"
                      name="address"
                      value={businessInfo.address}
                      onChange={(e) => {
                        setBusinessInfo({
                          ...businessInfo,
                          address: InputSlice(e.target.value, 200),
                        })
                        if (errors.businessAddress) { setErrors({ ...errors, businessAddress: null }) }
                      }
                      }
                      disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                      placeholder="Plot No, Street, Area"
                      error={errors.businessAddress}
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <Input
                        label="Pincode"
                        name="pincode"
                        value={businessInfo.pincode}
                        onChange={handlePincodeChange}
                        placeholder="110001"
                        error={errors.businessPincode}
                        disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                      />
                      {isFetchingPincode && (
                        <div className="absolute right-4 top-[38px] text-orange-500 animate-spin">
                          <Loader2 size={16} />
                        </div>
                      )}
                    </div>

                    {/* State Field */}
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      {isFetchingPincode ? (
                        <div className="w-full h-11 bg-slate-50 rounded-2xl animate-pulse border border-slate-200" />
                      ) : (
                        <Input
                          name="state"
                          value={businessInfo.state}
                          disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                          onChange={(e) => {
                            setBusinessInfo({
                              ...businessInfo,
                              state: formatNameInputWithSpace(e.target.value, 50),
                            })
                            if (errors.businessState) { setErrors({ ...errors, businessState: null }) }
                          }
                          }
                          placeholder="State"
                          error={errors.businessState}
                          required={false} // Label handles the asterisk
                        />
                      )}
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      {isFetchingPincode ? (
                        <div className="w-full h-11 bg-slate-50 rounded-2xl animate-pulse border border-slate-200" />
                      ) : (
                        <Input
                          name="city"
                          value={businessInfo.city}
                          disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                          onChange={(e) => {
                            setBusinessInfo({
                              ...businessInfo,
                              city: formatNameInputWithSpace(e.target.value, 50),
                            })
                            if (errors.businessCity) { setErrors({ ...errors, businessCity: null }) }
                          }
                          }
                          placeholder="City"
                          error={errors.businessCity}
                          required={false}
                        />
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                      Owner Identification
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Personal PAN Number"
                        name="panNumber"
                        value={personalInfo.panNumber}
                        onChange={(e) => {
                          setPersonalInfo({
                            ...personalInfo,
                            panNumber: formatPanInput(e.target.value.toUpperCase()),
                          })
                          if (errors.panNumber) { setErrors({ ...errors, panNumber: null }) }
                        }
                        }
                        placeholder="ABCDE1234F"
                        error={errors.panNumber}
                        disabled={reKyc && rekycSection.identityDetailStatus === "approved"}
                      />
                      <Input
                        label="Aadhaar Number"
                        name="aadharNumber"
                        value={personalInfo.aadharNumber}
                        onChange={(e) => {

                          setPersonalInfo({
                            ...personalInfo,
                            aadharNumber: formatAadharInput(e.target.value),
                          })
                          if (errors.aadharNumber) { setErrors({ ...errors, aadharNumber: null }) }
                        }
                        }
                        placeholder="12 Digit Aadhaar Number"
                        error={errors.aadharNumber}
                        disabled={reKyc && rekycSection.identityDetailStatus === "approved"}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 mt-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-0.5 flex-1 bg-slate-100" />
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Upload Documents
                      </h3>
                      <div className="h-0.5 flex-1 bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <DocumentUploadBox
                        label="Aadhaar Card"
                        field="aadhaar"
                        onChange={handleFileChange}
                        file={documents.aadhaar}
                        icon={FileText}
                        existingFileUrl={reKyc && rekycSection.identityDetailStatus === "approved" ? `${import.meta.env.VITE_API_URL}${existingFiles.aadharFileUrl}` : null}
                        disabled={reKyc && rekycSection.identityDetailStatus === "approved"}
                        error={errors.aadhaar}
                      />
                      <DocumentUploadBox
                        label="Personal PAN"
                        field="panFile"
                        onChange={handleFileChange}
                        file={documents.panFile}
                        icon={FileText}
                        existingFileUrl={reKyc && rekycSection.identityDetailStatus ? `${import.meta.env.VITE_API_URL}${existingFiles.panFileUrl}` : null}
                        disabled={reKyc && rekycSection.identityDetailStatus === "approved"}
                        error={errors.panFile}
                      />
                      <DocumentUploadBox
                        label="Shop Photo (Selfie)"
                        field="shopImage"
                        onChange={handleFileChange}
                        file={documents.shopImage}
                        icon={Store}
                        existingFileUrl={reKyc && rekycSection.businessDetailStatus === "approved" ? `${import.meta.env.VITE_API_URL}${existingFiles.shopImageUrl}` : null}
                        disabled={reKyc && rekycSection.businessDetailStatus === "approved"}
                        error={errors.shopImage}
                      />
                    </div>
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase mt-6 tracking-widest">
                      Supported: JPG, PNG, PDF <span className="mx-2 text-slate-200">|</span> Max: 200KB per file
                    </p>
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
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-2">
                      Bank Details
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      Settlements and commissions
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                      <Banknote size={24} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Account Holder Name"
                    name="accountHolderName"
                    value={bankInfo.accountHolderName}
                    onChange={(e) => {
                      setBankInfo({
                        ...bankInfo,
                        accountHolderName: formatNameInputWithSpace(e.target.value, 100),
                      })
                      if (errors.accountHolderName) { setErrors({ ...errors, accountHolderName: null }) }
                    }
                    }
                    disabled={reKyc && rekycSection.bankDetailStatus === "approved"}
                    placeholder="Same as bank records"
                    error={errors.accountHolderName}
                  />

                  <div className="space-y-1.5 flex flex-col">
                    <Select
                      label="Bank Name"
                      value={bankInfo.bankName}
                      onChange={(value) => {
                        setBankInfo({ ...bankInfo, bankName: value })
                        if (errors.bankName) { setErrors({ ...errors, bankName: null }) }
                      }}
                      options={bankList}
                      placeholder={bankList.length > 0 ? "Select Bank Name" : "Loading Banks..."}
                      searchable={true}
                      disabled={reKyc && rekycSection.bankDetailStatus === "approved"}
                      error={errors.bankName}
                    />

                  </div>

                  <Input
                    label="Account Number"
                    name="accountNumber"
                    value={bankInfo.accountNumber}
                    onChange={(e) => {
                      setBankInfo({
                        ...bankInfo,
                        accountNumber: formatNumberInput(e.target.value, 18),
                      })
                      if (errors.accountNumber) { setErrors({ ...errors, accountNumber: null }) }
                    }
                    }
                    disabled={reKyc && rekycSection.bankDetailStatus === "approved"}
                    placeholder="0000000000"
                    error={errors.accountNumber}
                  />

                  <Input
                    label="IFSC Code"
                    name="ifscCode"
                    value={bankInfo.ifscCode}
                    onChange={(e) => {
                      setBankInfo({
                        ...bankInfo,
                        ifscCode: formatIfscInput(e.target.value.toUpperCase()),
                      })
                      if (errors.ifscCode) { setErrors({ ...errors, ifscCode: null }) }
                    }
                    }
                    disabled={reKyc && rekycSection.bankDetailStatus === "approved"}
                    placeholder="HDFC0001234"
                    error={errors.ifscCode}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DocumentUploadBox
                    label="Blank Cheque"
                    field="blankCheque"
                    onChange={handleFileChange}
                    file={documents.blankCheque}
                    icon={FileText}
                    existingFileUrl={reKyc && rekycSection.bankDetailStatus === "approved" ? `${import.meta.env.VITE_API_URL}${existingFiles.blankChequeUrl}` : null}
                    disabled={reKyc && rekycSection.bankDetailStatus === "approved"}
                    error={errors.blankCheque}
                  />

                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-16 pt-8 border-t border-slate-50 gap-4">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                <ArrowLeft size={16} strokeWidth={3} />
                Back
              </Button>
            ) : (
              <div className="hidden sm:block w-32"></div>
            )}

            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 h-12 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all shadow-xl"
              >
                Continue
                <ArrowRight size={16} strokeWidth={3} />
              </Button>
            ) : (
              <Button
                onClick={() => { handleSubmit() }}
                isLoading={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-12 h-12 rounded-2xl bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-70"
              >
                Complete KYC
                {!isLoading && <Check size={18} strokeWidth={3} />}
              </Button>
            )}
          </div>
        </m.div>
      </div>
    </div>
  );
};

const DocumentUploadBox = ({
  label,
  field,
  onChange,
  file,
  existingFileUrl = null,
  icon: Icon = File,
  disabled = false,
  error = null
}) => {
  const previewUrl = React.useMemo(() => {
    if (file && typeof file === 'object') {
      return URL.createObjectURL(file);
    }
    return existingFileUrl || null;
  }, [file, existingFileUrl]);

  const hasFile = file || existingFileUrl;

  const getFileName = () => {
    if (file && typeof file === 'object') {
      return file.name;
    }
    if (existingFileUrl) {
      return existingFileUrl.split('/').pop() || 'Existing File';
    }
    return '';
  };

  const isPDF = () => {
    if (file && typeof file === 'object') {
      return file.type === "application/pdf";
    }
    if (existingFileUrl) {
      return existingFileUrl.toLowerCase().includes('.pdf');
    }
    return false;
  };

  return (
    <div className={`relative group transition-all duration-300 ${hasFile ? "scale-[1.01]" : !disabled && "hover:scale-[1.01]"}`}>
      <div className={`border-2 border-dashed rounded-[2rem] p-5 text-center transition-all relative h-52 flex flex-col items-center justify-center bg-white overflow-hidden ${disabled
        ? "border-slate-300/50"
        : "cursor-pointer"
        } ${hasFile
          ? "border-emerald-500/30 bg-emerald-50/10 shadow-lg shadow-emerald-500/5 whitespace-normal"
          : !disabled && (error ? "border-red-500/30 hover:border-red-600/30 hover:bg-red-50/10 shadow-sm hover:shadow-red-600/5 group" : "border-slate-100 hover:border-indigo-600/30 hover:bg-indigo-50/10 shadow-sm hover:shadow-indigo-600/5 group")
        }`}>

        {/* File Input - Only active when not disabled */}
        {!disabled && (
          <input
            type="file"
            onChange={(e) => onChange(e, field)}
            className="absolute inset-0 opacity-0 cursor-pointer z-20"
            accept="application/pdf,.jpg,.jpeg,.png"
          />
        )}

        {hasFile ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 relative z-10">
            <div className="relative w-full h-28 rounded-2xl overflow-hidden shadow-md border border-white bg-slate-50">
              {isPDF() ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50 text-emerald-600">
                  <File size={32} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase mt-1">PDF DOC</span>
                </div>
              ) : (
                <img
                  src={previewUrl}
                  alt={label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              )}

              {/* Fallback for broken images */}
              <div className="w-full h-full hidden flex-col items-center justify-center bg-slate-100 text-slate-400">
                <File size={32} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase mt-1">FILE</span>
              </div>

              {/* Upload overlay - only show when not disabled and on hover */}
              {!disabled && (
                <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white p-2 rounded-full shadow-lg">
                    <Upload size={18} className="text-emerald-600" />
                  </div>
                </div>
              )}

              {/* Disabled indicator - positioned at top-right corner */}
              {disabled && (
                <div className="absolute top-2 right-2 z-30">
                  <div className="bg-slate-500/90 text-white px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-sm">
                    View Only
                  </div>
                </div>
              )}
            </div>

            <div className="text-center px-2 w-full">
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-0.5">
                <Check size={14} strokeWidth={4} />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  Uploaded
                </p>
              </div>
              <p className="text-xs font-black text-slate-800 tracking-tight leading-tight mb-1">{label}</p>
              <p className="text-[10px] text-slate-400 font-bold max-w-[140px] truncate mx-auto opacity-70">
                {getFileName()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 relative z-10">
            {/* Disabled overlay for empty state */}
            {disabled && (
              <div className="absolute inset-0 bg-slate-100/30 z-20 flex items-center justify-center">
                <div className="bg-slate-500/80 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Disabled
                </div>
              </div>
            )}

            <div className={`w-14 h-14 rounded-3xl bg-slate-50 text-slate-300 flex items-center justify-center transition-all duration-500 ${!disabled && "group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-600/20 group-hover:-translate-y-1"
              } ${disabled && "opacity-50"}`}>
              <Icon size={28} />
            </div>
            <div className={disabled ? "opacity-50" : ""}>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{label}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100">
                  MAX 200KB
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-[10px] text-red-500 font-bold ml-1 flex items-center gap-1 mt-0.5">
            <AlertCircle size={10} /> {error}
          </p>
        )}
      </div>
    </div>
  );
};



export default KYCSubmission;
