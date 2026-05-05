import React, { useState, useEffect } from 'react';
import { Landmark, Search, PlusCircle, History, Wallet, LandPlot, Zap } from 'lucide-react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NoPermission from '../NoPermission';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'sonner';
import { useFetch } from '../../hooks/useFetch';
import { apiEndpoints } from '../../api/apiEndpoints';
import { checkAssignedService, handleValidationError, rejectRequest } from '../../utils/helperFunction';
import { usePost } from '../../hooks/usePost';
import TransferModal from './TransferModal';
import ReceiptModal from '../../modal/RecieptModal';
import RejectedRequest from '../RejectedRequest';

export default function MoneyTransferDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { mobile } = location?.state || {};
  const [selectedDetails, setSelectedDetails] = useState({ mobileNumber: mobile, });
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [recieptModalData, setRecieptModalData] = useState({
    title: "", date: "", subTitleLabel: "", subTitleValue: "", receiptData: {}, isOpen: false
  });

  useEffect(() => {

    if (!mobile) {
      toast.error("Mobile Number not found");
      return navigate("/money-transfer");
    }
  }, [mobile])
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);

  const [columnVisibility, setColumnVisibility] = useState({
    bankName: true,
    beneficiaryName: true,
    accountNumber: true,
    ifsc: true,
    mobile: true,
    verified: true,
    actions: true,
  });
  const [beneficiaries, setBeneficiaries] = useState([]);

  const { post: dmtCheckLimit } = usePost(apiEndpoints.dmtCheckLimit, {
    onSuccess: (res) => {
      if (res.success) {
        console.log(res)
      }
    },
    onError: (error) => {
      console.log("error in getting check limit data", error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });
  const { post: fetchBeneficiaries, isLoading } = usePost(apiEndpoints.dmtGetBeneficiary, {
    onSuccess: (res) => {
      if (res.success) {
        setBeneficiaries(res.data);
      }
    },
    onError: (error) => {
      console.log("error in getting beneficiary data", error);
      toast.error(handleValidationError(error) || "Something went wrong");

    }
  });

  useEffect(() => {
    if (mobile) {
      fetchBeneficiaries({ mobile: mobile });
      dmtCheckLimit({ mobileNumber: mobile });
    }
  }, []);

  // const { refetch: fetchBeneficiaries } = useFetch(
  //   `${apiEndpoints.dmtGetBeneficiary}`,
  //   {
  //     onSuccess: (data) => {
  //       if (data.success) {
  //       console.log(data.data)
  //       }
  //     },
  //     onError: (error) => {
  //       console.log("error in getting beneficiary data", error);
  //       toast.error(handleValidationError(error) || "Something went wrong");
  //     },
  //   },
  //   true,
  // );



  const columns = [
    {
      header: "Sr. No.",
      center: true,
      cell: ({ row }) => <span>{row.index + 1}</span>
    },
    {
      header: "Bank Name",
      accessorKey: "bank",
      center: true,
      cell: ({ row }) => (
        <span className="font-bold text-slate-700">{row.original.bank}</span>
      )
    },
    {
      header: "Beneficiary Name",
      accessorKey: "account_name",
      center: true,
      cell: ({ row }) => <span className=" uppercase tracking-tight text-slate-600">{row.original.account_name}</span>
    },
    {
      header: "Account Number",
      accessorKey: "account_no",
      center: true,
      cell: ({ row }) => <span className="font-mono  text-indigo-600">{row.original.account_no}</span>
    },
    {
      header: "IFSC",
      accessorKey: "ifsc",
      center: true,
      cell: ({ row }) => <span className="font-mono  text-slate-500">{row.original.ifsc}</span>
    },
    {
      header: "Mobile",
      accessorKey: "bene_mobile",
      center: true,
      cell: ({ row }) => <span className=" text-slate-600">{row.original.bene_mobile}</span>
    },

    {
      header: "Actions",
      center: true,
      cell: ({ row }) => (
        <Button
          size="sm"
          onClick={() => {
            setSelectedDetails((prev) => {
              return {
                ...prev,
                ...row.original
              }
            })
            setTransferModalOpen(true)
          }}
          className="h-9 px-4 rounded-xl bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200"
        >
          TRANSFER
        </Button>
      )
    }
  ];



  // Profile loading skeleton
  if (profileLoading || (!profile && !profileError)) {
    return (
      <PageLayout
        title="DMT Dashboard"
        subtitle="Institutional Money Transfer System"
        className="max-w-[1600px] mx-auto py-4"
        actions={
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-40 rounded-full" />
          </div>
        }
      >
        <div className="space-y-10">
          {/* Statistics Matrix Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="rounded-[2rem] p-6 border border-slate-100 bg-slate-50/40 shadow-sm flex flex-col gap-10"
              >
                <div className="flex items-center gap-3.5">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <Skeleton className="h-3 w-32" />
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Workspace Header Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-3.5">
                <Skeleton className="w-1.5 h-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* DataTable Skeleton */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <Skeleton className="h-10 w-80 rounded-xl" />
                <Skeleton className="h-10 w-48 rounded-xl" />
              </div>

              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-50 grid grid-cols-7 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} className="h-3 w-full" />
                ))}
              </div>

              {/* Table Rows */}
              {[1, 2, 3].map((row) => (
                <div key={row} className="px-6 py-4 border-b border-slate-50 grid grid-cols-7 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-16 rounded-xl" />
                    <Skeleton className="h-9 w-20 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
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
      title="DMT Dashboard"
      subtitle="Institutional Money Transfer System"
      className="max-w-[1600px] mx-auto py-4"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/money-transfer/add-beneficiary", { state: { mobile } })}
            className="h-11 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 flex items-center gap-3 transition-all active:scale-95"
          >
            <PlusCircle size={16} /> Add New Account
          </Button>
        </div>
      }
    >
      <div className="space-y-10">
        {/* Statistics Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Total Limit", value: "25000.00", count: "0", icon: Wallet, color: "text-emerald-700", bg: "bg-emerald-50/40", border: "border-emerald-100/50", iconBg: "bg-emerald-100/50" },
            { label: "Limit Available", value: "25000.00", count: "0", icon: LandPlot, color: "text-orange-700", bg: "bg-orange-50/40", border: "border-orange-100/50", iconBg: "bg-orange-100/50" },
            { label: "Limit Per Transaction", value: "5000", count: "0", icon: Zap, color: "text-rose-700", bg: "bg-rose-50/40", border: "border-rose-100/50", iconBg: "bg-rose-100/50" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`rounded-[2rem] p-6 border ${stat.border} ${stat.bg} shadow-sm flex flex-col gap-10 transition-all cursor-default`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-full ${stat.iconBg} flex items-center justify-center ${stat.color} border border-white/50 shadow-sm`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-600/90">{stat.label}</span>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center group/row">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Txn Count</span>
                  <span className="text-sm font-black text-slate-900 tabular-nums">{stat.count}</span>
                </div>
                <div className="flex justify-between items-center group/row">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className={`text-sm font-black ${stat.color} opacity-80`}>₹</span>
                    <span className={`text-xl font-black ${stat.color} tabular-nums tracking-tight`}>
                      {stat.value.split('.')[0]}
                      <span className="text-sm opacity-40">.{stat.value.split('.')[1] || '00'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Workspace Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-3.5">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.2)]" />
              <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-[0.15em]">
                Account Details
              </h3>
            </div>
          </div>

          <DataTable
            isLoading={isLoading}
            hidePagination={true}
            columns={columns}
            data={beneficiaries}
            showSearch={false}
            showheaderAction={true}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            headerAction={
              <Button
                variant="outline"
                onClick={() => navigate("/money-transfer/add-beneficiary")}
                className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border-indigo-100 text-indigo-600 hover:bg-indigo-50 shadow-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle size={14} className="opacity-60" /> Add New Beneficiary
              </Button>
            }
          />
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
            }}
          />
        )}
        <TransferModal isOpen={transferModalOpen} onClose={() => { setTransferModalOpen(false); setSelectedDetails({ mobileNumber: mobile }) }} details={selectedDetails} setRecieptModalData={setRecieptModalData} />
      </div>
    </PageLayout>
  );
}
