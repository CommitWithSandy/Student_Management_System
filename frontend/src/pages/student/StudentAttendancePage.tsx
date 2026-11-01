import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/academicServices';
import { AttendanceSummary } from '../../types/academic';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  BookOpen,
  Printer,
  ShieldAlert,
  Percent,
} from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyAttendance();
  }, []);

  const loadMyAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await attendanceService.getMyAttendance();
      if (res.success && res.data) {
        setSummary(res.data);
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Failed to load attendance:', err);
      setError(err.response?.data?.message || 'Could not fetch your attendance record.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (percentage: number, statusStr?: string) => {
    if (statusStr === 'SATISFACTORY' || percentage >= 75) {
      return {
        label: 'Satisfactory',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      };
    } else if (statusStr === 'WARNING' || percentage >= 65) {
      return {
        label: 'Warning (<75%)',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
      };
    } else {
      return {
        label: 'Critical Shortage (<65%)',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: XCircle,
      };
    }
  };

  const overallPercentage = summary?.percentage ?? (summary?.totalClasses && summary.totalClasses > 0
    ? Math.round((summary.attendedClasses / summary.totalClasses) * 100)
    : 0);

  const status = getStatusBadge(overallPercentage, summary?.warningStatus || summary?.status);
  const StatusIcon = status.icon;
  const missedClasses = (summary?.totalClasses ?? 0) - (summary?.attendedClasses ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarCheck className="text-indigo-600" size={28} />
            My Attendance Record
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time lecture attendance, subject breakdown, and examination eligibility tracking.
          </p>
        </div>
        {summary && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-slate-300 shadow-xs"
          >
            <Printer size={16} />
            Print Statement
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading your attendance data...</div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center gap-3">
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      ) : !summary || summary.totalClasses === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
          <CalendarCheck className="mx-auto text-slate-400 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-slate-800">No Attendance Records Yet</h3>
          <p className="text-slate-500 text-sm mt-1">
            Attendance sessions taken by your course instructors will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Overall Percentage</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Percent size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{overallPercentage}%</span>
              </div>
              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}
                >
                  <StatusIcon size={13} />
                  {status.label}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Lectures Attended</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600">{summary.attendedClasses}</div>
              <p className="text-slate-500 text-xs mt-1">Present in conducted sessions</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Total Classes</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{summary.totalClasses}</div>
              <p className="text-slate-500 text-xs mt-1">Total periods scheduled to date</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Absences</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <XCircle size={16} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-rose-600">{missedClasses}</div>
              <p className="text-slate-500 text-xs mt-1">Lectures missed or unexcused</p>
            </div>
          </div>

          {/* Academic Policy Banner */}
          {overallPercentage < 75 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-sm">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-amber-900">Attendance Shortage Notice</p>
                <p className="text-amber-800 text-xs mt-0.5">
                  University regulations require a minimum of 75% aggregate attendance to sit for final semester
                  examinations. Please consult your academic advisor or course instructors promptly.
                </p>
              </div>
            </div>
          )}

          {/* Subject-Wise Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Subject-Wise Attendance Breakdown</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Detailed distribution across individual enrolled theory and lab courses.
                </p>
              </div>
            </div>

            {summary.subjectBreakdown && summary.subjectBreakdown.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                      <th className="py-3.5 px-6">Subject Code & Name</th>
                      <th className="py-3.5 px-6">Attended / Total</th>
                      <th className="py-3.5 px-6">Percentage</th>
                      <th className="py-3.5 px-6">Progress Indicator</th>
                      <th className="py-3.5 px-6 text-right">Eligibility Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.subjectBreakdown.map((sb) => {
                      const subPct = sb.percentage ?? (sb.total > 0 ? Math.round((sb.attended / sb.total) * 100) : 0);
                      const subStatus = getStatusBadge(subPct);
                      return (
                        <tr key={sb.subjectId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-900">{sb.subjectName}</div>
                            <div className="text-xs text-indigo-600 font-mono font-medium">{sb.subjectCode}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-700">
                            <span className="font-semibold text-slate-900">{sb.attended}</span> / {sb.total}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900">{subPct}%</span>
                          </td>
                          <td className="py-4 px-6 w-48">
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  subPct >= 75
                                    ? 'bg-emerald-500'
                                    : subPct >= 65
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(subPct, 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${subStatus.color}`}
                            >
                              {subStatus.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                Aggregate attendance recorded: <span className="text-slate-900 font-semibold">{summary.attendedClasses} / {summary.totalClasses}</span> ({overallPercentage}%).
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
