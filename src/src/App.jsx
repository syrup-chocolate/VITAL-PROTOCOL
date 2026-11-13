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
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#EF4444', fontFamily: 'monospace', paddingBottom: '3rem' }}>
      <header style={{ width: '100%', backgroundColor: '#140A0A', borderBottom: '1px solid #2A1212', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>☣️</span>
            <div>
              <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0, letterSpacing: '0.05em' }}>MEDICAL RESEARCH // LAB-OS</p>
              <h1 style={{ fontSize: '14px', fontWeight: 900, color: '#EF4444', letterSpacing: '0.1em', margin: 0 }}>
                VITAL PROTOCOL // DOSAGE LOG
              </h1>
            </div>
          </div>
          <button onClick={toggleSound} style={{ background: 'transparent', border: '1px solid #2A1212', borderRadius: '6px', padding: '6px', color: '#9CA3AF', cursor: 'pointer' }}>
            {soundEnabled ? <Volume2 style={{ width: '18px', height: '18px' }} /> : <VolumeX style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>
      </header>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '64px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, backgroundColor: '#B91C1C', color: '#FFF', fontSize: '12px', fontWeight: 700, padding: '8px 16px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
          {toastMessage}
        </div>
      )}

      <main style={{ maxWidth: '32rem', margin: '0 auto', padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* テレメトリーステータス */}
        <div style={{ backgroundColor: '#140A0A', borderRadius: '12px', padding: '12px 16px', border: '1px solid #2A1212', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px' }}>⚠️</span>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 700 }}>VITAL TELEMETRY:</span>
            <span style={{ fontSize: '11px', color: '#EF4444', fontWeight: 900 }}>STABLE / {isTodayDone ? 'DOSAGE CONFIRMED' : 'PENDING'}</span>
          </div>
        </div>

        {/* スタッツ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#140A0A', borderRadius: '12px', padding: '16px', border: '1px solid #2A1212' }}>
            <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0, fontWeight: 700, letterSpacing: '0.05em' }}>SURVIVAL STREAK 連続投与日数</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: '#EF4444', margin: '4px 0 0 0' }}>
              {streakCount} <span style={{ fontSize: '12px', color: '#9CA3AF' }}>DAYS</span>
            </p>
          </div>
          <div style={{ backgroundColor: '#140A0A', borderRadius: '12px', padding: '16px', border: '1px solid #2A1212' }}>
            <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0, fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL DOSES 通算投薬数</p>
            <p style={{ fontSize: '24px', fontWeight: 900, color: '#EF4444', margin: '4px 0 0 0' }}>
              {totalDoses} <span style={{ fontSize: '12px', color: '#9CA3AF' }}>UNITS</span>
            </p>
          </div>
        </section>

        {/* チェックインカード */}
        <section style={{ backgroundColor: '#140A0A', borderRadius: '16px', padding: '20px', border: '1px solid #2A1212', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>DATE: {realTodayYear} . {realTodayMonth} . {realTodayDay}</span>
            <span style={{ fontSize: '10px', color: '#EF4444', border: '1px solid #2A1212', padding: '2px 6px', borderRadius: '4px' }}>SECURE TERMINAL</span>
          </div>

          {isTodayDone ? (
            <div style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#14281A', border: '1px solid #1E4620', color: '#4ADE80', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box', margin: '12px 0' }}>
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
                borderRadius: '12px',
                backgroundColor: '#DC2626',
                color: '#FFF',
                fontWeight: 900,
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
                margin: '12px 0'
              }}
            >
              本日のワクチン・抗ウイルス剤 投与完了
            </button>
          )}

          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 16px 0' }}>バイタル数値は正常範囲内を維持しています。</p>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #2A1212' }}>
            <p style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'left', marginBottom: '8px', fontWeight: 700 }}>REAGENT TYPE:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              {REAGENT_TYPES.map((reagent) => {
                const isSelected = selectedReagent === reagent.id;
                return (
                  <button
                    key={reagent.id}
                    type="button"
                    onClick={() => handleSelectReagent(reagent.id)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #EF4444' : '1px solid #2A1212',
                      backgroundColor: isSelected ? '#2A1212' : '#0A0A0A',
                      color: isSelected ? '#EF4444' : '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{reagent.emoji}</span>
                    <span>{reagent.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 投薬記録表 */}
        <section
          ref={matrixRef}
          style={{
            backgroundColor: '#140A0A',
            borderRadius: '16px',
            padding: '20px',
            border: isMatrixHighlighted ? '2px solid #EF4444' : '1px solid #2A1212',
            transition: 'all 0.5s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px dashed #2A1212', paddingBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0, fontWeight: 700 }}>CLINICAL TRIAL MATRIX</p>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F3F4F6', margin: '2px 0 0 0' }}>
                {viewYear}年 {viewMonth + 1}月 投薬記録表
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setViewMonth((m) => (m === 0 ? 11 : m - 1))} style={{ background: '#0A0A0A', border: '1px solid #2A1212', borderRadius: '4px', color: '#9CA3AF', cursor: 'pointer', padding: '6px' }}>
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
              </button>
              <button onClick={() => setViewMonth((m) => (m === 11 ? 0 : m + 1))} style={{ background: '#0A0A0A', border: '1px solid #2A1212', borderRadius: '4px', color: '#9CA3AF', cursor: 'pointer', padding: '6px' }}>
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={subjectName}
              onChange={handleNameChange}
              placeholder="SUBJECT ID / NAME: 被験者名を入力..."
              maxLength={32}
              style={{ width: '100%', backgroundColor: '#0A0A0A', border: '1px solid #2A1212', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#F3F4F6', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px', marginBottom: '8px', textAlign: 'center' }}>
            {WEEKDAYS.map((w, idx) => (
              <div key={w} style={{ fontSize: '11px', color: idx === 0 ? '#EF4444' : idx === 6 ? '#38BDF8' : '#9CA3AF', fontWeight: 700 }}>
                {w}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
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
                    borderRadius: '8px',
                    border: isTodayCell ? '1px solid #EF4444' : '1px solid #2A1212',
                    backgroundColor: loggedReagent ? '#2A1212' : '#0A0A0A',
                    color: loggedReagent ? '#EF4444' : '#6B7280',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    opacity: isFuture ? 0.3 : 1
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700 }}>{String(d).padStart(2, '0')}</span>
                  <span style={{ fontSize: '12px', marginTop: '2px' }}>{loggedReagent ? getReagentEmoji(loggedReagent) : '未'}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <p style={{ fontSize: '10px', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            CONFIDENTIAL // UMBRELLA BIO-LAB SYSTEM v3.4.2
          </p>
        </div>
      </main>
    </div>
  );
}
