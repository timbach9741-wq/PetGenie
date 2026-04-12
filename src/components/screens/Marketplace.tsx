import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, ShoppingBag, Lock, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Screen } from '../../types';
import { AdBanner } from '../common';


const Marketplace = ({ onBack, onNavigate, isPremium }: { onBack: () => void, onNavigate: (s: Screen) => void, isPremium: boolean }) => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = ['all', 'food', 'health', 'toy', 'service'];
  
  const products = [
    { 
      id: 1, 
      name: t('market.product_joint_food'), 
      price: t('market.product_joint_food_price'), 
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400', 
      tag: 'HOT', 
      category: 'food', 
      amazon: 'https://www.amazon.com/s?k=dog+joint+support+food',
      naver: 'https://search.shopping.naver.com/search/all?query=dog+joint+support+food' 
    },
    { 
      id: 2, 
      name: t('market.product_water_fountain'), 
      price: t('market.product_water_fountain_price'), 
      image: 'https://images.unsplash.com/photo-1585673103161-2ddf1521b8f6?auto=format&fit=crop&q=80&w=400', 
      tag: 'NEW', 
      category: 'health', 
      amazon: 'https://www.amazon.com/s?k=smart+pet+water+fountain',
      naver: 'https://search.shopping.naver.com/search/all?query=smart+pet+water+fountain' 
    },
    { 
      id: 3, 
      name: t('market.product_dental_chews'), 
      price: t('market.product_dental_chews_price'), 
      image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&q=80&w=400', 
      tag: 'BEST', 
      category: 'food', 
      amazon: 'https://www.amazon.com/s?k=dog+dental+chews',
      naver: 'https://search.shopping.naver.com/search/all?query=dog+dental+chews' 
    },
    { 
      id: 4, 
      name: t('market.product_snuffle_mat'), 
      price: t('market.product_snuffle_mat_price'), 
      image: 'https://images.unsplash.com/photo-1591768793355-74d7cab73084?auto=format&fit=crop&q=80&w=400', 
      tag: 'TOY', 
      category: 'toy', 
      amazon: 'https://www.amazon.com/s?k=dog+snuffle+mat',
      naver: 'https://search.shopping.naver.com/search/all?query=dog+snuffle+mat' 
    },
    { 
      id: 5, 
      name: t('market.product_ai_supplements'), 
      price: t('market.product_ai_supplements_price'), 
      image: 'https://images.unsplash.com/photo-1550572017-ed200f545dec?auto=format&fit=crop&q=80&w=400', 
      tag: 'PREMIUM', 
      category: 'health', 
      isPremiumOnly: true 
    },
    { 
      id: 6, 
      name: t('market.product_insurance'), 
      price: '0', 
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400', 
      tag: 'SERVICE', 
      category: 'service', 
      isInsurance: true 
    },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const getCurrencySymbol = () => {
    if (i18n.language.startsWith('ko')) return '₩';
    if (i18n.language.startsWith('ja')) return '¥';
    if (i18n.language.startsWith('zh')) return '¥';
    return '$';
  };

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="bg-white px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 border-b border-zinc-100 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{t('market.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{t('common.free_member')}</span>
            )}
            <button className="p-2 bg-zinc-100 rounded-full">
              <Search className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {t(`market.categories.${cat}`)}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm flex relative"
            >
              {product.isPremiumOnly && !isPremium && (
                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[4px] flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-2 shadow-lg">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-1">{t('market.premium_only')}</h4>
                  <button 
                    onClick={() => onNavigate('membership')}
                    className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter border border-emerald-400/30 px-2 py-0.5 rounded-full bg-emerald-400/5"
                  >
                    {t('common.upgrade')}
                  </button>
                </div>
              )}
              <div className={cn("w-32 aspect-square relative shrink-0", product.isPremiumOnly && !isPremium && "blur-[8px] opacity-50")}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={cn(
                  "absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider",
                  product.isPremiumOnly ? "bg-emerald-600 text-white" : "bg-white/90 backdrop-blur-sm text-emerald-600"
                )}>
                  {product.tag}
                </div>
              </div>
              <div className={cn("p-4 flex-1 flex flex-col justify-between", product.isPremiumOnly && !isPremium && "blur-[8px] opacity-50")}>
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-zinc-900 leading-tight">{product.name}</h3>
                    {!product.isInsurance && (
                      <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1 py-0.5 rounded-md uppercase tracking-tighter shrink-0">{t('market.lowest_price')}</span>
                    )}
                  </div>
                  <p className="text-base font-black text-zinc-900">{getCurrencySymbol()}{product.price}</p>
                </div>
                
                <div className="mt-3 flex gap-1.5">
                  {product.isInsurance ? (
                    <button 
                      onClick={() => onNavigate('membership')}
                      className="w-full bg-zinc-900 text-white py-2 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Shield className="w-3 h-3" />
                      {t('market.consult')}
                    </button>
                  ) : (
                    <>
                      <a 
                        href={i18n.language.startsWith('ko') ? product.naver : product.amazon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest text-center active:scale-95 transition-transform"
                      >
                        {t('market.buy_now')}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AdBanner isPremium={isPremium} onUpgrade={() => onNavigate('membership')} type="native" />
      </div>
    </div>
  );
};

export default Marketplace;
