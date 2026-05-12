import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { Receipt, ShieldCheck, Smartphone, ArrowRight, Loader2, Shield, Zap, IndianRupee } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { formatDecimalNumberInput, formatNumberInput } from "../../utils/helperFunction";
import { toast } from "sonner";
export const BillReceipt = ({ bill, customerMobile, setCustomerMobile, isPaying, onPay, setBill }) => {
   const [isUpdateAmount, setIsUpdateAmount] = useState(false)
   const [amountRange, setAmountRange] = useState({
      minimum: 0,
      maximum: 0
   })


   useEffect(() => {
      if (bill && !("amount" in bill)) {
         const mainBill = bill?.data?.billerResponse || {};
         const displayAmount = mainBill?.billAmount || "0";
         const amount = Number(displayAmount) / 100;
         const formattedAmount = isNaN(amount) ? "0.00" : amount.toFixed(2);
         setBill({ ...bill, amount: formattedAmount })
      }
      if (bill && bill.data && bill.data.additionalInfo && bill.data.additionalInfo.info) {
         const additionalInfo = bill.data.additionalInfo.info
         if (Array.isArray(additionalInfo) && additionalInfo?.length > 1) {
            const isMinTrue = additionalInfo.find(item =>
               item.infoName?.toLowerCase().includes("minimum")
            );

            const isMaxTrue = additionalInfo.find(item =>
               item.infoName?.toLowerCase().includes("maximum")
            );
            // const isMinTrue = additionalInfo.find((item) => item.infoName?.includes("Minimum Amount for Top-up"))
            // const isMaxTrue = additionalInfo.find((item) => item.infoName?.includes("Maximum Permissible Recharge Amount"))
            if (isMinTrue && isMaxTrue) {
               setAmountRange({
                  minimum: isMinTrue.infoValue,
                  maximum: isMaxTrue.infoValue
               })
               setIsUpdateAmount(true)
            }

         }
      }

   }, [bill])

   const handlePay = () => {
      if (isUpdateAmount && amountRange.minimum && amountRange.maximum) {

         if (Number(bill.amount) < Number(amountRange.minimum) || Number(bill.amount) > Number(amountRange.maximum)) {
            toast.error(`Please enter amount between ${amountRange.minimum} and ${amountRange.maximum}`)
            return
         }
         if (onPay) onPay()
      }
      else {
         if (onPay) onPay()

      }
   }




   if (!bill) {
      return (
         <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full min-h-[420px] bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group"
         >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.03),transparent_50%)] pointer-events-none" />

            <div className="relative mb-6">
               <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center relative shadow-inner border border-slate-100/50">
                  <Receipt size={32} className="text-slate-100 stroke-[1.5]" />
                  <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 scale-100 group-hover:scale-110 transition-transform duration-500">
                     <Zap size={18} fill="currentColor" />
                  </div>
               </div>
            </div>

            <h3 className="text-base font-black text-slate-800 mb-1.5 uppercase tracking-tight">Active Node Check</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] leading-relaxed max-w-[180px] mb-8 opacity-60">
               Awaiting provider connection...
            </p>

            <div className="w-full space-y-2 px-1">
               {[
                  { label: "SSL ENCRYPTED", icon: Shield },
                  { label: "REALTIME SYNC", icon: Zap }
               ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100/50 hover:border-indigo-100 transition-all group/item">
                     <item.icon size={13} className="text-slate-300 group-hover/item:text-indigo-400 transition-colors" />
                     <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest leading-none translate-y-px">{item.label}</span>
                  </div>
               ))}
            </div>
         </motion.div>
      );
   }


   const detailsToDisplay = Object.entries(bill || {}).filter(
      ([key]) =>
         !["billAmount", "amount", "_id", "createdAt", "updatedAt", "billerName", "dueDate"].includes(key)
   );



   const formatLabel = (key) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));




   return (
      <motion.div
         initial={{ opacity: 0, x: 20 }}
         animate={{ opacity: 1, x: 0 }}
         className="space-y-4 flex flex-col h-full overflow-hidden"
      >
         {/* Premium Receipt Card */}
         <div className="bg-indigo-600 rounded-3xl p-5 text-white shadow-2xl shadow-indigo-900/10 relative overflow-hidden flex flex-col shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-transparent to-transparent opacity-60" />
            <div className="absolute -right-12 -top-12 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Receipt size={140} strokeWidth={1} />
            </div>

            <div className="flex justify-between items-center relative z-10 mb-6 px-1">
               <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-indigo-300">
                  INVOICE PAYLOAD
               </div>
               <ShieldCheck size={16} className="text-white/20" />
            </div>

            <div className="relative z-10 mb-5 bg-white p-4.5 rounded-2xl shadow-xl border border-white/10">
               <p className="text-slate-400 text-[8.5px] font-black uppercase tracking-[0.2em] mb-1.5 text-center opacity-60">Bill Amount</p>
               <div className="flex items-center justify-center gap-1">
                  <span className="text-base font-bold text-indigo-500 mb-1.5">₹</span>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900">{bill.amount}</h2>
                  <span className="text-[10px] font-bold text-slate-300 ml-1 mb-1">INR</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10 pt-4 border-t border-white/5 mx-1">
               <div>
                  <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-0.5 opacity-60">Due Limit</p>
                  <p className="text-[11px] font-black tracking-tight text-white/90">{bill.dueDate || 'Current'}</p>
               </div>
               <div className="text-right">
                  <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-0.5 opacity-60">TXN Node</p>
                  <p className="text-[11px] font-black tracking-tight text-white/90 flex items-center justify-end font-mono">
                     #{bill.billId?.slice(-6) || 'LIVE'}
                  </p>
               </div>
            </div>
         </div>

         {/* Details & Payment Controls */}
         <div className="bg-gradient-to-tr from-white via-white to-indigo-50/40 rounded-[2rem] p-5 sm:p-6 border border-indigo-100/80 shadow-sm space-y-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="space-y-4 flex-1">
               <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Digital Payload Metadata</p>
                  <div className="flex gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-60" />
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60" />
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60" />
                  </div>
               </div>
               <div className="space-y-2.5">
                  {detailsToDisplay.map(([key, value]) => {
                     if (value === null || value === undefined || value === "") return null;
                     let showFields = [];
                     if (key === "data") {
                        const billerResponse = Object.keys(value?.billerResponse || {}).map((item) => ({
                           name: item,
                           value: item === "billAmount" ? bill.amount : value?.billerResponse?.[item]
                        }));

                        const infoArray = Array.isArray(value?.additionalInfo?.info)
                           ? value.additionalInfo.info.map(item => ({
                              name: item.infoName,
                              value: item.infoValue
                           }))
                           : [];
                        showFields = [...billerResponse, ...infoArray].filter(item => item.value !== null && item.value !== undefined && item.value !== "");

                     }

                     return (<>{
                        ["status", "message"].includes(key) ? null :
                           key === "data" ? <> {
                              showFields.map((field, idx) => (
                                 <div key={idx} className="flex justify-between items-center group/row">
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-tight group-hover/row:text-slate-600 transition-colors">{formatLabel(field?.name)}</span>
                                    <span title={field?.value} className="text-[11.5px] font-black text-slate-800 text-right truncate pl-4 max-w-[170px]">
                                       {field?.value}
                                    </span>
                                 </div>
                              ))

                           }
                           </> :
                              <div key={key} className="flex justify-between items-center group/row">
                                 <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-tight group-hover/row:text-slate-600 transition-colors">{formatLabel(key)}</span>
                                 <span title={value} className="text-[11.5px] font-black text-slate-800 text-right truncate pl-4 max-w-[170px]">
                                    {value}
                                 </span>
                              </div>
                     }
                     </>
                     );
                  })}
               </div>
            </div>

            <div className="pt-6 space-y-4 border-t border-slate-200/50">
               <div className="space-y-2">


                  <Input
                     icon={Smartphone}
                     label="Customer Number"
                     type="text"
                     maxLength={10}
                     value={customerMobile}
                     onChange={(e) => setCustomerMobile(e.target.value.replace(/\D/g, ""))}
                     className="w-full h-10.5 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-xs font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-100 transition-all placeholder:text-slate-200 tracking-tight"
                     placeholder="Customer Number"
                  />
               </div>
               {isUpdateAmount &&
                  <div className="space-y-2">
                     <Input
                        icon={IndianRupee}
                        label="Payment Amount (INR)"
                        value={bill?.amount || ""}
                        onChange={(e) => setBill({ ...bill, amount: formatDecimalNumberInput(e.target.value, 7) })}
                        placeholder="0.00"
                     />
                  </div>
               }


               <Button
                  disabled={isPaying || !customerMobile || customerMobile.length < 10}
                  onClick={handlePay}
                  className="w-full h-12.5 rounded-xl bg-indigo-600 hover:bg-indigo-600 border-none text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
               >
                  {isPaying ? <Loader2 className="animate-spin" size={16} /> : <>PAY BILL <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></>}
               </Button>

               <div className="flex items-center justify-center gap-2 text-[7.5px] font-black text-slate-600 uppercase tracking-widest opacity-50 mt-2">
                  SECURE BBPS GATEWAY NODE
               </div>
            </div>
         </div>
      </motion.div>
   );
};

