import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Pencil,
  Printer,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import type { AuthUser, Examination, StudentAIAnalysis, StudentResult } from '../types';

interface StudentProfilePageProps {
  currentUser: AuthUser;
  examinations: Examination[];
  selectedExamId: number;
  onSelectExam: (id: number) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  currentUser,
  examinations,
  selectedExamId,
  onSelectExam,
  onNotify,
}) => {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);
  const isAdmin = currentUser.role === 'ADMIN';

  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<StudentAIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    setLoading(true);
    setAiAnalysis(null);
    setAiError(null);
    api
      .getStudentResult(studentId, selectedExamId)
      .then((res) => {
        if (active) setResult(res);
      })
      .catch((err: any) => {
        if (active) onNotify(err?.message || 'Could not load student profile', 'error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [studentId, selectedExamId]);

  const handleAnalyze = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const analysis = await api.analyzeStudentAI(result.student_id, selectedExamId);
      setAiAnalysis(analysis);
    } catch (err: any) {
      setAiError(err?.message || 'AI evaluation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    if (!result) return;
    try {
      await api.downloadStudentResultCSV(result.student_id, result.roll_no, selectedExamId);
      onNotify(`Downloaded transcript CSV for ${result.name}`);
    } catch (err: any) {
      onNotify(err?.message || 'CSV export failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
        Loading academic profile...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
        <p className="text-sm text-slate-600">Student record was not found.</p>
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5B3DF5] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Return to Student Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/students"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Student Directory
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            {result.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono">
            Roll {result.roll_no} · {result.course} {result.branch} · Semester {result.semester} ·{' '}
            {result.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Select examination"
            value={selectedExamId}
            onChange={(e) => onSelectExam(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
          >
            {examinations.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.exam_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          {isAdmin && (
            <Link
              to={`/students/${result.student_id}/edit`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F1E3D] px-3 py-2 text-xs font-medium text-white hover:bg-[#192F5D] whitespace-nowrap"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Student
            </Link>
          )}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Total Marks</p>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {result.total_obtained} / {result.total_maximum}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Percentage</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#5B3DF5] tabular-nums">
            {result.percentage.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Grade</p>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900">
            {result.grade}{' '}
            <span className="font-sans text-xs font-normal text-slate-500">
              ({result.grade_label})
            </span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs text-slate-500">Result Status</p>
          <p
            className={`mt-2 font-mono text-2xl font-bold ${
              result.status === 'PASS'
                ? 'text-emerald-600'
                : result.status === 'FAIL'
                ? 'text-red-600'
                : 'text-slate-400'
            }`}
          >
            {result.status}
          </p>
        </div>
      </div>

      {/* Subject-wise Marks Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Subject-Wise Performance Breakdown
          </h2>
          <Link
            to="/marks"
            className="text-xs font-medium text-[#5B3DF5] hover:underline"
          >
            Update Marks
          </Link>
        </div>
        {result.subject_breakdown.length === 0 ? (
          <div className="p-8 text-sm text-slate-500">
            No marks have been recorded for this examination cycle yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Subject Code</th>
                  <th className="text-left font-medium px-4 py-3">Subject Name</th>
                  <th className="text-right font-medium px-4 py-3">Obtained</th>
                  <th className="text-right font-medium px-4 py-3">Maximum</th>
                  <th className="text-right font-medium px-4 py-3">Passing</th>
                  <th className="text-right font-medium px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.subject_breakdown.map((b) => (
                  <tr key={b.subject_code} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                      {b.subject_code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{b.subject_name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {b.obtained_marks}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                      {b.max_marks}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                      {b.passing_marks}
                    </td>
                    <td
                      className={`px-6 py-3 text-right text-xs font-semibold ${
                        b.passed ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {b.passed ? 'PASS' : 'FAIL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gemini AI Faculty Evaluation */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              AI Faculty Evaluation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized subject strengths, focus areas, and intervention plan powered by Gemini.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={aiLoading || result.subject_count === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B3DF5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4C30D6] disabled:opacity-50 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {aiLoading ? 'Evaluating...' : 'Generate Evaluation'}
          </button>
        </div>

        {aiError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {aiAnalysis && (
          <div className="mt-5 pt-5 border-t border-slate-200 space-y-4 text-xs text-slate-700">
            <p className="text-sm text-slate-900 leading-relaxed">{aiAnalysis.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="font-semibold text-emerald-700 mb-1.5">Key Strengths</p>
                <ul className="list-disc pl-4 space-y-1">
                  {aiAnalysis.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-amber-700 mb-1.5">Focus Areas</p>
                <ul className="list-disc pl-4 space-y-1">
                  {aiAnalysis.focusAreas.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="pt-3 border-t border-slate-100">
              <span className="font-semibold text-slate-900">Action Plan: </span>
              {aiAnalysis.recommendedPlan}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
