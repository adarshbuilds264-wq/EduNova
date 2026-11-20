import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Users,
  BookOpen,
  CalendarDays,
  ClipboardEdit,
  Award,
  BarChart3,
  FileSpreadsheet,
  MessageSquare,
  Code2,
  UserCog,
  Settings,
  LogOut,
  X,
  GraduationCap,
} from 'lucide-react';
import type { AuthUser } from '../types';

export interface NavRouteItem {
  to: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  adminOnly?: boolean;
}

export const SIDEBAR_NAV_ITEMS: NavRouteItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/observatory-3d', label: '3D Observatory', icon: Box },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/examinations', label: 'Examinations', icon: CalendarDays },
  { to: '/marks', label: 'Marks Entry', icon: ClipboardEdit },
  { to: '/results', label: 'Results & Grades', icon: Award },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/import-export', label: 'CSV Import / Export', icon: FileSpreadsheet },
  { to: '/ai-advisor', label: 'AI Advisor Chat', icon: MessageSquare },
  { to: '/python-inspector', label: 'Python Inspector', icon: Code2 },
  { to: '/users', label: 'User Management', icon: UserCog, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  user: AuthUser;
  mobileMenuOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  mobileMenuOpen,
  onCloseMobile,
  onLogout,
}) => {
  const visibleItems = SIDEBAR_NAV_ITEMS.filter(
    (item) => !item.adminOnly || user.role === 'ADMIN'
  );

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1E3D] text-white flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#5B3DF5] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-base font-bold tracking-tight whitespace-nowrap">
              AcadLedger
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-300 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#5B3DF5] text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 shrink-0">
          <div className="mb-3">
            <p className="text-sm font-semibold text-white truncate">{user.username}</p>
            <p className="text-xs text-slate-400 font-mono truncate">
              {user.role} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
