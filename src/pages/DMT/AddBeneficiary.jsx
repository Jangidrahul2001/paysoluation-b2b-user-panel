import React, { useState, useEffect } from 'react';
import { Landmark, PlusCircle, ShieldCheck, User, Smartphone, History, Check } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NoPermission from '../NoPermission';
import { Skeleton } from '../../components/ui/skeleton';
import { checkAssignedService, formatIfscInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, ifscRegex, nameWithSpaceRegex, phoneRegex, rejectRequest } from '../../utils/helperFunction';
import { useFetch } from '../../hooks/useFetch';
import { apiEndpoints } from '../../api/apiEndpoints';
import { usePost } from '../../hooks/usePost';
import RejectedRequest from '../RejectedRequest';

export default function AddBeneficiary() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { mobile } = location?.state || {};
  useEffect(() => {

    if (!mobile) {
      toast.error("Mobile Number not found");
      return navigate("/money-transfer");
    }
  }, [mobile])
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    bankName: "",
    ifsc: "",
    accountHolderName: "",
    accountNumber: "",
    mobile: mobile,
    beneficiaryMobile: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [bankList, setBankList] = useState([]);
  const { refetch: fetchBankList } = useFetch(
    `${apiEndpoints.fetchAllBanks}`,
    {
      onSuccess: (data) => {
        if (data.success && Array.isArray(data.data)) {
          const formattedBanks = data.data.map((bank) => ({
            label: bank.bankName,
            value: bank.bankName,
          }));
          setBankList(formattedBanks);
        }
      },
      onError: (error) => {
        console.log("error in bank list data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { post: addBeneficiaryAccount } = usePost(apiEndpoints.dmtAddBeneficiary, {
    onSuccess: (res) => {
      console.log(res)
      if (res.success) {
        setIsLoading(false);
        toast.success(res.message || 'Beneficiary added successfully');
        navigate("/money-transfer/dashboard", { state: { mobile } });
      }
    },
    onError: (error) => {
      setIsLoading(false);
      console.error('Failed to add beneficiary account:', error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });



  const handleSubmit = (e) => {
    e.preventDefault();
    const tempErrors = {};

    if (!formData.bankName) {
      tempErrors.bankName = "Bank name is required";
    }
    if (!formData.ifsc) {
      tempErrors.ifsc = "IFSC code is required";
    }
    else if (!ifscRegex.test(formData.ifsc)) {
      tempErrors.ifsc = "Invalid IFSC code format";
    }

    if (!formData.accountHolderName) {
      tempErrors.accountHolderName = "Account holder name is required";
    }
    else if (!nameWithSpaceRegex.test(formData.accountHolderName?.trim())) {
      tempErrors.accountHolderName = "Enter a valid account holder name";
    }

    if (!formData.accountNumber) {
      tempErrors.accountNumber = "Account number is required";
    }
    if (!formData.beneficiaryMobile) {
      tempErrors.beneficiaryMobile = "Beneficiary mobile number is required";
    } else if (!phoneRegex.test(formData.beneficiaryMobile)) {
      tempErrors.beneficiaryMobile = "Enter a valid mobile number";
    }
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    addBeneficiaryAccount(formData);

  };

  // Profile loading skeleton
  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="Beneficiary Registration"
        subtitle="Onboard a new bank account to your remitter profile"
        showBackButton
        className="max-w-[1600px] mx-auto py-4"
      >
        <div className="w-full bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-sm rounded-[2rem] relative group overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-900/3 rounded-full blur-3xl pointer-events-none transition-colors duration-1000" />

          <div className="p-8 lg:p-12 relative z-10">
            <div className="flex flex-col gap-10">
              {/* Bank Details Section Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-200/50 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>

              {/* Account Identity Section Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-200/50 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>

                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>

              {/* Verification Details Section Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-200/50 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>

              {/* Actions Section Skeleton */}
              <div className="pt-8 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100">
                <Skeleton className="h-11 w-full sm:w-48 rounded-xl" />
                <Skeleton className="h-11 w-full sm:w-24 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Banner Skeleton */}
        <div className="mt-8 px-6 py-5 bg-indigo-50/40 border border-indigo-100/50 rounded-3xl flex items-center gap-4 max-w-[1200px] mx-auto">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-3 w-48 mb-2" />
            <Skeleton className="h-3 w-full" />
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
      title="Beneficiary Registration"
      subtitle="Onboard a new bank account to your remitter profile"
      showBackButton
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="w-full bg-white/80 backdrop-blur-xl border border-indigo-200/50 shadow-sm rounded-[2rem] relative group overflow-hidden">
        {/* Ambient Decorative Blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-900/3 rounded-full blur-3xl pointer-events-none transition-colors duration-1000" />

        <div className="p-8 lg:p-12 relative z-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* Section: Bank Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-200/50 mb-2">
                <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2.5 uppercase tracking-[0.2em] leading-none">
                  <Landmark size={16} className="text-indigo-600" /> Destination Bank
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Bank Name
                </label>
                <Select
                  placeholder="Select Bank"
                  options={bankList}
                  onChange={(val) => {
                    setFormData({ ...formData, bankName: val });
                    if (errors.bankName) setErrors(prev => ({ ...prev, bankName: "" }));
                  }
                  }
                  value={formData.bankName}
                  // className="h-11 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 outline-none"

                  error={errors.bankName}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  IFSC Code
                </label>
                <Input
                  placeholder="EX: UTIB0002878"
                  value={formData.ifsc}
                  onChange={(e) => {
                    setFormData({ ...formData, ifsc: formatIfscInput(e.target.value.toUpperCase()) });
                    if (errors.ifsc) setErrors(prev => ({ ...prev, ifsc: "" }));
                  }}
                  // className="h-11 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 outline-none"

                  error={errors.ifsc}
                />
              </div>
            </div>

            {/* Section: Holder Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-200/50 mb-2">
                <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2.5 uppercase tracking-[0.2em] leading-none">
                  <User size={16} className="text-indigo-600" /> Account Identity
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Holder Name
                </label>
                <Input
                  placeholder="Enter Account Name"
                  value={formData.accountHolderName}
                  onChange={(e) => {
                    setFormData({ ...formData, accountHolderName: formatNameInputWithSpace(e.target.value, 50) }
                    ); if (errors.accountHolderName) setErrors(prev => ({ ...prev, accountHolderName: "" }));
                  }}
                  // className="h-11 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 outline-none"
                  error={errors.accountHolderName}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Account Number
                </label>
                <Input
                  placeholder="Enter Account Number"
                  value={formData.accountNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, accountNumber: formatNumberInput(e.target.value, 20) });
                    if (errors.accountNumber) setErrors(prev => ({ ...prev, accountNumber: "" }));
                  }}
                  // className="h-11 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 outline-none"
                  error={errors.accountNumber}
                />
              </div>
            </div>

            {/* Section: Connectivity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              <div className="col-span-1 md:col-span-2 pb-3 border-b border-indigo-200/50 mb-2">
                <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2.5 uppercase tracking-[0.2em] leading-none">
                  <Smartphone size={16} className="text-indigo-600" /> Verification Details
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 block ml-0.5">
                  Mobile Number
                </label>
                <Input
                  placeholder="Enter Contact Number"
                  value={formData.beneficiaryMobile}
                  onChange={(e) => {
                    setFormData({ ...formData, beneficiaryMobile: formatNumberInput(e.target.value, 10) });
                    if (errors.beneficiaryMobile) setErrors(prev => ({ ...prev, beneficiaryMobile: "" }));
                  }}
                  // className="h-11 rounded-xl bg-white/70 border-slate-200 focus:ring-4 focus:ring-indigo-500/5 outline-none"
                  error={errors.beneficiaryMobile}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col md:flex-row items-center gap-4 border-t border-slate-100">
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="h-11 px-12 rounded-xl w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase tracking-[0.2em] active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
              >
                Confirm Registration <Check size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"                
                onClick={() => navigate(-1)}
                className="h-11 px-10 rounded-xl w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-[0.2em] transition-all w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Banner */}
      <div className="mt-8 px-6 py-5 bg-indigo-50/40 border border-indigo-100/50 rounded-3xl flex items-center gap-4 max-w-[1200px] mx-auto">
        <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-0.5">Automated IMPS Verification</h4>
          <p className="text-[12px] text-slate-500 font-medium">
            This account will be verified via a ₹1 penny drop transaction to ensure validity before activation.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
