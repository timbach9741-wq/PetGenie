import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Weight, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

// 체중 기록 타입
interface WeightEntry {
  id: number;
  date: string;
  weight: number;
  unit: string;
}

const WeightTrackerScreen = ({ onBack }: { onBack: () => void }) => {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<WeightEntry[]>(() => {
    try {
      const saved = localStorage.getItem('petgenie_weight_records');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [inputWeight, setInputWeight] = useState('');
  const [showInput, setShowInput] = useState(false);

  // 체중 기록 추가
  const addEntry = () => {
    const weight = parseFloat(inputWeight);
    if (isNaN(weight) || weight <= 0 || weight > 200) return;

    const entry: WeightEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }),
      weight,
      unit: 'kg',
    };
    const newEntries = [entry, ...entries].slice(0, 50);
    setEntries(newEntries);
    try { localStorage.setItem('petgenie_weight_records', JSON.stringify(newEntries)); } catch {}
    setInputWeight('');
    setShowInput(false);
  };

  // 기록 삭제
  const deleteEntry = (id: number) => {
    const newEntries = entries.filter(e => e.id !== id);
    setEntries(newEntries);
    try { localStorage.setItem('petgenie_weight_records', JSON.stringify(newEntries)); } catch {}
  };

  // 변화량 계산
  const getChange = () => {
    if (entries.length < 2) return null;
    const diff = entries[0].weight - entries[1].weight;
    return { value: diff, formatted: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg` };
  };

  const change = getChange();
  const latest = entries[0];
  const maxWeight = entries.length > 0 ? Math.max(...entries.map(e => e.weight)) : 0;

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} title={t('common.back', '뒤로가기')} aria-label={t('common.back', '뒤로가기')} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('weight.title', '체중 변화 추적')}</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* 현재 체중 카드 */}
        <div className="bg-gradient-to-br from-sky-900/30 to-black rounded-2xl p-6 border border-sky-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('weight.current', '현재 체중')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">
                  {latest ? latest.weight.toFixed(1) : '--'}
                </span>
                <span className="text-zinc-400 font-bold">kg</span>
              </div>
              {change && (
                <div className={cn("flex items-center gap-1 mt-2",
                  change.value > 0 ? "text-rose-400" : change.value < 0 ? "text-emerald-400" : "text-zinc-400"
                )}>
                  {change.value > 0 ? <TrendingUp className="w-4 h-4" /> : change.value < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  <span className="text-sm font-bold">{change.formatted}</span>
                  <span className="text-xs text-zinc-500">{t('weight.from_last', '지난 기록 대비')}</span>
                </div>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center">
              <Weight className="w-7 h-7 text-sky-400" />
            </div>
          </div>
        </div>

        {/* 체중 입력 */}
        {showInput ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-5 border border-white/10"
          >
            <p className="text-white font-bold text-sm mb-3">{t('weight.add_record', '체중 기록하기')}</p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="200"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-sky-500 transition-colors"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">kg</span>
              </div>
              <button
                onClick={addEntry}
                disabled={!inputWeight || parseFloat(inputWeight) <= 0}
                className="px-6 py-3 bg-sky-500 text-black rounded-xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-30"
              >
                {t('weight.save', '저장')}
              </button>
            </div>
            <button onClick={() => setShowInput(false)} className="mt-3 text-zinc-500 text-xs">
              {t('common.cancel', '취소')}
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex items-center justify-center gap-2 text-sky-400 font-bold text-sm active:scale-[0.98] transition-transform"
          >
            <Plus className="w-5 h-5" />
            {t('weight.add_button', '체중 기록 추가')}
          </button>
        )}

        {/* 간이 차트 (막대 그래프) */}
        {entries.length > 1 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 px-1">{t('weight.chart', '체중 변화')}</h3>
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <div className="flex items-end gap-1.5 h-32">
                {entries.slice(0, 12).reverse().map((entry, i) => {
                  const height = maxWeight > 0 ? (entry.weight / maxWeight) * 100 : 50;
                  return (
                    <div key={entry.id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[8px] text-zinc-500 font-bold">{entry.weight}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "w-full rounded-t-lg min-h-[4px]",
                          i === entries.slice(0, 12).length - 1 ? "bg-sky-500" : "bg-sky-500/30"
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 기록 목록 */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 px-1">{t('weight.history', '기록 내역')}</h3>
            {entries.slice(0, 10).map((entry, i) => {
              const prev = entries[i + 1];
              const diff = prev ? entry.weight - prev.weight : 0;
              return (
                <div key={entry.id} className="bg-white/5 rounded-xl p-4 flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <Weight className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{entry.weight.toFixed(1)} kg</p>
                      <p className="text-zinc-500 text-xs">{entry.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {diff !== 0 && (
                      <span className={cn("text-xs font-bold", diff > 0 ? "text-rose-400" : "text-emerald-400")}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                      </span>
                    )}
                    <button onClick={() => deleteEntry(entry.id)} title={t('common.delete', '삭제')} aria-label={t('common.delete', '삭제')} className="text-zinc-600 hover:text-rose-400 transition-colors p-1">
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12">
            <Weight className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">{t('weight.empty', '아직 기록이 없어요')}</p>
            <p className="text-zinc-600 text-xs mt-1">{t('weight.empty_desc', '위 버튼을 눌러 첫 체중을 기록해보세요')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightTrackerScreen;
