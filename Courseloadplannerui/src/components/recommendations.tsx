import React, { useState } from 'react';
import { Sparkles, Plus, Info, Loader2 } from 'lucide-react';
import type { Course, CourseCatalogItem } from '../types/course';

interface RecommendationsProps {
  onAddCourse: (course: Course) => void;
  catalog: CourseCatalogItem[];
  apiBase: string;
  selectedCourses: Course[];
}

function normalizeCourseCode(code: string) {
  return code.replace(/\s+/g, '').toUpperCase();
}

export function Recommendations({ onAddCourse, catalog, apiBase, selectedCourses }: RecommendationsProps) {
  const [loadingCode, setLoadingCode] = useState<string | null>(null);

  const specs = [
    { code: 'CS 440', reason: 'Core AI requirement for your major', match: 98 },
    { code: 'CS 105', reason: 'Easy GPA booster (Gen Ed)', match: 85 },
    { code: 'STAT 400', reason: 'Prerequisite for ML track', match: 92 },
  ];

  const recommendations = specs
    .map((s) => {
      const want = normalizeCourseCode(s.code);
      const c = catalog.find((x) => normalizeCourseCode(x.code) === want);
      return c ? { catalog: c, reason: s.reason, match: s.match } : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  const addBestSection = async (item: CourseCatalogItem) => {
    if (selectedCourses.some((sc) => sc.courseId === item.id)) return;
    setLoadingCode(item.id);
    try {
      const url = `${apiBase}/api/courses/${encodeURIComponent(item.id)}/sections`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data: Course[] = await r.json();
      if (!Array.isArray(data) || data.length === 0) return;
      const best = data.reduce((a, b) => {
        const ga = a.avgGpa ?? -1;
        const gb = b.avgGpa ?? -1;
        return gb > ga ? b : a;
      });
      onAddCourse(best);
    } catch {
      /* ignore */
    } finally {
      setLoadingCode(null);
    }
  };

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[#FF5F05]" />
        <h3 className="text-lg font-bold text-slate-800">Smart Picks</h3>
      </div>
      
      <p className="text-xs text-slate-500 mb-4">Recommended based on missing requirements and career goals. Adds the section with the highest Avg GPA.</p>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-400">No preset picks matched your catalog (expected codes CS 440, CS 105, STAT 400).</p>
        ) : null}
        {recommendations.map(({ catalog: c, reason, match }) => (
          <div key={c.id} className="group p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#13294B]">{c.code}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                    {match}% Match
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{c.name}</p>
              </div>
              <button 
                type="button"
                disabled={loadingCode !== null || selectedCourses.some((sc) => sc.courseId === c.id)}
                onClick={() => addBestSection(c)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-[#FF5F05] hover:text-white transition-colors disabled:opacity-40"
                title="Add best section by GPA"
              >
                {loadingCode === c.id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </button>
            </div>
            <div className="flex gap-1.5 items-start bg-blue-50/50 p-2 rounded-lg">
              <Info size={10} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-blue-700 leading-tight">
                {reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-100 pt-4">
        View All Degree Requirements
      </button>
    </section>
  );
}
