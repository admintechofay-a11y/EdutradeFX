'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Save,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';

export default function AccountSettingsPage() {
  const { user } = useAuthStore();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification prefs
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    try {
      const res = await api.put('/users/profile', { name });
      if (res.data?.success) {
        setProfileSuccess('Profile information updated successfully.');
        if (user) {
          useAuthStore.getState().setUser({ ...user, name });
        }
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPasswordSuccess('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || err?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-navy flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue" />
          Account & Security Settings
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Manage your personal details, login credentials, and communication preferences.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-soft">
        <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-blue" />
          Personal Profile
        </h2>

        {profileSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-green/10 border border-green/20 text-green text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{profileSuccess}</span>
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5">
                Email Address (Primary Login)
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-surface-tint border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-blue hover:bg-blue-hover text-white rounded-full text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-soft">
        <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange" />
          Security Credentials
        </h2>

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-green/10 border border-green/20 text-green text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{passwordSuccess}</span>
          </div>
        )}
        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue max-w-md transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
            </div>
          </div>

          <div className="flex justify-start pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-2.5 bg-surface-tint hover:bg-border/60 text-navy rounded-full text-xs font-bold transition flex items-center gap-2 border border-border disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Card */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-soft">
        <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-green" />
          Notification Preferences
        </h2>

        <div className="space-y-3">
          {[
            {
              id: 'emailAlerts',
              title: 'Email Security & Login Alerts',
              desc: 'Receive immediate notifications on new device sign-ins or password resets.',
              checked: securityAlerts,
              toggle: () => setSecurityAlerts(!securityAlerts),
            },
            {
              id: 'courseUpdates',
              title: 'Curriculum & Course Announcements',
              desc: 'Updates from tutors on new video lessons and certificate issuance.',
              checked: courseUpdates,
              toggle: () => setCourseUpdates(!courseUpdates),
            },
            {
              id: 'marketSignals',
              title: 'Forex Market & Signal Broadcasts',
              desc: 'Direct alerts on high-probability setups from subscribed signal providers.',
              checked: emailAlerts,
              toggle: () => setEmailAlerts(!emailAlerts),
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-tint/60 border border-border"
            >
              <div>
                <div className="text-xs font-bold text-text-heading">{item.title}</div>
                <div className="text-[11px] text-text-muted">{item.desc}</div>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={item.toggle}
                className="w-4 h-4 accent-blue rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
