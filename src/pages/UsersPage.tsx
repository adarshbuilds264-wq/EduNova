import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import type { AuthUser } from '../types';

interface UsersPageProps {
  currentUser: AuthUser;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ currentUser, onNotify }) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'TEACHER' as 'ADMIN' | 'TEACHER',
  });
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await api.getUsers());
    } catch (err: any) {
      onNotify(err?.message || 'Failed to load user accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createUser(form);
      onNotify(`Created ${form.role.toLowerCase()} account for ${form.username}`);
      setModalOpen(false);
      setForm({ username: '', email: '', password: '', role: 'TEACHER' });
      loadUsers();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to create user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: AuthUser) => {
    try {
      await api.deleteUser(u.id);
      onNotify(`Removed user ${u.username}`);
      loadUsers();
    } catch (err: any) {
      onNotify(err?.message || 'Failed to remove user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            User &amp; Role Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create or remove Admin and Teacher credentials with bcrypt password hashing and RBAC enforcement.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Faculty Account
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading user accounts...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
                <tr>
                  <th className="text-left font-medium px-6 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Email</th>
                  <th className="text-left font-medium px-4 py-3">Role</th>
                  <th className="text-right font-medium px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {u.username}
                      {u.id === currentUser.id && (
                        <span className="ml-2 text-xs text-slate-400">(Active Session)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0F1E3D]">
                      {u.role}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          title="Delete account"
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
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
                Create Faculty Account
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'ADMIN' | 'TEACHER' })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                >
                  <option value="TEACHER">TEACHER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#5B3DF5] px-4 py-2 text-sm font-medium text-white hover:bg-[#4C30D6]"
                >
                  {saving ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
