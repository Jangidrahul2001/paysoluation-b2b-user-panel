import React, { useState, useEffect } from 'react';
import { Smartphone, Fingerprint, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { BentoCard } from '../../components/ui/BentoCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { aadharRegex, checkAssignedService, fetchPublicIp, formatNameInputWithSpace, formatNumberInput, handleValidationError, nameWithSpaceRegex, phoneRegex, rejectRequest } from '../../utils/helperFunction';
import { useDispatch, useSelector } from 'react-redux';
import NoPermission from '../NoPermission';
import { Skeleton } from '../../components/ui/skeleton';
import { apiEndpoints } from '../../api/apiEndpoints';
import { usePost } from '../../hooks/usePost';
import { captureFingerprint, convertToBase64, discoverDevice } from '../../api/RdService';
import { parseAndBuildPidData } from '../../api/PidParser';
import RejectedRequest from '../RejectedRequest';

export default function MoneyTransferKyc() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const locationData = useLocation();
  const { mobile } = locationData?.state || {};
  useEffect(() => {

    if (!mobile) {
      toast.error("Mobile Number not found");
      return navigate("/money-transfer");
    }
  }, [mobile])
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);

  const [mobileNumber, setMobileNumber] = useState(mobile);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          toast.error("Location access is required.");
        }
      );
    }
  }, []);
  const validate = () => {
    const newErrors = {};
    if (!mobileNumber) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!phoneRegex.test(mobileNumber)) {
      newErrors.mobile = 'Invalid mobile number';
    }

    if (!aadhaarNumber) {
      newErrors.aadhaar = 'Aadhaar number is required';
    } else if (!aadharRegex.test(aadhaarNumber)) {
      newErrors.aadhaar = 'Invalid Aadhaar number';
    }
    if (customerName.trim() === "") {
      newErrors.customerName = 'Customer name is required';
    }
    else if (!nameWithSpaceRegex.test(customerName?.trim())) {
      newErrors.customerName = 'Enter a valid customer name';
    }

    if (location.lat === null || location.lng === null) {
      newErrors.location = "Location access is required.";
      toast.error("Location access is required.");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { post: dmtCustomerEkyc } = usePost(apiEndpoints.dmtCustomerEkyc, {
    onSuccess: (res) => {
      console.log(res)
      if (res.success) {
        setIsLoading(false);
        toast.success(res.message || "Details validated successfully!");
        navigate('/money-transfer/otp', { state: { mobile: mobileNumber } });
      }
      else {
        toast.error(res.message || "Failed to validate details");
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Failed to add customer ekyc:', error);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    const device = await discoverDevice();

    if (!device.success) {
      toast.error(device.message);
      setIsLoading(false);
      return;
    }

    const capture = await captureFingerprint(true, "dmt");

    if (capture.success) {
      const base64Data = convertToBase64(capture.data)
      if (base64Data) {
        console.log(base64Data, "ppppppp")

        const publicIp = await fetchPublicIp();
        if (!publicIp) {
          setIsLoading(false);
          toast.error("Unable to fetch client IP address. Please check your internet connection and try again.");
          return;
        }

        dmtCustomerEkyc({
          customerName: customerName,
          mobileNumber: mobileNumber,
          aadharNumber: aadhaarNumber,
          latitude: location.lat,
          longitude: location.lng,
          publicIp: publicIp,
          pidData: base64Data
        });
      }
      else {
        setIsLoading(false);
        toast.error("Failed to convert to base64 PID data");
      }
    }
    else {
      setIsLoading(false);
      toast.error(capture.message);
    }

  };

  // Profile loading skeleton
  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="DMT KYC"
        subtitle="Complete your KYC verify your identity"
        className="max-w-[1600px] mx-auto py-4"
      >
        <div className="w-full max-w-2xl mx-auto">
          <BentoCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 pt-6">
                <Skeleton className="h-12 w-full max-w-sm rounded-2xl" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </BentoCard>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-3xl bg-white/50 border border-slate-100 backdrop-blur-sm">
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

   if (rejectRequest("dmt1", profile?.requestedService)) return (<RejectedRequest service="dmt" pipeline="dmt1" />)
  // Permission check
   if (!checkAssignedService("dmt", "dmt1", profile?.assignedServices)) return (<NoPermission service="dmt" pipeline="dmt1"  />)


  return (
    <PageLayout
      title="DMT KYC"
      subtitle="Complete your KYC verify your identity"
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="w-full max-w-2xl mx-auto">
        <BentoCard className="p-8 overflow-visible">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Money Transfer Kyc Form
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Identity Authentication
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                  Mobile No
                </label>
                <Input
                  icon={Smartphone}
                  placeholder="Enter Mobile Number"
                  maxLength={10}
                  value={mobileNumber}
                  disabled={true}
                  onChange={(e) => {
                    setMobileNumber(formatNumberInput(e.target.value, 10));
                    if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
                  }}
                  error={errors.mobile}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                  Aadhaar No
                </label>
                <Input
                  icon={Fingerprint}
                  placeholder="Enter Aadhaar Number"
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => {
                    setAadhaarNumber(formatNumberInput(e.target.value, 12));
                    if (errors.aadhaar) setErrors(prev => ({ ...prev, aadhaar: '' }));
                  }}
                  error={errors.aadhaar}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                  Customer Name
                </label>
                <Input
                  icon={User}
                  placeholder="Enter Customer Name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(formatNameInputWithSpace(e.target.value, 100));
                    if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' }));
                  }}
                  error={errors.customerName}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 pt-6 border-t border-slate-50">
              <Button
                isLoading={isLoading}
                type="submit"
                className="h-12 w-full max-w-sm rounded-2xl bg-[#7065e0] hover:bg-[#5f54cc] text-white font-black text-sm uppercase tracking-[0.15em] shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <span>Validate</span>
                <ArrowRight size={18} className="opacity-50" />
              </Button>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Instant Identity Verification
              </p>
            </div>
          </form>
        </BentoCard>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Required Documents", desc: "Keep your Physical Aadhaar card ready for validation" },
            { label: "OTP Verification", desc: "An OTP will be sent to your Aadhaar-linked mobile number" }
          ].map((item, index) => (
            <div key={index} className="p-4 rounded-3xl bg-white/50 border border-slate-100 backdrop-blur-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider uppercase tracking-widest">{item.label}</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
