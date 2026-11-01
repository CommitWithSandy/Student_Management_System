import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/academicServices';
import {
  CalendarCheck,
  Award,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Megaphone,
  ArrowRight,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStudentDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const getAttendanceBadge = (pct: number) => {
    if (pct >= 75) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle size={12} /> Eligible for Exams (Good)
        </span>
      );
    } else if (pct >= 65) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <AlertTriangle size={12} /> Attendance Warning (&lt; 75%)
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
          <AlertTriangle size={12} /> Critical Shortage (&lt; 65%)
        </span>
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Student Banner */}
      <div className="rounded-3xl p-6 sm:p-8 border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
              Student Portal • {data?.studentIdNumber}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Hello, {data?.studentName || 'Student'}
            </h1>
            <p className="text-slate-600 text-xs mt-1">
              Program: {data?.courseName} • Semester {data?.currentSemester} • Class: {data?.className}
            </p>
          </div>

          <Link
            to="/student/attendance"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-xs flex items-center gap-2 transition-all"
          >
            Detailed Attendance History
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{data?.overallAttendancePercentage || 100}%</div>
          <div className="mt-2">{getAttendanceBadge(data?.overallAttendancePercentage || 100)}</div>
        </div>

        {/* GPA */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative GPA</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{data?.currentGpa || '0.00'} / 10.0</div>
          <div className="text-[11px] text-slate-500 mt-2">Overall academic standing</div>
        </div>

        {/* Pending Fees */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Fee Dues</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{Number(data?.pendingFeeAmount || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            {Number(data?.pendingFeeAmount || 0) === 0 ? 'All fees settled' : 'Payment due'}
          </div>
        </div>

        {/* Current Semester */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academic Term</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">Semester {data?.currentSemester}</div>
          <div className="text-[11px] text-slate-500 mt-2">Class Batch: {data?.className}</div>
        </div>
      </div>

      {/* Main Grid: Today's Timetable & Recent Scorecards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              Today's Lectures &amp; Labs
            </h2>
            <Link to="/student/timetable" className="text-xs text-indigo-600 font-semibold hover:underline">
              Full Week
            </Link>
          </div>

          {data?.todayTimetable?.length > 0 ? (
            <div className="space-y-3">
              {data.todayTimetable.map((slot: any) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center font-mono py-1 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                      <div className="text-xs font-bold">{slot.startTime}</div>
                      <div className="text-[10px] text-slate-500">{slot.endTime}</div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{slot.subjectName} ({slot.subjectCode})</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Faculty: {slot.teacherName} • Room: {slot.roomNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200">
              <CalendarCheck size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-600 font-medium">No lectures scheduled for today.</p>
              <p className="text-[11px] text-slate-500 mt-1">Check assignments or study materials.</p>
            </div>
          )}
        </div>

        {/* Results & Bulletins Sidebar */}
        <div className="space-y-6">
          {/* Recent Exam Results */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              Published Results
            </h2>
            {data?.recentResults?.length > 0 ? (
              <div className="space-y-2.5">
                {data.recentResults.map((r: any) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between items-center font-semibold text-slate-800">
                      <span>{r.examTitle}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        {r.grade} ({r.percentage}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>GPA: {r.gpa}</span>
                      <span className="text-indigo-600 uppercase font-semibold text-[10px]">{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No published exam results available yet.</p>
            )}
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Megaphone size={16} className="text-indigo-600" />
              Campus Announcements
            </h2>
            <div className="space-y-2">
              {data?.announcements?.slice(0, 3).map((a: any) => (
                <div key={a.id} className="text-xs text-slate-700 py-1.5 border-b border-slate-100 last:border-0">
                  <p className="font-medium text-slate-800">{a.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{a.publishDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
