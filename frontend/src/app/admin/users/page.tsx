'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { api } from '../../../lib/api';
import { User, Role } from '../../../types';
import { Skeleton } from '../../../components/common/Skeleton';

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserStatus = async (user: User) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      setUsers(users.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy">User Directory & Governance</h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Monitor active trader sessions, verify email authentication status, and enforce account suspensions.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-3xl bg-white border border-border shadow-soft flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or email address..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-surface-tint border border-border rounded-xl text-xs text-text-heading focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
        >
          <option value="ALL">All Roles</option>
          <option value="STUDENT">Student / Trader</option>
          <option value="BROKER">Broker</option>
          <option value="ACCOUNT_MANAGER">Account Manager</option>
          <option value="SIGNAL_PROVIDER">Signal Provider</option>
          <option value="TUTOR">Tutor</option>
          <option value="ADMIN">Administrator</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton className="h-96 rounded-3xl bg-border/40" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-soft">
          <table className="w-full min-w-[650px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-tint text-text-muted text-xs uppercase font-bold">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Email Verified</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-tint/60 transition">
                  <td className="p-4">
                    <div className="font-bold text-navy">{u.name}</div>
                    <div className="text-text-muted text-xs">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue/10 text-blue text-[11px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.isEmailVerified ? (
                      <span className="text-green flex items-center gap-1 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-text-muted flex items-center gap-1 text-xs">
                        <XCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-text-muted text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.isActive
                          ? 'bg-green/10 text-green'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleUserStatus(u)}
                      className={`px-3.5 py-1 rounded-full text-xs font-bold transition shadow-sm ${
                        u.isActive
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                          : 'bg-green-50 hover:bg-green-100 text-green border border-green/20'
                      }`}
                    >
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
