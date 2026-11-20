import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  valueClassName?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  valueClassName = 'text-slate-900',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-bold tabular-nums ${valueClassName}`}>
        {value}
      </p>
      {subtitle && <p className="mt-2 text-xs text-slate-500 tabular-nums">{subtitle}</p>}
    </div>
  );
};
