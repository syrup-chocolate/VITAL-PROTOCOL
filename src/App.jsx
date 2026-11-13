import React, { useState } from 'react';
import { ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [selectedReagent, setSelectedReagent] = useState('vaccine');
  const [logs, setLogs] = useState({});

  const reagents = {
    capsule: { name: 'カプセル製剤', emoji: '💊', color: 'border-yellow-500 text-yellow-400 bg-yellow-950/30' },
    vaccine: { name: 'シリンジワクチン', emoji: '💉', color: 'border-red-500 text-red-400 bg-red-950/30' },
    biohazard: { name: '抗体コードA', emoji: '☣️', color: 'border-orange-500 text-orange-400 bg-orange-950/30' },
    serum: { name: '培養血清', emoji: '🧪', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/30' }
  };

  const todayDay = 12;
  const todayKey = `2026-11-${todayDay}`;
  const isTodayDone = !!logs[todayKey];

  const handleDayClick = (day) => {
    if (day > todayDay) return;
    const dateKey = `2026-11-${day}`;
    setLogs(prev => {
      const newLogs = { ...prev };
      if (newLogs[dateKey] === selectedReagent) {
        delete newLogs[dateKey];
      } else {
        newLogs[dateKey] = selectedReagent;
      }
      return newLogs;
    });
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#090a0f] text-red-500 font-mono p-4 select-none">
      <header className="flex items-center justify-between pb-4 border-b border-red-900/50 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-red-950/80 border border-red-600/60 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-[10px] text-red-400 font-semibold">MEDICAL RESEARCH // LAB-OS</div>
            <h1 className="text-sm font-bold text-red-500">VITAL PROTOCOL // DOSAGE LOG</h1>
          </div>
        </div>
      </header>

      <main className="space-y-4">
        <div className="bg-red-950/20 border border-red-900/60 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-red-400 font-bold">STATUS: {isTodayDone ? 'CONFIRMED' : 'REQUIRED'}</span>
            <Activity className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div className="text-xs text-red-500">~/\_/\___/\/\___/‾‾‾</div>
        </div>

        <div className="bg-red-950/40 border border-red-800 rounded-xl p-4 text-center">
          {isTodayDone ? (
            <div className="py-2 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 本日の投薬完了
            </div>
          ) : (
            <button
              onClick={() => handleDayClick(todayDay)}
              className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold text-sm rounded shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            >
              {reagents[selectedReagent].emoji} 本日の投薬を実行する
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Object.entries(reagents).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSelectedReagent(key)}
              className={`p-2 rounded border flex flex-col items-center text-[10px] ${selectedReagent === key ? val.color + ' ring-1 ring-red-500' : 'border-red-950 bg-black/40 text-red-700'}`}
            >
              <span className="text-xl mb-1">{val.emoji}</span>
              <span>{val.name}</span>
            </button>
          ))}
        </div>

        <div className="bg-[#0b0c12] border border-red-900/60 rounded-xl p-3">
          <div className="text-xs text-center font-bold text-red-400 mb-2">2026年 11月 投薬記録表</div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const day = i + 1;
              const dateKey = `2026-11-${day}`;
              const reg = logs[dateKey];
              const isFuture = day > todayDay;
              return (
                <button
                  key={day}
                  disabled={isFuture}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded border flex flex-col items-center justify-center text-xs ${isFuture ? 'opacity-30 border-red-950' : reg ? 'bg-red-950 border-red-500 text-white' : 'bg-black border-red-950 text-red-600'}`}
                >
                  <span className="text-[9px]">{day}</span>
                  <span>{reg ? reagents[reg].emoji : (isFuture ? '🔒' : '未')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
