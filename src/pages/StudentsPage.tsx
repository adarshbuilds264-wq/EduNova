import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react';
import { api } from '../services/api';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import type { AuthUser, Student } from '../types';

interface StudentsPageProps {
  currentUser: AuthUser;
  onDataChanged: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const StudentsPage: React.FC<StudentsPageProps> = ({
  currentUser,
  onDataChanged,
  onNotify,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const list = await api.getStudents({ search, branch: branchFilter });
      setStudents(list);
    } catch (err: any) {
      onNotify(err?.message || 'Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, branchFilter]);

  const handleDelete = async (s: Student) => {
    try {
      await api.deleteStudent(s.id);
      onNotify(`Deleted student ${s.name}`);
      await fetchStudents();
      onDataChanged();
    } catch (err: any) {
      onNotify(err?.message || 'Delete failed', 'error');
    }
  };

  const columns: DataTableColumn<Student>[] = [
    {
      key: 'roll_no',
      header: 'Roll Number',
      className: 'font-mono text-xs text-slate-700 tabular-nums',
      render: (s) => s.roll_no,
    },
    {
      key: 'name',
      header: 'Student Name',
      className: 'font-medium text-slate-900',
      render: (s) => (
        <Link to={`/students/${s.id}`} className="hover:text-[#5B3DF5] hover:underline">
          {s.name}
        </Link>
      ),
    },
    {
      key: 'course',
      header: 'Course / Branch',
      className: 'text-slate-600',
      render: (s) => `${s.course} · ${s.branch}`,
    },
    {
      key: 'semester',
      header: 'Semester',
      align: 'right',
      className: 'font-mono tabular-nums text-slate-700',
      render: (s) => s.semester,
    },
    {
      key: 'email',
      header: 'Email',
      className: 'text-xs text-slate-500',
      render: (s) => s.email,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="inline-flex items-center gap-2">
          <Link
            to={`/students/${s.id}`}
            title="View academic profile"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            <Eye className="w-3.5 h-3.5" />
            Profile
          </Link>
          {isAdmin && (
            <>
              <Link
                to={`/students/${s.id}/edit`}
                title="Edit student"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(s)}
                title="Delete student"
                className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Student Directory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage enrolled students, open academic profiles, and filter by branch.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/students/add"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6] transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number, or email..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {['ALL', 'CSE', 'AIML', 'ECE'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBranchFilter(b)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                branchFilter === b
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {b === 'ALL' ? 'All Branches' : b}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        data={students}
        columns={columns}
        rowKey={(s) => s.id}
        loading={loading}
        loadingText="Loading student records..."
        emptyState={
          <div className="space-y-3">
            <p className="text-sm text-slate-600">No students match the current filter.</p>
            {isAdmin && (
              <Link
                to="/students/add"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B3DF5] px-4 py-2 text-xs font-medium text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Add First Student
              </Link>
            )}
          </div>
        }
      />
    </div>
  );
};
