import React, { useState, useEffect } from 'react';
import { assignmentService, classService, subjectService, studentService } from '../../services/academicServices';
import { Assignment, AssignmentSubmission, ClassBatch, Subject } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { FileText, Plus, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Upload, Eye, Award } from 'lucide-react';

export const AssignmentListPage: React.FC = () => {
  const { user, role } = useAuth();
  const isStudent = role === 'ROLE_STUDENT';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassBatch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);

  // Create Assignment Form
  const [classId, setClassId] = useState<number>(0);
  const [subjectId, setSubjectId] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-11-20T23:59:00');
  const [maxPoints, setMaxPoints] = useState<number>(50);

  // Student Submission Form
  const [submissionText, setSubmissionText] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  // Grading State
  const [gradingSubId, setGradingSubId] = useState<number | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeFeedback, setGradeFeedback] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isStudent) {
      loadPrerequisites();
    }
    loadAssignments();
  }, [isStudent]);

  const loadPrerequisites = async () => {
    try {
      const [clsRes, subRes] = await Promise.all([
        classService.getAll(0, 100),
        subjectService.getAll(0, 100),
      ]);
      if (clsRes.success && clsRes.data.length > 0) {
        setClasses(clsRes.data);
        setClassId(clsRes.data[0].id);
      }
      if (subRes.success && subRes.data.length > 0) {
        setSubjects(subRes.data);
        setSubjectId(subRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.getAll(0, 50);
      if (res.success) {
        setAssignments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setDeadline('2026-11-20T23:59:00');
    setMaxPoints(50);
    setFormError(null);
    setCreateModalOpen(true);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || !title.trim() || !description.trim()) {
      setFormError('Class, subject, title, and instructions are required.');
      return;
    }

    setSubmitting(true);
    try {
      await assignmentService.create({
        classId,
        subjectId,
        title: title.trim(),
        description: description.trim(),
        deadline,
        maxPoints: Number(maxPoints),
        status: 'PUBLISHED',
      });
      setFeedback({ type: 'success', message: 'Assignment posted and broadcast to class students.' });
      setCreateModalOpen(false);
      loadAssignments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (asgn: Assignment) => {
    setSelectedAssignment(asgn);
    setSubmissionText('');
    setSubmissionLink('');
    setFormError(null);
    setSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionText.trim()) {
      setFormError('Please enter your submission text or repository link.');
      return;
    }

    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(selectedAssignment.id, {
        submissionText: submissionText.trim(),
        filePath: submissionLink.trim() || undefined,
      });
      setFeedback({ type: 'success', message: 'Assignment submitted on time.' });
      setSubmitModalOpen(false);
      loadAssignments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmissionsModal = async (asgn: Assignment) => {
    setSelectedAssignment(asgn);
    setFormError(null);
    try {
      const res = await assignmentService.getSubmissions(asgn.id);
      if (res.success && res.data) {
        setSubmissions(res.data);
      }
      setSubmissionsModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmission = async (submissionId: number) => {
    if (!selectedAssignment) return;
    if (gradeMarks < 0 || gradeMarks > selectedAssignment.maxPoints) {
      setFormError(`Marks must be between 0 and ${selectedAssignment.maxPoints}`);
      return;
    }

    try {
      await assignmentService.gradeSubmission(submissionId, {
        marksAwarded: Number(gradeMarks),
        feedback: gradeFeedback.trim() || 'Reviewed.',
      });
      setFeedback({ type: 'success', message: 'Submission evaluated successfully.' });
      setGradingSubId(null);
      // reload submissions
      const res = await assignmentService.getSubmissions(selectedAssignment.id);
      if (res.success && res.data) setSubmissions(res.data);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to grade submission.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileText className="text-indigo-600" size={28} />
            Academic Coursework & Assignments
          </h1>
          <p className="text-slate-500 text-sm mt-1">Homework tasks, project deliverables, submissions, and grading rubrics.</p>
        </div>
        {!isStudent && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Post Assignment
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

      {/* Assignments Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
          <FileText className="mx-auto text-slate-400 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-slate-800">No Assignments Active</h3>
          <p className="text-slate-500 text-sm mt-1">There are currently no coursework tasks posted for this semester.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((asgn) => (
            <div
              key={asgn.id}
              className="bg-white border border-slate-200 hover:border-indigo-200 rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {asgn.subjectName || 'Subject'}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {asgn.maxPoints} pts
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">{asgn.title}</h3>
                <p className="text-slate-600 text-xs line-clamp-3 mb-4">{asgn.description}</p>
              </div>

              <div>
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-rose-600" />
                    <span>Due: {new Date(asgn.deadline).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-600" />
                    <span>Cohort: {asgn.className || 'All Sections'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {isStudent ? (
                    <button
                      onClick={() => openSubmitModal(asgn)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Upload size={14} />
                      Submit Solution
                    </button>
                  ) : (
                    <button
                      onClick={() => openSubmissionsModal(asgn)}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                    >
                      <Eye size={14} />
                      Review Submissions
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Assignment Modal */}
      {createModalOpen && !isStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Post Coursework Assignment</h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Class *</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseName} - Div {c.division} (Sem {c.semester})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Subject *</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Assignment Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Relational Normalization & SQL Queries Problem Set"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description & Instructions *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Detailed guidelines, problem specifications, and submission criteria..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Deadline Date & Time</label>
                  <input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Max Points</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Publishing...' : 'Publish Coursework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {submitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Submit Assignment</h2>
            <p className="text-xs text-indigo-600 font-semibold mb-4">{selectedAssignment.title}</p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Submission Content / Solution *</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={4}
                  placeholder="Paste your answers, code snippets, or written solution here..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Document Link / GitHub Repository (Optional)</label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://github.com/... or Google Drive URL"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Submissions Modal */}
      {submissionsModalOpen && !isStudent && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Review Submissions</h2>
                <div className="text-xs text-indigo-600 font-medium">
                  {selectedAssignment.title} (Max: {selectedAssignment.maxPoints} pts)
                </div>
              </div>
              <button onClick={() => setSubmissionsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            {submissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No submissions turned in by students yet.
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{sub.studentName}</span>
                        <span className="font-mono text-indigo-600 ml-2 font-semibold">{sub.studentIdNumber}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          sub.status === 'REVIEWED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : sub.status === 'LATE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-slate-200 rounded-xl font-mono text-slate-800 whitespace-pre-wrap">
                      {sub.submissionText}
                    </div>

                    {sub.filePath && (
                      <div>
                        <a
                          href={sub.filePath}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 underline font-medium"
                        >
                          Attachment / Repo Link: {sub.filePath}
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                      <div className="text-slate-500">
                        {sub.marksAwarded !== undefined && (
                          <span className="font-bold text-emerald-700 mr-2">
                            Score: {sub.marksAwarded} / {selectedAssignment.maxPoints}
                          </span>
                        )}
                        {sub.feedback && <span>Feedback: {sub.feedback}</span>}
                      </div>

                      {gradingSubId === sub.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={selectedAssignment.maxPoints}
                            placeholder="Score"
                            value={gradeMarks}
                            onChange={(e) => setGradeMarks(Number(e.target.value))}
                            className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Feedback"
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                            className="w-36 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => handleGradeSubmission(sub.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setGradingSubId(sub.id);
                            setGradeMarks(sub.marksAwarded || 0);
                            setGradeFeedback(sub.feedback || '');
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium transition-colors"
                        >
                          Grade / Feedback
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
