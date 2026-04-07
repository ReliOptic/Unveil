import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCanvas } from './components/GameCanvas';
import { LandingPage } from './components/LandingPage';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { PlantGrowth } from './components/PlantGrowth';
import { RotateCcw, Share2, ChevronRight, Clock, Hash, Map as MapIcon, ChevronDown, ChevronUp } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  const [stats, setStats] = useState<{ 
    time: number; 
    moves: number; 
    visited: Set<string>;
    telemetry: {
      firstTouchDelay: number;
      backtracks: number;
      pathEfficiency: number;
      hintUsed: boolean;
    }
  } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleMove = (count: number) => setMoveCount(count);

  const handleClear = (s: any) => {
    setStats(s);
    setIsCleared(true);
  };

  const restart = () => {
    setIsCleared(false);
    setStats(null);
    setMoveCount(0);
    setLevelIdx(prev => prev);
  };

  const nextLevel = () => {
    setIsCleared(false);
    setStats(null);
    setMoveCount(0);
    // Pick a random level that is different from the current one
    setLevelIdx(prev => {
      let next = Math.floor(Math.random() * 4);
      while (next === prev % 4) {
        next = Math.floor(Math.random() * 4);
      }
      return next;
    });
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

  const pages = [
    { id: 'landing', component: <LandingPage /> },
    { id: 'game', component: (
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
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

        <div className="relative bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white/30">
          <GameCanvas 
            levelIdx={levelIdx} 
            onMove={handleMove} 
            onClear={handleClear} 
            onRestart={restart}
          />
        </div>

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
    )},
    { id: 'telemetry', component: <div className="w-full max-w-4xl h-[80vh]"><TelemetryDashboard data={stats ? { ...stats.telemetry, time: stats.time, moves: stats.moves } : null} /></div> },
    { id: 'growth', component: <div className="w-full max-w-lg h-[60vh]"><PlantGrowth /></div> },
  ];

  const goToPage = (idx: number) => {
    if (idx >= 0 && idx < pages.length) setCurrentPage(idx);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#E8D5C4] flex items-center justify-center font-sans">
      {/* SVG Fluid Background (Static for all pages) */}
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
        </svg>
      </div>

      {/* Vertical Navigation Dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`w-3 h-3 rounded-full transition-all duration-500 ${
              currentPage === i ? 'bg-[#37312F] scale-125' : 'bg-[#37312F]/20 hover:bg-[#37312F]/40'
            }`}
          />
        ))}
      </div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full h-full flex items-center justify-center p-8"
        >
          {pages[currentPage].component}
        </motion.div>
      </AnimatePresence>

      {/* Result Screen Overlay (Only for game page) */}
      <AnimatePresence>
        {currentPage === 1 && isCleared && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-[#E8D5C4]/95 backdrop-blur-xl flex flex-col items-center justify-center p-8"
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
              
              <button 
                onClick={() => goToPage(2)}
                className="mt-12 flex items-center gap-2 text-[#37312F]/40 hover:text-[#37312F] transition-colors text-sm uppercase tracking-widest"
              >
                View Analysis <ChevronDown size={16} />
              </button>
            </motion.div>

            <AnimatePresence>
              {showToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-12 px-6 py-2 bg-black/70 text-white rounded-full text-sm"
                >
                  📋 Copied to clipboard
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
