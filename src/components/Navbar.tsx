import React from 'react';
import { Menu, Sparkles } from 'lucide-react';

interface NavbarProps {
  pageTitle: string;
  onOpenMobileMenu: () => void;
  onOpenAiDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  onOpenMobileMenu,
  onOpenAiDrawer,
}) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm truncate">
          <span className="text-slate-400">AcadLedger</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-900 truncate">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={onOpenAiDrawer}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5B3DF5] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4C30D6] transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI Advisor
        </button>
      </div>
    </header>
  );
};
