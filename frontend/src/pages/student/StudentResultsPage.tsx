import React, { useState, useEffect } from 'react';
import { examService } from '../../services/academicServices';
import { ResultItem } from '../../types/academic';
import { Award, Printer, CheckCircle2, XCircle, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';

export const StudentResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyResults();
  }, []);

  const loadMyResults = async () => {
    try {
      setLoading(true);
      const res = await examService.getMyResults();
      if (res.success && res.data) {
        setResults(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Award className="text-indigo-600" size={28} />
            Academic Transcripts & Grade Cards
          </h1>
          <p className="text-slate-500 text-sm mt-1">Official semester examination scorecards, GPA metrics, and evaluation summaries.</p>
        </div>
        {results.length > 0 && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-xl text-sm transition-colors border border-slate-300 shadow-xs"
          >
            <Printer size={16} />
            Print Transcript
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading published transcripts...</div>
      ) : results.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
          <Award className="mx-auto text-slate-400 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-slate-700">No Published Results Available</h3>
          <p className="text-slate-500 text-sm mt-1">Results for active examination terms will appear here once finalized by faculty.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{res.examTitle}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        res.status === 'PASS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Student: <span className="text-slate-800 font-semibold">{res.studentName}</span> ({res.studentIdNumber})
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Marks</span>
                    <span className="text-sm font-bold text-slate-900">
                      {res.totalMarksObtained} / {res.totalMaxMarks}
                    </span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Percentage</span>
                    <span className="text-sm font-bold text-indigo-600">{res.percentage}%</span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Grade / GPA</span>
                    <span className="text-sm font-extrabold text-emerald-600">
                      {res.grade} ({res.gpa})
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Sparkles size={16} className="text-amber-500" />
                  <span>
                    Official Grade: <strong className="text-slate-900">{res.grade}</strong> | Grade Point Average:{' '}
                    <strong className="text-emerald-700">{res.gpa} / 10.0</strong>
                  </span>
                </div>
                <div className="text-slate-500">
                  Published: {res.publishedDate ? new Date(res.publishedDate).toLocaleDateString() : 'Official'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
