import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Play, Pause, Square, MapPin, Clock, TrendingUp, PawPrint, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

// 산책 기록 타입
interface WalkRecord {
  id: number;
  date: string;
  duration: number; // 초 단위
  formattedDuration: string;
}

const WalkTimerScreen = ({ onBack, onCompleteCare, onShareWalk }: { onBack: () => void, onCompleteCare?: (id: string) => void, onShareWalk?: (duration: number) => void }) => {
  const { t, i18n } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  // 산책 완료 후 마지막 기록 (공유 버튼 표시용)
  const [lastCompletedWalk, setLastCompletedWalk] = useState<number | null>(null);
  const [records, setRecords] = useState<WalkRecord[]>(() => {
    try {
      const saved = localStorage.getItem('petgenie_walk_records');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 타이머 로직
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // 시간 포맷팅 (HH:MM:SS)
  const formatTime = useCallback((totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 짧은 포맷 (기록용)
  const formatDuration = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainMins = mins % 60;
      return `${hrs}${t('walk.hours', '시간')} ${remainMins}${t('walk.minutes', '분')}`;
    }
    return `${mins}${t('walk.minutes', '분')} ${secs}${t('walk.seconds', '초')}`;
  }, [t]);

  // 산책 시작/일시정지
  const toggleTimer = () => setIsRunning(!isRunning);

  // 산책 종료 및 기록 저장
  const stopWalk = () => {
    if (seconds < 10) {
      setIsRunning(false);
      setSeconds(0);
      return;
    }
    setIsRunning(false);
    const record: WalkRecord = {
      id: Date.now(),
      date: new Date().toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
      duration: seconds,
      formattedDuration: formatDuration(seconds),
    };
    const newRecords = [record, ...records].slice(0, 20); // 최근 20개만 유지
    setRecords(newRecords);
    try { localStorage.setItem('petgenie_walk_records', JSON.stringify(newRecords)); } catch {}
    // 마지막 완료된 산책 시간 저장 (공유 버튼 표시용)
    setLastCompletedWalk(seconds);
    setSeconds(0);

    // 데일리 케어의 '산책' 항목 자동 완료
    if (onCompleteCare) onCompleteCare('walk');
  };

  // 오늘의 총 산책 시간
  const todayTotal = records
    .filter(r => {
      const today = new Date().toDateString();
      // 대략적인 날짜 비교 (같은 날)
      return r.date.includes(new Date().getDate().toString());
    })
    .reduce((sum, r) => sum + r.duration, 0);

  // 이번 주 산책 횟수
  const weekCount = records.filter(r => {
    const recordDate = new Date(r.id);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return recordDate > weekAgo;
  }).length;

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} title={t('common.back', '뒤로가기')} aria-label={t('common.back', '뒤로가기')} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('walk.title', '산책 타이머')}</h1>
      </header>

      <div className="p-6 space-y-8">
        {/* 타이머 원형 디스플레이 */}
        <div className="flex flex-col items-center">
          <motion.div
            animate={isRunning ? { boxShadow: '0 0 60px rgba(16, 185, 129, 0.3)' } : { boxShadow: '0 0 0px rgba(16, 185, 129, 0)' }}
            className={cn(
              "w-56 h-56 rounded-full border-4 flex flex-col items-center justify-center transition-colors duration-500",
              isRunning ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-700 bg-white/5"
            )}
          >
            <PawPrint className={cn("w-8 h-8 mb-3", isRunning ? "text-emerald-400" : "text-zinc-500")} />
            <span className={cn("text-4xl font-mono font-bold tracking-wider", isRunning ? "text-emerald-400" : "text-white")}>
              {formatTime(seconds)}
            </span>
            <span className="text-zinc-500 text-xs mt-2 font-medium">
              {isRunning ? t('walk.walking', '산책 중...') : seconds > 0 ? t('walk.paused', '일시정지') : t('walk.ready', '준비')}
            </span>
          </motion.div>

          {/* 컨트롤 버튼 */}
          <div className="flex items-center gap-6 mt-8">
            {seconds > 0 && (
              <button
                onClick={stopWalk}
                title={t('walk.stop', '정지')}
                aria-label={t('walk.stop', '정지')}
                className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Square className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={toggleTimer}
              title={isRunning ? t('walk.pause', '일시정지') : t('walk.start', '시작')}
              aria-label={isRunning ? t('walk.pause', '일시정지') : t('walk.start', '시작')}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center active:scale-90 transition-all shadow-xl",
                isRunning
                  ? "bg-amber-500 text-black shadow-amber-500/30"
                  : "bg-emerald-500 text-black shadow-emerald-500/30"
              )}
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
          </div>
          </div>

          {/* 산책 완료 후 커뮤니티 공유 버튼 (1분 이상 산책 시에만 표시) */}
          {lastCompletedWalk && lastCompletedWalk >= 60 && onShareWalk && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <button
                onClick={() => {
                  onShareWalk(lastCompletedWalk);
                  setLastCompletedWalk(null);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/20"
                title={t('community.share_walk', '커뮤니티에 공유')}
                aria-label={t('community.share_walk', '커뮤니티에 공유')}
              >
                <Share2 className="w-5 h-5" />
                <span>{t('community.share_walk', '커뮤니티에 공유')}</span>
                <span className="text-emerald-200 text-xs">🐾</span>
              </button>
            </motion.div>
          )}

          {/* 오늘의 통계 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
            <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{formatDuration(todayTotal)}</p>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('walk.today_total', '오늘 총 산책')}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 text-center">
            <TrendingUp className="w-5 h-5 text-sky-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{weekCount}{t('walk.times', '회')}</p>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('walk.week_count', '이번 주')}</p>
          </div>
        </div>

        {/* 최근 산책 기록 */}
        {records.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 px-1">{t('walk.recent', '최근 기록')}</h3>
            {records.slice(0, 7).map((record) => (
              <div key={record.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <PawPrint className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-zinc-400 text-xs">{record.date}</span>
                </div>
                <span className="text-white font-bold text-sm">{record.formattedDuration}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalkTimerScreen;
