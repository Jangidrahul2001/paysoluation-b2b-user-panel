import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Mail, Smartphone, Building2, CreditCard, Hash,
  FileText, ChevronDown, Search,
  Fingerprint, Lock, Zap, CalendarDays, User, MapPin,
  Navigation, Info, Banknote, History,
  ArrowRight,
  Calendar,
  Timer,
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  RefreshCcw,
  Network
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PageLayout } from '../../components/layout/PageLayout';
import { Input } from '../../components/ui/Input';
import { CustomSingleCalendar } from '../../components/dashboard/CustomSingleCalendar';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { aadharRegex, checkAssignedService, emailRegex, formatAadharInput, formatEmailInput, formatNameInputWithSpace, formatNumberInput, formatPanInput, handleValidationError, nameWithSpaceRegex, panRegex, phoneRegex, pincodeRegex, rejectRequest } from '../../utils/helperFunction';
import { apiEndpoints } from '../../api/apiEndpoints';
import { useFetch } from '../../hooks/useFetch';
import { usePost } from '../../hooks/usePost';
import { form } from '@heroui/theme';
import {
  discoverDevice,
  captureFingerprint,
  getDeviceInfo,
} from "../../api/RdService";
import { parseAndBuildPidData } from '../../api/PidParser';
import NoPermission from '../NoPermission';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/profileSlice';
import { Skeleton } from '../../components/ui/skeleton';
import RejectedRequest from '../RejectedRequest';


