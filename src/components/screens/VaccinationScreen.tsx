import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Syringe, CheckCircle2, Clock, AlertCircle, Shield, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

// 기본 예방접종 스케줄 (견종/나이 무관 기본 데이터)
const getDefaultVaccinations = (t: any) => [
  {
    id: 'dhppl',
    name: t('vaccine.dhppl', '종합백신 (DHPPL)'),
    desc: t('vaccine.dhppl_desc', '디스템퍼, 파보바이러스, 전염성간염, 파라인플루엔자, 렙토스피라'),
    schedule: t('vaccine.dhppl_schedule', '생후 6-8주 시작, 2-4주 간격 3회 접종'),
    booster: t('vaccine.dhppl_booster', '매년 1회 추가 접종'),
    importance: 'critical',
    ageWeeks: 6,
  },
  {
    id: 'rabies',
    name: t('vaccine.rabies', '광견병'),
    desc: t('vaccine.rabies_desc', '법정 의무 예방접종, 모든 반려견 필수'),
    schedule: t('vaccine.rabies_schedule', '생후 12주 이후 1회 접종'),
    booster: t('vaccine.rabies_booster', '매년 1회 추가 접종 (법적 의무)'),
    importance: 'critical',
    ageWeeks: 12,
  },
  {
    id: 'kennel_cough',
    name: t('vaccine.kennel', '켄넬코프 (기관지염)'),
    desc: t('vaccine.kennel_desc', '여러 마리와 접촉이 잦은 경우 특히 중요'),
    schedule: t('vaccine.kennel_schedule', '생후 6-8주 시작'),
    booster: t('vaccine.kennel_booster', '매년 1회 추가 접종'),
    importance: 'recommended',
    ageWeeks: 6,
  },
  {
    id: 'corona',
    name: t('vaccine.corona', '코로나 장염'),
    desc: t('vaccine.corona_desc', '장염 예방, 어린 강아지에게 특히 중요'),
    schedule: t('vaccine.corona_schedule', '생후 6-8주 시작'),
    booster: t('vaccine.corona_booster', '매년 1회 추가 접종'),
    importance: 'recommended',
    ageWeeks: 6,
  },
  {
    id: 'heartworm',
    name: t('vaccine.heartworm', '심장사상충 예방'),
    desc: t('vaccine.heartworm_desc', '모기를 통해 감염, 월 1회 예방약 투여'),
    schedule: t('vaccine.heartworm_schedule', '생후 8주부터 월 1회'),
    booster: t('vaccine.heartworm_booster', '평생 월 1회 투여 유지'),
    importance: 'critical',
    ageWeeks: 8,
  },
  {
    id: 'flea_tick',
    name: t('vaccine.flea', '외부 기생충 예방'),
    desc: t('vaccine.flea_desc', '벼룩, 진드기 예방 (봄~가을 특히 중요)'),
    schedule: t('vaccine.flea_schedule', '생후 8주부터 월 1회'),
    booster: t('vaccine.flea_booster', '봄~가을 월 1회, 겨울 2개월 1회'),
    importance: 'recommended',
    ageWeeks: 8,
  },
  {
    id: 'internal_parasite',
    name: t('vaccine.deworming', '내부 기생충 구충'),
    desc: t('vaccine.deworming_desc', '회충, 촌충 등 내부 기생충 예방'),
    schedule: t('vaccine.deworming_schedule', '생후 2주부터 2주 간격, 이후 3개월 간격'),
    booster: t('vaccine.deworming_booster', '3-6개월마다 정기 구충'),
    importance: 'recommended',
    ageWeeks: 2,
  },
];

const VaccinationScreen = ({ onBack, petProfile }: { onBack: () => void, petProfile?: any }) => {
  const { t } = useTranslation();
  const vaccinations = getDefaultVaccinations(t);
  
  // localStorage에서 완료된 접종 불러오기
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('petgenie_vaccinations');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const toggleComplete = (id: string) => {
    const newCompleted = completed.includes(id)
      ? completed.filter(c => c !== id)
      : [...completed, id];
    setCompleted(newCompleted);
    try { localStorage.setItem('petgenie_vaccinations', JSON.stringify(newCompleted)); } catch {}
  };

  const completionRate = Math.round((completed.length / vaccinations.length) * 100);

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} title={t('common.back', '뒤로가기')} aria-label={t('common.back', '뒤로가기')} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('vaccine.title', '예방접종 스케줄')}</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* 진행률 헤더 */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-black rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('vaccine.progress', '접종 진행률')}</p>
              <p className="text-3xl font-black text-white">{completionRate}%</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <p className="text-zinc-500 text-xs mt-2">{completed.length}/{vaccinations.length} {t('vaccine.completed', '완료')}</p>
        </div>

        {/* 접종 목록 */}
        <div className="space-y-3">
          {vaccinations.map((vac, i) => {
            const isDone = completed.includes(vac.id);
            return (
              <motion.div
                key={vac.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "border rounded-2xl p-5 transition-all",
                  isDone ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5"
                )}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleComplete(vac.id)}
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all",
                      isDone ? "bg-emerald-500 text-white" : "border-2 border-zinc-600"
                    )}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn("font-bold text-sm", isDone ? "text-emerald-400 line-through" : "text-white")}>{vac.name}</h3>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                        vac.importance === 'critical' ? "text-rose-400 bg-rose-500/10" : "text-sky-400 bg-sky-500/10"
                      )}>
                        {vac.importance === 'critical' ? t('vaccine.required', '필수') : t('vaccine.recommended', '권장')}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs mb-2">{vac.desc}</p>
                    <div className="space-y-1">
                      <p className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        {vac.schedule}
                      </p>
                      <p className="text-zinc-400 text-[11px] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-sky-400" />
                        {vac.booster}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 안내 */}
        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-zinc-500 text-xs leading-relaxed">
            {t('vaccine.notice', '접종 일정은 반려견의 건강 상태와 수의사 판단에 따라 달라질 수 있습니다. 정확한 일정은 담당 수의사와 상담하세요.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VaccinationScreen;
