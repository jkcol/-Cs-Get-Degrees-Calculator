import React from 'react';
import { X, Star, BarChart3, User } from 'lucide-react';
import type { Course } from '../types/course';

interface CourseCardProps {
  course: Course;
  onRemove: () => void;
}

function formatGpa(g: number | null) {
  if (g == null || Number.isNaN(g)) return '—';
  return g.toFixed(2);
}

export function CourseCard({ course, onRemove }: CourseCardProps) {
  const gpaNum = course.avgGpa;
  const gpaLow = gpaNum != null && gpaNum < 3.0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow relative group">
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors md:opacity-0 group-hover:opacity-100"
      >
        <X size={16} />
      </button>

      <div className="flex justify-between items-start mb-2 pr-6">
        <div>
          <h3 className="font-bold text-[#13294B]">{course.code}</h3>
          <p className="text-sm text-slate-500 line-clamp-2">{course.name || '—'}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            CRN {course.crn}
            {course.yearTerm ? ` · ${course.yearTerm}` : ''}
          </p>
          {course.scheduleLabel && (
            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1" title={course.scheduleLabel}>
              {course.scheduleLabel}
            </p>
          )}
        </div>
        <div className="flex items-center bg-orange-50 px-2 py-1 rounded text-[#FF5F05] text-xs font-bold shrink-0">
          {course.credits} hrs
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <BarChart3 size={12} />
            Avg GPA
          </div>
          <p className={`font-bold ${gpaNum != null ? (gpaLow ? 'text-orange-600' : 'text-emerald-600') : 'text-slate-400'}`}>
            {formatGpa(gpaNum)}
          </p>
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            <User size={12} />
            Instructor
          </div>
          <div className="flex items-center gap-1">
            <p className="text-xs font-medium text-slate-700 truncate" title={course.instructor || undefined}>
              {course.instructor || '—'}
            </p>
            {course.isExcellent && (
              <Star size={12} className="text-orange-400 fill-orange-400 shrink-0" title="Excellent Instructor" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
