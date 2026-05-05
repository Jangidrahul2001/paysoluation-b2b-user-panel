import React, { useEffect } from 'react';
import { m } from 'framer-motion';
import { ShieldCheck, Clock, CreditCard, ExternalLink, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/profileSlice';

const OnboardingPendingApproval = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);


  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) {
      dispatch(fetchProfile());
      return;
    }
    console.log(profile.kycStatus, "kyc staatus in onboarding pending approval");

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


  const handleGoLogin = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
      <m.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[420px] w-full"
      >
        <div className="bg-white rounded-[2rem] p-8 md:p-12 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] border border-slate-100/80">
          {/* Minimal Icon Header */}
          <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-8 text-indigo-600">
            <Clock className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Payment Verification</h1>
          <p className="text-slate-500 font-medium mb-10 text-[13px] leading-relaxed px-2">
            Your payment request has been submitted. Our compliance team is currently verifying the transaction details.
          </p>

          {/* Status Badge */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-10 inline-flex flex-col items-center w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Audit in Progress</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">Est. Time: 2-4 Hours</p>
          </div>

          <div className="space-y-3">
            {/* <Button
              className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
              onClick={() => window.location.reload()}
            >
              Check Status
            </Button> */}

            <button
              onClick={handleGoLogin}
              className="w-full h-12 rounded-xl text-slate-400 font-bold text-sm hover:bg-slate-50 hover:text-slate-600 transition-all"
            >
              Logout from Session
            </button>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-30 select-none">
          <a href="mailto:support@Pay Soluation.com" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-900 hover:text-indigo-600 transition-colors">
            <Mail size={12} />
            Support
          </a>
          <div className="w-1 h-1 rounded-full bg-slate-400" />
          <p className="text-[10px] font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck size={12} />
            Verified
          </p>
        </div>
      </m.div>
    </div>
  );
};

export default OnboardingPendingApproval;
