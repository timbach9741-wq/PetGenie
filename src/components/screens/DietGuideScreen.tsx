import { useTranslation, Trans } from 'react-i18next';
import { CheckCircle2, ArrowLeft, Utensils, AlertTriangle, Pill, Lightbulb } from 'lucide-react';
import AdBanner from '../common/AdBanner';
import DrSilvermanHeader from '../common/DrSilvermanHeader';


const DietGuideScreen = ({ onBack, dietPlan, isPremium, onUpgrade }: { onBack: () => void, dietPlan: any, isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const plan = dietPlan || {
    title: t('diet.title'),
    recommendations: [
      t('diet.default_rec1', "양질의 동물성 단백질(닭, 연어 등)을 주 원료로 급여"),
      t('diet.default_rec2', "오메가-3, 6 지방산이 포함된 사료 선택"),
      t('diet.default_rec3', "하루 2회 규칙적인 식사 시간 유지"),
      t('diet.default_rec4', "간식은 일일 칼로리의 10% 이내로 제한"),
      t('diet.default_rec5', "신선한 물을 항상 충분히 제공"),
    ],
    prohibitedFoods: [
      t('diet.default_prohibit1', "초콜릿"),
      t('diet.default_prohibit2', "포도 / 건포도"),
      t('diet.default_prohibit3', "양파 / 마늘"),
      t('diet.default_prohibit4', "자일리톨 (껌, 사탕)"),
      t('diet.default_prohibit5', "마카다미아"),
      t('diet.default_prohibit6', "아보카도"),
    ],
    supplements: [
      { name: t('diet.default_supp1_name', "종합 비타민"), benefit: t('diet.default_supp1_benefit', "전반적인 영양 균형 보충") },
      { name: t('diet.default_supp2_name', "프로바이오틱스"), benefit: t('diet.default_supp2_benefit', "장 건강 및 소화 기능 개선") },
    ],
    feedingTips: [
      t('diet.default_tip1', "급격한 사료 변경은 피하고 7~10일에 걸쳐 서서히 전환"),
      t('diet.default_tip2', "식후 30분 이상 격렬한 운동 자제"),
      t('diet.default_tip3', "체중 변화를 월 1회 체크하여 급여량 조절"),
    ],
    dailyCalories: t('diet.default_calories', "정보 없음")
  };

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-32 relative">
      {!isPremium && (
        <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-[12px] flex flex-col items-center justify-center p-8 text-center pt-24">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/30">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('diet.premium_title')}</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[240px] whitespace-pre-line">
            {t('diet.premium_desc')}
          </p>
          <button 
            onClick={onUpgrade}
            className="bg-emerald-500 text-black px-10 py-4 rounded-2xl text-sm font-black shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {t('analysis.upgrade_button')}
          </button>
        </div>
      )}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} aria-label={t('common.back', '뒤로가기')} title={t('common.back', '뒤로가기')} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('diet.title')}</h1>
      </header>
      <DrSilvermanHeader />

      <div className="p-6 space-y-8">
        {/* 칼로리 헤더 */}
        <section className="bg-gradient-to-br from-emerald-900/40 to-black rounded-[2.5rem] p-8 border border-emerald-500/20">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('diet.title')}</h2>
          <p className="text-emerald-400 font-bold text-sm">{t('diet.calories')}: {plan.dailyCalories}</p>
        </section>

        {/* 권장 식단 */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white px-2">{t('diet.recommend_title')}</h3>
          <div className="grid gap-4">
            {plan.recommendations.map((item: string, i: number) => (
              <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-zinc-300 text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 보충제 추천 (AI 분석 결과가 있을 때) */}
        {plan.supplements && plan.supplements.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-amber-400 px-2 flex items-center gap-2">
              <Pill className="w-5 h-5" />
              {t('diet.supplements_title', '추천 보충제')}
            </h3>
            <div className="grid gap-3">
              {plan.supplements.map((supp: any, i: number) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5">
                  <p className="text-amber-300 font-bold text-sm mb-1">{supp.name}</p>
                  <p className="text-zinc-400 text-xs">{supp.benefit}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 급여 팁 */}
        {plan.feedingTips && plan.feedingTips.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-sky-400 px-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              {t('diet.feeding_tips_title', '급여 팁')}
            </h3>
            <div className="grid gap-3">
              {plan.feedingTips.map((tip: string, i: number) => (
                <div key={i} className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-sky-400 font-black text-xs mt-0.5 shrink-0">{i + 1}</span>
                  <p className="text-zinc-300 text-sm font-medium">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 금지 음식 */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-rose-400 px-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t('diet.prohibit_title')}
          </h3>
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-6">
            <div className="flex flex-wrap gap-2">
              {plan.prohibitedFoods.map((food: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-full text-xs font-bold border border-rose-500/20">
                  {food}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-rose-400/60 leading-relaxed">
              {t('diet.prohibit_caution')}
            </p>
          </div>
        </section>

        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

export default DietGuideScreen;
