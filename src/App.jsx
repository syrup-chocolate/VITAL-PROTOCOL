import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Flame,
  Trophy,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Syringe,
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
  LOGS: 'vital_protocol_logs_v9',
  SELECTED_REAGENT: 'vital_protocol_selected_reagent_v9',
  SUBJECT_NAME: 'vital_protocol_subject_name_v9',
  SOUND_ENABLED: 'vital_protocol_sound_enabled_v9',
};

export default function App() {
  const [realToday] = useState(() => new Date(2026, 10, 13)); // 2026年11月13日

  const [logs, setLogs] = useState({});
  const [selectedReagent, setSelectedReagent] = useState('syringe');
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

    if (logs[todayKey]) {
      setLogs((prev) => ({ ...prev, [todayKey]: id }));
      playInjectSound();
      triggerToast('本日のスタンプを別の試薬に変更しました');
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

  const playRemoveSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
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
    if (isInjecting) return;
    setIsInjecting(true);

    setViewYear(realTodayYear);
    setViewMonth(realTodayMonth - 1);

    setTimeout(() => {
      setLogs((prev) => {
        const updated = { ...prev };
        if (updated[todayKey]) {
          delete updated[todayKey];
          playRemoveSound();
          triggerToast('本日の投薬ログを取り消しました');
        } else {
          updated[todayKey] = selectedReagent;
          playInjectSound();
          triggerToast('本日の投与を記録しました！');
        }
        return updated;
      });
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

    setLogs((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        if (updated[key] === selectedReagent) {
          delete updated[key];
          playRemoveSound();
          triggerToast('投薬ログを削除しました');
        } else {
          updated[key] = selectedReagent;
          playInjectSound();
          triggerToast('別の試薬に変更しました');
        }
      } else {
        updated[key] = selectedReagent;
        playInjectSound();
        triggerToast(cellYear === realTodayYear && cellMonth === realTodayMonth && cellDay === realTodayDay ? '本日の投与を記録しました！' : '過去の投与を記録しました');
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
    <div className="shutter-bg" style={{ minHeight: '100vh', color: '#F3F4F6', fontFamily: 'monospace', paddingBottom: '3rem' }}>
      <style>{`
        /* シャッター・スキャンライン風のテクスチャー背景 */
        .shutter-bg {
          background-color: #080303;
          background-image: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.45) 50%
          ), linear-gradient(
            90deg,
            rgba(255, 0, 0, 0.03),
            rgba(0, 255, 0, 0.01),
            rgba(0, 0, 255, 0.03)
          );
          background-size: 100% 4px, 6px 100%;
        }

        @keyframes emergencyBlinkSlow {
          0% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.9)); }
          50% { opacity: 0.25; transform: scale(0.93); filter: drop-shadow(0 0 0px rgba(239, 68, 68, 0)); }
          100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.9)); }
        }
        .animate-blink-slow {
          animation: emergencyBlinkSlow 2.2s infinite ease-in-out;
        }
        .hazard-border {
          border: 1px solid #7F1D1D;
          background: repeating-linear-gradient(
            45deg,
            #140505,
            #140505 10px,
            #1C0808 10px,
            #1C0808 20px
          );
        }
      `}</style>

      {/* トップハザードバー */}
      <div className="hazard-border" style={{ width: '100%', height: '8px' }} />

      {/* ヘッダー */}
      <header style={{ width: '100%', backgroundColor: '#0F0505', borderBottom: '1px solid #7F1D1D', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '32rem', margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="animate-blink-slow" style={{ fontSize: '24px', lineHeight: 1 }}>☣️</span>
            <div>
              <p style={{ fontSize: '9px', color: '#9CA3AF', margin: 0, letterSpacing: '0.1em' }}>MEDICAL RESEARCH // LAB-OS</p>
              <h1 style={{ fontSize: '13px', fontWeight: 900, color: '#EF4444', letterSpacing: '0.12em', margin: 0 }}>
                VITAL PROTOCOL // DOSAGE LOG
              </h1>
            </div>
          </div>
          <button
            onClick={toggleSound}
            style={{ padding: '6px', borderRadius: '4px', background: '#1A0808', border: '1px solid #7F1D1D', cursor: 'pointer', color: '#EF4444' }}
          >
            {soundEnabled ? <Volume2 style={{ width: '18px', height: '18px' }} /> : <VolumeX style={{ width: '18px', height: '18px' }} />}
          </button>
        </div>
      </header>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '64px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, backgroundColor: '#DC2626', color: '#FFF', fontSize: '12px', fontWeight: 700, padding: '8px 16px', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>
          {toastMessage}
        </div>
      )}

      <main style={{ maxWidth: '32rem', margin: '0 auto', padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* VITAL TELEMETRY ステータスカード */}
        <div style={{ backgroundColor: '#0F0505', borderRadius: '8px', padding: '14px 16px', border: '1px solid #7F1D1D', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle style={{ width: '18px', height: '18px', color: '#EF4444' }} />
            <div>
              <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0, letterSpacing: '0.05em' }}>VITAL TELEMETRY</p>
              <p style={{ fontSize: '12px', fontWeight: 900, color: isTodayDone ? '#34D399' : '#EF4444', margin: '2px 0 0 0', letterSpacing: '0.05em' }}>
                STATUS: {isTodayDone ? 'STABLE / DOSAGE CONFIRMED' : 'CRITICAL / DOSAGE REQUIRED'}
              </p>
            </div>
          </div>
          <Activity className="animate-blink-slow" style={{ width: '22px', height: '22px', color: '#EF4444' }} />
        </div>

        {/* スタッツ（左右レイアウト） */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          
          <div style={{ backgroundColor: '#0F0505', borderRadius: '12px', padding: '16px', border: '1px solid #7F1D1D', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#2A0B0B', border: '1px solid #7F1D1D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Activity style={{ width: '22px', height: '22px', color: '#EF4444' }} />
            </div>
            <div>
              <p style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>SURVIVAL STREAK</p>
              <p style={{ fontSize: '9px', color: '#9CA3AF', margin: '1px 0 4px 0' }}>連続投与日数</p>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#EF4444', margin: 0 }}>
                {streakCount} <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>DAYS</span>
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: '#0F0505', borderRadius: '12px', padding: '16px', border: '1px solid #7F1D1D', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#2A0B0B', border: '1px solid #7F1D1D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Syringe style={{ width: '22px', height: '22px', color: '#EF4444' }} />
            </div>
            <div>
              <p style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>TOTAL DOSES</p>
              <p style={{ fontSize: '9px', color: '#9CA3AF', margin: '1px 0 4px 0' }}>通算投薬数</p>
              <p style={{ fontSize: '20px', fontWeight: 900, color: '#EF4444', margin: 0 }}>
                {totalDoses} <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF' }}>UNITS</span>
              </p>
            </div>
          </div>

        </section>

        {/* メインアクションカード */}
        <section style={{ backgroundColor: '#0F0505', borderRadius: '12px', padding: '18px', border: '1px solid #7F1D1D', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '8px', left: '8px', width: '6px', height: '6px', borderTop: '2px solid #EF4444', borderLeft: '2px solid #EF4444' }} />
          <div style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderTop: '2px solid #EF4444', borderRight: '2px solid #EF4444' }} />
          <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '6px', height: '6px', borderBottom: '2px solid #EF4444', borderLeft: '2px solid #EF4444' }} />
          <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '6px', height: '6px', borderBottom: '2px solid #EF4444', borderRight: '2px solid #EF4444' }} />

          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', border: '1px solid #7F1D1D', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#1A0808' }}>
              DATE: {realTodayYear}.{String(realTodayMonth).padStart(2, '0')}.{String(realTodayDay).padStart(2, '0')}
            </span>
            <p style={{ fontSize: '12px', color: '#D1D5DB', margin: '12px 0 14px 0', lineHeight: '1.5' }}>
              感染進行を抑制するため、本日の投薬プロトコルを実行してください。
            </p>

            <button
              onClick={handleTodayInject}
              disabled={isInjecting}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                background: isTodayDone 
                  ? '#064E3B' 
                  : 'repeating-linear-gradient(45deg, #DC2626, #DC2626 10px, #B91C1C 10px, #B91C1C 20px)',
                color: '#FFF',
                fontWeight: 900,
                fontSize: '15px',
                border: isTodayDone ? '1px solid #059669' : '1px solid #EF4444',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(220,38,38,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                letterSpacing: '0.05em'
              }}
            >
              <span>{isTodayDone ? '✅' : '💉'}</span>
              <span>{isTodayDone ? 'ADMINISTER DOSE ( 投与完了・タップで取消 )' : 'ADMINISTER DOSE ( 本日の投与を記録 )'}</span>
            </button>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #7F1D1D' }}>
            <p style={{ fontSize: '10px', color: '#9CA3AF', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.05em' }}>REAGENT TYPE (選択中の試薬):</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px' }}>
              {REAGENT_TYPES.map((reagent) => {
                const isSelected = selectedReagent === reagent.id;
                return (
                  <button
                    key={reagent.id}
                    type="button"
                    onClick={() => handleSelectReagent(reagent.id)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #EF4444' : '1px solid #7F1D1D',
                      backgroundColor: isSelected ? '#2A0B0B' : '#0A0202',
                      color: isSelected ? '#EF4444' : '#9CA3AF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{reagent.emoji}</span>
                    <span style={{ fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{reagent.name}</span>
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
            backgroundColor: '#0F0505',
            borderRadius: '12px',
            padding: '16px',
            border: isMatrixHighlighted ? '2px solid #EF4444' : '1px solid #7F1D1D',
            transition: 'all 0.5s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed #7F1D1D', paddingBottom: '10px' }}>
            <button onClick={() => setViewMonth((m) => (m === 0 ? 11 : m - 1))} style={{ background: '#1A0808', border: '1px solid #7F1D1D', borderRadius: '4px', color: '#9CA3AF', cursor: 'pointer', padding: '6px' }}>
              <ChevronLeft style={{ width: '18px', height: '18px' }} />
            </button>
            <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#F3F4F6', margin: 0, letterSpacing: '0.05em' }}>
              {viewYear}年 {viewMonth + 1}月 投薬記録表
            </h3>
            <button onClick={() => setViewMonth((m) => (m === 11 ? 0 : m + 1))} style={{ background: '#1A0808', border: '1px solid #7F1D1D', borderRadius: '4px', color: '#9CA3AF', cursor: 'pointer', padding: '6px' }}>
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={subjectName}
              onChange={handleNameChange}
              placeholder="SUBJECT ID / NAME: 被験者名を入力..."
              maxLength={32}
              style={{ width: '100%', backgroundColor: '#0A0202', border: '1px solid #7F1D1D', borderRadius: '4px', padding: '8px 12px', fontSize: '11px', color: '#F3F4F6', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '4px', marginBottom: '6px', textAlign: 'center' }}>
            {WEEKDAYS.map((w, idx) => (
              <div key={w} style={{ fontSize: '10px', color: idx === 0 ? '#EF4444' : idx === 6 ? '#38BDF8' : '#9CA3AF', fontWeight: 700 }}>
                {w}
              </div>
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
              const dayOfWeek = cellDate.getDay();

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDateCellClick(cellDate)}
                  disabled={isFuture}
                  style={{
                    aspectRatio: '1',
                    borderRadius: '6px',
                    border: isTodayCell ? '1px solid #EF4444' : '1px solid #3A1010',
                    backgroundColor: loggedReagent ? '#2A0B0B' : '#0A0202',
                    color: loggedReagent ? '#EF4444' : '#6B7280',
                    fontSize: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isFuture ? 'not-allowed' : 'pointer',
                    opacity: isFuture ? 0.3 : 1
                  }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: isTodayCell ? '#EF4444' : dayOfWeek === 0 ? '#EF4444' : dayOfWeek === 6 ? '#38BDF8' : '#9CA3AF' }}>
                    {d}
                  </span>
                  <span style={{ fontSize: '12px', marginTop: '1px' }}>{loggedReagent ? getReagentEmoji(loggedReagent) : ''}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ボトムハザードバー */}
        <div className="hazard-border" style={{ width: '100%', height: '8px', marginTop: '8px' }} />

        <div style={{ textAlign: 'center', paddingBottom: '4px' }}>
          <p style={{ fontSize: '9px', color: '#6B7280', margin: 0, letterSpacing: '0.05em' }}>
            CONFIDENTIAL // UMBRELLA BIO-LAB SYSTEM v3.5
          </p>
        </div>
      </main>
    </div>
  );
}
