import React, { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '../services/api';
import type { Examination, MarkRecord, Student, Subject } from '../types';

interface MarksPageProps {
  examinations: Examination[];
  selectedExamId: number;
  onSelectExam: (id: number) => void;
  onDataChanged: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

function previewGrade(pct: number, hasFailedSubject: boolean): string {
  if (hasFailedSubject || pct < 50) return 'F';
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  return 'D';
}

export const MarksPage: React.FC<MarksPageProps> = ({
  examinations,
  selectedExamId,
  onSelectExam,
  onDataChanged,
  onNotify,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [draftScores, setDraftScores] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    try {
      const [stList, subList, mkList] = await Promise.all([
        api.getStudents(),
        api.getSubjects(),
        api.getMarks(selectedExamId),
      ]);
      setStudents(stList);
      setSubjects(subList);
      setMarks(mkList);
      if (stList.length > 0 && (!selectedStudentId || !stList.some((s) => s.id === selectedStudentId))) {
        setSelectedStudentId(stList[0].id);
      }
    } catch (err: any) {
      onNotify(err?.message || 'Failed to load marks workspace', 'error');
    }
  };

  useEffect(() => {
    loadAll();
  }, [selectedExamId]);

  useEffect(() => {
    const map: Record<number, string> = {};
    for (const sub of subjects) {
      const found = marks.find(
        (m) => m.student_id === selectedStudentId && m.subject_id === sub.id
      );
      map[sub.id] = found ? String(found.obtained_marks) : '';
    }
    setDraftScores(map);
  }, [selectedStudentId, marks, subjects]);

  const liveSummary = useMemo(() => {
    let obtained = 0;
    let maximum = 0;
    let failedCount = 0;
    let entered = 0;

    for (const sub of subjects) {
      const valStr = draftScores[sub.id];
      if (valStr !== undefined && valStr.trim() !== '') {
        const val = Number(valStr);
        if (!Number.isNaN(val)) {
          entered++;
          obtained += val;
          maximum += sub.max_marks;
          if (val < sub.passing_marks) failedCount++;
        }
      }
    }

    const pct = maximum > 0 ? (obtained / maximum) * 100 : 0;
    const grade = entered === 0 ? '—' : previewGrade(pct, failedCount > 0);
    const status = entered === 0 ? 'PENDING' : failedCount > 0 || pct < 50 ? 'FAIL' : 'PASS';
    return { obtained, maximum, pct, grade, status, failedCount, entered };
  }, [draftScores, subjects]);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    // Validate before sending
    for (const sub of subjects) {
      const raw = draftScores[sub.id];
      if (raw !== undefined && raw.trim() !== '') {
        const num = Number(raw);
        if (Number.isNaN(num) || num < 0 || num > sub.max_marks) {
          onNotify(
            `Invalid marks for ${sub.subject_name}: must be between 0 and ${sub.max_marks}`,
            'error'
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      for (const sub of subjects) {
        const raw = draftScores[sub.id];
        if (raw !== undefined && raw.trim() !== '') {
          await api.saveMark({
            student_id: selectedStudentId,
            subject_id: sub.id,
            exam_id: selectedExamId,
            obtained_marks: Number(raw),
          });
        }
      }
      onNotify('Student marks saved and results recalculated');
      await loadAll();
      onDataChanged();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Marks Entry &amp; Verification
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Enter or update subject-wise examination scores with live grade and passing rule verification.
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

          <select
            aria-label="Select student"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.roll_no} — {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Preview Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Selected Student</p>
          <p className="mt-1 font-display font-semibold text-slate-900 truncate">
            {selectedStudent?.name || '—'}
          </p>
          <p className="text-xs font-mono text-slate-500">
            {selectedStudent ? `${selectedStudent.roll_no} · ${selectedStudent.branch}` : ''}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Calculated Total</p>
          <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {liveSummary.obtained.toFixed(1)} / {liveSummary.maximum}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Projected Percentage</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#5B3DF5] tabular-nums">
            {liveSummary.pct.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Projected Grade &amp; Status</p>
          <p className="mt-1 font-mono text-2xl font-bold tabular-nums">
            <span className="text-slate-900 mr-2">{liveSummary.grade}</span>
            <span
              className={`text-sm ${
                liveSummary.status === 'PASS'
                  ? 'text-emerald-600'
                  : liveSummary.status === 'FAIL'
                  ? 'text-red-600'
                  : 'text-slate-400'
              }`}
            >
              {liveSummary.status}
            </span>
          </p>
        </div>
      </div>

      {/* Marks Form Table */}
      <form noValidate onSubmit={handleSaveAll} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            <tr>
              <th className="text-left font-medium px-6 py-3">Subject Code</th>
              <th className="text-left font-medium px-4 py-3">Subject Name</th>
              <th className="text-right font-medium px-4 py-3">Passing / Max</th>
              <th className="text-right font-medium px-4 py-3">Obtained Marks</th>
              <th className="text-right font-medium px-6 py-3">Subject Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((sub) => {
              const rawVal = draftScores[sub.id] ?? '';
              const numVal = rawVal.trim() === '' ? null : Number(rawVal);
              const isValid = numVal !== null && !Number.isNaN(numVal) && numVal >= 0 && numVal <= sub.max_marks;
              const isPassed = isValid && numVal! >= sub.passing_marks;
              return (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-xs font-semibold text-[#0F1E3D]">
                    {sub.subject_code}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{sub.subject_name}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-500">
                    {sub.passing_marks} / {sub.max_marks}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      max={sub.max_marks}
                      value={rawVal}
                      onChange={(e) =>
                        setDraftScores((prev) => ({ ...prev, [sub.id]: e.target.value }))
                      }
                      placeholder="0–100"
                      className="w-28 text-right rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                    />
                  </td>
                  <td className="px-6 py-3 text-right text-xs font-semibold">
                    {numVal === null ? (
                      <span className="text-slate-400">Not Entered</span>
                    ) : !isValid ? (
                      <span className="text-red-600">Out of Range</span>
                    ) : isPassed ? (
                      <span className="text-emerald-600">PASS</span>
                    ) : (
                      <span className="text-red-600">FAIL (Below {sub.passing_marks})</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Strict validation: overall PASS requires passing every entered subject and achieving at least 50%.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4C30D6] transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Marks...' : 'Save Student Marks'}
          </button>
        </div>
      </form>
    </div>
  );
};
