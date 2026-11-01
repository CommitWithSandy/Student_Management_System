import React, { useState, useEffect } from 'react';
import { classService, subjectService, attendanceService, studentService } from '../../services/academicServices';
import { ClassBatch, Subject, AttendanceRecord, AttendanceSummary } from '../../types/academic';
import { CalendarCheck, Users, CheckCircle2, XCircle, AlertCircle, Clock, ShieldAlert, Save } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<ClassBatch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [attendanceDate, setAttendanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [notes, setNotes] = useState('');

  const [activeTab, setActiveTab] = useState<'ROLL_CALL' | 'SUMMARY'>('ROLL_CALL');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadClassAndSubjects();
  }, []);

  const loadClassAndSubjects = async () => {
    try {
      const [clsRes, subRes] = await Promise.all([
        classService.getAll(0, 100),
        subjectService.getAll(0, 100),
      ]);
      if (clsRes.success && clsRes.data.length > 0) {
        setClasses(clsRes.data);
        setSelectedClassId(clsRes.data[0].id);
      }
      if (subRes.success && subRes.data.length > 0) {
        setSubjects(subRes.data);
        setSelectedSubjectId(subRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadStudentsForAttendance();
      loadAttendanceSummaries();
    }
  }, [selectedClassId, selectedSubjectId]);

  const loadStudentsForAttendance = async () => {
    if (!selectedClassId) return;
    try {
      setLoading(true);
      const res = await studentService.getAll(0, 100, '', undefined, undefined, selectedClassId);
      if (res.success) {
        const studentList = res.data;
        const initialRecords: AttendanceRecord[] = studentList.map((s) => ({
          id: s.id,
          studentId: s.id,
          studentName: s.fullName,
          studentIdNumber: s.studentIdNumber,
          status: 'PRESENT',
        }));
        setRecords(initialRecords);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceSummaries = async () => {
    if (!selectedClassId) return;
    try {
      const res = await attendanceService.getStudentSummary(selectedClassId, selectedSubjectId || undefined);
      if (res.success && res.data) {
        setSummaries(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedSubjectId || !attendanceDate) {
      setFeedback({ type: 'error', message: 'Class, Subject, and Date are required.' });
      return;
    }

    if (records.length === 0) {
      setFeedback({ type: 'error', message: 'No students enrolled in this class to record attendance.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        attendanceDate,
        notes: notes.trim() || undefined,
        records: records.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        })),
      };

      const res = await attendanceService.recordAttendance(payload);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Attendance submitted successfully for ${records.length} students.`,
        });
        loadAttendanceSummaries();
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit attendance session.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;
  const total = records.length;
  const presentPercent = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarCheck className="text-indigo-600" size={28} />
            Institutional Attendance
          </h1>
          <p className="text-slate-500 text-sm mt-1">Roll call registration, attendance tracking, and threshold compliance monitor.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ROLL_CALL')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'ROLL_CALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Roll Call Session
          </button>
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'SUMMARY'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Cumulative Summaries
          </button>
        </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Class / Division</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.courseName} - Sem {c.semester} (Div {c.division})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>

      {activeTab === 'ROLL_CALL' ? (
        <>
          {/* Quick Metrics & Batch Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500 text-xs block">Present Rate</span>
                <span className="font-extrabold text-lg text-emerald-600">{presentPercent}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Present</span>
                <span className="font-bold text-slate-800">{presentCount}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Absent</span>
                <span className="font-bold text-rose-600">{absentCount}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Late</span>
                <span className="font-bold text-amber-600">{lateCount}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Excused</span>
                <span className="font-bold text-sky-600">{excusedCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll('PRESENT')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => markAll('ABSENT')}
                className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading student roster...</div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto text-slate-400 mb-3" size={40} />
                <h3 className="text-lg font-semibold text-slate-700">No Enrolled Students</h3>
                <p className="text-slate-500 text-sm mt-1">There are no students enrolled in the selected class cohort.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                      <th className="py-4 px-6">Roll # / Student</th>
                      <th className="py-4 px-6 text-center">Attendance Status</th>
                      <th className="py-4 px-6">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r) => (
                      <tr key={r.studentId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6 font-medium text-slate-900">
                          <div>{r.studentName}</div>
                          <div className="text-xs font-mono text-indigo-600 font-semibold">{r.studentIdNumber}</div>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateStatus(r.studentId, 'PRESENT')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                r.status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(r.studentId, 'ABSENT')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                r.status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(r.studentId, 'LATE')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                r.status === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(r.studentId, 'EXCUSED')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                r.status === 'EXCUSED'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={r.remarks || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRecords((prev) =>
                                prev.map((item) =>
                                  item.studentId === r.studentId ? { ...item, remarks: val } : item
                                )
                              );
                            }}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Session Footer Notes & Submit */}
          {records.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <input
                type="text"
                placeholder="Session notes (e.g. Covered Chapter 3 - Normalization)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full sm:w-2/3 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all text-sm disabled:opacity-50"
              >
                <Save size={18} />
                {submitting ? 'Submitting...' : 'Save & Submit Attendance'}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Cumulative Summaries Tab */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {summaries.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarCheck className="mx-auto text-slate-400 mb-3" size={40} />
              <h3 className="text-lg font-semibold text-slate-700">No Attendance Records Yet</h3>
              <p className="text-slate-500 text-sm mt-1">Submit roll call sessions to compute student attendance averages.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Total Sessions</th>
                    <th className="py-4 px-6">Attended</th>
                    <th className="py-4 px-6">Percentage</th>
                    <th className="py-4 px-6">Status Warning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaries.map((s) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-900">{s.studentName}</td>
                      <td className="py-4 px-6 text-slate-600">{s.totalClasses}</td>
                      <td className="py-4 px-6 text-slate-600">{s.attendedClasses}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                s.percentage >= 75
                                  ? 'bg-emerald-500'
                                  : s.percentage >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${s.percentage}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-slate-900 text-xs">{s.percentage}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            s.status === 'SATISFACTORY'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : s.status === 'WARNING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {s.status === 'CRITICAL' && <ShieldAlert size={12} />}
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
