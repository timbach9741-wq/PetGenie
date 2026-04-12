import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Sparkles, Video, FileText, Scan, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const MembershipScreen = ({ onBack, onUpgrade }: { onBack: () => void, onUpgrade: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50">
        <button onClick={onBack} aria-label="Back" className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('membership.title', '멤버십 안내')}</h1>
        <div className="w-9" />
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('membership.hero_title', '반려동물을 위한 최고의 선택')}</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">{t('membership.hero_desc', '나에게 딱 맞는 플랜을 선택하고 스마트한 건강 관리를 시작하세요.')}</p>
        </div>

        {/* 🎉 6월까지 무료 프로모션 배너 — i18n 적용 */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-emerald-800 font-bold text-sm tracking-tight">{t('membership.promo_title', '런칭 기념 사전 혜택')}</p>
            <p className="text-emerald-600 text-[11px] font-medium mt-0.5">{t('membership.promo_desc', '6월 전까지는 Pro 플랜 기능 전체가 일시 무료 개방됩니다!')}</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="space-y-4">
          
          {/* 1. Basic (Free) */}
          <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-zinc-900">Basic <span className="text-zinc-400 font-medium text-sm ml-1">(Free)</span></h3>
              <p className="text-zinc-500 text-xs mt-1">{t('membership.basic_desc', '체험해보기 좋은 기본 서비스')}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black tracking-tighter">$0</span>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 font-medium">{t('membership.basic_consult', '일일 상담 3회 (광고 시청 필수)')}</span>
              </div>
              <div className="flex items-start gap-2">
                <Video className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 font-medium">{t('membership.basic_ad', '스캔 시 게이트키퍼 팝업 광고 진행')}</span>
              </div>
            </div>
            <button className="w-full bg-zinc-100 text-zinc-500 py-3.5 rounded-xl font-bold text-sm shadow-sm">
              {t('membership.current_plan', '현재 사용 중')}
            </button>
          </div>

          {/* 2. Silverman Pro */}
          <div className="bg-zinc-900 rounded-[2rem] p-6 border border-zinc-800 shadow-2xl relative overflow-hidden ring-4 ring-emerald-500/20">
            {/* Tag */}
            <div className="absolute top-0 right-6 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-b-xl tracking-wider uppercase">
              Best Value
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">Silverman Pro <Sparkles className="w-4 h-4 text-emerald-400" /></h3>
              <p className="text-zinc-400 text-xs mt-1">{t('membership.pro_desc', '가장 안정적이고 강력한 멤버십 혜택')}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black tracking-tighter text-white">₩13,000 <span className="text-xl">($9.99)</span></span>
              <span className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{t('membership.per_month', '/ 월')}</span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-zinc-300 font-medium leading-tight pt-0.5">{t('membership.pro_no_ads', '모든 광고 제거')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-zinc-300 font-medium leading-tight pt-0.5">{t('membership.pro_unlimited_vet', '수의사 무제한 상담')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-zinc-300 font-medium leading-tight pt-0.5">{t('membership.pro_unlimited_report', '건강 분석 리포트 무제한 저장')}</span>
              </div>
            </div>
            <button 
              disabled
              className="w-full bg-zinc-800 text-zinc-500 py-4 rounded-xl font-bold text-sm shadow-xl transition-all cursor-not-allowed"
            >
              {t('membership.coming_soon', '6월 출시 예정 (Coming Soon)')}
            </button>
          </div>

          {/* 3. Single Deep Scan */}
          <div className="bg-white rounded-[2rem] p-6 border border-zinc-200 shadow-lg relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-zinc-900">Single Deep Scan</h3>
              <p className="text-zinc-500 text-xs mt-1">{t('membership.scan_desc', '구독이 부담스러울 때, 맞춤형 1회 분석')}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black tracking-tighter">₩2,500 <span className="text-xl">($1.99)</span></span>
              <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest">{t('membership.per_use', '/ 회')}</span>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0 fill-emerald-500/20" />
                <span className="text-sm text-zinc-600 font-medium">{t('membership.scan_no_ad', '광고 없이 딱 한 번만 정밀 분석')}</span>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-600 font-medium">{t('membership.scan_one_time', '분석 결과 즉시 확인 및 1회성 열람')}</span>
              </div>
            </div>
            <button 
              disabled
              className="w-full bg-zinc-100 text-zinc-400 py-3.5 rounded-xl font-bold text-sm transition-all cursor-not-allowed"
            >
              {t('membership.coming_soon', '6월 출시 예정 (Coming Soon)')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MembershipScreen;
