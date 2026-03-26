import { useTranslation, Trans } from 'react-i18next';
import { ShoppingBag, FileText, Scan, ArrowLeft, Shield, MapPin } from 'lucide-react';


const MembershipScreen = ({ onBack, onUpgrade }: { onBack: () => void, onUpgrade: () => void }) => {
  const { t } = useTranslation();
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
              일반 회원은 기본적인 건강 스캔과 병원 검색(각 총 3회) 및 기본 요약 리포트를 이용하실 수 있습니다. 마켓과 보험 서비스 또한 일반형으로 제공됩니다.
              반면, <span className="text-emerald-600 font-bold">프리미엄 멤버십</span>은 AI 정밀 분석, 무제한 스캔/검색, 그리고 멤버십 전용 마켓/보험 혜택 등 반려동물을 위한 모든 프리미엄 권한을 제공합니다.
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

        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white text-center shadow-xl shadow-emerald-900/20">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">{t('membership.price_label')}</p>
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-4xl font-bold">{t('membership.price_value')}</span>
            <span className="text-emerald-200 text-sm">/ mo</span>
          </div>
          <button 
            onClick={onUpgrade}
            className="w-full bg-white text-emerald-700 py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all"
          >
            {t('membership.subscribe_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipScreen;
