'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, UploadCloud, FileText, CheckCircle, Clock, AlertCircle, Download, Trash2, Eye } from 'lucide-react';
import { api } from '../../../../lib/api';
import PageContainer from '../../../../components/ui/PageContainer';
import Button from '../../../../components/ui/Button';
import FileDropzone from '../../../../components/forms/FileDropzone';

const DOC_TYPES = [
  { type: 'CERTIFICATE_OF_INCORPORATION', label: 'Certificate of Incorporation *', req: true },
  { type: 'TAX_REGISTRATION', label: 'Tax Registration / VAT Certificate *', req: true },
  { type: 'DIRECTOR_ID_PROOF', label: 'Authorized Signatory / Director ID Proof *', req: true },
  { type: 'SOC2_OR_ISO_CERT', label: 'ISO 27001 / SOC 2 Type II Security Report', req: false },
  { type: 'REGULATORY_AUTHORIZATION', label: 'Regulatory License / Sandbox Letter (if applicable)', req: false },
  { type: 'CLIENT_REFERENCES', label: 'Institutional Client References / Testimonials', req: false },
];

export default function VerificationDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await api.get('/service-providers/me');
      if (res.data?.success && res.data.data) {
        setDocuments(res.data.data.documents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, docType: string) => {
    setUploadingType(docType);
    const data = new FormData();
    data.append('file', file);
    data.append('docType', docType);

    try {
      await api.post('/service-providers/me/documents', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await loadDocs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Document upload failed');
    } finally {
      setUploadingType(null);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    try {
      await api.delete(`/service-providers/me/documents/${docId}`);
      await loadDocs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document');
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
      <div className="space-y-6 pb-20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Verification & Compliance Vault
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Form 2 F & Security Audits: Required corporate records for compliance vetting.
          </p>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Corporate Storage Protection</span>
          </div>
          <p className="text-slate-300">
            All verification proofs are stored in authenticated Cloudinary vaults. Download URLs are
            temporary, digitally signed with a maximum 5-minute expiry, and strictly restricted to the
            EdutradeFX Compliance Directorate. They are never published publicly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOC_TYPES.map((d) => {
            const existing = documents.find((doc) => doc.docType === d.type);
            const isUploading = uploadingType === d.type;

            return (
              <div
                key={d.type}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{d.label}</h3>
                    {existing ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                      </span>
                    ) : d.req ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                        Required
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Optional</span>
                    )}
                  </div>

                  {existing ? (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {existing.fileName || 'Verification Document.pdf'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Status: <strong>{existing.status || 'PENDING'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(existing.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <FileDropzone
                        accept=".pdf,.png,.jpg,.jpeg"
                        label=""
                        helpText="PDF or scanned image up to 10MB"
                        isUploading={isUploading}
                        onFileSelect={(f) => handleUpload(f, d.type)}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
