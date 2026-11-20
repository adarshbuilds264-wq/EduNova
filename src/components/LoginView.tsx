import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { api, setStoredToken } from '../services/api';
import type { AuthUser } from '../types';

interface LoginViewProps {
  onSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('admin@acadledger.edu');
  const [password, setPassword] = useState('Admin@2026');
  const [role, setRole] = useState<'ADMIN' | 'TEACHER'>('TEACHER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === 'login'
          ? await api.login(email, password)
          : await api.register(username, email, password, role);
      setStoredToken(res.access_token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (presetEmail: string, presetPassword: string) => {
    setError(null);
    setEmail(presetEmail);
    setPassword(presetPassword);
    setLoading(true);
    try {
      const res = await api.login(presetEmail, presetPassword);
      setStoredToken(res.access_token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#F4F6FA]">
      {/* Left Institutional Brand Column */}
      <div className="lg:col-span-5 bg-[#0F1E3D] text-white p-10 lg:p-14 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#5B3DF5] flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">AcadLedger</span>
        </div>

        <div className="my-12 max-w-md space-y-5">
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-balance">
            Smart, simple, and accurate academic performance management.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Manage student cohorts, subject curricula, examinations, marks verification, CSV bulk processing, 3D academic analytics, and AI-assisted evaluations in one unified workspace.
          </p>

          <div className="pt-4 border-t border-slate-700/80 grid grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-semibold text-white">Python Analytics Engine</p>
              <p className="text-slate-400 mt-1">Lists, Tuples, Dictionaries &amp; CSV DictReader processing</p>
            </div>
            <div>
              <p className="font-semibold text-white">Role-Based Security</p>
              <p className="text-slate-400 mt-1">Signed JWT sessions with Admin &amp; Teacher permissions</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Student Marks Management System · Academic Edition
        </p>
      </div>

      {/* Right Auth Form Column */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                {mode === 'login' ? 'Sign in to workspace' : 'Create faculty account'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {mode === 'login'
                  ? 'Access your institutional marks ledger and analytics.'
                  : 'Register an administrator or teacher profile.'}
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Prof. Rajesh Kulkarni"
                    className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@acadledger.edu"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'TEACHER')}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#5B3DF5]"
                >
                  <option value="TEACHER">Teacher (Marks Entry &amp; Results)</option>
                  <option value="ADMIN">Administrator (Full CRUD &amp; Users)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#5B3DF5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4C30D6] transition-colors disabled:opacity-60"
            >
              {loading
                ? 'Authenticating...'
                : mode === 'login'
                ? 'Sign In'
                : 'Create Account & Sign In'}
            </button>
          </form>

          {/* Instant Demo Credentials */}
          <div className="mt-7 pt-6 border-t border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => quickLogin('admin@acadledger.edu', 'Admin@2026')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-[#5B3DF5] transition-colors"
              >
                <div className="text-xs font-semibold text-slate-900">Admin Account</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">admin@acadledger.edu</div>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => quickLogin('teacher@acadledger.edu', 'Teacher@2026')}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-[#5B3DF5] transition-colors"
              >
                <div className="text-xs font-semibold text-slate-900">Teacher Account</div>
                <div className="text-[11px] text-slate-500 font-mono truncate">teacher@acadledger.edu</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
