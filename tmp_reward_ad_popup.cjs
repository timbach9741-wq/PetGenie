const fs = require('fs');

const aivetPath = 'src/components/screens/AIVetScreen.tsx';
let aivetStr = fs.readFileSync(aivetPath, 'utf8');

// Add showAdPopup state
aivetStr = aivetStr.replace(
  "const [consultationTokens, setConsultationTokens] = useState(3);",
  "const [consultationTokens, setConsultationTokens] = useState(3);\n  const [showAdPopup, setShowAdPopup] = useState(false);"
);

// Modify handleSend to trigger popup instead of sending if tokens are 0
aivetStr = aivetStr.replace(
  "const handleSend = async () => {",
  `const handleSend = async () => {
    if (!isPremium && consultationTokens <= 0) {
      setShowAdPopup(true);
      return;
    }`
);

// Change handleWatchAd to close the popup first
aivetStr = aivetStr.replace(
  "const handleWatchAd = () => {",
  "const handleWatchAd = () => {\n    setShowAdPopup(false);"
);

// Find the Input Area rendering block (around line 203)
// We will replace the condition that hides the input box
// From `{!isPremium && consultationTokens <= 0 ? ( ... ) : ( ... )}` to just `<div className="flex items-center gap-2 bg-zinc-50...`
// Since the user is asking for a popup, we shouldn't hide the input entirely, just intercept it.
// I'll rebuild the input area and add the Popup modal.

const popupUI = `
      {/* 팝업 모달: 보상형 광고 */}
      <AnimatePresence>
        {showAdPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-50">
                <Gift className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-center text-zinc-900 mb-2">상담 한도 소진</h3>
              <p className="text-sm text-zinc-500 text-center mb-6 leading-relaxed">
                일일 무료 상담(3회)이 모두 소진되었습니다.<br/>광고를 시청하고 상담 기회를 1회 추가하시겠어요?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAdPopup(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  취소(Cancel)
                </button>
                <button 
                  onClick={handleWatchAd}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" /> 광고 보기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

aivetStr = aivetStr.replace(
  "{/* Input Area */}",
  popupUI + "\n      {/* Input Area */}"
);

// We need to fix the input area itself because it currently uses `!isPremium && consultationTokens <= 0 ? <button> : <input>`
// I will use regex to completely replace that section with just the input.

// Because multiline replace is tricky with readFileSync, I will just write a specific regex or replace.
// Let's just restore the normal input area completely.
const inputAreaRegex = /\{\!isPremium && consultationTokens <= 0 \? \([\s\S]*?\) \: \([\s\S]*?<div className="flex items-center gap-2 bg-zinc-50([\s\S]*?)\}\n        <p className="text-\[9px\] text-zinc-400 text-center/m;

aivetStr = aivetStr.replace(inputAreaRegex, `<div className="flex items-center gap-2 bg-zinc-50$1\n        <p className="text-[9px] text-zinc-400 text-center`);

fs.writeFileSync(aivetPath, aivetStr);

console.log('AIVetScreen ad popup injected!');
