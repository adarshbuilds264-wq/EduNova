import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUpRight, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CohortAIInsights, DashboardPayload, Examination } from '../types';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';

interface DashboardPageProps {
  data: DashboardPayload | null;
  examinations: Examination[];
  selectedExamId: number;
  onSelectExam: (id: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  data,
  examinations,
  selectedExamId,
  onSelectExam,
}) => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<CohortAIInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-slate-200 p-5 text-xs text-slate-400">
              Loading KPI...
            </div>
          ))}
        </div>
        <div className="h-64 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm text-slate-500">
          Synchronizing cohort analytics...
        </div>
      </div>
    );
  }

  const gradeChartData = Object.entries(data.summary.grade_distribution_dict || {}).map(
    ([grade, count]) => ({ grade, count })
  );

  const handleRunDiagnostics = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await api.cohortInsightsAI(selectedExamId);
      setInsights(res);
    } catch (err: any) {
      setInsightsError(err?.message || 'Unable to generate cohort diagnostics');
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Academic Performance Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cohort statistics computed by Python data structures from live SQL records.
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
                {ex.exam_name} (Sem {ex.semester})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => navigate('/observatory-3d')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F1E3D] px-4 py-2 text-sm font-medium text-white hover:bg-[#192F5D] transition-colors whitespace-nowrap"
          >
            Open 3D Observatory
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards (Single-Elevation Depth, Tabular Numerals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Students"
          value={data.kpis.total_students}
          subtitle={`${data.summary.evaluated_count} evaluated in active exam`}
        />
        <StatCard
          label="Total Subjects"
          value={data.kpis.total_subjects}
          subtitle={`${data.kpis.total_examinations} examination cycles`}
        />
        <StatCard
          label="Average Class Percentage"
          value={`${data.kpis.average_percentage.toFixed(1)}%`}
          valueClassName="text-[#5B3DF5]"
          subtitle={`Peak ${data.kpis.highest_percentage.toFixed(1)}% · Low ${data.kpis.lowest_percentage.toFixed(1)}%`}
        />
        <StatCard
          label="Overall Pass Rate"
          value={`${data.kpis.pass_rate.toFixed(1)}%`}
          valueClassName="text-emerald-600"
          subtitle={`${data.summary.pass_count} passed · ${data.summary.evaluated_count - data.summary.pass_count} failed`}
        />
      </div>

      {/* Gemini Cohort Intelligence Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              AI Cohort Diagnostic Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Synthesize subject bottlenecks, at-risk student alerts, and intervention priorities with Gemini.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunDiagnostics}
            disabled={insightsLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4C30D6] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {insightsLoading ? 'Analyzing Cohort...' : 'Generate Cohort Insights'}
          </button>
        </div>

        {insightsError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{insightsError}</span>
          </div>
        )}

        {insights && (
          <div className="mt-5 pt-5 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
            <div className="lg:col-span-3">
              <p className="text-slate-800 leading-relaxed">{insights.executiveSummary}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 mb-2">Subject Bottlenecks</h3>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                {insights.subjectBottlenecks.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-red-700 mb-2">At-Risk Student Alerts</h3>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                {insights.atRiskAlerts.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-emerald-700 mb-2">Recommended Actions</h3>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                {insights.actionItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Subject-Wise Average Marks
              </h2>
              <p className="text-xs text-slate-500">Dashed line indicates 40-mark passing threshold</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.subject_stats} margin={{ top: 10, right: 16, left: -12, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="subject_code" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine y={40} stroke="#DC2626" strokeDasharray="4 4" />
                <Bar dataKey="average_marks" name="Average Marks" fill="#0F1E3D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Grade Distribution
            </h2>
            <p className="text-xs text-slate-500">Computed via Python GRADE_RANGES tuple</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeChartData} margin={{ top: 10, right: 12, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Students" fill="#5B3DF5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performers & Low Marks Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h2 className="font-display text-base font-semibold text-slate-900">
                Top Performing Students
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/results')}
              className="text-xs font-medium text-[#5B3DF5] hover:underline"
            >
              View All Results
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Roll No</th>
                  <th className="text-left font-medium px-4 py-3">Student</th>
                  <th className="text-right font-medium px-4 py-3">Percentage</th>
                  <th className="text-right font-medium px-6 py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.summary.top_students.map((st) => (
                  <tr key={st.student_id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs text-slate-600 tabular-nums">
                      {st.roll_no}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {st.name}
                      <span className="ml-2 text-xs font-normal text-slate-400">{st.branch}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">
                      {st.percentage.toFixed(2)}%
                    </td>
                    <td className="px-6 py-3 text-right font-mono font-semibold text-emerald-700">
                      {st.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="font-display text-base font-semibold text-slate-900">
                Students Requiring Attention
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/marks')}
              className="text-xs font-medium text-[#5B3DF5] hover:underline"
            >
              Update Marks
            </button>
          </div>
          {data.summary.low_performers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              All evaluated students cleared passing thresholds above 60%.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left font-medium px-6 py-3">Roll No</th>
                    <th className="text-left font-medium px-4 py-3">Student</th>
                    <th className="text-right font-medium px-4 py-3">Score</th>
                    <th className="text-right font-medium px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.summary.low_performers.map((st) => (
                    <tr key={st.student_id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-xs text-slate-600 tabular-nums">
                        {st.roll_no}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{st.name}</div>
                        {st.failed_subjects.length > 0 && (
                          <div className="text-xs text-red-600">
                            Failed: {st.failed_subjects.join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">
                        {st.percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-3 text-right text-xs font-semibold">
                        <span className={st.status === 'FAIL' ? 'text-red-600' : 'text-amber-600'}>
                          {st.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
