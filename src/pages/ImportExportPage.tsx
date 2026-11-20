import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { AuthUser } from '../types';

interface ImportExportPageProps {
  currentUser: AuthUser;
  selectedExamId: number;
  onDataChanged: () => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}

function downloadTemplate(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const ImportExportPage: React.FC<ImportExportPageProps> = ({
  currentUser,
  selectedExamId,
  onDataChanged,
  onNotify,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [marksFile, setMarksFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<'students' | 'marks' | null>(null);
  const [report, setReport] = useState<{
    kind: string;
    processed: number;
    totalValid: number;
    errors: string[];
    errorReportCsv?: string;
  } | null>(null);

  const handleUploadStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFile) return;
    setUploading('students');
    setReport(null);
    try {
      const res = await api.importStudentsCSV(studentFile);
      setReport({
        kind: 'Students CSV Import',
        processed: res.inserted,
        totalValid: res.total_valid,
        errors: res.errors,
        errorReportCsv: res.error_report_csv,
      });
      onNotify(`Imported ${res.inserted} student record(s) via Python CSV DictReader`);
      onDataChanged();
      setStudentFile(null);
    } catch (err: any) {
      onNotify(err?.message || 'Student import failed', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleUploadMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marksFile) return;
    setUploading('marks');
    setReport(null);
    try {
      const res = await api.importMarksCSV(marksFile);
      setReport({
        kind: 'Marks CSV Import',
        processed: res.upserted,
        totalValid: res.total_valid,
        errors: res.errors,
        errorReportCsv: res.error_report_csv,
      });
      onNotify(`Processed ${res.upserted} marks record(s) via Python CSV DictReader`);
      onDataChanged();
      setMarksFile(null);
    } catch (err: any) {
      onNotify(err?.message || 'Marks import failed', 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleExport = async (type: 'students' | 'marks' | 'results') => {
    try {
      await api.downloadExportCSV(type, selectedExamId);
      onNotify(`Generated and downloaded ${type} CSV via Python DictWriter`);
    } catch (err: any) {
      onNotify(err?.message || 'CSV export failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          CSV File Processing (Import &amp; Export)
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Powered by Python&apos;s <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">csv.DictReader</code> and{' '}
          <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">csv.DictWriter</code> with row-level validation.
        </p>
      </div>

      {/* Import Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleUploadStudents}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Import Students CSV
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Headers: <span className="font-mono">roll_no,name,course,branch,semester</span> (optional{' '}
                <span className="font-mono">email</span>)
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadTemplate(
                  'students_template.csv',
                  'roll_no,name,email,course,branch,semester\n2026011,Kavya Nair,kavya.nair@acadledger.edu,B.Tech,CSE,3\n2026012,Siddharth Verma,siddharth.v@acadledger.edu,B.Tech,AIML,3\n'
                )
              }
              className="text-xs font-medium text-[#5B3DF5] hover:underline whitespace-nowrap"
            >
              Download Sample
            </button>
          </div>

          <input
            type="file"
            accept=".csv"
            disabled={!isAdmin}
            onChange={(e) => setStudentFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
          />

          <div className="flex items-center justify-between pt-2">
            {!isAdmin && (
              <span className="text-xs text-amber-700">Admin role required for student imports</span>
            )}
            <button
              type="submit"
              disabled={!isAdmin || !studentFile || uploading !== null}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4C30D6] disabled:opacity-50 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading === 'students' ? 'Processing CSV...' : 'Import Students'}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleUploadMarks}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Import Examination Marks CSV
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Headers: <span className="font-mono">roll_no,subject_code,exam_name,marks</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                downloadTemplate(
                  'marks_template.csv',
                  'roll_no,subject_code,exam_name,marks\n2026001,PY301,End-Semester Finals 2026,93\n2026002,PY301,End-Semester Finals 2026,97\n'
                )
              }
              className="text-xs font-medium text-[#5B3DF5] hover:underline whitespace-nowrap"
            >
              Download Sample
            </button>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setMarksFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!marksFile || uploading !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-[#5B3DF5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4C30D6] disabled:opacity-50 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading === 'marks' ? 'Processing CSV...' : 'Import Marks'}
            </button>
          </div>
        </form>
      </div>

      {/* Validation & Error Report */}
      {report && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-display text-base font-semibold text-slate-900">
              {report.kind} Summary
            </h3>
          </div>
          <p className="text-sm text-slate-700 font-mono tabular-nums">
            Records committed to database: <strong>{report.processed}</strong> (Validated rows:{' '}
            {report.totalValid})
          </p>
          {report.errors.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <AlertCircle className="w-4 h-4" />
                  Row Validation Warnings ({report.errors.length})
                </div>
                {report.errorReportCsv && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadTemplate(
                        `import_error_report_${Date.now()}.csv`,
                        report.errorReportCsv || ''
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-900 hover:bg-amber-100"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Error Report CSV
                  </button>
                )}
              </div>
              <ul className="list-disc pl-5 text-xs text-amber-800 space-y-1">
                {report.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet className="w-5 h-5 text-[#0F1E3D]" />
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Export Academic CSV Reports
            </h2>
            <p className="text-xs text-slate-500">
              Generated dynamically in Python and archived in <span className="font-mono">backend/exports/</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => handleExport('students')}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-[#5B3DF5] transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">Student Directory</p>
              <p className="text-xs text-slate-500">All enrolled student records</p>
            </div>
            <Download className="w-4 h-4 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={() => handleExport('marks')}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-[#5B3DF5] transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">Subject Marks Sheet</p>
              <p className="text-xs text-slate-500">Active exam raw marks</p>
            </div>
            <Download className="w-4 h-4 text-slate-500" />
          </button>

          <button
            type="button"
            onClick={() => handleExport('results')}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left hover:border-[#5B3DF5] transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">Final Results Report</p>
              <p className="text-xs text-slate-500">Totals, %, grades &amp; pass status</p>
            </div>
            <Download className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
};
