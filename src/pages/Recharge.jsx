import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  History,
  ArrowRight,
  Loader2,
  Zap,
  Smartphone,
  IndianRupee,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { TableActions } from "../components/ui/TableExportActions";
import { PageLayout } from "../components/layout/PageLayout";
import { useRef } from "react";
import { cn } from "../lib/utils";
import { containerEntrance } from "../lib/animations";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { DataTable } from "../components/ui/DataTable";
import { toast } from "sonner";
import { checkAssignedService, formatDate, formatNumberInput, formatToINR, handleValidationError, phoneRegex, rejectRequest } from "../utils/helperFunction";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import { MOBILE_OPERATORS } from "../data/recharge-data";
import { usePost } from "../hooks/usePost";
import SuccessAnimation from "../components/SuccessAnimation";
import { fetchWallet } from "../store/slices/walletSlice";
import { useDispatch, useSelector } from "react-redux";
import NoPermission from "./NoPermission";
import { Input } from "../components/ui/Input";
import { LoadingScreen } from "../components/layout/LoadingScreen";
import { Skeleton } from "../components/ui/skeleton";
import RejectedRequest from "./RejectedRequest";
import ReceiptModal from "../modal/RecieptModal";
import StatusBadge from "../components/ui/StatusBadge";
import ClickToCopy from "../components/ui/ClickToCopy";

// --- Assets / Mock Data ---

