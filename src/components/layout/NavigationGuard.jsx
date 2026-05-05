// src/components/layout/NavigationGuard.jsx
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile } from "../../store/slices/profileSlice";
import { toast } from "sonner";
import { LoadingScreen } from "./LoadingScreen";

export function NavigationGuard({ children }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: profile, loading } = useSelector((state) => state.profile);

  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) {
      dispatch(fetchProfile());
      return;
    }
    if (!loading && profile) {

      if (profile.isPaymentRequired && profile.idPaymentStatus && (profile.idPaymentStatus === "pending" || profile.idPaymentStatus === "rejected")) {
        toast.error("Payment is required.");
        navigate("/onboarding-charges", {
          state: { isKycOnline: profile.isKycOnline, onBoardCharge: profile.onBoardCharge },
          replace: true
        });
        return;
      }
      else if (profile.isPaymentRequired && profile.idPaymentStatus && profile.idPaymentStatus === "complete") {
        toast.error("your Id payment charges is under review.");
        navigate("/onboarding-pending", {
          replace: true
        });
        return;
      }
      else if (profile.kycStatus === "pending") {
        toast.error("KYC is pending.");
        navigate("/kyc", {
          replace: true
        });
        return;

      } else if (profile.kycStatus === "submitted") {
        toast.error("KYC is under review.");
        navigate("/kyc-pending", {
          replace: true
        });
        return;
      }

    }
  }, [profile, loading, navigate, dispatch]);


  return children;



}
