import { useTranslation, Trans } from 'react-i18next';
import { CheckCircle2, ArrowLeft, Utensils } from 'lucide-react';
import AdBanner from '../common/AdBanner';
import DrSilvermanHeader from '../common/DrSilvermanHeader';


const DietGuideScreen = ({ onBack, dietPlan, isPremium, onUpgrade }: { onBack: () => void, dietPlan: any, isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const plan = dietPlan || {
    title: t('diet.title'),
    recommendations: [t('diet.default_rec1', "충분한 수분 섭취"), t('diet.default_rec2', "균형 잡힌 영양소 공급"), t('diet.default_rec3', "정기적인 식사 시간")],
    prohibitedFoods: [t('diet.default_prohibit1', "초콜릿"), t('diet.default_prohibit2', "포도"), t('diet.default_prohibit3', "양파")],
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
        <section className="bg-gradient-to-br from-emerald-900/40 to-black rounded-[2.5rem] p-8 border border-emerald-500/20">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('diet.title')}</h2>
          <p className="text-emerald-400 font-bold text-sm">{t('diet.calories')}: {plan.dailyCalories}</p>
        </section>

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

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-rose-400 px-2">{t('diet.prohibit_title')}</h3>
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
