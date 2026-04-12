import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ArrowRight, BookOpen, Brain, Sparkles, User, Briefcase, FileText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OnboardingFormProps {
  onComplete: (data: any) => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    major: '',
    year: 'Freshman',
    interests: [] as string[],
    career: '',
  });

  const [interestInput, setInterestInput] = useState('');

  const majors = [
    'Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 
    'Psychology', 'Business Administration', 'Economics', 'Biology', 
    'Accountancy', 'Civil Engineering', 'Graphic Design'
  ];

  const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onComplete(formData);
  };

  const addInterest = () => {
    if (interestInput && !formData.interests.includes(interestInput)) {
      setFormData({ ...formData, interests: [...formData.interests, interestInput] });
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
  };

  return (
    <div className="min-h-screen bg-[#13294B] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5F05] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 min-h-[500px]">
          {/* Left Sidebar */}
          <div className="md:col-span-2 bg-slate-50 p-8 border-r border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-[#FF5F05] p-2 rounded-lg">
                  <GraduationCap size={20} className="text-white" />
                </div>
                <h1 className="text-sm font-bold tracking-tight text-[#13294B]">The Calculator</h1>
              </div>
              
              <div className="space-y-6">
                {[
                  { id: 1, label: 'Identify Yourself', icon: <User size={16} />, desc: 'Who are you, Illini?' },
                  { id: 2, label: 'Academic Path', icon: <BookOpen size={16} />, desc: 'Major and Year' },
                  { id: 3, label: 'Interests & Goals', icon: <Sparkles size={16} />, desc: 'Custom recommendations' }
                ].map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${step >= item.id ? 'bg-[#13294B] border-[#13294B] text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold leading-tight ${step >= item.id ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</h3>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl">
              <p className="text-[10px] text-orange-800 italic leading-relaxed">
                "We use historical GPA and ICES survey data to give you the most accurate workload projection possible."
              </p>
            </div>
          </div>

          {/* Right Content */}
          <div className="md:col-span-3 p-8 md:p-12 flex flex-col">
            <div className="flex-1">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold text-[#13294B] mb-2">Welcome to UIUC</h2>
                  <p className="text-slate-500 text-sm mb-8">Let's start with the basics to personalize your experience.</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#FF5F05] outline-none transition-all"
                        placeholder="Alma Mater"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Career</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          type="text" 
                          value={formData.career}
                          onChange={(e) => setFormData({...formData, career: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#FF5F05] outline-none transition-all"
                          placeholder="e.g. Software Engineer at Google"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold text-[#13294B] mb-2">Academic Standing</h2>
                  <p className="text-slate-500 text-sm mb-8">What are you studying and how far along are you?</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center block">Year</label>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {years.map(y => (
                          <button
                            key={y}
                            onClick={() => setFormData({...formData, year: y})}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.year === y ? 'bg-[#FF5F05] border-[#FF5F05] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-[#FF5F05]'}`}
                          >
                            {y}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Major</label>
                      <select 
                        value={formData.major}
                        onChange={(e) => setFormData({...formData, major: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#FF5F05] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select your major...</option>
                        {majors.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h2 className="text-2xl font-bold text-[#13294B] mb-2">Interests</h2>
                  <p className="text-slate-500 text-sm mb-6">Tell us what you like so we can recommend the best classes.</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Interests</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none"
                          placeholder="e.g. Artificial Intelligence"
                        />
                        <button 
                          onClick={addInterest}
                          className="bg-[#13294B] text-white px-4 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {formData.interests.length > 0 ? formData.interests.map(i => (
                        <div key={i} className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                          {i}
                          <button onClick={() => removeInterest(i)} className="hover:text-red-500 transition-colors">×</button>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 italic">No interests added yet...</p>
                      )}
                    </div>

                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                      <FileText className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs font-bold text-emerald-900 leading-tight">Pro Tip: Transcript Upload</p>
                        <p className="text-[10px] text-emerald-700 mt-1">You'll be able to upload your unofficial transcript on the next page to skip manual entry.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-12 flex justify-between items-center">
              {step > 1 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                >
                  Go Back
                </button>
              ) : <div />}
              
              <button 
                onClick={handleNext}
                disabled={step === 1 && !formData.name}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 ${step === 1 && !formData.name ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#FF5F05] text-white hover:bg-orange-600 hover:scale-105 active:scale-95'}`}
              >
                {step === 3 ? 'Get Started' : 'Next Step'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
