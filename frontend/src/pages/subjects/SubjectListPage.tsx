import React, { useState, useEffect } from 'react';
import { subjectService, courseService } from '../../services/academicServices';
import { Subject, Course } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { FileSpreadsheet, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, Award } from 'lucide-react';

export const SubjectListPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN';
  const isStudent = role === 'ROLE_STUDENT';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [courseId, setCourseId] = useState<number>(0);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [semester, setSemester] = useState<number>(1);
  const [credits, setCredits] = useState<number>(4);
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [passingMarks, setPassingMarks] = useState<number>(40);
  const [type, setType] = useState<'THEORY' | 'PRACTICAL'>('THEORY');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [search, selectedCourse]);

  const loadCourses = async () => {
    try {
      const res = await courseService.getActive();
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const res = await subjectService.getAll(0, 50, search, selectedCourse);
      if (res.success) {
        setSubjects(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setCourseId(courses.length > 0 ? courses[0].id : 0);
    setCode('');
    setName('');
    setSemester(1);
    setCredits(4);
    setMaxMarks(100);
    setPassingMarks(40);
    setType('THEORY');
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setCourseId(sub.courseId);
    setCode(sub.code);
    setName(sub.name);
    setSemester(sub.semester);
    setCredits(sub.credits);
    setMaxMarks(sub.maxMarks);
    setPassingMarks(sub.passingMarks);
    setType(sub.type);
    setStatus(sub.status);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!courseId || !code.trim() || !name.trim()) {
      setFormError('Course, subject code, and name are required.');
      return;
    }

    if (passingMarks > maxMarks) {
      setFormError('Passing marks cannot exceed maximum marks.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Subject> = {
        courseId,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        semester: Number(semester),
        credits: Number(credits),
        maxMarks: Number(maxMarks),
        passingMarks: Number(passingMarks),
        type,
        status,
      };

      if (editingSubject) {
        await subjectService.update(editingSubject.id, payload);
        setFeedback({ type: 'success', message: 'Subject updated successfully.' });
      } else {
        await subjectService.create(payload);
        setFeedback({ type: 'success', message: 'Subject created successfully.' });
      }
      setModalOpen(false);
      loadSubjects();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save subject.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectService.delete(id);
      setFeedback({ type: 'success', message: 'Subject deleted.' });
      loadSubjects();
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
            <FileSpreadsheet className="text-indigo-600" size={28} />
            {isStudent ? 'My Enrolled Subjects' : 'Academic Subjects'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isStudent
              ? 'View your semester syllabus, credit points, passing benchmarks, and module specifications.'
              : 'Configure syllabus modules, credits, examination benchmarks, and course mappings.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Create Subject
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-700">No Subjects Found</h3>
            <p className="text-slate-500 text-sm mt-1">
              {isStudent ? 'No subjects are currently listed for your curriculum.' : 'Get started by creating your first subject syllabus.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Subject Code & Name</th>
                  <th className="py-4 px-6">Course</th>
                  <th className="py-4 px-6">Semester</th>
                  <th className="py-4 px-6">Credits</th>
                  <th className="py-4 px-6">Max / Pass Marks</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Status</th>
                  {isAdmin && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div>{sub.name}</div>
                      <div className="text-xs font-mono text-indigo-600 font-semibold">{sub.code}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{sub.courseName || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-600">Semester {sub.semester}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="font-semibold text-slate-900">{sub.credits}</span> pts
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="text-slate-900 font-semibold">{sub.maxMarks}</span> / <span className="text-emerald-700 font-medium">{sub.passingMarks}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          sub.type === 'THEORY' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isAdmin && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Create Subject'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Course *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option value={0}>Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Subject Code *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CS201"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Subject Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Database Management Systems"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Semester *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Max Marks *</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Passing Marks *</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Subject Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="THEORY">Theory</option>
                    <option value="PRACTICAL">Practical / Lab</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Saving...' : editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
