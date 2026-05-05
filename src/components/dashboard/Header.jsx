import React, { useEffect, useRef, useState } from "react";
import {
  Bell,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  Wallet,
  Megaphone,
  RotateCw,
  Fingerprint,
  Smartphone,
  FileText,
  Send,
  PanelLeftOpen,
  PanelLeftClose,
  X,
  CreditCard,
  ChevronDown
} from "lucide-react";
import { Button } from "../ui/Button";
import { m, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "../../lib/utils";
import { apiEndpoints } from "../../api/apiEndpoints";
import { useFetch } from "../../hooks/useFetch";
import { handleValidationError } from "../../utils/helperFunction";
import { toast } from "sonner";
import { useNotifications } from "../../hooks/useNotifications";
import { fetchWallet } from "../../store/slices/walletSlice";
import { butteryDropdown, getButteryOrigin } from "../../lib/animations";


// Reusable Premium Action Button Component
const HeaderActionButton = ({
  onClick,
  disabled,
  className,
  icon: Icon,
  spin,
  children,
  variant = "filled",
}) => {
  const baseStyles =
    "h-10 w-10 relative rounded-full hover:scale-105 active:scale-95 transition-all duration-300 border flex items-center justify-center";

  const variants = {
    filled:
      "bg-slate-950 hover:bg-indigo-700 text-white shadow-lg shadow-slate-950/10 border-transparent",
    ghost:
      "bg-white/50 hover:bg-white text-slate-500 border-slate-200/50 shadow-sm hover:shadow-md hover:text-slate-900",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseStyles, variants[variant], className)}
    >
      {Icon && <Icon className={cn("h-4.5 w-4.5", spin && "animate-spin")} />}
      {children}
    </button>
  );
};

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { data: profile, error: profileError } = useSelector((state) => state.profile);
  const { data: wallet, loading: walletLoading } = useSelector((state) => state.wallet);

  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showTicker, setShowTicker] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  // Mock data for ticker and notifications since project hooks are missing
  const [newsTicker, setNewsTicker] = useState([

  ]);
  const { refetch: fetchNotifications } = useFetch(
    `${apiEndpoints.allNotifications}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          const temp = data?.data?.map((item) => (item.name));

          setNewsTicker(temp);
        }
      },
      onError: (error) => {
        console.log("error in notification data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const { notifications, isLoading: notifLoading } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;
  const hasUnreadNotifications = unreadCount > 0;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileView = windowWidth <= 668;
  const isSmallMobile = windowWidth < 498; // Updated to 498px for sidebar toggle button visibility

  // Click Outside Logic
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !notifRef.current?.contains(event.target) && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(fetchWallet());
    setIsRefreshing(false);
  };

  // const hasUnreadNotifications = notifications.some((n) => !n.isRead); 

  const handleLogout = () => {
    toast.success("Logged out successfully");

    // Slight delay to ensure toast is triggered before component unmounts
    setTimeout(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("isAuthenticated");
      navigate("/login");
    }, 100);
  };

  return (
    <div className="flex flex-col bg-blue-50/40 sticky top-0 z-50 border-b border-blue-200/40">
      <AnimatePresence>
        {showTicker && isMobileView && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "1.6rem", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-tr from-white to-indigo-50/30 flex items-center px-6 overflow-hidden relative group"
          >
            <div className="flex items-center text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] gap-2">
              <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
              Live Update
            </div>
            <div className="flex-1 overflow-hidden relative h-4 ml-8">
              <m.div
                initial={{ x: "100%" }}
                animate={{ x: "-100%" }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute whitespace-nowrap text-[10px] font-semibold text-slate-500 flex items-center gap-12"
              >
                {[...newsTicker, ...newsTicker, ...newsTicker].map((text, i) => (
                  <span key={i} className="flex items-center gap-3">
                    <span className="text-slate-200">/</span> {text}
                  </span>
                ))}
              </m.div>
            </div>
            <button
              onClick={() => setShowTicker(false)}
              className="h-5 w-5 ml-4 hover:bg-indigo-600 rounded-lg transition-all opacity-60 group-hover:opacity-100 bg-transparent"
            >
              <X className="h-2.5 w-2.5 text-slate-400 mx-auto" />
            </button>
          </m.div>
        )}
      </AnimatePresence>

      <header className="flex h-13 md:h-15 lg:h-16 items-center justify-between gap-2 md:gap-4 px-3 md:px-6 lg:px-8">

        {/* Left Section: Branding/Ticker/Status */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 pr-2 md:pr-4">
          {/* Sidebar toggle - Shown on all screens < 1024px */}
          {isSmallMobile && (
            <HeaderActionButton
              icon={PanelLeftOpen}
              onClick={onMenuClick}
              className="!h-9 !w-9 bg-indigo-600 text-white rounded-full shadow-md border-white/5 active:scale-90 xs:hidden"
            />
          )}

          {/* Desktop Ticker - Inline Header Version (Shown only on > 668px) */}
          {!isMobileView && showTicker && (
            <div className="flex items-center gap-2 md:gap-3 bg-white/50 border border-blue-100/40 px-3 md:px-4 py-1.5 rounded-full overflow-hidden relative flex-1 max-w-[300px] lg:max-w-[450px] xl:max-w-[500px] group/ticker shadow-sm">
              <div className="flex items-center text-[8px] md:text-[9px] font-black text-blue-500 uppercase tracking-widest gap-1.5 md:gap-2 flex-shrink-0 z-10">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-sm" />
                Live
              </div>
              <div className="flex-1 overflow-hidden relative h-4">
                <m.div
                  initial={{ x: "100%" }}
                  animate={{ x: "-100%" }}
                  transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop"
                  }}
                  className="absolute whitespace-nowrap text-[9px] md:text-[10px] font-semibold text-slate-500 flex items-center"
                >
                  <div className="flex items-center gap-8 md:gap-10 pr-10">
                    {[...newsTicker, ...newsTicker, ...newsTicker].map((text, i) => (
                      <span key={i} className="flex items-center gap-3 md:gap-4">
                        <span className="text-slate-300">/</span> {text}
                      </span>
                    ))}
                  </div>
                </m.div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Wallets & Profile Actions */}
        <div className="flex items-center gap-1.5 md:gap-4 lg:gap-6 flex-shrink-0">

          {/* Themed Wallet Control Bar - Compact & Responsive */}
          <div className="flex items-center bg-slate-100/50 md:bg-slate-100/50 p-0.5 rounded-full border border-slate-200/50 shadow-sm transition-all duration-300 flex-shrink-0">

            {/* AEPS Theme - Amber/Orange */}
            <m.div
              className="flex items-center gap-1 md:gap-2.5 px-1.5 md:px-4 py-1 rounded-l-full bg-white/50 hover:bg-white transition-all cursor-pointer flex-shrink group min-w-0"
            >
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <Fingerprint size={12} className="md:size-4 text-amber-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[6px] md:text-[8px] font-black text-amber-600 uppercase tracking-tighter md:tracking-widest leading-none mb-0.5">AePS</span>
                <span className={cn(
                  "text-[10px] md:text-[12px] lg:text-[13px] font-bold text-slate-900 leading-none tabular-nums truncate max-w-[45px] sm:max-w-none transition-opacity duration-300",
                  walletLoading && "opacity-50"
                )}>
                  ₹{(!wallet && walletLoading) ? "..." : (wallet?.aepsWallet || "0")}
                </span>
              </div>
            </m.div>

            <div className="w-px h-4 md:h-6 bg-slate-200/60 flex-shrink-0" />

            {/* Main Wallet Theme - Indigo/Blue */}
            <m.div
              className="flex items-center gap-1 md:gap-2.5 px-1.5 md:px-4 py-1 rounded-r-full bg-white/50 hover:bg-white transition-all cursor-pointer flex-shrink group min-w-0"
            >
              <div className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                <Wallet size={12} className="md:size-4 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[6px] md:text-[8px] font-black text-indigo-600 uppercase tracking-tighter md:tracking-widest leading-none mb-0.5">MAIN</span>
                <span className={cn(
                  "text-[10px] md:text-[12px] lg:text-[13px] font-bold text-slate-900 leading-none tabular-nums truncate max-w-[45px] sm:max-w-none transition-opacity duration-300",
                  walletLoading && "opacity-50"
                )}>
                  ₹{(!wallet && walletLoading) ? "..." : (wallet?.mainWallet || "0")}
                </span>
              </div>
            </m.div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 pl-1.5 md:pl-4 lg:pl-5  !bg-slate-100/50 md:!bg-slate-100/50 border-l border-slate-200/50 flex-shrink-0">
            <HeaderActionButton
              icon={RotateCw}
              onClick={handleRefresh}
              spin={isRefreshing}
              variant="ghost"
              className="!h-7.5 !w-7.5 md:!h-8.5 lg:!h-9 md:!w-8.5 lg:!w-9 !rounded-full !bg-slate-50/50 !bg-white/80 hover:!bg-white border-slate-100/50 shadow-sm hover:shadow-sm"
            />

            <div className="relative" ref={notifRef}>
              <HeaderActionButton
                icon={Bell}
                variant="ghost"
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsOpen(false) }}
                className="!h-7.5 !w-7.5 md:!h-8.5 lg:!h-9 md:!w-8.5 lg:!w-9 !rounded-full !bg-slate-50/50 !bg-white/80 hover:!bg-white border-slate-100/50 shadow-sm hover:shadow-sm"
              >
                {hasUnreadNotifications && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-600 ring-2 ring-white" />
                )}
              </HeaderActionButton>
              <AnimatePresence>
                {isNotifOpen && (
                  <NotificationDropdown notifications={notifications} onClose={() => setIsNotifOpen(false)} />
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 w-8 md:h-9 lg:h-10 md:w-9 lg:w-10 rounded-full border border-slate-200/60 shadow-sm overflow-hidden hover:scale-105 active:scale-95 transition-all bg-transparent flex items-center justify-center p-0"
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${profile?.firstName}+${profile?.lastName}&background=0f172a&color=fff&bold=true`}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <m.div
                    {...butteryDropdown}
                    {...getButteryOrigin("top right")}
                    className="absolute right-0 top-full mt-3 w-56 p-2 rounded-2xl border border-slate-200/60 bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] z-[100] origin-top-right overflow-hidden"
                  >
                    <div className="p-3 mb-1">
                      <p className="text-[12px] font-bold text-slate-900 truncate leading-tight">{profile?.firstName} {profile?.lastName}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-1 tracking-tight">{profile?.email}</p>
                    </div>
                    <div className="h-px bg-slate-100/60 mx-2 mb-1" />
                    <div className="flex flex-col gap-1">
                      <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold rounded-xl hover:bg-slate-100/60 text-slate-600 transition-all">
                        <User className="w-3.5 h-3.5 text-slate-400" /> Account Settings
                      </Link>
                      <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 text-[11px] font-bold rounded-xl hover:bg-slate-100/60 text-slate-600 transition-all">
                        <Settings className="w-3.5 h-3.5 text-slate-400" /> System Settings
                      </Link>
                      <div className="h-px bg-slate-100/60 mx-2 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-start gap-3 px-3 py-2 text-[11px] font-extrabold rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign out
                      </button>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

