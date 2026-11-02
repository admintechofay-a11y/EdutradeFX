'use client';

import React, { useEffect, useState } from 'react';
import { Users, Plus, Trash2, Edit, Save, Loader2, CheckCircle, ShieldAlert, X } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import FileDropzone from '../../../../components/forms/FileDropzone';

export default function TeamMembersPage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    roleTitle: '',
    department: 'EXECUTIVE',
    bio: '',
    linkedInUrl: '',
    isPublic: true,
    photoUrl: null as string | null,
  });

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      const res = await api.get('/service-providers/me');
      if (res.data?.success && res.data.data) {
        setTeam(res.data.data.teamMembers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setForm({
      name: '',
      roleTitle: '',
      department: 'EXECUTIVE',
      bio: '',
      linkedInUrl: '',
      isPublic: true,
      photoUrl: null,
    });
    setModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setEditingMember(member);
    setForm({
      name: member.name || '',
      roleTitle: member.roleTitle || '',
      department: member.department || 'EXECUTIVE',
      bio: member.bio || '',
      linkedInUrl: member.linkedInUrl || '',
      isPublic: member.isPublic ?? true,
      photoUrl: member.photoUrl || null,
    });
    setModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMember) {
        await api.put(`/service-providers/me/team/${editingMember.id}`, form);
      } else {
        await api.post('/service-providers/me/team', form);
      }
      setModalOpen(false);
      await loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.delete(`/service-providers/me/team/${id}`);
      await loadTeam();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete team member');
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await api.post('/service-providers/me/media/logo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setForm((prev) => ({ ...prev, photoUrl: res.data.data.url }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Photo upload failed');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-40 bg-slate-200 rounded-2xl"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Key Personnel & Team</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Highlight executive leadership, technical architects, and support leads.
            </p>
          </div>
          <Button
            type="button"
            onClick={openAddModal}
            variant="primary"
            size="sm"
            className="flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </Button>
        </div>

        {/* Strict Privacy Notice Banner */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Strict Compliance Privacy Guard:</span>
            <p className="text-blue-800 mt-0.5">
              Team member national identity numbers and equity ownership percentages are encrypted and retained
              exclusively for administrative compliance audits. They are never published publicly.
            </p>
          </div>
        </div>

        {team.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">No Team Members Added</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Introduce your management and engineering leads to prospective enterprise clients.
            </p>
            <div className="mt-4">
              <Button type="button" variant="primary" size="sm" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-1" />
                Add First Team Member
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {team.map((member) => (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 overflow-hidden shrink-0">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{member.name ? member.name[0] : 'U'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3">{member.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{member.roleTitle}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {member.bio || 'No bio provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Dept: {member.department || 'Executive'}</span>
                  <span>{member.isPublic ? 'Public on Profile' : 'Internal Only'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Title *</label>
                    <input
                      type="text"
                      required
                      value={form.roleTitle}
                      onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                      placeholder="e.g. Chief Executive Officer"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="EXECUTIVE">Executive / C-Suite</option>
                      <option value="ENGINEERING">Engineering / Tech</option>
                      <option value="PRODUCT">Product Management</option>
                      <option value="SALES">Sales / Business Dev</option>
                      <option value="SUPPORT">Client Support / Operations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="15+ years institutional FX experience..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={form.linkedInUrl}
                    onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Photo</label>
                  <FileDropzone
                    accept="image/*"
                    label=""
                    helpText="PNG/JPG (max 3MB)"
                    value={form.photoUrl}
                    onFileSelect={handlePhotoUpload}
                    onRemove={() => setForm({ ...form, photoUrl: null })}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Member'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

