import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, CloudRain, Sun, Zap, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DifficultyMeterProps {
  score: number;
}

const IMAGES = {
  EMPTY: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", // Campus
  RELAXED: "https://images.unsplash.com/photo-1763890498949-efd5d4acb8ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  MODERATE: "https://images.unsplash.com/photo-1767102060241-130cb9260718?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  STRESSED: "https://images.unsplash.com/photo-1758708536050-e911f468ea83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  EXTREME: "https://images.unsplash.com/photo-1644261766628-3af7203be678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
};

export function DifficultyMeter({ score }: DifficultyMeterProps) {
  const getStatus = () => {
    if (score === 0) return { 
      label: 'Empty Schedule', 
      color: 'text-slate-400', 
      bg: 'bg-slate-100',
      icon: <Zap size={48} className="text-slate-200" />,
      image: IMAGES.EMPTY
    };
    if (score < 25) return { 
      label: 'Sunny Semester', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-50',
      icon: <Sun size={48} className="text-emerald-500" />,
      image: IMAGES.RELAXED
    };
    if (score < 50) return { 
      label: 'Balanced Load', 
      color: 'text-sky-500', 
      bg: 'bg-sky-50',
      icon: <CloudRain size={48} className="text-sky-500" />,
      image: IMAGES.MODERATE
    };
    if (score < 75) return { 
      label: 'Academic Storm', 
      color: 'text-orange-500', 
      bg: 'bg-orange-50',
      icon: <AlertCircle size={48} className="text-orange-500" />,
      image: IMAGES.STRESSED
    };
    return { 
      label: 'Academic Inferno', 
      color: 'text-red-500', 
      bg: 'bg-red-50',
      icon: <Flame size={48} className="text-red-500" />,
      image: IMAGES.EXTREME
    };
  };

  const status = getStatus();

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-200 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={status.image}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <ImageWithFallback 
              src={status.image} 
              alt={status.label} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className={`absolute inset-0 opacity-40 mix-blend-multiply ${status.bg}`} />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div className="text-white">
            <h4 className="text-xl font-bold tracking-tight leading-none mb-1">{status.label}</h4>
            <p className="text-xs text-slate-200">Current Workload Estimate</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold border border-white/30">
            {score}% Difficulty
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-2xl bg-white shadow-xs">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="68"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="68"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 68}
              initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 68) * (1 - score / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={status.color}
            />
          </svg>

          <div className="flex flex-col items-center justify-center text-center z-10">
            <motion.div
              key={score}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-1"
            >
              {status.icon}
            </motion.div>
            <span className="text-3xl font-black text-slate-800 tracking-tighter">{score}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
