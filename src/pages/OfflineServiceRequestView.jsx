import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Eye,
  Info,
  Layers,
  FileCheck,
  ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarPageTransition } from "../components/layout/sidebar-PageTransition";
import { useFetch } from "../hooks/useFetch";
import { apiEndpoints } from "../api/apiEndpoints";
import { toast } from "sonner";
import { handleValidationError, checkAssignedService, rejectRequest } from "../utils/helperFunction";
import { Skeleton } from "../components/ui/skeleton";
import ImageModal from "../components/ui/ImageModal";
import { PageLayout } from "../components/layout/PageLayout";
import { BentoCard } from "../components/ui/BentoCard";
import StatusBadge from "../components/ui/StatusBadge";
import { cn } from "../lib/utils";
import { useSelector } from "react-redux";
import NoPermission from "./NoPermission";
import RejectedRequest from "./RejectedRequest";

const OfflineServiceRequestView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);

  const requestId = location.state?.requestId;
  const { data: profile,loading: profileLoading  } = useSelector((state) => state.profile);

  const { refetch } = useFetch(
    `${apiEndpoints.fetchOfflineServiceRequest}/${requestId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setRequestData(data?.data);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch request");
        setIsLoading(false);
      },
    },
    !!requestId,
  );

  const handleViewDocument = (doc) => {
    const documentUrl = `${import.meta.env.VITE_API_URL}${doc.fileUrl}`;
    setModalImages([documentUrl]);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (requestId) {
      refetch();
    } else {
      setIsLoading(false);
    }
  }, [requestId, refetch]);
 

  // Show skeleton loading when profile is not available
  if (profileLoading) {
    return (
      <PageLayout title="" className="max-w-[1600px] mx-auto py-6">
        <div className="space-y-8 px-4">
          <Skeleton className="h-4 w-24 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
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

  if (isLoading) {
    return (
      <PageLayout title="" className="max-w-[1600px] mx-auto py-6">
        <div className="space-y-8 px-4">
          <Skeleton className="h-4 w-24 rounded-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!requestData) {
    return (
      <PageLayout title="Not Found" className="max-w-[1600px] mx-auto py-6 text-center">
        <div className="space-y-4 pt-20">
          <XCircle size={48} className="mx-auto text-slate-200" />
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Request details not found</h2>
          <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
        </div>
      </PageLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageLayout
      title="Service Request Details"
      subtitle={requestData.serviceName || "Review your application details and status"}
      className="max-w-[1600px] mx-auto py-6"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 px-4"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-[#7065e0] font-black text-[10px] uppercase tracking-[0.2em] transition-all group w-fit"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to list
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* Left Column - Application Info */}
          <div className="lg:col-span-2 space-y-8">

            {/* Field Data Bento */}
            <BentoCard className="p-0 bg-white/80">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Info size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                      Submitted Information
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Details provided in application</p>
                  </div>
                </div>
                <StatusBadge status={requestData.status} />
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-8">
                  {requestData.fieldData?.map((field, idx) => (
                    <motion.div
                      key={field.fieldId}
                      variants={itemVariants}
                      className="space-y-1.5 group"
                    >
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                        {field.label}
                      </span>
                      <p className="text-sm font-black text-slate-700 leading-relaxed overflow-hidden text-ellipsis">
                        {field.value || "—"}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </BentoCard>

            {/* Documents Bento */}
            {requestData.documentData?.length > 0 && (
              <BentoCard className="p-0 bg-white/80 backdrop-blur-xl">
                <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-slate-50/50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        Uploaded Documents
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Verified identity & support files</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestData.documentData?.map((doc, idx) => (
                      <motion.div
                        key={doc.documentId}
                        variants={itemVariants}
                        className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                            <FileText size={20} className="text-slate-400 group-hover:text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              {doc.label}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-lg bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {doc.fileUrl.split(".").pop().toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-indigo-600 hover:text-white text-indigo-600 transition-all active:scale-90 shadow-sm border border-indigo-50"
                        >
                          <Eye size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </BentoCard>
            )}
          </div>

          {/* Right Column - Status & Sidebar Info */}
          <div className="space-y-8">
            {/* Quick Status Bento */}
            <BentoCard className="p-8 border-none bg-[#7065e0] text-white">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Layers size={18} className="text-white" />
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em]">
                    Request Tracker
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">
                    Service Category
                  </h4>
                  <p className="text-xl font-black text-white uppercase tracking-tight">
                    {requestData.serviceName}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold opacity-60">Created Date</span>
                    <span className="font-black">{new Date(requestData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold opacity-60">Status</span>
                    <div className="bg-white/10 px-3 py-1 rounded-full border border-white/10 font-black uppercase tracking-widest text-[10px]">
                      {requestData.status}
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Admin Remark Bento */}
            {requestData.adminRemark && (
              <motion.div variants={itemVariants}>
                <BentoCard className="p-8  bg-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckCircle2 size={120} />
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 rounded-full bg-indigo-600" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Official Admin Remark
                      </h4>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-600 leading-relaxed">
                        "{requestData.adminRemark}"
                      </p>
                    </div>
                  </div>
                </BentoCard>
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <ImageModal
        images={modalImages}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PageLayout>
  );
};

export default OfflineServiceRequestView;
