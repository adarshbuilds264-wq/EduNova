import React from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  loadingText?: string;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  loadingText = 'Loading records...',
  emptyState,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
        {loadingText}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-sm text-slate-500">
        {emptyState ?? 'No records available.'}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`font-medium px-4 py-3 first:pl-6 last:pr-6 ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 first:pl-6 last:pr-6 ${
                      col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.className ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
