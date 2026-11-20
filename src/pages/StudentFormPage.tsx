import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../services/api';

interface StudentFormPageProps {
  onDataChanged: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_FORM = {
  name: '',
  roll_no: '',
  email: '',
  course: 'B.Tech',
  branch: 'CSE',
  semester: 3,
};

export const StudentFormPage: React.FC<StudentFormPageProps> = ({
  onDataChanged,
  onNotify,
}) => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    api
      .getStudent(Number(id))
      .then((s) => {
        if (!active) return;
        setForm({
          name: s.name,
          roll_no: s.roll_no,
          email: s.email,
          course: s.course,
          branch: s.branch,
          semester: s.semester,
        });
      })
      .catch((err: any) => {
        onNotify(err?.message || 'Unable to load student record', 'error');
        navigate('/students');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await api.updateStudent(Number(id), form);
        onNotify(`Updated student ${form.name}`);
      } else {
        await api.createStudent(form);
        onNotify(`Added student ${form.name}`);
      }
      onDataChanged();
      navigate('/students');
    } catch (err: any) {
      onNotify(err?.message || 'Failed to save student record', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/students"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Student Directory
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Student Record' : 'Enroll New Student'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEdit
              ? 'Modify academic details while preserving unique roll number constraints.'
              : 'Register a new student in the SQL directory.'}
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Loading student details...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={form.roll_no}
                  onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
                  placeholder="e.g. 2026015"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="student@acadledger.edu"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Course
                </label>
                <input
                  type="text"
                  required
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Branch
                </label>
                <select
                  value={form.branch}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                >
                  <option value="CSE">CSE</option>
                  <option value="AIML">AIML</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                  <option value="ME">ME</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Semester
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                to="/students"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6] disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Student'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
