import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Flower, Leaf, Droplets } from 'lucide-react';

export const PlantGrowth: React.FC = () => {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < 9) setStep(prev => prev + 1);
  };

  const reset = () => setStep(0);

  const getPlantStage = () => {
    if (step === 0) return null; // Empty pot
    if (step === 1) return <motion.rect initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} x="22" y="25" width="4" height="2" fill="#5D4037" rx="1" />; // Soil
    if (step === 2) return <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="24" cy="24" r="1.5" fill="#3E2723" />; // Seed
    if (step === 3) return <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M24,24 Q24,20 26,18" stroke="#4CAF50" strokeWidth="1.5" fill="none" />; // Tiny sprout
    if (step === 4) return (
      <g>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M24,24 Q24,18 24,14" stroke="#4CAF50" strokeWidth="2" fill="none" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,16 Q20,14 18,16 Q20,18 24,16" fill="#81C784" />
      </g>
    ); // Two leaves
    if (step === 5) return (
      <g>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M24,24 Q24,12 24,8" stroke="#4CAF50" strokeWidth="2" fill="none" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,16 Q20,14 18,16 Q20,18 24,16" fill="#81C784" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,12 Q28,10 30,12 Q28,14 24,12" fill="#81C784" />
      </g>
    ); // Growing stem
    if (step === 6) return (
      <g>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M24,24 Q24,8 24,4" stroke="#4CAF50" strokeWidth="2" fill="none" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,16 Q18,12 14,16 Q18,20 24,16" fill="#66BB6A" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,10 Q30,6 34,10 Q30,14 24,10" fill="#66BB6A" />
      </g>
    ); // Larger leaves
    if (step === 7) return (
      <g>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M24,24 Q24,4 24,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,16 Q18,12 14,16 Q18,20 24,16" fill="#66BB6A" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,10 Q30,6 34,10 Q30,14 24,10" fill="#66BB6A" />
        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="24" cy="0" r="3" fill="#E8A87C" />
      </g>
    ); // Bud appears
    if (step === 8) return (
      <g>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M24,24 Q24,4 24,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,16 Q18,12 14,16 Q18,20 24,16" fill="#66BB6A" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,10 Q30,6 34,10 Q30,14 24,10" fill="#66BB6A" />
        <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="24" cy="0" r="5" fill="#E8A87C" />
        <motion.path initial={{ rotate: 0 }} animate={{ rotate: 45 }} origin="24 0" d="M24,0 L24,-8" stroke="#E8A87C" strokeWidth="2" />
      </g>
    ); // Bud opening
    if (step === 9) return (
      <g>
        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d="M24,24 Q24,4 24,0" stroke="#4CAF50" strokeWidth="2" fill="none" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,16 Q18,12 14,16 Q18,20 24,16" fill="#66BB6A" />
        <motion.path initial={{ scale: 0 }} animate={{ scale: 1 }} d="M24,10 Q30,6 34,10 Q30,14 24,10" fill="#66BB6A" />
        
        {/* Petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.path
            key={angle}
            initial={{ scale: 0, rotate: angle }}
            animate={{ scale: 1, rotate: angle }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 80, damping: 10 }}
            style={{ originX: '24px', originY: '0px' }}
            d="M24,0 C28,-14 38,-14 38,0 C38,14 28,14 24,0"
            fill={i % 2 === 0 ? '#E8A87C' : '#F2E6D9'}
            stroke="#C4705A"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Center of flower */}
        <motion.circle 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ delay: 0.5 }}
          cx="24" cy="0" r="4" 
          fill="#FBC02D" 
          stroke="#F57F17"
          strokeWidth="0.5"
        />
      </g>
    );
 // Full bloom
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#F5EDE4]/50 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-light tracking-widest text-[#37312F] uppercase mb-2">Silent Growth</h2>
        <p className="text-sm text-[#37312F]/40 font-light tracking-widest">Nurture your self-discovery</p>
      </div>

      <div 
        className="relative w-64 h-64 cursor-pointer group"
        onClick={nextStep}
      >
        <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-2xl">
          {/* Pot */}
          <polygon points="12,36 36,36 40,24 8,24" fill="#D4C4B0" />
          <polygon points="8,24 40,24 42,20 6,20" fill="#C9B89A" />
          
          {/* Plant */}
          <g transform="translate(0, 0)">
            {getPlantStage()}
          </g>
        </svg>

        <AnimatePresence>
          {step < 9 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#37312F]/40 text-xs tracking-widest uppercase"
            >
              <Droplets size={14} className="animate-bounce" /> Tap to nurture
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 w-full max-w-xs">
        <div className="flex justify-between text-[10px] text-[#37312F]/30 uppercase tracking-widest mb-2">
          <span>Step {step + 1} / 10</span>
          <span>{Math.round((step + 1) / 10 * 100)}%</span>
        </div>
        <div className="w-full h-1 bg-[#37312F]/10 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${(step + 1) / 10 * 100}%` }}
            className="h-full bg-[#E8A87C]"
          />
        </div>
      </div>

      {step === 9 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={reset}
          className="mt-8 px-6 py-2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full text-[10px] text-[#37312F]/60 uppercase tracking-widest transition-colors border border-white/30"
        >
          Start Over
        </motion.button>
      )}
    </div>
  );
};
