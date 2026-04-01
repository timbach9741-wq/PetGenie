const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!code.includes('AdBanner')) {
  code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, "import { $1 } from 'lucide-react';\nimport AdBanner from './components/common/AdBanner';");
}

// 2. Add state
if (!code.includes('interstitialAction')) {
  code = code.replace("const [analysisResult, setAnalysisResult] = useState<any>(null);", "const [analysisResult, setAnalysisResult] = useState<any>(null);\n  const [interstitialAction, setInterstitialAction] = useState<{onComplete: () => void} | null>(null);");
}

// 3. Add Banner Ad
code = code.replace(
  "{!isSubScreen && (\n          <NavigationBar current={currentScreen} onNavigate={handleTabNavigate} />\n        )}",
  "{!isSubScreen && (\n          <div className=\"shrink-0 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.02)]\">\n            <AdBanner isPremium={isPremium} onUpgrade={() => navigateTo('membership')} type=\"banner\" />\n            <NavigationBar current={currentScreen} onNavigate={handleTabNavigate} />\n          </div>\n        )}"
);
// In case of CRLF
code = code.replace(
  "{!isSubScreen && (\r\n          <NavigationBar current={currentScreen} onNavigate={handleTabNavigate} />\r\n        )}",
  "{!isSubScreen && (\r\n          <div className=\"shrink-0 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.02)]\">\r\n            <AdBanner isPremium={isPremium} onUpgrade={() => navigateTo('membership')} type=\"banner\" />\r\n            <NavigationBar current={currentScreen} onNavigate={handleTabNavigate} />\r\n          </div>\r\n        )}"
);


// 4. Add Interstitial Ad Modal at end
const modalStr = `
      <AnimatePresence>
        {interstitialAction && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 text-white"
          >
            <div className="bg-zinc-800 p-8 rounded-3xl w-full max-w-sm text-center relative overflow-hidden border border-zinc-700 shadow-2xl">
              <div className="absolute top-3 left-3 bg-zinc-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider text-zinc-300">Sponsored</div>
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 mt-4">Google AdSense</div>
              
              <div className="aspect-[300/250] bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700 mb-8">
                <span className="text-zinc-600 font-bold uppercase tracking-widest text-sm">전면 광고 영역</span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">프리미엄 펫 케어</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">스마트한 반려견 관리의 시작</p>
              
              <button 
                onClick={() => {
                  interstitialAction.onComplete();
                  setInterstitialAction(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                광고 닫기 및 결과 보기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
`;
if (!code.includes('fixed inset-0 z-[100]')) {
  code = code.replace("  );\n}\n", modalStr);
  code = code.replace("  );\r\n}\r\n", modalStr);
  code = code.replace("  );\n}", modalStr);
  code = code.replace("  );\r\n}", modalStr);
}

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('App.tsx string replaced successfully');
