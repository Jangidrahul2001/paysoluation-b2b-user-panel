import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { PageLayout } from '../../components/layout/PageLayout';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { aadharRegex, checkAssignedService, formatAadharInput, handleValidationError, rejectRequest, } from '../../utils/helperFunction';
import { apiEndpoints } from '../../api/apiEndpoints';
import { usePost } from '../../hooks/usePost';
import { Skeleton } from '../../components/ui/skeleton';


import {
  discoverDevice,
  captureFingerprint,

} from "../../api/RdService";
import NoPermission from '.././NoPermission';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/profileSlice';
import RejectedRequest from '../RejectedRequest';


export default function Aeps2DailyLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    aadhaar: "",
    latitude: null,
    longitude: null
  })
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleLogin = async () => {

    if (!aadharRegex.test(formData.aadhaar)) {
      setErrors({ aadhaar: "Enter a valid aadhaar number" })

      return
    }

    if (formData.latitude === null || formData.longitude === null) {
      toast.error("Location is required. Please enable location services.");
      return;
    }

    setIsLoading(true);
    const device = await discoverDevice();

    if (!device.success) {
      setIsLoading(false);
      toast.error(device.message);
      return;
    }
    const capture = await captureFingerprint(false);

    if (capture.success) {
      loginAeps({
        latitude: formData.latitude,
        longitude: formData.longitude,
        pidData: capture.data,
        aadhaar: formData.aadhaar
      })
    } else {
      setIsLoading(false);
      toast.error(capture.message);
    }


  };
  const { post: loginAeps } = usePost(apiEndpoints.aeps2DailyLogin, {
    onSuccess: (res) => {
      if (res.success) {
        console.log(res)
        toast.success(res.message || 'Login successful');
        setIsLoading(false);
        dispatch(fetchProfile());
        navigate('/aeps2/aeps-service');
      }
      else {
        setIsLoading(false);
        toast.error(res.message || 'Login failed');
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
        <div className="flex flex-col items-center pt-8 md:pt-14 pb-16">
          <Card className="w-full max-w-lg overflow-hidden rounded-3xl border-slate-100 shadow-sm bg-white">
            <div className="p-8 space-y-8">
              <div className="text-center space-y-1">
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-3 w-48 mx-auto" />
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <Skeleton className="h-11 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (rejectRequest("aeps2", profile?.requestedService)) return (<RejectedRequest service="aeps" pipeline="aeps2" />)
  if (!checkAssignedService("aeps", "aeps2", profile?.assignedServices)) return (<NoPermission service="aeps" pipeline="aeps2" />)

  return (
    <PageLayout
      title="Aadhaar Enabled Payment System"
      subtitle="Modernized Biometric Authentication Gateway"
      className="max-w-[1600px] mx-auto py-6"
    >
      <div className="grid grid-cols-1 gap-8 relative z-0">


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

                <div className="flex justify-center items-center gap-4">


                  {/* Right Action: Verification */}
                  <Button
                    onClick={handleLogin}
                    isLoading={isLoading}
                    disabled={isLoading}
                    className={cn(
                      "w-full h-9 md:h-11 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500",

                      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                    )}
                  >
                    Daily Login
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </PageLayout >
  );
}
