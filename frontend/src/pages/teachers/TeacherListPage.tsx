import React, { useState, useEffect, useMemo } from 'react';
import { teacherService, departmentService, subjectService, classService } from '../../services/academicServices';
import { Teacher, Department, Subject, ClassBatch } from '../../types/academic';
import {
  Users,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Filter,
  Sparkles,
} from 'lucide-react';

export interface SpecializationOption {
  category: string;
  name: string;
}

export const WORLD_SPECIALIZATIONS: SpecializationOption[] = [
  // 💻 Computer Science & Artificial Intelligence
  { category: 'Computer Science & AI', name: 'Artificial Intelligence & Intelligent Systems' },
  { category: 'Computer Science & AI', name: 'Machine Learning & Deep Learning' },
  { category: 'Computer Science & AI', name: 'Data Science & Big Data Engineering' },
  { category: 'Computer Science & AI', name: 'Cyber Security, Ethical Hacking & Cryptography' },
  { category: 'Computer Science & AI', name: 'Cloud Computing, DevOps & Virtualization' },
  { category: 'Computer Science & AI', name: 'Distributed Systems & Parallel Computing' },
  { category: 'Computer Science & AI', name: 'Software Architecture & Systems Design' },
  { category: 'Computer Science & AI', name: 'Computer Networks, 5G/6G & IoT' },
  { category: 'Computer Science & AI', name: 'Computer Vision & Digital Image Processing' },
  { category: 'Computer Science & AI', name: 'Natural Language Processing & Generative AI' },
  { category: 'Computer Science & AI', name: 'Blockchain, Web3 & Smart Contracts' },
  { category: 'Computer Science & AI', name: 'Robotics, Autonomous Navigation & ROS' },
  { category: 'Computer Science & AI', name: 'Human-Computer Interaction (HCI)' },
  { category: 'Computer Science & AI', name: 'Quantum Computing & Algorithms' },
  { category: 'Computer Science & AI', name: 'High-Performance Computing (HPC)' },
  { category: 'Computer Science & AI', name: 'Full-Stack Modern Web Engineering' },
  { category: 'Computer Science & AI', name: 'Mobile Computing & Android/iOS Systems' },
  { category: 'Computer Science & AI', name: 'Relational & Distributed Database Systems' },

  // 🌐 Information Technology
  { category: 'Information Technology', name: 'Enterprise IT Architecture & Strategy' },
  { category: 'Information Technology', name: 'Database Administration & Data Warehousing' },
  { category: 'Information Technology', name: 'Network Infrastructure & Cyber Defense' },
  { category: 'Information Technology', name: 'Business Intelligence & Predictive Analytics' },
  { category: 'Information Technology', name: 'IT Service & Infrastructure Management' },

  // ⚡ Electrical & Electronics Engineering
  { category: 'Electrical & Electronics', name: 'VLSI Design & Embedded Systems' },
  { category: 'Electrical & Electronics', name: 'Digital Signal Processing (DSP)' },
  { category: 'Electrical & Electronics', name: 'Power Systems, Smart Grids & High Voltage' },
  { category: 'Electrical & Electronics', name: 'Renewable, Solar & Clean Energy Systems' },
  { category: 'Electrical & Electronics', name: 'Telecommunications & RF Engineering' },
  { category: 'Electrical & Electronics', name: 'Control Systems & Industrial Robotics' },
  { category: 'Electrical & Electronics', name: 'Microelectronics, MEMS & Nanotechnology' },
  { category: 'Electrical & Electronics', name: 'Power Electronics & Electric Vehicle Drives' },
  { category: 'Electrical & Electronics', name: 'Sensors, Actuators & Instrumentation' },

  // ⚙️ Mechanical & Aerospace
  { category: 'Mechanical & Aerospace', name: 'Thermal Engineering & Thermodynamics' },
  { category: 'Mechanical & Aerospace', name: 'Fluid Mechanics & Computational Fluid Dynamics' },
  { category: 'Mechanical & Aerospace', name: 'CAD/CAM & Digital Advanced Manufacturing' },
  { category: 'Mechanical & Aerospace', name: 'Mechatronics & Electro-Mechanical Systems' },
  { category: 'Mechanical & Aerospace', name: 'Automotive Engineering & Powertrain Systems' },
  { category: 'Mechanical & Aerospace', name: 'Materials Science, Composites & Metallurgy' },
  { category: 'Mechanical & Aerospace', name: 'Aerospace Engineering, Avionics & Propulsion' },
  { category: 'Mechanical & Aerospace', name: 'Finite Element Analysis (FEA) & Solid Mechanics' },
  { category: 'Mechanical & Aerospace', name: 'HVAC & Cryogenic Engineering' },

  // 🏗️ Civil & Environmental Engineering
  { category: 'Civil & Environment', name: 'Structural Engineering & Earthquake Resilient Design' },
  { category: 'Civil & Environment', name: 'Geotechnical & Soil Foundation Engineering' },
  { category: 'Civil & Environment', name: 'Transportation, Highway & Traffic Systems' },
  { category: 'Civil & Environment', name: 'Environmental Engineering & Sustainable Systems' },
  { category: 'Civil & Environment', name: 'Water Resources & Hydrological Engineering' },
  { category: 'Civil & Environment', name: 'Construction Technology & Infrastructure Management' },
  { category: 'Civil & Environment', name: 'Urban, Town & Regional Planning' },
  { category: 'Civil & Environment', name: 'Geoinformatics, Remote Sensing & GIS' },

  // 🧬 Chemical, Bio & Medical Sciences
  { category: 'Bio & Chemical Sciences', name: 'Biochemical & Bioprocess Engineering' },
  { category: 'Bio & Chemical Sciences', name: 'Bioinformatics & Computational Genomics' },
  { category: 'Bio & Chemical Sciences', name: 'Genetic Engineering & Recombinant DNA' },
  { category: 'Bio & Chemical Sciences', name: 'Pharmaceutical Sciences & Molecular Pharmacology' },
  { category: 'Bio & Chemical Sciences', name: 'Chemical Process Modeling & Reaction Kinetics' },
  { category: 'Bio & Chemical Sciences', name: 'Polymer Technology & Nano-Biomaterials' },
  { category: 'Bio & Chemical Sciences', name: 'Microbiology & Industrial Fermentation' },
  { category: 'Bio & Chemical Sciences', name: 'Immunology & Clinical Pathology' },
  { category: 'Bio & Chemical Sciences', name: 'Biomedical Instrumentation & Neural Engineering' },
  { category: 'Bio & Chemical Sciences', name: 'Public Health, Epidemiology & Healthcare Policy' },

  // 📊 Business, Management & Finance
  { category: 'Business & Management', name: 'Strategic Management & Global Business Policy' },
  { category: 'Business & Management', name: 'Corporate Finance, Banking & Wealth Management' },
  { category: 'Business & Management', name: 'FinTech, Algorithmic Trading & Quantitative Finance' },
  { category: 'Business & Management', name: 'Marketing Strategy & Digital Brand Management' },
  { category: 'Business & Management', name: 'Supply Chain, Logistics & Operations Research' },
  { category: 'Business & Management', name: 'Human Resource Management & Talent Strategy' },
  { category: 'Business & Management', name: 'Business Analytics & Decision Sciences' },
  { category: 'Business & Management', name: 'Innovation, Venture Capital & Entrepreneurship' },
  { category: 'Business & Management', name: 'International Trade & Global Economics' },

  // 📐 Mathematics & Physical Sciences
  { category: 'Mathematics & Sciences', name: 'Applied Mathematics & Mathematical Modeling' },
  { category: 'Mathematics & Sciences', name: 'Probability, Stochastic Processes & Statistics' },
  { category: 'Mathematics & Sciences', name: 'Condensed Matter Physics & Materials' },
  { category: 'Mathematics & Sciences', name: 'Astrophysics, Astronomy & Gravitational Physics' },
  { category: 'Mathematics & Sciences', name: 'Laser Physics, Photonics & Quantum Optics' },
  { category: 'Mathematics & Sciences', name: 'Organic, Polymer & Physical Chemistry' },
  { category: 'Mathematics & Sciences', name: 'Computational Simulation & Numerical Analysis' },

  // ⚖️ Humanities, Social Sciences & Law
  { category: 'Humanities & Law', name: 'Corporate, Commercial & Securities Law' },
  { category: 'Humanities & Law', name: 'Cyber Law, Data Privacy & Intellectual Property (IPR)' },
  { category: 'Humanities & Law', name: 'Constitutional, Administrative & International Law' },
  { category: 'Humanities & Law', name: 'Public Administration & Public Policy Analysis' },
  { category: 'Humanities & Law', name: 'Macroeconomics, Microeconomics & Econometrics' },
  { category: 'Humanities & Law', name: 'Cognitive Science & Behavioral Psychology' },
  { category: 'Humanities & Law', name: 'English Literature, Linguistics & Communications' },
  { category: 'Humanities & Law', name: 'Journalism, Media Studies & Digital Broadcasting' },

  // 🎨 Design & Architecture
  { category: 'Design & Architecture', name: 'UI/UX Design, Interaction & User Research' },
  { category: 'Design & Architecture', name: 'Industrial & Ergonomic Product Design' },
  { category: 'Design & Architecture', name: 'Architectural Heritage & Sustainable Urbanism' },
  { category: 'Design & Architecture', name: 'Game Development, Computer Graphics & VR/AR' },
  { category: 'Design & Architecture', name: 'Graphic Design & Visual Communications' },
];

