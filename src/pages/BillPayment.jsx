import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  MoveLeft,
  Loader2,
  ArrowRight,
  Search,
  Info,
  ChevronRight,
  Shield,
  LayoutGrid,
  Clock,
  Target,
  Receipt,
  ChevronDown,
  Smartphone,
  User,
  IndianRupee,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { PageLayout } from "../components/layout/PageLayout";
import { apiEndpoints } from "../api/apiEndpoints";
import { useFetch } from "../hooks/useFetch";
import { usePost } from "../hooks/usePost";
import { toast } from "sonner";
import { checkAssignedService, formatDecimalNumberInput, formatNameInputWithSpace, formatNumberInput, handleValidationError, rejectRequest } from "../utils/helperFunction";

// New Components
import { CategoryFilter } from "../components/bill-payment/CategoryFilter";
import { ServiceGrid } from "../components/bill-payment/ServiceGrid";
import { BillerSelect } from "../components/bill-payment/BillerSelect";
import { BillReceipt } from "../components/bill-payment/BillReceipt";
import { useDispatch, useSelector } from "react-redux";
import NoPermission from "./NoPermission";
import { fetchWallet } from "../store/slices/walletSlice";
import RejectedRequest from "./RejectedRequest";
import { Input } from "../components/ui/Input";

