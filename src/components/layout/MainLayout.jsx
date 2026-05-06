import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "../../lib/utils";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import { Skeleton } from "../ui/skeleton";
import { SidebarPageTransition } from "./sidebar-PageTransition";
import { fetchProfile } from "../../store/slices/profileSlice";
import { fetchWallet } from "../../store/slices/walletSlice";

// Skeleton Components
const SidebarSkeleton = ({ isMobile, isSidebarOpen }) => (
  <m.div
    initial={isMobile ? { x: -300 } : { width: 280 }}
    animate={
      isMobile
        ? { x: isSidebarOpen ? 0 : -300, width: 280 }
        : { width: 280, x: 0 }
    }
    transition={{ type: "spring", stiffness: 280, damping: 32, mass: 1 }}
    className={cn(
      "sidebar-root relative bg-white shadow-sm z-[100] transform-gpu border border-indigo-100/40 will-change-transform flex-shrink-0",
      isMobile
        ? "fixed left-0 top-0 bottom-0 shadow-2xl h-full w-[280px] rounded-none"
        : "block h-[calc(100vh-0.75rem)] sticky top-1.5 my-1.5 ml-1.5 rounded-[1.5rem] md:rounded-[2.5rem]",
    )}
  >
    <div className="flex h-full flex-col py-6 px-4">
      <div className="flex items-center mb-5 min-h-[44px] justify-between pl-1">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="flex-1 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </m.div>
);

const HeaderSkeleton = () => (
  <div className="flex flex-col bg-blue-50/40 sticky top-0 z-50 border-b border-blue-200/40">
    <header className="flex h-13 md:h-15 lg:h-16 items-center justify-between gap-2 md:gap-4 px-3 md:px-6 lg:px-8">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0 pr-2 md:pr-4">
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <div className="flex items-center gap-1.5 md:gap-4 lg:gap-6 flex-shrink-0">
        <Skeleton className="h-10 w-32 rounded-full" />
        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </header>
  </div>
);

export default function MainLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(typeof window !== "undefined" ? window.innerWidth < 498 : false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 498);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const { data: profile, loading: profileLoading } = useSelector((state) => state.profile);
  const { data: wallet, loading: walletLoading } = useSelector((state) => state.wallet);

  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) {
      dispatch(fetchProfile());
    }
    if (!wallet || Object.keys(wallet).length === 0) {
      dispatch(fetchWallet());
    }
  }, [dispatch, profile, wallet]);

  const isLoading = profileLoading 

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden gap-0">
      <AnimatePresence>
        {isSidebarOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[90] xs:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "fixed inset-y-0 left-0 z-[100] xs:relative xs:z-auto transition-transform duration-300 transform-gpu",
        isSidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full xs:translate-x-0"
      )}>
        {isLoading ? (
          <SidebarSkeleton isMobile={isMobile} isSidebarOpen={isSidebarOpen} />
        ) : (
          <Sidebar
            isLoading={isLoading}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            isMobile={isMobile}
            className="flex-shrink-0"
          />
        )}
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 flex flex-col bg-gradient-to-tr from-white to-indigo-50/30 border border-indigo-100/40 xs:my-1.5 xs:mr-1.5 xs:ml-1.5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-md relative overflow-hidden">
          {isLoading ? (
            <HeaderSkeleton />
          ) : (
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
          )}

          <main className="flex-1 p-2 sm:p-3 md:p-4 relative overflow-x-hidden overflow-y-auto custom-scrollbar bg-gradient-to-tr from-white to-indigo-50/50">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <SidebarPageTransition key={location.pathname} className="min-h-full">
                <Outlet />
              </SidebarPageTransition>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