export const TeacherListPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Form states for teacher creation/update
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [qualification, setQualification] = useState('');
  
  // Specialization Multi-select states
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const [specSearch, setSpecSearch] = useState('');
  const [specCategoryFilter, setSpecCategoryFilter] = useState('ALL');

  const [joiningDate, setJoiningDate] = useState('2026-08-01');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'>('ACTIVE');

  // Assignment Modal States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassBatch[]>([]);
  const [assignSubjectId, setAssignSubjectId] = useState<number>(0);
  const [assignClassId, setAssignClassId] = useState<number>(0);
  const [assignYear, setAssignYear] = useState('2026-2027');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [search, selectedDept]);

  const loadDepartments = async () => {
    try {
      const res = await departmentService.getActive();
      if (res.success && res.data) {
        setDepartments(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const res = await teacherService.getAll(0, 50, search, selectedDept);
      if (res.success) {
        setTeachers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDepartmentId(departments.length > 0 ? departments[0].id : 0);
    setQualification('M.Tech / Ph.D in Computer Science');
    setSelectedSpecializations(['Artificial Intelligence & Intelligent Systems', 'Distributed Systems & Parallel Computing']);
    setSpecDropdownOpen(false);
    setSpecSearch('');
    setSpecCategoryFilter('ALL');
    setJoiningDate('2026-08-01');
    setStatus('ACTIVE');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    const teacherName = t.fullName || t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || '';
    const names = teacherName.split(' ');
    setFirstName(t.firstName || names[0] || '');
    setLastName(t.lastName || names.slice(1).join(' ') || '');
    setEmail(t.email);
    setPhone(t.phone || '');
    setDepartmentId(t.departmentId);
    setQualification(t.qualification || '');
    
    // Parse comma-separated specializations
    const parsed = t.specialization
      ? t.specialization.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    setSelectedSpecializations(parsed);

    setSpecDropdownOpen(false);
    setSpecSearch('');
    setSpecCategoryFilter('ALL');
    setJoiningDate(t.joiningDate || '2026-08-01');
    setStatus(t.status);
    setFormError(null);
    setModalOpen(true);
  };

  const openAssignModal = async (t: Teacher) => {
    setSelectedTeacher(t);
    setFormError(null);
    try {
      const [subRes, clsRes] = await Promise.all([
        subjectService.getAll(0, 100),
        classService.getAll(0, 100),
      ]);
      if (subRes.success) setSubjects(subRes.data);
      if (clsRes.success) setClasses(clsRes.data);
      if (subRes.data.length > 0) setAssignSubjectId(subRes.data[0].id);
      if (clsRes.data.length > 0) setAssignClassId(clsRes.data[0].id);
      setAssignModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSpecialization = (specName: string) => {
    if (selectedSpecializations.includes(specName)) {
      setSelectedSpecializations(selectedSpecializations.filter((s) => s !== specName));
    } else {
      setSelectedSpecializations([...selectedSpecializations, specName]);
    }
  };

  const removeSpecialization = (specName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSpecializations(selectedSpecializations.filter((s) => s !== specName));
  };

  const handleAddCustomSpecialization = (customName: string) => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (!selectedSpecializations.includes(trimmed)) {
      setSelectedSpecializations([...selectedSpecializations, trimmed]);
    }
    setSpecSearch('');
  };

  // Distinct category list for filtering
  const categories = useMemo(() => {
    const cats = Array.from(new Set(WORLD_SPECIALIZATIONS.map((s) => s.category)));
    return ['ALL', ...cats];
  }, []);

  // Filtered specializations based on search and active category
  const filteredSpecializations = useMemo(() => {
    const q = specSearch.trim().toLowerCase();
    return WORLD_SPECIALIZATIONS.filter((item) => {
      const matchesCategory = specCategoryFilter === 'ALL' || item.category === specCategoryFilter;
      const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [specSearch, specCategoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!firstName.trim() || !email.trim() || !departmentId) {
      setFormError('First name, email, and department are required.');
      return;
    }

    if (selectedSpecializations.length === 0) {
      setFormError('Please select at least one specialization for the faculty member.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        departmentId,
        qualification: qualification.trim() || undefined,
        specialization: selectedSpecializations.join(', '),
        joiningDate,
        status,
      };

      if (editingTeacher) {
        await teacherService.update(editingTeacher.id, payload);
        setFeedback({ type: 'success', message: 'Teacher profile updated successfully.' });
      } else {
        await teacherService.create(payload);
        setFeedback({ type: 'success', message: 'Teacher registered successfully with login credentials created.' });
      }
      setModalOpen(false);
      loadTeachers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to save teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !assignSubjectId || !assignClassId) return;

    setSubmitting(true);
    try {
      await teacherService.assignSubject({
        teacherId: selectedTeacher.id,
        subjectId: assignSubjectId,
        classId: assignClassId,
        academicYear: assignYear,
      });
      setFeedback({ type: 'success', message: `Subject successfully allocated to ${selectedTeacher.name}.` });
      setAssignModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to allocate subject.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="text-indigo-600" size={28} />
            Faculty &amp; Teachers
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage institutional faculty, department allocations, and teaching loads.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
        >
          <Plus size={18} />
          Register Faculty
        </button>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by faculty name or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedDept || ''}
            onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading faculty members...</div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-800">No Faculty Found</h3>
            <p className="text-slate-500 text-sm mt-1">Register faculty members and assign them to departments.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Faculty Name</th>
                  <th className="py-4 px-6">Employee ID</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Contact Email &amp; Phone</th>
                  <th className="py-4 px-6">Specialization</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          {(t.fullName || t.name || t.firstName || 'TC').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{t.fullName || t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim()}</div>
                          <div className="text-xs text-slate-500">{t.qualification || 'Faculty'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-indigo-600 text-xs font-semibold">{t.employeeId}</td>
                    <td className="py-4 px-6 text-slate-700">{t.departmentName || 'N/A'}</td>
                    <td className="py-4 px-6 text-slate-700 text-xs">
                      <div>{t.email}</div>
                      {t.phone && <div className="text-slate-500">{t.phone}</div>}
                    </td>
                    <td className="py-4 px-6 text-slate-700 text-xs max-w-xs">
                      {t.specialization ? (
                        <div className="flex flex-wrap gap-1">
                          {t.specialization.split(',').slice(0, 2).map((s, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-200">
                              {s.trim()}
                            </span>
                          ))}
                          {t.specialization.split(',').length > 2 && (
                            <span className="text-indigo-600 font-semibold text-[11px] self-center">
                              +{t.specialization.split(',').length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">General</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'ON_LEAVE'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openAssignModal(t)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition-colors"
                        title="Assign Subject &amp; Class"
                      >
                        <BookOpen size={14} />
                        Assign Load
                      </button>
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Faculty Registration / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingTeacher ? 'Edit Faculty Details' : 'Register Faculty Member'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic profile &bull; Global specializations multi-selection
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Prof. John"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Institutional Email *</label>
                  <span className="text-[11px] text-emerald-600 font-semibold">Teacher domain: .sms.in</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@sms.in"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Department *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value={0}>Select department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. M.Tech, Ph.D in Computer Science"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* SPECIALIZATION MULTI-CHOICE DROPDOWN SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>Specializations (Multiple Choices) *</span>
                    <Sparkles size={13} className="text-indigo-600" />
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      {selectedSpecializations.length} selected
                    </span>
                    {selectedSpecializations.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedSpecializations([])}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Display Selected Specialization Chips */}
                <div className="min-h-[46px] p-2 bg-slate-50/60 border border-slate-300 rounded-2xl flex flex-wrap gap-1.5 items-center">
                  {selectedSpecializations.length === 0 ? (
                    <span className="text-xs text-slate-400 pl-2">
                      No specializations selected yet. Click below to browse and select multiple choices...
                    </span>
                  ) : (
                    selectedSpecializations.map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white text-indigo-900 border border-indigo-200 shadow-xs"
                      >
                        <span>{spec}</span>
                        <button
                          type="button"
                          onClick={(e) => removeSpecialization(spec, e)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Multi-Select Dropdown Accordion / Popover */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setSpecDropdownOpen(!specDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100/70 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Filter size={14} className="text-indigo-600" />
                      {specDropdownOpen
                        ? 'Hide Specialization Picker'
                        : 'Click to Browse & Select Worldwide Specializations'}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-[11px] font-normal">
                        {WORLD_SPECIALIZATIONS.length}+ available worldwide
                      </span>
                      {specDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {specDropdownOpen && (
                    <div className="p-3 border-t border-slate-200 bg-white space-y-3">
                      {/* Search Bar inside Dropdown */}
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={specSearch}
                          onChange={(e) => setSpecSearch(e.target.value)}
                          placeholder="Search worldwide specializations (e.g., AI, VLSI, Cloud, Finance, Law)..."
                          className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                        />
                        {specSearch && (
                          <button
                            type="button"
                            onClick={() => setSpecSearch('')}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Category Pill Filters */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSpecCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                              specCategoryFilter === cat
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Options List */}
                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1 divide-y divide-slate-50">
                        {filteredSpecializations.length === 0 ? (
                          <div className="py-4 text-center">
                            <p className="text-xs text-slate-500">No matching standard specialization found.</p>
                            {specSearch.trim() && (
                              <button
                                type="button"
                                onClick={() => handleAddCustomSpecialization(specSearch)}
                                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
                              >
                                <Plus size={14} />
                                Add Custom: "{specSearch.trim()}"
                              </button>
                            )}
                          </div>
                        ) : (
                          filteredSpecializations.map((item) => {
                            const isSelected = selectedSpecializations.includes(item.name);
                            return (
                              <div
                                key={item.name}
                                onClick={() => toggleSpecialization(item.name)}
                                className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-50/80 text-indigo-950 font-semibold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                  </div>
                                  <span>{item.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                                  {item.category}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Showing {filteredSpecializations.length} specializations</span>
                        <button
                          type="button"
                          onClick={() => setSpecDropdownOpen(false)}
                          className="font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          Done Selecting
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="ON_LEAVE">ON LEAVE</option>
                </select>
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
                  {submitting ? 'Saving...' : editingTeacher ? 'Save Changes' : 'Register Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subject & Class Modal */}
      {assignModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Allocate Subject &amp; Class</h2>
            <p className="text-xs text-slate-500 mb-4">Assign teaching load to <span className="text-indigo-600 font-semibold">{selectedTeacher.name}</span></p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Subject *</label>
                <select
                  value={assignSubjectId}
                  onChange={(e) => setAssignSubjectId(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - Sem {s.semester}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Class / Division *</label>
                <select
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.courseName} - Sem {c.semester} (Div {c.division})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={assignYear}
                  onChange={(e) => setAssignYear(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
