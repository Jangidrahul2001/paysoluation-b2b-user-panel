import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { toast } from "sonner";
import { usePost } from "../hooks/usePost";
import { apiEndpoints } from "../api/apiEndpoints";
import { detect } from "detect-browser";
import { emailRegex, fetchPublicIp, formatEmailInput, handleValidationError, InputSlice } from "../utils/helperFunction";
import { fetchProfile } from "../store/slices/profileSlice";
import { useDispatch } from "react-redux";
import { fetchWallet } from "../store/slices/walletSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../components/ui/Input";

const OTP_LENGTH = 6;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(120);
  const [showPassword, setShowPassword] = useState(false);

  const inputRefs = useRef([]);

  const browser = detect();

  // ── OTP Countdown Timer ──
  useEffect(() => {
    let interval;
    if (showOtpScreen && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, otpTimer]);

  // ── Auto-focus first OTP input when OTP screen is shown ──
  useEffect(() => {
    if (showOtpScreen) {
      const focusTimer = setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 150);
      return () => clearTimeout(focusTimer);
    }
  }, [showOtpScreen]);

  const getSystemDetails = async () => {
    const ipData = await fetchPublicIp();
    if (!ipData) {
      toast.error("Unable to fetch client IP address. Please check your internet connection and try again.");
      return;
    }

    let location = null;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject),
        );
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      } catch {
        location = { latitude: null, longitude: null };
      }
    }

    setFormData((prev) => ({
      ...prev,
      systemDetails: { browser, ip: ipData, location },
    }));
  };

  useEffect(() => {
    getSystemDetails();
  }, []);

  const validate = () => {
    let tempErrors = {};
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
    }
    if (!formData.userName) {
      tempErrors.userName = "Username is required";
    }

    if (
      formData.systemDetails.location.latitude === null ||
      formData.systemDetails.location.longitude === null
    ) {
      tempErrors.location = "Location access is required for login";
      toast.error("Location access is required for login");
    }
    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
    }
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "userName") {
      setFormData((prev) => ({ ...prev, [name]: value?.toUpperCase()?.slice(0, 10) }));
    }
    else if (name === "email") {
      setFormData((prev) => ({ ...prev, [name]: formatEmailInput(value) }));
    }
    else {
      setFormData((prev) => ({ ...prev, [name]: InputSlice(value, 20) }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const { post: loginUser } = usePost(apiEndpoints?.userLogin, {
    onSuccess: (data) => {
      if (data.success) {
        setOtpTimer(120);
        setIsLoading(false);
        setFormData((prev) => ({ ...prev, tempUserData: data }));
        toast.success(`OTP sent to ${formData.email.split('@')[0]}...!`, {
          description: "Please check your inbox.",
        });
      } else {
        setShowOtpScreen(false);
        setIsLoading(false);
        toast.error(data.message || "Invalid credentials!");
      }
    },
    onError: (error) => {
      setShowOtpScreen(false);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsLoading(false);
    },
  });

  const { post: verifyOtp } = usePost(apiEndpoints?.verifyUserOtp, {
    onSuccess: (data) => {
      if (data.success) {
        const { user } = data

        const { firstName, kycStatus, } = data?.user;
        const token = data?.token;

        if (!token) {
          toast.error("Authentication failed: No token received.");
          setIsVerifyingOtp(false);
          return;
        }

        localStorage.setItem("authToken", token);
        localStorage.setItem("isAuthenticated", "true");
        dispatch(fetchProfile());

        let message = `Welcome back, ${firstName}! 🎉`;
        let description = "";

        if (!kycStatus || kycStatus === "pending") {
          console.log(data?.isPaymentRequired && user?.idPaymentStatus && user?.idPaymentStatus === "pending")
          if (data?.isPaymentRequired && user?.idPaymentStatus && user?.idPaymentStatus === "pending") {
            message = "Onboarding Chargers Pending!";
            description = "Please pay your Onboarding charges.";
            navigate("/onboarding-charges", { state: { isKycOnline: data?.isKycOnline, onBoardCharge: data?.onBoardCharge } });
          }
          else if (data?.isPaymentRequired && user?.idPaymentStatus && user?.idPaymentStatus === "rejected") {
            message = "Onboarding Chargers request rejected!";
            description = "Please pay your Onboarding charges.";
            navigate("/onboarding-charges", { state: { isKycOnline: data?.isKycOnline, onBoardCharge: data?.onBoardCharge } });
          }
          else if (data?.isPaymentRequired && user?.idPaymentStatus && user?.idPaymentStatus === "complete") {
            message = "Onboarding Chargers Paid!";
            description = "Please wait while the admin reviews and approves your payment.";
            navigate("/onboarding-pending");
          }
          else {
            message = "KYC Pending!";
            description = "Please complete your KYC.";
            data.isKycOnline ? navigate("/kyc-online") : navigate("/kyc");
          }
        }
        else if (kycStatus === "rekyc") {
          message = "KYC Rejected";
          description = "Your KYC was rejected. Please complete Re-KYC to continue.";
          navigate("/kyc");
        }
        else if (kycStatus === "submitted") {
          message = "KYC Under Review!";
          description = "Verification in progress.";
          navigate("/kyc-pending");
        } else {
          dispatch(fetchWallet());
          message = "Welcome Back!";
          description = `Logged in successfully`;
          navigate("/dashboard");
        }

        toast.success(message, { description });
        setIsVerifyingOtp(false);
      }
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsVerifyingOtp(false);
    },
  });

  // ── OTP Input Handlers ──
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = "";
        setOtpDigits(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = "";
        setOtpDigits(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const otp = getOtpString();
      if (otp.length === OTP_LENGTH) handleVerifyOtpAndProceed();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pastedData) {
      const newOtp = [...otpDigits];
      pastedData.split('').forEach((d, i) => { newOtp[i] = d; });
      setOtpDigits(newOtp);
      const nextEmpty = newOtp.findIndex((d) => !d);
      inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
    }
  };

  const getOtpString = () => otpDigits.join("");

  const handleVerifyOtpAndProceed = () => {
    const otp = getOtpString();
    if (otp.length < OTP_LENGTH) {
      toast.error("Please enter all digits");
      return;
    }
    verifyOtp({ email: formData.email, otp });
    setIsVerifyingOtp(true);
  };

  const handleResendOtp = () => {

    setOtpDigits(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    loginUser(formData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(validate())
    if (validate()) {
      setIsLoading(true);
      setShowOtpScreen(true);
      loginUser(formData);
    }
  };

  // ── Render Screens ──
  return (
    <AnimatePresence mode="wait">
      {showOtpScreen ? (
        <motion.div
          key="otp-screen"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <button
              type="button"
              onClick={() => setShowOtpScreen(false)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 mb-6 transition-all group"
            >
              <span className="transition-transform group-hover:-translate-x-1">←</span>
              Back to Login
            </button>
            <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tightest uppercase">
              Verify OTP
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Sent to <strong className="text-slate-600 font-mono text-[10px]">{formData.email}</strong>
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className={`
                    w-full h-12 text-center text-lg font-black text-slate-800
                    border-2 rounded-2xl outline-none transition-all duration-300
                    ${digit ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}
                    focus:border-indigo-600 focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,70,229,0.1)]
                  `}
                />
              ))}
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {otpTimer > 0 ? (
                  <span>Expires in <span className="text-indigo-600">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, "0")}</span></span>
                ) : (
                  <span className="text-red-500">Expired</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpTimer > 0}
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${otpTimer > 0 ? "text-slate-200" : "text-indigo-600 hover:text-indigo-700"}`}
              >
                Resend SMS
              </button>
            </div>

            <Button
              type="button"
              onClick={handleVerifyOtpAndProceed}
              disabled={isVerifyingOtp || getOtpString().length < OTP_LENGTH}
              className="w-full h-12 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-700 text-white transition-all transition-duration-500"
            >
              {isVerifyingOtp ? "Verifying..." : "Confirm & Access"}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="login-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-1 tracking-tightest uppercase">
              Pay Soluation
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Secure Access to B2B Panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <Input
              label="Email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Username"
              type="text"
              name="userName"
              placeholder="Username"
              value={formData.userName}
              onChange={handleChange}
              error={errors.userName}
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 px-2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex justify-end pr-1 mt-3!">
              <Link
                to="/forgot-password"
                className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-700 text-white transition-all transition-duration-500 mt-4"
            >
              {isLoading ? "Authenticating..." : "Login"}
            </Button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New User? </span>
            <Link
              to="/signup"
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Login;
