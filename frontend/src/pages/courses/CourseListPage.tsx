import React, { useState, useEffect } from 'react';
import { courseService, departmentService } from '../../services/academicServices';
import { Course, Department } from '../../types/academic';
import { BookOpen, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationYears, setDurationYears] = useState(3);
  const [totalSemesters, setTotalSemesters] = useState(6);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [search, selectedDept]);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getActive();
      if (res.success) setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getAll(0, 50, search, selectedDept);
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setDepartmentId(departments[0]?.id || '');
    setCode('');
    setName('');
    setDescription('');
    setDurationYears(3);
    setTotalSemesters(6);
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setDepartmentId(course.departmentId);
    setCode(course.code);
    setName(course.name);
    setDescription(course.description || '');
    setDurationYears(course.durationYears);
    setTotalSemesters(course.totalSemesters);
    setStatus(course.status);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!departmentId || !code.trim() || !name.trim()) {
      setFormError('Department, course code, and name are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, {
          departmentId: Number(departmentId),
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
          durationYears,
          totalSemesters,
          status,
        });
        setFeedback({ type: 'success', message: 'Course updated successfully.' });
      } else {
        await courseService.create({
          departmentId: Number(departmentId),
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
          durationYears,
          totalSemesters,
          status,
        });
        setFeedback({ type: 'success', message: 'Course created successfully.' });
      }
      setModalOpen(false);
      loadCourses();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.delete(id);
      setFeedback({ type: 'success', message: 'Course deleted successfully.' });
      loadCourses();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Cannot delete course.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-indigo-600" size={26} />
            Course Curriculum
          </h1>
          <p className="text-slate-500 text-xs mt-1">Manage degree programs, credit durations, and semesters.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Course
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by code or title..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>
        <select
          value={selectedDept || ''}
          onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
          className="w-full sm:w-64 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code} - {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Semesters</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading courses...
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{course.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{course.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{course.departmentName || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{course.durationYears} Years</td>
                    <td className="py-3.5 px-4 text-slate-600">{course.totalSemesters} Semesters</td>
                    <td className="py-3.5 px-4">
                      {course.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle2 size={11} /> ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          <XCircle size={11} /> INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Course"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Code *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MCA, BTECH-CS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Course Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Master of Computer Applications"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={durationYears}
                    onChange={(e) => {
                      const yr = Number(e.target.value);
                      setDurationYears(yr);
                      setTotalSemesters(yr * 2);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Semesters</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={totalSemesters}
                    onChange={(e) => setTotalSemesters(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Degree objectives or program outline..."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
