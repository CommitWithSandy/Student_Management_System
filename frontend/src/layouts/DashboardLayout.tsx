import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  FileSpreadsheet,
  CalendarCheck,
  Award,
  CreditCard,
  CalendarDays,
  FileText,
  Megaphone,
  Bell,
  ShieldCheck,
  FileBox,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define navigation items based on role
  const getNavItems = () => {
    if (role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Students', path: '/admin/students', icon: GraduationCap },
        { label: 'Teachers', path: '/admin/teachers', icon: Users },
        { label: 'Departments', path: '/admin/departments', icon: Building2 },
        { label: 'Courses', path: '/admin/courses', icon: BookOpen },
        { label: 'Classes / Batches', path: '/admin/classes', icon: Layers },
        { label: 'Subjects', path: '/admin/subjects', icon: FileSpreadsheet },
        { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
        { label: 'Examinations', path: '/admin/exams', icon: Award },
        { label: 'Results', path: '/admin/results', icon: CheckCircle2 },
        { label: 'Fees & Billing', path: '/admin/fees', icon: CreditCard },
        { label: 'Timetable', path: '/admin/timetable', icon: CalendarDays },
        { label: 'Assignments', path: '/admin/assignments', icon: FileText },
        { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
        { label: 'Documents', path: '/admin/documents', icon: FileBox },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
      ];
    } else if (role === 'ROLE_TEACHER') {
      return [
        { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { label: 'My Classes', path: '/teacher/classes', icon: Layers },
        { label: 'My Subjects', path: '/teacher/subjects', icon: FileSpreadsheet },
        { label: 'Take Attendance', path: '/teacher/attendance', icon: CalendarCheck },
        { label: 'Exams & Marks', path: '/teacher/marks', icon: Award },
        { label: 'Assignments', path: '/teacher/assignments', icon: FileText },
        { label: 'Timetable', path: '/teacher/timetable', icon: CalendarDays },
        { label: 'Announcements', path: '/teacher/announcements', icon: Megaphone },
      ];
    } else {
      // Student
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/student/profile', icon: UserIcon },
        { label: 'Subjects', path: '/student/subjects', icon: FileSpreadsheet },
        { label: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
        { label: 'Timetable', path: '/student/timetable', icon: CalendarDays },
        { label: 'Exams', path: '/student/exams', icon: Award },
        { label: 'Results & Marks', path: '/student/results', icon: CheckCircle2 },
        { label: 'Fee Dues', path: '/student/fees', icon: CreditCard },
        { label: 'Assignments', path: '/student/assignments', icon: FileText },
        { label: 'Announcements', path: '/student/announcements', icon: Megaphone },
        { label: 'Documents', path: '/student/documents', icon: FileBox },
      ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = (r?: string) => {
    switch (r) {
      case 'ROLE_SUPER_ADMIN':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Super Admin</span>;
      case 'ROLE_ADMIN':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Administrator</span>;
      case 'ROLE_TEACHER':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Faculty / Teacher</span>;
      default:
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">Student</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                EduTrack <span className="text-indigo-600 font-semibold">Pro</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Institutional SMS</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="font-semibold text-sm text-slate-800">Recent Notifications</span>
                  <span className="text-xs text-indigo-600 hover:underline cursor-pointer font-medium">Mark all read</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors">
                    <p className="font-semibold text-slate-800">Semester 1 Exam Schedule Published</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Examinations commence next Monday.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-colors">
                    <p className="font-semibold text-slate-800">Assignment: Cloud Architecture</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Due date: Friday 11:59 PM.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 transition-all text-left"
            >
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName || user?.username}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {user?.firstName?.[0] || 'U'}
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900">{user?.fullName}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col shadow-xs transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 flex-1 overflow-y-auto space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                  }`}
                >
                  <Icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Status Footer in Sidebar */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-xs text-slate-500">
                Connected to <span className="text-emerald-600 font-semibold">Live System API</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
