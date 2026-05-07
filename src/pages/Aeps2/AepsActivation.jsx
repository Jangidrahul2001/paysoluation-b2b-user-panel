import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Fingerprint,
  FileText,
  Rocket,
  Plus,
  Info,
  Smartphone,
  CreditCard,
  UserCheck,
  Cpu,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { PageLayout } from '../../components/layout/PageLayout';
import { BentoCard } from '../../components/ui/BentoCard';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { aadharRegex, checkAssignedService, formatAadharInput, formatIfscInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, ifscRegex, nameWithSpaceRegex, pincodeRegex, rejectRequest } from '../../utils/helperFunction';
import { apiEndpoints } from '../../api/apiEndpoints';
import { useFetch } from '../../hooks/useFetch';
import { usePost } from '../../hooks/usePost';
import { useDispatch, useSelector } from 'react-redux';
import NoPermission from '.././NoPermission';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import RejectedRequest from '../RejectedRequest';

export default function AepsActivation() {
  const dispatch = useDispatch();
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    modelName: '',
    deviceNumber: '',
    aadharNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    officeAddress: '',
    officeState: '',
    officeCity: '',
    officeDistrict: '',
    officePincode: '',

    officeArea: '',
    aadharArea: "",
    aadharAddress: '',
    aadharState: '',
    aadharCity: '',
    aadharDistrict: '',
    aadharPincode: '',

    latitude: "",
    longitude: ""
  });
  const [errors, setErrors] = useState({});
  const [bankList, setBankList] = useState([])
  const [stateList, setStateList] = useState([]);
  // const [officeCityList, setOfficeCityList] = useState([]);
  // const [aadharCityList, setAadharCityList] = useState([]);
  // const [fetchCityList, setFetchCityList] = useState("office");
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState({
    panCard: null,
    aadharFront: null,
    aadharBack: null
  });


  useEffect(() => {
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
          toast.error("Location access is required for AePS transactions.");
        }
      );
    }
  }, []);

  const { refetch: fetchBanks } = useFetch(
    `${apiEndpoints.aeps2BankList}`,
    {
      onSuccess: (data) => {
        if (data.success && Array.isArray(data.data)) {
          const formattedBanks = data.data.map((bank) => ({
            label: bank.bankName,
            value: bank._id,
          }));
          setBankList(formattedBanks);
        }
      },
      onError: (error) => {
        console.error("Error fetching banks:", error);
      },
    },
    true,
  );

  const { refetch: fetchStates } = useFetch(
    `${apiEndpoints.fetchStateList}`,
    {
      onSuccess: (data) => {
        if (data.success && Array.isArray(data.data)) {
          setStateList(data?.data?.map(state => ({ label: state.label, value: state._id })));
        }
      },
      onError: (error) => {
        console.log("error in fetching states data", error);
        toast.error(handleValidationError(error) || "Something went wrong"); toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [field]: "Only JPEG, JPG, and PNG images are allowed"
      }));
      return;
    }

    // Check file size (200KB = 200 * 1024 bytes)
    const maxSize = 200 * 1024; // 200KB in bytes
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [field]: "Image size must be less than 200KB"
      }));
      return;
    }

    // If validation passes, set the file and clear errors
    setFiles(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };


  const handleValidate = () => {
    const validationErrors = {};
    if (formData.modelName.trim() === "")
      validationErrors.modelName = "Model Name is required";
    if (formData.deviceNumber.trim() === "")
      validationErrors.deviceNumber = "Device Number is required";


    if (formData.aadharNumber.trim() === "")
      validationErrors.aadharNumber = "Aadhar Number is required";
    else if (!aadharRegex.test(formData.aadharNumber.trim())) {
      validationErrors.aadharNumber = "Invalid Aadhar Number format";
    }

    if (formData.bankName.trim() === "") validationErrors.bankName = "Bank Name is required";

    if (formData.accountNumber.trim() === "")
      validationErrors.accountNumber = "Account Number is required";
    else if (formData.accountNumber.trim().length < 9 || formData.accountNumber.trim().length > 20) {
      validationErrors.accountNumber = "Invalid Account Number format";
    }

    if (formData.ifscCode.trim() === "") validationErrors.ifscCode = "IFSC Code is required";
    else if (!ifscRegex.test(formData.ifscCode.trim())) {
      validationErrors.ifscCode = "Invalid IFSC Code format";
    }

    if (formData.officeArea.trim() === "")
      validationErrors.officeArea = "Office Area is required";

    if (formData.officeAddress.trim() === "")
      validationErrors.officeAddress = "Office Address is required";

    if (formData.officeState.trim() === "")
      validationErrors.officeState = "Office State is required";

    if (formData.officeCity.trim() === "")
      validationErrors.officeCity = "Office City is required";
    else if (!nameWithSpaceRegex.test(formData.officeCity.trim())) {
      validationErrors.officeCity = "Invalid City format";
    }

    if (formData.officeDistrict.trim() === "")
      validationErrors.officeDistrict = "Office District is required";
    else if (!nameWithSpaceRegex.test(formData.officeDistrict.trim())) {
      validationErrors.officeDistrict = "Invalid District format";
    }

    if (formData.officePincode.trim() === "") {
      validationErrors.officePincode = "Office Pincode is required";
    }
    else if (!pincodeRegex.test(formData.officePincode.trim())) {
      validationErrors.officePincode = "Invalid Pincode format";
    }
    if (formData.aadharArea.trim() === "")
      validationErrors.aadharArea = "Aadhar Area is required";

    if (formData.aadharAddress.trim() === "")
      validationErrors.aadharAddress = "Aadhar Address is required";

    if (formData.aadharState.trim() === "")
      validationErrors.aadharState = "State is required";

    if (formData.aadharCity.trim() === "")
      validationErrors.aadharCity = "City is required";
    else if (!nameWithSpaceRegex.test(formData.aadharCity.trim())) {
      validationErrors.aadharCity = "Invalid City format";
    }

    if (formData.aadharDistrict.trim() === "")
      validationErrors.aadharDistrict = "Aadhar District is required";
    else if (!nameWithSpaceRegex.test(formData.aadharDistrict.trim())) {
      validationErrors.aadharDistrict = "Invalid District format";
    }

    if (formData.aadharPincode.trim() === "") {
      validationErrors.aadharPincode = "Aadhar Pincode is required";
    }
    else if (!pincodeRegex.test(formData.aadharPincode.trim())) {
      validationErrors.aadharPincode = "Invalid Pincode format";
    }

    if (!files.panCard) validationErrors.panCard = "PAN Card copy is required";
    if (!files.aadharFront) validationErrors.aadharFront = "Aadhar front image is required";
    if (!files.aadharBack) validationErrors.aadharBack = "Aadhar back image is required";

    setErrors(validationErrors);
    return Object.keys(validationErrors).length > 0;


  }
  const { post: aeps2RequestActivation } = usePost(apiEndpoints.aeps2RequestActivation, {
    onSuccess: (res) => {
      setIsLoading(false);
      toast.success(res.message || "AEPS Service Activation Request Submitted!");
      if (res?.data && res?.data?.status && res?.data?.status === "Activated") {
        navigate("/aeps2/aeps-otp")
      }
      else if (res?.data && res?.data?.status && res?.data?.status === "Pending"){
        navigate("/aeps2/pending")
      }

    },
    onError: (error) => {
      setIsLoading(false);
      console.error('error in aeps2 registration:', error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (handleValidate()) {
      return toast.error("Please fix the validation errors before submitting.");
    }
    const FormDataBackend = new FormData();

    // Office Address
    FormDataBackend.append('officeAddress[line]', formData.officeAddress);
    FormDataBackend.append('officeAddress[city]', formData.officeCity);
    FormDataBackend.append('officeAddress[state]', formData.officeState);
    FormDataBackend.append('officeAddress[pincode]', formData.officePincode);
    FormDataBackend.append('officeAddress[district]', formData.officeDistrict);
    FormDataBackend.append('officeAddress[area]', formData.officeArea || ''); // Add this field to formData if needed

    // Aadhar Address
    FormDataBackend.append('address[line]', formData.aadharAddress);
    FormDataBackend.append('address[city]', formData.aadharCity);
    FormDataBackend.append('address[state]', formData.aadharState);
    FormDataBackend.append('address[pincode]', formData.aadharPincode);
    FormDataBackend.append('address[district]', formData.aadharDistrict);
    FormDataBackend.append('address[area]', formData.aadharArea || ''); // Add this field to formData if needed

    // Bank Details
    FormDataBackend.append('ifsc', formData.ifscCode);
    FormDataBackend.append('accountNumber', formData.accountNumber);
    FormDataBackend.append('bank', formData.bankName);

    // Personal Details
    FormDataBackend.append('aadhaar', formData.aadharNumber);

    // Device Details
    FormDataBackend.append('deviceNumber', formData.deviceNumber);
    FormDataBackend.append('modelName', formData.modelName);

    FormDataBackend.append('latitude', formData.latitude || '');
    FormDataBackend.append('longitude', formData.longitude || '');

    // Files
    if (files.panCard) {
      FormDataBackend.append('panCard', files.panCard, files.panCard.name);
    }
    if (files.aadharFront) {
      FormDataBackend.append('aadhaarFront', files.aadharFront, files.aadharFront.name);
    }
    if (files.aadharBack) {
      FormDataBackend.append('aadhaarBack', files.aadharBack, files.aadharBack.name);
    }

    setIsLoading(true);
    aeps2RequestActivation(FormDataBackend, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
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
        title="AEPS Service Activation"
        subtitle="Complete the 3-step verification to start using AEPS services."
        className="max-w-[1600px] mx-auto py-4"
      >
        <div className="space-y-8">
          {/* Section 1: Device & Bank Information Skeleton */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div>
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 2: Office Address Skeleton */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div>
                  <Skeleton className="h-5 w-44 mb-1" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 3: Aadhar Address Skeleton */}
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <Skeleton className="w-10 h-10 rounded-2xl" />
                <div>
                  <Skeleton className="h-5 w-52 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Section 4: KYC Documents Skeleton */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Button Skeleton */}
          <div className="flex flex-col items-center gap-6 pt-4">
            <Skeleton className="h-14 w-64 rounded-2xl" />
            <Skeleton className="h-3 w-80" />
          </div>
        </div>
      </PageLayout>
    );
  }
   if (rejectRequest("aeps2", profile?.requestedService)) return (<RejectedRequest service="aeps" pipeline="aeps2" />)
  if (!checkAssignedService("aeps", "aeps2", profile?.assignedServices)) return (<NoPermission service="aeps" pipeline="aeps2"  />)

  return (
    <PageLayout
      title="AEPS Service Activation"
      subtitle="Complete the 3-step verification to start using AEPS services."
      className="max-w-[1600px] mx-auto py-4"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Device & Bank Information */}
          <BentoCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  1. Device & Bank Information
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Personal & Device Details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Model Name</label>
                <Select
                  placeholder="Select Device"
                  options={[
                    { label: 'Morpho', value: 'morpho' },
                    { label: 'Mantra', value: 'mantra' },
                    { label: 'Startek', value: 'startek' }
                  ]}
                  value={formData.modelName}
                  error={errors.modelName}
                  onChange={(val) => {
                    handleInputChange('modelName', val)
                    setErrors({ ...errors, modelName: "" })
                  }}
                  className="mt-2"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Device Number</label>
                <Input
                  icon={Cpu}
                  placeholder="Serial No"
                  value={formData.deviceNumber}
                  onChange={(e) => { handleInputChange('deviceNumber', e.target.value); setErrors({ ...errors, deviceNumber: "" }) }}
                  error={errors.deviceNumber}
                  className="mt-2"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Aadhar Number</label>
                <Input
                  icon={Fingerprint}
                  placeholder="12 Digit Aadhar"
                  maxLength={12}
                  value={formData.aadharNumber}
                  onChange={(e) => {

                    handleInputChange('aadharNumber', formatAadharInput(e.target.value))
                    setErrors({ ...errors, aadharNumber: "" })
                  }}
                  error={errors.aadharNumber}
                  className="mt-2"
                />
              </div>

              <div className="lg:col-span-1">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Bank Name</label>
                <Select
                  placeholder="Select Bank"
                  options={bankList}
                  value={formData.bankName}
                  onChange={(val) => { handleInputChange('bankName', val); setErrors({ ...errors, bankName: "" }) }}
                  error={errors.bankName}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Account Number</label>
                <Input
                  icon={CreditCard}
                  placeholder="Bank Account No"
                  value={formData.accountNumber}
                  onChange={(e) => {
                    handleInputChange('accountNumber', formatNumberInput(e.target.value, 20))
                    setErrors({ ...errors, accountNumber: "" })
                  }}
                  error={errors.accountNumber}
                  className="mt-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Bank IFSC Code</label>
                <Input
                  icon={BadgeCheck}
                  placeholder="SBIN000XXXX"
                  value={formData.ifscCode}
                  onChange={(e) => {
                    handleInputChange('ifscCode', formatIfscInput(e.target.value.toUpperCase()))
                    setErrors({ ...errors, ifscCode: "" })
                  }}
                  error={errors.ifscCode}
                  className="mt-2"
                />
              </div>
            </div>
          </BentoCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 2: Office Address Details */}
            <BentoCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    2. Office Address Details
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Permanent Business Location
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Office Address Line</label>
                  <Input
                    icon={MapPin}
                    placeholder="Shop/Office Address"
                    value={formData.officeAddress}
                    onChange={(e) => {
                      handleInputChange('officeAddress', e.target.value)
                      setErrors({ ...errors, 'officeAddress': "" })
                    }}
                    error={errors.officeAddress}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Area</label>
                  <Input
                    placeholder="Area/Locality"
                    value={formData.officeArea}
                    onChange={(e) => {
                      handleInputChange('officeArea', e.target.value)
                      setErrors({ ...errors, 'officeArea': "" })
                    }}
                    error={errors.officeArea}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">State</label>
                    <Select
                      placeholder="Select State"
                      options={stateList}
                      value={formData.officeState}
                      onChange={(val) => { handleInputChange('officeState', val); setErrors({ ...errors, 'officeState': "" }) }}
                      error={errors.officeState}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">City</label>
                    <Input
                      placeholder="City"
                      value={formData.officeCity}
                      onChange={(e) => {
                        handleInputChange('officeCity', formatNameInputWithSpace(e.target.value,50))
                        setErrors({ ...errors, 'officeCity': "" })
                      }}
                      className="mt-2"
                      error={errors.officeCity}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">District</label>
                    <Input
                      placeholder="District"
                      value={formData.officeDistrict}
                      onChange={(e) => {
                        handleInputChange('officeDistrict', formatNameInputWithSpace(e.target.value,50))
                        setErrors({ ...errors, 'officeDistrict': "" })
                      }}
                      error={errors.officeDistrict}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Pincode</label>
                    <Input
                      placeholder="Pincode"
                      maxLength={6}
                      value={formData.officePincode}
                      onChange={(e) => {
                        handleInputChange('officePincode', formatNumberInput(e.target.value, 6))
                        setErrors({ ...errors, 'officePincode': "" })
                      }}
                      error={errors.officePincode}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Section 3: Address As Per Proof */}
            <BentoCard className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                    3. Address As Per Proof (Aadhar)
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Identity Document Address
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Aadhar Address Line</label>
                  <Input
                    icon={MapPin}
                    placeholder="Address as written on Aadhar card"
                    value={formData.aadharAddress}
                    onChange={(e) => {
                      handleInputChange('aadharAddress', e.target.value)
                      setErrors({ ...errors, 'aadharAddress': "" })
                    }}
                    error={errors.aadharAddress}
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Area</label>
                  <Input
                    placeholder="Area/Locality"
                    value={formData.aadharArea}
                    onChange={(e) => {
                      handleInputChange('aadharArea', e.target.value)
                      setErrors({ ...errors, 'aadharArea': "" })
                    }}
                    error={errors.aadharArea}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">State</label>
                    <Select
                      placeholder="Select State"
                      options={stateList}
                      value={formData.aadharState}
                      onChange={(val) => { handleInputChange('aadharState', val); setErrors({ ...errors, 'aadharState': "" }); }}
                      className="mt-2"
                      error={errors.aadharState}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">City</label>
                    <Input
                      placeholder="City"
                      value={formData.aadharCity}
                      onChange={(e) => {
                        handleInputChange('aadharCity', formatNameInputWithSpace(e.target.value,50))
                        setErrors({ ...errors, 'aadharCity': "" })
                      }}
                      error={errors.aadharCity}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">District</label>
                    <Input
                      placeholder="District"
                      value={formData.aadharDistrict}
                      onChange={(e) => {
                        handleInputChange('aadharDistrict', formatNameInputWithSpace(e.target.value, 50))
                        setErrors({ ...errors, 'aadharDistrict': "" })
                      }}
                      error={errors.aadharDistrict}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Pincode</label>
                    <Input
                      placeholder="Pincode"
                      maxLength={6}
                      value={formData.aadharPincode}
                      onChange={(e) => {
                        handleInputChange('aadharPincode', formatNumberInput(e.target.value, 6))
                        setErrors({ ...errors, 'aadharPincode': "" })
                      }}
                      error={errors.aadharPincode}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Section 4: KYC Documents */}
          <BentoCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  4. KYC Documents
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Identity Verification Documents
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'PAN Card Copy', id: 'panCard' },
                { label: 'Aadhar Front', id: 'aadharFront' },
                { label: 'Aadhar Back', id: 'aadharBack' }
              ].map((doc) => (
                <div key={doc.id} className="relative group">
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1 block mb-2">{doc.label}</label>
                  <div className={cn(
                    "relative h-24 flex flex-col justify-center items-center rounded-2xl border-2 border-dashed transition-all group-hover:bg-white overflow-hidden cursor-pointer",
                    errors[doc.id]
                      ? "border-red-300 bg-red-50/50 group-hover:border-red-400"
                      : "border-slate-200 bg-slate-50/50 group-hover:border-indigo-400"
                  )}>
                    <input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                      accept=".jpg,.jpeg,.png"
                    />
                    {files[doc.id] ? (
                      <div className="flex flex-col items-center gap-1">
                        <BadgeCheck className="text-emerald-500" size={24} />
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{files[doc.id].name}</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                          <Plus size={18} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600">Choose File</span>
                        <span className="text-[8px] text-slate-300 mt-1">
                          JPG, JPEG, PNG (Max 200KB)
                        </span>
                      </>
                    )}
                  </div>
                  {errors[doc.id] && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors[doc.id]}</p>
                  )}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Form Actions */}
          <div className="flex flex-col items-center gap-6 pt-4">
            <Button
              isLoading={isLoading}
              type="submit"
              className="h-14 px-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 flex items-center gap-3 transition-all active:scale-[0.98]"
            >
              <Rocket size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              Submit for Activation
            </Button>

            <div className="flex items-center gap-2 text-slate-400">
              <p className="text-[10px] font-medium uppercase tracking-tight">By clicking submit, you agree to our banking partner terms.</p>
            </div>
          </div>

        </form>
      </motion.div>
    </PageLayout>
  );
}
