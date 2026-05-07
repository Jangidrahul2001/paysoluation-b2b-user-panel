import React, { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { format, addDays, set } from "date-fns"
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Fingerprint,
  FileText,
  Wallet,
  ArrowRightLeft,
  Banknote,
  TrendingUp,
  ShieldCheck,
  History,
  ArrowUpRight,
  ChevronDown,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Zap,
  IndianRupee,
  Activity,
  Landmark,
  Globe,
  Headphones,
  Smartphone as SmartphoneIcon,
  Download
} from "lucide-react"
import { Button } from "../components/ui/Button"
import DashboardWalletFilter from "../components/dashboard/DashboardWalletFilter"
import { CustomDualCalendar } from "../components/dashboard/CustomDualCalendar"
import { PageLayout } from "../components/layout/PageLayout"
import { Select } from "../components/ui/Select"
import { butteryDropdown } from "../lib/animations"
import { cn } from "../lib/utils"
import { useNavigate } from "react-router-dom"
import { useFetch } from "../hooks/useFetch"
import { apiEndpoints } from "../api/apiEndpoints"
import { formatToINR, handleValidationError, ServiceLabel } from "../utils/helperFunction"
import { toast } from "sonner"

// --- Improved Sub-components ---

const WalletCard = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("today");
  const [topupData, setTopupData] = useState({
    totalTopup: 0,
    pendingTopup: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const { refetch: fetchTopupDetailsStats } = useFetch(
    `${apiEndpoints.fetchTopupDetailsStats}?range=${activeFilter}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setTopupData({
            totalTopup: data?.data?.total?.amount || 0,
            pendingTopup: data?.data?.pending?.amount || 0
          })
        }
        setIsLoading(false)
      },
      onError: (error) => {
        console.log("error in topup details data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
        setIsLoading(false)
      },
    },
    false,
  );
  useEffect(() => {

    if (activeFilter) {
      setIsLoading(true)
      fetchTopupDetailsStats();
    }
  }, [activeFilter]);




  return (
    <div className="bg-[#0f172a] rounded-2xl md:rounded-[2.8rem] p-6 xs:p-8 text-white h-full relative overflow-hidden group shadow-sm border border-slate-800/60 transition-all duration-500 hover:border-blue-500/30">

      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-[110px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-1000 group-hover:bg-indigo-600/25" />

      <div className="relative z-10 flex flex-col h-full justify-between gap-5 md:gap-6">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none">
                Your Wallet
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-white/80 tracking-tight leading-none">
                  Total Topup
                </span>
              </div>
            </div>
            <DashboardWalletFilter activeValue={activeFilter} onChange={setActiveFilter} />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-5"
          >
            <div className="flex items-baseline gap-1.5 min-w-0 overflow-hidden">

              <h3
                className="font-black tabular-nums leading-none tracking-tight truncate"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)" }}
              >
                {isLoading ? "..." : formatToINR(topupData?.totalTopup)}

              </h3>
            </div>

            <div className="grid grid-cols-[1fr_1px_1fr] items-center justify-center border-y border-white/[0.04] bg-white/[0.02] py-3.5 -mx-5 px-5 md:-mx-6 md:px-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.22em] leading-none">
                  Total Pending
                </span>
                <div className="flex items-baseline gap-1 min-w-0">
                  <span className="text-[9px] font-black text-indigo-400 shrink-0">₹</span>
                  <span
                    className="font-black text-white/90 tabular-nums leading-none tracking-tight truncate"
                    style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.15rem)" }}
                  >
                    {isLoading ? "..." : formatToINR(topupData?.pendingTopup)}
                  </span>
                </div>
              </div>

              <div className="bg-white/[0.06] h-8 w-px mx-auto" />

              <div className="flex flex-col gap-1.5 pl-3">
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.22em] leading-none">
                  Security
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <ShieldCheck size={12} className="text-emerald-500/80 shrink-0" />
                  <span className="text-[8px] md:text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none truncate">
                    Bank Grade
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-[1fr_44px] gap-2.5">
          <button onClick={() => navigate("/topup/offline")} className="bg-indigo-600 hover:bg-indigo-500 text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2.5 relative overflow-hidden cursor-pointer group/btn">
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover/btn:scale-110 group-hover/btn:rotate-12 transition-all relative z-10">
              <ArrowUpRight size={14} />
            </div>
            <span className="relative z-10">Add Money</span>
          </button>

          <button
            onClick={() => navigate("/topup/history")}
            className="bg-white/[0.03] hover:bg-white/[0.08] text-white/60 border border-white/20 h-12 rounded-2xl transition-all active:scale-95 flex items-center justify-center cursor-pointer group/btn"
            title="Transaction History"
          >
            <History
              size={16}
              className="group-hover/btn:rotate-12 transition-transform group-hover/btn:opacity-100 opacity-90"
            />
          </button>
        </div>

      </div>
    </div>
  );
};

// --- Static Data ---

const BANNER_SLIDES = [
  {
    id: 1,
    title: "Instant Payouts",
    tag: "PRO SETTLEMENTS",
    subtitle: "Speed Meets Security ⚡",
    description: "Experience the industry's fastest payout system with real-time settlement tracking and zero delays.",
    bg: "bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900",
    accent: "text-blue-300",
    icon: <TrendingUp className="w-12 h-12 md:w-20 md:h-20 opacity-40" />
  },
  {
    id: 2,
    title: "AEPS Banking",
    tag: "SMART BANKING",
    subtitle: "Aadhaar Powered ATM 🏦",
    description: "Transform your store into a digital bank branch with secure cash withdrawals and balance inquiries.",
    bg: "bg-gradient-to-br from-indigo-700 via-slate-800 to-slate-950",
    accent: "text-indigo-300",
    icon: <Fingerprint className="w-12 h-12 md:w-20 md:h-20 opacity-40" />
  },
  {
    id: 3,
    title: "Smart Transfers",
    tag: "DMT 2.0 ENGINE",
    subtitle: "Seamless Fund Transfers ✉️",
    description: "Transfer funds to any bank account instantly with our optimized direct money transfer technology.",
    bg: "bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-800",
    accent: "text-sky-300",
    icon: <ArrowRightLeft className="w-12 h-12 md:w-20 md:h-20 opacity-40" />
  }
];

const serviceStatsObj = {
  aeps: {
    name: "aeps",
    label: "AEPS",
    amount: "0.00",
    commission: "0.00",
    icon: Fingerprint,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  bbps: {
    name: "bbps",
    label: "BBPS",
    amount: "0.00",
    commission: "0.00",
    icon: FileText,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  dmt: {
    name: "dmt",
    label: "DMT",
    amount: "0.00",
    commission: "0.00",
    icon: ArrowRightLeft,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  "xpress-payout": {
    name: "xpress-payout",
    label: "Payout",
    amount: "0.00",
    commission: "0.00",
    icon: Banknote,
    color: "text-slate-700",
    bg: "bg-slate-50",
  },
  "aeps-payout": {
    name: "aeps-payout",
    label: "Payout",
    amount: "0.00",
    commission: "0.00",
    icon: Banknote,
    color: "text-slate-700",
    bg: "bg-slate-50",
  },
  "upi-payout": {
    name: "upi-payout",
    label: "Payout",
    amount: "0.00",
    commission: "0.00",
    icon: Banknote,
    color: "text-slate-700",
    bg: "bg-slate-50",
  },
  recharge: {
    name: "recharge",
    label: "Recharge",
    amount: "0.00",
    commission: "0.00",
    icon: Smartphone,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
};

const serviceStaticData = {
  recharge: { key: "recharge", label: "Recharge", icon: Smartphone, gradient: "from-blue-500 to-indigo-600", desc: "Mobile Prep", link: "/recharge" },
  aeps: { key: "aeps", label: "AEPS", icon: Fingerprint, gradient: "from-blue-500 to-blue-600", desc: "Cash Withdrawal", link: "/aeps" },
  dmt: { key: "dmt", label: "Money Transfer", icon: ArrowRightLeft, gradient: "from-blue-500 to-indigo-600", desc: "Instant DMT", link: "/money-transfer" },
  "aeps-payout": { key: "aeps-payout", label: "AEPS Payout", icon: Wallet, gradient: "from-blue-500 to-blue-600", desc: "Instant Settl.", link: "/aeps-payout" },
  "xpress-payout": { key: "xpress-payout", label: "Xpress Payout", icon: Wallet, gradient: "from-blue-500 to-blue-600", desc: "Instant Settl.", link: "/xpress-transfer" },
  "upi-payout": { key: "upi-payout", label: "UPI Payout", icon: Wallet, gradient: "from-blue-500 to-blue-600", desc: "Instant Settl.", link: "/xpress-transfer" },
  bbps: { key: "bbps", label: "Bill Payment", icon: FileText, gradient: "from-blue-500 to-indigo-600", desc: "Utility Bills", link: "/bill-payment" },
  "online-service": { key: "online-service", label: "Online Service", icon: Globe, gradient: "from-blue-500 to-blue-600", desc: "Online service", link: "/offline-service" },
  "offline-service": { key: "oofline-service", label: "Offline Service", icon: Landmark, gradient: "from-blue-500 to-indigo-600", desc: "Offline service", link: "/online-service" },
};

// --- Sub-components (BannerSlider) ---

function BannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length)

  const slide = BANNER_SLIDES[currentSlide]

  return (
    <div className="relative w-full h-full rounded-2xl md:rounded-[2.8rem] overflow-hidden shadow-sm border border-white/5 bg-indigo-600">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className={`absolute inset-0 ${slide.bg} overflow-hidden`}
        >
          {/* Decorative Blobs */}
          <div
            className="absolute inset-y-0 right-0 w-[55%] pointer-events-none z-0"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[90%] h-[90%] opacity-25"
            >
              <ellipse cx="220" cy="200" rx="180" ry="175" fill="white" fillOpacity="0.08" />
              <ellipse cx="260" cy="180" rx="130" ry="125" fill="white" fillOpacity="0.06" />
              <ellipse cx="300" cy="200" rx="90" ry="85" fill="white" fillOpacity="0.05" />
            </svg>
          </div>

          {/* Background Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 0.1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute right-[4%] top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 text-white"
            style={{ width: "clamp(70px, 16vw, 200px)", height: "clamp(70px, 16vw, 200px)" }}
          >
            <div className="w-full h-full [&>svg]:w-full [&>svg]:h-full">
              {slide.icon}
            </div>
          </motion.div>

          {/* Main Text Content */}
          <div className="absolute inset-0 z-10 flex items-center px-5 sm:px-5 md:px-8 lg:px-12">
            <div className="flex flex-col gap-2 sm:gap-4 w-full max-w-[90%] sm:max-w-[80%] md:max-w-[80%] lg:max-w-[80%]">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-[0.85rem] px-3 py-1.5 sm:px-4 sm:py-2 w-fit flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse shadow-[0_0_6px_rgba(147,197,253,0.9)]" />
                <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.22em] text-white/90">
                  {slide.tag}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                className="font-black leading-[1.08] tracking-tight text-white/95"
                style={{ fontSize: "clamp(1.2rem, 2.2vw, 2.8rem)" }}
              >
                {slide.subtitle}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, x: -35 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="text-white/55 font-medium leading-relaxed"
                style={{ fontSize: "clamp(0.7rem, 1.2vw, 1rem)" }}
              >
                {slide.description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav Arrows - Moved outside for stability */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 flex gap-2 z-20">
        <button
          onClick={prevSlide}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-xl flex items-center justify-center text-white transition-all border border-white/10 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={14} className="text-white/80" />
        </button>
        <button
          onClick={nextSlide}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-xl flex items-center justify-center text-white transition-all border border-white/10 shadow-xl cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight size={14} className="text-white/80" />
        </button>
      </div>

      {/* Pagination - Moved outside for stability */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 flex items-center gap-2 z-20 bg-white/5 backdrop-blur-xl px-3 py-2 rounded-full border border-white/10">
        {BANNER_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 transition-all duration-500 cursor-pointer rounded-full ${currentSlide === idx
              ? "w-7 sm:w-9 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
              : "w-1.5 bg-white/25 hover:bg-white/45"
              }`}
          />
        ))}
      </div>
    </div>
  )
}

