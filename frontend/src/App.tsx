import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

import { LoginPage } from './pages/auth/LoginPage';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { TeacherDashboard } from './pages/dashboard/TeacherDashboard';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';

import { DepartmentListPage } from './pages/departments/DepartmentListPage';
import { CourseListPage } from './pages/courses/CourseListPage';
import { ClassListPage } from './pages/classes/ClassListPage';
import { SubjectListPage } from './pages/subjects/SubjectListPage';
import { TeacherListPage } from './pages/teachers/TeacherListPage';
import { StudentListPage } from './pages/students/StudentListPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { ExamListPage } from './pages/exams/ExamListPage';
import { FeeManagementPage } from './pages/fees/FeeManagementPage';
import { TimetablePage } from './pages/timetable/TimetablePage';
import { AssignmentListPage } from './pages/assignments/AssignmentListPage';
import { AnnouncementListPage } from './pages/announcements/AnnouncementListPage';
import { DocumentListPage } from './pages/documents/DocumentListPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';

import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentFeePage } from './pages/student/StudentFeePage';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm tracking-wide">Initializing session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === 'ROLE_TEACHER') {
    return <Navigate to="/teacher/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN', 'ROLE_ADMIN']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="teachers" element={<TeacherListPage />} />
            <Route path="departments" element={<DepartmentListPage />} />
            <Route path="courses" element={<CourseListPage />} />
            <Route path="classes" element={<ClassListPage />} />
            <Route path="subjects" element={<SubjectListPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="exams" element={<ExamListPage />} />
            <Route path="results" element={<ExamListPage />} />
            <Route path="fees" element={<FeeManagementPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="assignments" element={<AssignmentListPage />} />
            <Route path="announcements" element={<AnnouncementListPage />} />
            <Route path="documents" element={<DocumentListPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Faculty / Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['ROLE_TEACHER']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<ClassListPage />} />
            <Route path="subjects" element={<SubjectListPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="marks" element={<ExamListPage />} />
            <Route path="assignments" element={<AssignmentListPage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="announcements" element={<AnnouncementListPage />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="subjects" element={<SubjectListPage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="timetable" element={<TimetablePage />} />
            <Route path="exams" element={<ExamListPage />} />
            <Route path="results" element={<StudentResultsPage />} />
            <Route path="fees" element={<StudentFeePage />} />
            <Route path="assignments" element={<AssignmentListPage />} />
            <Route path="announcements" element={<AnnouncementListPage />} />
            <Route path="documents" element={<DocumentListPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
