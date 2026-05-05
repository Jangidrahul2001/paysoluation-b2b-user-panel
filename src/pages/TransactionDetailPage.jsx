import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Share2,
  Calendar,
  User,
  Smartphone,
  ShieldCheck,
  Activity,
  FileText,
  CreditCard,
  Zap,
  Tag,
  Layers,
  Microscope,
  Info,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  Cpu,
  Globe,
  Monitor,
  Search,
  IndianRupee,
  Copy,
  CreditCardIcon,
  IndianRupeeIcon,
  FunctionSquare,
  History,
  Phone,
  Mail,
  Hash,
  PhoneCall
} from "lucide-react";
import { PageLayout } from "../components/layout/PageLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Skeleton } from "../components/ui/skeleton";
import ReceiptModal from "../modal/RecieptModal";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import { formatDate, formatToINR, handleValidationError, } from "../utils/helperFunction";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DataTable } from "../components/ui/DataTable";

// --- Skeleton Components ---

const MetricCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-2xl p-5 bg-slate-100">
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="w-3 h-3 rounded" />
        <Skeleton className="h-2 w-16" />
      </div>
      <div>
        <Skeleton className="h-6 w-20 mb-1" />
        <Skeleton className="h-2 w-24" />
      </div>
    </div>
  </div>
);

const DetailItemSkeleton = () => (
  <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border border-slate-100">
    <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg" />
    <div className="flex flex-col min-w-0 space-y-1">
      <Skeleton className="h-2 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

// --- Visible Components ---

const DetailItem = ({ label, value, icon: Icon, color = "indigo" }) => {
  const colors = {
    indigo: "text-[#2f35cd] bg-[#2f35cd]/8 border-[#2f35cd]/20",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    rose: "text-rose-700 bg-rose-50 border-rose-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    slate: "text-slate-600 bg-slate-100 border-slate-200",
  };
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm group border border-slate-100/80 hover:border-slate-200">
      <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center border shrink-0 transition-all group-hover:scale-105", colors[color])}>
        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </div>
      <div className="flex flex-col min-w-0 text-left">
        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <span className="text-[10px] sm:text-[12px] font-bold text-slate-800 tracking-tight truncate">{value}</span>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subLabel, icon: Icon, variant = "blue" }) => {
  const bgColors = {
    blue: "from-blue-600 to-indigo-800 shadow-blue-500/10",
    yellow: "from-amber-500 to-orange-600 shadow-amber-500/10",
    emerald: "from-emerald-600 to-teal-700 shadow-emerald-500/10",
    rose: "from-rose-600 to-red-700 shadow-rose-500/10",
    dark: "from-slate-900 to-black shadow-slate-900/20",
  };
  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 text-white bg-linear-to-br shadow-md transition-transform hover:-translate-y-0.5 duration-300", bgColors[variant])}>
      <div className="absolute -top-1 -right-1 p-3 opacity-10 text-white">
        <Icon className="w-16 h-16 rotate-12" />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 opacity-80">
          <Icon className="w-3 h-3 text-white" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
        </div>
        <div className="text-left">
          <h3 className="text-xl font-black tracking-tighter tabular-nums leading-none mb-1">{value}</h3>
          <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest line-clamp-1">{subLabel}</p>
        </div>
      </div>
    </div>
  );
};

// --- Page Main ---

