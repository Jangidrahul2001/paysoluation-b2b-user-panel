import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Banknote,
  History,
  Fingerprint,
  Smartphone,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { PageLayout } from '../../components/layout/PageLayout';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import {
  aadharRegex,
  checkAssignedService,
  formatAadharInput,
  formatNumberInput,
  formatToINR,
  handleValidationError,
  phoneRegex,
  rejectRequest
} from '../../utils/helperFunction';
import { apiEndpoints } from '../../api/apiEndpoints';
import { useFetch } from '../../hooks/useFetch';
import { usePost } from '../../hooks/usePost';
import { captureFingerprint, discoverDevice } from "../../api/RdService";
import { parseAndBuildPidData } from '../../api/PidParser';
// import AepsResponseModal from '../../modal/AepsResponseModal';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProfile } from '../../store/slices/profileSlice';
import NoPermission from '../NoPermission';
import { Skeleton } from '../../components/ui/skeleton';
import { fetchWallet } from '../../store/slices/walletSlice';
// import ReceiptModal from '../../modal/RecieptModal';
import { servicesData } from '../../services/billPaymentService';
import ReceiptModal from '../../modal/RecieptModal';
import RejectedRequest from '../RejectedRequest';

export default function AepsDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);
  const [activeService, setActiveService] = useState('balance');
  const [isLoading, setIsLoading] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [recieptModalData, setRecieptModalData] = useState({
    title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false
  });
  // const [responseModal, setResponseModal] = useState({
  //   isOpen: false,
  //   data: null,
  //   type: ""
  // });

  const [serviceFormData, setServiceFormData] = useState({
    bank: '',
    mobile: '',
    aadhaar: '',
    amount: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProfile());
    statusForDailyLogin();
  }, [])

  useEffect(() => {
    if (profile && profile.aeps1) {
      if (profile && profile.aeps1 && !profile?.aeps1?.isLoginRequired) {
        // statusForDailyLogin();
      }
      if (!profile?.aeps1?.isAepsEnabled || profile?.aeps1?.isLoginRequired) {
        navigate("/aeps", { replace: true });
      }
    }
  }, [profile?.aeps1])

  const { refetch: fetchBanks } = useFetch(
    `${apiEndpoints.aepsBankList}`,
    {
      onSuccess: (data) => {
        if (data.success && Array.isArray(data.data)) {
          const formattedBanks = data.data.map((bank) => ({
            label: bank.name,
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

  const { refetch: statusForDailyLogin } = useFetch(
    `${apiEndpoints.aepsStatusForDailyLogin}`,
    {
      onSuccess: (data) => {
        console.log(data)
      },
      onError: (error) => {
        if (error?.code === "AEPS_LOGIN_REQUIRED") {
          toast.error("Daily login required for AEPS services. Please login to continue.");
          dispatch(fetchProfile());
          navigate("/aeps", { replace: true });
        }
        console.error("Error in fetch aeps status for daily login:", error);
      },
    },
    false,
  );





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
          toast.error("Location access is required for AePS transactions.");
        }
      );
    }
  }, []);

  const { post: doAepsService } = usePost(
    activeService === 'balance' ? apiEndpoints.aepsBalanceInquiry :
      activeService === 'statement' ? apiEndpoints.aepsMiniStatement :
        apiEndpoints.aepsCashWithdrawal,
    {
      onSuccess: (res) => {

        if (res?.success) {
          console.log(activeService, res, "pppppcheckkk")
          if (activeService === 'balance') {
            setRecieptModalData({
              title: "Balance Enquiry",
              date: res?.data?.timestamp,
              subTitleLabel: "Available Balance",
              subTitleValue: formatToINR(res?.data?.data?.balance),
              receiptData: {
                Bank: res?.data?.data?.bankName || "",
                "Aadhaar Number": res?.data?.data?.aadhaarNumber || serviceFormData?.aadhaar,
                "Transaction Id": res?.data?.transactionId || "",
                status: "Transaction Successful"
              },
              isOpen: true
            });
          }
          else if (activeService === 'statement') {
            const miniStatement = res?.data?.data?.miniStatement?.map((transaction) => {
              const transactionType =
                transaction?.narration
                  ?.split(transaction.amount)?.[0]
                  ?.trim()
                  .match(/([DC])$/)?.[1] || "D";

              return {
                ...transaction,
                txnType: transactionType === "D" ? "Dr" : "Cr",
              };
            });
            setRecieptModalData({
              title: "Mini Statement",
              date: res?.data?.timestamp,
              receiptData: {
                Bank: res?.data?.data?.bankName || "",
                "Aadhaar Number": res?.data?.data?.aadhaarNumber || serviceFormData?.aadhaar,
                "Transaction Id": res?.data?.transactionId || "",
                status: "Transaction Successful",
                miniStatement: miniStatement
              },
              isOpen: true
            });
          }
          else {
            setRecieptModalData({
              title: "Withdrawl Successful",
              date: res?.data?.timestamp,
              subTitleLabel: "Withdrawal Amount",
              subTitleValue: formatToINR(serviceFormData.amount),
              receiptData: {
                Bank: res?.data?.data?.bankName || "",
                "Aadhaar Number": res?.data?.data?.aadhaarNumber || serviceFormData?.aadhaar,
                "Transaction Id": res?.data?.transactionId || "",
                status: "Transaction Successful",

              },
              isOpen: true
            });
          }

        }
        setIsLoading(false);
        toast.success(res.message || 'Transaction Successful');
        dispatch(fetchWallet());
      },
      onError: (error) => {
        if (error.code) {
          if (error.code === "AEPS_LOGIN_REQUIRED") {
            navigate("/aeps", { replace: true });
            setIsLoading(false);
            dispatch(fetchProfile());
            toast.error(error.message || "Login required for AEPS services. Please login to continue.");
            return;
          }
        }

        setIsLoading(false);
        toast.error(handleValidationError(error) || "Transaction failed");
      }
    }
  );

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    let tempsErrors = {};

    if (!serviceFormData.bank) {
      tempsErrors.bank = "Please select a bank";
    }
    if (!phoneRegex.test(serviceFormData.mobile)) {
      tempsErrors.mobile = "Please enter a valid mobile number";
    }
    if (!aadharRegex.test(serviceFormData.aadhaar)) {
      tempsErrors.aadhaar = "Please enter a valid 12-digit Aadhaar number";
    }
    if (activeService === 'withdrawal' && !serviceFormData.amount) {
      tempsErrors.amount = "Please enter amount";
    } else if (serviceFormData.amount && (isNaN(serviceFormData.amount) || Number(serviceFormData.amount) < 100 || !(Number(serviceFormData.amount) % 50 === 0))) {
      tempsErrors.amount = "Please enter a valid amount should be multiple of 50 (Minimum ₹100)";
    }
    else if (Number(serviceFormData.amount) > 10000) {
      tempsErrors.amount = "Please enter a valid amount should be less than ₹10000";
    }

    setErrors(tempsErrors);

    if (Object.keys(tempsErrors).length > 0) {
      return toast.error("Please fill in all required fields correctly");
    }

    setIsLoading(true);
    const device = await discoverDevice();

    if (!device.success) {
      toast.error(device.message);
      setIsLoading(false);
      return;
    }

    const capture = await captureFingerprint(false);

    if (capture.success) {
      const parsedData = parseAndBuildPidData(capture.data);
      if (parsedData.success) {
        doAepsService({
          bankId: serviceFormData.bank,
          mobile: serviceFormData.mobile,
          aadhaar: serviceFormData.aadhaar,
          amount: activeService === 'withdrawal' ? serviceFormData.amount : 0,
          latitude: location.lat,
          longitude: location.lng,
          biometricData: parsedData.data,
          captureType: "finger"
        });
      } else {
        setIsLoading(false);
        toast.error("Failed to parse PID data");
      }
    } else {
      setIsLoading(false);
      toast.error(capture.message);
    }
  };

  // Profile loading skeleton
  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="Aadhaar Enabled Payment System (AePS)"
        subtitle="Complete Transactions with Unified Aadhaar Gateway"
        className="max-w-[1600px] mx-auto py-6"
      >
        <div className="space-y-6">
          <Card className="p-0 overflow-hidden border-slate-100 shadow-sm bg-white">
            {/* Header Section Skeleton */}
            <div className="px-8 py-6 border-b border-slate-50 flex flex-col items-center lg:flex-row xl:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="text-center xl:text-left">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              {/* Service Tabs Skeleton */}
              <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 w-full sm:w-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 sm:px-5 py-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-3 w-16 hidden sm:block" />
                  </div>
                ))}
              </div>
            </div>

            {/* Form Section Skeleton */}
            <div className="p-8">
              <div className="space-y-8">
                <div className="grid gap-x-10 gap-y-8 grid-cols-1 md:grid-cols-3">
                  {/* Bank Select Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>

                  {/* Mobile Input Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>

                  {/* Aadhaar Input Skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>

                {/* Bottom Section Skeleton */}
                <div className="pt-6 border-t border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50/50 rounded-xl border border-amber-100/50 w-full lg:w-auto">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-11 w-full lg:w-40 rounded-xl" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (rejectRequest("aeps", profile?.requestedService)) return (<RejectedRequest service="aeps" pipeline="aeps1" />)
  // Permission check
  if (!checkAssignedService("aeps", "aeps1", profile?.assignedServices)) return (<NoPermission service="aeps" pipeline="aeps1" />)

  return (
    <PageLayout
      title="Aadhaar Enabled Payment System (AePS)"
      subtitle="Complete Transactions with Unified Aadhaar Gateway"
      className="max-w-[1600px] mx-auto py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="p-0 overflow-hidden border-slate-100 shadow-sm bg-white">
          <div className="px-8 py-6 border-b border-slate-50 flex flex-col items-center lg:flex-row xl:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CreditCard size={20} />
              </div>
              <div className="text-center xl:text-left">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  AEPS Terminal
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Secure Transaction Engine
                </p>
              </div>
            </div>

            <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 relative w-full sm:w-auto">
              {[
                { id: 'balance', label: 'Balance Inquiry', short: 'Balance', icon: CreditCard },
                { id: 'statement', label: 'Mini Statement', short: 'Statement', icon: History },
                { id: 'withdrawal', label: 'Cash Withdrawal', short: 'Withdraw', icon: Banknote },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveService(tab.id); setServiceFormData({
                      bank: '',
                      mobile: '',
                      aadhaar: '',
                      amount: ''
                    })
                  }}
                  className={cn(
                    "relative flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl text-[9px] sm:text-xs font-bold transition-colors duration-200 z-10 whitespace-nowrap",
                    activeService === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {activeService === tab.id && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200/80 rounded-xl"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <tab.icon
                    className={cn(
                      "relative z-10 transition-colors duration-300 w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0",
                      activeService === tab.id ? "text-indigo-600" : "text-slate-400"
                    )}
                  />
                  <span className="relative z-10 hidden md:inline">{tab.label}</span>
                  <span className="relative z-10 hidden sm:inline md:hidden">{tab.short}</span>
                  <span className="relative z-10 inline sm:hidden">{tab.short}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleServiceSubmit} className="space-y-8">
              <div className={cn(
                "grid gap-x-10 gap-y-8",
                activeService === 'withdrawal' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
              )}>
                <div className="space-y-2">
                  <label className="text-[10px] font-black tracking-widest uppercase text-slate-400 ml-1">Select Bank</label>
                  <Select
                    placeholder="--Choose Bank--"
                    searchable={true}
                    options={bankList}
                    value={serviceFormData.bank}
                    onChange={(val) => {
                      setServiceFormData({ ...serviceFormData, bank: val })
                      setErrors({ ...errors, bank: "" })
                    }}
                    className="h-11! rounded-xl!"
                    error={errors.bank}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label='Customer Mobile'
                    icon={Smartphone}
                    value={serviceFormData.mobile}
                    onChange={(e) => {
                      setServiceFormData({ ...serviceFormData, mobile: formatNumberInput(e.target.value, 10) })
                      setErrors({ ...errors, mobile: "" })
                    }}
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    error={errors.mobile}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label='Customer Aadhaar'
                    icon={Fingerprint}
                    value={serviceFormData.aadhaar}
                    onChange={(e) => {
                      setServiceFormData({ ...serviceFormData, aadhaar: formatAadharInput(e.target.value) })
                      setErrors({ ...errors, aadhaar: "" })
                    }}
                    placeholder="000000000000"
                    maxLength={12}
                    error={errors.aadhaar}
                  />
                </div>

                {activeService === 'withdrawal' && (
                  <div className="space-y-2">
                    <Input
                      label='Withdrawal Amount'
                      icon={Banknote}
                      value={serviceFormData.amount}
                      onChange={(e) => {
                        setServiceFormData({ ...serviceFormData, amount: formatNumberInput(e.target.value, 5) })
                        setErrors({ ...errors, amount: "" })
                      }}
                      placeholder="Enter amount (Minimum ₹100)"
                      error={errors.amount}
                    />
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50/50 rounded-xl border border-amber-100/50 w-full lg:w-auto">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Info size={14} className="text-amber-600" />
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-amber-700 uppercase tracking-tight leading-tight">
                    Ensure the customer's finger is properly placed on the biometric scanner
                  </p>
                </div>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="h-11 w-full lg:w-auto lg:px-10 rounded-xl bg-[#7065e0] hover:bg-[#5f54cc] text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                >
                  <Fingerprint size={18} />
                  Process Transaction
                </Button>
              </div>
            </form>
          </div>
        </Card>
        {recieptModalData.isOpen && (

          <ReceiptModal
            title={recieptModalData.title}
            date={recieptModalData.date}
            subTitleLabel={recieptModalData.subTitleLabel}
            subTitleValue={recieptModalData.subTitleValue}
            receiptData={recieptModalData.receiptData}
            onClose={() => {
              setRecieptModalData({ title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false });
              setServiceFormData({ bank: '', mobile: '', aadhaar: '', amount: '' });
              setErrors({ bank: '', mobile: '', aadhaar: '', amount: '' });
            }}
          />
        )}

        {/* {responseModal.isOpen && (
          <AepsResponseModal
            responseData={responseModal.data}
            transactionType={activeService}
            onClose={() => {
              setResponseModal({ isOpen: false, data: null, type: null });
              setServiceFormData({ bank: '', mobile: '', aadhaar: '', amount: '' });
              setErrors({ bank: '', mobile: '', aadhaar: '', amount: '' });
            }}
          />
        )} */}
      </motion.div>
    </PageLayout>
  );
}
