import React, { useState, useEffect } from 'react';
import { classService, courseService } from '../../services/academicServices';
import { ClassBatch, Course } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { Layers, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';

export const ClassListPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN';

  const [classes, setClasses] = useState<ClassBatch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassBatch | null>(null);

  // Form states
  const [courseId, setCourseId] = useState<number>(0);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [semester, setSemester] = useState<number>(1);
  const [division, setDivision] = useState('A');
  const [section, setSection] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number>(60);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadClasses();
  }, [selectedCourse]);

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

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await classService.getAll(0, 50, selectedCourse);
      if (res.success) {
        setClasses(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setCourseId(courses.length > 0 ? courses[0].id : 0);
    setAcademicYear('2026-2027');
    setSemester(1);
    setDivision('A');
    setSection('');
    setRoomNumber('Room 101');
    setMaxCapacity(60);
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: ClassBatch) => {
    setEditingClass(c);
    setCourseId(c.courseId);
    setAcademicYear(c.academicYear);
    setSemester(c.semester);
    setDivision(c.division);
    setSection(c.section || '');
    setRoomNumber(c.roomNumber || '');
    setMaxCapacity(c.maxCapacity);
    setStatus(c.status);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!courseId || !academicYear.trim() || !division.trim()) {
      setFormError('Course, academic year, and division are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<ClassBatch> = {
        courseId,
        academicYear: academicYear.trim(),
        semester: Number(semester),
        division: division.trim().toUpperCase(),
        section: section.trim() || undefined,
        roomNumber: roomNumber.trim() || undefined,
        maxCapacity: Number(maxCapacity),
        status,
      };

      if (editingClass) {
        await classService.update(editingClass.id, payload);
        setFeedback({ type: 'success', message: 'Class batch updated successfully.' });
      } else {
        await classService.create(payload);
        setFeedback({ type: 'success', message: 'Class batch created successfully.' });
      }
      setModalOpen(false);
      loadClasses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save class batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this class batch?')) return;
    try {
      await classService.delete(id);
      setFeedback({ type: 'success', message: 'Class batch deleted.' });
      loadClasses();
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
            <Layers className="text-indigo-600" size={28} />
            Classes & Batches
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin
              ? 'Manage academic divisions, batch cohorts, capacities, and classrooms.'
              : 'Browse class batches, schedules, cohorts, and assigned classrooms.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Create Class Batch
          </button>
        )}
      </div>

      {/* Alerts */}
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-64">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Filter by Course</label>
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
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

      {/* Classes Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-700">No Classes Found</h3>
            <p className="text-slate-500 text-sm mt-1">Get started by creating your first class batch for a course.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Course & Code</th>
                  <th className="py-4 px-6">Academic Year</th>
                  <th className="py-4 px-6">Semester & Division</th>
                  <th className="py-4 px-6">Classroom</th>
                  <th className="py-4 px-6">Capacity</th>
                  <th className="py-4 px-6">Status</th>
                  {isAdmin && <th className="py-4 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div>{cls.courseName || 'N/A'}</div>
                      <div className="text-xs text-indigo-600 font-semibold">{cls.courseCode}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{cls.academicYear}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <span className="font-semibold text-slate-900">Sem {cls.semester}</span> - Div {cls.division}
                      {cls.section && <span className="text-xs text-slate-500 ml-1">({cls.section})</span>}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{cls.roomNumber || 'TBD'}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users size={15} className="text-slate-400" />
                        <span>{cls.maxCapacity} Max</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          cls.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {cls.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(cls)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id)}
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
      {modalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingClass ? 'Edit Class Batch' : 'Create Class Batch'}
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year *</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2026-2027"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Division *</label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="e.g. A or B"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Section (Optional)</label>
                  <input
                    type="text"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. Morning / Shift 1"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Room Number</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Lab 4 or Room 204"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
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
                  {submitting ? 'Saving...' : editingClass ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
