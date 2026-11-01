import React, { useState, useEffect } from 'react';
import { feeService } from '../../services/academicServices';
import { StudentFeeSummary, FeePaymentRecord } from '../../types/academic';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  DollarSign,
  Receipt,
  Eye,
  FileCheck,
  ShieldCheck,
  Info,
} from 'lucide-react';

export const StudentFeePage: React.FC = () => {
  const [fees, setFees] = useState<StudentFeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFee, setSelectedFee] = useState<StudentFeeSummary | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    loadMyFees();
  }, []);

  const loadMyFees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await feeService.getMyFees();
      if (res.success && res.data) {
        setFees(res.data);
      } else {
        setFees([]);
      }
    } catch (err: any) {
      console.error('Failed to load student fees:', err);
      setError(err.response?.data?.message || 'Could not fetch your fee statements.');
    } finally {
      setLoading(false);
    }
  };

  const totalInvoiced = fees.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
  const totalPending = fees.reduce((sum, f) => sum + Number(f.pendingAmount || 0), 0);

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status !== 'PAID' && new Date(dueDate) < new Date();
    if (status === 'PAID') {
      return {
        label: 'Paid in Full',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    } else if (isOverdue) {
      return {
        label: 'Overdue',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    } else if (status === 'PARTIAL') {
      return {
        label: 'Partially Paid',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    } else {
      return {
        label: 'Pending',
        color: 'bg-sky-50 text-sky-700 border-sky-200',
      };
    }
  };

  const openReceipts = (fee: StudentFeeSummary) => {
    setSelectedFee(fee);
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CreditCard className="text-indigo-600" size={28} />
            My Fee Invoices & Payment Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Personal semester tuition invoices, payment deadlines, clearance records, and receipts.
          </p>
        </div>
        {fees.length > 0 && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors border border-slate-300 shadow-xs"
          >
            <Printer size={16} />
            Print Ledger
          </button>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-slate-500 text-xs mt-1">Cumulative charges across terms</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Paid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-slate-500 text-xs mt-1">Settled & verified payments</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Outstanding Balance</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalPending > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
              <Clock size={16} />
            </div>
          </div>
          <div className={`text-2xl font-extrabold ${totalPending > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {totalPending === 0 ? 'All institutional dues clear' : 'Pending payment settlement'}
          </p>
        </div>
      </div>

      {/* Bursar Info Notice */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3 text-indigo-900 text-xs">
        <Info className="text-indigo-600 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <span className="font-semibold text-indigo-950">Payment Settlement & Verification Policy:</span> Payments can be
          settled at the Bursar / Accounts Desk or through institutional bank transfers. Once recorded by the bursar,
          your official receipt is logged here immediately.
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Invoiced Semester Fee Records</h3>
          <span className="text-xs text-slate-500 font-medium">{fees.length} Total Statement(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading fee statements...</div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">{error}</div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto text-slate-400 mb-3" size={40} />
            <h4 className="text-base font-semibold text-slate-800">No Fee Dues Found</h4>
            <p className="text-slate-500 text-xs mt-1">You have no pending or invoiced institutional fees at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-4 px-6">Fee Title & Course</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Total Invoiced</th>
                  <th className="py-4 px-6">Paid Amount</th>
                  <th className="py-4 px-6">Pending Due</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Receipts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((f) => {
                  const badge = getStatusBadge(f.status, f.dueDate);
                  const hasPayments = f.payments && f.payments.length > 0;
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{f.feeTitle}</div>
                        <div className="text-xs text-slate-500">{f.courseName || 'Academic Course'}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        {new Date(f.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        ${Number(f.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-semibold text-emerald-600">
                        ${Number(f.paidAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 font-semibold text-amber-600">
                        ${Number(f.pendingAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {hasPayments ? (
                          <button
                            onClick={() => openReceipts(f)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 font-semibold text-xs transition-colors border border-slate-200"
                          >
                            <Receipt size={14} />
                            View Receipt ({f.payments?.length})
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No payments yet</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipts Drawer / Modal */}
      {receiptModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="text-emerald-600" size={20} />
                  Official Payment Receipts
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">{selectedFee.feeTitle}</p>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {selectedFee.payments && selectedFee.payments.length > 0 ? (
                selectedFee.payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Receipt Number</span>
                        <span className="font-mono font-bold text-indigo-600 text-sm">{p.receiptNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px] uppercase font-semibold">Amount Paid</span>
                        <span className="font-extrabold text-emerald-600 text-sm">
                          ${Number(p.amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400">Payment Date:</span>{' '}
                        <span className="font-medium text-slate-900">{p.paymentDate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Payment Mode:</span>{' '}
                        <span className="font-medium text-slate-900">{p.paymentMode}</span>
                      </div>
                      {p.transactionReference && (
                        <div className="col-span-2">
                          <span className="text-slate-400">Ref / Transaction ID:</span>{' '}
                          <span className="font-mono text-slate-700">{p.transactionReference}</span>
                        </div>
                      )}
                      {p.recordedByName && (
                        <div className="col-span-2">
                          <span className="text-slate-400">Verified By:</span>{' '}
                          <span className="text-slate-700">{p.recordedByName} (Accounts Desk)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">No payment records found.</div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
