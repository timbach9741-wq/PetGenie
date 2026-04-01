const fs = require('fs');

const NotionURL = 'https://dandy-prose-390.notion.site/Pet-Genie-Privacy-Policy-33001a34a2ba80edb9d5c7d121135e9c';

// 1. AuthScreens.tsx -> replace dummy Notion URL
let authStr = fs.readFileSync('src/components/screens/AuthScreens.tsx', 'utf8');
authStr = authStr.replace(/https:\/\/notion\.so\//g, NotionURL);
fs.writeFileSync('src/components/screens/AuthScreens.tsx', authStr);

// 2. ProfileScreen.tsx -> update privacy policy action & language switch
let profileStr = fs.readFileSync('src/components/screens/ProfileScreen.tsx', 'utf8');

// Privacy Policy link
profileStr = profileStr.replace(
  "{ icon: Shield, label: t('privacy.title'), value: '', action: () => onNavigate('privacy') }",
  `{ icon: Shield, label: t('privacy.title'), value: '', action: () => window.open('${NotionURL}', '_blank') }`
);

// Language Change logic
profileStr = profileStr.replace(
  "antigravityEngine.switchLanguage(nextLang);",
  "localStorage.clear(); localStorage.setItem('i18nextLng', nextLang); window.location.reload();"
);

fs.writeFileSync('src/components/screens/ProfileScreen.tsx', profileStr);

// 3. geminiService.ts -> prompt lock
let geminiStr = fs.readFileSync('src/services/geminiService.ts', 'utf8');
const oldPrompt = "return `CRITICAL: REPLY ONLY IN ${targetLang}. ${noKoreanStr}ALL BREED AND DISEASE NAMES MUST BE TRANSLATED.";
const newPrompt = "return `REPLY ONLY IN [${targetLang}]. NO KOREAN.\\nALL BREED AND DISEASE NAMES MUST BE TRANSLATED.";
geminiStr = geminiStr.replace(oldPrompt, newPrompt);
fs.writeFileSync('src/services/geminiService.ts', geminiStr);

// We should also check geminiScanner.ts just in case it duplicates
let scannerStr = fs.readFileSync('src/services/geminiScanner.ts', 'utf8');
const oldScannerPrompt = "CRITICAL: REPLY ONLY IN ${targetLang}. ${noKoreanStr}ALL BREED AND DISEASE NAMES MUST BE TRANSLATED.";
const newScannerPrompt = "REPLY ONLY IN [${targetLang}]. NO KOREAN.\\nALL BREED AND DISEASE NAMES MUST BE TRANSLATED.";
scannerStr = scannerStr.replace(oldScannerPrompt, newScannerPrompt);
fs.writeFileSync('src/services/geminiScanner.ts', scannerStr);

// 4. AIVetScreen.tsx -> start daily limit at 3
let aivetStr = fs.readFileSync('src/components/screens/AIVetScreen.tsx', 'utf8');
aivetStr = aivetStr.replace(
  "const [consultationTokens, setConsultationTokens] = useState(0);",
  "const [consultationTokens, setConsultationTokens] = useState(3);"
);
fs.writeFileSync('src/components/screens/AIVetScreen.tsx', aivetStr);

console.log('Final Global Specs (Legal, Prompt, Lang, Ads) integrated.');
