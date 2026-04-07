import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCanvas } from './components/GameCanvas';
import { RotateCcw, Share2, ChevronRight, Clock, Hash, Map as MapIcon } from 'lucide-react';

export default function App() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  const [stats, setStats] = useState<{ time: number; moves: number; visited: Set<string> } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleMove = (count: number) => setMoveCount(count);

  const handleClear = (s: { time: number; moves: number; visited: Set<string> }) => {
    setStats(s);
    setIsCleared(true);
  };

  const restart = () => {
    setIsCleared(false);
    setStats(null);
    setMoveCount(0);
    setLevelIdx(prev => prev); // Trigger re-init in GameCanvas
  };

  const nextLevel = () => {
    setIsCleared(false);
    setStats(null);
    setMoveCount(0);
    setLevelIdx(prev => (prev + 1) % 2);
  };

  const share = () => {
    if (!stats) return;
    const mapStr = Array.from({ length: 9 }).map((_, i) => {
      const r = Math.floor(i / 3);
      const c = i % 3;
      const isVisited = Array.from(stats.visited).some((v: string) => {
        const [vr, vc] = v.split(',').map(Number);
        return Math.floor(vr / 1.7) === r && Math.floor(vc / 1.7) === c;
      });
      return (isVisited ? '🟦' : '🟨') + ((i + 1) % 3 === 0 ? '\n' : '');
    }).join('');

    const text = `🏗️ unveil #${levelIdx + 1}\n⏱️ ${stats.time} | 🔄 ${stats.moves}\n${mapStr}unveil.app/daily`;
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#E8D5C4] flex items-center justify-center font-sans">
      {/* SVG Fluid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <motion.path
            animate={{
              d: [
                "M918,655Q836,810,673,836Q510,862,355,818Q200,774,150,637Q100,500,150,363Q200,226,355,182Q510,138,673,182Q836,226,877,363Q918,500,918,655Z",
                "M880,630Q840,760,710,840Q580,920,440,860Q300,800,220,650Q140,500,220,350Q300,200,440,140Q580,80,710,160Q840,240,860,435Q880,630,880,630Z",
                "M918,655Q836,810,673,836Q510,862,355,818Q200,774,150,637Q100,500,150,363Q200,226,355,182Q510,138,673,182Q836,226,877,363Q918,500,918,655Z"
              ]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            fill="#B8D4E3"
          />
          <motion.circle
            animate={{ cx: [200, 800, 200], cy: [200, 800, 200] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            r="150"
            fill="#D4C4B0"
            className="opacity-30"
          />
        </svg>
      </div>

      {/* Decorative Isometric Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 skew-y-[-15deg] rotate-[15deg] rounded-lg border border-white/20 blur-sm" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#E8A87C]/10 skew-y-[15deg] rotate-[-15deg] rounded-lg border border-[#E8A87C]/20 blur-sm" />
      </div>

      {/* Game Container */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-between items-center px-8 mb-8"
        >
          <h1 className="text-3xl font-light tracking-widest text-[#37312F] uppercase">unveil</h1>
          <div className="flex gap-2">
            {Array.from({ length: moveCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-[#37312F]/40 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Canvas */}
        <div className="relative bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/30">
          <GameCanvas 
            levelIdx={levelIdx} 
            onMove={handleMove} 
            onClear={handleClear} 
            onRestart={restart}
          />
        </div>

        {/* Footer / Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex gap-6"
        >
          <button 
            onClick={restart}
            className="p-4 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-2xl transition-colors shadow-lg"
          >
            <RotateCcw size={24} className="text-[#37312F]" />
          </button>
        </motion.div>
      </div>

      {/* Result Screen */}
      <AnimatePresence>
        {isCleared && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#E8D5C4]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm flex flex-col items-center"
            >
              <div className="flex gap-12 mb-12">
                <div className="flex flex-col items-center gap-2">
                  <Clock size={32} className="text-[#37312F]" />
                  <span className="text-2xl font-bold text-[#37312F]">{stats.time}</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Hash size={32} className="text-[#37312F]" />
                  <span className="text-2xl font-bold text-[#37312F]">{stats.moves}</span>
                </div>
              </div>

              {/* Minimap */}
              <div className="grid grid-cols-3 gap-2 mb-12">
                {Array.from({ length: 9 }).map((_, i) => {
                  const r = Math.floor(i / 3);
                  const c = i % 3;
                  const isVisited = Array.from(stats.visited).some((v: string) => {
                    const [vr, vc] = v.split(',').map(Number);
                    return Math.floor(vr / 1.7) === r && Math.floor(vc / 1.7) === c;
                  });
                  return (
                    <div 
                      key={i} 
                      className={`w-8 h-8 rounded-lg ${isVisited ? 'bg-[#7EB8C9]' : 'bg-[#D4C4B0]'}`} 
                    />
                  );
                })}
              </div>

              <div className="flex gap-6">
                <button 
                  onClick={share}
                  className="p-5 bg-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  <Share2 size={28} className="text-[#37312F]" />
                </button>
                <button 
                  onClick={restart}
                  className="p-5 bg-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  <RotateCcw size={28} className="text-[#37312F]" />
                </button>
                <button 
                  onClick={nextLevel}
                  className="p-5 bg-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  <ChevronRight size={28} className="text-[#37312F]" />
                </button>
              </div>
            </motion.div>

            {/* Toast */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-12 px-6 py-2 bg-black/70 text-white rounded-full text-sm"
                >
                  📋
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
