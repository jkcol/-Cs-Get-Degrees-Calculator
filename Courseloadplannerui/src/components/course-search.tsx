import React, { useMemo, useState } from 'react';
import { Search, Plus, Star, X, Loader2 } from 'lucide-react';
import type { Course, CourseCatalogItem } from '../types/course';

interface CourseSearchProps {
  onAddCourse: (course: Course) => void;
  selectedCourses: Course[];
  catalog: CourseCatalogItem[];
  apiBase: string;
}

/**
 * Search must NOT use raw substring on title + code together: letters "c" and "s" appear
 * inside words like "analyti**cs**" and "topi**cs**", so "cs" wrongly matched ACCY/ABE rows.
 * - CourseID / display code: match on compact strings (cs374, cs 225 → cs225).
 * - Title: word prefix only for short queries; phrase substring only for longer queries.
 */
function catalogItemMatchesQuery(c: CourseCatalogItem, rawQuery: string): boolean {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return true;
  const id = String(c.id ?? '').toLowerCase().replace(/\s/g, '');
  const code = String(c.code ?? '').toLowerCase().replace(/\s/g, '');
  const name = String(c.name ?? '').toLowerCase();
  const qCompact = q.replace(/\s/g, '');
  if (!qCompact) return true;

  if (id.includes(qCompact) || code.includes(qCompact)) return true;

  const words = name.split(/[^a-z0-9]+/).filter(Boolean);
  for (const w of words) {
    if (w.startsWith(q)) return true;
  }
  if (q.length >= 4 && name.includes(q)) return true;
  return false;
}

/** Prefer subject-code matches (CS…) before title-only matches when both hit. */
function catalogMatchRank(c: CourseCatalogItem, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  const qCompact = q.replace(/\s/g, '');
  if (!qCompact) return 0;
  const id = String(c.id ?? '').toLowerCase().replace(/\s/g, '');
  const code = String(c.code ?? '').toLowerCase().replace(/\s/g, '');
  if (id.startsWith(qCompact) || code.startsWith(qCompact)) return 0;
  if (id.includes(qCompact) || code.includes(qCompact)) return 1;
  return 2;
}

export function CourseSearch({ onAddCourse, selectedCourses, catalog, apiBase }: CourseSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [pickerCourse, setPickerCourse] = useState<CourseCatalogItem | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState<string | null>(null);
  const [sections, setSections] = useState<Course[]>([]);

  const hasCourseInPlan = (courseId: string) =>
    selectedCourses.some((sc) => sc.courseId === courseId);

  const filteredCourses = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return catalog
      .filter((c) => catalogItemMatchesQuery(c, q) && !hasCourseInPlan(c.id))
      .sort((a, b) => {
        const ra = catalogMatchRank(a, q);
        const rb = catalogMatchRank(b, q);
        if (ra !== rb) return ra - rb;
        return String(a.id).localeCompare(String(b.id));
      })
      .slice(0, 25);
  }, [catalog, query, selectedCourses]);

  const openSectionPicker = async (item: CourseCatalogItem) => {
    setPickerCourse(item);
    setSectionsError(null);
    setSections([]);
    setSectionsLoading(true);
    try {
      const url = `${apiBase}/api/courses/${encodeURIComponent(item.id)}/sections`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (e) {
      setSectionsError(e instanceof Error ? e.message : 'Failed to load sections');
    } finally {
      setSectionsLoading(false);
    }
  };

  const closePicker = () => {
    setPickerCourse(null);
    setSections([]);
    setSectionsError(null);
  };

  const addSection = (section: Course) => {
    onAddCourse(section);
    closePicker();
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:w-80">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search courses (e.g. CS 225)"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#FF5F05] focus:border-transparent outline-none transition-all text-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {filteredCourses.length > 0 ? (
            <div className="py-1">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  onClick={() => openSectionPicker(course)}
                >
                  <div className="flex flex-col min-w-0 flex-1 mr-2">
                    <span className="font-bold text-sm text-[#13294B]">{course.code}</span>
                    <span className="text-xs text-slate-500 truncate">{course.name || '—'}</span>
                    <span className="text-[10px] text-[#FF5F05] font-medium mt-0.5">
                      Choose section →
                    </span>
                  </div>
                  <div className="p-1 bg-slate-100 rounded group-hover:bg-[#FF5F05] transition-colors">
                    <Plus size={14} className="text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No courses found matching "{query.trim()}"
            </div>
          )}
        </div>
      )}

      {isOpen && query.trim().length > 0 && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {pickerCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" onClick={closePicker}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 p-4 border-b border-slate-100 bg-slate-50">
              <div className="min-w-0">
                <h3 className="font-bold text-[#13294B] text-lg">{pickerCourse.code}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{pickerCourse.name}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">
                  Sections (instructor & GPA from database)
                </p>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="p-2 rounded-lg hover:bg-slate-200 text-slate-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-3 flex-1">
              {sectionsLoading && (
                <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
                  <Loader2 className="animate-spin" size={22} />
                  <span className="text-sm">Loading sections…</span>
                </div>
              )}
              {sectionsError && (
                <p className="text-sm text-red-600 text-center py-8 px-2">{sectionsError}</p>
              )}
              {!sectionsLoading && !sectionsError && sections.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">No sections found for this course.</p>
              )}
              {!sectionsLoading &&
                !sectionsError &&
                sections.map((sec) => (
                  <div
                    key={sec.id}
                    className="border border-slate-100 rounded-xl p-3 mb-2 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-xs font-bold text-slate-700">CRN {sec.crn}</span>
                          {sec.yearTerm && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {sec.yearTerm}
                            </span>
                          )}
                          {sec.isExcellent && (
                            <Star size={12} className="text-orange-400 fill-orange-400" title="Excellent" />
                          )}
                        </div>
                        {sec.scheduleLabel && (
                          <p className="text-[10px] text-slate-400 mt-1 truncate">{sec.scheduleLabel}</p>
                        )}
                        <p className="text-xs text-slate-700 mt-1 truncate" title={sec.instructor || undefined}>
                          {sec.instructor || '—'}
                        </p>
                        <div className="flex gap-3 mt-2 text-sm">
                          <span className="text-slate-500">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">GPA</span>{' '}
                            <span className="font-bold text-emerald-700">
                              {sec.avgGpa != null ? sec.avgGpa.toFixed(2) : '—'}
                            </span>
                          </span>
                          <span className="text-slate-500">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Cr</span>{' '}
                            <span className="font-bold text-[#13294B]">{sec.credits}</span>
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addSection(sec)}
                        disabled={selectedCourses.some((s) => s.id === sec.id)}
                        className="shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#FF5F05] text-white hover:bg-[#e55504] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
