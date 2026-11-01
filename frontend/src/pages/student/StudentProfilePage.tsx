import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/academicServices';
import { Student } from '../../types/academic';
import { GraduationCap, Mail, Phone, MapPin, Calendar, BookOpen, Layers, ShieldCheck, User } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    try {
      setLoading(true);
      const res = await studentService.getMyProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading student dossier...</div>;
  }

  if (!profile) {
    return (
      <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
        <User className="mx-auto text-slate-400 mb-3" size={40} />
        <h3 className="text-lg font-semibold text-slate-700">Profile Not Linked</h3>
        <p className="text-slate-500 text-sm mt-1">Your user account has not yet been linked to a student record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-white border border-indigo-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/20 border-2 border-white">
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h1 className="text-2xl font-extrabold text-slate-900">{profile.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {profile.status}
              </span>
            </div>
            <div className="text-sm font-mono text-indigo-600 font-semibold mb-3">
              Roll ID: {profile.studentIdNumber}
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Placement Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            Academic Enrollment
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-900">{profile.departmentName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Enrolled Degree / Course</span>
              <span className="font-semibold text-slate-900">{profile.courseName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Current Semester</span>
              <span className="font-semibold text-slate-900">Semester {profile.currentSemester}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Class Batch / Division</span>
              <span className="font-semibold text-slate-900">{profile.className || 'Unassigned'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Admission Date</span>
              <span className="font-semibold text-slate-900">{profile.admissionDate}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Demographics & Guardian
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Date of Birth</span>
              <span className="font-semibold text-slate-900">{profile.dateOfBirth}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Gender</span>
              <span className="font-semibold text-slate-900">{profile.gender}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Blood Group</span>
              <span className="font-semibold text-slate-900">{profile.bloodGroup || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Emergency Contact Person</span>
              <span className="font-semibold text-slate-900">{profile.emergencyContactName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Emergency Phone</span>
              <span className="font-semibold text-slate-900">{profile.emergencyContactPhone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {profile.address && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-amber-500" />
            Permanent Residential Address
          </h2>
          <p className="text-slate-600 text-xs">
            {profile.address}, {profile.city}, {profile.state}
          </p>
        </div>
      )}
    </div>
  );
};
