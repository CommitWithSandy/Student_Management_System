import React, { useState, useEffect } from 'react';
import { examService, courseService, classService, subjectService, studentService } from '../../services/academicServices';
import { Exam, Course, ClassBatch, Subject, ExamSubject, StudentMarkEntry } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { Award, Plus, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Edit2, FileText, Send, Users } from 'lucide-react';

export const ExamListPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN';
  const isTeacher = role === 'ROLE_TEACHER';
  const isStudent = role === 'ROLE_STUDENT';

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassBatch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [marksModalOpen, setMarksModalOpen] = useState(false);

  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examSubjects, setExamSubjects] = useState<ExamSubject[]>([]);
  const [selectedExamSubject, setSelectedExamSubject] = useState<ExamSubject | null>(null);

  // Form states for creating Exam
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<'INTERNAL' | 'MIDTERM' | 'PRACTICAL' | 'SEMESTER' | 'FINAL'>('MIDTERM');
  const [courseId, setCourseId] = useState<number>(0);
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [semester, setSemester] = useState<number>(1);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [startDate, setStartDate] = useState('2026-11-10');
  const [endDate, setEndDate] = useState('2026-11-20');

  // Form states for scheduling subject to exam
  const [schedSubjectId, setSchedSubjectId] = useState<number>(0);
  const [schedExamDate, setSchedExamDate] = useState('2026-11-12');
  const [schedStartTime, setSchedStartTime] = useState('10:00:00');
  const [schedEndTime, setSchedEndTime] = useState('13:00:00');
  const [schedRoom, setSchedRoom] = useState('Hall A');
  const [schedMaxMarks, setSchedMaxMarks] = useState<number>(100);
  const [schedPassMarks, setSchedPassMarks] = useState<number>(40);

  // Marks entry state
  const [markEntries, setMarkEntries] = useState<StudentMarkEntry[]>([]);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadPrerequisites();
    loadExams();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [crsRes, clsRes, subRes] = await Promise.all([
        courseService.getActive(),
        classService.getAll(0, 100),
        subjectService.getAll(0, 100),
      ]);
      if (crsRes.success && crsRes.data) {
        setCourses(crsRes.data);
        if (crsRes.data.length > 0) setCourseId(crsRes.data[0].id);
      }
      if (clsRes.success && clsRes.data) {
        setClasses(clsRes.data);
      }
      if (subRes.success && subRes.data) {
        setSubjects(subRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await examService.getAll(0, 50);
      if (res.success) {
        setExams(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setExamType('MIDTERM');
    setSemester(1);
    setAcademicYear('2026-2027');
    setStartDate('2026-11-10');
    setEndDate('2026-11-20');
    setFormError(null);
    setModalOpen(true);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !courseId) {
      setFormError('Title and course are required.');
      return;
    }

    setSubmitting(true);
    try {
      await examService.create({
        title: title.trim(),
        examType,
        courseId,
        classId: classId || undefined,
        semester: Number(semester),
        academicYear,
        startDate,
        endDate,
      });
      setFeedback({ type: 'success', message: 'Exam timetable period created successfully.' });
      setModalOpen(false);
      loadExams();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create exam.');
    } finally {
      setSubmitting(false);
    }
  };

  const openScheduleModal = async (exam: Exam) => {
    setSelectedExam(exam);
    setFormError(null);
    try {
      const res = await examService.getExamSubjects(exam.id);
      if (res.success && res.data) {
        setExamSubjects(res.data);
      }
      if (subjects.length > 0) {
        setSchedSubjectId(subjects[0].id);
      }
      setScheduleModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExamSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !schedSubjectId) return;

    setSubmitting(true);
    try {
      await examService.addExamSubject(selectedExam.id, {
        subjectId: schedSubjectId,
        examDate: schedExamDate,
        startTime: schedStartTime,
        endTime: schedEndTime,
        roomNumber: schedRoom,
        maxMarks: Number(schedMaxMarks),
        passingMarks: Number(schedPassMarks),
      });
      setFeedback({ type: 'success', message: 'Subject paper added to exam schedule.' });
      // reload subjects for this exam
      const res = await examService.getExamSubjects(selectedExam.id);
      if (res.success && res.data) setExamSubjects(res.data);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to schedule subject paper.');
    } finally {
      setSubmitting(false);
    }
  };

  const openMarksEntryModal = async (exam: Exam, es: ExamSubject) => {
    setSelectedExam(exam);
    setSelectedExamSubject(es);
    setFormError(null);
    try {
      // Load class students
      const studRes = await studentService.getAll(0, 100, '', undefined, exam.courseId, exam.classId);
      if (studRes.success) {
        const entries: StudentMarkEntry[] = studRes.data.map((s) => ({
          studentId: s.id,
          studentName: s.fullName,
          studentIdNumber: s.studentIdNumber,
          marksObtained: 0,
          isAbsent: false,
          remarks: '',
        }));
        setMarkEntries(entries);
        setMarksModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarksSubmit = async () => {
    if (!selectedExam || !selectedExamSubject) return;

    // Validate marks limits
    for (const entry of markEntries) {
      if (entry.marksObtained < 0 || entry.marksObtained > selectedExamSubject.maxMarks) {
        setFormError(`Marks for ${entry.studentName} must be between 0 and ${selectedExamSubject.maxMarks}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await examService.submitMarks(selectedExam.id, selectedExamSubject.id, markEntries);
      setFeedback({ type: 'success', message: 'Examination marks saved successfully.' });
      setMarksModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record marks.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishResults = async (examId: number) => {
    if (!window.confirm('Are you sure you want to finalize and publish academic results for this exam?')) return;
    try {
      await examService.publishResults(examId);
      setFeedback({ type: 'success', message: 'Academic results published. Students can now view their report cards.' });
      loadExams();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to publish results.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Award className="text-indigo-600" size={28} />
            {isStudent ? 'Examination Schedule' : 'Examinations & Results'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isStudent
              ? 'View upcoming examination sessions, scheduled subject papers, exam timings, and examination halls.'
              : 'Schedule examination terms, configure subject papers, record marks, and publish report cards.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Create Examination
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

      {/* Examinations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading examinations...</div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-700">No Examinations Scheduled</h3>
            <p className="text-slate-500 text-sm mt-1">Create an examination term to begin subject paper scheduling and grading.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Exam Title & Type</th>
                  <th className="py-4 px-6">Course & Sem</th>
                  <th className="py-4 px-6">Academic Year</th>
                  <th className="py-4 px-6">Exam Dates</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div>{ex.title}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {ex.examType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>{ex.courseName || 'N/A'}</div>
                      <div className="text-xs text-slate-500">Semester {ex.semester}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono text-xs">{ex.academicYear}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      <div>From: {ex.startDate}</div>
                      <div>To: {ex.endDate}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          ex.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {ex.isPublished ? 'PUBLISHED' : 'IN DRAFT'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openScheduleModal(ex)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition-colors"
                        title={isStudent ? "View Examination Papers" : "Manage Papers & Marks"}
                      >
                        <Calendar size={14} />
                        {isStudent ? 'View Papers' : 'Papers & Marks'}
                      </button>
                      {isAdmin && !ex.isPublished && (
                        <button
                          onClick={() => handlePublishResults(ex.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-medium transition-colors"
                          title="Publish Results"
                        >
                          <Send size={14} />
                          Publish
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      {isAdmin && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create Examination Term</h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Exam Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. End Semester Examinations - Autumn 2026"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Exam Type</label>
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="INTERNAL">Internal Assessment</option>
                    <option value="MIDTERM">Midterm Exam</option>
                    <option value="PRACTICAL">Practical / Lab Exam</option>
                    <option value="SEMESTER">Semester Exam</option>
                    <option value="FINAL">Final Exam</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Course *</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Papers & View Subjects Modal */}
      {scheduleModalOpen && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedExam.title}</h2>
                <div className="text-xs text-indigo-600 font-semibold">Scheduled Papers & Marks Entry</div>
              </div>
              <button onClick={() => setScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            {/* Existing Scheduled Papers */}
            <div className="my-4">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Subject Papers in this Exam</h3>
              {examSubjects.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                  No subjects scheduled yet. Add one below.
                </div>
              ) : (
                <div className="space-y-2">
                  {examSubjects.map((es) => (
                    <div
                      key={es.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{es.subjectName} ({es.subjectCode})</div>
                        <div className="text-slate-500">Date: {es.examDate} | {es.startTime} - {es.endTime} | Room: {es.roomNumber || 'TBD'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-slate-500 block text-[10px]">Max Marks</span>
                          <span className="font-bold text-slate-900">{es.maxMarks}</span>
                        </div>
                        {!isStudent && (
                          <button
                            onClick={() => openMarksEntryModal(selectedExam, es)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors shadow-xs"
                          >
                            Enter Marks
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Subject Paper Form */}
            {isAdmin && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Add Paper to Timetable</h3>
              <form onSubmit={handleAddExamSubject} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Subject</label>
                    <select
                      value={schedSubjectId}
                      onChange={(e) => setSchedSubjectId(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Exam Date</label>
                    <input
                      type="date"
                      value={schedExamDate}
                      onChange={(e) => setSchedExamDate(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Start Time</label>
                    <input
                      type="text"
                      value={schedStartTime}
                      onChange={(e) => setSchedStartTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">End Time</label>
                    <input
                      type="text"
                      value={schedEndTime}
                      onChange={(e) => setSchedEndTime(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Hall / Room</label>
                    <input
                      type="text"
                      value={schedRoom}
                      onChange={(e) => setSchedRoom(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Max Marks</label>
                    <input
                      type="number"
                      value={schedMaxMarks}
                      onChange={(e) => setSchedMaxMarks(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Passing Marks</label>
                    <input
                      type="number"
                      value={schedPassMarks}
                      onChange={(e) => setSchedPassMarks(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-xs"
                  >
                    Add Paper
                  </button>
                </div>
              </form>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Marks Entry Sheet Modal */}
      {!isStudent && marksModalOpen && selectedExam && selectedExamSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Marks Entry Sheet</h2>
                <div className="text-xs text-indigo-600 font-semibold">
                  {selectedExamSubject.subjectName} ({selectedExamSubject.subjectCode}) - Max Marks: {selectedExamSubject.maxMarks}
                </div>
              </div>
              <button onClick={() => setMarksModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase">
                    <th className="py-2.5 px-3">Student Name & Roll</th>
                    <th className="py-2.5 px-3">Marks Obtained (/{selectedExamSubject.maxMarks})</th>
                    <th className="py-2.5 px-3 text-center">Absent?</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {markEntries.map((m) => (
                    <tr key={m.studentId} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{m.studentName}</div>
                        <div className="text-slate-500 font-mono">{m.studentIdNumber}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max={selectedExamSubject.maxMarks}
                          disabled={m.isAbsent}
                          value={m.marksObtained}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMarkEntries((prev) =>
                              prev.map((item) =>
                                item.studentId === m.studentId ? { ...item, marksObtained: val } : item
                              )
                            );
                          }}
                          className="w-24 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-indigo-600 disabled:opacity-40"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={m.isAbsent}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setMarkEntries((prev) =>
                              prev.map((item) =>
                                item.studentId === m.studentId
                                  ? { ...item, isAbsent: checked, marksObtained: checked ? 0 : item.marksObtained }
                                  : item
                              )
                            );
                          }}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0 border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder="Optional notes"
                          value={m.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMarkEntries((prev) =>
                              prev.map((item) =>
                                item.studentId === m.studentId ? { ...item, remarks: val } : item
                              )
                            );
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-indigo-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMarksModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarksSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Saving Marks...' : 'Submit & Save Marks'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
