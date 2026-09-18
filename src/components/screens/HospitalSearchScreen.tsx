import { antigravityEngine } from '../../services/antigravityEngine';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, MapPin, Heart, Activity, Navigation as NavIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AdBanner } from '../common';
import { callGemini } from '../../lib/geminiProxy';


const HospitalSearchScreen = ({ onBack, isPremium, onUpgrade }: { onBack: () => void, isPremium: boolean, onUpgrade: () => void }) => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // Determine language for search
      const langName = i18n.language.startsWith('ko') ? 'Korean' :
                       i18n.language.startsWith('ja') ? 'Japanese' :
                       i18n.language.startsWith('zh') ? 'Chinese' :
                       i18n.language.startsWith('es') ? 'Spanish' : 'English';

      // Get user location if possible
      let locationContext = "";
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationContext = `User is currently at latitude: ${position.coords.latitude}, longitude: ${position.coords.longitude}.`;
      } catch (e) {
        console.log("Location access denied or timed out");
      }

      const prompt = `${antigravityEngine.getGlobalPrompt(i18n.language.split('-')[0])}\nFind animal hospitals or veterinary clinics near ${searchQuery}. ${locationContext}
        Return a JSON array of objects with: name, address, distance (estimated), openStatus (use "${t('hospital.status_open')}" for open, "${t('hospital.status_closed')}" for closed), rating, phone, and mapsUri.
        Respond in ${langName}.
        IMPORTANT: Return ONLY the JSON array.`;

      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const data = await callGemini('gemini-flash-latest', body);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const results = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
      setHospitals(results);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to mock if error
      setHospitals([
        { name: t('hospital.fallback_name1'), address: t('hospital.fallback_addr1'), distance: '1.2km', openStatus: t('hospital.status_open'), rating: 4.5 },
        { name: t('hospital.fallback_name2'), address: t('hospital.fallback_addr2'), distance: '2.5km', openStatus: t('hospital.status_open'), rating: 4.2 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50">
        <button onClick={onBack} aria-label="Go back" className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('dashboard.quick_actions.hospital')}</h1>
        <div className="w-9" />
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('hospital.search_placeholder')} 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <button onClick={handleSearch} className="text-emerald-600 text-xs font-bold">{t('hospital.search_button')}</button>
          )}
        </div>

        <div className="space-y-4 relative">
          {!isPremium && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[4px] rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center -mx-2">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 mb-1">{t('hospital.limit_title')}</h4>
              <p className="text-zinc-500 text-xs mb-6">{t('hospital.limit_desc')}</p>
              <button 
                onClick={onUpgrade}
                className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-900/20"
              >
                {t('common.upgrade')}
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{t('hospital.nearby_title')}</h3>
            {!isPremium && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">{t('hospital.summary_mode')}</span>
            )}
          </div>

          {hospitals.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <p className="text-zinc-400 text-sm">{t('hospital.no_results')}</p>
            </div>
          )}

          {hospitals.map((h, i) => (
            <a 
              key={i} 
              href={h.mapsUri || `https://www.google.com/maps/search/${encodeURIComponent(h.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex items-start gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <NavIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-zinc-900">{h.name}</h4>
                  {h.openStatus && (
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-md",
                      h.openStatus === t('hospital.status_open') || h.openStatus.includes('Open')
                        ? "bg-emerald-50 text-emerald-600" 
                        : "bg-zinc-100 text-zinc-400"
                    )}>
                      {h.openStatus}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">{h.address} {h.distance ? `• ${h.distance}` : ''}</p>
                <div className="flex items-center gap-3 mt-2">
                  {h.rating && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <Heart className="w-3 h-3 fill-orange-400" />
                      <span className="text-[10px] font-bold">{h.rating}</span>
                    </div>
                  )}
                  {h.phone && (
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Activity className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{h.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

export default HospitalSearchScreen;
