import React, { useState } from 'react';
import { Search, Plus, Star } from 'lucide-react';
import type { Course } from '../types/course';

interface CourseSearchProps {
  onAddCourse: (course: Course) => void;
  selectedCourses: Course[];
  allCourses: Course[];
}

export function CourseSearch({ onAddCourse, selectedCourses, allCourses }: CourseSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCourses = allCourses.filter(c => 
    (c.code.toLowerCase().includes(query.toLowerCase()) || 
     c.name.toLowerCase().includes(query.toLowerCase())) &&
    !selectedCourses.find(sc => sc.id === c.id)
  ).slice(0, 5);

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

      {isOpen && query.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {filteredCourses.length > 0 ? (
            <div className="py-1">
              {filteredCourses.map((course) => (
                <button
                  key={course.id}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  onClick={() => {
                    onAddCourse(course);
                    setQuery('');
                    setIsOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#13294B]">{course.code}</span>
                    <span className="text-xs text-slate-500 truncate max-w-[180px]">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg GPA</div>
                      <div className="text-xs font-bold text-emerald-600">{course.avgGpa.toFixed(2)}</div>
                    </div>
                    {course.isExcellent && (
                      <Star size={14} className="text-orange-400 fill-orange-400" />
                    )}
                    <div className="p-1 bg-slate-100 rounded group-hover:bg-[#FF5F05] transition-colors">
                      <Plus size={14} className="text-slate-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">
              No courses found matching "{query}"
            </div>
          )}
        </div>
      )}
      
      {isOpen && query.length > 0 && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
