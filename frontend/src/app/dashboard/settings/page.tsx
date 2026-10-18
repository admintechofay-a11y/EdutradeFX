'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Save,
  Camera,
  Trash2,
  Check,
  Globe,
  Share2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';
import PhoneInput from '../../../components/common/PhoneInput';
import { COUNTRIES } from '../../../lib/countries';
import { StickyActionBar } from '../../../components/ui/StickyActionBar';

export default function AccountSettingsPage() {
  const { user, setUser } = useAuthStore();

  // Basic Profile Fields
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [bio, setBio] = useState(user?.bio || '');

  // Social Links
  const [socialLinks, setSocialLinks] = useState({
    linkedin: user?.socialLinks?.linkedin || '',
    x: user?.socialLinks?.x || '',
    facebook: user?.socialLinks?.facebook || '',
    instagram: user?.socialLinks?.instagram || '',
    youtube: user?.socialLinks?.youtube || '',
    telegram: user?.socialLinks?.telegram || '',
    website: user?.socialLinks?.website || '',
  });

  // Avatar Management
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Feedback
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Password Fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Hydrate initial user state on mount
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
      setCity(user.city || '');
      setCountry(user.country || 'India');
      setBio(user.bio || '');
      setAvatarUrl(user.avatar || '');
      if (user.socialLinks) {
        setSocialLinks({
          linkedin: user.socialLinks.linkedin || '',
          x: user.socialLinks.x || '',
          facebook: user.socialLinks.facebook || '',
          instagram: user.socialLinks.instagram || '',
          youtube: user.socialLinks.youtube || '',
          telegram: user.socialLinks.telegram || '',
          website: user.socialLinks.website || '',
        });
      }
      if (user.phone && user.whatsapp && user.phone === user.whatsapp) {
        setSameAsMobile(true);
      }
    }
  }, [user]);

  // Sync WhatsApp when "Same as Mobile" is toggled
  const handleToggleSameAsMobile = (checked: boolean) => {
    setSameAsMobile(checked);
    setIsDirty(true);
    if (checked) {
      setWhatsapp(phone);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    setIsDirty(true);
    if (sameAsMobile) {
      setWhatsapp(val);
    }
  };

  // Avatar Upload Handler (A7)
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/i)) {
      setProfileError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Avatar image must be smaller than 2 MB.');
      return;
    }

    setProfileError(null);
    setProfileSuccess(null);
    setAvatarLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = res.data?.data;
      if (updatedUser?.avatar) {
        setAvatarUrl(updatedUser.avatar);
        if (user) {
          setUser({ ...user, avatar: updatedUser.avatar });
        }
        setProfileSuccess('Profile photo updated successfully.');
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || 'Failed to upload profile photo.');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove Avatar Handler
  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    setAvatarLoading(true);
    setProfileError(null);

    try {
      await api.delete('/users/me/avatar');
      setAvatarUrl('');
      if (user) {
        setUser({ ...user, avatar: null });
      }
      setProfileSuccess('Profile photo removed.');
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || 'Failed to remove photo.');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Profile Save Handler (A8, A9)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        whatsapp: whatsapp ? whatsapp.trim() : null,
        city: city ? city.trim() : null,
        country: country ? country.trim() : null,
        bio: bio ? bio.trim() : null,
        socialLinks: Object.fromEntries(
          Object.entries(socialLinks).map(([k, v]) => [k, v.trim()]).filter(([_, v]) => Boolean(v))
        ),
      };

      const res = await api.patch('/users/me', payload);
      const updatedUser = res.data?.data;

      if (updatedUser) {
        setProfileSuccess('Profile details saved successfully.');
        setIsDirty(false);
        if (user) {
          setUser({ ...user, ...updatedUser });
        }
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || err?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Update Handler
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
    <div className="space-y-8 max-w-4xl pb-24 sm:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy flex items-center gap-2.5">
          <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-blue" />
          Trader Account & Profile
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Customize your profile photo, contact channels, geographic location, and security settings.
        </p>
      </div>

      {/* Global Alerts */}
      {profileSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-green shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}
      {profileError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      {/* ── SECTION 1: Profile Photo (A7) ────────────────────────── */}
      <div className="bg-white border border-border rounded-3xl p-5 sm:p-7 shadow-soft">
        <h2 className="text-sm font-bold text-navy mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Camera className="w-4 h-4 text-blue" />
          Profile Avatar & Picture
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-border overflow-hidden bg-surface-tint flex items-center justify-center shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name || 'Avatar'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-text-muted" />
              )}
            </div>
            {avatarLoading && (
              <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <h3 className="text-sm font-bold text-text-heading">Display Photo</h3>
            <p className="text-xs text-text-muted max-w-md">
              Square images in JPG, PNG, or WebP format. Maximum file size 2 MB. This picture appears on your dashboard, reviews, and community comments.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
              <button
                type="button"
                disabled={avatarLoading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue hover:bg-blue-hover text-white text-xs font-bold rounded-full transition shadow-soft min-h-[38px]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  disabled={avatarLoading}
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-red-50 text-text-muted hover:text-red-600 border border-border text-xs font-semibold rounded-full transition min-h-[38px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Personal & Contact Info (A8, A9) ───────────── */}
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        <div className="bg-white border border-border rounded-3xl p-5 sm:p-7 shadow-soft space-y-5">
          <h2 className="text-sm font-bold text-navy flex items-center gap-2 uppercase tracking-wider">
            <User className="w-4 h-4 text-blue" />
            Trader Identification & Contacts
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider">
                  Primary Email (Read-only)
                </label>
                {user?.isEmailVerified ? (
                  <span className="text-[10px] text-green font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-600 font-bold">Unverified</span>
                )}
              </div>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-surface-tint border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-muted cursor-not-allowed"
              />
            </div>

            {/* Mobile (A1) */}
            <div>
              <PhoneInput
                label="Mobile Number *"
                name="mobilePhone"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
            </div>

            {/* WhatsApp Number (A8) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider">
                  WhatsApp Number
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-blue font-medium">
                  <input
                    type="checkbox"
                    checked={sameAsMobile}
                    onChange={(e) => handleToggleSameAsMobile(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue border-border focus:ring-blue"
                  />
                  <span>Same as mobile</span>
                </label>
              </div>
              <PhoneInput
                name="whatsappPhone"
                value={whatsapp}
                onChange={(val) => {
                  setWhatsapp(val);
                  setIsDirty(true);
                  if (sameAsMobile && val !== phone) {
                    setSameAsMobile(false);
                  }
                }}
              />
            </div>

            {/* Country Dropdown (A9) */}
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setIsDirty(true);
                }}
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City (A9) */}
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="e.g. Mumbai, Dubai, London"
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition"
              />
            </div>
          </div>

          {/* Short Bio (A9) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-text-heading uppercase tracking-wider">
                Trader Bio / Experience Summary
              </label>
              <span className="text-[10px] text-text-muted">{bio.length}/500</span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Tell other traders about your trading style, favorite currency pairs, or risk management strategy..."
              className="w-full bg-white border border-border rounded-xl p-3 text-xs sm:text-sm text-text-heading placeholder-text-muted focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue resize-none transition"
            />
          </div>
        </div>

        {/* ── SECTION 3: Social & Web Profiles (A9) ────────────────── */}
        <div className="bg-white border border-border rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
          <h2 className="text-sm font-bold text-navy flex items-center gap-2 uppercase tracking-wider">
            <Share2 className="w-4 h-4 text-blue" />
            Social Media & Web Links
          </h2>
          <p className="text-xs text-text-muted">
            Connect your public social profiles for community verification and networking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-heading mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) => {
                  setSocialLinks({ ...socialLinks, linkedin: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="https://linkedin.com/in/username"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-heading mb-1">X / Twitter</label>
              <input
                type="url"
                value={socialLinks.x}
                onChange={(e) => {
                  setSocialLinks({ ...socialLinks, x: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="https://x.com/username"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-heading mb-1">Telegram Handle / Channel</label>
              <input
                type="url"
                value={socialLinks.telegram}
                onChange={(e) => {
                  setSocialLinks({ ...socialLinks, telegram: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="https://t.me/username"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-heading mb-1">YouTube Channel</label>
              <input
                type="url"
                value={socialLinks.youtube}
                onChange={(e) => {
                  setSocialLinks({ ...socialLinks, youtube: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="https://youtube.com/@channel"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-heading mb-1">Instagram Profile</label>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => {
                  setSocialLinks({ ...socialLinks, instagram: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="https://instagram.com/username"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-heading mb-1">Personal Website / Blog</label>
              <input
                type="url"
                value={socialLinks.website}
                onChange={(e) => {
                  setSocialLinks({ ...socialLinks, website: e.target.value });
                  setIsDirty(true);
                }}
                placeholder="https://yourwebsite.com"
                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:border-blue"
              />
            </div>
          </div>
        </div>

        {/* Sticky Action Save Bar */}
        <StickyActionBar>
          {isDirty && (
            <span className="text-xs text-amber-700 font-semibold mr-auto hidden sm:inline">
              ⚠️ You have unsaved profile changes
            </span>
          )}
          <button
            type="submit"
            disabled={savingProfile}
            className="w-full sm:w-auto px-8 py-3 bg-blue hover:bg-blue-hover text-white rounded-full text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-soft disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Saving Details...' : 'Save Profile Details'}</span>
          </button>
        </StickyActionBar>
      </form>

      {/* ── SECTION 4: Security Credentials ──────────────────────── */}
      <div className="bg-white border border-border rounded-3xl p-5 sm:p-7 shadow-soft space-y-4">
        <h2 className="text-sm font-bold text-navy flex items-center gap-2 uppercase tracking-wider">
          <Lock className="w-4 h-4 text-orange" />
          Password & Security
        </h2>

        {passwordSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}
        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full sm:max-w-md bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-white border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-heading focus:outline-none focus:border-blue"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full sm:w-auto px-6 py-2.5 bg-surface-tint hover:bg-border/60 text-navy rounded-full text-xs font-bold transition flex items-center justify-center gap-2 border border-border disabled:opacity-50 min-h-[42px]"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
