import { useTranslation } from 'react-i18next';
import { Camera, LayoutDashboard, User, History as HistoryIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Screen } from '../../types';

export const Navigation = ({ current, onNavigate }: { current: Screen, onNavigate: (s: Screen) => void }) => {
  const { t } = useTranslation();
  const items = [
    { id: 'camera', icon: Camera, label: t('nav.scan') },
    { id: 'pet-dashboard', icon: LayoutDashboard, label: t('nav.health') },
    { id: 'history', icon: HistoryIcon, label: t('nav.history') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 px-6 pt-3 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as Screen)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-200 relative min-w-[56px] min-h-[44px] justify-center",
            current === item.id ? "text-emerald-600" : "text-zinc-400 active:text-zinc-600"
          )}
        >
          <item.icon className={cn("w-6 h-6 transition-transform", current === item.id && "scale-110")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          {current === item.id && (
            <motion.div 
              layoutId="nav-dot"
              className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-emerald-600"
            />
          )}
        </button>
      ))}
    </nav>
  );
};
