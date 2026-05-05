import React, { useState, useEffect } from "react";
import { Toaster as SonnerToaster } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, FileText, FileSpreadsheet, Copy } from "lucide-react";

// Event Bus for custom action toasts
const toastEvent = new EventTarget();

export const showActionToast = (message, type = "success") => {
  const event = new CustomEvent("toast", { detail: { message, type } });
  toastEvent.dispatchEvent(event);
};

export const GlobalToaster = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleToast = (e) => {
      setToast(e.detail);
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    };

    toastEvent.addEventListener("toast", handleToast);
    return () => toastEvent.removeEventListener("toast", handleToast);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "pdf": return <FileText size={16} />;
      case "excel": return <FileSpreadsheet size={16} />;
      case "copy": return <Copy size={16} />;
      default: return <CheckCircle size={16} />;
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case "pdf": return "PDF Downloaded";
      case "excel": return "Excel Downloaded";
      case "copy": return "Copied Successfully";
      default: return "Success";
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case "pdf": return "bg-red-500/10 text-red-500";
      case "excel": return "bg-emerald-500/10 text-emerald-500";
      case "copy": return "bg-blue-500/10 text-blue-500";
      default: return "bg-emerald-500/10 text-emerald-500";
    }
  };

  return (
    <>
      {/* 1. Global CSS Styles for Sonner Toaster */}
      <style>{`
        .modern-toast {
          animation: toast-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
          transform-origin: center center !important;
          will-change: transform, opacity !important;
          background: #ffffff !important;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        [data-sonner-toast][data-removed="true"] {
          animation: toast-out 0.4s cubic-bezier(0.32, 0, 0.67, 0) forwards !important;
        }

        @keyframes toast-in {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes toast-out {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.92) translateY(8px); }
        }

        [data-sonner-toast]:hover {
          transform: scale(1) !important;
          transition: none !important;
        }

        [data-sonner-toast],
        [data-sonner-toast][data-front="true"],
        [data-sonner-toast][data-front="false"],
        [data-sonner-toast][data-expanded="true"],
        [data-sonner-toast][data-expanded="false"] {
          transform: none;
          scale: 1 !important;
          opacity: 1 !important;
          padding: 12px 20px !important;
        }

        [data-sonner-toast] {
          justify-content: flex-start !important;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          padding: 12px 20px !important;
          min-width: 280px !important;
          max-width: 90vw !important;
          overflow: hidden !important;
        }

        [data-sonner-toast][data-type="success"] {
          background: linear-gradient(to top right, #ffffff, #ffffff, #ecfdf5) !important;
          color: #10b981 !important;
          border: 1.5px solid rgba(16, 185, 129, 0.3) !important;
        }

        [data-sonner-toast][data-type="error"] {
          background: linear-gradient(to top right, #ffffff, #ffffff, #fff1f2) !important;
          color: #ef4444 !important;
          border: 1.5px solid rgba(239, 68, 68, 0.3) !important;
        }

        [data-sonner-toast][data-type="warning"] {
          background: linear-gradient(to top right, #ffffff, #ffffff, #fffbeb) !important;
          color: #f59e0b !important;
          border: 1.5px solid rgba(245, 158, 11, 0.3) !important;
        }

        [data-sonner-toast][data-type="info"] {
          background: linear-gradient(to top right, #ffffff, #ffffff, rgba(99, 102, 241, 0.05)) !important;
          color: var(--t-primary) !important;
          border: 1.5px solid var(--t-panel-border) !important;
        }

        [data-sonner-toast] [data-icon] {
          order: 1 !important;
          margin: 0 12px 0 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0;
        }

        [data-sonner-toast] [data-icon] svg {
          color: inherit !important;
          width: 18px !important;
          height: 18px !important;
        }

        [data-sonner-toast] [data-content] {
          order: 2 !important;
          margin: 0 !important;
          flex: 1 1 auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          justify-content: center !important;
          min-width: 140px;
        }

        [data-sonner-toast] [data-title] {
          color: var(--t-slate-900) !important;
          font-weight: 800 !important;
          line-height: 1.3 !important;
          font-size: 14px !important;
          letter-spacing: -0.01em;
        }

        [data-sonner-toast][data-type="success"] [data-title] { color: #065f46 !important; }
        [data-sonner-toast][data-type="error"] [data-title] { color: #991b1b !important; }
        [data-sonner-toast][data-type="warning"] [data-title] { color: #92400e !important; }
        [data-sonner-toast][data-type="info"] [data-title] { color: var(--t-primary-dark) !important; }

        [data-sonner-toast] [data-description] {
          color: var(--t-slate-500) !important;
          opacity: 0.8;
          font-weight: 600 !important;
          font-size: 11px !important;
          line-height: 1.3 !important;
          margin-top: 2px !important;
        }

        [data-sonner-toast] [data-close-button] {
          order: 3 !important;
          position: static !important;
          transform: none !important;
          margin-left: 15px !important;
          background: rgba(0, 0, 0, 0.03) !important;
          border: 1px solid rgba(0, 0, 0, 0.04) !important;
          color: var(--t-slate-400) !important;
          border-radius: 9999px !important;
          width: 26px !important;
          height: 26px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          flex-shrink: 0;
        }

        [data-sonner-toast] [data-close-button] svg {
          width: 12px !important;
          height: 12px !important;
        }
      `}</style>

      {/* 2. Sonner Toaster (Main Notifications) */}
      <SonnerToaster
        position="top-center"
        richColors={true}
        expand={true}
        closeButton
        theme="light"
        toastOptions={{
          className: "modern-toast",
          style: {
            borderRadius: "9999px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "700",
            boxShadow: "var(--t-shadow-xl)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderWidth: "1.5px",
            borderStyle: "solid",
          },
        }}
      />

      {/* 3. Action Toaster (Custom Notifications) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-[#1e293b] text-white pl-3 pr-4 py-3 rounded-2xl shadow-2xl shadow-indigo-600/20 border border-slate-700/50 min-w-[340px]"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(toast.type)}`}>
              {getIcon(toast.type)}
            </div>

            <div className="flex-1 flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-100">
                {getTitle(toast.type)}
              </span>
              <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                {toast.message}
              </span>
            </div>

            <button
              onClick={() => setToast(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
