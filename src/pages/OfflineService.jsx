import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Award,
  Building2,
  Landmark,
  ArrowRight,
  Globe,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Eye,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Search,
  RotateCw,
  Filter,
  Layers,
  Download,
  ChevronDown
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { PageLayout } from "../components/layout/PageLayout";
import { Skeleton } from "../components/ui/skeleton";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import { toast } from "sonner";
import {
  handleValidationError,
  checkAssignedService,
  rejectRequest,
  formatDate,
} from "../utils/helperFunction";
import OfflineServiceForm from "./OfflineServiceForm";
import { DataTable } from "../components/ui/DataTable";
import { TableActions } from "../components/ui/TableExportActions";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import StatusBadge from "../components/ui/StatusBadge";
import { Select } from "../components/ui/Select";
import { useSelector } from "react-redux";
import NoPermission from "./NoPermission";
import RejectedRequest from "./RejectedRequest";
import { ActionButtons } from "../components/ui/ActionButton";

const StatCardSkeleton = () => (
  <div className="p-5 rounded-3xl bg-gradient-to-tr from-white to-slate-50/30 border border-slate-100 shadow-sm h-full">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="w-10 h-10 rounded-2xl" />
      <div className="flex flex-col items-end space-y-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-[2.2rem] border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center">
    <Skeleton className="w-16 h-16 rounded-[1.4rem] mb-5" />
    <Skeleton className="h-5 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-6" />
    <div className="w-full mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
      <div className="flex flex-col items-start space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-10 w-20 rounded-xl" />
    </div>
  </div>
);

