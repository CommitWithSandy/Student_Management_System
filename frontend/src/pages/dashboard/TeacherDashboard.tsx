import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/academicServices';
import {
  Layers,
  FileSpreadsheet,
  CalendarCheck,
  FileText,
  Clock,
  ArrowRight,
  Megaphone,
  UserCheck,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getTeacherDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load teacher stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl p-6 sm:p-8 border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-slate-50 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
              Faculty Portal • {data?.employeeId}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome back, {data?.teacherName || 'Professor'}
            </h1>
            <p className="text-slate-600 text-xs mt-1">
              Department of {data?.departmentName} • Academic Session 2026–2027
            </p>
          </div>
          <Link
            to="/teacher/attendance"
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
          >
            <CalendarCheck size={16} />
            Take Roll Call
          </Link>
        </div>
      </div>

      {/* Quick KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Classes</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{data?.assignedClassesCount || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active class batches</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject Allocations</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{data?.assignedSubjectsCount || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Theory &amp; Practical subjects</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Assignments</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText size={20} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{data?.activeAssignmentsCount || 0}</div>
          <div className="text-[11px] text-slate-500 mt-1">Currently open for submissions</div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & My Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Today's Class Schedule</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>

          {data?.todaySchedule?.length > 0 ? (
            <div className="space-y-3">
              {data.todaySchedule.map((slot: any) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center font-mono py-1 px-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                      <div className="text-xs font-bold">{slot.startTime}</div>
                      <div className="text-[10px] text-slate-500">{slot.endTime}</div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{slot.subjectName} ({slot.subjectCode})</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Class: {slot.className} • Room: {slot.roomNumber}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/teacher/attendance?classId=${slot.classId}&subjectId=${slot.subjectId}`}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <UserCheck size={14} className="text-emerald-600" />
                    Mark Roll Call
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-200">
              <CalendarCheck size={28} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-600 font-medium">No teaching periods scheduled for today.</p>
              <p className="text-[11px] text-slate-500 mt-1">Enjoy your lesson preparation or research hours.</p>
            </div>
          )}
        </div>

        {/* My Classes & Subjects Sidebar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">My Teaching Roster</h2>
          <div className="space-y-2.5">
            {data?.myClassesAndSubjects?.map((item: any) => (
              <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-semibold text-slate-800">{item.subjectName}</div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>{item.subjectCode}</span>
                  <span className="text-indigo-600 font-semibold">{item.className}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <Megaphone size={14} /> Bulletins
            </h3>
            {data?.recentAnnouncements?.slice(0, 2).map((a: any) => (
              <div key={a.id} className="text-xs text-slate-700 py-1.5">
                <p className="font-medium text-slate-800">{a.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{a.publishDate}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
