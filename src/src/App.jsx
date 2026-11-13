import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award,
  Sparkles,
  RotateCcw,
  X,
  Lock
} from 'lucide-react';

const REAGENT_TYPES = [
  { id: 'capsule', name: 'カプセル製剤', emoji: '💊' },
  { id: 'syringe', name: 'シリンジワクチン', emoji: '💉' },
  { id: 'antibody', name: '抗体コードA', emoji: '☣️' },
  { id: 'serum', name: '培養血清', emoji: '🧪' },
];

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

const STORAGE_KEYS = {
  LOGS: 'vital_protocol_logs_v2',
  SELECTED_REAGENT: 'vital_protocol_selected_reagent_v2',
  SUBJECT_NAME: 'vital_protocol_subject_name_v2',
  SOUND_ENABLED: 'vital_protocol_sound_enabled_v2',
};

export default function App() {
  const [realToday] = useState(() => new Date(2026, 10, 13)); // 2026年11月13日

  const [logs, setLogs] = useState({});
  const [selectedReagent, setSelectedReagent] = useState('capsule');
  const [subjectName, setSubjectName] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(10); // 11月

  const [isInjecting, setIsInjecting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMatrixHighlighted, setIsMatrixHighlighted] = useState(false);

  const matrixRef = useRef(null);

  const realTodayYear = realToday.getFullYear();
  const realTodayMonth = realToday.getMonth() + 1;
  const realTodayDay = realToday.getDate();

  const todayKey = `${realTodayYear}-${realTodayMonth}-${realTodayDay}`;

  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) setLogs(JSON.parse(savedLogs));

      const savedReagent = localStorage.getItem(STORAGE_KEYS.SELECTED_REAGENT);
      if (savedReagent && REAGENT_TYPES.some((r) => r.id === savedReagent)) {
        setSelectedReagent(savedReagent);
      }

      const savedName = localStorage.getItem(STORAGE_KEYS.SUBJECT_NAME);
      if (savedName !== null) setSubjectName(savedName);

      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (err) {
      console.error(err);
    }
  }, [logs]);

  const handleSelectReagent = (id) => {
    setSelectedReagent(id);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_REAGENT, id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setSubjectName(value);
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECT_NAME, value);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const playInjectSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (err) {
      console.error(err);
    }
  };

  // 連続日数の正しい計算ロジック
  const calculateStreak = () => {
    let streak = 0;
    let cursor = new Date(realTodayYear, realTodayMonth - 1, realTodayDay);

    const cursorKey = `${cursor.getFullYear()}-${cursor.getMonth() + 1}-${cursor.getDate()}`;
    if (!logs[cursorKey]) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (true) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth() + 1;
      const d = cursor.getDate();
      const key = `${y}-${m}-${d}`;

      if (logs[key]) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const totalDoses = Object.keys(logs).length;
  const streakCount = calculateStreak();
  const isTodayDone = !!logs[todayKey];

  const scrollToMatrix = () => {
    setIsMatrixHighlighted(true);
    setTimeout(() => setIsMatrixHighlighted(false), 1000);
    setTimeout(() => {
      if (matrixRef.current) {
        matrixRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleTodayInject = () => {
    if (isTodayDone || isInjecting) return;
    setIsInjecting(true);
    playInjectSound();

    setViewYear(realTodayYear);
    setViewMonth(realTodayMonth - 1);

    setTimeout(() => {
      setLogs((prev) => ({ ...prev, [todayKey]: selectedReagent }));
      setIsInjecting(false);
      scrollToMatrix();
    }, 220);
  };

  const handleDateCellClick = (cellDate) => {
    const cellYear = cellDate.getFullYear();
    const cellMonth = cellDate.getMonth() + 1;
    const cellDay = cellDate.getDate();
    const key = `${cellYear}-${cellMonth}-${cellDay}`;

    if (cellDate > realToday) {
      triggerToast('未来のログには記録できません');
      return;
    }

    if (cellYear === realTodayYear && cellMonth === realTodayMonth && cellDay === realTodayDay) {
      if (!isTodayDone) {
        handleTodayInject();
      } else {
        triggerToast('本日の投与はすでに記録されています');
        scrollToMatrix();
      }
      return;
    }

    setLogs((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        updated[key] = selectedReagent;
        playInjectSound();
      }
      return updated;
    });
    scrollToMatrix();
  };

  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const getReagentEmoji = (reagentId) => {
    return REAGENT_TYPES.find((r) => r.id === reagentId)?.emoji || '💊';
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#F3F4F6', fontFamily: 'monospace', paddingBottom: '3rem' }}>
      <style>{`
        @keyframes stampSlam {
          0% { transform: scale(2.2) rotate(-20deg); opacity: 0; }
          65% { transform: scale(0.92) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-stamp-slam {
          animation: stampSlam 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* ヘッダー */}
      <header style={{ width: '100%', backgroundColor: '#140A0A', borderBottom: '1px solid #2A1212', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px', lineHeight: 1 }}>☣️</span>
            <h1 style={{ fontSize: '15px', fontWeight: 950, color: '#EF4444', letterSpacing: '0.08em', margin: 0 }}>
              VITAL PROTOCOL // DOSAGE LOG
            </h1>
          </div>
          <button
            onClick={toggleSound}
            style={{ padding: '8px', borderRadius: '9999px', background: '#2A1212', border: '1px solid #3A1A1A', cursor: 'pointer', color: '#9CA3AF' }}
          >
            {soundEnabled ? <Volume2 style={{ width: '18px', height: '18px' }} /> : <VolumeX style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>
      </header>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '64px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, backgroundColor: '#DC2626', color: '#FFF', fontSize: '13px', fontWeight: 700, padding: '10px 18px', borderRadius: '9999px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
          {toastMessage}
        </div>
      )}

      <main style={{ maxWidth: '32rem', margin: '0 auto', padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 実績カード（ラジオ体操風の2カラムレイアウト） */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
          <div style={{ backgroundColor: '#140A0A', borderRadius: '16px', padding: '16px', border: '1px solid #2A1212', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '9999px', backgroundColor: '#2A1212', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #3A1A1A' }}>
              <Flame style={{ width: '22px', height: '22px', color: '#EF4444' }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', margin: 0, letterSpacing: '0.05em' }}>連続投与日数</p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: '#EF4444', margin: '2px 0 0 0' }}>
                {streakCount} <span style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF' }}>日</span>
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: '#140A0A', borderRadius: '16px', padding: '16px', border: '1px solid #2A1212', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '9999px', backgroundColor: '#2A1212', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #3A1A1A' }}>
              <Trophy style={{ width: '22px', height: '22px', color: '#EF4444' }} />
            </div>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', margin: 0, letterSpacing: '0.05em' }}>通算投薬数</p>
              <p style={{ fontSize: '22px', fontWeight: 900, color: '#EF4444', margin: '2px 0 0 0' }}>
                {totalDoses} <span style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF' }}>個</span>
              </p>
            </div>
          </div>
        </section>

        {/* チェックインカード */}
        <section style={{ backgroundColor: '#140A0A', borderRadius: '24px', padding: '20px', border: '2px solid #EF4444', boxShadow: '0 6px 20px rgba(239,68,68,0.15)', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#9CA3AF', margin: 0 }}>
            本日: {realTodayYear}年{realTodayMonth}月{realTodayDay}日
          </p>

          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#F3F4F6', margin: '8px 0 16px 0' }}>
            本日のワクチン・抗ウイルス剤 投与完了
          </h2>

          <div>
            {isTodayDone ? (
              <div style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: '#14281A', border: '2px solid #1E4620', color: '#4ADE80', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}>
                <CheckCircle2 style={{ width: '22px', height: '22px' }} />
                <span>本日の投与は記録済みです！</span>
              </div>
            ) : (
              <button
                onClick={handleTodayInject}
                disabled={isInjecting}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(to bottom, #EF4444, #DC2626)',
                  color: '#FFF',
                  fontWeight: 900,
                  fontSize: '17px',
                  boxShadow: '0 6px 0 #991B1B, 0 10px 20px rgba(239,68,68,0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '22px' }}>💉</span>
                <span>投与を記録する</span>
              </button>
            )}
          </div>

          {/* 試薬デザイン選択（ボタンをカード風の丸形横並びに） */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #2A1212', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {REAGENT_TYPES.map((reagent) => {
              const isSelected = selectedReagent === reagent.id;
              return (
                <button
                  key={reagent.id}
                  type="button"
                  onClick={() => handleSelectReagent(reagent.id)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isSelected ? '2px solid #EF4444' : '1px solid #2A1212',
                    backgroundColor: isSelected ? '#2A1212' : '#0F0707',
                    boxShadow: isSelected ? '0 4px 12px rgba(239,68,68,0.4)' : 'none',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                  }}
                  title={reagent.name}
                >
                  <span style={{ fontSize: '22px' }}>{reagent.emoji}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 投薬記録表（カレンダーカードエリア） */}
        <section 
          ref={matrixRef}
          style={{
            backgroundColor: '#140A0A',
            borderRadius: '24px',
            padding: '20px',
            border: isMatrixHighlighted ? '2px solid #EF4444' : '2px solid #2A1212',
            boxShadow: isMatrixHighlighted ? '0 0 30px rgba(239,68,68,0.35)' : '0 4px 12px rgba(0,0,0,0.4)',
            transition: 'all 0.7s'
          }}
        >
          <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '2px dashed #2A1212' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', color: '#9CA3AF', margin: 0, textTransform: 'uppercase' }}>
              CLINICAL TRIAL MATRIX
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <button onClick={() => setViewMonth((m) => (m === 0 ? 11 : m - 1))} style={{ padding: '8px', borderRadius: '9999px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                <ChevronLeft style={{ width: '22px', height: '22px' }} />
              </button>

              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#F3F4F6', margin: 0 }}>
                {viewYear}年{viewMonth + 1}月 投薬記録表
              </h2>

              <button onClick={() => setViewMonth((m) => (m === 11 ? 0 : m + 1))} style={{ padding: '8px', borderRadius: '9999px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                <ChevronRight style={{ width: '22px', height: '22px' }} />
              </button>
            </div>

            <div style={{ marginTop: '12px', backgroundColor: '#0F0707', border: '1px solid #2A1212', borderRadius: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '320px', margin: '12px auto 0' }}>
              <label htmlFor="subject-name-input" style={{ fontSize: '12px', fontWeight: 800, color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                被験者：
              </label>
              <input
                id="subject-name-input"
                type="text"
                value={subjectName}
                onChange={handleNameChange}
                placeholder="被験者名を入力..."
                maxLength={24}
                style={{ width: '100%', backgroundColor: 'transparent', fontSize: '13px', fontWeight: 700, color: '#F3F4F6', border: 'none', outline: 'none', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px', marginTop: '16px', marginBottom: '6px', textAlign: 'center' }}>
            {WEEKDAYS.map((dayName, idx) => (
              <div
                key={dayName}
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 0',
                  borderRadius: '6px',
                  color: idx === 0 ? '#EF4444' : idx === 6 ? '#38BDF8' : '#9CA3AF',
                  backgroundColor: idx === 0 ? '#2A1212' : idx === 6 ? '#0F1E2E' : '#1A1212'
                }}
              >
                {dayName}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
            {calendarCells.map((cellDate, index) => {
              if (!cellDate) {
                return <div key={`empty-${index}`} style={{ aspectRatio: '1', borderRadius: '12px', backgroundColor: 'rgba(20,10,10,0.4)' }} />;
              }

              const y = cellDate.getFullYear();
              const m = cellDate.getMonth() + 1;
              const d = cellDate.getDate();
              const key = `${y}-${m}-${d}`;
              const loggedReagent = logs[key];
              const isTodayCell = y === realTodayYear && m === realTodayMonth && d === realTodayDay;
              const isFuture = cellDate > realToday;
              const dayOfWeek = cellDate.getDay();

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDateCellClick(cellDate)}
                  disabled={isFuture}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '12px',
                    border: isTodayCell ? '2px solid #EF4444' : isFuture ? '1px solid rgba(42,18,18,0.5)' : '1px solid #2A1212',
                    backgroundColor: isTodayCell ? '#1F0C0C' : isFuture ? '#0A0A0A' : '#0F0707',
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px',
                    position: 'relative'
                  }}
                >
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: isTodayCell ? '#EF4444' : dayOfWeek === 0 ? '#EF4444' : dayOfWeek === 6 ? '#38BDF8' : '#9CA3AF' }}>
                      {d}
                    </span>
                    {isTodayCell && (
                      <span style={{ fontSize: '7px', fontWeight: 900, color: '#FFF', backgroundColor: '#EF4444', padding: '0 2px', borderRadius: '2px' }}>今日</span>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    {loggedReagent ? (
                      <div className="animate-stamp-slam" style={{ width: '30px', height: '30px', borderRadius: '9999px', border: '2px solid #EF4444', backgroundColor: '#2A1212', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '15px', lineHeight: 1 }}>{getReagentEmoji(loggedReagent)}</span>
                      </div>
                    ) : isFuture ? (
                      <Lock style={{ width: '12px', height: '12px', color: '#4B5563' }} />
                    ) : (
                      <div style={{ width: '26px', height: '26px', borderRadius: '9999px', border: '1px dashed #2A1212' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p style={{ marginTop: '16px', fontSize: '11px', color: '#9CA3AF', textAlign: 'center', lineHeight: '1.5' }}>
            ※ タップすると任意の過去日の投薬ログの記録・取り消しができます（未来日はロック）。
          </p>
        </section>

        <div style={{ textAlign: 'center', paddingTop: '4px' }}>
          <p style={{ fontSize: '10px', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            CONFIDENTIAL // UMBRELLA BIO-LAB SYSTEM v3.5
          </p>
        </div>
      </main>
    </div>
  );
}
