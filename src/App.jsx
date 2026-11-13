import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle 
} from 'lucide-react';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedReagent, setSelectedReagent] = useState('vaccine');
  const [subjectName, setSubjectName] = useState(() => {
    return localStorage.getItem('vital_subject_name') || '';
  });
  
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('vital_protocol_logs');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(11);

  // カレンダーが浮き上がるアニメーション用のトリガー状態
  const [isMatrixHighlighted, setIsMatrixHighlighted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('vital_protocol_logs', JSON.stringify(logs));
    } catch (e) {}
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('vital_subject_name', subjectName);
    } catch (e) {}
  }, [subjectName]);

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

  const realTodayYear = 2026;
  const realTodayMonth = 11;
  const realTodayDay = 12;

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const handlePrevMonth = () => {
    playSound('click');
    if (currentMonth === 1) {
      if (currentYear > 2026) {
        setCurrentYear(currentYear - 1);
        setCurrentMonth(12);
      }
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    playSound('click');
    if (currentMonth === 12) {
      if (currentYear < 2030) {
        setCurrentYear(currentYear + 1);
        setCurrentMonth(1);
      }
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // 投薬実行時のアクション
  const handleAdministerDose = (day) => {
    playSound('click');
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    
    setLogs(prev => {
      const newLogs = { ...prev };
      if (newLogs[dateKey] === selectedReagent) {
        delete newLogs[dateKey];
      } else {
        newLogs[dateKey] = selectedReagent;
      }
      return newLogs;
    });

    // カレンダーを浮き上がらせて光らせる演出を発動
    setIsMatrixHighlighted(true);
    setTimeout(() => {
      setIsMatrixHighlighted(false);
    }, 800);
  };

  const todayKey = `${realTodayYear}-${realTodayMonth}-${realTodayDay}`;
  const isTodayDone = !!logs[todayKey];

  const calculateStreak = () => {
    let streak = 0;
    const totalKeys = Object.keys(logs).sort();
    if (totalKeys.length > 0) {
      streak = totalKeys.length;
    }
    return streak;
  };

  const totalDoses = Object.keys(logs).length;
  const streakCount = calculateStreak();

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-[#090a0f] text-red-500 font-mono relative overflow-x-hidden pb-12 select-none border-x border-red-950 shadow-2xl">
      
      {/* CRT走査線エフェクト */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-50 opacity-60" />

      {/* ヘッダー */}
      <header className="px-5 pt-6 pb-4 border-b border-red-900/50 bg-[#0d0e15]/95 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-red-950/80 border border-orange-600/60 flex items-center justify-center animate-pulse shadow-[0_0_12px_rgba(249,115,22,0.4)] text-xl">
            ☣️
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
          className="p-2 rounded bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/50 transition"
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-red-700" />}
        </button>
      </header>

      <main className="px-4 py-5 space-y-5 relative z-10">
        
        {/* VITAL TELEMETRY パネル */}
        <div className="bg-red-950/20 border border-red-900/60 rounded-xl p-3.5 relative">
          <div className="text-[10px] text-red-400 tracking-widest mb-1.5 font-medium">VITAL TELEMETRY</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-red-500 animate-pulse">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold tracking-wider text-red-500 leading-tight">
                STATUS: {isTodayDone ? 'STABLE / DOSAGE CONFIRMED' : 'CRITICAL / DOSAGE REQUIRED'}
              </div>
            </div>
            <div className="text-red-500 animate-pulse flex items-center">
              <svg width="48" height="20" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current stroke-[2] stroke-linejoin-round stroke-linecap-round">
                <path d="M2 12H16L20 4L26 20L31 10L35 14L39 12H58" />
              </svg>
            </div>
          </div>
        </div>

        {/* スタッツ */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-center">
            <div className="text-[10px] text-red-400 tracking-wider mb-1">SURVIVAL STREAK</div>
            <div className="text-xs text-red-500 mb-1">連続投与日数</div>
            <div className="text-2xl font-black text-red-400">{streakCount} <span className="text-xs text-red-500">DAYS</span></div>
          </div>
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3 text-center">
            <div className="text-[10px] text-red-400 tracking-wider mb-1">TOTAL DOSES</div>
            <div className="text-xs text-red-500 mb-1">通算投薬数</div>
            <div className="text-2xl font-black text-red-400">{totalDoses} <span className="text-xs text-red-500">UNITS</span></div>
          </div>
        </div>

        {/* 本日のクイックチェックイン */}
        <div className="bg-gradient-to-b from-red-950/40 to-[#12080a] border border-red-800/80 rounded-xl p-4 relative shadow-[0_0_20px_rgba(220,38,38,0.2)]">
          <div className="text-[10px] text-red-400 border-b border-red-900/40 pb-1.5 mb-3 flex justify-between items-center">
            <span className="flex items-center gap-1 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> DATE: {realTodayYear}.{realTodayMonth}.{realTodayDay}
            </span>
            <span>SECURE TERMINAL</span>
          </div>
          
          <div className="text-center py-1">
            {isTodayDone ? (
              <div>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/80 text-emerald-400 text-xs font-bold mb-2 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> DOSAGE CONFIRMED
                </div>
                <p className="text-xs text-red-200">本日のワクチン・抗ウイルス剤 投与完了</p>
                <p className="text-[10px] text-red-400 mt-1">バイタル数値は正常範囲内を維持しています。</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-red-300 mb-3">感染進行を抑制するため、本日のプロトコルを実行してください。</p>
                <button
                  onClick={() => handleAdministerDose(realTodayDay)}
                  className="w-full py-3.5 px-4 rounded-lg bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white font-bold text-sm tracking-widest border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <span className="text-lg">{reagents[selectedReagent].emoji}</span>
                  ADMINISTER DOSE (投薬完了)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 試薬タイプ選択 */}
        <div className="bg-red-950/20 border border-red-900/60 rounded-xl p-3.5">
          <div className="text-[10px] tracking-widest text-red-400 mb-2.5 text-center font-semibold">REAGENT TYPE:</div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(reagents).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setSelectedReagent(key); playSound('click'); }}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center transition ${
                  selectedReagent === key ? `${val.color} ring-2 ring-red-500 scale-105` : 'border-red-950 bg-black/40 text-red-700 hover:border-red-800'
                }`}
              >
                <span className="text-2xl mb-1">{val.emoji}</span>
                <span className="text-[9px] text-red-300 truncate w-full text-center">{val.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 投薬完了時に浮き上がるカレンダー記録表 */}
        <div className={`bg-[#0b0c12] border rounded-xl p-4 shadow-lg transition-all duration-500 ${
          isMatrixHighlighted 
            ? 'border-red-400 bg-red-950/50 scale-[1.03] shadow-[0_0_30px_rgba(239,68,68,0.6)] translate-y-[-4px]' 
            : 'border-red-900/60'
        }`}>
          <div className="text-center mb-3">
            <div className="text-[10px] tracking-widest text-red-500 uppercase font-semibold">Clinical Trial Matrix</div>
            <div className="flex items-center justify-center gap-3 mt-1 text-sm font-bold text-red-400">
              <button 
                onClick={handlePrevMonth} 
                disabled={currentYear === 2026 && currentMonth === 1}
                className="p-1 hover:text-white transition disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="tracking-widest">{currentYear}年 {currentMonth}月 投薬記録表</span>
              <button 
                onClick={handleNextMonth} 
                disabled={currentYear === 2030 && currentMonth === 12}
                className="p-1 hover:text-white transition disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mb-3 pb-2 border-b border-red-950">
            <div className="text-[9px] text-red-500 mb-1 tracking-wider">SUBJECT ID / NAME:</div>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="被験者名を入力..."
              className="w-full bg-black/60 border border-red-900/70 rounded px-3 py-1.5 text-xs text-red-300 placeholder-red-800 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center text-[10px] font-bold text-red-400">
            {weekdays.map((w, idx) => (
              <div key={idx} className={`${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-red-400' : 'text-red-500'}`}>
                {w}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateKey = `${currentYear}-${currentMonth}-${day}`;
              const registeredReagent = logs[dateKey];
              const isToday = currentYear === realTodayYear && currentMonth === realTodayMonth && day === realTodayDay;

              return (
                <button
                  key={day}
                  onClick={() => handleAdministerDose(day)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative transition ${
                    registeredReagent
                      ? 'border-red-500 bg-red-950/60 text-red-200 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                      : isToday
                        ? 'border-red-500 bg-red-950/30 text-red-400 ring-1 ring-red-500'
                        : 'border-red-950 bg-black/50 text-red-600 hover:border-red-800'
                  }`}
                >
                  <span className={`text-[9px] font-bold ${isToday ? 'underline' : ''}`}>{String(day).padStart(2, '0')}</span>
                  <span className="mt-0.5 text-xs">
                    {registeredReagent ? reagents[registeredReagent].emoji : <span className="text-[8px] text-red-800">未</span>}
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
