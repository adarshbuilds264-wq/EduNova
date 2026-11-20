import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import type { AuthUser, Subject } from '../types';

interface SubjectsPageProps {
  currentUser: AuthUser;
  onDataChanged: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_SUBJ = {
  subject_name: '',
  subject_code: '',
  max_marks: 100,
  passing_marks: 40,
  semester: 3,
};

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  currentUser,
  onDataChanged,
  onNotify,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState(EMPTY_SUBJ);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSubjects(await api.getSubjects());
    } catch (err: any) {
      onNotify(err?.message || 'Failed to load subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_SUBJ);
    setModalOpen(true);
  };

  const openEdit = (sub: Subject) => {
    setEditing(sub);
    setForm({
      subject_name: sub.subject_name,
      subject_code: sub.subject_code,
      max_marks: sub.max_marks,
      passing_marks: sub.passing_marks,
      semester: sub.semester,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateSubject(editing.id, form);
        onNotify(`Updated subject ${form.subject_code}`);
      } else {
        await api.createSubject(form);
        onNotify(`Added subject ${form.subject_code}`);
      }
      setModalOpen(false);
      await load();
      onDataChanged();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to save subject', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub: Subject) => {
    try {
      await api.deleteSubject(sub.id);
      onNotify(`Deleted subject ${sub.subject_code}`);
      await load();
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
            Subject Curriculum
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure course subjects, semester assignments, maximum marks, and passing criteria.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">No subjects configured yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Subject Code</th>
                  <th className="text-left font-medium px-4 py-3">Subject Name</th>
                  <th className="text-right font-medium px-4 py-3">Semester</th>
                  <th className="text-right font-medium px-4 py-3">Maximum Marks</th>
                  <th className="text-right font-medium px-4 py-3">Passing Marks</th>
                  {isAdmin && <th className="text-right font-medium px-6 py-3">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-xs font-semibold text-[#0F1E3D]">
                      {sub.subject_code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{sub.subject_name}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-700">
                      {sub.semester}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">
                      {sub.max_marks}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-600">
                      {sub.passing_marks}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(sub)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sub)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {editing ? 'Update Subject' : 'Add Subject'}
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
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={form.subject_name}
                  onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    value={form.subject_code}
                    onChange={(e) => setForm({ ...form, subject_code: e.target.value.toUpperCase() })}
                    placeholder="CS305"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={form.max_marks}
                    onChange={(e) => setForm({ ...form, max_marks: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    min={0}
                    max={form.max_marks}
                    required
                    value={form.passing_marks}
                    onChange={(e) => setForm({ ...form, passing_marks: Number(e.target.value) })}
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
                  {saving ? 'Saving...' : 'Save Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
