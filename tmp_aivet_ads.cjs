const fs = require('fs');
const filepath = 'src/components/screens/AIVetScreen.tsx';
let code = fs.readFileSync(filepath, 'utf8');

// 1. imports
code = code.replace(
  "import { ArrowLeft, Send, User, AlertCircle, Loader2 } from 'lucide-react';",
  "import { ArrowLeft, Send, User, AlertCircle, Loader2, Gift } from 'lucide-react';"
);

// 2. Add state inside AIVetScreen
if (!code.includes('consultationTokens')) {
  code = code.replace(
    "  const [inputText, setInputText] = useState('');",
    "  const [inputText, setInputText] = useState('');\n  const [consultationTokens, setConsultationTokens] = useState(0);\n  const [isAdLoading, setIsAdLoading] = useState(false);"
  );
}

// 3. handleSend Token deduction
if (!code.includes('setConsultationTokens(prev => prev - 1)')) {
  code = code.replace(
    "    if (!inputText.trim() || isLoading) return;",
    "    if (!inputText.trim() || isLoading) return;\n    if (!isPremium && consultationTokens <= 0) return;\n    if (!isPremium) setConsultationTokens(prev => prev - 1);"
  );
}

// 4. handleWatchAd logic
if (!code.includes('handleWatchAd')) {
  code = code.replace(
    "  // --- 메시지 전송 핸들러 ---",
    `  const handleWatchAd = () => {
    setIsAdLoading(true);
    // Simulate Ad Network Request
    setTimeout(() => {
      // Simulate 30% chance of Ad Load Failure
      const isFailed = Math.random() < 0.3;
      setIsAdLoading(false);
      
      if (isFailed) {
        // Fallback: Give 1 token anyway
        alert(t('ai_vet.ad_failed_fallback', '광고 로드에 실패했습니다. 예외적으로 1회 상담 기회를 시크릿 제공합니다!'));
        setConsultationTokens(1);
      } else {
        // Ad watched successfully
        alert(t('ai_vet.ad_reward_success', '광고 시청 혜택으로 1회 무료 상담이 충전되었습니다.'));
        setConsultationTokens(1);
      }
    }, 1500);
  };

  // --- 메시지 전송 핸들러 ---`
  );
}

// 5. Replace input area logic
const inputAreaOld = "        <div className=\"flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all\">\n          <input\n            type=\"text\"";
const inputAreaOldCRLF = "        <div className=\"flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all\">\r\n          <input\r\n            type=\"text\"";

const inputAreaNew = `        {!isPremium && consultationTokens <= 0 ? (
          <button
            onClick={handleWatchAd}
            disabled={isAdLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 animate-pulse"
          >
            {isAdLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Gift className="w-5 h-5" />
            )}
            {t('ai_vet.watch_ad_btn', 'Watch Ad for Free Consultation')}
          </button>
        ) : (
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <input
            type="text"`;

if (!code.includes('Watch Ad for Free Consultation')) {
  code = code.replace(inputAreaOld, inputAreaNew);
  code = code.replace(inputAreaOldCRLF, inputAreaNew);

  // Close the ternary operator at the end of the input area
  code = code.replace(
    "          </button>\n        </div>\n        <p",
    "          </button>\n        </div>\n        )}\n        <p"
  );
  code = code.replace(
    "          </button>\r\n        </div>\r\n        <p",
    "          </button>\r\n        </div>\r\n        )}\r\n        <p"
  );
}

fs.writeFileSync(filepath, code, 'utf8');
console.log('AIVetScreen Rewarded Ad Logic Injected');
