import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ArrowLeft, Scan, FileText, ShoppingBag, MapPin, Shield, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';


const MembershipScreen = ({ onBack, onUpgrade }: { onBack: () => void, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'yearly' | 'lifetime'>('yearly');
  const benefits = [
    { title: t('membership.benefit1'), free: t('membership.benefit1_free'), premium: t('membership.benefit1_premium'), icon: Scan },
    { title: t('membership.benefit2'), free: t('membership.benefit2_free'), premium: t('membership.benefit2_premium'), icon: FileText },
    { icon: MapPin, title: t('membership.benefit3'), free: t('membership.benefit3_free'), premium: t('membership.benefit3_premium') },
    { icon: Shield, title: t('membership.benefit4'), free: t('membership.benefit4_free'), premium: t('membership.benefit4_premium') },
    { icon: ShoppingBag, title: t('membership.benefit5'), free: t('membership.benefit5_free'), premium: t('membership.benefit5_premium') },
  ];

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('membership.title')}</h1>
        <div className="w-9" />
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('membership.hero_title')}</h2>
          <p className="text-zinc-500 text-sm">{t('membership.hero_desc')}</p>
        </div>

        {/* Membership Guide Text */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-l-4 border-emerald-500 pl-3">{t('membership.guide_title')}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            <Trans i18nKey="membership.guide_desc">
              Free members can use basic health scans and hospital searches (3 times each) and basic summary reports.
              On the other hand, <span className="text-emerald-600 font-bold">Premium Membership</span> provides all premium rights for your pet.
            </Trans>
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 bg-zinc-50 border-b border-zinc-100">
            <div className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('membership.table_service')}</div>
            <div className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">{t('membership.table_free')}</div>
            <div className="p-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-center">{t('membership.table_premium')}</div>
          </div>
          <div className="divide-y divide-zinc-50">
            {benefits.map((b, i) => (
              <div key={i} className="grid grid-cols-3 items-center">
                <div className="p-4 flex items-center gap-2">
                  <b.icon className="w-3 h-3 text-zinc-400" />
                  <span className="text-[11px] font-bold text-zinc-700">{b.title}</span>
                </div>
                <div className="p-4 text-[11px] text-zinc-400 text-center font-medium">{b.free}</div>
                <div className="p-4 text-[11px] text-emerald-600 text-center font-bold">{b.premium}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-900/20">
          <p className="text-center text-emerald-100 text-xs font-bold uppercase tracking-widest mb-6">{t('membership.price_label')}</p>
          
          <div className="space-y-3 mb-8">
            {[
              { id: 'weekly', title: t('membership.plan_weekly_title'), price: t('membership.plan_weekly_price'), badge: '' },
              { id: 'yearly', title: t('membership.plan_yearly_title'), price: t('membership.plan_yearly_price'), badge: t('membership.best_value') },
              { id: 'lifetime', title: t('membership.plan_lifetime_title'), price: t('membership.plan_lifetime_price'), badge: '' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPlan(p.id as any)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all",
                  selectedPlan === p.id 
                    ? "border-white bg-white/20 shadow-inner" 
                    : "border-transparent bg-emerald-700/50 hover:bg-emerald-700/70"
                )}
              >
                <div className="flex flex-col">
                  <span className={cn("font-medium text-sm transition-colors", selectedPlan === p.id ? "text-white" : "text-emerald-100")}>{p.title}</span>
                  <span className="text-white font-bold text-xl">{p.price}</span>
                </div>
                {p.badge && (
                  <span className="bg-emerald-400 text-emerald-900 text-[10px] font-black uppercase px-2 py-1 rounded-full">
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button 
            onClick={onUpgrade}
            className="w-full bg-white text-emerald-700 py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
          >
            {t('membership.subscribe_button')}
            <ChevronRight className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipScreen;
