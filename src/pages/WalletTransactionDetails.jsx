import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Hash,
  Wallet,
  RotateCcw,
  Zap,
  Terminal,
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Flame,
  Download,
  Info,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  History,
  Stamp,
  Copy,
  Receipt,
  Eye,
  ArrowDownCircle,
  ArrowUpCircle,
  Globe,
  Settings,
  Cpu,
  Monitor,
  Phone,
  Mail,
  Building2,
  FileText
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { cn } from '../lib/utils';
import { toast } from 'sonner';


// --- Mock Data ---
const TXN_DATA = {
 
};

// --- Sub-Components ---

const BalancedCard = ({ children, className, title, icon: Icon, colorClass = "text-slate-800" }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className={cn(
      "bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full",
      className
    )}
  >
    {title && (
      <div className="px-4 py-3.5 sm:px-7 sm:py-4 border-b border-slate-200/50 flex items-center justify-between bg-slate-50/30 shrink-0">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          {Icon && <Icon size={16} className={cn(colorClass, "shrink-0")} />}
          <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em] truncate", colorClass)}>{title}</h3>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 shrink-0" />
      </div>
    )}
    <div className="p-2 sm:p-4 flex-1 flex flex-col justify-start">
      {children}
    </div>
  </motion.div>
);

const DetailRow = ({ label, value, icon: Icon, color = "text-slate-700" }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-none group gap-3">
    <div className="flex items-center gap-3 shrink-0 min-w-0">
      <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
        {Icon ? <Icon size={14} /> : <div className="h-1 w-1 rounded-full bg-current" />}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">{label}</p>
    </div>
    <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
      <p className={cn("flex-1 min-w-0 text-sm font-black tracking-tight text-right break-all sm:break-words", color)} title={typeof value === 'string' ? value : undefined}>{value}</p>
    </div>
  </div>
);

const BalancedStat = ({ label, value, icon: Icon, colorClass = "text-slate-900" }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={12} className="text-slate-400" />}
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
    </div>
    <p className={cn("text-sm font-black tracking-tight", colorClass)}>{value}</p>
  </div>
);

