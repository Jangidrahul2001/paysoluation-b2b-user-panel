import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  IndianRupee,
  User,
  Hash,
  Calendar,
  Tag,
  FileText,
  Copy,
  Phone,
  Mail,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { formatDate, formatToINR } from '../utils/helperFunction';

// Mock data based on wallet ledger structure
const TRANSACTION_DATA = {
  _id: "507f1f77bcf86cd799439011",
  createdAt: "2024-03-10T10:05:57.000Z",
  fullName: "Camlenio Software",
  userName: "camlenio123",
  email: "contact@camlenio.com",
  phone: "+91 9876543210",
  serviceType: "BBPS",
  serviceCategory: "UTILITY BILLS",
  entryType: "REFUND",
  referenceId: "FUTS98DRD351O27C7Z570XM14V482611025",
  openingBalance: 2109.61,
  amount: 948.00,
  commission: 0.25,
  charge: 0.00,
  gstAmount: 0.00,
  tdsAmount: 0.00,
  closingBalance: 3057.61,
  type: "credit",
  status: "failed",
  description: "BBPS Failed Refund - Provider Timeout"
};

// Metric Card Component
const MetricCard = ({ label, value, subLabel, icon: Icon, variant = "blue" }) => {
  const bgColors = {
    blue: "from-blue-600 to-indigo-800 shadow-blue-500/10",
    emerald: "from-emerald-600 to-teal-700 shadow-emerald-500/10",
    rose: "from-rose-600 to-red-700 shadow-rose-500/10",
    amber: "from-amber-500 to-orange-600 shadow-amber-500/10",
    dark: "from-slate-900 to-black shadow-slate-900/20",
  };

  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 text-white bg-gradient-to-br shadow-md transition-transform hover:-translate-y-0.5 duration-300", bgColors[variant])}>
      <div className="absolute -top-1 -right-1 p-3 opacity-10 text-white">
        <Icon className="w-16 h-16 rotate-12" />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 opacity-80">
          <Icon className="w-3 h-3 text-white" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
        </div>
        <div className="text-left">
          <h3 className="text-xl font-black tracking-tighter tabular-nums leading-none mb-1">{value}</h3>
          <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest line-clamp-1">{subLabel}</p>
        </div>
      </div>
    </div>
  );
};

