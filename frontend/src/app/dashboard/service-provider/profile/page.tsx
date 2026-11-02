'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Save, Loader2, UploadCloud, CheckCircle } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import LocationSelect from '../../../../components/forms/LocationSelect';
import FileDropzone from '../../../../components/forms/FileDropzone';

export default function CompanyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    legalName: '',
    brandName: '',
    registrationNumber: '',
    registrationAuthority: '',
    yearEstablished: new Date().getFullYear(),
    website: '',
    companyEmail: '',
    companyPhone: '',
    tagline: '',
    overview: '',
    registeredAddress: {},
    sameAddress: true,
    operationalAddress: {},
    primaryContact: { name: '', title: '', email: '', phone: '' },
    logo: null,
    coverImage: null,
    presentationUrl: null,
  });

  useEffect(() => {
    api
      .get('/service-providers/me')
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          setFormData({
            legalName: d.legalName || '',
            brandName: d.brandName || '',
            registrationNumber: d.registrationNumber || '',
            registrationAuthority: d.registrationAuthority || '',
            yearEstablished: d.yearEstablished || new Date().getFullYear(),
            website: d.website || '',
            companyEmail: d.companyEmail || '',
            companyPhone: d.companyPhone || '',
            tagline: d.tagline || '',
            overview: d.overview || '',
            registeredAddress: d.registeredAddress || {},
            sameAddress: d.sameAddress ?? true,
            operationalAddress: d.operationalAddress || {},
            primaryContact: d.contacts?.[0] || { name: '', title: '', email: '', phone: '' },
            logo: d.logo || null,
            coverImage: d.coverImage || null,
            presentationUrl: d.presentationUrl || null,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await api.put('/service-providers/me/profile', {
        legalName: formData.legalName,
        brandName: formData.brandName,
        registrationNumber: formData.registrationNumber,
        registrationAuthority: formData.registrationAuthority,
        yearEstablished: Number(formData.yearEstablished) || undefined,
        website: formData.website,
        companyEmail: formData.companyEmail,
        companyPhone: formData.companyPhone,
        tagline: formData.tagline,
        overview: formData.overview,
        registeredAddress: formData.registeredAddress,
        sameAddress: formData.sameAddress,
        operationalAddress: formData.sameAddress ? formData.registeredAddress : formData.operationalAddress,
        primaryContact: formData.primaryContact,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, field: 'logo' | 'cover' | 'presentation') => {
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post(`/service-providers/me/media/${field}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        if (field === 'logo') setFormData((prev: any) => ({ ...prev, logo: res.data.data.url }));
        if (field === 'cover') setFormData((prev: any) => ({ ...prev, coverImage: res.data.data.url }));
        if (field === 'presentation') setFormData((prev: any) => ({ ...prev, presentationUrl: res.data.data.url }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'File upload failed');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <form onSubmit={handleSave} className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Company Profile</h1>
            <p className="text-sm text-slate-500 mt-0.5">Form 2: Identity, Address, Contact & Brand Assets</p>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={saving}
            className="flex items-center gap-1.5 self-start"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </Button>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Company profile updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Section 2A: Identity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            A. Legal & Brand Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Legal Entity Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="e.g. Nexus Technology Ltd"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Trading Name</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. NexusTech"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Registration Number</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="e.g. HE 412345"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Authority</label>
              <input
                type="text"
                value={formData.registrationAuthority}
                onChange={(e) => setFormData({ ...formData, registrationAuthority: e.target.value })}
                placeholder="e.g. Companies House / Registrar of Companies"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Year Established</label>
              <input
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                value={formData.yearEstablished}
                onChange={(e) => setFormData({ ...formData, yearEstablished: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Company Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                placeholder="contact@company.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Company Phone</label>
              <input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                placeholder="+1 555 123 4567"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Next-generation institutional bridge and liquidity aggregator"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Overview</label>
            <textarea
              rows={4}
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              placeholder="Provide a concise description of your company, core focus, and market history..."
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Section 2B: Addresses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            B. Headquarters & Operational Address
          </h2>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Registered Address</h3>
            <LocationSelect
              value={formData.registeredAddress}
              onChange={(val) => setFormData({ ...formData, registeredAddress: val })}
              required
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sameAddress}
                onChange={(e) => setFormData({ ...formData, sameAddress: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span>Operational address is the same as registered address</span>
            </label>
          </div>

          {!formData.sameAddress && (
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Operational Address
              </h3>
              <LocationSelect
                value={formData.operationalAddress}
                onChange={(val) => setFormData({ ...formData, operationalAddress: val })}
              />
            </div>
          )}
        </div>

        {/* Section 2D: Primary Contact */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            D. Primary Corporate Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Full Name</label>
              <input
                type="text"
                value={formData.primaryContact.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryContact: { ...formData.primaryContact, name: e.target.value },
                  })
                }
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Title / Role</label>
              <input
                type="text"
                value={formData.primaryContact.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryContact: { ...formData.primaryContact, title: e.target.value },
                  })
                }
                placeholder="Chief Technology Officer"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Business Email</label>
              <input
                type="email"
                value={formData.primaryContact.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryContact: { ...formData.primaryContact, email: e.target.value },
                  })
                }
                placeholder="jane@company.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Phone / WhatsApp</label>
              <input
                type="tel"
                value={formData.primaryContact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    primaryContact: { ...formData.primaryContact, phone: e.target.value },
                  })
                }
                placeholder="+1 555 987 6543"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2E: Media & Brand Assets */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            E. Brand Assets & Presentation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Logo</label>
              <FileDropzone
                accept="image/*"
                label=""
                helpText="PNG/SVG recommended (max 5MB)"
                value={formData.logo}
                onFileSelect={(f) => handleFileUpload(f, 'logo')}
                onRemove={() => setFormData({ ...formData, logo: null })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Cover Banner</label>
              <FileDropzone
                accept="image/*"
                label=""
                helpText="1200x400 JPG/PNG (max 5MB)"
                value={formData.coverImage}
                onFileSelect={(f) => handleFileUpload(f, 'cover')}
                onRemove={() => setFormData({ ...formData, coverImage: null })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Deck / Brochure</label>
              <FileDropzone
                accept=".pdf"
                label=""
                helpText="PDF format (max 15MB)"
                value={formData.presentationUrl}
                onFileSelect={(f) => handleFileUpload(f, 'presentation')}
                onRemove={() => setFormData({ ...formData, presentationUrl: null })}
              />
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}

