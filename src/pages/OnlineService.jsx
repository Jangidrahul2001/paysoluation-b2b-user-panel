import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, FileText, Globe, CheckCircle2, X, Zap,
  ChevronRight, Sparkles, AlertCircle, ShieldCheck,
  CreditCard, Fingerprint, Layers, TrendingUp,
  HeartPulse, Briefcase
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageLayout } from '../components/layout/PageLayout';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';
import { useFetch } from '../hooks/useFetch';
import { apiEndpoints } from '../api/apiEndpoints';
import { checkAssignedService, handleValidationError, rejectRequest } from '../utils/helperFunction';
import { useSelector } from 'react-redux';
import NoPermission from './NoPermission';
import { toast } from 'sonner';
import RejectedRequest from './RejectedRequest';

const ServiceCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-[2rem] p-6 min-h-[180px] flex flex-col justify-between border border-slate-100/80 bg-white shadow-sm">
    <div className="relative z-10 flex items-start justify-between">
      <Skeleton className="w-12 h-12 rounded-[1.1rem]" />
      <Skeleton className="w-12 h-6 rounded-full" />
    </div>
    <div className="mt-2 relative z-10 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

const ServiceCard = ({ service, onSelect }) => {
  const themes = {
    indigo: "from-indigo-500 to-indigo-700 shadow-indigo-500/20",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-500/20",
    rose: "from-rose-500 to-rose-700 shadow-rose-500/20",
    amber: "from-amber-500 to-amber-700 shadow-amber-500/20",
    sky: "from-sky-500 to-sky-700 shadow-sky-500/20",
    violet: "from-violet-500 to-violet-700 shadow-violet-500/20",
  };

  const bgTints = {
    indigo: "bg-indigo-50/50",
    emerald: "bg-emerald-50/50",
    rose: "bg-rose-50/50",
    amber: "bg-amber-50/50",
    sky: "bg-sky-50/50",
    violet: "bg-violet-50/50",
  };

  const colors = ["indigo", "emerald", "rose", "amber", "sky", "violet"];

  const handleClick = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => handleClick(service.serviceUrl)}
      className="relative overflow-hidden rounded-[2rem] p-6 min-h-[180px] flex flex-col justify-between cursor-pointer border border-slate-100/80 bg-white shadow-sm transition-all duration-500 group"
    >
      <div className={cn(
        "absolute -right-16 -top-16 w-48 h- opacity-5 group-hover:opacity-10 rounded-full blur-3xl transition-all duration-700 pointer-events-none bg-gradient-to-br",
        themes[colors[Math.floor(Math.random() * colors.length)] || "indigo"]
      )} />

      <div className="relative z-10 flex items-start justify-between">
        <div className={cn(
          "w-12 h-12 rounded-[1.1rem] bg-gradient-to-br flex items-center justify-center text-white shadow-lg transition-all duration-700",
          themes[colors[Math.floor(Math.random() * colors.length)] || "indigo"]
        )}>
          <img src={`${import.meta.env.VITE_API_URL}${service?.serviceImageUrl}`} alt="service-icon" className="w-8 h-8" />
        </div>
        <div className={cn(
          "flex items-center gap-2 px-2.5 py-1 rounded-full border shadow-sm transition-colors duration-500",
          bgTints[service?.color || "indigo"],
          "border-slate-100 group-hover:border-transparent group-hover:bg-white"
        )}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-slate-800 uppercase tracking-[0.15em]">Live</span>
        </div>
      </div>

      <div className="mt-2 relative z-10">
        <h3 className="text-[14px] font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none">
          {service.serviceName}
        </h3>
        <div className=" flex items-center justify-between relative z-10 text-indigo-600 font-black text-[9px] uppercase tracking-[0.2em] transform transition-all duration-500 group-hover:translate-x-1">
          <span className="flex items-center gap-2">Explore Service <ChevronRight size={12} className="stroke-[3]" /></span>
          <div className="h-0.5 w-0 bg-indigo-600 rounded-full group-hover:w-6 transition-all duration-700" />
        </div>
      </div>
    </motion.div>
  );
};

export default function OnlineService() {
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: profile, error: profileError, loading: profileLoading  } = useSelector((state) => state.profile);

  const { refetch: fetchOnlineServices } = useFetch(
    `${apiEndpoints.fetchOnlineServices}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setServices(data.data);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        console.log("error in fetching online services data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false);
      },
    },
    true,
  );

  if (profileLoading) {
    
      return (
        <PageLayout
          title="Instant Online Hub"
          subtitle="Direct access to premium financial and registration protocols"
          className="py-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        </PageLayout>
      );
    
    
  }

   if (rejectRequest("online-service", profile?.requestedService)) return (<RejectedRequest service="online-service" pipeline="online-service" />)

  if (!checkAssignedService("online-service", "online-service", profile?.assignedServices)) return (<NoPermission service="online-service" pipeline="online-service" />)

  return (
    <PageLayout
      title="Instant Online Hub"
      subtitle="Direct access to premium financial and registration protocols"
      className="py-4"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 px-1">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))
          ) : (
            services.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onSelect={setSelectedService}
              />
            ))
          )}
        </div>

        <div className="bg-slate-950 border border-slate-800/80 rounded-[2rem] p-6 flex flex-col lg:flex-row items-center gap-6 overflow-hidden relative">
          <div className="w-12 h-12 rounded-[1.1rem] bg-indigo-600/10 border border-indigo-600 shadow-inner flex items-center justify-center text-indigo-400 shrink-0">
            <ShieldCheck size={24} className="drop-shadow-lg stroke-[2.5]" />
          </div>

          <div className="flex-1 space-y-1 text-center lg:text-left relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-2">
              <h4 className="text-[13px] font-black text-white tracking-widest uppercase">Support Protocol</h4>
              <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse hidden lg:block" />
              <span className="px-2 py-0.5 bg-white/5 rounded-full text-[8px] font-black text-indigo-300 border border-white/5 uppercase tracking-[0.2em]">Priority Hub: Online</span>
            </div>
            <p className="text-slate-400 font-bold text-[10px] leading-relaxed max-w-xl opacity-80">Requires protocol guidance or technical resolution? Our tactical unit is specialized in 24/7 support.</p>
          </div>
        </div>

        <AnimatePresence>
          {selectedService && (
            <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
