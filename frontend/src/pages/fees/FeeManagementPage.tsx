import React, { useState, useEffect } from 'react';
import { feeService, courseService } from '../../services/academicServices';
import { FeeStructure, StudentFeeSummary, FeePaymentRecord, Course } from '../../types/academic';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Plus, Search, Receipt, CheckCircle2, XCircle, AlertCircle, DollarSign, Calendar, Printer } from 'lucide-react';

export const FeeManagementPage: React.FC = () => {
  const { role } = useAuth();
  const isAdmin = role === 'ROLE_SUPER_ADMIN' || role === 'ROLE_ADMIN';
  const isStudent = role === 'ROLE_STUDENT';

  const [fees, setFees] = useState<StudentFeeSummary[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState<number | undefined>();

  // Modals
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const [selectedFee, setSelectedFee] = useState<StudentFeeSummary | null>(null);
  const [generatedReceipt, setGeneratedReceipt] = useState<FeePaymentRecord | null>(null);

  // Fee Structure Form
  const [structCourseId, setStructCourseId] = useState<number>(0);
  const [structYear, setStructYear] = useState('2026-2027');
  const [structSemester, setStructSemester] = useState<number>(1);
  const [structTitle, setStructTitle] = useState('Tuition & Campus Facilities Fee');
  const [structAmount, setStructAmount] = useState<number>(45000);
  const [structDueDate, setStructDueDate] = useState('2026-12-15');
  const [structDescription, setStructDescription] = useState('Includes library, computer laboratory, and tuition charges.');

  // Payment Form
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payMode, setPayMode] = useState<'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'ONLINE' | 'UPI'>('ONLINE');
  const [payReference, setPayReference] = useState('');
  const [payRemarks, setPayRemarks] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadCourses();
    loadFeeStructures();
    loadStudentFees();
  }, [statusFilter, courseFilter]);

  const loadCourses = async () => {
    try {
      const res = await courseService.getActive();
      if (res.success && res.data) {
        setCourses(res.data);
        if (res.data.length > 0) setStructCourseId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadFeeStructures = async () => {
    try {
      const res = await feeService.getAllStructures();
      if (res.success && res.data) {
        setStructures(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudentFees = async () => {
    try {
      setLoading(true);
      const res = await feeService.getAllStudentFees(0, 50, courseFilter, statusFilter || undefined);
      if (res.success) {
        setFees(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateStructure = () => {
    setFormError(null);
    setStructureModalOpen(true);
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!structCourseId || !structTitle.trim() || !structAmount) {
      setFormError('Course, title, and total amount are required.');
      return;
    }

    setSubmitting(true);
    try {
      await feeService.createStructure({
        courseId: structCourseId,
        academicYear: structYear,
        semester: Number(structSemester),
        title: structTitle.trim(),
        totalAmount: Number(structAmount),
        dueDate: structDueDate,
        description: structDescription.trim(),
      });
      setFeedback({ type: 'success', message: 'Fee structure created and invoiced to cohort students.' });
      setStructureModalOpen(false);
      loadFeeStructures();
      loadStudentFees();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create fee structure.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (fee: StudentFeeSummary) => {
    setSelectedFee(fee);
    setPayAmount(fee.pendingAmount);
    setPayDate(new Date().toISOString().split('T')[0]);
    setPayMode('UPI');
    setPayReference(`TXN-${Date.now().toString().slice(-6)}`);
    setPayRemarks('Semester tuition installment');
    setFormError(null);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || payAmount <= 0) {
      setFormError('Payment amount must be greater than 0.');
      return;
    }

    if (payAmount > selectedFee.pendingAmount) {
      setFormError(`Amount cannot exceed the pending balance of ₹${selectedFee.pendingAmount.toLocaleString()}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await feeService.recordPayment({
        studentFeeId: selectedFee.id,
        amountPaid: Number(payAmount),
        paymentDate: payDate,
        paymentMode: payMode,
        transactionReference: payReference.trim() || undefined,
        remarks: payRemarks.trim() || undefined,
      });

      if (res.success && res.data) {
        setGeneratedReceipt(res.data);
        setFeedback({ type: 'success', message: 'Payment recorded and verified successfully.' });
        setPaymentModalOpen(false);
        setReceiptModalOpen(true);
        loadStudentFees();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record payment.');
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
            <CreditCard className="text-indigo-600" size={28} />
            {isStudent ? 'My Fee Invoices & Dues' : 'Institutional Fees & Dues'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isStudent
              ? 'View your semester tuition fees, payment status, receipts, and outstanding dues.'
              : 'Structure fee tiers, invoice students, record installments, and issue official receipts.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateStructure}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all text-sm"
          >
            <Plus size={18} />
            Create Fee Structure
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

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-64">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Filter by Course</label>
          <select
            value={courseFilter || ''}
            onChange={(e) => setCourseFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-64">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Payment Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNPAID">Unpaid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Student Dues Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading student dues ledger...</div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-semibold text-slate-800">No Invoices Found</h3>
            <p className="text-slate-500 text-sm mt-1">Create a fee structure to invoice students for the upcoming term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Student & Roll #</th>
                  <th className="py-4 px-6">Invoice Title</th>
                  <th className="py-4 px-6">Total Due</th>
                  <th className="py-4 px-6">Paid Amount</th>
                  <th className="py-4 px-6">Pending</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div>{f.studentName}</div>
                      <div className="text-xs font-mono text-indigo-600 font-semibold">{f.studentIdNumber}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-800">
                      <div>{f.feeTitle}</div>
                      <div className="text-xs text-slate-500">{f.courseName}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-900 font-bold">₹{f.totalAmount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-emerald-600 font-bold">₹{f.paidAmount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-rose-600 font-bold">₹{f.pendingAmount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">{f.dueDate}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          f.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : f.status === 'PARTIAL'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {f.pendingAmount > 0 ? (
                        <button
                          onClick={() => openPaymentModal(f)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 transition-all"
                        >
                          <Receipt size={14} />
                          Collect Payment
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center justify-end gap-1">
                          <CheckCircle2 size={14} className="text-emerald-600" /> Fully Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Fee Structure Modal */}
      {isAdmin && structureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Create Fee Structure</h2>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Course *</label>
                <select
                  value={structCourseId}
                  onChange={(e) => setStructCourseId(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fee Title *</label>
                <input
                  type="text"
                  value={structTitle}
                  onChange={(e) => setStructTitle(e.target.value)}
                  placeholder="e.g. Annual Tuition & Laboratory Fee"
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Semester *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={structSemester}
                    onChange={(e) => setStructSemester(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={structYear}
                    onChange={(e) => setStructYear(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="100"
                    value={structAmount}
                    onChange={(e) => setStructAmount(Number(e.target.value))}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={structDueDate}
                    onChange={(e) => setStructDueDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={structDescription}
                  onChange={(e) => setStructDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStructureModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Create Structure & Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Record Fee Payment</h2>
            <p className="text-xs text-slate-500 mb-4">
              Student: <span className="text-indigo-600 font-semibold">{selectedFee.studentName}</span> | Pending: ₹{selectedFee.pendingAmount.toLocaleString()}
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedFee.pendingAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="UPI">UPI / QR</option>
                    <option value="ONLINE">Net Banking / Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  placeholder="e.g. UTR / Transaction reference"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  {submitting ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptModalOpen && generatedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-800">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 border border-emerald-200">
                <Receipt size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Payment Receipt</h3>
              <div className="text-xs font-mono text-emerald-700 font-bold">{generatedReceipt.receiptNumber}</div>
            </div>

            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-extrabold text-slate-900 text-base">₹{generatedReceipt.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Date</span>
                <span className="text-slate-800">{generatedReceipt.paymentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Mode</span>
                <span className="text-slate-800">{generatedReceipt.paymentMode}</span>
              </div>
              {generatedReceipt.transactionReference && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Reference No</span>
                  <span className="font-mono text-slate-800">{generatedReceipt.transactionReference}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Recorded By</span>
                <span className="text-slate-800">{generatedReceipt.recordedByName || 'Finance Admin'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                <Printer size={14} />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
