import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  LayoutDashboard,
  Users,
  Smartphone,
  Fingerprint,
  Send,
  FileText,
  Wallet,
  ShoppingBag,
  CreditCard,
  Globe,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Banknote,
  Landmark,
  Percent,
  BarChart,
  ChevronDown,
  ShieldCheck,
  History,
  Zap,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Button } from "../ui/Button";
import { handleValidationError } from "../../utils/helperFunction";
import { toast } from "sonner";
import { useFetch } from "../../hooks/useFetch";
import { apiEndpoints } from "../../api/apiEndpoints";

// Static sidebar configuration
const sidebarGroups = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { key: "users", title: "Users", href: "/users", icon: Users },
      {
        title: "Topup Request",
        icon: Banknote,
        children: [
          { title: "Online", href: "/topup/online", icon: Globe },
          { title: "Offline", href: "/topup/offline", icon: Landmark },
          { title: "Topup History", href: "/topup/history", icon: History },
        ],
      },
    ],
    key: "dashboard"
  },
  {
    label: "SERVICES",
    items: [
      { key: "recharge", title: "Recharge", href: "/recharge", hasPipeline: false, icon: Smartphone },
      {
        key: "aeps",
        title: "AePS",
        href: "/aeps",
        icon: Fingerprint,
        hasPipeline: true,
        children: [
          { title: "AePS 1", href: "/aeps", icon: Fingerprint, key: "aeps1" },
          { title: "AePS 2", href: "/aeps2", icon: Fingerprint, key: "aeps2" },
        ],
      },
      { key: "dmt", title: "Money Transfer", hasPipeline: false, href: "/money-transfer", icon: Send },
      { key: "bbps", title: "Bill Payment", href: "/bill-payment", hasPipeline: false, icon: FileText },
      { key: "aeps", title: "AEPS Payout", href: "/aeps-payout", hasPipeline: false, icon: CreditCard },
      { key: "xpress-payout", title: "Xpress Transfer", href: "/xpress-transfer", hasPipeline: false, icon: Banknote },
      { key: "upi-payout", title: "UPI Payout", href: "/upi-payout", hasPipeline: false, icon: Banknote },
    ],
    key: "services"
  },
  {
    label: "OTHER SERVICES",
    items: [
      { title: "Offline Service", href: "/offline-service", icon: Landmark },
      { title: "Online Service", href: "/online-service", icon: Globe },
      { title: "Shopping Store", href: "/store", icon: ShoppingBag },
      { title: "Wallet Transfer", href: "/wallet-transfer", icon: Wallet },
      {
        title: "User Wallet Refill",
        href: "/user-wallet-refill",
        icon: Zap,
      },
      {
        title: "Account Whitelist",
        href: "/account-whitelist",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "COMMISSION & TOPUP",
    items: [
      { title: "Commission Plan", href: "/commission-plan", icon: Percent },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { title: "Wallet Ledger", href: "/wallet-ledger", icon: Wallet },
      {
        title: "Transaction Report",
        href: "/transaction-report",
        icon: BarChart,
        children: [
          { title: "Recharge", href: "/transaction-report/recharge", icon: Smartphone, key: "recharge" },
          { title: "Dmt", href: "/transaction-report/dmt", icon: Send, key: "dmt" },
          { title: "Bbps", href: "/transaction-report/bbps", icon: FileText, key: "bbps" },
          {
            title: "AePS", href: "/transaction-report/aeps", icon: Fingerprint, key: "aeps",
            children: [
              { title: "Aeps1", href: "/transaction-report/aeps1", icon: Fingerprint, key: "aeps1" },
              { title: "Aeps2", href: "/transaction-report/aeps2", icon: Fingerprint, key: "aeps2" }]
          },
          { title: "AePS Payout", href: "/transaction-report/aeps-payout", icon: CreditCard, key: "aeps" },
          { title: "Xpress Payout", href: "/transaction-report/xpress-payout", icon: Banknote, key: "xpress-payout" },
        ],
      },
      {
        title: "Commission Report",
        href: "/commission-report",
        icon: BarChart3,
      },
      {
        title: "All Transactions",
        href: "/all-transactions",
        icon: History,
      },
    ],
    key: "reports"
  },
];

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  // Recursive helper to check if an item or any of its children match the current path
  const isItemActive = (item) => {
    if (!item) return false;
    const itemHref = item.href;
    const isActive = itemHref && (pathname === itemHref || (itemHref !== "/" && pathname.startsWith(itemHref + "/")));
    if (isActive) return true;
    if (item.children) {
      return item.children.some(child => isItemActive(child));
    }
    return false;
  };
  const { data: profile } = useSelector((state) => state.profile);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [activeFloatingMenu, setActiveFloatingMenu] = useState(null);
  const [servicesWithPipeline, setServiceWithPipeline] = useState([])

  const { refetch: fetchServiceWithPipeline } = useFetch(
    `${apiEndpoints.fetchServiceWithPipeline}`,
    {
      onSuccess: (data) => {
        if (data.success) {
          setServiceWithPipeline(data.data)
        }
      },
      onError: (error) => {
        console.log("error in fetching services data", error);
        toast.error(handleValidationError(error) || "Something went wrong");
      },
    },
    true,
  );

  const filteredSidebar = useMemo(() => {
    return sidebarGroups.map((group) => {
      const newGroup = { ...group };

      if (group.key === "dashboard" && Object.keys(profile).length > 0) {
        if (profile?.roleName === "RETAILER") {
          newGroup.items = group.items.filter((item) => item.key !== "users");
        }
      }

      if (group.key === "services" && Object.keys(profile).length > 0) {
        newGroup.items = group?.items?.filter((item) => {
          const filterGroup = servicesWithPipeline?.find((ser) => ser.name === item.key)
          if (filterGroup !== undefined) {
            if (item.hasPipeline) {
              const filterChildren = item?.children?.filter((children) => {
                const foundPipeline = filterGroup.pipeline.find((pipeline) => children.key === pipeline.code)
                return foundPipeline !== undefined;
              })

              item.children = filterChildren;
              return true;
            } else {
              return item;
            }
          }
        });
      }

      if (group.key === "reports" && Object.keys(profile).length > 0) {
        const tempAssignedServices = profile?.assignedServices?.map((service) => service.name) || [];
        newGroup.items = group.items.map((item) => {
          if (item.title === "Transaction Report") {
            const children = item.children?.filter((child) => {
              const subChildren = child.children?.filter((subChildren) => {
                const selectedService = profile?.assignedServices?.find((ser) => ser.name === child.key)
                return selectedService?.pipelineCodes?.includes(subChildren.key)
              })
              child.children = subChildren
              return tempAssignedServices.includes(child.key)
            })

            return {
              ...item,
              children
            };
          }
          else {
            return {
              ...item,
            };
          }
        });
      }
      return newGroup;
    });
  }, [profile, servicesWithPipeline]);

  // Close floating menu on window click
  useEffect(() => {
    const handleGlobalClick = () => setActiveFloatingMenu(null);
    if (activeFloatingMenu) {
      window.addEventListener("click", handleGlobalClick);
    }
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [activeFloatingMenu]);

  const toggleSubMenu = (path) => {
    setOpenSubMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const onItemClick = (e, item, parentPath = '') => {
    e.stopPropagation();
    if (item.disabled) return;

    const itemPath = parentPath ? `${parentPath}.${item.title}` : item.title;

    if (item.children) {
      if (isCollapsed && !isMobile) {
        const rect = e.currentTarget.getBoundingClientRect();
        setActiveFloatingMenu({
          ...item,
          top: rect.top + (rect.height / 2),
          left: rect.right + 8,
          parentPath: itemPath
        });
      } else {
        toggleSubMenu(itemPath);
      }
    } else {
      navigate(item.href);
      if (isMobile) setIsSidebarOpen(false);
      setActiveFloatingMenu(null);
    }
  };

  const renderChildItem = (child, level, parentPath) => {
    const itemPath = `${parentPath}.${child.title}`;
    const isChildActive = isItemActive(child);

    const isChildOpen = openSubMenus[itemPath];
    const ChildIcon = child.icon;

    // Calculate proper indentation based on level
    const getIndentationClass = (level) => {
      switch (level) {
        case 1: return "pl-4"; // First level children
        case 2: return "pl-8"; // Second level children (children's children)
        case 3: return "pl-12"; // Third level children
        default: return `pl-${4 + (level * 4)}`; // Dynamic for deeper levels
      }
    };

    return (
      <div key={child.title} className="flex flex-col">
        {/* Child Item with proper indentation */}
        <button
          onClick={(e) => onItemClick(e, child, parentPath)}
          className={cn(
            "flex items-center gap-3 py-2.5 text-[12.5px] font-medium transition-all duration-300 relative group w-full text-left rounded-[1rem] my-0.5",
            getIndentationClass(level), // Apply proper indentation
            isChildActive
              ? "text-indigo-600 font-bold bg-indigo-50/50 shadow-[0_4px_12px_rgba(79,70,229,0.03)]"
              : "text-slate-400 hover:text-slate-800 hover:bg-slate-50",
          )}
        >
          {/* Connector dot for active */}
          {isChildActive && (
            <m.div
              layoutId={`active-dot-${level}-${child.title}`}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-[2px] h-4 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]",
                level === 1 && "left-[11px]", // Position for first level
                level === 2 && "left-[27px]", // Position for second level
                level === 3 && "left-[43px]", // Position for third level
                level > 3 && `left-[${11 + (level * 16)}px]` // Dynamic positioning
              )}
            />
          )}

          {ChildIcon && (
            <ChildIcon
              size={13}
              className={cn(
                "flex-shrink-0 transition-transform duration-300 group-hover:scale-110",
                isChildActive ? "text-indigo-600 stroke-[2.5]" : "text-slate-400 group-hover:text-slate-600"
              )}
            />
          )}

          <span className="capitalize tracking-tight truncate flex-1">
            {child.title}
          </span>

          {child.children && (
            <m.div
              animate={{ rotate: isChildOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                className={cn(
                  "w-3 h-3 mr-2",
                  isChildActive
                    ? "text-indigo-600/60"
                    : "text-slate-400"
                )}
              />
            </m.div>
          )}

          {!isChildActive && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 w-[1px] h-3 bg-slate-200 scale-0 group-hover:scale-100 transition-transform origin-center",
              level === 1 && "left-[11px]",
              level === 2 && "left-[27px]",
              level === 3 && "left-[43px]",
              level > 3 && `left-[${11 + (level * 16)}px]`
            )} />
          )}
        </button>

        {/* Sub-children with recursive rendering */}
        {child.children && (
          <AnimatePresence>
            {isChildOpen && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="overflow-hidden flex flex-col"
              >
                {child.children.map((subChild) =>
                  renderChildItem(subChild, level + 1, itemPath)
                )}
              </m.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  useEffect(() => {
    const menusToOpen = { ...openSubMenus };
    let updated = false;

    const findAndOpenActive = (item, parentPath = "") => {
      if (!item.children) return;

      const itemPath = parentPath ? `${parentPath}.${item.title}` : item.title;
      const hasActiveChild = item.children.some(child => isItemActive(child));

      if (hasActiveChild) {
        if (!menusToOpen[itemPath]) {
          menusToOpen[itemPath] = true;
          updated = true;
        }
        item.children.forEach(child => findAndOpenActive(child, itemPath));
      }
    };

    filteredSidebar.forEach((group) => {
      group.items.forEach((item) => findAndOpenActive(item));
    });

    if (updated) {
      setOpenSubMenus(menusToOpen);
    }
  }, [pathname, filteredSidebar]);

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      <m.div
        initial={isMobile ? { x: -300 } : { width: 280 }}
        animate={
          isMobile
            ? { x: isSidebarOpen ? 0 : -300, width: 280 }
            : { width: isCollapsed ? 72 : 280, x: 0 }
        }
        transition={{ type: "spring", stiffness: 280, damping: 32, mass: 1 }}
        className={cn(
          "sidebar-root relative bg-white shadow-sm z-[100] transform-gpu border border-indigo-100/40 will-change-transform flex-shrink-0",
          isMobile
            ? "fixed left-0 top-0 bottom-0 shadow-2xl h-full w-[280px] rounded-none"
            : "block h-[calc(100vh-0.75rem)] sticky top-1.5 my-1.5 ml-1.5 rounded-[1.5rem] md:rounded-[2.5rem]",
        )}
      >
        <div className={cn("flex h-full flex-col py-6 relative", isCollapsed && !isMobile ? "px-2" : "px-4")}>
          {/* Header Section */}
          <div
            className={cn(
              "flex items-center mb-5 min-h-[44px] relative",
              isCollapsed && !isMobile ? "justify-center" : "justify-between pl-1",
            )}
          >
            {isCollapsed && !isMobile ? (
              <Button
                asChild
                className="group relative w-9 h-9 rounded-[0.9rem] bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-slate-900/15 transition-all duration-200 hover:bg-indigo-700 hover:scale-105 cursor-ew-resize p-0"
              >
                <m.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCollapsed(false)}
                >
                  <span className="font-bold text-lg absolute transition-opacity duration-200 opacity-100 group-hover:opacity-0">
                    {`${profile?.roleName?.split(" ")[0]?.charAt(0) || ''}${profile?.roleName?.split(" ")?.[1]?.charAt(0) || ''}`}
                  </span>
                  <PanelLeftOpen className="w-5 h-5 absolute transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
                </m.button>
              </Button>
            ) : (
              <>
                <div to="/" className="flex items-center gap-4 overflow-hidden relative z-20">
                  <m.div
                    layout
                    className="h-8 w-8 md:h-9 lg:h-10 md:w-9 lg:w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white p-2 shrink-0"
                  >
                    <span className="font-bold text-sm md:text-md">{`${profile?.roleName?.split(" ")[0]?.charAt(0) || ''}${profile?.roleName?.split(" ")?.[1]?.charAt(0) || ''}`}</span>
                  </m.div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[1.35rem] text-slate-900 tracking-tight leading-none">
                      User
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                      {profile?.roleName || "Verified Merchant"}
                    </span>
                  </div>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-700 transition-all duration-150 p-1.5 hover:bg-indigo-500 rounded-lg group relative cursor-ew-resize h-auto bg-transparent border-none shadow-none"
                >
                  <m.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      isMobile ? setIsSidebarOpen(false) : setIsCollapsed(true)
                    }
                  >
                    <PanelLeftClose className="w-5 h-5" />
                  </m.button>
                </Button>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className={cn("flex-1 space-y-5 overflow-y-auto overflow-x-hidden py-1 scrollbar-none")}>
            <nav className="flex flex-col gap-1">
              {filteredSidebar.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-2">
                  {!isCollapsed && group.label && (
                    <div className="px-4 mt-4 mb-1 flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400/80 uppercase tracking-[0.12em] whitespace-nowrap">
                        {group.label}
                      </span>
                      <div className="h-[1px] bg-slate-200 flex-1" />
                    </div>
                  )}
                  {isCollapsed && group.label && !isMobile && (
                    <div className="h-[1px] bg-slate-200 mx-4 my-2" />
                  )}

                  {group.items.map((item) => {

                    const isActive = isItemActive(item);
                    const isMenuOpen = !!openSubMenus[item.title];
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="flex flex-col">
                        <div
                          onClick={(e) => onItemClick(e, item)}
                          className="relative block cursor-pointer"
                        >
                          <div
                            className={cn(
                              "group flex items-center gap-3 px-3 py-2.5 relative z-10 duration-150 transition-all",
                              isCollapsed && !isMobile ? "justify-center px-0 w-11 h-11 mx-auto" : "",
                            )}
                          >
                            {isActive && (
                              <m.div
                                layoutId="active-bg"
                                className={cn("absolute inset-0 bg-indigo-50", "rounded-xl")}
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              />
                            )}
                            {!isActive && (
                              <div className={cn("absolute inset-0 bg-white/0 group-hover:bg-indigo-100/80 transition-colors duration-150", "rounded-xl")} />
                            )}

                            <Icon
                              className={cn(
                                "h-[1.1rem] w-[1.1rem] flex-shrink-0 relative z-10 transition-colors duration-150",
                                isActive
                                  ? "text-indigo-600 font-semibold"
                                  : "text-slate-400 group-hover:text-slate-600",
                              )}
                            />

                            {(!isCollapsed || isMobile) && (
                              <div className="flex flex-1 items-center justify-between relative z-10">
                                <m.span
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -5 }}
                                  className={cn(
                                    "font-medium text-[0.85rem] whitespace-nowrap tracking-[-0.01em]",
                                    isActive
                                      ? "text-slate-900 font-semibold"
                                      : "text-slate-500 group-hover:text-slate-800",
                                  )}
                                >
                                  {item.title}
                                </m.span>
                                {item.children && (
                                  <m.div
                                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        isActive
                                          ? "text-indigo-600/60 font-semibold"
                                          : "text-slate-400"
                                      )}
                                    />
                                  </m.div>
                                )}
                              </div>
                            )}

                            {isCollapsed && !isMobile && (
                              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 hidden md:block">
                                <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
                                  {item.title}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Sub Menu Section with proper border and spacing */}
                        {item.children && (!isCollapsed || isMobile) && (
                          <AnimatePresence>
                            {isMenuOpen && (
                              <m.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.4,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                                className="overflow-hidden flex flex-col relative border-l border-slate-100/80 ml-[23px] mt-1.5 pb-1"
                              >
                                {item.children.map((child) =>
                                  renderChildItem(child, 1, item.title)
                                )}
                              </m.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Sidebar Support Card */}
            {(!isCollapsed || isMobile) && (
              <div className="pt-4 pb-6 mt-auto">
                <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white text-center relative overflow-hidden group border border-white/[0.03]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-600/20 transition-all duration-700" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-14 h-14 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mb-5 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <ShieldCheck size={24} className="text-indigo-400" />
                    </div>

                    <div className="bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 mb-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-500">
                        System Active
                      </p>
                    </div>

                    <h3 className="text-base font-bold mb-6 tracking-tight text-white/90">
                      Need assistance?
                    </h3>

                    <Link
                      to="/support"
                      className="w-full h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.97] hover:shadow-indigo-500/40"
                    >
                      Open Ticket
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portaled Floating Sub-Menu */}
        {isCollapsed && !isMobile && activeFloatingMenu && createPortal(
          <m.div
            initial={{ opacity: 0, scale: 0.3, x: -30, y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: 0, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.3, x: -30, y: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              top: activeFloatingMenu.top,
              left: activeFloatingMenu.left,
              transformOrigin: "left center"
            }}
            className="fixed w-48 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] border border-slate-100 rounded-[2rem] p-1.5 z-[9999]"
          >
            <div className="flex flex-col gap-0.5">
              {activeFloatingMenu.children.map((child) => {
                const isChildActive = isItemActive(child);
                const ChildIcon = child.icon;
                return (
                  <Link
                    key={child.href}
                    to={child.href}
                    onClick={() => setActiveFloatingMenu(null)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3 rounded-[1.2rem] text-[12.5px] font-bold transition-all group",
                      isChildActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
                      isChildActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100/80 text-slate-400 group-hover:bg-white group-hover:text-slate-600"
                    )}>
                      <ChildIcon size={14} />
                    </div>
                    <span>{child.title}</span>
                  </Link>
                )
              })}
            </div>
          </m.div>,
          document.body
        )}
      </m.div>
    </>
  );
}
