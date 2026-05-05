// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X, CreditCard, History, Banknote, Check, AlertCircle } from "lucide-react";
// import { createPortal } from "react-dom";
// import { formatToINR } from "../utils/helperFunction";

// export default function Aeps2ResponseModal({ responseData, onClose, transactionType }) {
//     console.log(responseData,transactionType)
//     const getModalConfig = () => {
//         switch (transactionType) {
//             case 'inquiry':
//                 return {
//                     title: 'Balance Inquiry',
//                     icon: CreditCard,
//                     gradient: 'from-indigo-600 via-violet-600 to-fuchsia-600'
//                 };
//             case 'statement':
//                 return {
//                     title: 'Mini Statement',
//                     icon: History,
//                     gradient: 'from-emerald-600 via-teal-600 to-cyan-600'
//                 };
//             case 'withdraw':
//                 return {
//                     title: 'Cash Withdrawal',
//                     icon: Banknote,
//                     gradient: 'from-amber-600 via-orange-600 to-red-600'
//                 };
//             default:
//                 return {
//                     title: 'Transaction',
//                     icon: CreditCard,
//                     gradient: 'from-slate-600 via-gray-600 to-zinc-600'
//                 };
//         }
//     };

//     const config = getModalConfig();
//     const isSuccess = true

//     return createPortal(
//         <AnimatePresence>
//             {responseData && (
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
//                 >
//                     <div className="relative w-full max-w-md">
//                         <button
//                             onClick={onClose}
//                             className="absolute -top-4 right-0 md:-right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20 backdrop-blur-md"
//                         >
//                             <X size={20} />
//                         </button>

//                         <motion.div
//                             initial={{ scale: 0.9, y: 30, opacity: 0 }}
//                             animate={{ scale: 1, y: 0, opacity: 1 }}
//                             exit={{ scale: 0.9, y: 30, opacity: 0 }}
//                             transition={{ type: "spring", stiffness: 300, damping: 25 }}
//                             className="bg-white rounded-2xl shadow-xl overflow-hidden"
//                         >
//                             {/* Header Section */}
//                             <div className={`bg-gradient-to-br ${config.gradient} p-6 text-white relative overflow-hidden`}>
//                                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />

//                                 <div className="relative z-10 text-center">
//                                     <motion.div
//                                         initial={{ scale: 0 }}
//                                         animate={{ scale: 1 }}
//                                         transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
//                                         className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 mx-auto ring-4 ring-white/30"
//                                     >
//                                         {isSuccess ? (
//                                             <Check size={32} strokeWidth={3} className="text-white" />
//                                         ) : (
//                                             <AlertCircle size={32} strokeWidth={3} className="text-white" />
//                                         )}
//                                     </motion.div>

//                                     <h2 className="text-xl font-bold mb-1">
//                                         {isSuccess ? `${config.title} Success` : `${config.title} Failed`}
//                                     </h2>

//                                     <p className="text-white/80 text-sm">
//                                         {responseData.date || new Date().toLocaleString()}
//                                     </p>

//                                     {/* Balance Display */}
//                                     {(transactionType === 'inquiry' && responseData?.customerBalance) && (
//                                         <div className="mt-4">
//                                             <p className="text-white/70 text-xs uppercase tracking-wider mb-1">
//                                                 Available Balance
//                                             </p>
//                                             <p className="text-3xl font-black">
//                                                 {formatToINR(responseData?.customerBalance)}
//                                             </p>
//                                         </div>
//                                     )}

//                                     {/* Withdrawal Amount */}
//                                     {(transactionType === 'withdraw' && responseData.transactionValue) && (
//                                         <div className="mt-4">
//                                             <p className="text-white/70 text-xs uppercase tracking-wider mb-1">
//                                                 Withdrawal Amount
//                                             </p>
//                                             <p className="text-3xl font-black">
//                                                 ₹{responseData.transactionValue}
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Content Section */}
//                             <div className="p-6">
//                                 {/* Transaction Details */}
//                                 <div className="space-y-4 mb-6">


//                                     {responseData?.bankName && (
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-sm text-slate-500">Bank Name</span>
//                                             <span className="text-sm font-bold text-slate-800">
//                                                 {responseData?.bankName}
//                                             </span>
//                                         </div>
//                                     )}

//                                     {responseData?.aadhar && (
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-sm text-slate-500">Aadhaar Number</span>
//                                             <span className="text-sm font-bold text-slate-800">
//                                                 {responseData?.aadhar}
//                                             </span>
//                                         </div>
//                                     )}

//                                     {responseData?.referenceId && (
//                                         <div className="flex justify-between items-center">
//                                             <span className="text-sm text-slate-500">Transaction Id</span>
//                                             <span className="text-sm font-bold text-slate-800">
//                                                 {responseData?.referenceId}
//                                             </span>
//                                         </div>
//                                     )}



//                                     <div className="flex justify-between items-center">
//                                         <span className="text-sm text-slate-500">Status</span>
//                                         <span className={`text-sm font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
//                                             {isSuccess ? 'Transaction Successful' : 'Transaction Failed'}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {/* Mini Statement */}
//                                 {transactionType === 'statement' && responseData?.miniStatement && responseData?.miniStatement.length > 0 && (
//                                     <div className="border-t border-slate-100 pt-4">
//                                         <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
//                                             <History size={16} />
//                                             Recent Transactions
//                                         </h4>
//                                         <div className="space-y-2 max-h-48 overflow-y-auto">
//                                             {responseData?.miniStatement.map((transaction, index) => {                                      
                                                

//                                                 return (
//                                                     <div
//                                                         key={index}
//                                                         className="flex justify-between items-center p-3 bg-slate-50 rounded-lg text-xs"
//                                                     >
//                                                         <div>
//                                                             <p className="font-medium text-slate-700">
//                                                                 {transaction.date}
//                                                             </p>
//                                                             <p className="text-slate-500 text-xs">
//                                                                 {transaction.txnType}
//                                                             </p>
//                                                             <p className="text-slate-400 text-xs truncate max-w-[200px]">
//                                                                 {transaction.narration}
//                                                             </p>
//                                                         </div>
//                                                         <div className="text-right">
//                                                             <p
//                                                                 className={`${transaction.txnType === "Dr"
//                                                                     ? "text-red-600"
//                                                                     : "text-green-600"
//                                                                     } font-bold text-sm`}
//                                                             >
//                                                                 {transaction.txnType === "Dr" ? "- " : "+ "}
//                                                                 {formatToINR(transaction.amount)}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Empty Mini Statement Message */}
//                                 {transactionType === 'statement' && responseData?.data?.miniStatement && responseData.data.miniStatement.length === 0 && (
//                                     <div className="border-t border-slate-100 pt-4 text-center">
//                                         <p className="text-slate-500 text-sm">No recent transactions found</p>
//                                     </div>
//                                 )}

//                                 {/* Close Button */}
//                                 <button
//                                     onClick={onClose}
//                                     className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
//                                 >
//                                     Close
//                                 </button>
//                             </div>
//                         </motion.div>
//                     </div>
//                 </motion.div>
//             )}
//         </AnimatePresence>,
//         document.body
//     );
// }