const StatCard = ({ label, count, type, icon: Icon }) => {
  const styles = {
    total: {
      bg: "bg-indigo-100", icon: "text-indigo-600", border: "border-indigo-100", text: "text-indigo-700",
      gradient: "from-white to-indigo-50/30"
    },
    processing: {
      bg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-100", text: "text-amber-700",
      gradient: "from-white to-amber-50/30"
    },
    completed: {
      bg: "bg-emerald-100", icon: "text-emerald-600", border: "border-emerald-100", text: "text-emerald-700",
      gradient: "from-white to-emerald-50/30"
    },
  }[type];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "p-5 rounded-3xl bg-gradient-to-tr border shadow-sm transition-all duration-300 h-full",
        styles.gradient,
        styles.border
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2.5 rounded-2xl", styles.bg)}>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        <div className="flex flex-col items-end">
          <span className={cn("text-2xl font-black", styles.text)}>{count}</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

const ServiceCard = ({ service, onSelect }) => {
  return (
    <motion.div
      onClick={() => onSelect(service._id)}
      className="bg-white rounded-[2.2rem] border border-slate-100 p-6 shadow-sm transition-all duration-500 flex flex-col items-center text-center group relative overflow-hidden cursor-pointer"
    >
      <div className="w-16 h-16 rounded-[1.4rem] bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110">
        <img
          src={`${import.meta.env.VITE_API_URL}${service?.serviceImageUrl}`}
          alt={`${service?.serviceName}`}
          className="w-10 h-10 object-contain transition-all"
        />
      </div>

      <h3 className="text-[15px] font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
        {service?.serviceName}
      </h3>

      <p className="text-[11px] font-bold text-slate-400 mb-6 line-clamp-2 leading-relaxed">
        {service?.description}
      </p>

      <div className="w-full mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
        <div className="flex flex-col items-start translate-y-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Process Fee</span>
          <span className="text-sm font-black text-slate-900">₹{service?.amount}</span>
        </div>

        <Button
          className="bg-slate-950 hover:bg-indigo-600 text-white gap-2 px-5 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-950/10 hover:shadow-indigo-600/20 transition-all active:scale-95"
        >
          Proceed <ArrowRight size={12} strokeWidth={3} />
        </Button>
      </div>
    </motion.div>
  );
};

export default function OfflineService() {
  const navigate = useNavigate();
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [offlineServicesList, setOfflineServicesList] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [filters, setFilters] = useState({ status: "" });

  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);

  const { refetch: refetchOfflineServices } = useFetch(
    `${apiEndpoints.fetchOfflineServices}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setOfflineServicesList(data?.data || []);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  const { refetch: refetchServiceRequests } = useFetch(
    `${apiEndpoints.fetchOfflineServiceRequest}?page=${pageIndex}&limit=${pageSize}&search=${searchTerm}${filters.status ? `&status=${filters.status}` : ""}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setServiceRequests(data?.data || []);
          setTotalRecords(data?.pagination.total || 0);
        }
        setIsRequestsLoading(false);
      },
      onError: (error) => {
        setIsRequestsLoading(false);
      },
    },
    false,
  );
  useEffect(() => {
    setIsRequestsLoading(true)
    refetchServiceRequests()
  }, [pageIndex, pageSize, searchTerm, filters.status])


  const handlePageChange = ({ pageIndex: newPage, pageSize: newSize }) => {
    setPageIndex(newPage);
    setPageSize(newSize);
   
  };

  const stats = useMemo(() => {
    const total = serviceRequests.length;
    const processing = serviceRequests.filter(r => r.status === 'processing' || r.status === 'pending').length;
    const completed = serviceRequests.filter(r => r.status === 'completed').length;
    return { total, processing, completed };
  }, [serviceRequests]);

  const columns = [
    {
      id: "index",
      center: true,
      header: "SR.NO.",
      cell: ({ index }) => (
        <span className="text-[12px]  text-slate-500 tabular-nums">
          {(pageIndex - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      header: "DATE",
      center: true,
      cell: ({ row }) => (
        <div className="flex flex-col items-center py-1 whitespace-nowrap">
          <span className="text-[11px]  text-slate-700 uppercase tracking-tight">
            {formatDate(row.original.createdAt)}
          </span>
        </div>
      ),
    },
    // {
    //   header: "USER NAME",
    //   cell: ({ row }) => (
    //     <div className="flex flex-col py-1">
    //       <span className="text-[12px] font-black text-slate-900 flex items-center gap-1.5">
    //         Admin User <CheckCircle2 size={10} className="text-emerald-500" />
    //       </span>
    //       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider tabular-nums mt-0.5">
    //         ( USER101 )
    //       </span>
    //     </div>
    //   ),
    // },
    {
      header: "SERVICES NAME",
      center: true,
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-800 uppercase tracking-wide">
          {row.original.serviceName}
        </span>
      ),
    },
    // {
    //   header: "CLIENT REF ID",
    //   cell: ({ row }) => (
    //     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
    //       REF{row.original._id.slice(-8).toUpperCase()}
    //     </span>
    //   ),
    // },
    {
      header: "TXN AMOUNT",
      center: true,
      cell: ({ row }) => (
        <span className="text-[13px]  text-slate-900 tabular-nums">
          ₹{row.original.amount || "0"}
        </span>
      ),
    },
    {
      header: "STATUS",
      center: true,
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <StatusBadge status={row.original.status} />
        </div>
      ),
    },
    {
      header: "action",
      center: true,
      cell: ({ row }) => (
        <ActionButtons
        onView={() =>
              navigate("/offline-service-request", {
                state: { requestId: row.original._id },
              })
            }
            viewTitle="View Request"
        />
     
      ),
    },
  ];

  // Show skeleton loading when profile is not available
  if (profileLoading) {
    return (
      <PageLayout
        title="Offline Service "
        subtitle="Direct submission gateway for complex administrative protocols"
        className="pb-10"
      >
        <div className="space-y-10">
          {/* Stats Dashboard Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Service Selection Grid Skeleton */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Table Section Skeleton */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 px-1">
              <Skeleton className="h-6 w-1.5 rounded-full" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </PageLayout>
    );
  }
  if (rejectRequest("offline-service", profile?.requestedService)) return (<RejectedRequest service="offline-service" pipeline="offline-service" />)

  // Check permissions after profile is loaded
  if (!checkAssignedService("offline-service", "offline-service", profile?.assignedServices)) {
    return <NoPermission service="offline-service" pipeline="offline-service" />;
  }

  return (
    <PageLayout
      title="Offline Service "
      subtitle="Direct submission gateway for complex administrative protocols"
      className="pb-10"
    >
      <AnimatePresence mode="wait">
        {!selectedServiceId ? (
          <motion.div
            key="service-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <StatCard label="Total Submissions" count={totalRecords} type="total" icon={Layers} />
                  <StatCard label="In Processing" count={stats.processing} type="processing" icon={RotateCw} />
                  <StatCard label="Finalized Protocols" count={stats.completed} type="completed" icon={ShieldCheck} />
                </>
              )}
            </div>

            {/* Service Selection Grid */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))
                ) : (
                  offlineServicesList.map((service) => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      onSelect={setSelectedServiceId}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Request Tracker Table Section */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 px-1">
                <div className="h-6 w-1.5 bg-indigo-600 rounded-full" />
                <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">Available Handled Protocols</h2>
              </div>
              <DataTable
                fileName="offline_services_audit"
                searchPlaceholder="Search logs..."
                searchValue={searchTerm}
                searchChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                columns={columns}
                data={serviceRequests}
                isLoading={isRequestsLoading}
                totalRecords={totalRecords}
                pageSize={pageSize}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
                onPaginationChange={handlePageChange}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="service-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <OfflineServiceForm
              serviceId={selectedServiceId}
              onBack={() => {
                setSelectedServiceId(null);
                refetchServiceRequests();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
