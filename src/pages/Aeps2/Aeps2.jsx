import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Smartphone,
  Calendar,
  Store,
  IdCard,
  MapPin,
  Map,
  Rocket,
  ArrowRight,
  Fingerprint,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { format, set } from 'date-fns';
import { form } from '@heroui/theme';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFetch } from '../../hooks/useFetch';
import { apiEndpoints } from '../../api/apiEndpoints';
import { usePost } from '../../hooks/usePost';
import NoPermission from '../NoPermission';
import { PageLayout } from '../../components/layout/PageLayout';
import { BentoCard } from '../../components/ui/BentoCard';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { checkAssignedService, emailRegex, formatEmailInput, formatNameInputWithSpace, formatNumberInput, formatPanInput, handleValidationError, nameWithSpaceRegex, panRegex, phoneRegex, pincodeRegex, rejectRequest } from '../../utils/helperFunction';
import { CustomSingleCalendar } from '../../components/dashboard/CustomSingleCalendar';
import { Skeleton } from '../../components/ui/skeleton';
import RejectedRequest from '../RejectedRequest';

export default function Aeps2() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    panNumber: '',
    shopName: '',
    latitude: null,
    longitude: null,
    address: {
      line: '',
      city: '',
      state: '',
      pincode: '',
      district: '',
      area: '',
      stateCode: ""
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);
  useEffect(() => {
    if (profile && profile.aeps2 && profile.aeps2.isActivated) {
      if (profile.aeps2.isLoginRequired) {
        navigate("/aeps2/aeps-daily-login", { replace: true });
      }
      else {
        navigate("/aeps2/aeps-service", { replace: true });
      }

    }
  }, [profile,navigate])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          toast.error("Location access is required for AePS transactions.");
        }
      );
    }
  }, []);
  const { refetch: fetchStates } = useFetch(
    `${apiEndpoints.fetchAllStates}`,
    {
      onSuccess: (data) => {
        if (data.success || data?.data?.length > 0) {

          setStateList(data?.data?.map(state => ({ label: state.stateName, value: state.stateCode })));
        }
      },
      onError: (error) => {
        console.log("error in fetching states data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { refetch: fetchCities } = useFetch(
    `${apiEndpoints.fetchCity}?code=${formData?.address?.stateCode}`,
    {
      onSuccess: (data) => {
        if (data.success || data?.data?.length > 0) {
          setCityList(data?.data?.map(city => ({ label: city.cityName, value: city.cityName })));
        }
      },
      onError: (error) => {
        console.log("error in fetching cities data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );

  useEffect(() => {
    if (formData?.address && formData?.address?.stateCode) {
      const selectedState = stateList.find((state) => state.value === formData?.address?.stateCode);
      if (selectedState) {
        handleInputChange('address.state', selectedState.label);
      }

      fetchCities()
    }
  }, [
    formData?.address?.stateCode
  ])


  const [errors, setErrors] = useState({});

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleValidate = () => {
    const validationErrors = {};

    if (formData.firstName.trim() === '') {
      validationErrors.firstName = "First name is required";
    }
    else if (!nameWithSpaceRegex.test(formData.firstName.trim())) {
      validationErrors.firstName = "First name can only contain letters (min 3 characters)";
    }

    if (formData.lastName.trim() === '') {
      validationErrors.lastName = "Last name is required";
    }
    else if (!nameWithSpaceRegex.test(formData.lastName.trim())) {
      validationErrors.lastName = "Last name can only contain letters (min 3 characters)";
    }

    if (formData.email.trim() === '') {
      validationErrors.email = "Email is required";
    }
    else if (!emailRegex.test(formData.email)) {
      validationErrors.email = "Invalid email format";
    }
    if (formData.mobile.trim() === '') {
      validationErrors.mobile = "Mobile number is required";
    }
    else if (!phoneRegex.test(formData.mobile)) {
      validationErrors.mobile = "Invalid mobile number";
    }

    if (formData.dateOfBirth === '') {
      validationErrors.dateOfBirth = "Date of birth is required";
    }

    if (formData.panNumber.trim() === '') {
      validationErrors.panNumber = "PAN number is required";
    }
    else if (!panRegex.test(formData.panNumber)) {
      validationErrors.panNumber = "Invalid PAN number";
    }

    if (formData.shopName.trim() === '') {
      validationErrors.shopName = "Shop name is required";
    }

    if (formData?.address.line.trim() === '') {
      validationErrors['address.line'] = "Address line is required";
    }
    if (formData.address.area.trim() === '') {
      validationErrors['address.area'] = "Area is required";
    }

    if (formData.address.city.trim() === '') {
      validationErrors['address.city'] = "City is required";
    }

    if (formData.address.state.trim() === '') {
      validationErrors['address.stateCode'] = "State is required";
      validationErrors['address.state'] = "State is required";
    }

    if (formData.address.pincode.trim() === '') {
      validationErrors['address.pincode'] = "Pincode is required";
    }
    else if (!pincodeRegex.test(formData.address.pincode)) {
      validationErrors['address.pincode'] = "Invalid pincode format";
    }
    if (formData.address.district.trim() === '') {
      validationErrors['address.district'] = "District is required";
    } else if (!nameWithSpaceRegex.test(formData.address.district?.trim())) {
      validationErrors['address.district'] = "Invalid district format";
    }

    if (formData.latitude === null || formData.longitude === null) {
      validationErrors['location'] = "Location is required";
      toast.error("Location access is required for AePS transactions.");
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length > 0;


  }

  const { post: aeps2Registration } = usePost(apiEndpoints.aeps2OnboardUser, {
    onSuccess: (res) => {
      setIsLoading(false);
      console.log("aeps2 registration response", res)
      toast.success(res.message || "Registration Successful!");
      navigate("/aeps2/aeps-activation")

    },
    onError: (error) => {
      setIsLoading(false);
      console.error('error in aeps2 registration:', error);
      if (error.message === "This user already exist") {
        navigate("/aeps2/aeps-activation")
        toast.success("User already registered, please proceed to activation.")
      }
      else {
        toast.error(handleValidationError(error) || "Something went wrong");

      }

    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidate()) return toast.error("Please fix the validation errors before submitting.");

    setIsLoading(true);
    aeps2Registration(formData);

  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="AEPS Secondary Registration"
        subtitle="Provide your details to enable additional AEPS banking features."
        className="max-w-[1600px] mx-auto py-4"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section 1: Personal Details Skeleton */}
            <div className="lg:col-span-2">
              <BentoCard className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Skeleton className="w-10 h-10 rounded-2xl" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-10 w-full rounded-2xl" />
                    </div>
                  ))}
                  {/* Date picker skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full rounded-2xl" />
                  </div>
                </div>
              </BentoCard>
            </div>

            {/* Section 2: Business Info Skeleton */}
            <BentoCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div>
                  <Skeleton className="h-5 w-28 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </BentoCard>
          </div>

          {/* Section 3: Address Information Skeleton */}
          <BentoCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Submit Button Skeleton */}
          <div className="flex flex-col items-center gap-6 pt-4">
            <Skeleton className="h-12 w-64 rounded-2xl" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      </PageLayout>
    );
  }
  if (rejectRequest("aeps2", profile?.requestedService)) return (<RejectedRequest service="aeps" pipeline="aeps2" />)
  if (!checkAssignedService("aeps", "aeps2", profile?.assignedServices)) return (<NoPermission service="aeps" pipeline="aeps2" />)

  return (
    <PageLayout
      title="AEPS Secondary Registration"
      subtitle="Provide your details to enable additional AEPS banking features."
      className="max-w-[1600px] mx-auto py-4"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Section 1: Personal Details */}
            {/* Added overflow-visible to prevent clipping the calendar */}
            <BentoCard className="lg:col-span-2 p-8 overflow-visible">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    Personal Details
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Identity & Contact Information
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">First Name</label>
                  <Input
                    icon={User}
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => {
                      handleInputChange('firstName', formatNameInputWithSpace(e.target.value, 50))
                      setErrors({ ...errors, firstName: "" })
                    }
                    }
                    error={errors.firstName}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Last Name</label>
                  <Input
                    icon={User}
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => {
                      handleInputChange('lastName', formatNameInputWithSpace(e.target.value, 50))
                      setErrors({ ...errors, lastName: "" })
                    }}
                    error={errors.lastName}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Email Address</label>
                  <Input
                    icon={Mail}

                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => {
                      handleInputChange('email', formatEmailInput(e.target.value))
                      setErrors({ ...errors, email: "" })
                    }}
                    error={errors.email}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Mobile Number</label>
                  <Input
                    icon={Smartphone}
                    placeholder="10 digit mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) => {
                      handleInputChange('mobile', formatNumberInput(e.target.value, 10));
                      setErrors({ ...errors, mobile: "" });
                    }}
                    error={errors.mobile}
                    className="mt-2"
                  />
                </div>

                {/* Custom Date Picker */}
                <div className="relative" ref={datePickerRef}>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Date of Birth</label>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className={cn(
                      "group w-full h-10 mt-2 bg-white border rounded-2xl px-4 text-sm font-bold text-slate-700 flex items-center justify-between transition-all hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/5",
                      isDatePickerOpen ? "border-indigo-500/50 ring-4 ring-indigo-500/5" : "border-slate-200",
                      errors.dateOfBirth && "border-red-500 focus:ring-red-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className={cn("text-slate-400 transition-colors", isDatePickerOpen && "text-indigo-500")} />
                      <span className={cn(!formData.dateOfBirth && "text-slate-300")}>
                        {formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "dd MMM yyyy") : "Select Birth Date"}
                      </span>
                    </div>
                    <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-300", isDatePickerOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isDatePickerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-[100] mt-2 left-0 md:right-0"
                      >
                        <CustomSingleCalendar
                          selectedDate={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                          onDateSelect={(date) => {
                            handleInputChange('dateOfBirth', format(date, "yyyy-MM-dd"));
                            setErrors({ ...errors, dateOfBirth: "" });
                            setIsDatePickerOpen(false);
                          }}
                          onReset={() => {
                            handleInputChange('dateOfBirth', '');
                            setIsDatePickerOpen(false);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {errors.dateOfBirth && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.dateOfBirth}</p>}
                </div>
              </div>
            </BentoCard>

            {/* Section 2: Business Info */}
            <BentoCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Store size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    Business Info
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Shop & Pan Details
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Shop Name</label>
                  <Input
                    icon={Store}
                    placeholder="Name of your shop"
                    value={formData.shopName}
                    onChange={(e) => {
                      handleInputChange('shopName', e.target.value)
                      setErrors({ ...errors, shopName: "" })
                    }}
                    error={errors.shopName}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">PAN Number</label>
                  <Input
                    icon={IdCard}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={formData.panNumber}
                    onChange={(e) => {
                      handleInputChange('panNumber', formatPanInput(e.target.value.toUpperCase()));
                      setErrors({ ...errors, panNumber: "" });
                    }}
                    error={errors.panNumber}
                    className="mt-2"
                  />
                </div>

                <div className="pt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 italic text-[10px] text-slate-500 font-medium">
                  Please ensure your PAN number matches your linked bank account for smooth settlements.
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Section 3: Address Information */}
          <BentoCard className="p-8 overflow-visible">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  Address Information
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Location & Area Details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Full Address line</label>
                <Input
                  icon={Map}
                  placeholder="Door No, Street name"
                  value={formData?.address?.line}
                  onChange={(e) => {
                    handleInputChange('address.line', e.target.value)
                    setErrors({ ...errors, 'address.line': "" })
                  }}
                  className="mt-2"
                  error={errors['address.line']}
                />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Area / Locality</label>
                <Input
                  placeholder="Area name"
                  value={formData.address.area}
                  onChange={(e) => {
                    handleInputChange('address.area', e.target.value)
                    setErrors({ ...errors, 'address.area': "" })
                  }}
                  error={errors['address.area']}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">State</label>
                <Select
                  placeholder="Select State"
                  options={stateList}
                  value={formData.address.stateCode}
                  onChange={(val) => {
                    handleInputChange('address.stateCode', val)
                    setErrors({ ...errors, 'address.stateCode': "" })
                  }}
                  error={errors['address.stateCode']}
                  className={`mt-2 border-slate-200 ${errors['address.stateCode'] ? 'border-red-500' : ''}`}
                />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">City</label>
                <Select
                  placeholder="Select City"
                  value={formData.address.city}
                  options={cityList}
                  onChange={(val) => {
                    handleInputChange('address.city', val)
                    setErrors({ ...errors, 'address.city': "" })
                  }}
                  error={errors['address.city']}
                  className={`mt-2 border-slate-200 ${errors['address.city'] ? 'border-red-500' : ''}`}
                />
              </div>              <div>
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">District</label>
                <Input
                  placeholder="District"
                  value={formData.address.district}
                  onChange={(e) => {
                    handleInputChange('address.district', formatNameInputWithSpace(e.target.value, 50))
                    setErrors({ ...errors, 'address.district': "" })
                  }}
                  error={errors['address.district']}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Pincode</label>
                <Input
                  placeholder="6 digit pincode"
                  maxLength={6}
                  value={formData.address.pincode}
                  onChange={(e) => {
                    handleInputChange('address.pincode', formatNumberInput(e.target.value, 6))
                    setErrors({ ...errors, 'address.pincode': "" })
                  }}
                  error={errors['address.pincode']}
                  className="mt-2"
                />
              </div>
            </div>
          </BentoCard>

          {/* Submit Action */}
          <div className="flex flex-col items-center gap-6 pt-4">
            <Button
              isLoading={isLoading}
              type="submit"
              className="h-12 px-12 rounded-2xl bg-[#7065e0] hover:bg-[#5f54cc] text-white font-black text-sm uppercase tracking-[0.2em] shadow-sm flex items-center gap-3 transition-all active:scale-[0.98]"
            >
              <Fingerprint size={20} />
              {isLoading ? "Submitting..." : "Complete AEPS Setup"}
              <ArrowRight size={18} className="opacity-50" />
            </Button>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure 256-bit encrypted registration
            </p>
          </div>

        </form>
      </motion.div>
    </PageLayout>
  );
}
