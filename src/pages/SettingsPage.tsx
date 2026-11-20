import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, ShieldCheck } from 'lucide-react';
import { api, setStoredToken } from '../services/api';
import type { AuthUser } from '../types';

interface SettingsPageProps {
  currentUser: AuthUser;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onNotify }) => {
  const [dbHealth, setDbHealth] = useState<Record<string, unknown> | null>(null);
  const [refreshingToken, setRefreshingToken] = useState(false);

  useEffect(() => {
    api
      .getDbHealth()
      .then((res) => setDbHealth(res))
      .catch(() => setDbHealth(null));
  }, []);

  const handleRefreshToken = async () => {
    setRefreshingToken(true);
    try {
      const res = await api.refresh();
      setStoredToken(res.access_token);
      onNotify('Renewed JWT session token');
    } catch (err: any) {
      onNotify(err?.message || 'Failed to renew session token', 'error');
    } finally {
      setRefreshingToken(false);
    }
  };

  const counts = (dbHealth?.counts as Record<string, number> | undefined) ?? undefined;
  const constraints = (dbHealth?.unique_constraints as string[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          System Settings &amp; Academic Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Session credentials, institutional grading tuple, and live relational schema integrity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0F1E3D]">
                <ShieldCheck className="w-5 h-5" />
                <h2 className="font-display text-base font-semibold">Active Session Profile</h2>
              </div>
              <button
                type="button"
                onClick={handleRefreshToken}
                disabled={refreshingToken}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {refreshingToken ? 'Renewing...' : 'Refresh JWT'}
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Faculty Name</span>
                <span className="font-medium text-slate-900">{currentUser.username}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email</span>
                <span className="font-mono text-xs text-slate-700">{currentUser.email}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Access Role</span>
                <span className="font-mono text-xs font-semibold text-[#5B3DF5]">
                  {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#0F1E3D]">
              <Database className="w-5 h-5" />
              <h2 className="font-display text-base font-semibold">
                Relational Database Health
              </h2>
            </div>
            {!dbHealth ? (
              <p className="text-xs text-slate-500">Inspecting live SQL schema...</p>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Engine</span>
                  <span className="font-mono text-slate-800">{String(dbHealth.engine || 'SQL')}</span>
                </div>
                {counts && (
                  <div className="grid grid-cols-5 gap-2 pt-1 text-center">
                    {Object.entries(counts).map(([tbl, cnt]) => (
                      <div key={tbl} className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                        <p className="text-[11px] text-slate-500 capitalize">{tbl}</p>
                        <p className="font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                          {cnt}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {constraints.length > 0 && (
                  <div className="pt-2">
                    <p className="text-slate-500 mb-1">Active Constraints:</p>
                    <p className="font-mono text-[11px] text-slate-700">
                      {constraints.join(' · ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Configured Grade Scale (Python Tuple)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable <code className="font-mono">GRADE_RANGES</code> tuple applied by{' '}
              <code className="font-mono">grade_calculator.py</code> across all examinations.
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium">Percentage Range</th>
                <th className="text-left px-4 py-2.5 font-medium">Grade</th>
                <th className="text-left px-4 py-2.5 font-medium">Descriptor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs tabular-nums">
              <tr>
                <td className="px-4 py-3">90% – 100%</td>
                <td className="px-4 py-3 font-bold">A+</td>
                <td className="px-4 py-3 font-sans text-slate-600">Outstanding</td>
              </tr>
              <tr>
                <td className="px-4 py-3">80% – 89.9%</td>
                <td className="px-4 py-3 font-bold">A</td>
                <td className="px-4 py-3 font-sans text-slate-600">Excellent</td>
              </tr>
              <tr>
                <td className="px-4 py-3">70% – 79.9%</td>
                <td className="px-4 py-3 font-bold">B</td>
                <td className="px-4 py-3 font-sans text-slate-600">Very Good</td>
              </tr>
              <tr>
                <td className="px-4 py-3">60% – 69.9%</td>
                <td className="px-4 py-3 font-bold">C</td>
                <td className="px-4 py-3 font-sans text-slate-600">Good</td>
              </tr>
              <tr>
                <td className="px-4 py-3">50% – 59.9%</td>
                <td className="px-4 py-3 font-bold">D</td>
                <td className="px-4 py-3 font-sans text-slate-600">Pass</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Below 50% or Any Subject Fail</td>
                <td className="px-4 py-3 font-bold text-red-600">F</td>
                <td className="px-4 py-3 font-sans text-red-600">Needs Improvement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
