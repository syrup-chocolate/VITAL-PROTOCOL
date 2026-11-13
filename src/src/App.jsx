import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Lock, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  User,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedReagent, setSelectedReagent] = useState('vaccine');
  const [subjectName, setSubjectName] = useState('');
  const [currentDateObj, setCurrentDateObj] = useState(new Date(2026, 10, 12));
  const [logs, setLogs] = useState({});
  const [successAnim, setSuccessAnim] = useState(false);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reagents = {
    capsule: { name: 'カプセル製剤', emoji: '💊', color: 'border-yellow-500 text-yellow-400 bg-yellow-950/30' },
    vaccine: { name: 'シリンジワクチン', emoji: '💉', color: 'border-red-500 text-red-400 bg-red-950/30' },
    biohazard: { name: '抗体コードA', emoji: '☣️', color: 'border-orange-500 text-orange-400 bg-orange-950/30' },
    serum: { name: '培養血清', emoji: '🧪', color: 'border-emerald-500 text-emerald-400 bg-emerald-950/30' }
  };

  const year = currentDateObj.getFullYear();
  const month = currentDateObj.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = 12;

  const handleDayClick = (day) => {
    if (day > todayDay) return;
    playSound('click');
    const dateKey = `${year}-${month + 1}-${day}`;
    setLogs(prev => {
      const newLogs = { ...prev };
      if (newLogs[dateKey] === selectedReagent) {
        delete newLogs[dateKey];
      } else {
        newLogs[dateKey] = selectedReagent;
        setSuccessAnim(true);
        setTimeout(() => setSuccessAnim(false), 1200);
      }
      return newLogs;
    });
  };

  const todayKey = `${year}-${month + 1}-${todayDay}`;
  const isTodayDone = !!logs[todayKey];

  const calculateStreak = () => {
    let streak = 0;
    for (let d = todayDay; d >= 1; d--) {
      const k = `${year}-${month + 1}-${d}`;
      if (logs[k]) streak++;
      else if (d !== todayDay) break;
    }
    return streak;
  };

  const totalDoses = Object.keys(logs).length;
  const streakCount = calculateStreak();

  return (
    <div className="min-w-[360px] max-w-[480px] mx-auto min-h-screen bg-[#090a0f] text-red-500 font-mono relative overflow-x-hidden pb-12 select-none border-x border-red-950 shadow-2xl">
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-50 opacity-60" />
      
      <header className="px-5 pt-6 pb-4 border-b border-red-900/50 bg-[#0d0e15]/95 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-red-950/80 border border-red-600/60 flex items-center justify-center animate-pulse">
            <ShieldAlert className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="text-[10px] tracking-widest text-red-400 font-semibold">MEDICAL RESEARCH // LAB-OS</div>
            <h1 className="text-sm font-bold tracking-wider text-red-500">
              VITAL PROTOCOL <span className="text-xs text-red-400 font-normal">// DOSAGE LOG</span>
            </h1>
          </div>
        </div>
        <button 
          onClick={() => { setSoundEnabled(!soundEnabled); playSound('click'); }}
          className="p-2 rounded bg-red-950/40 border border-red-900/60 text-red-400"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-700" />}
        </button>
      </header>

      <main className="px-4 py-5 space-y-5 relative z-10">
        <div className="bg-red-950/20 border border-red-900/60 rounded-lg p-3.5 relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-400 font-bold">
                STATUS: {isTodayDone ? 'STABLE / DOSAGE CONFIRMED' : 'CRITICAL / DOSAGE REQUIRED'}
              </span>
            </div>
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="h-6 w-full flex items-center overflow-hidden opacity-80 text-xs">
            <span className="text-red-500 font-bold animate-[pulse_1s_infinite] tracking-widest">
              ~/\_/\___/\/\___/‾‾‾
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-center">
            <div className="text-[10px] text-red-400 mb-1">SURVIVAL STREAK</div>
            <div className="text-2xl font-black text-red-400">{streakCount} <span className="text-xs text-red-500">DAYS</span></div>
          </div>
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-center">
            <div className="text-[10px] text-red-400 mb-1">TOTAL DOSES</div>
            <div className="text-2xl font-black text-red-400">{totalDoses} <span className="text-xs text-red-500">UNITS</span></div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-red-950/40 to-[#12080a] border border-red-800/80 rounded-xl p-4 relative">
          <div className="text-[10px] text-red-400 border-b border-red-900/40 pb-1.5 mb-3 flex justify-between">
            <span>DATE: 2026.11.{todayDay}</span>
            <span>SECURE TERMINAL</span>
          </div>
          <div className="text-center">
            {isTodayDone ? (
              <div className="py-2">
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-400 text-xs font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> DOSAGE CONFIRMED
                </div>
                <p className="text-xs text-red-300">本日のプロトコル完了。バイタル正常範囲内です。</p>
              </div>
            ) : (
              <button
                onClick={() => handleDayClick(todayDay)}
                className="w-full py-3.5 px-4 rounded-lg bg-gradient-to-r from-red-700 to-red-800 text-white font-bold text-sm tracking-widest border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2"
              >
                <span className="text-lg">{reagents[selectedReagent].emoji}</span>
                ADMINISTER DOSE (投薬完了)
              </button>
            )}
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-900/60 rounded-xl p-3.5">
          <div className="text-[10px] text-red-400 mb-2.5 text-center font-semibold">REAGENT TYPE:</div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(reagents).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setSelectedReagent(key); playSound('click'); }}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition ${
                  selectedReagent === key ? `${val.color} ring-2 ring-red-500` : 'border-red-950 bg-black/40 text-red-700'
                }`}
              >
                <span className="text-2xl mb-1">{val.emoji}</span>
                <span className="text-[9px] text-red-300">{val.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0b0c12] border border-red-900/60 rounded-xl p-4">
          <div className="text-center mb-3">
            <div className="text-[10px] text-red-500 font-semibold">Clinical Trial Matrix</div>
            <div className="text-sm font-bold text-red-400 mt-1">2026年 11月 投薬記録表</div>
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="被験者名を入力..."
              className="w-full bg-black/60 border border-red-900/70 rounded px-3 py-1.5 text-xs text-red-300 placeholder-red-800 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateKey = `${year}-${month + 1}-${day}`;
              const registeredReagent = logs[dateKey];
              const isFuture = day > todayDay;
              const isToday = day === todayDay;

              return (
                <button
                  key={day}
                  disabled={isFuture}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center ${
                    isFuture ? 'border-red-950/40 bg-black/20 text-red-950 opacity-40' :
                    registeredReagent ? 'border-red-500 bg-red-950/60 text-red-200' :
                    isToday ? 'border-red-500 bg-red-950/30 text-red-400 ring-1 ring-red-500' :
                    'border-red-950 bg-black/50 text-red-600'
                  }`}
                >
                  <span className={`text-[10px] font-bold ${isToday ? 'underline' : ''}`}>{String(day).padStart(2, '0')}</span>
                  <span className="mt-0.5 text-sm">
                    {registeredReagent ? reagents[registeredReagent].emoji : isFuture ? <Lock className="w-3 h-3 text-red-950" /> : <span className="text-[9px] text-red-800">未</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-[9px] text-red-700 tracking-widest border-t border-red-950 mt-4">
        CONFIDENTIAL // UMBRELLA BIO-LAB SYSTEM v3.4.2
      </footer>
    </div>
  );
}
