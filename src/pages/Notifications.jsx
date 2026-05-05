"use client"

import { useState, useMemo } from "react"
import { 
  Bell, Check, Clock, Trash2, CheckCircle2, AlertTriangle, 
  Info, XCircle, Search, SlidersHorizontal, Activity, 
  Trash, ArrowRight, Calendar, Filter, Archive
} from "../components/ui/icons"
import { Button } from "../components/ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import { PageLayout } from "../components/layout/PageLayout"
import { useNotifications } from "../hooks/useNotifications"
import { Select } from "../components/ui/Select"
import { cn } from "../lib/utils"
import { format, isToday, isYesterday, startOfDay } from "date-fns"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

export default function NotificationsPage() {
  const {
    notifications,
    isLoading,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllRead
  } = useNotifications();
  const [filter, setFilter] = useState('all');

  const stats = useMemo(() => {
    return {
      total: notifications?.length || 0,
      unread: notifications?.filter(n => !n.isRead).length || 0,
      read: notifications?.filter(n => n.isRead).length || 0,
    };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    return (notifications || []).filter(notif => {
      if (filter === 'unread') return !notif.isRead;
      if (filter === 'read') return notif.isRead;
      return true;
    });
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      Earlier: []
    };

    filteredNotifications.forEach(notif => {
      const date = new Date(notif.date);
      if (isToday(date)) {
        groups.Today.push(notif);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(notif);
      } else {
        groups.Earlier.push(notif);
      }
    });

    return Object.fromEntries(
      Object.entries(groups).filter(([_, items]) => items.length > 0)
    );
  }, [filteredNotifications]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"><CheckCircle2 className="w-5 h-5" /></div>;
      case 'warning': return <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm"><AlertTriangle className="w-5 h-5" /></div>;
      case 'error': return <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-sm"><XCircle className="w-5 h-5" /></div>;
      default: return <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"><Info className="w-5 h-5" /></div>;
    }
  };

  const pageActions = (
    <div className="flex items-center gap-3">
      <div className="w-48 md:w-56">
        <Select
          value={filter}
          onChange={setFilter}
          options={[
            { label: 'All Notifications', value: 'all', shortLabel: 'All Notifications' },
            { label: 'Unread Alerts', value: 'unread', shortLabel: 'Unread Alerts' },
            { label: 'Archived Logs', value: 'read', shortLabel: 'Archived Logs' },
          ]}
          searchable={false}
          className="h-10 border-slate-200/60 bg-white shadow-sm"
        />
      </div>
      <Button
        variant="ghost"
        onClick={handleMarkAllRead}
        disabled={isLoading || stats.unread === 0}
        className="h-10 px-4 rounded-xl border border-slate-200/60 bg-white shadow-sm hover:bg-slate-50 transition-all font-semibold text-slate-600 text-xs gap-2"
      >
        <Check className="w-4 h-4" />
        Mark all as read
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Notifications"
      subtitle="Manage your system alerts and activity updates"
      actions={pageActions}
      showBackButton={true}
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total', count: stats.total, color: 'text-slate-600', bg: 'bg-white', icon: Bell },
            { label: 'Unread', count: stats.unread, color: 'text-indigo-600', bg: 'bg-indigo-50/50', icon: Activity },
            { label: 'Archived', count: stats.read, color: 'text-emerald-600', bg: 'bg-emerald-50/50', icon: Archive },
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className={cn(
                "p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between",
                stat.bg
              )}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <p className={cn("text-2xl font-black tabular-nums", stat.color)}>{stat.count}</p>
              </div>
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg, "border border-black/5")}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search Area */}
        <div className="flex justify-end">
          <div className="relative group max-w-sm w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search notifications..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-900 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-10 pb-20">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-white border border-slate-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : Object.keys(groupedNotifications).length > 0 ? (
            Object.entries(groupedNotifications).map(([groupTitle, items]) => (
              <div key={groupTitle} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-2">
                    {groupTitle}
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-3"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {items.map((notif) => (
                      <motion.div
                        layout
                        variants={itemVariants}
                        key={notif.id}
                        className={cn(
                          "group relative flex items-start gap-4 p-4 md:p-5 rounded-3xl border transition-all duration-300",
                          !notif.isRead
                            ? "bg-white border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
                            : "bg-slate-50/50 border-slate-100/80 opacity-90"
                        )}
                      >
                        {/* Icon Wrapper */}
                        <div className="mt-1">
                          {getTypeIcon(notif.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-12">
                          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                            <h3 className={cn(
                              "text-sm tracking-tight leading-tight",
                              !notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-500"
                            )}>
                              {notif.title}
                            </h3>
                            {!notif.isRead && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-600 text-[8px] font-black text-white uppercase tracking-widest shadow-sm shadow-indigo-200">
                                <span className="w-0.5 h-0.5 rounded-full bg-white animate-pulse" />
                                New
                              </div>
                            )}
                          </div>
                          <p className={cn(
                            "text-xs leading-relaxed max-w-2xl",
                            !notif.isRead ? "font-medium text-slate-600" : "font-medium text-slate-400"
                          )}>
                            {notif.description}
                          </p>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-lg">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{notif.time}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1">
                              <Calendar className="w-3 h-3 text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">System Update</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Sidebar */}
                        <div className="absolute right-4 top-4 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {!notif.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="h-8 w-8 rounded-lg bg-white border border-slate-100 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm transition-all"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(notif.id)}
                            className="h-8 w-8 rounded-lg bg-white border border-slate-100 text-slate-400 hover:bg-rose-600 hover:text-white shadow-sm transition-all"
                            title="Delete notification"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 flex flex-col items-center justify-center text-center px-4"
            >
              <div className="h-32 w-32 rounded-[3rem] bg-linear-to-br from-slate-50 to-white border border-slate-100 flex items-center justify-center mb-8 relative shadow-inner">
                <Bell className="w-12 h-12 text-slate-200" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center"
                >
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                </motion.div>
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">All Caught Up!</h3>
              <p className="text-slate-400 text-sm max-w-[280px] font-semibold leading-relaxed">
                Your archive is clean. We'll notify you as soon as something important happens.
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-8 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-widest px-8"
              >
                Refresh Log
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
