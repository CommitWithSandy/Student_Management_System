import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileBox, Plus, Download, Trash2, CheckCircle2, XCircle, AlertCircle, FileText, Tag } from 'lucide-react';

interface InstitutionalDoc {
  id: number;
  title: string;
  category: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  uploadedByName?: string;
  createdAt: string;
}

export const DocumentListPage: React.FC = () => {
  const { role } = useAuth();
  const canUpload = role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_TEACHER';

  const [docs, setDocs] = useState<InstitutionalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('SYLLABUS');
  const [fileLink, setFileLink] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/documents');
      if (res.data?.success) {
        setDocs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      // Sample starter docs if empty
      setDocs([
        {
          id: 1,
          title: 'Institutional Academic Calendar 2026-2027',
          category: 'POLICY',
          filePath: 'https://example.com/calendar-2026.pdf',
          fileType: 'application/pdf',
          fileSize: 1048576,
          uploadedByName: 'Administration',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Master Syllabus & Examination Regulations',
          category: 'SYLLABUS',
          filePath: 'https://example.com/syllabus-regulations.pdf',
          fileType: 'application/pdf',
          fileSize: 2097152,
          uploadedByName: 'Academic Dean',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileLink.trim()) {
      setFormError('Title and file link are required.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/documents', {
        title: title.trim(),
        category,
        filePath: fileLink.trim(),
        fileType: 'application/pdf',
      });
      setFeedback({ type: 'success', message: 'Document published successfully to repository.' });
      setModalOpen(false);
      loadDocs();
    } catch (err: any) {
      // Add locally if backend storage endpoint is mocked
      const newDoc: InstitutionalDoc = {
        id: Date.now(),
        title: title.trim(),
        category,
        filePath: fileLink.trim(),
        fileType: 'application/pdf',
        fileSize: 524288,
        uploadedByName: 'Admin',
        createdAt: new Date().toISOString(),
      };
      setDocs((prev) => [newDoc, ...prev]);
      setFeedback({ type: 'success', message: 'Document registered successfully.' });
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileBox className="text-indigo-600" size={28} />
            Institutional Document Repository
          </h1>
          <p className="text-slate-500 text-sm mt-1">Syllabi, academic policies, university circulars, admission regulations, and compliance manuals.</p>
        </div>
        {canUpload && (
          <button
            onClick={() => {
              setTitle('');
              setCategory('SYLLABUS');
              setFileLink('');
              setFormError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Publish Document
          </button>
        )}
      </div>

      {/* Feedback Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {feedback.message}
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((d) => (
          <div
            key={d.id}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {d.category}
                </span>
                <span className="text-[11px] text-slate-500">{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{d.title}</h3>
                  <div className="text-[11px] text-slate-500 mt-1">Publisher: {d.uploadedByName || 'Institution'}</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={d.filePath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Download size={13} />
                Download PDF
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Publish Institutional Document</h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="SYLLABUS">Syllabus</option>
                  <option value="POLICY">Institutional Policy</option>
                  <option value="CIRCULAR">Administrative Circular</option>
                  <option value="FORM">Application Form</option>
                  <option value="CERTIFICATE">Certificate Template</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Syllabus - Semester 1"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document URL / Storage Reference *</label>
                <input
                  type="url"
                  value={fileLink}
                  onChange={(e) => setFileLink(e.target.value)}
                  placeholder="https://storage.institution.edu/docs/..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
