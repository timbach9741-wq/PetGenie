import { useTranslation } from 'react-i18next';
import { Camera, LayoutGrid, User, History as HistoryIcon, HeartPulse, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Screen } from '../../types';
import vetImage from '../../assets/images/ai-vet-character.png';

const navItems = [
  { id: 'camera', icon: Camera, label: 'nav.scan', isSpecial: false },
  { id: 'pet-dashboard', icon: LayoutGrid, label: 'nav.health', isSpecial: false },
  { id: 'ai-vet', icon: HeartPulse, label: 'nav.ai_vet', isSpecial: true, imgIcon: vetImage },
  { id: 'community', icon: MessageCircle, label: 'nav.community', isSpecial: false },
  { id: 'history', icon: HistoryIcon, label: 'nav.history', isSpecial: false },
  { id: 'profile', icon: User, label: 'nav.profile', isSpecial: false },
];

const Navigation = ({ current, onNavigate }: { current: Screen, onNavigate: (s: Screen) => void }) => {
  const { t } = useTranslation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 px-2 pt-2.5 pb-[max(env(safe-area-inset-bottom,0px),12px)] flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as Screen)}
          className={cn(
            "flex flex-col items-center gap-0.5 transition-all duration-200 relative min-w-[40px] min-h-[40px] justify-center",
            current === item.id 
              ? (item.isSpecial ? "text-rose-500" : "text-emerald-600") 
              : "text-zinc-400 active:text-zinc-600"
          )}
        >
          {item.imgIcon ? (
            <img 
              src={item.imgIcon} 
              alt="Avatar" 
              className={cn(
                "w-6 h-6 rounded-full object-cover transition-transform shadow-sm",
                current === item.id && "scale-110 ring-2 ring-rose-500",
                item.isSpecial && current !== item.id && "animate-pulse"
              )}
            />
          ) : (
            <item.icon 
              className={cn(
                "w-5 h-5 transition-transform", 
                current === item.id && "scale-110",
                item.isSpecial && current !== item.id && "text-rose-400 animate-pulse"
              )} 
            />
          )}
          <span className="text-[9px] font-bold uppercase tracking-wider">{t(item.label)}</span>
          {current === item.id && (
            <motion.div 
              layoutId="nav-dot"
              className={cn(
                "absolute -bottom-1 w-1 h-1 rounded-full",
                item.isSpecial ? "bg-rose-500" : "bg-emerald-600"
              )}
            />
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;

