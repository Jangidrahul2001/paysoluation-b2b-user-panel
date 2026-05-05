import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BentoCard } from '../../components/ui/BentoCard';
import { PageLayout } from '../../components/layout/PageLayout';
import { toast } from 'sonner';
import { ArrowRight, Smartphone, Fingerprint } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NoPermission from '../NoPermission';
import { checkAssignedService, fetchPublicIp, formatNumberInput, handleValidationError, phoneRegex, rejectRequest } from '../../utils/helperFunction';
import { Skeleton } from '../../components/ui/skeleton';
import { usePost } from '../../hooks/usePost';
import { apiEndpoints } from '../../api/apiEndpoints';
import RejectedRequest from '../RejectedRequest';

export default function MoneyTransfer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [latitudeAndLongitude, setLatitudeAndLongitude] = useState({
    latitude: null,
    longitude: null,
  });

  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);



  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitudeAndLongitude({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          toast.error("Location access is required for AePS transactions.");
        }
      );
    }
  }, []);

  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { post: getCustomer } = usePost(apiEndpoints.dmtGetCustomer, {
    onSuccess: (res) => {
      console.log(res)
      setIsLoading(false);
      if (res.success) {
        toast.success(res.message || 'Customer verified successfully');
        navigate('/money-transfer/dashboard', { state: { mobile: mobileNumber } });
      }

    },
    onError: (error) => {

      setIsLoading(false);
      console.error('Failed to get customer details:', error);
      toast.error(handleValidationError(error) || "Something went wrong");
      if (error.message == "Customer is not registered") {
        navigate('/money-transfer/kyc', { state: { mobile: mobileNumber } });
      }

    }
  });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!mobileNumber) {
      setError('Please enter mobile number');
      return;
    }
    if (!phoneRegex.test(mobileNumber)) {
      setError('Invalid mobile number');
      return;
    }
    const publicIp = await fetchPublicIp();
    if (!publicIp) {
      toast.error("Unable to fetch client IP address. Please check your internet connection and try again.");
      return;
    }

    setIsLoading(true);
    getCustomer({ mobileNumber, ...latitudeAndLongitude, publicIp })

  };

  // Profile loading skeleton
  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="Money Transfer"
        subtitle="Send money securely to any bank account"
        className="max-w-[1600px] mx-auto py-4"
      >
        <div className="w-full max-w-2xl mx-auto">
          <BentoCard className="p-8">
            {/* Header Section Skeleton */}
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div>
                <Skeleton className="h-5 w-28 mb-1" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>

            {/* Form Section Skeleton */}
            <div className="space-y-8">
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>

              {/* Button Section Skeleton */}
              <div className="flex flex-col items-center gap-6 pt-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </BentoCard>

          {/* Info Section Skeleton */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
  if (!checkAssignedService("dmt", "dmt1", profile?.assignedServices)) return (<NoPermission service="dmt" pipeline="dmt1" />)

  return (
    <PageLayout
      title="Money Transfer"
      subtitle="Send money securely to any bank account"
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="w-full max-w-2xl mx-auto">
        <BentoCard className="p-8 overflow-visible">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Remitter Login
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Customer Verification
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                Customer Contact
              </label>
              <Input
                icon={Smartphone}
                placeholder="Enter Mobile Number"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => {

                  setMobileNumber(formatNumberInput(e.target.value, 10));
                  if (error) setError('');
                }}
                error={error}
                className="mt-2"
              />
            </div>

            <div className="flex flex-col items-center gap-6 pt-4">
              <Button
                isLoading={isLoading}
                type="submit"
                className="h-12 w-full rounded-2xl bg-[#7065e0] hover:bg-[#5f54cc] text-white font-black text-sm uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
              >
                <span>Verify & Proceed</span>
                <ArrowRight size={18} className="opacity-50" />
              </Button>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Secure Transaction Processing
              </p>
            </div>
          </form>
        </BentoCard>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Instant Transfer", desc: "Real-time settlements to any bank" },
            { label: "Low Fee", desc: "Most competitive rates in the market" },
            { label: "Safe & Secure", desc: "End-to-end encrypted transactions" }
          ].map((item, index) => (
            <div key={index} className="p-4 rounded-3xl bg-white/50 border border-slate-100 backdrop-blur-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">{item.label}</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
