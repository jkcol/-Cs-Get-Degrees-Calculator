import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Upload,
  FileText,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  parseTranscriptCsv,
  groupBySemester,
  type TranscriptCourseRow,
} from '../lib/transcript';

const SAMPLE_CSV = `Semester,Course,Credits,Grade
Fall 2023,CS 124,3,3.8
Fall 2023,MATH 221,4,3.5
Spring 2024,CS 128,3,3.6
Spring 2024,CS 173,4,3.2
Fall 2024,CS 225,4,3.4
Fall 2024,STAT 400,3,3.0`;

export function DegreeProgress() {
  const [rawText, setRawText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [rows, setRows] = useState<TranscriptCourseRow[]>([]);

  const semesters = useMemo(() => groupBySemester(rows), [rows]);

  const overall = useMemo(() => {
    if (rows.length === 0) return null;
    let p = 0;
    let c = 0;
    for (const r of rows) {
      p += r.gradeGpa * r.credits;
      c += r.credits;
    }
    return { gpa: c > 0 ? p / c : 0, credits: c };
  }, [rows]);

  const loadFromText = (text: string) => {
    setParseError(null);
    try {
      const parsed = parseTranscriptCsv(text);
      if (parsed.length === 0) {
        setParseError('No valid rows found. Use CSV with columns: Semester, Course, Credits, Grade (e.g. 3.5 or B+).');
        setRows([]);
        return;
      }
      setRows(parsed);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Could not parse');
      setRows([]);
    }
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const t = typeof reader.result === 'string' ? reader.result : '';
      setRawText(t);
      loadFromText(t);
    };
    reader.readAsText(f);
    e.target.value = '';
  };

  const nextSteps = () => {
    if (!overall) {
      return 'Upload a transcript CSV to see your cumulative GPA and semester-by-semester breakdown. Then you can compare against your major requirements (coming soon).';
    }
    if (overall.gpa >= 3.5) {
      return 'Strong cumulative GPA. Consider research, internships, or advanced electives in your focus area.';
    }
    if (overall.gpa >= 3.0) {
      return 'Solid standing. Focus on core CS grades next term and balance harder courses with one lighter elective.';
    }
    return 'Prioritize grade recovery in required courses; use office hours and early exam prep. Consider repeating only if policy allows and credits warrant it.';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="text-[#FF5F05]" size={22} />
          <h2 className="text-2xl font-bold text-slate-800">Degree Progress</h2>
        </div>
        <p className="text-slate-600 text-sm max-w-3xl">
          Upload a transcript (CSV) or paste the same format below. We compute <strong>semester GPA</strong>,{' '}
          <strong>cumulative GPA</strong>, and credit totals per term. Grades can be numbers (0–4) or letters (A, B+, etc.).
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <Upload size={16} className="text-[#FF5F05]" />
              Upload file (.csv or .txt)
            </label>
            <input
              type="file"
              accept=".csv,.txt,text/csv"
              onChange={onFile}
              className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#13294B] file:text-white file:font-semibold hover:file:bg-[#1a3a66]"
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                setRawText(SAMPLE_CSV);
                loadFromText(SAMPLE_CSV);
              }}
              className="text-sm font-bold text-[#FF5F05] hover:underline"
            >
              Load example transcript
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Format: <code className="bg-slate-100 px-1 rounded">Semester,Course,Credits,Grade</code> — one course per line.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
            <FileText size={16} className="text-[#FF5F05]" />
            Or paste CSV
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={6}
            placeholder={SAMPLE_CSV}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-[#FF5F05] focus:border-transparent outline-none"
          />
          <button
            type="button"
            onClick={() => loadFromText(rawText)}
            className="mt-2 px-4 py-2 rounded-lg bg-[#13294B] text-white text-sm font-bold hover:bg-[#1a3a66] transition-colors"
          >
            Parse transcript
          </button>
          {parseError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} /> {parseError}
            </p>
          )}
        </div>
      </div>

      {overall && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Cumulative GPA</p>
            <p className="text-3xl font-black text-[#13294B] mt-1">{overall.gpa.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Across {overall.credits.toFixed(0)} graded credits</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Terms on record</p>
            <p className="text-3xl font-black text-[#13294B] mt-1">{semesters.length}</p>
            <p className="text-xs text-slate-400 mt-1">Semesters in transcript</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex gap-3">
            <TrendingUp className="text-emerald-600 shrink-0 mt-0.5" size={22} />
            <div>
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider">What to do next</p>
              <p className="text-sm text-emerald-900/90 mt-1 leading-snug">{nextSteps()}</p>
            </div>
          </div>
        </div>
      )}

      {semesters.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="text-[#FF5F05]" size={20} />
            Semester breakdown
          </h3>
          {semesters.map((block) => (
            <div
              key={block.semester}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[#13294B]">{block.semester}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-600">
                    Term GPA:{' '}
                    <strong className="text-slate-900">{block.semesterGpa.toFixed(2)}</strong>
                  </span>
                  <span className="text-slate-600">
                    Cum. GPA:{' '}
                    <strong className="text-[#FF5F05]">{block.cumulativeGpa.toFixed(2)}</strong>
                  </span>
                  <span className="text-slate-400 text-xs">
                    Credits (term / total): {block.semesterCredits} / {block.cumulativeCredits}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="px-4 py-2 font-bold">Course</th>
                      <th className="px-4 py-2 font-bold">Credits</th>
                      <th className="px-4 py-2 font-bold">Grade (4.0)</th>
                      <th className="px-4 py-2 font-bold text-right">Quality pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((r, idx) => (
                      <tr key={`${r.courseCode}-${idx}`} className="border-b border-slate-50 hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-medium text-slate-800">{r.courseCode}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.credits}</td>
                        <td className="px-4 py-2.5 text-slate-600">{r.gradeGpa.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">
                          {(r.gradeGpa * r.credits).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-800">
                      <td className="px-4 py-2" colSpan={2}>
                        Semester average
                      </td>
                      <td className="px-4 py-2">{block.semesterGpa.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">
                        {(block.semesterGpa * block.semesterCredits).toFixed(1)} pts / {block.semesterCredits} cr
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {rows.length === 0 && !parseError && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500 text-sm">
          <CheckCircle2 className="mx-auto mb-2 text-slate-300" size={32} />
          No transcript loaded yet. Upload a CSV or paste rows, then click <strong>Parse transcript</strong>.
        </div>
      )}
    </div>
  );
}
