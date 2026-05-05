import React, { useState, useEffect } from 'react';
import { Smartphone, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { BentoCard } from '../../components/ui/BentoCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { checkAssignedService, fetchPublicIp, formatNumberInput, handleValidationError, phoneRegex, rejectRequest } from '../../utils/helperFunction';
import { useDispatch, useSelector } from 'react-redux';
import NoPermission from '../NoPermission';
import { Skeleton } from '../../components/ui/skeleton';
import { apiEndpoints } from '../../api/apiEndpoints';
import { usePost } from '../../hooks/usePost';
import { useLocation, useNavigate } from 'react-router-dom';
import RejectedRequest from '../RejectedRequest';

export default function OtpVerification() {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);
    const locationData = useLocation();
    const { mobile } = locationData?.state || {};
    useEffect(() => {   
         if (!mobile) {
        toast.error("Mobile number is required. Redirecting...");
        navigate('/money-transfer'); 
    }
}, [mobile, navigate]);
    const [mobileNumber, setMobileNumber] = useState(mobile);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [errors, setErrors] = useState({});
    const [location, setLocation] = useState({ lat: null, lng: null });

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

    const validate = (field = 'all') => {
        const newErrors = {};

        if (field === 'all' || field === 'mobile') {
            if (!mobileNumber) {
                newErrors.mobile = 'Mobile number is required';
            } else if (!phoneRegex.test(mobileNumber)) {
                newErrors.mobile = 'Invalid mobile number';
            }
        }

        if (field === 'all' || field === 'otp') {
            if (otpSent && !otp) {
                newErrors.otp = 'OTP is required';
            } else if (otpSent && otp.length !== 4) {
                newErrors.otp = 'OTP must be 4 digits';
            }
        }

        setErrors(prev => ({ ...prev, ...newErrors }));
        return Object.keys(newErrors).length === 0;
    };

    const { post: sendOtp, isLoading: isSendingOtp } = usePost(apiEndpoints.dmtGenerateOtpForRegistration, {
        onSuccess: (res) => {
            if (res.success) {
                setOtpSent(true);
                toast.success("OTP sent successfully to your mobile number!");

            } else {
                toast.error(res.message || "Failed to send OTP");
            }
        },
        onError: (error) => {
            console.error('Failed to send OTP:', error);
            toast.error(handleValidationError(error) || "Failed to send OTP");
        }
    });

    const { post: verifyOtp, isLoading: isVerifyingOtp } = usePost(apiEndpoints.dmtVerifyOtpForRegistration, {
        onSuccess: (res) => {
            if (res.success) {
                toast.success("OTP verified successfully!");
                navigate('/money-transfer/dashboard', { state: { mobile: mobileNumber } });
            }
            else{
                toast.error(res.message || "Failed to verify OTP");
            }
        },
        onError: (error) => {
            console.error('Failed to verify OTP:', error);
            toast.error(handleValidationError(error) || "Failed to verify OTP");
        }
    });

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (!validate('mobile')) return;

        if (location.lat === null || location.lng === null) {
            toast.error("Location access is required.");
            return;
        }
        const publicIp = await fetchPublicIp();
        if (!publicIp) {
            toast.error("Unable to fetch client IP address. Please check your internet connection and try again.");
            return;
        }


        sendOtp({ mobileNumber, latitude: location.lat, longitude: location.lng, publicIp });
    };

    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        if (location.lat === null || location.lng === null) {
            toast.error("Location access is required.");
            return;
        }
        const publicIp = await fetchPublicIp();
        if (!publicIp) {
            toast.error("Unable to fetch client IP address. Please check your internet connection and try again.");
            return;
        }

        verifyOtp({ mobileNumber, otp, latitude: location.lat, longitude: location.lng, publicIp });
    };

    // Profile loading skeleton
    if (profileLoading || (!profile && !profileError)) {
        return (
            <PageLayout
                title="OTP Verification"
                subtitle="Verify your mobile number with OTP"
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
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-11 w-full rounded-xl" />
                            </div>

                            <div className="flex flex-col items-center gap-6 pt-6">
                                <Skeleton className="h-12 w-full max-w-sm rounded-2xl" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                    </BentoCard>
                </div>
            </PageLayout>
        );
    }

     if (rejectRequest("dmt1", profile?.requestedService)) return (<RejectedRequest service="dmt" pipeline="dmt1" />)
    // Permission check
    if (!checkAssignedService("dmt", "dmt1", profile?.assignedServices)) return (<NoPermission service="dmt" pipeline="dmt1" />)

    return (
        <PageLayout
            title="OTP Verification"
            subtitle="Verify your mobile number with OTP"
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
                                Mobile Verification
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                OTP Authentication
                            </p>
                        </div>
                    </div>

                    <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                                Mobile Number
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

                        {otpSent && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">
                                    Enter OTP
                                </label>
                                <Input
                                    icon={MessageSquare}
                                    placeholder="Enter 4-digit OTP"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(formatNumberInput(e.target.value, 4));
                                        if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
                                    }}
                                    error={errors.otp}
                                />
                                <p className="text-[10px] text-slate-500 font-medium ml-1">
                                    OTP sent to {mobileNumber}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col items-center gap-6 pt-6 border-t border-slate-50">
                            <Button
                                isLoading={otpSent ? isVerifyingOtp : isSendingOtp}
                                type="submit"
                                className="h-12 w-full max-w-sm rounded-2xl bg-[#7065e0] hover:bg-[#5f54cc] text-white font-black text-sm uppercase tracking-[0.15em] shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                            >
                                <span>{otpSent ? 'Verify OTP' : 'Send OTP'}</span>
                                </Button>                               
                                {otpSent && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleSendOtp}
                                        isLoading={isSendingOtp}
                                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-indigo-600"
                                    >
                                        Resend OTP
                                    </Button>
                                )}    
                            

                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Secure OTP Verification
                            </p>
                        </div>
                    </form>
                </BentoCard>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { label: "Secure Process", desc: "Your mobile number is verified using secure OTP authentication" },
                        { label: "Quick Verification", desc: "OTP will be delivered instantly to your registered mobile number" }
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
