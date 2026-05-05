import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "../../lib/utils";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
// import { UsersProvider } from "../../context/users-context";
import { SidebarPageTransition } from "./sidebar-PageTransition";
import { fetchProfile } from "../../store/slices/profileSlice";
import { fetchWallet } from "../../store/slices/walletSlice";

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

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);
   const { data: profile, error: profileError } = useSelector((state) => state.profile);
  const { data: wallet, loading: walletLoading } = useSelector((state) => state.wallet);

  // Global Data Fetching on Init
  useEffect(() => {
    if (!profile || Object.keys(profile).length === 0) {
      dispatch(fetchProfile());
    }
    if (!wallet || Object.keys(wallet).length === 0) {
      dispatch(fetchWallet());
    }
  }, [dispatch, profile, wallet]);

  return (
    // <UsersProvider>
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden gap-0">
      {/* Sidebar Overlay for Mobile */}
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
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
          className="flex-shrink-0"
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div
          className="flex-1 flex flex-col bg-gradient-to-tr from-white to-indigo-50/30 border border-indigo-100/40 xs:my-1.5 xs:mr-1.5 xs:ml-1.5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-md relative overflow-hidden"
        >
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 p-2 sm:p-3 md:p-4 relative overflow-x-hidden overflow-y-auto custom-scrollbar bg-gradient-to-tr from-white to-indigo-50/50">
            <SidebarPageTransition key={location.pathname} className="min-h-full">
              <Outlet />
            </SidebarPageTransition>
          </main>
        </div>
      </div>
    </div>
    // </UsersProvider>
  );
}
