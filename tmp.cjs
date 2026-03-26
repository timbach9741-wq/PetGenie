const fs = require('fs');
const p = 'c:/Users/Tim/Desktop/강아지 앱/강아지-스켄 (1)/src/components/screens/PetDashboard.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace('<div className="grid grid-cols-3 gap-4">', '<div className="grid grid-cols-5 gap-2">');
c = c.replace(/\{\s*icon:\s*Sparkles,\s*label:\s*t\('ai_vet\.title',\s*'AI 수의사'\),\s*color:\s*'bg-yellow-50 text-yellow-600',\s*action:\s*\(\)\s*=>\s*isPremium\s*\?\s*onNavigate\('ai-vet'\)\s*:\s*onNavigate\('membership'\)\s*\},?\n?/g, '');
c = c.replace(/className="flex flex-col items-center gap-2 group"/g, 'className="flex flex-col items-center gap-1.5 group"');
c = c.replace(/w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90/g, 'w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-active:scale-95');
c = c.replace(/text-\[9px\] font-bold text-zinc-500 uppercase tracking-wider/g, 'text-[10px] font-bold text-zinc-600 tracking-tight whitespace-nowrap');

fs.writeFileSync(p, c, 'utf8');
console.log('done');
