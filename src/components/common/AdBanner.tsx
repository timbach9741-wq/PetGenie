import { useTranslation } from 'react-i18next';
import { ShoppingBag, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdBanner = ({ isPremium, onUpgrade, type = 'banner' }: { isPremium: boolean, onUpgrade: () => void, type?: 'banner' | 'native' | 'large' }) => {
  const { t } = useTranslation();
  if (isPremium) return null;

  if (type === 'native') {
    return (
      <div className="w-full px-6 py-4">
        <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white bg-zinc-900 px-1.5 py-0.5 rounded uppercase tracking-tighter">Sponsored</span>
              <span className="text-[10px] font-bold text-zinc-400">Google AdSense</span>
            </div>
            <button onClick={onUpgrade} className="text-[10px] font-bold text-emerald-600 hover:underline">{t('common.remove_ads')}</button>
          </div>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200/50">
              <ShoppingBag className="w-8 h-8 text-zinc-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-zinc-900 mb-1">{t('hardcoded.product_joint_food')}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">{t('hardcoded.ad_pet_food_desc')}</p>
              <button className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">{t('hardcoded.view_details')}</button>
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
            <span className="text-[9px] font-medium text-zinc-400">Google AdSense</span>
          </div>
          <button 
            onClick={onUpgrade}
            className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest hover:underline"
          >
            {t('common.remove_ads')}
          </button>
        </div>
        
        <div className={cn(
          "bg-zinc-200/50 rounded-xl flex flex-col items-center justify-center border border-dashed border-zinc-300 transition-colors group-hover:bg-zinc-200/80",
          type === 'large' ? "aspect-[300/250]" : "aspect-[320/50]"
        )}>
          <div className="flex items-center gap-2 text-zinc-400">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('common.ad_area')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
