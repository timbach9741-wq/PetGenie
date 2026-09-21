import { useEffect } from 'react';
import { ADMOB_IDS } from '../../config/ads';
import { ShoppingBag, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import type { BannerAdOptions } from '@capacitor-community/admob';
import { queueShowBanner, queueRemoveBanner } from '../../lib/adMobBanner';


const AdBanner = ({ isPremium, onUpgrade, type = 'banner' }: { isPremium: boolean, onUpgrade: () => void, type?: 'banner' | 'native' | 'large' }) => {
  const { t } = useTranslation();

  // 실제 AdMob 배너 노출 (banner/large 타입일 때만)
  // 주의: 성장 단계 무료 개방 정책으로 isPremium은 항상 true(기능 잠금 해제)가 되므로,
  // 광고 노출은 isPremium과 무관하게 이루어짐 (무료 개방 중에도 광고 수익은 필요하기 때문).
  useEffect(() => {
    if (type !== 'banner' && type !== 'large') return;
    if (!Capacitor.isNativePlatform()) return;

    const options: BannerAdOptions = {
      adId: ADMOB_IDS.BANNER,
      adSize: type === 'large' ? BannerAdSize.MEDIUM_RECTANGLE : BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: false,
    };

    queueShowBanner(options);

    return () => {
      queueRemoveBanner();
    };
  }, [type]);

  // 네이티브 플랫폼의 banner/large 타입은 실제 AdMob 배너가 별도 오버레이로 이미 표시되므로,
  // 여기서 가짜 "Sponsored Ad Area" placeholder까지 같이 그리면 두 광고가 겹쳐 보인다.
  // placeholder는 실제 광고가 없는 웹 프리뷰(브라우저)에서만 보여준다.
  if ((type === 'banner' || type === 'large') && Capacitor.isNativePlatform()) {
    return null;
  }

  if (type === 'native') {
    return (
      <div className="w-full px-6 py-4">
        <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white bg-zinc-900 px-1.5 py-0.5 rounded uppercase tracking-tighter">{t('common.sponsored', 'Sponsored')}</span>
              <span className="text-[10px] font-bold text-zinc-400">AdMob Banner</span>
            </div>
            <button onClick={onUpgrade} className="text-[10px] font-bold text-emerald-600 hover:underline">{t('common.remove_ads', 'Remove Ads')}</button>
          </div>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200/50">
              <ShoppingBag className="w-8 h-8 text-zinc-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-zinc-900 mb-1">{t('market.product_joint_food', 'Premium Joint Food')}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">{t('hardcoded.ad_pet_food_desc', 'Check the optimal nutritional balance based on genetic analysis results.')}</p>
              <button className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">{t('hardcoded.view_details', 'View Details')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-4">
      <div className="bg-zinc-100 rounded-2xl p-3 border border-zinc-200 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black text-zinc-500 border border-zinc-300 px-1 rounded uppercase tracking-tighter">AD</span>
            <span className="text-[9px] font-medium text-zinc-400">AdMob Banner</span>
          </div>
          <button 
            onClick={onUpgrade}
            className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest hover:underline"
          >
            {t('common.remove_ads', 'Remove Ads')}
          </button>
        </div>
        
        <div className={cn(
          "bg-zinc-200/50 rounded-xl flex flex-col items-center justify-center border border-dashed border-zinc-300 transition-colors group-hover:bg-zinc-200/80",
          type === 'large' ? "aspect-[300/250]" : "aspect-[320/50]"
        )}>
          <div className="flex items-center gap-2 text-zinc-400">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.ad_area', 'Sponsored Ad Area')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