export default function TransactionDetailPage() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { _id: transactionId } = useParams();
  const location = useLocation();
  const service = location?.state?.service || "aeps1";
  const [recieptModalData, setRecieptModalData] = useState({
    title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false
  });

  const serviceEndPoint = {
    "aeps1": "aeps1reportById",
    "aeps2": "aeps2reportById",
    dmt: "dmtReportById",
    "recharge": "rechargeReportById",
    "xpress-payout": "xpressPayoutReportById",
    "aeps-payout": "aepsPayoutReportById",

  }

  // Fetch stats data
  const { refetch: refetchStatsData } = useFetch(
    `${apiEndpoints?.[serviceEndPoint[service]]}/${transactionId}`,
    {
      onSuccess: (data) => {
        if (data && data.success && data.data) {
          const temp = data?.data
          if (data && data.data && data.data.miniStatement && service === "aeps1") {
            const miniStatement = data?.data?.miniStatement?.map((transaction) => {
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
            temp.miniStatement = miniStatement
          }

          temp.txnStatus = temp?.txnStatus?.toLowerCase() || temp?.status?.toLowerCase()

          setData(temp);
          setIsLoading(false);
        }
      },

      onError: (error) => {
        setIsLoading(false);
        console.log("error in fetching details", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    serviceEndPoint[service] && apiEndpoints?.[serviceEndPoint[service]],
  );

  const columns = [
    {
      header: "SR.NO.",
      id: "index",
      center: true,
      cell: ({ row }) => <span className=" text-slate-500">{row.index + 1}</span>
    },
    { header: "Date", accessorKey: "date", center: true, className: " text-slate-800" },
    {
      header: "Transaction Type", accessorKey: "txnType", center: true, className: "text-slate-500 ", cell: ({ row }) => <div className={`${row.original.txnType === "Dr"
        ? "text-red-600"
        : "text-green-600"
        } whitespace-nowrap`}>  {row.original.txnType}
      </div>
    },
    { header: "Naration", accessorKey: "narration", center: true, className: " text-slate-500" },
    {
      header: "Amount",
      accessorKey: "amount",
      center: true,
      cell: ({ row }) => <span className={`${row.original.txnType === "Dr"
        ? "text-red-600"
        : "text-green-600"
        } whitespace-nowrap`}>  {row.original.txnType === "Dr" ? "- " : "+ "}
        {formatToINR(row.original.amount)}</span>
    },
  ];

  if (isLoading) {
    return (
      <PageLayout
        title="Transaction Detail"
        subtitle="Universal settlement audit"
        showBackButton={true}
      >
        <div className="w-full pb-20 space-y-5">
          {/* Metric Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </div>

          {/* Main Content Skeleton */}
          <div className="w-full">
            <Card className="border border-slate-100 bg-white shadow-xs rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/10">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-40" />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <DetailItemSkeleton key={i} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (Object.keys(data).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-10 bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto mt-20 shadow-xl">
        <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-6 border border-slate-100 rotate-45">
          <Layers className="w-10 h-10 -rotate-45" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">No Data Found</h2>
        <Button onClick={() => navigate(-1)} className="mt-8 rounded-xl h-11 px-8 bg-[#2f35cd] text-white font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Recall</Button>
      </div>
    );
  }

  const handleReceiptOpen = () => {
    if ((service === 'aeps1' || service === "aeps2") && (data.serviceType === "BALANCE-INQUIRY" || data.serviceType === "INQUIRY")) {
      setRecieptModalData({
        title: "Balance Enquiry",
        date: formatDate(data?.createdAt),
        subTitleLabel: "Available Balance",
        subTitleValue: formatToINR(data?.accountBalance),
        receiptData: {
          Bank: data?.bankName || "",
          "Aadhaar Number": data?.aadhaarNumber || "",
          "Transaction Id": data?.referenceId || "",
          status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
        },
        isOpen: true
      });
    }
    else if ((service === 'aeps1' || service === "aeps2") && data.serviceType === "MINI-STATEMENT") {
      setRecieptModalData({
        title: "Mini Statement",
        date: formatDate(data?.createdAt),
        receiptData: {
          Bank: data?.bankName || "",
          "Aadhaar Number": data?.aadhaarNumber || "",
          "Transaction Id": res?.data?.referenceId || "",
          miniStatement: miniStatement,
          status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
        },
        isOpen: true
      });
    }
    else if ((service === 'aeps1' || service === "aeps2") && data.serviceType === "CASH-WITHDRAW") {
      setRecieptModalData({
        title: "AEPs Withdrawal",
        date: formatDate(data?.createdAt),
        subTitleLabel: "amount",
        subTitleValue: formatToINR(data?.amount),
        receiptData: {
          Bank: data?.bankName || "",
          "Aadhaar Number": data?.aadhaarNumber || "",
          "Transaction Id": data?.referenceId || "",
          status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
        },
        isOpen: true
      });
    }
    else if (service === 'recharge') {
      setRecieptModalData({
        title: "Recharge Sucessful",
        date: formatDate(data?.createdAt),
        subTitleLabel: "amount",
        subTitleValue: formatToINR(data?.amount),
        receiptData: {
          Operator: data?.operatorName || "",
          "Mobile Number": data?.mobileNumber || "",
          "Transaction Id": data?.referenceId || "",
          status: data?.txnStatus === "success" ? "Transaction Successful" : data?.txnStatus === "pending" ? "Transaction Pending" : "Transaction Failed"
        },
        isOpen: true
      });
    }
    else if (service === 'dmt') {
      setRecieptModalData({
        title: "Transaction Successful",
        date: formatDate(data?.createdAt),
        subTitleLabel: "amount",
        subTitleValue: formatToINR(data?.amount),
        receiptData: {
          "Beneficiary Name": data?.beneficiaryName || "",
          "Beneficiary Account": data?.beneficiaryAccount || "",
          "Beneficiary Ifsc": data?.beneficiaryIfsc || "",
          "Transaction Id": data?.referenceId || "",
          status: data?.txnStatus?.toLowerCase() === "success" ? "Transaction Successful" : data?.txnStatus?.toLowerCase() === "pending" ? "Transaction Pending" : "Transaction Failed"
        },
        isOpen: true
      });
    }
    else if (service === 'aeps-payout') {
      setRecieptModalData({
        title: "Transaction Successful",
        date: formatDate(data?.createdAt),
        subTitleLabel: "amount",
        subTitleValue: formatToINR(data?.amount),
        receiptData: {
          "Beneficiary Name": data?.beneficiaryName || "",
          "Beneficiary Account": data?.bankAccount || "",
          "Beneficiary Ifsc": data?.ifsc || "",
          "Transaction Id": data?.referenceId || "",
          status: data?.txnStatus === "success" ? "Transaction Successful" : data?.txnStatus === "pending" ? "Transaction Pending" : "Transaction Failed"
        },
        isOpen: true
      });
    }
    else if (service === 'xpress-payout') {
      setRecieptModalData({
        title: "Transaction Successful",
        date: formatDate(data?.createdAt),
        subTitleLabel: "amount",
        subTitleValue: formatToINR(data?.amount),
        receiptData: {
          "Beneficiary Name": data?.beneficiaryName || "",
          "Beneficiary Account": data?.bankAccount || "",
          "Beneficiary Ifsc": data?.ifsc || "",
          "Transaction Id": data?.referenceId || "",
          status: data?.txnStatus === "success" ? "Transaction Successful" : data?.txnStatus === "pending" ? "Transaction Pending" : "Transaction Failed"
        },
        isOpen: true
      });
    }
  }

  return (
    <PageLayout
      title="Transaction Detail"
      subtitle="Universal settlement audit"
      showBackButton={true}
      actions={
        <div className="flex items-center gap-3">
          {
            !["pending", "failed"].includes(data.txnStatus) &&
            <Button onClick={handleReceiptOpen} className="rounded-lg h-9 px-6 bg-[#2f35cd] text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/10 active:scale-95 transition-all">
              <Receipt className="w-3.5 h-3.5 mr-2" /> Receipt
            </Button>
          }
        </div>
      }
    >
  
      <div className="w-full pb-20 space-y-5">

        {/* --- DYNAMIC HEADER TILES --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Amount" value={data.amount} subLabel="Recharge Value" icon={CreditCard} variant="dark" />
          <MetricCard label="Status" value={data.txnStatus} subLabel="Current Pool" icon={Activity} variant={data.txnStatus === 'success' ? "emerald" : data.txnStatus === 'failed' ? "rose" : "yellow"} />
          {data.commission !== undefined && <MetricCard label="Commission" value={data.commission} subLabel="Yield Earnt" icon={Zap} variant="blue" />}

          {data.charge !== undefined && <MetricCard label="Charge" value={data.charge} subLabel="Yield Earnt" icon={Zap} variant="rose" />}
          {data.gst !== undefined && <MetricCard label="GST" value={data.gst} subLabel="Regulatory Tax" icon={ShieldCheck} variant="blue" />}
          {data.tds !== undefined && <MetricCard label="TDS" value={data.tds} subLabel="Regulatory Tax" icon={ShieldCheck} variant="blue" />}
          {data.totalAmount !== undefined && <MetricCard label="Total Amount" value={data.totalAmount} subLabel="Total Amount" icon={ShieldCheck} variant="dark" />}
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="w-full">
          <Card className="border border-slate-100 bg-white shadow-xs rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-[#2f35cd] rounded-lg flex items-center justify-center text-white shadow-sm">
                  <Microscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Transaction Audit</h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest text-left">Verified Log Information</p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {
                  data.createdAt &&
                  <DetailItem label="Date" value={formatDate(data.createdAt)} icon={Calendar} color="indigo" />
                }
                {
                  data.referenceId &&
                  <DetailItem label="Reference Id" value={data.referenceId} icon={Tag} color="indigo" />
                }

                {
                  data.serviceName &&
                  <DetailItem label="Service" value={data.serviceName} icon={Tag} color="indigo" />
                }
                {
                  data.serviceType &&
                  <DetailItem label="Category" value={data.serviceType} icon={Tag} color="indigo" />
                }
                {
                  data.operatorName &&
                  <DetailItem label="Operator " value={data.operatorName} icon={Smartphone} color="indigo" />
                }
                {
                  data.mobileNumber &&
                  <DetailItem label="Recharged Mobile Number" value={data.mobileNumber} icon={Smartphone} color="indigo" />
                }

                {
                  data.userName &&
                  <DetailItem label="User Name" value={data.userName} icon={Hash} color="indigo" />
                }
                {
                  data.fullName &&
                  <DetailItem label="Name" value={data.fullName} icon={User} color="indigo" />
                }
                {
                  data.email &&
                  <DetailItem label="Email" value={data.email} icon={Mail} color="indigo" />
                }
                {
                  data.phone &&
                  <DetailItem label="Phone" value={data.phone} icon={Phone} color="indigo" />
                }
                {
                  data.beneficiaryName &&
                  <DetailItem label="Beneficiary Name" value={data.beneficiaryName} icon={User} color="indigo" />
                }
                {
                  (data.beneficiaryAccount || data.bankAccount) &&
                  <DetailItem label="Beneficiary Account Number" value={data.beneficiaryAccount || data.bankAccount} icon={Tag} color="indigo" />
                }

                {
                  (data.beneficiaryIfsc || data.ifsc) &&
                  <DetailItem label="Beneficiary IFSC" value={data.beneficiaryIfsc || data.ifsc} icon={Tag} color="indigo" />
                }

                {
                  data.beneficiaryPhone &&
                  <DetailItem label="Beneficiary Phone" value={data.beneficiaryPhone} icon={PhoneCall} color="indigo" />
                }

                {
                  data.bankName &&
                  <DetailItem label="Bank Name" value={data.bankName} icon={CreditCard} color="indigo" />
                }
                {
                  data.accountBalance !== undefined &&
                  <DetailItem label="Account Balance" value={data.accountBalance} icon={IndianRupeeIcon} color="indigo" />
                }
                {
                  data.balance !== undefined &&
                  <DetailItem label="Account Balance" value={data.balance} icon={IndianRupeeIcon} color="indigo" />
                }
                {
                  data.message &&
                  <DetailItem label="Description" value={data.message} icon={FileText} color="indigo" />
                }

              </div>
              {
                data.miniStatement && data.miniStatement.length > 0 &&
                <>
                  <div className="space-y-4 pt-4">

                    <div className="flex items-center gap-3 px-1">
                      <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
                      <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                        Mini Statement
                      </h2>
                    </div>
                    <DataTable
                      hidePagination={true}
                      columns={columns}
                      data={data.miniStatement}
                      isLoading={false}
                      showSearch={false}
                      showheaderAction={false}

                    />
                  </div>
                </>

              }
            </div>
          </Card>
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <div className="flex flex-col items-center gap-4 py-8 opacity-20 no-print">
          <div className="h-px w-12 bg-slate-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Secure Access Point</p>
        </div>

        <AnimatePresence>
          {recieptModalData.isOpen &&
            <ReceiptModal
              title={recieptModalData.title}
              date={recieptModalData.date}
              subTitleLabel={recieptModalData.subTitleLabel}
              subTitleValue={recieptModalData.subTitleValue}
              receiptData={recieptModalData.receiptData}
              onClose={() => {
                setRecieptModalData({ title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false });

              }}
            />
          }
        </AnimatePresence>

      </div>
    </PageLayout>
  );
}
