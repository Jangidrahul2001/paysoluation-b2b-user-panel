import { useState, useEffect, useCallback } from "react";

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'New User Logged In', type: 'info', description: 'A new device was used to log into your account from Mumbai, India.', date: new Date().toISOString(), time: 'Just now', isRead: false },
  { id: 2, title: 'Project "Alpha" Approved', type: 'success', description: 'Your submitted project has been approved by the admin.', date: new Date(Date.now() - 7200000).toISOString(), time: '2 hours ago', isRead: false },
  { id: 3, title: 'Server Load High', type: 'warning', description: 'CPU usage exceeded 90% for the last 15 minutes. Please monitor.', date: new Date(Date.now() - 18000000).toISOString(), time: '5 hours ago', isRead: false },
  { id: 4, title: 'Database Backup Completed', type: 'info', description: 'Daily automated backup completed successfully. Total size: 4.2GB.', date: new Date(Date.now() - 21600000).toISOString(), time: '6 hours ago', isRead: true },
  { id: 5, title: 'New Comment on Post', type: 'message', description: '"Great work on the latest release!" - Sarah Jenkins', date: new Date(Date.now() - 28800000).toISOString(), time: '8 hours ago', isRead: true },
  { id: 6, title: 'System Update Scheduled', type: 'info', description: 'Main server will be down for maintenance on Sunday 2:00 AM.', date: new Date(Date.now() - 86400000).toISOString(), time: '1 day ago', isRead: true },
  { id: 7, title: 'Payment Received', type: 'success', description: 'Payment of ₹5,000 to your wallet was successful.', date: new Date(Date.now() - 86400000).toISOString(), time: '1 day ago', isRead: true },
  { id: 8, title: 'Subscription Expiring Soon', type: 'warning', description: 'Your current plan expires in 3 days. Please renew to avoid interruption.', date: new Date(Date.now() - 172800000).toISOString(), time: '2 days ago', isRead: true },
];

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(INITIAL_NOTIFICATIONS);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return {
    notifications,
    setNotifications,
    isLoading,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllRead,
    refreshNotifications: fetchNotifications
  };
}