export default function BillPayment() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [billers, setBillers] = useState([]);
  const [billerFields, setBillerFields] = useState([]);
  const [billerInfo, setBillerInfo] = useState({});
  const [bill, setBill] = useState({});
  const [showBillReceipt, setShowBillReceipt] = useState(false);
  const [isBillValidated, setIsBillValidated] = useState(false);
  const [isValidateMandatory, setIsValidateMandatory] = useState(false);

  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isButtonDisable, setIsButtonDisable] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [SelectedServiceIcon, setSelectedServiceIcon] = useState(null);
  const [selectedBiller, setSelectedBiller] = useState(null);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingBillers, setIsLoadingBillers] = useState(false);
  const [isLoadingBillerField, setIsLoadingBillerField] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({ billerId: null, inputParams: [] });
  const [billValidateData, setBillValidateData] = useState({ billerId: null, paramName: "", paramValue: "" });
  const [visibleCount, setVisibleCount] = useState(12);

  const dispatch = useDispatch();
  const { data: profile, error: profileError } = useSelector((state) => state.profile);
  const [recieptModalData, setRecieptModalData] = useState({
    title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false
  });


  const handleBack = () => {
    setIsValidateMandatory(false);
    setIsBillValidated(false);
    setSelectedService(null);
    setSelectedBiller(null);
    setBill(null);
    setShowBillReceipt(false);
    setBillValidateData({});
    setFormData({ billerId: null, inputParams: [] });
    setBillerFields([]);
    setBillerInfo({});
    setCustomerMobile("");
    setCustomerName("");
    setIsButtonDisable(true);
    setVisibleCount(12);
  };

  // --- DATA FETCHING (LOGIC UNTOUCHED) ---
  const { refetch: fetchBbpsCategories } = useFetch(apiEndpoints.bbpsCategories, {
    onSuccess: (data) => {
      if (data.success && data.data) {
        const uniqueGroups = [...new Set(data.data.map((item) => item.group))];
        setCategories(["all", ...uniqueGroups]);
        setServices(data.data);
        setIsLoadingInitial(false);
      }
    },
    onError: (err) => {
      toast.error(handleValidationError(err) || "Failed to load services");
      setIsLoadingInitial(false);
    },
  }, true);

  const { refetch: fetchBbpsBillers } = useFetch(`${apiEndpoints.bbpsBillers}?category=${selectedService?.name}`, {
    onSuccess: (data) => {
      if (data.success) setBillers(data.data);
      setIsLoadingBillers(false);
    },
    onError: (err) => {
      toast.error(handleValidationError(err) || "Failed to load billers");
      setIsLoadingBillers(false);
    },
  }, false);

  const { refetch: fetchBbpsBillerFieldInfo } = useFetch(`${apiEndpoints.bbpsBillerFieldInfo}?billerId=${selectedBiller?.billerId}`, {
    onSuccess: (data) => {
      if (data?.success && data?.data) {
        setIsButtonDisable(false)
        let paramInfo = data.data.biller?.billerInputParams?.paramInfo;
        if (paramInfo && !Array.isArray(paramInfo)) paramInfo = [paramInfo];

        const isMandatory = data.data.biller?.billerSupportBillValidation === "MANDATORY";
        setIsValidateMandatory(isMandatory);
        setBillerInfo(data.data.biller);
        setBillerFields(paramInfo || []);

        // Initialize state with the first paramName for API compatibility
        const firstParamName = paramInfo?.[0]?.paramName || "";
        setFormData({
          billerId: selectedBiller.billerId,
          inputParams: paramInfo?.map(pi => ({ paramName: pi.paramName, paramValue: "" })) || [],
          paramName: firstParamName,
          paramValue: ""
        });
        setBillValidateData({
          billerId: selectedBiller.billerId,
          paramName: firstParamName,
          paramValue: ""
        });
      }
      setIsLoadingBillerField(false);
    },
    onError: (err) => {
      toast.error(handleValidationError(err) || "Failed to get biller details");
      setIsLoadingBillerField(false);
    },
  }, false);

  const { post: fetchBill, isLoading: isFetchingBill } = usePost(apiEndpoints.fetchBbpsBill, {
    onSuccess: (data) => {
      console.log(data, "fetch bill api called")
      if (data?.success) {
        setBill(data.data);
        setShowBillReceipt(true)
        setCustomerName(data?.data?.data?.billerResponse?.customerName || "")
        setIsLoadingInitial(false);
      }
    },
    onError: (err) => toast.error(handleValidationError(err) || "Could not fetch bill details"),
  });

  const { post: validateBill, isLoading: isValidatingBill } = usePost(apiEndpoints.validateBbpsBill, {
    onSuccess: (data) => {
      if (data?.success) {
        setIsBillValidated(true)
        setFormData((prev) => ({ ...prev, billValidate: data.data }));

      };
    },
    onError: (err) => toast.error(handleValidationError(err) || "Bill verification failed"),
  });

  const { post: payBill, isLoading: isPayingBill } = usePost(apiEndpoints.payBbpsBill, {
    onSuccess: (data) => {
      if (data?.success) {
        console.log(data, "payment response")
        toast.success("Bill Payment Successful!");
        const selectedCategoryName = selectedService?.name;
        setRecieptModalData({
          title: "Transaction Successful",
          // date: res?.data?.timestamp,
          subTitleLabel: "Amount",
          subTitleValue: formatToINR(bill?.amount),
          receiptData: {
            "Bill No.": data?.data?.billNumber || "",
            "Customer Mobile": customerMobile || "",
            "Service": selectedCategoryName || "",
            "Transaction Id": res?.data?.txnid || "",
            status: "Transaction Successful"
          },
          isOpen: true
        });

        dispatch(fetchWallet());
      }
    },
    onError: (err) => {
      setSelectedBiller(null)
      setCustomerMobile("")
      setBill(null)
      setIsBillValidated(false)
      setShowBillReceipt(false)
      setBillValidateData({});
      setFormData({ billerId: null, inputParams: [] });
      setBillerFields([]);
      setBillerInfo({});
      toast.error(handleValidationError(err) || "Payment processing failed")
    },
  });

  useEffect(() => {
    if (selectedService) {
      setIsLoadingBillers(true);
      fetchBbpsBillers();
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedBiller?.billerId) {
      setIsLoadingBillerField(true);
      setBill(null);
      setIsBillValidated(false);
      fetchBbpsBillerFieldInfo();
      setIsButtonDisable(true)
    }
  }, [selectedBiller]);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, searchQuery]);

  // --- HANDLERS (LOGIC UNTOUCHED) ---
  const handleInputChange = (paramName, value) => {
    setBill(null);
    setIsBillValidated(false);

    setFormData(prev => {
      const nextParams = [...(prev.inputParams || [])];
      const idx = nextParams.findIndex(p => p.paramName === paramName);
      if (idx > -1) nextParams[idx] = { ...nextParams[idx], paramValue: value };
      else nextParams.push({ paramName, paramValue: value });

      const primary = nextParams[0] || {};
      return {
        ...prev,
        inputParams: nextParams,
        paramName: primary.paramName,
        paramValue: primary.paramValue,
        [paramName]: value
      };
    });

    setBillValidateData(prev => ({
      ...prev,
      [paramName]: value,
      paramName: formData.paramName || paramName,
      paramValue: value
    }));
  };
  console.log("refIdddd", bill?.refid)
  console.log("customer nameeeee", customerName)

  const handleBillPay = (e) => {
    if (e) e.preventDefault();
    if (!customerMobile || customerMobile.length < 10) {
      toast.error("Valid customer mobile is required");
      return;
    }
    if (!bill?.amount || Number(bill.amount) <= 0) {
      toast.error("Valid bill amount is required");
      return;
    }
    const billAmount = Number(bill?.amount ?? 0) * 100;
    payBill({
      ...bill,
        ...(bill?.data?.billerResponse || {}),
      billAmount: billAmount,
      customerName: customerName,
      billerId: selectedBiller?.billerId,
      customerMobile: customerMobile,
      refid: formData?.billValidate?.refid || bill?.refid,
      placeholderValue: formData?.paramName || formData?.inputParams?.[0]?.paramName,
      paramValue: formData?.paramValue || formData?.inputParams?.[0]?.paramValue,
      amount: billAmount,
    });
  };

  const handleBillFetch = (e) => {
    e?.preventDefault();

    // Check if all required fields are filled
    const emptyFields = formData.inputParams.filter(param => !param.paramValue?.trim());

    if (emptyFields.length > 0) {
      toast.error("Please fill all required fields");
      return;
    }

    fetchBill(formData);
  };


  const handleBillValidate = (e) => {
    e?.preventDefault();
    const payload = {
      ...formData,
      billerId: selectedBiller.billerId,
      paramName: formData.paramName || formData.inputParams?.[0]?.paramName,
      paramValue: formData.paramValue || formData.inputParams?.[0]?.paramValue,
      ...Object.fromEntries(formData.inputParams.map(p => [p.paramName, p.paramValue]))
    };
    validateBill(payload);
  };

  const allFilteredServices = (selectedCategory === "all" ? services : services.filter(s => s.group === selectedCategory))
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredServices = allFilteredServices.slice(0, visibleCount);
  if (rejectRequest("bbps1", profile?.requestedService)) return (<RejectedRequest service="bbps" pipeline="bbps1" />)
  if (!checkAssignedService("bbps", "bbps1", profile?.assignedServices)) return (<NoPermission service="bbps" pipeline="bbps1" />)
  return (
    <PageLayout
      title={
        !selectedService ? "Bharat Bill Payment System (BBPS)" : (
          <div className="flex flex-col md:flex-row items-center gap-3">
            <span>{selectedService.name}</span>
            <span className="text-[9px] font-black tracking-widest px-3 py-1 bg-indigo-50 text-indigo-500 rounded-full border border-indigo-100 shadow-sm mt-1 md:mt-0 uppercase">CONFIGURE DETAIL</span>
          </div>
        )
      }
      subtitle={!selectedService ? "Secure BBPS Utility Services" : "Secure Gateway • Encrypted Node"}
      showBackButton={!!selectedService}
      onBack={handleBack}
      actions={
        !selectedService ? (
          <div className="relative group w-full md:w-80">
            {/* <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} /> */}
            <Input
              icon={Search}
              type="text"
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(formatNameInputWithSpace(e.target.value, 50))}
            />
          </div>
        ) : null
      }
    >
      <AnimatePresence mode="wait">
        {!selectedService ? (
          <motion.div
            key="main-explorer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Categorization & Grid */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <ServiceGrid
              services={filteredServices}
              onSelect={(s, Icon) => { setSelectedService(s); setSelectedServiceIcon(Icon); }}
              isLoading={isLoadingInitial}
            />

            {allFilteredServices.length > visibleCount && (
              <div className="flex flex-col items-center gap-3 pt-6 pb-2">
                <Button
                  variant="outline"
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="h-11 px-8 rounded-full border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center gap-2 group shadow-sm bg-white"
                >
                  Show More Providers
                  <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                </Button>
              </div>
            )}

            {/* Info Footer Card */}
            <div className="pt-6 border-t border-indigo-50">
              <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 border border-slate-100/50 flex flex-col md:flex-row items-center gap-6 shadow-sm relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-50/50 rounded-full blur-3xl" />
                <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 shrink-0 relative z-10">
                  <Target size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left relative z-10">
                  <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase">Trusted Payment Node</h4>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Certified by BBPS for secure real-time settlements.</p>
                </div>
                <Button
                  onClick={() => navigate("/transaction-report/bbps")}
                  className="relative z-10 h-12 px-6 bg-indigo-600 text-white rounded-xl text-[10px]  uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                >
                  View Pay History
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="service-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Left Column: Form Section */}
              <div className="flex-1 space-y-3 w-full flex flex-col pt-0">
                <div className="bg-gradient-to-tr from-white via-white to-indigo-50/40 rounded-[2rem] p-5 sm:p-7 border border-indigo-100/60 shadow-sm space-y-8 flex-1 relative group">
                  {/* Decorative Icon */}
                  <div className="absolute right-[-20px] top-[-20px] opacity-[0.05] blur-md pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <SelectedServiceIcon size={200} strokeWidth={0.5} className="text-indigo-600" />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pb-8 border-b border-slate-200/50 relative z-10 text-center sm:text-left">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-600/10 text-white relative z-10 bg-indigo-600 ring-4 ring-slate-50",
                    )}>
                      <SelectedServiceIcon size={22} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">{selectedService.name} Payment</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-80 leading-none">Enter details below to fetch live bill</p>
                    </div>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <BillerSelect
                      label="Select Provider"
                      placeholder="Choose your provider..."
                      options={billers}
                      value={selectedBiller}
                      onChange={setSelectedBiller}
                      isLoading={isLoadingBillers || isLoadingBillerField}
                    />

                    <AnimatePresence mode="wait">
                      {selectedBiller && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="space-y-8"
                        >
                          <div className="grid grid-cols-1 gap-6">
                            {billerFields.map((field) => {
                              const val = isValidateMandatory ? (billValidateData[field.paramName] || "") : (formData.inputParams.find(p => p.paramName === field.paramName)?.paramValue || "");
                              return (
                                <div key={field.paramName} className="space-y-2.5">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    {field.paramName} {field.isOptional === "false" && <span className="text-red-500">*</span>}
                                  </label>
                                  <div className="relative group">
                                    <Input
                                      icon={ArrowRight}
                                      type="text"
                                      value={val}
                                      onChange={(e) => handleInputChange(field.paramName, e.target.value)}
                                      placeholder={`Enter ${field.paramName}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>


                          <div className="pt-4">
                            {isBillValidated ? (
                              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-50/20 p-8 rounded-[2rem] border-2 border-dashed border-indigo-100 space-y-3">
                                <Input
                                  icon={IndianRupee}
                                  label="Payment Amount (INR)"
                                  value={bill?.amount || ""}
                                  onChange={(e) => setBill({ ...bill, amount: formatDecimalNumberInput(e.target.value, 7) })}
                                  placeholder="0.00"
                                />
                                <div className="relative group">
                                  <Input
                                    icon={Smartphone}
                                    label="Customer Number"
                                    type="text"
                                    maxLength={10}
                                    value={customerMobile}
                                    onChange={(e) => setCustomerMobile(formatNumberInput(e.target.value, 10))}
                                    placeholder="Customer Number"
                                  />
                                </div>
                                <div className="relative group">
                                  <Input
                                    icon={User}
                                    label="Customer Name"
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(formatNameInputWithSpace(e.target.value, 100))}
                                    placeholder="Customer Name"
                                  />
                                </div>
                                <Button
                                  disabled={!bill?.amount || Number(bill.amount) <= 0 || !customerMobile || customerMobile.length < 10 || !customerName?.trim() || isPayingBill}
                                  onClick={handleBillPay}
                                  className="w-full  rounded-xl bg-indigo-600 hover:bg-indigo-700 border-none text-white font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-98 transition-all"
                                >
                                  {isPayingBill ? <Loader2 className="animate-spin" size={20} /> : "Complete Transaction"}
                                </Button>
                              </motion.div>
                            ) : (
                              <Button
                                disabled={isLoadingBillers || isLoadingBillerField || isFetchingBill || isValidatingBill || isButtonDisable}
                                onClick={billerInfo?.billerFetchRequiremet === "MANDATORY" ? handleBillFetch : handleBillValidate}
                                className="w-full h-12.5 rounded-xl bg-indigo-600 hover:bg-indigo-600 border-none text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 active:scale-98 transition-all group"
                              >
                                {(isFetchingBill || isValidatingBill) ? (
                                  <Loader2 className="animate-spin" size={20} />
                                ) : (
                                  <>
                                    {billerInfo?.billerFetchRequiremet === "MANDATORY" ? "Process Live Bill" : "Verify Information"}
                                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right Column: Receipt Section */}
              {
                showBillReceipt &&
                <div className="w-full lg:w-[440px] lg:sticky lg:top-4 self-start">
                  <BillReceipt
                    bill={bill}
                    customerMobile={customerMobile}
                    setCustomerMobile={setCustomerMobile}
                    setBill={setBill}
                    isPaying={isPayingBill}
                    onPay={handleBillPay}
                  />
                </div>
              }
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {recieptModalData.isOpen && (

        <ReceiptModal
          title={recieptModalData.title}
          // date={recieptModalData.date}
          subTitleLabel={recieptModalData.subTitleLabel}
          subTitleValue={recieptModalData.subTitleValue}
          receiptData={recieptModalData.receiptData}
          onClose={() => {
            setRecieptModalData({ title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false });
            handleBack()
          }}
        />
      )}
    </PageLayout>
  );
}
