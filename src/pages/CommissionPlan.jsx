import React, { useState } from 'react';
import {
  Percent,
  Smartphone,
  Banknote,
  FileText,
  ArrowRightLeft,
  Search,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { PageLayout } from '../components/layout/PageLayout';
import { DataTable } from '../components/ui/DataTable';
import { TableActions } from '../components/ui/TableExportActions';
import { apiEndpoints } from '../api/apiEndpoints';
import { useFetch } from '../hooks/useFetch';
import { handleValidationError, ServiceLabel } from '../utils/helperFunction';
import { useSelector } from 'react-redux';




const SectionHeader = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-6 px-2">
    <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
    <div className="flex items-center gap-2">
      {/* <Icon className="text-indigo-600" size={20} /> */}
      <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">{title}</h2>
    </div>
  </div>
);



const CommissionTableSection = ({ title, icon = Banknote, data, pipeline = "", hasSubCategory = false, subCategoryName = "SubCategory Name", fileName }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = [
    {
      header: "Sr. No.",
      accessorKey: "id",
      cell: ({ row }) => <div className="text-sm text-center  text-slate-500">{row.index + 1}</div>
    },


    ...(hasSubCategory ? [{
      header: subCategoryName,
      accessorKey: "name",
      cell: ({ row }) => <div className=" text-center text-slate-700">{row.original.name}</div>
    },] : []),
    {
      header: "From Amount",
      accessorKey: "fromAmount",
      cell: ({ row }) => <div className="text-sm  text-slate-600 text-center">₹{row.original.fromAmount?.toFixed(2)}</div>
    },
    {
      header: "To Amount",
      accessorKey: "toAmount",
      cell: ({ row }) => <div className="text-sm text-slate-600 text-center">₹{row.original.toAmount?.toFixed(2)}</div>
    },
    {
      header: "Commission / charge ",
      accessorKey: "commission",
      cell: ({ row }) => <div className="text-sm font-bold text-indigo-600 text-center">{row.original.commission}</div>
    },
    {
      header: "Type",
      accessorKey: "commissionType",
      cell: ({ row }) => (
        <div className="px-4 py-1.5 rounded-lg text-center bg-orange-100/50 text-orange-600 text-[10px] font-black tracking-widest border border-orange-200 uppercase">
          {row.original.commissionType}
        </div>
      )
    }
  ];



  return (
    <div className="space-y-4 pt-4 mb-10">
      <div className="flex align-center justify-between">

        <div className="flex items-center gap-3 px-1">
          <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">{title} Structures</h2>
        </div>

        <div className="px-4 py-1.5 me-2 rounded-lg text-center bg-purple-100/50 text-purple-600 text-[10px] font-black tracking-widest border border-purple-200 ">
          Pipeline : {pipeline}
        </div>
      </div>
      <DataTable
        searchPlaceholder={`Search...`}
        searchValue={searchTerm}
        searchChange={(e) => setSearchTerm(e.target.value)}
        fileName={fileName}
        columns={columns}
        data={data}
        isLoading={false}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        hidePagination={true}
      />
    </div>
  );
};

const StatCard = ({ label, amount, type, icon: Icon, subLabel }) => {
  const styles = {
    success: { bg: "bg-emerald-100", icon: "text-emerald-600", border: "border-emerald-100", text: "text-emerald-700", gradient: "from-white to-emerald-50" },
    pending: { bg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-100", text: "text-amber-700", gradient: "from-white to-amber-50" },
    commission: { bg: "bg-violet-100", icon: "text-violet-600", border: "border-violet-100", text: "text-violet-700", gradient: "from-white to-violet-50" },
  }[type] || { bg: "bg-slate-100", icon: "text-slate-600", border: "border-slate-100", text: "text-slate-700", gradient: "from-white to-slate-50" };

  return (
    <motion.div
      className={cn(
        "p-6 rounded-[2rem] bg-gradient-to-tr border shadow-sm transition-all duration-300 h-full",
        styles.gradient,
        styles.border
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-3 rounded-2xl shadow-sm", styles.bg)}>
          <Icon className={cn("w-6 h-6", styles.icon)} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{label}</span>
      </div>
      <div className="flex flex-col">
        <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase mb-2">{amount}</h4>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className={cn("text-[10px] font-black uppercase tracking-widest leading-none px-2 py-1 rounded-lg", styles.bg, styles.text)}>
            {subLabel}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommissionPlan() {

  const [commisionPlanData, setCommissionPlanData] = useState([]);
  const { data: profile } = useSelector((state) => state.profile);
  console.log(profile)

  const { refetch: fetchCommmissionPlan } = useFetch(
    `${apiEndpoints.myCommissionPlan}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setCommissionPlanData(data.data);
        }
      },
      onError: (error) => {
        console.log("error in fetching commission plan data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );
  const serviceData = {
    recharge: {
      fileName: "recharge_commissions",
      hasSubCategory: true,
      subCategoryName: "Operator",
    },
    bbps: {
      fileName: "bbps_commissions",
      hasSubCategory: true,
      subCategoryName: "sub-category"
    }
  }

  return (
    <PageLayout
      title="Commission Plan"
      subtitle="View your active commission structures"
      className="max-w-[1600px] mx-auto py-4"
    >
      {/* Active Package Info */}
      <div className="flex items-center gap-6 px-2 -mt-2">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Active Package</span>
        </div>
        <p className="text-sm text-slate-500 font-bold tracking-tight">Package Mode: <span className="text-indigo-600 font-black uppercase tracking-widest">{profile?.roleId?.name || ""} ({profile?.packageId?.name || ""})</span></p>
      </div>

      {/* Highlights Bar - Wallet Report Style Stat Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2 mt-6">
        <StatCard
          label="High Margins"
          amount="12.00 ₹"
          type="commission"
          icon={TrendingUp}
          subLabel="Best rates"
        />
        <StatCard
          label="Settlements"
          amount="Real-time Speed"
          type="success"
          icon={Zap}
          subLabel="Instant"
        />
        <StatCard
          label="Services"
          amount={`${commisionPlanData?.length || 0} Active`}
          type="pending"
          icon={Percent}
          subLabel="Live now"
        />
      </div> */}
      <div className="px-2 mt-6 mb-4">

        {
          commisionPlanData.map((data, index) => (
            <div key={data?.serviceId || index}>
              <CommissionTableSection
                title={ServiceLabel(data?.serviceName)}
                data={data.rows}
                fileName={`${data?.serviceName}_commissions`}
                hasPipeline={serviceData[data?.serviceName]?.hasPipeline}
                hasSubCategory={serviceData[data?.serviceName]?.hasSubCategory}
                subCategoryName={serviceData[data?.serviceName]?.subCategoryName}
                pipeline={data?.pipeline}
              />
            </div>

          ))
        }

      </div>
    </PageLayout>
  );
}
