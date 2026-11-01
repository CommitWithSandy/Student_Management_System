import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/academicServices';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  CreditCard,
  Megaphone,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAdminStats();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-64"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Students',
      value: data?.totalStudents || 0,
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-600',
      tag: 'Active enrolled',
    },
    {
      title: 'Teaching Faculty',
      value: data?.totalTeachers || 0,
      icon: Users,
      color: 'from-emerald-600 to-teal-600',
      tag: 'Verified staff',
    },
    {
      title: 'Active Courses',
      value: data?.totalCourses || 0,
      icon: BookOpen,
      color: 'from-purple-600 to-pink-600',
      tag: 'Accredited',
    },
    {
      title: "Today's Attendance",
      value: `${data?.todayAttendanceRate || 0}%`,
      icon: CalendarCheck,
      color: 'from-amber-600 to-orange-600',
      tag: 'Campus average',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Institutional Overview</h1>
          <p className="text-slate-500 text-xs mt-1">Real-time academic performance, attendance metrics, and audit monitoring.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            System Live
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-3 tracking-tight">{kpi.value}</div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                <span>{kpi.tag}</span>
                <ArrowUpRight size={14} className="text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" />
                Monthly Attendance Average
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">Rolling academic year attendance velocity</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyAttendanceTrend || []}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#attendanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Department Enrollment</h2>
            <p className="text-slate-500 text-xs mb-4">Student headcounts across departments</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.departmentEnrollment || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Total Departments: <strong className="text-slate-900">{data?.totalDepartments || 0}</strong></span>
            <span>Total Courses: <strong className="text-slate-900">{data?.totalCourses || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Audit Log & Financial Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Audit Trail */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" />
              Institutional Security &amp; Audit Trail
            </h2>
            <span className="text-[11px] text-slate-500">Append-Only Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {data?.recentActivities?.slice(0, 5).map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.createdAt}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.username || 'system'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">Fee Collections</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-xs">Total Fee Revenue Invoiced</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  ₹{Number((data?.collectedFeesTotal || 0) + (data?.pendingFeesTotal || 0)).toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-emerald-700 block text-[11px] font-medium">Collected</span>
                  <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                    ₹{Number(data?.collectedFeesTotal || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-rose-700 block text-[11px] font-medium">Pending Dues</span>
                  <span className="font-bold text-rose-800 text-sm mt-0.5 block">
                    ₹{Number(data?.pendingFeesTotal || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Upcoming Exam Cycles:</span>
            <span className="text-indigo-600 font-bold">{data?.upcomingExamsCount || 0} Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
