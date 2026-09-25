'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  Trash2,
  ShieldCheck,
  CreditCard,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Skeleton } from '../../../components/common/Skeleton';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'APPROVAL' | 'ALERT'>('ALL');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && res.data?.data) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPROVAL':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'ALERT':
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'PAYMENT':
        return <CreditCard className="w-5 h-5 text-brand-amber" />;
      case 'REVIEW':
        return <MessageSquare className="w-5 h-5 text-brand-blue" />;
      default:
        return <Info className="w-5 h-5 text-brand-blue" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'APPROVAL') return n.type === 'APPROVAL';
    if (filter === 'ALERT') return n.type === 'ALERT';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-brand-blue" />
            <span>Notifications Center</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stay informed with platform governance alerts, course review requests, and account updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy-card hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition shadow-sm self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-brand-navy-card border border-slate-800 rounded-2xl w-fit">
        {[
          { label: 'All', value: 'ALL', count: notifications.length },
          { label: 'Unread', value: 'UNREAD', count: unreadCount },
          {
            label: 'Approvals',
            value: 'APPROVAL',
            count: notifications.filter((n) => n.type === 'APPROVAL').length,
          },
          {
            label: 'Disputes & Alerts',
            value: 'ALERT',
            count: notifications.filter((n) => n.type === 'ALERT').length,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === tab.value
                ? 'bg-brand-blue text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 opacity-75 font-mono">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.isRead && handleMarkAsRead(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start gap-4 ${
                item.isRead
                  ? 'bg-brand-navy-card/60 border-slate-850 opacity-80'
                  : 'bg-brand-navy-card border-slate-700/80 shadow-lg relative'
              }`}
            >
              {!item.isRead && (
                <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse" />
              )}

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.message}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(item.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>

                  {item.link && (
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1 font-bold text-brand-blue hover:underline"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 self-center">
                <button
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Delete notification"
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-brand-navy-card border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">All Caught Up!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'You have no notifications at this time.'
              : `No ${filter.toLowerCase()} notifications found.`}
          </p>
        </div>
      )}
    </div>
  );
}
