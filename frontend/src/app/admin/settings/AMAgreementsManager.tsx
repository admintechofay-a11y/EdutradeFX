'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Edit3, AlertTriangle, CheckCircle2, Shield, AlertCircle, Save, X } from 'lucide-react';
import { api } from '@/lib/api';
import { AccountManagerAgreement } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

export const AMAgreementsManager: React.FC = () => {
  const [agreements, setAgreements] = useState<AccountManagerAgreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAgreement, setEditingAgreement] = useState<AccountManagerAgreement | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/account-managers/agreements');
      setAgreements(res.data?.data || []);
    } catch (err: any) {
      console.error('Failed to load agreements', err);
      toast.error(err.response?.data?.message || 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const openEditModal = (agr: AccountManagerAgreement) => {
    setEditingAgreement(agr);
    setFormTitle(agr.title);
    setFormBody(agr.body);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgreement) return;

    try {
      setSaving(true);
      const res = await api.put(`/admin/account-managers/agreements/${editingAgreement.key}`, {
        title: formTitle,
        body: formBody,
      });

      toast.success(
        `Agreement "${editingAgreement.key}" updated to version ${res.data?.data?.version}. Managers will be prompted to re-accept.`
      );
      setEditingAgreement(null);
      fetchAgreements();
    } catch (err: any) {
      console.error('Failed to update agreement', err);
      toast.error(err.response?.data?.message || 'Failed to update agreement');
    } finally {
      setSaving(false);
    }
  };

  const hasDraftPlaceholder = agreements.some((a) =>
    a.body.includes('[DRAFT — replace with legal-approved text before launch]')
  );

  return (
    <div className="space-y-6">
      {/* Legal Text Disclaimer Banner */}
      {hasDraftPlaceholder && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 leading-relaxed">
            <span className="font-bold">LEGAL COMPLIANCE WARNING: </span>
            One or more active Account Manager agreements currently contain the placeholder marker:{' '}
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
              <FileText className="w-4 h-4 text-blue" />
              <span>Account Manager Legal Contracts & Agreements</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Version-controlled legal contracts required for Account Manager onboarding. Editing any body automatically
              increments the version and prompts live managers to re-accept.
            </p>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : agreements.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted">No agreements found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted uppercase text-[10px] bg-surface-tint">
                  <th className="p-3.5">Agreement Key</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Version</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Updated</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agreements.map((agr) => {
                  const isPlaceholder = agr.body.includes(
                    '[DRAFT — replace with legal-approved text before launch]'
                  );
                  return (
                    <tr key={agr.id} className="hover:bg-surface-tint/50 transition">
                      <td className="p-3.5 font-bold font-mono text-navy">{agr.key}</td>
                      <td className="p-3.5 font-semibold text-text-heading">{agr.title}</td>
                      <td className="p-3.5 font-bold font-mono text-blue">v{agr.version}</td>
                      <td className="p-3.5">
                        {isPlaceholder ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            DRAFT PLACEHOLDER
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                            LEGAL APPROVED
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-text-muted">
                        {new Date(agr.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(agr)}
                          className="px-3 py-1.5 rounded-xl bg-surface-tint border border-border hover:bg-blue-50 hover:text-blue hover:border-blue text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Agreement Modal */}
      {editingAgreement && (
        <Modal
          isOpen={!!editingAgreement}
          onClose={() => setEditingAgreement(null)}
          title={`Edit Agreement: ${editingAgreement.key}`}
        >
          <form onSubmit={handleSave} className="space-y-4 p-2 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
              <span className="font-bold">Notice on Versioning: </span>
              Saving changes to this contract will automatically increment the version to{' '}
              <span className="font-bold">v{editingAgreement.version + 1}</span>. Existing live managers will be flagged
              with a re-acceptance requirement banner.
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">Contract Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-heading mb-1">Agreement Body Text</label>
              <textarea
                required
                rows={12}
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-blue focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingAgreement(null)}
                className="px-4 py-2 border border-border rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-soft transition flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save & Bump Version'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
