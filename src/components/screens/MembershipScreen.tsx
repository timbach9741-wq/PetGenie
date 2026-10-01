import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Sparkles, Video, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { isBillingAvailable, purchasePlan, restorePurchases, manageSubscriptions } from '../../lib/billing';
import { motion } from 'framer-motion';

// 구독 요금제(2026-09-30 확정). Google Play 구독 상품(petgenie_premium)의 기본 요금제 p1m/p3m/p6m/p12m과
// 같은 기간·가격이어야 한다. 실제 결제 금액은 Play 결제창에 표시되는 값이 기준이다.
const PLANS = [
  { id: '1m', label: '1개월', months: 1, price: 4900, discount: 0 },
  { id: '3m', label: '3개월', months: 3, price: 12900, discount: 12 },
  { id: '6m', label: '6개월', months: 6, price: 22900, discount: 22 },
  { id: '12m', label: '1년', months: 12, price: 39000, discount: 34 },
];

type MembershipScreenProps = {
  onBack: () => void;
  uid?: string;
  isPaidMember: boolean;
  showFreePromo: boolean;
  onMembershipChanged: (active: boolean) => void;
  onRequireLogin: () => void;
};

const MembershipScreen = ({ onBack, uid, isPaidMember, showFreePromo, onMembershipChanged, onRequireLogin }: MembershipScreenProps) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState('12m');
  const [busy, setBusy] = useState(false);

  const handleSubscribe = async () => {
    if (!uid) {
      onRequireLogin();
      return;
    }
    setBusy(true);
    try {
      const result = await purchasePlan(selectedPlan, uid);
      onMembershipChanged(result.active);
      if (result.active) alert(t('membership.purchase_success', '멤버십이 시작되었어요! 광고 없이 무제한으로 이용하세요.'));
    } catch (err: any) {
      // 결제창에서 취소한 경우는 조용히 넘어간다
      const msg = String(err?.message || err);
      if (!/cancel/i.test(msg)) {
        console.error('Purchase failed', err);
        alert(t('membership.purchase_failed', '결제를 완료하지 못했어요. 결제가 되었는데 멤버십이 안 보이면 "구매 복원"을 눌러주세요.'));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (!uid) {
      onRequireLogin();
      return;
    }
    setBusy(true);
    try {
      const active = await restorePurchases(uid);
      onMembershipChanged(active);
      alert(active
        ? t('membership.restore_success', '멤버십을 복원했어요.')
        : t('membership.restore_none', '이 구글 계정에서 이용 중인 멤버십을 찾지 못했어요.'));
    } finally {
      setBusy(false);
    }
  };

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

        {/* 🎉 12월 31일까지 무료 프로모션 배너 — 무료 개방 중이거나 유료화 전부터 쓰던 사용자에게만 */}
        {showFreePromo && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-emerald-800 font-bold text-sm tracking-tight">{t('membership.promo_title', '런칭 기념 사전 혜택')}</p>
              <p className="text-emerald-600 text-[11px] font-medium mt-0.5">{t('membership.promo_desc', '12월 31일까지 Pro 플랜 기능 전체가 무료로 개방됩니다!')}</p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="space-y-4">
          
          {/* 1. Basic (Free) */}
          <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-zinc-900">Basic <span className="text-zinc-400 font-medium text-sm ml-1">(Free)</span></h3>
              <p className="text-zinc-500 text-xs mt-1">{t('membership.basic_desc', '체험해보기 좋은 기본 서비스')}</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black tracking-tighter">₩0</span>
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
            <div className="grid grid-cols-2 gap-2 mb-6">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    "relative text-left rounded-2xl p-3 border transition-colors",
                    selectedPlan === plan.id ? "border-emerald-400 bg-emerald-500/10" : "border-zinc-700 bg-zinc-800/50"
                  )}
                >
                  {plan.discount > 0 && (
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">-{plan.discount}%</span>
                  )}
                  <p className="text-xs font-bold text-zinc-400">{t(`membership.plan_${plan.id}`, plan.label)}</p>
                  <p className="text-lg font-black tracking-tight text-white mt-1">₩{plan.price.toLocaleString('ko-KR')}</p>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {t('membership.per_month_equiv', '월 {{price}}원', { price: Math.round(plan.price / plan.months).toLocaleString('ko-KR') })}
                  </p>
                </button>
              ))}
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
                <span className="text-sm text-zinc-300 font-medium leading-tight pt-0.5">{t('membership.pro_unlimited_vet', 'AI 수의사 무제한 상담')}</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-zinc-300 font-medium leading-tight pt-0.5">{t('membership.pro_unlimited_report', '건강 분석 리포트 무제한 저장')}</span>
              </div>
            </div>
            {!isBillingAvailable() ? (
              <button
                disabled
                className="w-full bg-zinc-800 text-zinc-500 py-4 rounded-xl font-bold text-sm shadow-xl transition-all cursor-not-allowed"
              >
                {t('membership.app_only', '구독은 안드로이드 앱에서 가입할 수 있어요')}
              </button>
            ) : isPaidMember ? (
              <button
                onClick={() => manageSubscriptions()}
                className="w-full bg-zinc-800 text-emerald-400 py-4 rounded-xl font-bold text-sm shadow-xl"
              >
                {t('membership.manage', '이용 중 · 구독 관리')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleSubscribe}
                  disabled={busy}
                  className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('membership.subscribe', '구독 시작하기')}
                </button>
                <p className="text-[10px] text-zinc-500 text-center mt-3 leading-relaxed">
                  {t('membership.subscribe_note', '처음 구독하면 7일 무료 체험 후 결제돼요. 구글 플레이에서 언제든 해지할 수 있어요.')}
                </p>
              </>
            )}
            {isBillingAvailable() && !isPaidMember && (
              <button onClick={handleRestore} disabled={busy} className="w-full text-[11px] text-zinc-500 underline mt-3">
                {t('membership.restore', '구매 복원')}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default MembershipScreen;
