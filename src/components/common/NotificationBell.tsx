import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  FileCheck,
  FileX,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../../types';
import { notificationsApi } from '../../services/api';

interface NotificationBellProps {
  onNavigateToApplication?: (appId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigateToApplication }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await notificationsApi.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Offline fallback
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for live awareness
    const timer = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(timer);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications(true);
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'application_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'application_rejected':
        return <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'consent_revoked':
        return <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'document_verified':
        return <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'document_rejected':
        return <FileX className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'application_submitted':
        return <Clock className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'status_change':
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[10px] font-bold rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#162033]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchNotifications(true)}
                disabled={loading}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 px-2 py-1 rounded transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#111827] flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-slate-900 dark:bg-slate-800 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Updates on applications and consents will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.notificationId}
                  onClick={() => {
                    if (!notif.isRead) {
                      handleMarkAsRead(notif.notificationId);
                    }
                    if (notif.applicationId && onNavigateToApplication) {
                      onNavigateToApplication(notif.applicationId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    notif.isRead
                      ? 'bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                      : 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold truncate">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" title="Unread" />
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mt-0.5">
                      {notif.message}
                    </p>
                    {notif.applicationId && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-brand-600 dark:text-brand-400">
                        <span>Ref: {notif.applicationId}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
