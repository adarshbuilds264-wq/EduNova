import React, { useMemo, useState } from 'react';
import { Download, Search, FileText, X, Sparkles, Printer, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Examination, StudentAIAnalysis, StudentResult } from '../types';

interface ResultsPageProps {
  results: StudentResult[];
  examinations: Examination[];
  selectedExamId: number;
  onSelectExam: (id: number) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  examinations,
  selectedExamId,
  onSelectExam,
  onNotify,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<StudentAIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.roll_no.toLowerCase().includes(q) ||
          r.branch.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [results, search, statusFilter]);

  const handleExport = async () => {
    try {
      await api.downloadExportCSV('results', selectedExamId);
      onNotify('Exported results CSV via Python DictWriter');
    } catch (err: any) {
      onNotify(err?.message || 'Export failed', 'error');
    }
  };

  const openReport = (r: StudentResult) => {
    setSelectedStudent(r);
    setAiAnalysis(null);
    setAiError(null);
  };

  const runEvaluation = async () => {
    if (!selectedStudent) return;
    setAiLoading(true);
    setAiError(null);
    try {
      setAiAnalysis(await api.analyzeStudentAI(selectedStudent.student_id, selectedExamId));
    } catch (err: any) {
      setAiError(err?.message || 'AI evaluation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Examination Results Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Automated totals, percentages, grades, and subject-wise pass status calculated by Python.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Select examination"
            value={selectedExamId}
            onChange={(e) => onSelectExam(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
          >
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.exam_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F1E3D] px-4 py-2 text-sm font-medium text-white hover:bg-[#192F5D] transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export Results CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by student name, roll number, or branch..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['ALL', 'PASS', 'FAIL'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Results' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-6 py-3">Roll No</th>
                <th className="text-left font-medium px-4 py-3">Student</th>
                <th className="text-right font-medium px-4 py-3">Total Marks</th>
                <th className="text-right font-medium px-4 py-3">Percentage</th>
                <th className="text-right font-medium px-4 py-3">Grade</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-6 py-3">Marksheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.student_id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-xs text-slate-700 tabular-nums">
                    {r.roll_no}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{r.name}</div>
                    <div className="text-xs text-slate-500">
                      {r.branch} · Sem {r.semester}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">
                    {r.total_obtained} / {r.total_maximum}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {r.percentage.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#0F1E3D]">
                    {r.grade}
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    <span
                      className={
                        r.status === 'PASS'
                          ? 'text-emerald-600'
                          : r.status === 'FAIL'
                          ? 'text-red-600'
                          : 'text-slate-400'
                      }
                    >
                      {r.status}
                    </span>
                    {r.failed_subjects.length > 0 && (
                      <div className="text-[11px] font-normal text-red-500">
                        Failed: {r.failed_subjects.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openReport(r)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Marksheet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marksheet Transcript Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <p className="text-xs font-medium text-[#5B3DF5]">Official Academic Marksheet</p>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                  {selectedStudent.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll {selectedStudent.roll_no} · {selectedStudent.course} {selectedStudent.branch} · Semester{' '}
                  {selectedStudent.semester}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await api.downloadStudentResultCSV(
                        selectedStudent.student_id,
                        selectedStudent.roll_no,
                        selectedExamId
                      );
                      onNotify(`Exported individual CSV marksheet for ${selectedStudent.name}`);
                    } catch (err: any) {
                      onNotify(err?.message || 'Export failed', 'error');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-5">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">Code</th>
                    <th className="text-left px-4 py-2.5 font-medium">Subject</th>
                    <th className="text-right px-4 py-2.5 font-medium">Obtained</th>
                    <th className="text-right px-4 py-2.5 font-medium">Max</th>
                    <th className="text-right px-4 py-2.5 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedStudent.subject_breakdown.map((b) => (
                    <tr key={b.subject_code}>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{b.subject_code}</td>
                      <td className="px-4 py-2.5 text-slate-900">{b.subject_name}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums font-medium">
                        {b.obtained_marks}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-500">
                        {b.max_marks}
                      </td>
                      <td
                        className={`px-4 py-2.5 text-right text-xs font-semibold ${
                          b.passed ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {b.passed ? 'PASS' : 'FAIL'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 grid grid-cols-4 gap-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-center">
                <div>
                  <p className="text-xs text-slate-500">Grand Total</p>
                  <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                    {selectedStudent.total_obtained} / {selectedStudent.total_maximum}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Percentage</p>
                  <p className="font-mono text-base font-bold text-[#5B3DF5] tabular-nums">
                    {selectedStudent.percentage.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Final Grade</p>
                  <p className="font-mono text-base font-bold text-slate-900">{selectedStudent.grade}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Overall Result</p>
                  <p
                    className={`font-mono text-base font-bold ${
                      selectedStudent.status === 'PASS' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {selectedStudent.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">AI Performance Evaluation</p>
                <button
                  type="button"
                  onClick={runEvaluation}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B3DF5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4C30D6] disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiLoading ? 'Generating...' : 'Generate AI Remarks'}
                </button>
              </div>
              {aiError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}
              {aiAnalysis && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 space-y-2">
                  <p className="text-sm text-slate-900">{aiAnalysis.summary}</p>
                  <p>
                    <span className="font-semibold text-emerald-700">Strengths: </span>
                    {aiAnalysis.strengths.join('; ')}
                  </p>
                  <p>
                    <span className="font-semibold text-amber-700">Focus Areas: </span>
                    {aiAnalysis.focusAreas.join('; ')}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Recommendation: </span>
                    {aiAnalysis.recommendedPlan}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
