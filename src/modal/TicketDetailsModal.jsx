import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { apiEndpoints } from "../api/apiEndpoints";
import { useFetch } from "../hooks/useFetch";
import { toast } from "sonner";
import {
  formatDate,
  handleValidationError,
  ServiceLabel,
} from "../utils/helperFunction";
import StatusBadge from "../components/ui/StatusBadge";



export function TicketDetailsModal({ isOpen, onClose, ticketId }) {

  const [ticket, setTicket] = useState(null);
  const { refetch: fetchTicketById } = useFetch(
    `${apiEndpoints.fetchSupportTicketByID}/${ticketId}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setTicket(data?.data);
        }
      },
      onError: (error) => {
        console.log("error in fetching services data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    false,
  );

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (ticketId !== null) fetchTicketById();
  }, [ticketId]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!mounted || !ticketId) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-800/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 p-6 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                    Ticket Details
                  </h3>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    ID: {ticket?.ticketId}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Scrollable Area */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
                {/* Service Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">
                      Related Service
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-bold text-slate-800">
                      {ServiceLabel(ticket?.serviceName)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">
                      Created On
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 font-bold text-slate-800 flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      {formatDate(ticket?.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">
                      Current Status
                    </p>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center">
                      <StatusBadge status={ticket?.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">
                      Priority Level
                    </p>
                    <div className="bg-rose-50 rounded-xl p-4 border border-rose-100 font-bold text-rose-600 flex items-center gap-2">
                      <AlertCircle size={16} /> High Priority
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 border-b border-slate-100 pb-2">
                  Communication Logs
                </p>

                {/* Simulated Customer Prompt */}
                <div className="bg-indigo-50/50 rounded-2xl rounded-tl-sm p-5 border border-indigo-100/50 relative mt-4">
                  <span className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                    Your Issue
                  </span>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed mt-2">
                    {ticket?.supportDetails}
                  </p>
                </div>

                {/* Simulated Support Reply */}
                {
                  ticket?.adminRemark &&

                  <div className="bg-slate-50 rounded-2xl rounded-tr-sm p-5 border border-slate-100 relative mt-4 ml-8 md:ml-12">
                    <span className="absolute -top-3 right-4 bg-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Support Reply
                    </span>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed mt-2">
                      {ticket?.adminRemark}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 mt-3 flex items-center justify-end gap-1">
                      <CheckCircle2 size={12} /> Replied by System Admin
                    </p>
                  </div>
                }
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
