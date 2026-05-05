import React, { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { ShieldCheck, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/profileSlice';

const PendingApproval = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);


  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) {
      dispatch(fetchProfile());
      return;
    }

    if (profile?.isPaymentRequired && profile?.idPaymentStatus && (profile.idPaymentStatus === "pending" || profile.idPaymentStatus === "rejected")) {
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
    navigate("/login")

  }
  return (
    <div className="min-h-screen bg-[#fffbf7] flex items-center justify-center p-4">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/70 backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 text-center border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]"
      >
        <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-600">
          <Clock className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">KYC Pending</h1>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          Your KYC details have been submitted successfully and are currently under review by our Admin team. You will be notified once Approved.
        </p>

        <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 mb-8 text-left">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Under Review</h3>
              <p className="text-xs text-slate-500 mt-1">Verification usually takes 24-48 hours. Please check back later.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">

          <Button
            style={{
              backgroundColor: 'var(--button-primary-bg)',
              color: 'var(--button-primary-text)'
            }}
            className="w-full h-12 rounded-2xl font-bold hover:opacity-90 transition-all"
            onClick={handleGoLogin}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--button-primary-bg)'}
          >
            Back to Login
          </Button>

          <a href="mailto:support@b2buser.com" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Contact Support</a>

          {/* Developer Helper: Simulate Admin Approval */}
          {/* <Button
            variant="ghost"
            onClick={() => {
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              user.kycStatus = 'approved';
              localStorage.setItem('user', JSON.stringify(user));
              toast.success("Developer Mode: KYC Approved Automatically");
              window.location.href = '/dashboard';
            }}
            className="mt-4 text-[10px] uppercase font-bold text-emerald-500 hover:text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg cursor-pointer h-auto w-auto"
          >
            (Dev Only) Simulate Approval
          </Button> */}
        </div>
      </m.div>
    </div>
  );
};

export default PendingApproval;
