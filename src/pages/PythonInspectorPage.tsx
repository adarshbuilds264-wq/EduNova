import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const PythonInspectorPage: React.FC = () => {
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setPayload(await api.inspectPythonStructures());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Python Data Structures Runtime Inspector
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Live output executed by <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">python3 python_data_structures.py</code> directly against SQLite records.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Re-evaluate Python Script
        </button>
      </div>

      {payload && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              1. Tuples (Immutable Grade Ranges &amp; Branches)
            </h2>
            <p className="text-xs text-slate-500">
              <code className="font-mono">GRADE_RANGES</code> &amp; <code className="font-mono">ACADEMIC_BRANCHES</code> stored as Python tuples.
            </p>
            <pre className="rounded-lg bg-[#0F1E3D] text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
              {JSON.stringify(
                {
                  grade_ranges_tuple: payload.grade_ranges_tuple,
                  academic_branches_tuple: payload.academic_branches_tuple,
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              2. Lists (Cohort Marks Matrix)
            </h2>
            <p className="text-xs text-slate-500">
              Python lists aggregating subject marks per student for <code className="font-mono">sum()</code>, <code className="font-mono">max()</code>, <code className="font-mono">min()</code>.
            </p>
            <pre className="rounded-lg bg-[#0F1E3D] text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(payload.all_marks_matrix_list, null, 2)}
            </pre>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              3. Dictionaries (Student Record Object)
            </h2>
            <p className="text-xs text-slate-500">
              Structured student dictionary mapping subject names to marks &amp; breakdown lists.
            </p>
            <pre className="rounded-lg bg-[#0F1E3D] text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(payload.sample_student_dict, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
