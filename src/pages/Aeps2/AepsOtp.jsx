import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { PageLayout } from "../../components/layout/PageLayout";
import { toast } from "sonner";
import { aadharRegex, checkAssignedService, formatAadharInput, formatNumberInput, rejectRequest } from "../../utils/helperFunction";
import { apiEndpoints } from "../../api/apiEndpoints";
import { usePost } from "../../hooks/usePost";
import { captureFingerprint, discoverDevice } from "../../api/RdService";
import { parseAndBuildPidData } from "../../api/PidParser";
import { useDispatch, useSelector } from 'react-redux';
import NoPermission from '.././NoPermission';
import { Skeleton } from '../../components/ui/skeleton';
import { useNavigate } from "react-router-dom";
import RejectedRequest from "../RejectedRequest";

export default function AepsOtp() {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);

  const [aadharNumber, setAadharNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [bioMetricShow, setBioMetricShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [latitudeAndLongitude, setLatitudeAndLongitudeData] = useState({
    longitude: "", latitude: ""
  });



  const { post: sendOtpApi, isLoading: isSendingOtp } = usePost(
    apiEndpoints.aeps2GetEkycOtp,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success("OTP sent to your Aadhaar linked mobile number.");
          setOtpSent(true);
        } else {
          toast.error(data.message || "Failed to send OTP.");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Unable to send OTP. Please try again.");
      },
    },
  );

  const { post: verifyOtpApi, isLoading: isVerifyingOtp } = usePost(
    apiEndpoints.aeps2VerifyEkycOtp,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Aadhaar verified successfully.");
          setBioMetricShow(true)
          // navigate("/aeps2");
        } else {
          toast.error(data.message || "OTP verification failed.");
        }
      },
      onError: (error) => {
        toast.error(
          error.message || "OTP verification failed. Please try again.",
        );
      },
    },
  );

  const handleAadharChange = (value) => {
    const formatted = formatAadharInput(value);
    setAadharNumber(formatted);
    if (errors.aadharNumber) {
      setErrors((prev) => ({ ...prev, aadharNumber: "" }));
    }
  };

  const handleOtpChange = (value) => {
    setOtp(value);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
  };

  const { post: biometricKyc, } = usePost(
    apiEndpoints.aeps2BiometricKyc,
    {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(data.message || "biometric verified successfully.");
          setIsLoading(false);
          navigate("/aeps2/aeps-daily-login");
        } else {
          toast.error(data.message || "biometric verification failed.");
          setIsLoading(false);
        }
      },

      onError: (error) => {
        setIsLoading(false);
        toast.error(
          error.message || "biometric verification failed. Please try again.",
        );
        if (error.message === "Please Send & validate OTP before giving BioMetric") {
          setBioMetricShow(false);
        }
      },
    },
  );

  const handleBiometricVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const device = await discoverDevice();
    if (!device.success) {
      setIsLoading(false);
      toast.error(device.message);
      return;
    }
    const capture = await captureFingerprint(true, "aeps1");
    if (capture.success) {
      biometricKyc({
        pidData: capture.data,
        ...latitudeAndLongitude
      });
    } else {
      setIsLoading(false);
      toast.error(capture.message);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitudeAndLongitudeData({
            ...latitudeAndLongitude,
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

  const handleSendOtp = (event) => {
    event.preventDefault();

    if (!aadharNumber || !aadharRegex.test(aadharNumber)) {
      setErrors({ aadharNumber: "Enter a valid 12-digit Aadhaar number." });
      return;
    }

    setErrors({});
    sendOtpApi({ aadhaar: aadharNumber, ...latitudeAndLongitude });
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();

    const tempErrors = {};
    if (!otp || otp.length !== 6) {
      tempErrors.otp = "Enter the 6-digit OTP.";
    }
    if (!aadharNumber || !aadharRegex.test(aadharNumber)) {
      tempErrors.aadharNumber = "Enter a valid Aadhaar number.";
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    verifyOtpApi({ aadharNumber, otp, ...latitudeAndLongitude });
  };

  // Profile loading skeleton
  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="AEPS Aadhaar OTP"
        subtitle="Verify your Aadhaar with a one-time password before proceeding to AEPS."
        showBackButton
        className="mx-auto w-full py-4"
      >
        <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          {/* Header Section Skeleton */}
          <div className="mb-7 rounded-3xl bg-slate-50 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:items-start">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-full max-w-xl" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Form Section Skeleton */}
          <div className="space-y-7">
            <div className="space-y-4">
              {/* Aadhaar Input Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>

              {/* OTP Input Skeleton (conditional) */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-4 w-80" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-11 w-full max-w-xs rounded-xl" />
              </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-11 w-full sm:w-32 rounded-xl" />
              <Skeleton className="h-11 w-full sm:w-28 rounded-xl" />
            </div>

            {/* Help Section Skeleton */}
            <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

   if (rejectRequest("aeps2", profile?.requestedService)) return (<RejectedRequest service="aeps" pipeline="aeps2" />)
  // Permission check
  if (!checkAssignedService("aeps", "aeps2", profile?.assignedServices)) return (<NoPermission service="aeps" pipeline="aeps2"  />)

  return (
    <PageLayout
      title={bioMetricShow ? "AEPS Biometric Verification" : "AEPS Aadhaar OTP"}
      subtitle={bioMetricShow
        ? "Complete biometric authentication to proceed with AEPS transactions."
        : "Verify your Aadhaar with a one-time password before proceeding to AEPS."
      }
      showBackButton
      className="mx-auto w-full py-4 "
    >

      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 rounded-3xl bg-slate-50 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:items-start">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-indigo-700">
              AEPS Verification
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {bioMetricShow ? "Biometric Verification" : "Aadhaar OTP verification"}
            </h2>
            <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              {bioMetricShow
                ? "Complete your verification using biometric authentication to proceed with AEPS transactions."
                : "Start with your Aadhaar number. We will send a one-time code to your linked mobile so you can verify securely."
              }
            </p>
          </div>
        </div>

        {bioMetricShow ? (
          <div className="space-y-7">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Ready for Biometric Verification</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Place your finger on the biometric device to complete verification
                </p>
              </div>
            </div>

            <Button
              isLoading={isLoading}
              disabled={isLoading}
              onClick={handleBiometricVerification}
              className="w-full"
            >
              Start Biometric Verification
            </Button>

            <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Instructions</p>
              <p className="mt-1 leading-6">
                Ensure your biometric device is connected and place your finger firmly on the scanner when prompted.
              </p>
            </div>
          </div>
        ) : (
          <form
            className="space-y-7"
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          >
            <div className="space-y-4">
              <Input
                label="Aadhaar Number"
                type="text"
                value={aadharNumber}
                onChange={(e) => handleAadharChange(e.target.value)}
                placeholder="Enter 12-digit Aadhaar"
                error={errors.aadharNumber}
              />

              {otpSent && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        OTP
                      </label>
                      <p className="text-sm text-slate-500">
                        Enter the 6-digit code sent to your registered mobile
                        number.
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-400">
                      Already have the code?
                    </span>
                  </div>

                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => handleOtpChange(formatNumberInput(e.target.value, 6))}
                    placeholder="Enter 6-digit OTP"
                    error={errors.otp}
                    className="max-w-xs text-center"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                isLoading={otpSent ? isVerifyingOtp : isSendingOtp}
                className="w-full sm:w-auto"
              >
                {otpSent ? "Submit OTP" : "Send OTP"}
              </Button>
              {otpSent && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => sendOtpApi({ aadhaar: aadharNumber, ...latitudeAndLongitude })}
                  isLoading={isSendingOtp}
                  className="w-full sm:w-auto"
                >
                  Resend OTP
                </Button>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Need help?</p>
              <p className="mt-1 leading-6">
                Enter your Aadhaar number first, then tap{" "}
                {otpSent ? "Submit OTP" : "Send OTP"}. The OTP field appears only
                after the code is sent.
              </p>
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
