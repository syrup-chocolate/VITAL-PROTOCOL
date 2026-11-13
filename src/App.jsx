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
  LOGS: 'vital_protocol_logs_v1',
  SELECTED_REAGENT: 'vital_protocol_selected_reagent_v1',
  SUBJECT_NAME: 'vital_protocol_subject_name_v1',
  SOUND_ENABLED: 'vital_protocol_sound_enabled_v1',
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
  const [celebrationModal, setCelebrationModal] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isMatrixHighlighted, setIsMatrixHighlighted] = useState(false);

  const matrixRef = useRef(null);

  const realTodayYear = realToday.getFullYear();
  const realTodayMonth = realToday.getMonth() + 1;
  const realTodayDay = realToday.getDate();

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}-${m}-${d}`;
  };

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
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace', paddingBottom: '3rem' }}>
      <header style={{ width: '100%', backgroundColor: '#1e293b', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>☣️</span>
            <h1 style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8', letterSpacing: '0.1em', margin: 0 }}>
              VITAL PROTOCOL // LAB-OS
            </h1>
          </div>
          <button onClick={toggleSound} style={{ background: 'transparent', border: '1px solid #334155', borderRadius: '4px', padding: '6px', color: '#94a3b8', cursor: 'pointer' }}>
            {soundEnabled ? <Volume2 style={{ width: '18px', height: '18px' }} /> : <VolumeX style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>
      </header>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, backgroundColor: '#0284c7', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '8px 16px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
          {toastMessage}
        </div>
      )}

      <main style={{ maxWidth: '36rem', margin: '0 auto', padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <section style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '16px', border: '1px solid #334155', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>SURVIVAL STREAK</p>
            <p style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8', margin: '4px 0 0 0' }}>
              {streakCount} <span style={{ fontSize: '12px', color: '#94a3b8' }}>DAYS</span>
            </p>
          </div>
          <div>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>TOTAL DOSES</p>
            <p style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8', margin: '4px 0 0 0' }}>
              {totalDoses} <span style={{ fontSize: '12px', color: '#94a3b8' }}>UNITS</span>
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '20px', border: '1px solid #334155', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>DATE: {realTodayYear} . {realTodayMonth} . {realTodayDay}</p>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', margin: '8px 0 16px 0' }}>
            本日のワクチン・抗ウイルス剤 投与完了
          </h2>

          <div>
            {isTodayDone ? (
              <div style={{ width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: '#064e3b', border: '1px solid #059669', color: '#34d399', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}>
                <CheckCircle2 style={{ width: '20px', height: '20px' }} />
                <span>DOSAGE CONFIRMED</span>
              </div>
            ) : (
              <button
                onClick={handleTodayInject}
                disabled={isInjecting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '6px',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(2,132,199,0.4)'
                }}
              >
                投与を記録する
              </button>
            )}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {REAGENT_TYPES.map((reagent) => {
              const isSelected = selectedReagent === reagent.id;
              return (
                <button
                  key={reagent.id}
                  type="button"
                  onClick={() => handleSelectReagent(reagent.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: isSelected ? '#0369a1' : '#0f172a',
                    color: isSelected ? '#fff' : '#94a3b8'
                  }}
                >
                  {reagent.emoji} {reagent.name}
                </button>
              );
            })}
          </div>
        </section>

        <section
          ref={matrixRef}
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            padding: '16px',
            border: isMatrixHighlighted ? '2px solid #38bdf8' : '1px solid #334155',
            transition: 'all 0.5s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button onClick={() => setViewMonth((m) => (m === 0 ? 11 : m - 1))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {viewYear}年 {viewMonth + 1}月 投薬記録表
            </h3>
            <button onClick={() => setViewMonth((m) => (m === 11 ? 0 : m + 1))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px', marginBottom: '6px', textAlign: 'center' }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{w}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px' }}>
            {calendarCells.map((cellDate, idx) => {
              if (!cellDate) return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;

              const y = cellDate.getFullYear();
              const m = cellDate.getMonth() + 1;
              const d = cellDate.getDate();
              const key = `${y}-${m}-${d}`;
              const loggedReagent = logs[key];
              const isTodayCell = y === realTodayYear && m === realTodayMonth && d === realTodayDay;
              const isFuture = cellDate > realToday;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDateCellClick(cellDate)}
                  disabled={isFuture}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '4px',
                    border: isTodayCell ? '1px solid #38bdf8' : '1px solid #334155',
                    backgroundColor: loggedReagent ? '#0f766e' : isFuture ? '#0f172a' : '#0f172a',
                    color: loggedReagent ? '#fff' : '#64748b',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    opacity: isFuture ? 0.4 : 1
                  }}
                >
                  <span style={{ fontSize: '9px' }}>{d}</span>
                  <span style={{ fontSize: '12px' }}>{loggedReagent ? getReagentEmoji(loggedReagent) : ''}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
