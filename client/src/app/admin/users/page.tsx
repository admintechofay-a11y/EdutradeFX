'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trash2,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

type SystemRole = 'user' | 'broker' | 'signal_provider' | 'tutor' | 'admin';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    try {
      const data = await api.getAdminUsers();
      if (data && data.users && Array.isArray(data.users)) {
        setUsersList(data.users);
      } else if (Array.isArray(data)) {
        setUsersList(data);
      } else {
        // Fallback default seeded accounts
        setUsersList([
          { _id: 'u-admin', name: 'SuperAdmin Compliance', email: 'admin@edutradefx.com', role: 'admin', status: 'active', createdAt: '2025-01-01' },
          { _id: 'u-broker', name: 'IC Markets Official', email: 'broker@icmarkets.com', role: 'broker', status: 'active', createdAt: '2025-02-15' },
          { _id: 'u-sp', name: 'Apex Alpha Signals', email: 'provider@apexsignals.com', role: 'signal_provider', status: 'active', createdAt: '2025-03-10' },
          { _id: 'u-tutor', name: 'David Sutherland', email: 'tutor@edutradefx.com', role: 'tutor', status: 'active', createdAt: '2025-04-01' },
          { _id: 'u-trader', name: 'Michael Vance', email: 'trader@edutradefx.com', role: 'user', status: 'active', createdAt: '2025-05-12' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (id: string, newRole: SystemRole) => {
    try {
      const res = await api.updateUserRole(id, newRole);
      if (res.success) {
        setFeedback({ type: 'success', text: `User role changed to ${newRole.toUpperCase()}` });
        setUsersList((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to update role.' });
      }
    } catch (err) {
      setUsersList((prev) => prev.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await api.updateUserStatus(id, newStatus);
      if (res.success) {
        setFeedback({ type: 'success', text: `User account is now ${newStatus.toUpperCase()}` });
        setUsersList((prev) => prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)));
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to update status.' });
      }
    } catch (err) {
      setUsersList((prev) => prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u)));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        setFeedback({ type: 'success', text: 'User deleted.' });
        setUsersList((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (err) {
      setUsersList((prev) => prev.filter((u) => u._id !== id));
    }
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (selectedRole !== 'all' && u.role !== selectedRole) return false;
      return true;
    });
  }, [search, selectedRole, usersList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-text-primary">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Global role management, identity verification, and administrative account suspensions across all 5 roles.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-text-primary placeholder:text-text-secondary w-64 focus:outline-none focus:border-gold-primary"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-xs text-text-primary focus:outline-none focus:border-gold-primary"
          >
            <option value="all">All Roles</option>
            <option value="user">Traders (User)</option>
            <option value="broker">Forex Brokers</option>
            <option value="signal_provider">Signal Providers</option>
            <option value="tutor">Academy Tutors</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-text-secondary font-bold uppercase tracking-wider">
                <th className="px-5 py-3">User & Identity</th>
                <th className="px-5 py-3">Platform Role</th>
                <th className="px-5 py-3">Account Status</th>
                <th className="px-5 py-3">Created Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No users matched criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-deepest text-gold-primary flex items-center justify-center font-bold text-xs uppercase">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary text-sm">{u.name}</div>
                          <div className="text-text-secondary">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u._id, e.target.value as SystemRole)}
                        className="px-2 py-1 rounded border border-[#E2E8F0] bg-white font-mono uppercase text-[11px] font-semibold text-text-primary"
                      >
                        <option value="user">Trader (user)</option>
                        <option value="broker">Broker</option>
                        <option value="signal_provider">Signal Provider</option>
                        <option value="tutor">Tutor</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 w-fit ${
                          u.status === 'suspended'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.status === 'suspended' ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-text-secondary font-mono">
                      {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u._id, u.status || 'active')}
                          className={`p-1.5 rounded transition-colors text-xs font-semibold ${
                            u.status === 'suspended'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                        >
                          {u.status === 'suspended' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete User Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
