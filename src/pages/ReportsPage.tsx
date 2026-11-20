import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download } from 'lucide-react';
import { api } from '../services/api';
import type { DashboardPayload, Examination } from '../types';

interface ReportsPageProps {
  dashboard: DashboardPayload | null;
  examinations: Examination[];
  selectedExamId: number;
  onSelectExam: (id: number) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  dashboard,
  examinations,
  selectedExamId,
  onSelectExam,
  onNotify,
}) => {
  const branchStats = useMemo(() => {
    if (!dashboard) return [];
    const groups: Record<string, { branch: string; scores: number[]; passes: number }> = {};
    for (const r of dashboard.results) {
      if (r.subject_count === 0) continue;
      if (!groups[r.branch]) {
        groups[r.branch] = { branch: r.branch, scores: [], passes: 0 };
      }
      groups[r.branch].scores.push(r.percentage);
      if (r.status === 'PASS') groups[r.branch].passes++;
    }
    return Object.values(groups).map((g) => ({
      branch: g.branch,
      students: g.scores.length,
      avgPercentage: Number(
        (g.scores.reduce((a, b) => a + b, 0) / g.scores.length).toFixed(2)
      ),
      highest: Number(Math.max(...g.scores).toFixed(2)),
      lowest: Number(Math.min(...g.scores).toFixed(2)),
      passRate: Number(((g.passes / g.scores.length) * 100).toFixed(1)),
    }));
  }, [dashboard]);

  const handleExport = async (type: 'results' | 'marks' | 'students') => {
    try {
      await api.downloadExportCSV(type, selectedExamId);
      onNotify(`Downloaded ${type} CSV report`);
    } catch (err: any) {
      onNotify(err?.message || 'Export failed', 'error');
    }
  };

  if (!dashboard) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Academic Performance Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Branch-level benchmarks, subject pass rates, and downloadable institutional reports.
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
            onClick={() => handleExport('results')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6] whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Download Full Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-slate-900 mb-1">
            Branch Average Percentage
          </h2>
          <p className="text-xs text-slate-500 mb-4">Mean percentage across academic departments</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchStats} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="branch" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="avgPercentage" name="Avg %" fill="#0F1E3D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-display text-base font-semibold text-slate-900 mb-1">
            Subject Pass Rate (%)
          </h2>
          <p className="text-xs text-slate-500 mb-4">Percentage of students meeting passing marks</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.subject_stats} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="subject_code" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="pass_rate" name="Pass Rate %" fill="#5B3DF5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch Performance Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Departmental Performance Summary
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport('marks')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Export Marks CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport('students')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Export Students CSV
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-6 py-3">Branch</th>
              <th className="text-right font-medium px-4 py-3">Evaluated Students</th>
              <th className="text-right font-medium px-4 py-3">Average %</th>
              <th className="text-right font-medium px-4 py-3">Highest %</th>
              <th className="text-right font-medium px-4 py-3">Lowest %</th>
              <th className="text-right font-medium px-6 py-3">Pass Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {branchStats.map((b) => (
              <tr key={b.branch} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-semibold text-slate-900">{b.branch}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{b.students}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums font-medium text-[#5B3DF5]">
                  {b.avgPercentage.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-700">
                  {b.highest.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-amber-700">
                  {b.lowest.toFixed(2)}%
                </td>
                <td className="px-6 py-3 text-right font-mono tabular-nums font-semibold">
                  {b.passRate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
