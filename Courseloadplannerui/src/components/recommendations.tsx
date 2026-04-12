import React from 'react';
import { Sparkles, Plus, Info, Star } from 'lucide-react';
import type { Course } from '../types/course';

interface RecommendationsProps {
  onAddCourse: (course: Course) => void;
  allCourses: Course[];
}

export function Recommendations({ onAddCourse, allCourses }: RecommendationsProps) {
  const specs = [
    { code: 'CS 440', reason: 'Core AI requirement for your major', match: 98 },
    { code: 'CS 105', reason: 'Easy GPA booster (Gen Ed)', match: 85 },
    { code: 'STAT 400', reason: 'Prerequisite for ML track', match: 92 },
  ];
  const recommendations = specs
    .map((s) => {
      const c = allCourses.find((x) => x.code === s.code);
      return c ? { ...c, reason: s.reason, match: s.match } : null;
    })
    .filter((c): c is Course & { reason: string; match: number } => c !== null);

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-[#FF5F05]" />
        <h3 className="text-lg font-bold text-slate-800">Smart Picks</h3>
      </div>
      
      <p className="text-xs text-slate-500 mb-4">Recommended based on missing requirements and career goals.</p>

      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-xs text-slate-400">No preset picks matched your catalog (expected codes CS 440, CS 105, STAT 400).</p>
        ) : null}
        {recommendations.map((course) => (
          <div key={course.id} className="group p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#13294B]">{course.code}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                    {course.match}% Match
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{course.instructor}</span>
                  {course.isExcellent && <Star size={10} className="text-orange-400 fill-orange-400" />}
                </div>
              </div>
              <button 
                onClick={() => onAddCourse(course)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-[#FF5F05] hover:text-white transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex gap-1.5 items-start bg-blue-50/50 p-2 rounded-lg">
              <Info size={10} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-blue-700 leading-tight">
                {course.reason}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-100 pt-4">
        View All Degree Requirements
      </button>
    </section>
  );
}
