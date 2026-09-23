'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileUp, FileCheck, Shield, CheckCircle2, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function BrokerDocumentsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('regulatory_license');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getBrokerProfile();
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !docUrl.trim()) return;

    setUploading(true);
    setFeedback(null);

    const newDocs = [
      ...(profile?.documents || []),
      {
        name: docName,
        docType,
        url: docUrl,
        uploadedAt: new Date().toISOString(),
      },
    ];

    try {
      const res = await api.submitBrokerDocuments(newDocs);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Document submitted for compliance audit.' });
        setProfile((prev: any) => ({ ...prev, documents: newDocs }));
        setDocName('');
        setDocUrl('');
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to submit document.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Upload error.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/broker"
          className="text-xs text-gold-primary hover:underline flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
        <h1 className="text-2xl font-bold font-serif text-white">Regulatory & Compliance Documents</h1>
        <p className="text-xs text-text-muted-dark mt-1">
          Upload government-issued financial licenses, certificates of incorporation, and AML compliance audits to maintain verified status.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Upload Form */}
      <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileUp className="w-4 h-4 text-gold-primary" />
          Add Verification Document
        </h2>

        <form onSubmit={handleAddDocument} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-text-muted-dark mb-1">
              Document Name / Identifier
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. ASIC AFSL No. 335692 Certificate"
              required
              className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted-dark mb-1">
              Category
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
            >
              <option value="regulatory_license">Financial Services Regulatory License</option>
              <option value="incorporation_cert">Certificate of Incorporation</option>
              <option value="fund_segregation_audit">Audited Client Segregation Report</option>
              <option value="aml_policy">AML / CTF Compliance Policy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted-dark mb-1">
              Document Cloud URL / PDF Link
            </label>
            <input
              type="url"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              placeholder="https://docs.edutradefx.com/licenses/icmarkets-asic.pdf"
              required
              className="w-full px-3 py-2 rounded-lg bg-navy-deepest border border-navy-border text-sm text-white focus:outline-none focus:border-gold-primary"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 rounded-lg bg-gold-primary hover:bg-gold-light text-navy-deepest font-bold text-xs uppercase tracking-wider shadow-glow-gold transition-all disabled:opacity-50 cursor-pointer"
            >
              {uploading ? 'Registering...' : 'Register Compliance Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="p-6 rounded-2xl bg-navy-surface border border-navy-border space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Current Verification Portfolio
        </h2>

        {!profile?.documents || profile.documents.length === 0 ? (
          <div className="p-8 text-center text-text-muted-dark text-xs border border-dashed border-navy-border rounded-xl">
            No compliance documents on file. Upload official documentation to fast-track administrator approval.
          </div>
        ) : (
          <div className="divide-y divide-navy-border">
            {profile.documents.map((doc: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-primary/10 flex items-center justify-center text-gold-primary shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{doc.name}</div>
                    <div className="text-[11px] text-text-muted-dark">
                      Type: <span className="capitalize">{doc.docType.replace(/_/g, ' ')}</span> • Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold-primary hover:underline shrink-0"
                >
                  View Document ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
