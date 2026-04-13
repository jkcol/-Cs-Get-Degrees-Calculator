import React, { useState, useEffect } from 'react';
import { Search, Plus, Star, BookOpen, User, PieChart, Info, AlertTriangle, CheckCircle2, Flame, Brain, GraduationCap, Settings, ClipboardList, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CourseCard } from './components/course-card';
import { DifficultyMeter } from './components/difficulty-meter';
import { Recommendations } from './components/recommendations';
import { CourseSearch } from './components/course-search';
import { OnboardingForm } from './components/onboarding-form';
import { DegreeProgress } from './components/degree-progress';
import type { Course, CourseCatalogItem } from './types/course';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [catalog, setCatalog] = useState<CourseCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  useEffect(() => {
    const url = `${API_BASE}/api/courses`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CourseCatalogItem[]) => setCatalog(Array.isArray(data) ? data : []))
      .catch((e) => setCatalogError(e instanceof Error ? e.message : 'Failed to load courses'))
      .finally(() => setCatalogLoading(false));
  }, []);
  const [activeTab, setActiveTab] = useState('planner');
  const [studentInfo, setStudentInfo] = useState({
    name: 'Student',
    major: 'Computer Science',
    year: 'Junior',
    interests: ['AI', 'FinTech']
  });

  const handleOnboardingComplete = (data: any) => {
    setStudentInfo(data);
    setHasOnboarded(true);
  };

  const addCourse = (course: Course) => {
    if (!selectedCourses.find(c => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const removeCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter(c => c.id !== courseId));
  };

  const totalCredits = selectedCourses.reduce((acc, curr) => acc + curr.credits, 0);

  const averageGpa = React.useMemo(() => {
    if (selectedCourses.length === 0) return null;
    const vals = selectedCourses
      .map((c) => c.avgGpa)
      .filter((g): g is number => g != null && !Number.isNaN(g));
    if (vals.length === 0) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  }, [selectedCourses]);

  const difficultyScore = React.useMemo(() => {
    if (selectedCourses.length === 0) return 0;
    const withGpa = selectedCourses.filter((c) => c.avgGpa != null && !Number.isNaN(c.avgGpa));
    const gpaComponent =
      withGpa.length > 0
        ? withGpa.reduce((acc, curr) => acc + (4.0 - curr.avgGpa!) * 15, 0) / withGpa.length
        : 0;
    const creditComponent = (totalCredits / 18) * 50;
    return Math.min(100, Math.round(gpaComponent + creditComponent));
  }, [selectedCourses, totalCredits]);

  if (!hasOnboarded) {
    return <OnboardingForm onComplete={handleOnboardingComplete} />;
  }

  if (catalogLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        <p>Loading courses from the server…</p>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-slate-800 font-medium">Could not load courses</p>
        <p className="text-sm text-slate-500 max-w-md">{catalogError}</p>
        <p className="text-xs text-slate-400 max-w-md">
          Start <code className="bg-slate-200 px-1 rounded">team110-api</code> on port 8080 and ensure the Cloud SQL proxy is running, or set{' '}
          <code className="bg-slate-200 px-1 rounded">VITE_API_BASE_URL</code> to your Cloud Run URL.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-[#13294B] text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#FF5F05] p-2 rounded-lg">
              <GraduationCap size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">The "C's Get Degrees" <span className="text-[#FF5F05]">Calculator</span></h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-8 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 hover:text-[#FF5F05] transition-colors ${activeTab === 'planner' ? 'text-[#FF5F05]' : ''}`}
            >
              <LayoutDashboard size={16} />
              Planner
            </button>
            <button 
              onClick={() => setActiveTab('requirements')}
              className={`flex items-center gap-2 hover:text-[#FF5F05] transition-colors ${activeTab === 'requirements' ? 'text-[#FF5F05]' : ''}`}
            >
              <ClipboardList size={16} />
              Degree Progress
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-none">{studentInfo.name}</p>
              <p className="text-[10px] text-slate-400">{studentInfo.major}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#FF5F05] border-2 border-white/20 flex items-center justify-center font-bold text-sm">
              {studentInfo.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {activeTab === 'planner' ? (
          <>
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Semester Course Load</h2>
                    <p className="text-slate-500 text-sm">Target: Fall 2026</p>
                  </div>
                  <CourseSearch
                    onAddCourse={addCourse}
                    selectedCourses={selectedCourses}
                    catalog={catalog}
                    apiBase={API_BASE}
                  />
                </div>

                <div className="space-y-4">
                  {selectedCourses.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
                      <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="text-slate-300" size={32} />
                      </div>
                      <h3 className="text-lg font-medium text-slate-600">No courses added yet</h3>
                      <p className="text-slate-400 max-w-xs mx-auto mt-2 text-sm">Start typing a course code to see historical GPA data and stress analysis.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCourses.map(course => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          onRemove={() => removeCourse(course.id)} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <PieChart className="text-[#FF5F05]" size={20} />
                  <h2 className="text-xl font-bold text-slate-800">Visual Stress Gauge</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <DifficultyMeter score={difficultyScore} />
                  
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Credits</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-[#13294B]">{totalCredits}</span>
                          <span className="text-xs text-slate-400">/ 18</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 mt-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${totalCredits > 18 ? 'bg-red-500' : 'bg-[#FF5F05]'}`} 
                            style={{ width: `${Math.min(100, (totalCredits / 18) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Avg Course GPA</p>
                        <p className="text-2xl font-bold text-[#13294B]">{averageGpa ?? '—'}</p>
                        <div className="flex gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1.5 flex-1 rounded-full ${averageGpa != null && i <= (Number(averageGpa) / 4) * 5 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${difficultyScore > 70 ? 'border-red-100 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
                      <div className="flex gap-3">
                        <div className={`mt-0.5 ${difficultyScore > 70 ? 'text-red-500' : 'text-blue-500'}`}>
                          {difficultyScore > 70 ? <AlertTriangle size={20} /> : <Info size={20} />}
                        </div>
                        <div>
                          <h4 className={`font-bold text-sm ${difficultyScore > 70 ? 'text-red-900' : 'text-blue-900'}`}>
                            {difficultyScore > 70 ? 'Workload Warning' : 'Semester Strategy'}
                          </h4>
                          <p className={`text-xs mt-1 leading-relaxed ${difficultyScore > 70 ? 'text-red-800' : 'text-blue-800'}`}>
                            {difficultyScore === 0 ? "Add your planned courses to generate a personalized workload strategy." :
                             difficultyScore < 40 ? `Hey ${studentInfo.name.split(' ')[0]}, this looks like a breezy semester. Excellent for focus on your ${studentInfo.interests[0]} interest!` :
                             difficultyScore < 70 ? "This is a standard balanced load. You should have enough time for RSOs and social life." :
                             "Warning: This combination has a high attrition rate. Consider swapping one technical course for a Gen-Ed."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <section className="bg-[#13294B] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <User size={18} className="text-[#FF5F05]" />
                      Profile
                    </h3>
                    <button 
                      onClick={() => setHasOnboarded(false)}
                      className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                      <Settings size={16} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Major</span>
                      <span className="font-medium">{studentInfo.major}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Level</span>
                      <span className="font-medium">{studentInfo.year}</span>
                    </div>
                    <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Areas of Interest</span>
                      <div className="flex gap-2 flex-wrap">
                        {studentInfo.interests.map((interest, i) => (
                          <span key={i} className="bg-white/10 px-2 py-1 rounded text-[10px] border border-white/5">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <Recommendations
                onAddCourse={addCourse}
                catalog={catalog}
                apiBase={API_BASE}
                selectedCourses={selectedCourses}
              />

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Star size={16} className="text-[#FF5F05] fill-[#FF5F05]" />
                  The ICES Star
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  Courses with a <Star size={10} className="inline text-[#FF5F05] fill-[#FF5F05] mb-0.5" /> represent instructors listed as "Excellent" in the UIUC ICES survey history.
                </p>
              </div>
            </aside>
          </>
        ) : (
          <div className="lg:col-span-12">
            <DegreeProgress />
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 mt-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <GraduationCap size={20} />
            <span className="font-bold text-sm">The "C's Get Degrees" Calculator</span>
          </div>
          <p className="text-xs text-slate-400">© 2026 UIUC Course Data project. Not affiliated with the University of Illinois.</p>
          <div className="flex gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-[#FF5F05]">Data Sources</a>
            <a href="#" className="hover:text-[#FF5F05]">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
