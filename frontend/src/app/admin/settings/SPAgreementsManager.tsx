'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Edit3, AlertTriangle, CheckCircle2, Shield, AlertCircle, Save, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export const SPAgreementsManager: React.FC = () => {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgreement, setEditingAgreement] = useState<any | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/signal-providers/agreements');
      setAgreements(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load SP agreements', err);
      toast.error(err.response?.data?.message || 'Failed to load SP agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const openEditModal = (agr: any) => {
    setEditingAgreement(agr);
    setFormTitle(agr.title);
    setFormBody(agr.body);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgreement) return;

    try {
      setSaving(true);
      const res = await api.put(`/admin/signal-providers/agreements/${editingAgreement.key}`, {
        title: formTitle,
        body: formBody,
      });

      toast.success(
        `Agreement "${editingAgreement.key}" updated to version ${res.data?.data?.version}. Signal providers will be prompted to re-accept.`
      );
      setEditingAgreement(null);
      fetchAgreements();
    } catch (err: any) {
      console.error('Failed to update SP agreement', err);
      toast.error(err.response?.data?.message || 'Failed to update agreement');
    } finally {
      setSaving(false);
    }
  };

  const hasDraftPlaceholder = agreements.some((a) =>
    a.body?.includes('[DRAFT — replace with legal-approved text before launch]')
  );

  return (
    <div className="space-y-6">
      {/* Legal Text Disclaimer Banner */}
      {hasDraftPlaceholder && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <span className="font-bold">LEGAL COMPLIANCE WARNING: </span>
            One or more active Signal Provider agreements currently contain the placeholder marker:{' '}
            <code className="px-1.5 py-0.5 rounded bg-amber-200/60 font-mono font-bold text-[11px]">
              [DRAFT — replace with legal-approved text before launch]
            </code>
            . Replace these placeholders with counsel-approved legal agreements prior to commercial launch.
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-border shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-navy flex items-center gap-2">
              <FileText className="w-4 h-4 text-green" />
              <span>Signal Provider Legal Agreements &amp; Commitments</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Version-controlled legal contracts required for Signal Provider onboarding. Editing any body automatically
              increments the version and prompts live providers to re-accept.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : agreements.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-6">No agreements found.</p>
        ) : (
          <div className="space-y-3">
            {agreements.map((agr) => {
              const isPlaceholder = agr.body?.includes(
                '[DRAFT — replace with legal-approved text before launch]'
              );

              return (
                <div
                  key={agr.id || agr.key}
                  className="p-4 rounded-2xl bg-surface-tint border border-border hover:border-green/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-xs text-navy">{agr.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue font-mono font-bold text-[10px] border border-blue-200">
                        v{agr.version}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-surface-tint text-text-muted font-mono text-[10px] border border-border">
                        {agr.key}
                      </span>
                      {isPlaceholder && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">
                          Placeholder Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted line-clamp-2">{agr.body}</p>
                  </div>

                  <button
                    onClick={() => openEditModal(agr)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border hover:bg-surface-tint rounded-xl text-xs font-bold text-text-heading transition shrink-0 self-start sm:self-auto"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-text-muted" />
                    <span>Edit Body</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingAgreement)}
        onClose={() => setEditingAgreement(null)}
        maxWidth="lg"
        title={editingAgreement ? `Edit Agreement: ${editingAgreement.title}` : undefined}
        subtitle="Updating the body will increment the agreement version and require re-acceptance by active providers."
      >
        {editingAgreement && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Contract Key (Immutable)
              </label>
              <input
                type="text"
                disabled
                value={editingAgreement.key}
                className="w-full px-3.5 py-2 bg-gray-100 border border-border rounded-xl text-xs font-mono text-text-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Display Title
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs text-text-heading font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Agreement Legal Body (Full Text)
              </label>
              <textarea
                required
                rows={10}
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                className="w-full p-3.5 bg-white border border-border rounded-xl text-xs text-text-heading font-mono leading-relaxed resize-y"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Version Bump Warning: </strong>
                Saving will increment this agreement to version {editingAgreement.version + 1}. All approved signal providers will be flagged to re-accept before broadcasting new signals.
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              {saving ? 'Updating...' : 'Save & Publish New Version'}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};