export default function AEPS() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);
  const [currentStep, setCurrentStep] = useState(profile?.aeps1?.isAepsEnabled ? 'login' : profile?.aeps1?.isVerified ? "status" : "registration");
  console.log(currentStep, "current step aeps")
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    aadhaar: "",
    pan: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bank: "",
    city: "",
    pincode: "",
    latitude: null,
    longitude: null,
  });
  const [bankList, setBankList] = useState([]);

  useEffect(() => {
    if (profile && profile?.aeps1) {
      if (!profile?.aeps1?.isAepsEnabled) {
        if (profile?.aeps1?.isVerified) {
          setCurrentStep('status');
          setActionRequired(false)
        }
        else if (profile?.aeps1?.action && profile?.aeps1?.action === "ACTION-REQUIRED") {
          setCurrentStep("status")
        }
        else {
          setCurrentStep("registration")
        }
      } else {

        if (profile?.aeps1?.isLoginRequired)
          setCurrentStep('login');

        else {
          navigate("/aeps/aeps-service", { replace: true });
        }
      }
    }
  }, [profile.aeps1]);

  const { refetch: fetchBanks } = useFetch(
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
      onError: (error) => {
        console.log("error in fetching bank list", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );


  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isDetectingRD, setIsDetectingRD] = useState(false);
  const [rdDeviceStatus, setRdDeviceStatus] = useState('disconnected');
  const [errors, setErrors] = useState({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [actionRequired, setActionRequired] = useState(false)
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleValidation = () => {
    let tempErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      tempErrors.name = "Full Name is required";
    }
    else if (!nameWithSpaceRegex.test(formData.name?.trim())) {
      tempErrors.name = "Enter a valid full name";
    }
    // Mobile validation
    if (!formData.mobile.trim()) {
      tempErrors.mobile = "Mobile number is required";
    } else if (!phoneRegex.test(formData.mobile)) {
      tempErrors.mobile = "Invalid mobile number";
    }
    // Email validation
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Invalid email format";
    }

    if (!formData.pincode.trim()) {
      tempErrors.pincode = "pincode is required";
    } else if (!pincodeRegex.test(formData.pincode)) {
      tempErrors.pincode = "Invalid pincode format";
    }

    if (!formData.city.trim()) {
      tempErrors.city = "city is required";
    } else if (!nameWithSpaceRegex.test(formData.city?.trim())) {
      tempErrors.city = "Invalid city format";
    }
    // PAN validation
    if (!formData.pan.trim()) {
      tempErrors.pan = "PAN number is required";
    } else if (!panRegex.test(formData.pan)) {
      tempErrors.pan = "Invalid PAN format";
    }
    // Bank validation
    if (!formData.bank) {
      tempErrors.bank = "Settlement Bank is required";
    }
    // Aadhaar validation
    if (!formData.aadhaar.trim()) {
      tempErrors.aadhaar = "Aadhaar number is required";
    } else if (!aadharRegex.test(formData.aadhaar)) {
      tempErrors.aadhaar = "Aadhaar must be 12 digits";
    }
    // Address validation
    if (!formData.address.trim()) {
      tempErrors.address = "Address is required";
    }
    // Date of Birth validation
    if (!formData.dateOfBirth) {
      tempErrors.dateOfBirth = "Date of Birth is required";
    }
    // Gender validation
    if (!formData.gender) {
      tempErrors.gender = "Gender is required";
    }
    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill all required fields correctly");
      return false;
    }

    return true;
  };


  const { post: aepsRegistrationOutlet } = usePost(apiEndpoints.aepsInstantRegisterOutlet, {
    onSuccess: (res) => {
      if (res.success) {
        console.log(res)
        toast.success(res.message || 'Registration submitted');
        setIsLoading(false);
        setCurrentStep('status');
      }
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Failed to Register', error);
      toast.error(handleValidationError(error) || "Something went wrong");
    }
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get location. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);



  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
    setIsLoading(true);

    const dataSendToBackend = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      aadhaar: formData.aadhaar,
      pan: formData.pan,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      latitude: formData.latitude,
      longitude: formData.longitude,
      address: {
        full: formData.address,
        city: formData.city,
        pincode: formData.pincode
      }
    }
    console.log(dataSendToBackend)
    aepsRegistrationOutlet(dataSendToBackend);

  };

  const { refetch: aepsInstantGetBioMetricStatus } = useFetch(
    `${apiEndpoints.aepsInstantGetBioMetricStatus}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data);
          if (data?.data?.action === "ACTION-REQUIRED") {
            setActionRequired(true)
            setIsCheckingStatus(false);
          }
          else {
            setIsCheckingStatus(false);
            setActionRequired(false)
            setCurrentStep('login');
            toast.success('Biometric status verified');
          }
        }
      },
      onError: (error) => {
        setIsCheckingStatus(false);
        console.log("error in getting biometric status data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );

  const handleCheckStatus = () => {
    setIsCheckingStatus(true);

    aepsInstantGetBioMetricStatus();
  };

  const handleScan = async () => {
    setIsDetectingRD(true);
    setRdDeviceStatus('detecting');
    const device = await discoverDevice();

    if (!device.success) {
      toast.error(device.message);
      setIsDetectingRD(false);
      return;
    }
    else {
      setIsDetectingRD(false);
      setRdDeviceStatus('connected');
      toast.success('RD Device detected');
    }


  };



  const handleCaptureFinger = async () => {
    setIsLoading(true);
    const capture = await captureFingerprint(true, "aeps1");

    if (capture.success) {
      console.log("PID DATA:", capture.data);
      const parsedData = parseAndBuildPidData(capture.data)
      if (parsedData.success) {
        aepsInstantBiometricKyc({
          latitude: formData.latitude,
          longitude: formData.longitude,
          captureType: "finger",
          biometricData: parsedData.data
        })

        console.log("FINAL PID XML:", parsedData.data);
      }
      else {
        toast.error("Failed to parse PID data");
        console.log("error", parsedData)
      }
    } else {
      setIsLoading(false);
      toast.error(capture.message);
    }


  };

  const { post: aepsInstantBiometricKyc } = usePost(apiEndpoints.aepsInstantBiometricKyc, {
    onSuccess: (res) => {
      if (res.success) {
        console.log(res)
        setIsLoading(false);
        toast.success(res.message || 'Biometric KYC completed');
        setCurrentStep("status")
        setActionRequired(false)
      }
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Failed to kyc biometrics:', error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });

  const handleLogin = async () => {

    if (!aadharRegex.test(formData.aadhaar)) {
      setErrors({ aadhaar: "Enter a valid aadhaar number" })

      return
    }
    setIsLoading(true);
    const capture = await captureFingerprint(false);

    if (capture.success) {
      console.log("PID DATA:", capture.data);
      const parsedData = parseAndBuildPidData(capture.data)
      if (parsedData.success) {
        loginAeps({
          latitude: formData.latitude,
          longitude: formData.longitude,
          captureType: "finger",
          biometricData: parsedData.data,
          aadhaar: formData.aadhaar
        })

        console.log("FINAL PID XML:", parsedData.data);
      }
      else {
        toast.error("Failed to parse PID data");
        console.log("error", parsedData)
      }
    } else {
      setIsLoading(false)
      toast.error(capture.message);
    }


  };
  const { post: loginAeps } = usePost(apiEndpoints.apesInstantdailyLogin, {
    onSuccess: (res) => {
      if (res.success) {
        console.log(res)
        toast.success(res.message || 'Login successful');
        setIsLoading(false);
        dispatch(fetchProfile());
        navigate('/aeps/aeps-service');
      }

    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Failed to aeps login', error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });


  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="Aadhaar Enabled Payment System"
        subtitle="Modernized Biometric Authentication Gateway"
        className="max-w-[1600px] mx-auto py-6"
      >
        <div className="grid grid-cols-1 gap-8">
          <Card className="p-6 md:p-8">
            <div className="space-y-8">
              {/* Header Section Skeleton */}
              <div className="col-span-full border-b border-slate-50 pb-3 mb-1">
                <Skeleton className="h-4 w-40" />
              </div>

              {/* Form Fields Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}

                {/* Professional Section Skeleton */}
                <div className="col-span-full border-b border-slate-50 pb-3 mt-4 mb-1">
                  <Skeleton className="h-4 w-48" />
                </div>

                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}

                {/* Address Field Skeleton */}
                <div className="col-span-full space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                {[1, 2].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                ))}

                {/* Date and Gender Skeleton */}
                <div className="grid grid-cols-2 gap-6 col-span-full">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Submit Button Skeleton */}
              <div className="pt-8 border-t border-slate-50 flex justify-center">
                <Skeleton className="h-12 w-48 rounded-full" />
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (rejectRequest("aeps1", profile?.requestedService)) return (<RejectedRequest service="aeps" pipeline="aeps1" />)
  if (!checkAssignedService("aeps", "aeps1", profile?.assignedServices)) return (<NoPermission service="aeps" pipeline="aeps1" />)

  return (
    <PageLayout
      title="Aadhaar Enabled Payment System"
      subtitle="Modernized Biometric Authentication Gateway"
      className="max-w-[1600px] mx-auto py-6"
    >
      <div className="grid grid-cols-1 gap-8 relative z-0">

        {currentStep === 'registration' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Card className="p-6 md:p-8 relative ">
              <form onSubmit={handleRegistrationSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-full border-b border-slate-50 pb-3 mb-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      <User size={14} className="text-indigo-600" /> Identity Information
                    </h3>
                  </div>

                  <Input
                    label="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: formatNameInputWithSpace(e.target.value, 100) });
                      if (errors.name) {
                        setErrors({ ...errors, name: '' });
                      }
                    }}
                    placeholder="Rahul Sharma"
                    error={errors.name}
                  />

                  <Input
                    label="Registered Mobile"
                    icon={Smartphone}
                    value={formData.mobile}
                    onChange={(e) => {
                      setFormData({ ...formData, mobile: formatNumberInput(e.target.value, 10) });
                      if (errors.mobile) {
                        setErrors({ ...errors, mobile: '' });
                      }
                    }}
                    error={errors.mobile}
                    placeholder="9876543210"
                    maxLength={10}
                  />

                  <Input
                    label="Email Address"
                    icon={Mail}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: formatEmailInput(e.target.value) });
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    error={errors.email}
                    placeholder="rahul@example.com"
                  />

                  <Input
                    label="PAN Card Number"
                    icon={FileText}
                    value={formData.pan}
                    onChange={(e) => {
                      setFormData({ ...formData, pan: formatPanInput((e.target.value).toUpperCase()) });
                      if (errors.pan) {
                        setErrors({ ...errors, pan: '' });
                      }
                    }}
                    error={errors.pan}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />

                  <div className="col-span-full border-b border-slate-50 pb-3 mt-4 mb-1">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                      <Building2 size={14} className="text-indigo-600" /> Professional & Professional
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Settlement Bank</label>
                    <Select
                      placeholder={bankList.length > 0 ? "Select Bank Name" : "Loading Banks..."}
                      searchable={true}
                      options={bankList}
                      value={formData.bank}
                      onChange={(value) => {
                        setFormData({ ...formData, bank: value })
                        if (errors.bank) {
                          setErrors({ ...errors, bank: '' });
                        }
                      }}

                      className="h-11! rounded-xl!"
                      error={errors.bank}
                    />
                  </div>

                  <Input
                    label="Aadhar Number"
                    icon={Fingerprint}
                    value={formData.aadhaar}
                    onChange={(e) => {
                      setFormData({ ...formData, aadhaar: formatAadharInput(e.target.value) })
                      if (errors.aadhaar) {
                        setErrors({ ...errors, aadhaar: '' });
                      }
                    }}

                    placeholder="000000000000"
                    maxLength={12}
                    error={errors.aadhaar}
                  />

                  <div className="col-span-full">
                    <Input
                      label="Shop Address"
                      icon={MapPin}
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value })
                        if (errors.address) {
                          setErrors({ ...errors, address: '' });
                        }
                      }}
                      error={errors.address}
                      placeholder="Main Square, Jaipur"
                    />
                  </div>

                  <Input
                    label="Pincode"

                    value={formData.pincode}
                    onChange={(e) => {
                      setFormData({ ...formData, pincode: formatNumberInput(e.target.value, 6) });
                      if (errors.pincode) {
                        setErrors({ ...errors, pincode: '' });
                      }
                    }}
                    placeholder="305001"
                    error={errors.pincode}
                  />

                  <Input
                    label="City"

                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: formatNameInputWithSpace(e.target.value, 50) });
                      if (errors.city) {
                        setErrors({ ...errors, city: '' });
                      }
                    }}
                    error={errors.city}
                    placeholder="jaipur"

                  />

                  <div className="grid grid-cols-2 gap-6 col-span-full">
                    <div className="space-y-2 z-9999" ref={datePickerRef}>
                      <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Date of Birth</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                          className={cn(
                            "group w-full h-11 bg-white border rounded-xl px-4 text-sm font-bold text-slate-700 flex items-center justify-between transition-all hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5",
                            isDatePickerOpen && "border-indigo-500/50 ring-4 ring-indigo-500/5",
                            errors.dateOfBirth ? "border-red-500 bg-red-50/30 ring-4 ring-red-50" : "border-slate-200"
                          )}
                        >
                          <span>{formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "dd MMM yyyy") : "Select Date"}</span>
                          <Calendar size={16} className="text-slate-400" />
                        </button>
                        <AnimatePresence>
                          {isDatePickerOpen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute z-110 mt-2 right-0">
                              <CustomSingleCalendar
                                selectedDate={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                                onDateSelect={(date) => {
                                  setFormData({ ...formData, dateOfBirth: format(date, "yyyy-MM-dd") });
                                  setIsDatePickerOpen(false);
                                }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      {errors.dateOfBirth && (
                        <p className="text-red-600 text-xs mt-1 ml-1">{errors.dateOfBirth}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Gender</label>
                      <Select
                        options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }]}
                        value={formData.gender}
                        onChange={(val) => setFormData({ ...formData, gender: val })}
                        className="h-11! rounded-xl! z-999"
                        error={errors.gender}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex justify-center">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="h-12 px-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-xl shadow-indigo-600/20"
                  >
                    Submit for Aeps
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
        {currentStep === 'status' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center pt-8 md:pt-12"
          >
            <Card className="w-full max-w-lg p-10 flex flex-col items-center gap-8 border-slate-50">
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-slate-50 text-indigo-600 flex items-center justify-center shadow-inner relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full animate-ping opacity-20 pointer-events-none" />
                    <RefreshCcw size={32} className={cn("relative z-10 transition-transform duration-1000", isCheckingStatus && "animate-spin")} />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tightest uppercase mb-1">
                  Onboarding Hub
                </h2>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] leading-tight">
                  HARDWARE SYNCHRONIZATION PENDING
                </p>
              </div>

              <div className="w-full space-y-4 pt-4">
                {!actionRequired && <Button
                  onClick={handleCheckStatus}
                  isLoading={isCheckingStatus}
                  className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-9 md:h-10 uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                >
                  Check Biometric Status
                </Button>}

                {
                  actionRequired &&
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Action: Detection */}
                    <Button
                      onClick={handleScan}
                      isLoading={isDetectingRD}
                      className="w-full h-9 md:h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest transition-all active:scale-[0.98]"
                    >
                      {/* <Cpu size={16} className={cn("mr-2", isDetectingRD && "animate-spin")} /> */}
                      Detect RD Device
                    </Button>

                    {/* Right Action: Verification */}
                    <Button
                      onClick={handleCaptureFinger}
                      isLoading={isLoading}
                      disabled={rdDeviceStatus !== 'connected'}
                      className={cn(
                        "w-full h-9 md:h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500",
                        rdDeviceStatus === 'connected'
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-slate-50 text-slate-300 cursor-not-allowed border border-dashed border-slate-200/50"
                      )}
                    >
                      {rdDeviceStatus === 'connected' ? "Capture Fingerprint" : "Waiting Sync"}
                    </Button>
                  </div>
                }

                {/* <button
                  onClick={() => setCurrentStep('registration')}
                  className="w-full text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors py-2"
                >
                  Return to Merchant Details
                </button> */}
              </div>
            </Card>
            <p className="mt-8 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
              Synchronizing with National Payments Corporation of India
            </p>
          </motion.div>
        )}
        {currentStep === 'login' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center pt-8 md:pt-14 pb-16"
          >
            <Card className="w-full max-w-lg overflow-hidden rounded-3xl border-slate-100 shadow-sm bg-white">
              <div className="p-8 space-y-8">
                {/* Minimalist Terminal Header */}
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tightest uppercase">
                    Portal Access
                  </h2>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                    SECURE BIOMETRIC GATEWAY
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Aadhaar Input Terminal (Native Component Usage) */}
                  <Input
                    label="Merchant Aadhaar Number"
                    icon={Fingerprint}
                    value={formData.aadhaar}
                    onChange={(e) => {
                      setFormData({ ...formData, aadhaar: formatAadharInput(e.target.value) })
                      if (errors.aadhaar) {
                        setErrors({ ...errors, aadhaar: '' });
                      }
                    }}
                    error={errors.aadhaar}
                    placeholder="0000 0000 0000"
                    maxLength={12}
                    className="bg-slate-50 border-slate-200/50 shadow-none h-9 md:h-11 text-xl font-black text-center tracking-[0.4em] placeholder:text-slate-200"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Action: Detection */}
                    <Button
                      onClick={handleScan}
                      isLoading={isDetectingRD}
                      className="w-full h-9 md:h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest transition-all active:scale-[0.98]"
                    >
                      {/* <Cpu size={16} className={cn("mr-2", isDetectingRD && "animate-spin")} /> */}
                      Detect RD Device
                    </Button>

                    {/* Right Action: Verification */}
                    <Button
                      onClick={handleLogin}
                      isLoading={isLoading}
                      disabled={rdDeviceStatus !== 'connected' || !formData?.aadhaar}
                      className={cn(
                        "w-full h-9 md:h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500",
                        rdDeviceStatus === 'connected'
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                          : "bg-slate-50 text-slate-300 cursor-not-allowed border border-dashed border-slate-200/50"
                      )}
                    >
                      {rdDeviceStatus === 'connected' ? "Capture Fingerprint" : "Waiting Sync"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </PageLayout >
  );
}
