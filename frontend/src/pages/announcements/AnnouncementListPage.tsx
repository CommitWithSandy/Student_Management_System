import React, { useState, useEffect } from 'react';
import { announcementService } from '../../services/academicServices';
import { Announcement } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Plus, Calendar, CheckCircle2, XCircle, AlertCircle, Trash2, Users } from 'lucide-react';

export const AnnouncementListPage: React.FC = () => {
  const { role } = useAuth();
  const canCreate = role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ROLE_TEACHER';

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS' | 'TEACHERS' | 'COURSE' | 'CLASS'>('ALL');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAll(0, 50);
      if (res.success) {
        setAnnouncements(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setTargetAudience('ALL');
    setPublishDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('2026-12-31');
    setFormError(null);
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      await announcementService.create({
        title: title.trim(),
        description: description.trim(),
        targetAudience,
        publishDate,
        expiryDate,
        isActive: true,
      });
      setFeedback({ type: 'success', message: 'Campus announcement published successfully.' });
      setModalOpen(false);
      loadAnnouncements();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to post announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this broadcast announcement?')) return;
    try {
      await announcementService.delete(id);
      setFeedback({ type: 'success', message: 'Announcement retracted.' });
      loadAnnouncements();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to delete.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Megaphone className="text-indigo-600" size={28} />
            Institutional Announcements & Notice Board
          </h1>
          <p className="text-slate-500 text-sm mt-1">Institutional circulars, examination updates, holiday notices, and campus broadcasts.</p>
        </div>
        {canCreate && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Post Notice
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

      {/* Announcements Feed */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading notice board...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
          <Megaphone className="mx-auto text-slate-400 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-slate-800">No Announcements Active</h3>
          <p className="text-slate-500 text-sm mt-1">There are no published institutional circulars at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                    <Users size={12} />
                    {item.targetAudience}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={13} className="text-slate-400" />
                    Published: {item.publishDate}
                  </span>
                </div>

                {canCreate && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                    title="Retract Notice"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h2>
              <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">{item.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>By: {item.createdByName || 'Administration'}</span>
                {item.expiryDate && <span>Expires: {item.expiryDate}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Post Institutional Notice</h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience *</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="ALL">Entire Campus (All)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="TEACHERS">Faculty / Teachers Only</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notice Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule for Mid-Term Laboratory Examinations"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Notice Content *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Enter official circular text..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Publish Date</label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
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
                  {submitting ? 'Publishing...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
