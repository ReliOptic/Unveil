import React from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { Activity, Brain, Fingerprint, TrendingUp } from 'lucide-react';

interface TelemetryData {
  firstTouchDelay: number;
  backtracks: number;
  pathEfficiency: number;
  hintUsed: boolean;
  time: number;
  moves: number;
}

export const TelemetryDashboard: React.FC<{ data: TelemetryData | null }> = ({ data }) => {
  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[#37312F]/40 font-light tracking-widest">
        NO DATA COLLECTED YET
      </div>
    );
  }

  const radarData = [
    { subject: 'Intuition', A: Math.max(20, 100 - data.firstTouchDelay / 50), fullMark: 100 },
    { subject: 'Precision', A: data.pathEfficiency * 100, fullMark: 100 },
    { subject: 'Persistence', A: Math.max(20, 100 - data.backtracks * 10), fullMark: 100 },
    { subject: 'Independence', A: data.hintUsed ? 40 : 100, fullMark: 100 },
    { subject: 'Speed', A: Math.max(20, 100 - data.time), fullMark: 100 },
  ];

  const getAnalysis = () => {
    if (data.firstTouchDelay < 500 && data.pathEfficiency > 0.8) return "Instinctive Strategist: You act quickly and accurately, relying on strong spatial intuition.";
    if (data.backtracks > 3) return "Iterative Explorer: You learn through trial and error, showing high adaptability to changing environments.";
    if (data.hintUsed) return "Pragmatic Problem Solver: You value efficiency and are not afraid to seek guidance when needed.";
    return "Methodical Thinker: You take your time to analyze the path before making a move.";
  };

  return (
    <div className="w-full h-full overflow-y-auto p-8 bg-[#F5EDE4]/50 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Activity className="text-[#E8A87C]" size={32} />
        <h2 className="text-2xl font-light tracking-widest text-[#37312F] uppercase">Telemetry Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/40 p-6 rounded-2xl border border-white/50">
          <h3 className="text-sm font-medium text-[#37312F]/60 mb-6 flex items-center gap-2">
            <Brain size={16} /> BEHAVIORAL PROFILE
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#37312F20" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#37312F60', fontSize: 10 }} />
                <Radar name="User" dataKey="A" stroke="#E8A87C" fill="#E8A87C" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/40 p-6 rounded-2xl border border-white/50 flex flex-col justify-center">
          <h3 className="text-sm font-medium text-[#37312F]/60 mb-4 flex items-center gap-2">
            <Fingerprint size={16} /> SELF-ANALYSIS
          </h3>
          <p className="text-lg font-light leading-relaxed text-[#37312F]">
            {getAnalysis()}
          </p>
          <div className="mt-8 pt-8 border-t border-[#37312F]/10">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#37312F]/40">Path Efficiency</span>
              <span className="text-[#37312F] font-medium">{(data.pathEfficiency * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full h-1 bg-[#37312F]/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${data.pathEfficiency * 100}%` }}
                className="h-full bg-[#7EB8C9]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/40 p-6 rounded-2xl border border-white/50">
        <h3 className="text-sm font-medium text-[#37312F]/60 mb-6 flex items-center gap-2">
          <TrendingUp size={16} /> RAW METRICS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'First Touch', value: `${data.firstTouchDelay}ms` },
            { label: 'Backtracks', value: data.backtracks },
            { label: 'Total Time', value: `${data.time}s` },
            { label: 'Moves', value: data.moves },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-xs text-[#37312F]/40 uppercase tracking-tighter mb-1">{item.label}</div>
              <div className="text-xl font-light text-[#37312F]">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
