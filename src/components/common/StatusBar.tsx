import { cn } from '../../lib/utils';


const StatusBar = ({ dark = false }: { dark?: boolean }) => {
  // On real mobile devices, the system status bar is handled by the OS.
  // This component now only provides safe-area spacing.
  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] pointer-events-none",
      dark ? "text-white" : "text-zinc-900"
    )}
    style={{ height: 'max(env(safe-area-inset-top, 0px), 12px)' }}
    />
  );
};

export default StatusBar;
