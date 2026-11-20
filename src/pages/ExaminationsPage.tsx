import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Calendar } from 'lucide-react';
import { api } from '../services/api';
import type { AuthUser, Examination } from '../types';

interface ExaminationsPageProps {
  currentUser: AuthUser;
  examinations: Examination[];
  selectedExamId: number;
  onSelectExam: (id: number) => void;
  onDataChanged: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const ExaminationsPage: React.FC<ExaminationsPageProps> = ({
  currentUser,
  examinations,
  selectedExamId,
  onSelectExam,
  onDataChanged,
  onNotify,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Examination | null>(null);
  const [form, setForm] = useState({ exam_name: '', semester: 3, exam_date: '2026-11-20' });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm({ exam_name: '', semester: 3, exam_date: '2026-11-20' });
    setModalOpen(true);
  };

  const openEdit = (ex: Examination) => {
    setEditing(ex);
    setForm({ exam_name: ex.exam_name, semester: ex.semester, exam_date: ex.exam_date });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateExamination(editing.id, form);
        onNotify(`Updated ${form.exam_name}`);
      } else {
        await api.createExamination(form);
        onNotify(`Created ${form.exam_name}`);
      }
      setModalOpen(false);
      onDataChanged();
    } catch (err: any) {
      onNotify(err?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ex: Examination) => {
    try {
      await api.deleteExamination(ex.id);
      onNotify(`Deleted examination ${ex.exam_name}`);
      onDataChanged();
    } catch (err: any) {
      onNotify(err?.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Examination Cycles
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Schedule academic assessments and select the active examination cycle across dashboards.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Examination
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              <tr>
                <th className="text-left font-medium px-6 py-3">Examination Title</th>
                <th className="text-right font-medium px-4 py-3">Semester</th>
                <th className="text-left font-medium px-4 py-3">Exam Date</th>
                <th className="text-left font-medium px-4 py-3">Workspace State</th>
                <th className="text-right font-medium px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examinations.map((ex) => {
                const isActive = ex.id === selectedExamId;
                return (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{ex.exam_name}</td>
                    <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                      {ex.semester}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600 tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {ex.exam_date}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {isActive ? (
                        <span className="font-semibold text-[#5B3DF5]">Active Exam</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectExam(ex.id)}
                          className="text-slate-500 hover:text-slate-900 underline"
                        >
                          Set as Active
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {isAdmin && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(ex)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(ex)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editing ? 'Edit Examination' : 'Create Examination'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Examination Name
                </label>
                <input
                  type="text"
                  required
                  value={form.exam_name}
                  onChange={(e) => setForm({ ...form, exam_name: e.target.value })}
                  placeholder="Unit Test II 2026"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={form.exam_date}
                    onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
