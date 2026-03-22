import { cn } from '../../lib/utils';

export const StatusBar = ({ dark = false }: { dark?: boolean }) => {
  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] pointer-events-none",
      dark ? "text-white" : "text-zinc-900"
    )}
    style={{ height: 'max(env(safe-area-inset-top, 0px), 12px)' }}
    />
  );
};