export default function WalletTransactionDetails() {
  const navigate = useNavigate();
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState({});


  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("ID Copied");
  };



  const columns = [{
    header: "SR.NO.",
    accessorKey: "id",
    cell: ({ row }) => <span className="text-[12px] font-bold text-slate-300">{(pageIndex - 1) * pageSize + row.index + 1}</span>,
  },
  {
    accessorKey: "amount",
    header: "TRANSACTION AMOUNT",
    cell: ({ row }) => <span className="font-black text-slate-700 text-[13px] tabular-nums">₹ {row.original.amount.toFixed(2)}</span>
  },
  {
    accessorKey: "commission",
    header: "SERVICE COMMISSION (+)",
    cell: ({ row }) => <span className="font-black text-emerald-600 text-[13px] tabular-nums">+ ₹ {row.original.commission.toFixed(2)}</span>
  },
  {
    accessorKey: "charges",
    header: "PROCESSING CHARGES (-)",
    cell: ({ row }) => <span className="font-black text-rose-500 text-[13px] tabular-nums">- ₹ {row.original.charges.toFixed(2)}</span>
  },
  {
    accessorKey: "gst",
    header: "GST (INCLUSIVE 0%)",
    cell: () => <span className="font-bold text-slate-400 text-[12px] tabular-nums">₹ 0.00</span>
  },
  {
    accessorKey: "tds",
    header: "TDS RETENTION",
    cell: () => <span className="font-bold text-slate-400 text-[12px] tabular-nums">₹ 0.00</span>
  },
  {
    accessorKey: "netAmount",
    header: "NET SETTLEMENT VALUE",
    cell: ({ row }) => (
      <div className=" px-3 py-1 rounded-lg">
        <span className="font-black text-indigo-600 text-sm tabular-nums">₹ {row.original.netAmount.toFixed(2)}</span>
      </div>
    )
  }
  ]


  return (
    <PageLayout
      title="Transaction Audit Console"
      subtitle={`Global Reference: ${TXN_DATA.details.referenceId}`}
      showBackButton
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="space-y-6 px-2 sm:px-6">

        {/* Section 1: Top Professional Header */}
        <div className="w-full bg-white rounded-[2.5rem] p-5 min-[1160px]:p-8 2xl:p-10 flex flex-col min-[1160px]:flex-row items-stretch min-[1160px]:items-center justify-between gap-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          {/* Amount & Status */}
          <div className="flex items-center gap-4 xl:gap-6 shrink-0 w-full min-[1160px]:w-auto min-w-0 relative z-10">
            <div className="h-12 w-12 xl:h-14 2xl:h-16 min-w-[2.5rem] xl:min-w-[3rem] 2xl:min-w-[3.5rem] shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 transition-transform group-hover:scale-110 duration-500">
              <IndianRupee className="w-6 h-6 xl:w-7 2xl:w-8" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] xl:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1 xl:mb-2 truncate">Transaction Amount</p>
              <div className="flex flex-wrap sm:flex-nowrap items-baseline sm:items-center gap-3">
                <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-black text-slate-900 tracking-tightest leading-none truncate">
                  <span className="text-slate-300 mr-1 xl:mr-2">₹</span>
                  {TXN_DATA.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] xl:text-[10px] font-black uppercase shrink-0 self-start sm:self-auto shadow-sm",
                  TXN_DATA.status === 'FAILED'
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                )}>
                  {TXN_DATA.status}
                </span>
              </div>
            </div>
          </div>

          {/* Divider — horizontal on mobile/stacked, vertical on desktop row */}
          <div className="w-full h-px min-[1160px]:w-px min-[1160px]:h-16 bg-white/10 shrink-0" />

          {/* Metrics */}
          <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 2xl:flex 2xl:flex-row 2xl:flex-wrap items-start 2xl:items-center gap-6 2xl:gap-x-0 2xl:gap-y-4 2xl:justify-between pb-2 2xl:pb-0">
            {[
              { label: "Service Name", value: TXN_DATA.details.service, color: "text-slate-600" },
              { label: "Category", value: TXN_DATA.serviceCategory, color: "text-slate-600" },
              { label: "Txn ID", value: TXN_DATA.id, color: "text-slate-600" },
              { label: "Charges", value: `₹ ${TXN_DATA.details.charges.toFixed(2)}`, color: "text-rose-400" },
              { label: "Commission", value: `₹ ${TXN_DATA.details.commission.toFixed(2)}`, color: "text-emerald-400" },
              { label: "Net Amount", value: `₹ ${TXN_DATA.details.netAmount.toFixed(2)}`, color: "text-indigo-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col gap-1.5 2xl:px-4 2xl:border-r 2xl:border-white/10 last:border-0 min-w-0 max-w-full">
                <p className="text-[12px] font-black uppercase text-slate-800 tracking-widest leading-none mb-0.5">{label}</p>
                <p className={cn("text-[12px] font-black break-all whitespace-normal leading-relaxed", color)}>{value}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px min-[1160px]:w-px min-[1160px]:h-16 bg-white/10 shrink-0" />

          {/* Button */}
          <div className="w-full min-[1160px]:w-auto shrink-0">
            <Button
              onClick={() => window.print()}
              className="w-full min-[1160px]:w-auto h-12 px-8 rounded-2xl bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs gap-2 transition-transform active:scale-95"
            >
              <Download size={16} /> Print Receipt
            </Button>
          </div>
        </div>

        {/* Section 3: Identity & Specs (Top) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <BalancedCard title="Customer Identity" icon={User} colorClass="text-indigo-600">
            <div className="space-y-2">
              <DetailRow label="Customer Name" value={TXN_DATA.details.user.split('(')[0].trim() || "N/A"} icon={User} color="text-slate-800" />
              <DetailRow label="User ID" value="USR-890121" icon={Hash} color="text-slate-800" />
              <DetailRow label="Mobile Number" value="+91 9876543210" icon={Phone} color="text-slate-800" />
              <DetailRow label="Email ID" value="contact@Pay Soluation.com" icon={Mail} color="text-indigo-600" />
            </div>
          </BalancedCard>

          <BalancedCard title="Technical Specs" icon={Hash} colorClass="text-indigo-600">
            <div className="flex flex-col">
              {/* Client Ref ID */}
              <div className="flex items-center justify-between py-3 border-b border-slate-50 group gap-2">
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <div className="h-1 w-1 rounded-full bg-current" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block break-words">Client Ref ID</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:hidden break-words">Client Ref</p>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
                  <p className="flex-1 min-w-0 text-right text-[12px] font-mono font-black tracking-tight text-slate-800 break-all sm:break-words" title={TXN_DATA.details.clientRefId}>{TXN_DATA.details.clientRefId}</p>
                  <button onClick={() => handleCopy(TXN_DATA.details.clientRefId)} className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90 shrink-0"><Copy size={13} /></button>
                </div>
              </div>

              {/* Agent ID */}
              <div className="flex items-center justify-between py-3 border-b border-slate-50 group gap-2">
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <div className="h-1 w-1 rounded-full bg-current" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">Agent ID</p>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
                  <p className="flex-1 min-w-0 text-right text-[12px] font-mono font-black tracking-tight text-slate-800 break-all sm:break-words" title="CC01RP68AGTBAA004669">CC01RP68AGTBAA004669</p>
                  <button onClick={() => handleCopy("CC01RP68AGTBAA004669")} className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90 shrink-0"><Copy size={13} /></button>
                </div>
              </div>

              {/* Operator Live ID */}
              <div className="flex items-center justify-between py-3 border-b border-slate-50 group gap-2">
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <div className="h-1 w-1 rounded-full bg-current" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block break-words">Operator Live ID</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest sm:hidden break-words">Operator</p>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
                  <p className="flex-1 min-w-0 text-right text-[12px] font-mono font-black tracking-tight text-slate-800 break-all sm:break-words" title={TXN_DATA.bbpsDetails?.txnRef || "N/A"}>{TXN_DATA.bbpsDetails?.txnRef || "N/A"}</p>
                  <button onClick={() => handleCopy(TXN_DATA.bbpsDetails?.txnRef || "N/A")} className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90 shrink-0"><Copy size={13} /></button>
                </div>
              </div>

              {/* UTR Number */}
              <div className="flex items-center justify-between py-3 last:border-none group gap-2">
                <div className="flex items-center gap-3 shrink-0 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <div className="h-1 w-1 rounded-full bg-current" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest break-words">UTR Number</p>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3 min-w-0">
                  <p className="flex-1 min-w-0 text-right text-[12px] font-mono font-black tracking-tight text-slate-800 break-all sm:break-words" title={TXN_DATA.details.utrNumber}>{TXN_DATA.details.utrNumber}</p>
                  <button onClick={() => handleCopy(TXN_DATA.details.utrNumber)} className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90 shrink-0"><Copy size={13} /></button>
                </div>
              </div>
            </div>
          </BalancedCard>
        </div>

        {/* Section 4: Financial Table (Bottom) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Precision</h3>
          </div>

          <DataTable
            pageSize={10}
            totalRecords={100}
            isLoading={false}
            hidePagination={true}
            noPadding={false}
            columns={columns}
            data={[TXN_DATA.details]}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </div>

        {/* Section 4: Live Diagnostic Stream (Compact Vertical Stack) */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4">
          {/* Request Terminal */}
          <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group">
            <div className="px-7 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 pr-2">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 ml-2 flex items-center gap-2">
                  <Globe size={12} className="animate-pulse" /> Diagnostic Request
                </span>
              </div>
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCopy(TXN_DATA.apiRequest.plainText)} className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-100 flex items-center gap-2">
                  <Copy size={11} /> Copy Payload
                </motion.button>
              </div>
            </div>
            <div className="p-7 relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700"><Terminal size={80} className="text-indigo-600" /></div>
              <pre className="text-[12px] font-mono text-slate-600 overflow-auto custom-scrollbar leading-relaxed selection:bg-indigo-100 max-h-48">
                <code className="block py-2">{TXN_DATA.apiRequest.plainText}</code>
              </pre>
            </div>
          </div>

          {/* Response Terminal */}
          <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 relative group">
            <div className="px-7 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5 pr-2">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600 ml-2 flex items-center gap-2">
                  <Activity size={12} /> Server Response
                </span>
              </div>
              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleCopy(JSON.stringify(TXN_DATA.apiResponse, null, 2))} className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-100 flex items-center gap-2">
                  <Copy size={11} /> Copy JSON
                </motion.button>
              </div>
            </div>

            <div className="p-7">
              <pre className="text-[12px] font-mono text-slate-600 overflow-auto custom-scrollbar leading-relaxed selection:bg-rose-100 max-h-48">
                <code className="block py-2">{JSON.stringify(TXN_DATA.apiResponse, null, 2)}</code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Security Footer */}
        <div className="flex items-center justify-center py-8 border-t border-slate-100 gap-4 opacity-30 mt-4">
          <ShieldCheck size={24} className="text-slate-400" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Vault Protected Entry</p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
        }
      `}} />
    </PageLayout>
  );
}
