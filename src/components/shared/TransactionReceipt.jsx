import React, { Activity } from "react";
import { motion } from "framer-motion";
import { X, Download, Printer, Check, Copy, Smartphone, Receipt, Signal } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

const TransactionReceipt = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Extract mobile and operator from data.operatorMobile if possible
  const operatorVal = data.operator || (data.operatorMobile ? data.operatorMobile.split(' / ')[0] : "---");
  const mobileVal = data.mobile || (data.operatorMobile ? data.operatorMobile.split(' / ')[1] : "---");

  return (
    <div className="bg-white flex flex-col h-full w-full relative overflow-hidden transition-all duration-500">
      {/* Header with status */}
      <div className="bg-linear-to-br from-[#8A3FFC] to-[#2f35cd] p-8 text-white relative h-64 flex flex-col items-center justify-center shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/30 text-white transition-all no-print z-50 shadow-lg"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        )}

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-5 ring-4 ring-white/10"
        >
          <Check size={32} strokeWidth={4} className="text-white drop-shadow-md" />
        </motion.div>
        
        <h2 className="text-[22px] font-black tracking-tight mb-1 drop-shadow-sm">Payment Success!</h2>
        <p className="text-white/70 text-[11px] font-black uppercase tracking-widest mb-8">{data.createdAt}</p>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Total Amount</span>
          <div className="flex items-center gap-1">
             <span className="text-4xl font-black tracking-tighter drop-shadow-md">₹{data.amount.replace(/[^0-9.]/g, '')}</span>
          </div>
        </div>
      </div>

      {/* Dotted Divider with Cutouts */}
      <div className="relative py-4 no-print">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-6 h-6 rounded-full bg-slate-900/10 z-10" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 w-6 h-6 rounded-full bg-slate-900/10 z-10" />
        <div className="border-t-2 border-dashed border-slate-200 mx-4" />
      </div>

      {/* Details List */}
      <div className="px-8 pb-8 space-y-7 flex-1">
        {[
          { label: "Transaction ID", value: data.id, icon: Receipt, copyable: true },
          { label: "Mobile Number", value: data.mobile || mobileVal, icon: Smartphone },
          { label: "Operator", value: data.operator || operatorVal, icon: Activity }
        ].map((item, i) => (
          <div key={i} className="group flex items-center justify-between gap-4" onClick={() => item.copyable && handleCopy(item.value)}>
            <div className="flex items-center gap-4">
               <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <item.icon size={16} />
               </div>
               <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-tight">{item.label}</span>
            </div>
            <p className={cn(
              "text-[13px] font-black tracking-tight text-right text-slate-900",
              item.copyable && "font-mono"
            )}>
              {item.value || "---"}
            </p>
          </div>
        ))}

        <div className="pt-4 no-print">
           <button 
             onClick={handlePrint} 
             className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-[13px] font-black text-slate-900 shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all group active:scale-[0.98]"
           >
              <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" /> 
              Download Receipt PDF
           </button>
        </div>
      </div>

      {/* Footer Branded */}
      <div className="pb-10 pt-4 flex flex-col items-center gap-1.5 shrink-0 bg-white relative">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Powered by B2B Panel</p>
          
          {/* Zig-Zag Bottom Edge */}
          <div className="absolute bottom-0 left-0 w-full flex grayscale opacity-10">
            {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-1/24 h-3 bg-slate-900 rounded-b-full shrink-0" style={{ width: `${100/24}%` }} />
            ))}
          </div>
      </div>
    </div>
  );
};

export { TransactionReceipt };
