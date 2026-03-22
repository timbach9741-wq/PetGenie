import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertCircle, ArrowLeft, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AdBanner } from '../common';


const ExercisePlanScreen = ({ onBack, exercisePlan, isPremium, onUpgrade }: { onBack: () => void, exercisePlan: any, isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const plan = exercisePlan || {
    title: t('exercise.title'),
    dailyGoal: t('exercise.default_goal'),
    activities: [{ name: t('exercise.default_walk'), duration: t('exercise.default_duration'), intensity: "medium" }],
    precautions: [t('exercise.default_precaution1'), t('exercise.default_precaution2')]
  };

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-32 relative">
      {!isPremium && (
        <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-[12px] flex flex-col items-center justify-center p-8 text-center pt-24">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('exercise.premium_title')}</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[240px] whitespace-pre-line">
            {t('exercise.premium_desc')}
          </p>
          <button 
            onClick={onUpgrade}
            className="bg-blue-500 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            {t('analysis.upgrade_button')}
          </button>
        </div>
      )}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('exercise.title')}</h1>
      </header>

      <div className="p-6 space-y-8">
        <section className="bg-gradient-to-br from-blue-900/40 to-black rounded-[2.5rem] p-8 border border-blue-500/20">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{plan.title}</h2>
          <p className="text-blue-400 font-bold text-sm">{t('exercise.goal')}: {plan.dailyGoal}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white px-2">{t('exercise.routine_title')}</h3>
          <div className="grid gap-4">
            {plan.activities.map((activity: any, i: number) => (
              <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      activity.intensity === 'high' ? "bg-rose-500/10 text-rose-500" :
                      activity.intensity === 'medium' ? "bg-orange-500/10 text-orange-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white">{activity.name}</h4>
                  </div>
                  <span className="text-zinc-400 font-bold text-sm">{activity.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('exercise.intensity')}:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <div 
                        key={step} 
                        className={cn(
                          "w-4 h-1 rounded-full",
                          step === 1 && activity.intensity === 'low' ? "bg-emerald-500" :
                          step <= 2 && activity.intensity === 'medium' ? "bg-orange-500" :
                          step <= 3 && activity.intensity === 'high' ? "bg-rose-500" : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white px-2">{t('exercise.caution_title')}</h3>
          <div className="grid gap-3">
            {plan.precautions.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-3 px-2">
                <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

export default ExercisePlanScreen;