// Detail Item Component
const DetailItem = ({ label, value, icon: Icon, color = "indigo" }) => {
  const colors = {
    indigo: "text-[#2f35cd] bg-[#2f35cd]/8 border-[#2f35cd]/20",
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    rose: "text-rose-700 bg-rose-50 border-rose-200",
    amber: "text-amber-700 bg-amber-50 border-amber-200",
    slate: "text-slate-600 bg-slate-100 border-slate-200",
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm group border border-slate-100/80 hover:border-slate-200">
      <div className={cn("h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center border shrink-0 transition-all group-hover:scale-105", colors[color])}>
        <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      </div>
      <div className="flex flex-col min-w-0 text-left flex-1">
        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[12px] font-bold text-slate-800 tracking-tight truncate flex-1">{value}</span>
          {(label.toLowerCase().includes('id') || label.toLowerCase().includes('reference')) && (
            <button
              onClick={() => handleCopy(value)}
              className="text-slate-300 hover:text-indigo-600 transition-colors active:scale-90 shrink-0"
            >
              <Copy size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function WalletTransactionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Get status variant for metric card
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return 'emerald';
      case 'failed': return 'rose';
      case 'pending': return 'amber';
      case 'refund': return 'blue';
      default: return 'dark';
    }
  };

  // Get type color
  const getTypeColor = (type) => {
    return type?.toLowerCase() === 'credit' ? 'text-emerald-600' : 'text-rose-600';
  };

  return (
    <PageLayout
      title="Wallet Transaction Details"
      subtitle={`Transaction Reference: ${TRANSACTION_DATA.referenceId}`}
      showBackButton
      className="max-w-[1600px] mx-auto py-4"
    >
      <div className="space-y-6 px-2 sm:px-6">

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Transaction Amount"
            value={formatToINR(TRANSACTION_DATA.amount)}
            subLabel="Primary Value"
            icon={IndianRupee}
            variant="dark"
          />
          <MetricCard
            label="Status"
            value={TRANSACTION_DATA.status?.toUpperCase()}
            subLabel="Current State"
            icon={Activity}
            variant={getStatusVariant(TRANSACTION_DATA.status)}
          />
          <MetricCard
            label="Commission"
            value={formatToINR(TRANSACTION_DATA.commission)}
            subLabel="Earned Amount"
            icon={Zap}
            variant="emerald"
          />
          <MetricCard
            label="Entry Type"
            value={TRANSACTION_DATA.entryType}
            subLabel="Transaction Category"
            icon={Tag}
            variant="blue"
          />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#2f35cd] rounded-lg flex items-center justify-center text-white shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Transaction Details</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest text-left">Comprehensive Transaction Information</p>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Basic Information */}
              <DetailItem label="Date & Time" value={formatDate(TRANSACTION_DATA.createdAt)} icon={Calendar} color="indigo" />
              <DetailItem label="Reference ID" value={TRANSACTION_DATA.referenceId} icon={Hash} color="indigo" />
              <DetailItem label="Service Type" value={TRANSACTION_DATA.serviceType} icon={Tag} color="indigo" />
              <DetailItem label="Service Category" value={TRANSACTION_DATA.serviceCategory} icon={Tag} color="indigo" />
              <DetailItem label="Entry Type" value={TRANSACTION_DATA.entryType} icon={Activity} color="indigo" />

              {/* User Information */}
              <DetailItem label="Customer Name" value={TRANSACTION_DATA.fullName} icon={User} color="indigo" />
              <DetailItem label="Username" value={TRANSACTION_DATA.userName} icon={Hash} color="indigo" />
              <DetailItem label="Email" value={TRANSACTION_DATA.email} icon={Mail} color="indigo" />
              <DetailItem label="Phone" value={TRANSACTION_DATA.phone} icon={Phone} color="indigo" />

              {/* Financial Information */}
              <DetailItem label="Opening Balance" value={formatToINR(TRANSACTION_DATA.openingBalance)} icon={IndianRupee} color="slate" />
              <DetailItem label="Transaction Amount" value={formatToINR(TRANSACTION_DATA.amount)} icon={IndianRupee} color="indigo" />
              <DetailItem label="Commission" value={formatToINR(TRANSACTION_DATA.commission)} icon={TrendingUp} color="emerald" />
              <DetailItem label="Charges" value={formatToINR(TRANSACTION_DATA.charge)} icon={TrendingDown} color="rose" />
              <DetailItem label="GST Amount" value={formatToINR(TRANSACTION_DATA.gstAmount)} icon={ShieldCheck} color="amber" />
              <DetailItem label="TDS Amount" value={formatToINR(TRANSACTION_DATA.tdsAmount)} icon={ShieldCheck} color="amber" />
              <DetailItem label="Closing Balance" value={formatToINR(TRANSACTION_DATA.closingBalance)} icon={IndianRupee} color="slate" />

              {/* Transaction Type & Status */}
              <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm group border border-slate-100/80 hover:border-slate-200">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center border shrink-0 transition-all group-hover:scale-105 text-slate-600 bg-slate-100 border-slate-200">
                  {TRANSACTION_DATA.type === 'credit' ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                </div>
                <div className="flex flex-col min-w-0 text-left flex-1">
                  <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Transaction Type</span>
                  <span className={cn("text-[10px] sm:text-[12px] font-bold tracking-tight truncate flex-1 capitalize", getTypeColor(TRANSACTION_DATA.type))}>
                    {TRANSACTION_DATA.type}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2 lg:col-span-3">
                <DetailItem label="Description" value={TRANSACTION_DATA.description} icon={FileText} color="indigo" />
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center py-8 border-t border-slate-100 gap-4 opacity-30 mt-4">
          <ShieldCheck size={24} className="text-slate-400" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Secure Transaction Audit</p>
        </div>

      </div>
    </PageLayout>
  );
}