// --- Main Page Component ---

export default function Dashboard() {
  const navigate = useNavigate()
  // Calendar & Report State
  const [date, setDate] = useState({
    from: undefined,
    to: undefined
  });
  const [serviceReportsYearly, setServiceReportsYearly] = useState({
    data: [],
    minRange: 0,
    maxRange: 100,
    range: [100, 80, 60, 40, 20, 0]
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const calendarRef = useRef(null);

  // Responsive check for portal
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isNarrow, setIsNarrow] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);

    // Adaptive layout for header based on available width
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        setIsNarrow(entries[0].contentRect.width < 600);
      });
      observer.observe(containerRef.current);
      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [serviceOptions, setServiceOptions] = useState([

  ]);

  const handleReset = () => {
    setDate({ from: undefined, to: undefined });
  };
  const handleSearch = () => {
    console.log("Filtering dashboard overview for:", date);
  };
  const { refetch: fetchServicesList } = useFetch(
    `${apiEndpoints.allServiceList}`,
    {
      onSuccess: (data) => {
        if (data && data.data && data.success) {
          const temp = data.data.map((item) => ({ ...item, label: item.label, value: item.name }))
          setServiceOptions(temp)
          setSelectedService(temp[0].name)

          console.log(data)
        }
      },
      onError: (error) => {
        console.log("error in servicesList data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { refetch: fetchServiceReportsYearly } = useFetch(
    `${apiEndpoints.fetchServiceReportsYearly}`,
    {
      onSuccess: (data) => {
        if (data && data.data && data.success) {
          const range = data.data.map((item) => {
            return item.amount
          })
          const min = Math.floor(Math.min(...range) / 100) * 100;
          const max = Math.ceil(Math.max(...range) / 100) * 100;
          const points = 6;
          const step = (max - min) / (points - 1);
          const steps = Array.from({ length: points }, (_, i) => max - i * step);
          setServiceReportsYearly({ data: data.data, minRange: min, maxRange: max, range: steps })

        }
      },
      onError: (error) => {
        console.log("error in serviceReportsYearly data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );
  console.log(serviceReportsYearly)
  const { data: profile, error: profileError, loading: profileLoading } = useSelector((state) => state.profile);



  return (
    <PageLayout
      title="Dashboard"
      subtitle="Overview of your business performance & real-time analytics"
      className="max-w-[1600px] mx-auto py-2"
      actions={
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/support")}
            variant="outline"
            className="rounded-xl h-11 px-6 font-black text-[11px] uppercase tracking-widest border-slate-200/60 bg-white/50 backdrop-blur-md hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex items-center gap-2"
          >
            <Headphones size={16} />
            Technical Support
          </Button>
          <Button
            className="rounded-xl h-11 px-6 font-black text-[11px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
          >
            <SmartphoneIcon size={16} />
            Download App
          </Button>
        </div>
      }
    >
      <div ref={containerRef} className="flex flex-col gap-8 md:gap-10">

        {/* 1. Top Section: Banner + Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 md:gap-6 lg:gap-6 lg:min-h-[400px]">
          {/* Banner (8 cols) */}
          <div className="lg:col-span-8 h-[220px] xs:h-[260px] sm:h-[300px] md:h-[340px] lg:h-[340px] xl:h-[380px] 2xl:h-auto">
            <BannerSlider />
          </div>

          {/* Wallet Card (4 cols) */}
          <div className="lg:col-span-4 h-[280px] xs:h-[260px] sm:h-[300px] md:h-[340px] lg:h-[340px] xl:h-[380px] 2xl:h-auto">
            <WalletCard />
          </div>
        </div>

        {/* 2. Performance Matrix Section (Now immediately below banner) */}
        <div className="space-y-8 mt-4 bg-slate-50/30 rounded-[3rem] p-2 md:p-8 border border-slate-100/50 shadow-sm transition-all hover:bg-white duration-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="w-16 h-1.5 sm:w-1.5 sm:h-10 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)] mb-1 sm:mb-0" />
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h3 className="font-black text-slate-900 text-xl md:text-2xl uppercase tracking-tight leading-none">Performance Matrix</h3>
                <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">Real-time Comparative Audit</p>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-2 md:gap-3 lg:gap-4 flex-nowrap shrink-0",
              isNarrow ? "justify-center w-full" : "justify-end"
            )}>
              <div className={cn(
                "transition-all duration-300",
                isNarrow ? "flex-1" : "w-[120px] xs:w-[150px] sm:w-[190px]"
              )}>
                <Select
                  placeholder="Select Service"
                  options={serviceOptions}
                  value={selectedService}
                  onChange={setSelectedService}
                  className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 transition-all rounded-xl bg-white shadow-sm font-bold h-10 md:h-11 text-[11px] md:text-sm"
                />
              </div>

              <div className={cn(
                "relative transition-all duration-300",
                isNarrow ? "flex-1" : "w-[120px] xs:w-[150px] sm:w-[190px]"
              )} ref={calendarRef}>
                <div
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className={cn(
                    "h-10 md:h-11 px-3 sm:px-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-[11px] md:text-[13px] font-bold text-slate-700 shadow-sm cursor-pointer hover:border-[#2f35cd]/50 hover:bg-slate-50 transition-all group select-none overflow-hidden",
                    !date?.from && "text-slate-400",
                    isCalendarOpen && "border-[#2f35cd]/50 ring-4 ring-[#2f35cd]/10"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 group-hover:text-[#2f35cd] transition-colors shrink-0" />
                    <span className="whitespace-nowrap truncate tracking-tight">
                      {date?.from ? (
                        date.to ? (
                          <>{format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}</>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-all duration-300 ml-1",
                    isCalendarOpen ? "rotate-180 text-[#2f35cd]" : "text-slate-300"
                  )} />
                </div>

                <AnimatePresence>
                  {isCalendarOpen && !isMobile && (
                    <motion.div
                      {...butteryDropdown}
                      className="absolute right-0 top-full mt-2 z-[9999] origin-top-right shadow-2xl rounded-2xl border border-slate-100 bg-white overflow-hidden ring-1 ring-slate-200/50 hidden sm:block"
                      style={{ width: 'max-content', maxWidth: '94vw' }}
                    >
                      <CustomDualCalendar
                        date={date}
                        setDate={setDate}
                        onApply={() => { setIsCalendarOpen(false); handleSearch(); }}
                        onReset={() => { handleReset(); setIsCalendarOpen(false); }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {createPortal(
                  <AnimatePresence>
                    {isCalendarOpen && isMobile && (
                      <div id="mobile-calendar-portal" className="fixed inset-0 z-[99999] sm:hidden">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsCalendarOpen(false)}
                          className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm"
                        />
                        <motion.div
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ type: "spring", damping: 22, stiffness: 350, mass: 0.5 }}
                          className="absolute bottom-0 left-0 right-0 bg-white overflow-hidden rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] origin-bottom"
                        >
                          <CustomDualCalendar
                            date={date}
                            setDate={setDate}
                            onApply={() => { setIsCalendarOpen(false); handleSearch(); }}
                            onReset={() => { handleReset(); setIsCalendarOpen(false); }}
                          />
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>,
                  document.body
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2">
            {/* Box 1: Order Statistics (Now 2/3 Width) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.8rem] border border-slate-100 p-8 shadow-sm flex flex-col group overflow-hidden relative lg:col-span-2 min-h-[380px]"
            >
              <div className="flex items-center justify-between mb-8 z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-black text-slate-400/80 uppercase tracking-widest leading-none">Order Statistics</span>
                  <h4 className="text-xl font-black text-slate-900 tracking-tightest leading-none mt-1">Xpress Payout</h4>
                </div>
              </div>

              <div className="relative flex-1 w-full z-10 mt-2">
                {/* Y-Axis Labels */}
                <div className="absolute inset-y-0 left-0 flex flex-col justify-between py-1 text-[10px] font-bold text-slate-300 pointer-events-none pb-5">
                  {serviceReportsYearly?.range?.map((step) => (
                    <span>{step}</span>
                  ))}
                </div>

                <div className="ml-10 h-full relative">


                  {/* Bars Grid */}
                  <div className="absolute inset-0 flex items-end justify-between px-2 pb-1">
                    {serviceReportsYearly?.data?.map((bar, i) => (
                      <div key={i} className="flex flex-col items-center gap-3 w-[6.5%] group/bar relative">
                        <div className="absolute -top-10 bg-emerald-600 text-white px-3 py-1.5 rounded-xl font-black text-[9px] shadow-lg shadow-emerald-200 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-emerald-600 z-20 whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200">
                          {bar.amount}
                        </div>

                        <div className="w-full relative flex flex-col gap-0" style={{
                          height: `${Math.min(bar?.amount * 1.45, 160)}px`
                        }}>
                          <div className={cn(
                            "h-1/2 w-full rounded-[1rem] relative z-10 shadow-sm bg-emerald-500 transition-all duration-500 ",
                          )} />
                          <div className="flex-1 w-full bg-slate-50 relative mt-[-10px] rounded-b-[1rem] overflow-hidden">
                            <svg className="w-full h-full">
                              <pattern id={`hashPattern-${i}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <rect width="1.5" height="8" fill={"#10b98120"} />
                              </pattern>
                              <rect width="100%" height="100%" fill={`url(#hashPattern-${i})`} />
                            </svg>
                          </div>
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none truncate w-full text-center">
                          <span className="hidden xl:inline">{bar?.month?.slice(0, 3)}</span>
                          <span className="xl:hidden">{bar?.month?.slice(0, 1)}</span>
                        </span>
                      </div>
                    ))}
                  </div>


                </div>
              </div>
            </motion.div>

            {/* Box 2: Today Performance (1/3 Width) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.8rem] border border-slate-100 p-6 xs:p-8 shadow-sm flex flex-col group relative overflow-hidden lg:col-span-1"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-black text-slate-800 tracking-tight">Today Performance</h4>
                <span className="text-[10px] font-bold text-slate-400 cursor-pointer hover:text-blue-600 transition-colors">Details</span>
              </div>

              {/* Gauge Visualization */}
              <div className="relative flex-1 flex flex-col items-center justify-center min-h-[220px] xs:min-h-[260px] py-4 xs:py-8">
                <div className="w-full max-w-[340px] relative">
                  <svg viewBox="0 0 120 70" className="w-full h-full drop-shadow-sm">
                    <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                    <motion.path
                      d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#3d2b24" strokeWidth="12" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 0.72 }} transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    <path d="M 25 60 A 35 35 0 0 1 95 60" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                    <motion.path
                      d="M 25 60 A 35 35 0 0 1 95 60" fill="none" stroke="#ffb74d" strokeWidth="12" strokeLinecap="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 0.65 }} transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                    />
                  </svg>

                  {/* Center Labels Fixed */}
                  <div className="absolute top-[65%] left-1/2 -translate-x-1/2 flex flex-col items-center w-full text-center mt-2">
                    <div className="flex flex-col items-center gap-0">
                      <span className="text-lg xs:text-lg sm:text-xl font-black text-slate-900 tracking-tightest leading-tight">
                        <span className="text-base xs:text-lg opacity-40 mr-1">₹</span>12,450
                      </span>
                    </div>
                    <span className="text-[8px] xs:text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">Today Revenue</span>
                  </div>
                </div>
              </div>

              {/* Stats Footer Responsive */}
              <div className="mt-4 pt-4 border-t border-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5 min-w-fit">
                      <div className="w-2 h-2 rounded-full bg-[#3d2b24]" />
                      <span className="text-[11px] font-bold text-slate-600">Revenue</span>
                      <span className="text-[10px] font-black text-emerald-500">↗ 25.9%</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-fit">
                      <div className="w-2 h-2 rounded-full bg-[#ffb74d]" />
                      <span className="text-[11px] font-bold text-slate-600">Sale</span>
                      <span className="text-[10px] font-black text-amber-500">↗ 20%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-bold text-slate-500">Yesterday</span>
                  </div>
                  <span className="text-[12px] font-black text-slate-700">₹ 8,120.50</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 3. Analytics Section (Boxed and Modernized) */}
        <div className="space-y-10 bg-slate-50/40 rounded-[3rem] p-2 md:p-8 border border-slate-100/60 shadow-sm transition-all hover:bg-white duration-500">
          <div className={cn(
            "flex items-center justify-between gap-4 px-2 min-w-0",
            isNarrow ? "flex-col" : "flex-row"
          )}>
            <div className={cn(
              "flex items-center gap-4 transition-all",
              isNarrow ? "flex-col items-center pb-4" : "flex-row"
            )}>
              <div className={cn("relative shrink-0 transition-all", isNarrow ? "w-20 h-1 mb-2" : "w-1.5 h-10")}>
                <div className={cn("bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all", isNarrow ? "w-full h-full" : "w-1.5 h-10")} />
              </div>
              <div className={cn("flex flex-col gap-1 transition-all text-center sm:text-left", isNarrow && "items-center")}>
                <h2 className="font-black text-slate-900 text-xl md:text-2xl tracking-tightest uppercase leading-none">Analytics</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-[11px] leading-none mt-1">Service Performance Overview</p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-7 px-2">
            {profile?.assignedServices
              ?.filter(
                (service) =>
                  service.name !== "offline-service" &&
                  service.name !== "online-service"
              )
              .map((stat, idx) => {
                const serviceData = serviceStatsObj?.[stat.name];
                const Icon = serviceData?.icon;

                return (
                  <motion.div
                    key={stat.name || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.6 }}
                    className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-4 md:p-6 border border-slate-100 flex flex-col group min-h-[220px] relative overflow-hidden transition-all duration-500"
                  >
                    <div className="flex items-center justify-between mb-8 z-10 ">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center border border-slate-100 shadow-sm transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white">
                        {Icon && <Icon size={22} />}
                      </div>

                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                        {ServiceLabel(stat.name)}
                      </span>
                    </div>

                    <div className="mt-auto z-10 flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black text-slate-400/70 uppercase tracking-widest">
                          Volume
                        </span>
                        <p className="text-2xl font-black text-slate-900 tracking-tightest leading-none">
                          ₹ {stat.amount || "0.00"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          Comm.
                        </span>
                        <span className="text-[11px] font-black text-emerald-600">
                          ₹ {stat.commission || "0.00"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* 4. Service Terminal Section (Boxed and Modernized) */}
        <div className="space-y-10 bg-slate-50/40 rounded-[3rem] p-2 md:p-8 border border-slate-100/60 shadow-sm transition-all hover:bg-white duration-500">
          <div className={cn(
            "flex items-center justify-between px-2 transition-all duration-500",
            isNarrow ? "flex-col justify-center text-center pb-6" : "flex-row"
          )}>
            <div className={cn(
              "flex items-center gap-4 transition-all",
              isNarrow ? "flex-col" : "flex-row"
            )}>
              <div className={cn("relative shrink-0 transition-all", isNarrow ? "w-20 h-1 mb-2" : "w-1.5 h-10")}>
                <div className="bg-indigo-600 rounded-full h-full w-full" />
              </div>
              <div className={cn("flex flex-col gap-1 transition-all text-center sm:text-left", isNarrow && "items-center")}>
                <h2 className="font-black text-slate-900 text-xl md:text-2xl tracking-tightest uppercase leading-none">Service Terminal</h2>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] md:text-[11px] leading-none mt-1">Access your core business tools</p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {profile?.assignedServices?.map((service, idx) => {
              const ServiceIcon = serviceStaticData?.[service.name]?.icon || Zap;
              const url = serviceStaticData?.[service.name]?.link || "/dashboard"
              const serviceData = serviceStaticData?.[service.name] || { label: service.name, desc: "Access", gradient: "from-slate-400 to-slate-600" };

              return (
                <motion.div
                  key={service._id || idx}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => navigate(url)}
                  whileHover={{ backgroundColor: "rgb(248 250 252)" }}
                  className="relative overflow-hidden rounded-2xl p-3 sm:p-4 border border-slate-100 bg-white flex items-center justify-between cursor-pointer group transition-all duration-300 shadow-xs hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${serviceData.gradient} flex items-center justify-center text-white transition-all shadow-md group-hover:scale-105 duration-500`}>
                      <ServiceIcon size={18} className="sm:size-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] sm:text-sm font-black text-slate-800 leading-none truncate group-hover:text-blue-600 transition-colors">{serviceData.label}</span>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 truncate">{serviceData.desc}</p>
                    </div>
                  </div>

                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">
                    <ChevronRight size={14} className="sm:size-4" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </PageLayout>
  )
}
