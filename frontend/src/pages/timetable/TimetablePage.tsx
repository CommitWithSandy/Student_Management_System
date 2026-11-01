import React, { useState, useEffect } from 'react';
import { timetableService, classService, subjectService, teacherService } from '../../services/academicServices';
import { TimetableEntry, ClassBatch, Subject, Teacher } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Plus, Clock, MapPin, User, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';

const DAYS: Array<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'> = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export const TimetablePage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN';

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<ClassBatch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [formClassId, setFormClassId] = useState<number>(0);
  const [formSubjectId, setFormSubjectId] = useState<number>(0);
  const [formTeacherId, setFormTeacherId] = useState<number>(0);
  const [dayOfWeek, setDayOfWeek] = useState<'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'>('MONDAY');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('10:00:00');
  const [roomNumber, setRoomNumber] = useState('Room 101');
  const [academicYear, setAcademicYear] = useState('2026-2027');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadTimetable();
    }
  }, [selectedClassId, selectedTeacherId]);

  const loadPrerequisites = async () => {
    try {
      const [clsRes, subRes, tchRes] = await Promise.all([
        classService.getAll(0, 100),
        subjectService.getAll(0, 100),
        teacherService.getActive(),
      ]);

      if (clsRes.success && clsRes.data.length > 0) {
        setClasses(clsRes.data);
        setSelectedClassId(clsRes.data[0].id);
        setFormClassId(clsRes.data[0].id);
      }
      if (subRes.success && subRes.data.length > 0) {
        setSubjects(subRes.data);
        setFormSubjectId(subRes.data[0].id);
      }
      if (tchRes.success && tchRes.data && tchRes.data.length > 0) {
        setTeachers(tchRes.data);
        setFormTeacherId(tchRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const res = await timetableService.getTimetable(selectedClassId || undefined, selectedTeacherId);
      if (res.success && res.data) {
        setEntries(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormError(null);
    setModalOpen(true);
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClassId || !formSubjectId || !formTeacherId) {
      setFormError('Class, subject, and teacher are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await timetableService.createEntry({
        classId: formClassId,
        subjectId: formSubjectId,
        teacherId: formTeacherId,
        dayOfWeek,
        startTime,
        endTime,
        roomNumber: roomNumber.trim(),
        academicYear,
      });
      setFeedback({ type: 'success', message: 'Timetable lecture slot scheduled without conflicts.' });
      setModalOpen(false);
      loadTimetable();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Conflict detected in teacher, room, or class schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm('Delete this scheduled lecture slot?')) return;
    try {
      await timetableService.deleteEntry(id);
      setFeedback({ type: 'success', message: 'Lecture slot removed from timetable.' });
      loadTimetable();
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
            <CalendarDays className="text-indigo-600" size={28} />
            Academic Timetable
          </h1>
          <p className="text-slate-500 text-sm mt-1">Class schedule planner, lecture periods, and conflict-free room allocations.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Add Schedule Slot
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

      {/* Selectors Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-72">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Class / Division</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseName} - Sem {c.semester} (Div {c.division})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-72">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Filter by Faculty (Optional)</label>
          <select
            value={selectedTeacherId || ''}
            onChange={(e) => setSelectedTeacherId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All Faculty</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName || t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const dayEntries = entries
            .filter((e) => e.dayOfWeek === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-bold text-sm text-slate-900 tracking-wide">{day}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                  {dayEntries.length} {dayEntries.length === 1 ? 'Period' : 'Periods'}
                </span>
              </div>

              {dayEntries.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No lectures scheduled</div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {dayEntries.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50/70 border border-slate-200/90 hover:border-indigo-200 rounded-xl transition-all relative group hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{item.subjectName}</div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                            <Clock size={12} className="text-indigo-600" />
                            <span>
                              {item.startTime} - {item.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                            <User size={12} className="text-emerald-600" />
                            <span>{item.teacherName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                            <MapPin size={12} className="text-amber-600" />
                            <span>{item.roomNumber}</span>
                          </div>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteEntry(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 shadow-xs transition-all"
                            title="Delete slot"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Timetable Slot Modal */}
      {isAdmin && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Timetable Lecture Slot</h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Class Cohort *</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseName} - Div {c.division} (Sem {c.semester})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Subject *</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Faculty Member *</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName || t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()} ({t.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00:00"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="10:00:00"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Room / Lab Number</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Verifying Conflict...' : 'Schedule Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