export default function Recharge() {
  const dispatch = useDispatch()
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [amount, setAmount] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [recentRecharges, setRecentRecharges] = useState([]);
  // const [showSuccess, setShowSuccess] = useState(false);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  // const [receiptData, setReceiptData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [operators, setOperators] = useState([]);
  const [circles, setCircles] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [isTopDescExpanded, setIsTopDescExpanded] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyColumnVisibility, setHistoryColumnVisibility] = useState({});
  const [recieptModalData, setRecieptModalData] = useState({
    title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false
  });

  // console.log(planData, plans)

  // Layout refinement logic
  const [isNarrow, setIsNarrow] = useState(false);
  const [leftCardHeight, setLeftCardHeight] = useState("auto");
  const containerRef = useRef(null);
  const leftCardRef = useRef(null);


  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);


  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        const width = entries[0].contentRect.width;
        // Sidebar + Content Area means we use a smaller threshold for stacking
        const stackingThreshold = 800;
        setIsNarrow(width < stackingThreshold);

        // Height sync: Only whenever they are side-by-side (width >= stackingThreshold)
        if (leftCardRef.current && width >= stackingThreshold) {
          setLeftCardHeight(leftCardRef.current.offsetHeight);
        } else {
          setLeftCardHeight("auto");
        }
      });

      observer.observe(containerRef.current);
      if (leftCardRef.current) observer.observe(leftCardRef.current);

      return () => observer.disconnect();
    }
  }, [isTopDescExpanded, selectedPlan]); // Update height when left-side content changes

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjusted for better balance

  // Calculate pagination values
  const totalPages = Math.ceil((plans?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = (plans || []).slice(startIndex, startIndex + itemsPerPage);

  // Auto-detect operator logic
  useEffect(() => {
    if (mobileNumber.length === 10) {
      detectOperator(mobileNumber);
    } else if (mobileNumber.length < 10) {
      setSelectedOperator(null);
      setAmount("");
      setSelectedPlan(null);
      setPlanData(null);
      setPlans([]);
    }
  }, [mobileNumber]);

  const { refetch: fetchrecentRecharges } = useFetch(
    `${apiEndpoints.recentRecharges}?search=${historySearch}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          console.log(data)
          setRecentRecharges(data.data || []);
        }
      },
      onError: (error) => {
        console.log("error in fetching recent recharges", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );

  useEffect(() => {
    fetchrecentRecharges();
  }, [historySearch]);



  const [errors, setErrors] = useState({});
  const { refetch: fetchCircles } = useFetch(
    `${apiEndpoints.mobileRechargeCircleList}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data.map((item) => {
            return {
              value: item?.circleName,
              label: item?.circleName,
              ...item,
            };
          });
          setCircles(temp);
        }
      },
      onError: (error) => {
        console.log("error in fetching circles data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { refetch: fetchOperators } = useFetch(
    `${apiEndpoints.mobileRechargeOperatorList}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data.data.map((item) => {
            return {
              label: item.operatorName,
              value: item.planFetchValue,
              ...item,
            };
          });
          setOperators(temp);
        }
      },
      onError: (error) => {
        console.log("error in fetching operators data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { refetch: fetchRecharges } = useFetch(
    `${apiEndpoints.fetchRechargePlans}?circleName=${selectedCircle}&operatorCode=${selectedOperator}`,
    {
      onSuccess: (data) => {
        console.log("fetch plannnnnn")
        setIsPlansLoading(false);
        if (data.success) {
          if (data?.data?.plans.length > 0) {
            setPlanData(data?.data?.plans);
            const tempCategories = data?.data?.plans?.map(
              (item) => item.categories,
            );

            setCategories([...new Set(tempCategories)]);
            setSelectedCategory(tempCategories?.[0]);
          } else {
            setPlanData(data?.data?.plans);
            setCategories([]);
            setSelectedCategory("");
            setPlans([]);
          }
        }
      },
      onError: (error) => {
        setIsPlansLoading(false);
        console.log("error in fetching recharge data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsDetecting(false);
      },
    },
    false,
  );

  const tableColumns = [
    {
      accessorKey: "price",
      header: "Plan Detail",
      cell: ({ row }) => {
        const plan = row.original;
        const isSelected = amount === plan.price;
        return (
          <div className="flex flex-col gap-1 py-1">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full self-start w-fit",
              isSelected ? "bg-indigo-600 text-white shadow-sm" : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            )}>
              {plan.category || "Standard"}
            </span>
            <span className="text-[13px] font-bold text-slate-800 tracking-tight">₹{plan.price} Plan</span>
          </div>
        );
      }
    },
    {
      accessorKey: "validity",
      header: "Validity",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[12px] font-bold text-slate-700">{row.original.validity}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Duration</span>
        </div>
      )
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const id = row.original.price + row.id;
        const isExpanded = expandedPlanId === id;
        return (
          <div className="py-2 w-full max-w-[200px] sm:max-w-[300px] lg:max-w-[400px]">
            <p
              onClick={() => setExpandedPlanId(isExpanded ? null : id)}
              className={cn(
                "text-[10.5px] font-medium text-slate-500 leading-relaxed italic cursor-pointer transition-all duration-300 hover:text-indigo-500",
                !isExpanded ? "line-clamp-2" : "line-clamp-none"
              )}
            >
              {row.original.description}
            </p>
          </div>
        );
      }
    },
    {
      id: "action",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => {
        const isSelected = amount === row.original.price;
        return (
          <div className="flex justify-center py-2">
            <button
              onClick={() => { setAmount(row.original.price); setSelectedPlan(row.original); }}
              className={cn(
                "h-9 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                isSelected
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105"
                  : "bg-slate-50 text-slate-600 hover:bg-indigo-600 hover:text-white border border-slate-200/60"
              )}
            >
              {isSelected ? "Selected" : "Select Plan"}
            </button>
          </div>
        );
      }
    }
  ];

  const columns = [
    {
      header: "SR. NO.",
      id: "srNo",
      center: true,
      nowrap: true,
      cell: ({ row, index }) => (
        <span className="text-[12px] font-medium text-slate-500">
          {index + 1}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      center: true,
      nowrap: true,
      cell: ({ row }) => (
        <div className="text-[12px] text-slate-700 whitespace-nowrap">{formatDate(row.original.createdAt)}</div>

      )
    },
    {
      header: "REFERENCE ID",
      accessorKey: "referenceId",
      center: true,
      cell: ({ row }) => (
        <ClickToCopy text={row.original.referenceId} className="bg-indigo-50/50 px-2 whitespace-nowrap py-1 rounded-lg border border-indigo-100/50">
          <span className="text-[11px] font-bold text-indigo-600 font-mono tracking-tight">
            {row.original.referenceId}
          </span>
        </ClickToCopy>
      )
    },
    {
      accessorKey: "mobileNumber",
      header: "Mobile Number",
      center: true,
      nowrap: true,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1.5 font-mono">
          <span className="text-[12px] font-bold text-slate-800 tracking-tight">{row.original.mobileNumber}</span>
        </div>
      )
    },
    {
      accessorKey: "operatorName",
      header: "Operator",
      center: true,
      nowrap: true,
      cell: ({ row }) => (
        <span className="text-[11px]  text-slate-600 tracking-tight uppercase">{row.original.operatorName}</span>
      )
    },
    {
      accessorKey: "amount",
      header: "Amount",
      center: true,
      nowrap: true,
      cell: ({ row }) => (
        <span className="text-[12px]  text-slate-900 tracking-tight">{formatToINR(row.original.amount)}</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      center: true,
      nowrap: true,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <StatusBadge status={row.original.status} />
        </div>
      )
    }
  ];

  useEffect(() => {
    if (selectedCircle && selectedOperator) {
      setIsPlansLoading(true);
      fetchRecharges();
    }
  }, [selectedCircle, selectedOperator, fetchRecharges]);

  const { refetch: mobileRechargeVerify } = useFetch(
    `${apiEndpoints.mobileRechargeVerify}/${mobileNumber}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          if (data.data) {
            setSelectedCircle(data?.data?.state);
            setSelectedOperator(data?.data?.operatorCode);
            setErrors((prev) => {
              let temp = { ...prev };
              delete temp.operator;
              return temp;
            });
            setPlanData(data?.data?.plans);
            const tempCategories = data?.data?.plans?.map(
              (item) => item.categories,
            );
            setCategories([...new Set(tempCategories)]);
            setSelectedCategory(tempCategories?.[0]);
          }

          setIsDetecting(false);
          setIsPlansLoading(false);
        }
      },
      onError: (error) => {
        console.log("error in fetching mobile recharge verify", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsDetecting(false);
      },
    },
    false,
  );

  const detectOperator = async (number) => {
    setIsPlansLoading(true);
    mobileRechargeVerify();
    setIsDetecting(true);
  };

  useEffect(() => {
    if (selectedCategory) {
      const temp = planData.filter(
        (item) => item.categories === selectedCategory,
      );
      console.log(temp, "useEffect")
      setPlans(temp?.[0]?.plan || []);
      setCurrentPage(1); // Reset to first page when category changes
    }
  }, [selectedCategory]);

  const { post: handleDoRecharge } = usePost(apiEndpoints.doRecharge, {
    onSuccess: (res) => {
      console.log(res, "handle rechange done ");

      setIsLoading(false);
      setRecieptModalData({
        title: "Recharge Successful",
        // date: res?.data?.timestamp,
        subTitleLabel: "Amount",
        subTitleValue: formatToINR(amount),
        receiptData: {
          "Mobile Number": mobileNumber || "",
          "Operator": selectedOperator || "",
          "Circle": selectedCircle || "",
          status: "Transaction Successful"
        },
        isOpen: true
      });

      // const newReceipt = {
      //   id: res?.data?.txn_ref,
      //   amount: amount,
      //   number: mobileNumber,
      //   operator: selectedOperator,
      //   circle: selectedCircle,
      //   date: new Date().toLocaleString("en-US", {
      //     day: "numeric",
      //     month: "short",
      //     year: "numeric",
      //     hour: "2-digit",
      //     minute: "2-digit",
      //   }),
      //   status: "Success",
      //   paymentMode: "Wallet",
      // };

      // // Show Success Animation first
      // setShowSuccess(true);
      // setReceiptData(newReceipt);
      toast.success(res.message || "Recharge successfully done");
      fetchrecentRecharges();
      dispatch(fetchWallet());
      // setShowSuccess(false);
    },
    onError: (error) => {
      console.error("Failed to recharge", error);
      toast.error(handleValidationError(error) || "Something went wrong");
      setIsLoading(false);
    },
  });

  const handleRecharge = () => {
    // Clear previous errors and validate
    setErrors({});
    const newErrors = {};

    // 1. Operator Validation
    if (!selectedOperator) {
      newErrors.operator = "Please select an Operator";
    }
    // 2. Amount Validation
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    // 3. Input validation based on Active Tab
    if (!mobileNumber) {
      newErrors.input = `Please enter Mobile Number`;
    } else {
      if (!phoneRegex.test(mobileNumber)) {
        newErrors.input = "Invalid mobile (10 digits, starts with 6-9)";
      }
    }

    // If there are errors, show them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill mobile number and valid amount before proceeding");
      return;
    }

    const operatorCode = operators.find(
      (item) => item.planFetchValue === selectedOperator,
    ).rechargeValue;

    if (!operatorCode) {
      toast.error("Please select an Operator/Bank/Board");
      return;
    }
    setIsLoading(true);
    handleDoRecharge({
      amount: amount,
      operatorCode: operatorCode,
      number: mobileNumber,
      billerMode: "prepaidrecharge",
    });



  };



  const handleAmountforSeletedPlan = (amount) => {
    if (mobileNumber, selectedOperator, selectedCircle) {

      const tempPlan = planData.map((item) => item.plan).flat();
      const tempSelectedPlan = tempPlan.filter((item) => {
        if (item.price == amount) return item
      })

      setSelectedPlan(tempSelectedPlan[0])
    }
  }

  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="Mobile Recharge"
        subtitle="Select a plan and enter details for instant processing"

        className="max-w-[1600px] mx-auto py-4"
      >
        <div className="flex flex-col gap-8 md:gap-11">
          {/* Main Grid Skeleton */}
          <div className="grid gap-4 items-start relative grid-cols-1 md:grid-cols-12">

            {/* Left Column Skeleton */}
            <div className="md:col-span-4 xl:col-span-4">
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-7">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-xl" />
                </div>

                {/* Form Fields Skeleton */}
                <div className="space-y-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-11 w-full rounded-xl" />
                    </div>
                  ))}

                  {/* Submit Button Skeleton */}
                  <Skeleton className="h-11 w-full rounded-xl mt-2" />
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="md:col-span-8 xl:col-span-8">
              <div className="rounded-[2rem] shadow-sm border border-indigo-200/60 bg-gradient-to-tr from-white via-white to-indigo-50/40 h-full">
                {/* Header Skeleton */}
                <div className="p-6 md:px-6 md:py-4 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <Skeleton className="h-8 w-40" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-10 w-80 rounded-full" />
                  </div>
                </div>

                {/* Table Header Skeleton */}
                <div className="grid grid-cols-[1.2fr_0.8fr_2.5fr_0.8fr] px-8 py-4 border-b border-slate-100">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-3 w-20" />
                  ))}
                </div>

                {/* Table Rows Skeleton */}
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-[1.2fr_0.8fr_2.5fr_0.8fr] items-center gap-8">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History Skeleton */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-1.5 h-6 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>

            {/* History Table Skeleton */}
            <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-sm p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-4">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (rejectRequest("recharge1", profile?.requestedService)) return (<RejectedRequest service="recharge" pipeline="recharge1" />)
  if (!checkAssignedService("recharge", "recharge1", profile?.assignedServices)) return (<NoPermission service="recharge" pipeline="recharge1" />)
  return (
    <PageLayout
      title="Mobile Recharge"
      subtitle="Select a plan and enter details for instant processing"

      className="max-w-[1600px] mx-auto py-4"
    >
      <div ref={containerRef} className="flex flex-col gap-8 md:gap-11">

        {/* Main Grid: Dynamically stacks for narrow content areas (e.g. 1362px with sidebar) */}
        <div className={cn(
          "grid gap-4 items-start relative",
          isNarrow ? "grid-cols-1" : "grid-cols-1 md:grid-cols-12"
        )}>

          <div className={cn(
            isNarrow ? "w-full max-w-2xl mx-auto" : "md:col-span-4 xl:col-span-4"
          )}>
            <motion.div
              ref={leftCardRef}
              {...containerEntrance}
              className="bg-white rounded-[2rem] shadow-sm border border-slate-200/80 p-6 md:p-8 space-y-7 h-fit flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recharge Details</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter details to proceed</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/5 text-indigo-600 flex items-center justify-center border border-indigo-500/10 transition-all hover:scale-105 shadow-sm">
                  <Zap size={20} fill="currentColor" className="opacity-80" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5 md:gap-x-6 lg:gap-5">
                {/* Mobile Number Input */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                    Mobile Number
                  </label>
                  <div className="relative group flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center gap-2 pl-4 pr-3 border-r border-slate-200 transition-colors group-focus-within:border-indigo-500/30 bg-slate-50/50 rounded-l-xl">
                      <Smartphone size={16} className={cn("transition-colors", mobileNumber ? "text-indigo-500" : "text-slate-400")} />
                      <span className="text-sm font-black text-slate-400 select-none">+91</span>
                    </div>
                    <input

                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setMobileNumber(val);
                        if (errors.input) setErrors({ ...errors, input: "" });
                      }}
                      error={errors.mobileNumber}
                      placeholder="Mobile Number"
                      className={cn(
                        "w-full h-11 bg-slate-50/50 border border-slate-200 rounded-xl pl-24 pr-12 text-sm font-bold tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 hover:border-slate-300",
                        errors.mobile && "border-red-500 ring-4 ring-red-500/5",
                        mobileNumber && "bg-white border-slate-300"
                      )}
                    />

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {isDetecting && <Loader2 className="animate-spin text-indigo-500" size={16} />}
                      {mobileNumber.length === 10 && !isDetecting && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                          <CheckCircle2 size={18} strokeWidth={3} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  {errors.input && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.input}</p>}
                </div>

                {/* Service Provider */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                    Select Operator
                  </label>
                  <div className="relative">
                    <Select
                      placeholder="Select Operator"
                      options={operators}
                      value={selectedOperator}
                      onChange={(val) => {
                        setSelectedOperator(val);
                        if (errors.operator) setErrors({ ...errors, operator: "" });
                      }}
                    />
                  </div>
                </div>

                {/* Circle / State */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                    Circle / State
                  </label>
                  <div className="relative">
                    <Select
                      placeholder="Select Circle"
                      searchable={true}
                      options={circles}
                      value={selectedCircle}
                      onChange={(val) => setSelectedCircle(val)}
                    />
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 ml-1">
                    Recharge Amount (₹)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-600">₹</div>
                    <input
                      onWheel={(e) => e.target.blur()}
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(formatNumberInput(e.target.value, 8));
                        if (errors.amount) setErrors({ ...errors, amount: "" });
                        else {
                          handleAmountforSeletedPlan(e.target.value)
                        }
                      }}
                      placeholder="0.00"
                      className={cn(
                        "w-full h-11 pl-9 pr-4 border rounded-xl text-sm font-bold tracking-tight text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all bg-slate-50/30 placeholder:text-slate-200 hover:border-slate-300",
                        amount && "bg-white border-slate-300",
                        errors.amount ? "border-red-500 ring-4 ring-red-500/5" : "border-slate-200"
                      )}
                    />
                  </div>
                  {errors.amount && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-1">{errors.amount}</p>}
                </div>

                {selectedPlan?.description && (
                  <p
                    onClick={() => setIsTopDescExpanded(!isTopDescExpanded)}
                    className={cn(
                      "text-[10px] text-green-600 cursor-pointer font-semibold",
                      isTopDescExpanded ? "line-clamp-none" : "line-clamp-2"
                    )}
                  >
                    {selectedPlan.description}
                  </p>
                )}

                {/* Submit Button */}
                <div className="md:col-span-2 lg:col-span-1 mt-2">
                  <Button
                    onClick={handleRecharge}
                    isLoading={isLoading}
                    disabled={isLoading || isDetecting || !amount || !selectedCircle || !selectedOperator || !mobileNumber}
                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] uppercase tracking-[0.2em]  transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                  >
                    Proceed to Pay
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Plans Browser */}
          <div
            className={cn(
              isNarrow ? "w-full" : "md:col-span-8 xl:col-span-8",
              "flex flex-col"
            )}
            style={{ height: !isNarrow ? leftCardHeight : "auto" }}
          >
            {/* Plans Section - Premium DataTable UI */}
            <div className=" rounded-[2rem] shadow-sm flex border border-indigo-200/60 bg-gradient-to-tr from-white via-white to-indigo-50/40 flex-col h-full overflow-hidden">
              {/* Header with Title & Filters */}
              <div className="p-6 md:px-6 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 bg-gradient-to-tr from-white to-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Standard Offers</h3>
                    {/* {isPlansLoading && <Loader2 size={16} className="animate-spin text-indigo-500" />} */}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing plans for {selectedOperator || "Operator"} - {selectedCircle || "Circle"}
                  </p>
                </div>

                {/* Category Filter Pills (Optimized) */}
                {categories.length > 0 && (
                  <div className="flex items-center gap-1 p-1 bg-slate-50/50 rounded-full border border-slate-100 shadow-sm mt-4 sm:mt-0">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                        className={cn(
                          "relative px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center min-w-[120px]",
                          selectedCategory === cat ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {selectedCategory === cat && (
                          <motion.div
                            layoutId="activeTabPill"
                            className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-100/50 z-0"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10">{cat}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabular Plans Section (Optimized from Screenshot) */}
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                {/* Header Row */}
                <div className="grid grid-cols-[1.2fr_0.8fr_2.5fr_0.8fr] px-8 py-4 border-b border-slate-100 bg-slate-50/20">
                  {["PLAN DETAIL", "VALIDITY", "DESCRIPTION", "ACTION"].map((header) => (
                    <span key={header} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {header}
                    </span>
                  ))}
                </div>

                {/* Data Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {isPlansLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
                      <LoadingScreen variant="inline" message="Fetching Plans" subtitle="Please wait..." className="w-10 h-10" />
                      {/* <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" /> */}
                    </div>
                  ) : plans.length > 0 ? (
                    <div className="flex flex-col">
                      {currentPlans.map((plan, idx) => {
                        const isSelected = amount == plan.price;
                        return (
                          <motion.div
                            key={idx}
                            className={cn(
                              "grid grid-cols-[1.2fr_0.8fr_2.5fr_0.8fr] items-center px-8 py-6 border-b border-slate-50 group hover:bg-slate-50/30 transition-all",
                              isSelected && "bg-indigo-50/20"
                            )}
                          >
                            {/* Plan Detail */}
                            <div className="flex flex-col gap-2">
                              <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                                ₹{plan.price} Plan
                              </h4>
                            </div>

                            {/* Validity */}
                            <div className="text-[13px] font-bold text-slate-600">
                              {plan.validity}
                            </div>

                            {/* Description (Expandable) */}
                            <div
                              className="pr-8 cursor-pointer group/desc"
                              onClick={() => setExpandedPlanId(expandedPlanId === idx ? null : idx)}
                            >
                              <p className={cn(
                                "text-[12px] font-medium italic text-slate-500 leading-relaxed font-sans group-hover/desc:text-slate-800",
                                expandedPlanId === idx ? "line-clamp-none" : "line-clamp-3"
                              )}>
                                {plan.description}
                              </p>
                            </div>

                            {/* Action */}
                            <div>
                              <button
                                onClick={() => { setAmount(plan.price); setSelectedPlan(plan); }}
                                className={cn(
                                  "w-fit px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                  isSelected
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                )}
                              >
                                {isSelected ? "SELECTED" : "SELECT"}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 py-20">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                        <Search size={32} />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-widest">No Active Offers</h3>
                    </div>
                  )}
                </div>
              </div>

              {/* Minimal Pagination Footer */}
              {!isPlansLoading && plans.length > itemsPerPage && (
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    P. <span className="text-slate-900">{currentPage}</span> / {totalPages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BELOW THE MAIN GRID: Recent Recharges Section (Full Width) */}
        <motion.div layout className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">Transaction History</h3>
            </div>

          </div>
          <DataTable
            searchValue={historySearch}
            searchChange={(e) => setHistorySearch(e.target.value)}
            searchPlaceholder="Search history..."
            fileName="recharge_history"
            columns={columns}
            data={recentRecharges}
            isLoading={false}
            hidePagination={true}
            columnVisibility={historyColumnVisibility}
            setColumnVisibility={setHistoryColumnVisibility}
          />
        </motion.div>
      </div>

      {recieptModalData.isOpen && (

        <ReceiptModal
          title={recieptModalData.title}
          // date={recieptModalData.date}
          subTitleLabel={recieptModalData.subTitleLabel}
          subTitleValue={recieptModalData.subTitleValue}
          receiptData={recieptModalData.receiptData}
          onClose={() => {
            setRecieptModalData({ title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false });
            setSelectedCircle("");
            setAmount("");
            setSelectedOperator("");
            setMobileNumber("");
            setSelectedPlan(null);
            setErrors({});
          }}
        />
      )}


    </PageLayout>
  );
}