function NotificationDropdown({ onClose, notifications }) {
  const navigate = useNavigate();
  return (
    <m.div
      {...butteryDropdown}
      {...getButteryOrigin("top right")}
      className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-slate-200/60 bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] z-[100] origin-top-right overflow-hidden p-2"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100/60 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold text-slate-900 uppercase tracking-widest">Notifications</span>
          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[9px] font-bold text-blue-600 border border-blue-100/50">
            {notifications.filter(n => !n.isRead).length}
          </span>
        </div>
        <button className="text-[9px] text-slate-400 font-bold hover:text-blue-600 transition-colors">
          MARK ALL READ
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto px-1 no-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className="p-3 rounded-xl hover:bg-slate-50 transition-all flex gap-3 items-start group relative border border-transparent hover:border-slate-100/60">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                notif.isRead ? "bg-slate-200" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              )} />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[11px] font-bold leading-tight truncate group-hover:text-blue-600 transition-colors",
                  notif.isRead ? "text-slate-500" : "text-slate-900"
                )}>
                  {notif.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium line-clamp-2">
                  {notif.description}
                </p>
                <p className="text-[8px] text-slate-400 mt-1.5 font-bold uppercase tracking-tight">{notif.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <Bell className="w-5 h-5 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">No new updates</span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100/60">
        <button
          onClick={() => {
            navigate("/notifications");
            onClose();
          }}
          className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-900 py-2 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
        >
          View all updates
        </button>
      </div>
    </m.div>
  );
}
