import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, Clock, Weight, Activity, Brain, Shield, Star, Info, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

// AI 분석 결과에서 가져오는 견종 정보 타입
interface BreedData {
  breedName?: string;
  breedMatch?: number;
  healthRisks?: any[];
  // AI가 추가로 생성하는 견종 백과 데이터
  breedEncyclopedia?: {
    origin?: string;
    group?: string;
    lifespan?: string;
    sizeCategory?: string;
    temperament?: string[];
    funFacts?: string[];
    idealFor?: string;
    groomingLevel?: string;
    exerciseNeeds?: string;
    trainability?: string;
  };
}

const BreedInfoScreen = ({ onBack, analysisResult }: { onBack: () => void, analysisResult: any }) => {
  const { t } = useTranslation();

  // AI 분석 결과에서 데이터 추출
  const breedName = analysisResult?.breedName || t('breed.unknown', '알 수 없음');
  const breedMatch = analysisResult?.breedMatch || 0;
  const encyclopedia = analysisResult?.breedEncyclopedia;

  // 견종 특성 데이터 (AI가 없을 때 기본값 포함)
  const traits = [
    {
      label: t('breed.origin', '원산지'),
      value: encyclopedia?.origin || t('breed.unknown', '분석 필요'),
      icon: MapPin,
      color: 'text-rose-400 bg-rose-500/10',
    },
    {
      label: t('breed.group', '견종 그룹'),
      value: encyclopedia?.group || t('breed.unknown', '분석 필요'),
      icon: Star,
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      label: t('breed.lifespan', '평균 수명'),
      value: encyclopedia?.lifespan || t('breed.unknown', '분석 필요'),
      icon: Clock,
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      label: t('breed.size', '체격'),
      value: encyclopedia?.sizeCategory || t('breed.unknown', '분석 필요'),
      icon: Weight,
      color: 'text-sky-400 bg-sky-500/10',
    },
    {
      label: t('breed.exercise', '운동 요구량'),
      value: encyclopedia?.exerciseNeeds || t('breed.unknown', '분석 필요'),
      icon: Activity,
      color: 'text-orange-400 bg-orange-500/10',
    },
    {
      label: t('breed.trainability', '훈련 용이도'),
      value: encyclopedia?.trainability || t('breed.unknown', '분석 필요'),
      icon: Brain,
      color: 'text-purple-400 bg-purple-500/10',
    },
    {
      label: t('breed.grooming', '그루밍 수준'),
      value: encyclopedia?.groomingLevel || t('breed.unknown', '분석 필요'),
      icon: Heart,
      color: 'text-pink-400 bg-pink-500/10',
    },
    {
      label: t('breed.ideal_for', '적합한 가정'),
      value: encyclopedia?.idealFor || t('breed.unknown', '분석 필요'),
      icon: Shield,
      color: 'text-teal-400 bg-teal-500/10',
    },
  ];

  const temperaments = encyclopedia?.temperament || [];
  const funFacts = encyclopedia?.funFacts || [];
  const healthRisks = analysisResult?.healthRisks || [];

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} title={t('common.back', '뒤로가기')} aria-label={t('common.back', '뒤로가기')} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('breed.title', '견종 도감')}</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* 견종명 헤더 */}
        <div className="bg-gradient-to-br from-purple-900/30 to-black rounded-2xl p-8 border border-purple-500/20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{breedName}</h2>
          {breedMatch > 0 && (
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-4 py-1.5 rounded-full">
              <span className="text-emerald-400 text-sm font-bold">{t('breed.match', '일치도')}: {breedMatch}%</span>
            </div>
          )}
        </div>

        {/* 성격/기질 태그 */}
        {temperaments.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 px-1">{t('breed.temperament', '성격 특성')}</h3>
            <div className="flex flex-wrap gap-2">
              {temperaments.map((temp: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-purple-500/10 text-purple-300 rounded-full text-xs font-bold border border-purple-500/20">
                  {temp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 특성 그리드 */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-400 px-1">{t('breed.characteristics', '견종 특성')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {traits.map((trait, i) => {
              const Icon = trait.icon;
              const colorParts = trait.color.split(' ');
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/5 rounded-2xl p-4 border border-white/5"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", colorParts[1])}>
                    <Icon className={cn("w-4 h-4", colorParts[0])} />
                  </div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{trait.label}</p>
                  <p className="text-white text-xs font-bold mt-1">{trait.value}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 건강 주의 사항 */}
        {healthRisks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 px-1">{t('breed.health_risks', '건강 주의 사항')}</h3>
            {healthRisks.slice(0, 4).map((risk: any, i: number) => (
              <div key={i} className="bg-rose-500/5 rounded-xl p-4 border border-rose-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <p className="text-rose-300 font-bold text-xs">{risk.name}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                    {risk.prevalence}
                  </span>
                </div>
                <p className="text-zinc-500 text-xs">{risk.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* 재미있는 사실 */}
        {funFacts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-400 px-1 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('breed.fun_facts', '재미있는 사실')}
            </h3>
            <div className="space-y-2">
              {funFacts.map((fact: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/10 flex items-start gap-3"
                >
                  <span className="text-amber-400 font-black text-lg shrink-0">💡</span>
                  <p className="text-zinc-300 text-xs leading-relaxed">{fact}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 분석 없을 때 안내 */}
        {!encyclopedia && (
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
            <Star className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-bold mb-1">{t('breed.scan_needed', '더 자세한 정보가 필요해요')}</p>
            <p className="text-zinc-600 text-xs">{t('breed.scan_needed_desc', '반려견을 촬영하면 AI가 견종별 상세 정보를 제공합니다')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreedInfoScreen;
