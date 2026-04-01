const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// Update imports
content = content.replace(
  /import \{ cn \} from '\.\/lib\/utils';\nimport \{ GoogleGenAI \} from "@google\/genai";/,
  `import { cn } from './lib/utils';
import { antigravityEngine } from './lib/antigravity';
import { performPetScan, getFallbackResult } from './services/geminiScanner';`
);

// We need to safely replace handleScan
const startKeyword = '  const handleScan = async (data: { image: string, weight?: number, height?: number }) => {';
const startIndex = content.indexOf(startKeyword);

if (startIndex === -1) {
  console.error("Couldn't find handleScan");
  process.exit(1);
}

// Find the precise end of handleScan -> which is followed by "  const handleUpgrade = () => {"
const endKeyword = '  const handleUpgrade = () => {';
const endIndex = content.indexOf(endKeyword);

if (endIndex === -1) {
  console.error("Couldn't find handleUpgrade");
  process.exit(1);
}

const before = content.slice(0, startIndex);
const after = content.slice(endIndex);

const newHandleScan = `  const handleScan = async (data: { image: string, weight?: number, height?: number }) => {
    if (!data.image) {
      alert("이미지 데이터가 올바르지 않습니다.");
      return;
    }

    setCapturedImage(data.image);
    setIsAnalyzing(true);
    
    try {
      const result = await performPetScan(data, petProfile, i18n.language, GEMINI_API_KEY, t);
      setAnalysisResult(result);
      
      if (!isPremium) setScanCount(prev => prev + 1);

      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        image: data.image,
        result: result
      }, ...prev]);
      
      if (result?.primaryBreed && !petProfile.breed) {
        setPetProfile({ ...petProfile, breed: result.primaryBreed });
      }
      
      navigateTo('health-report');
    } catch (error) {
      console.error("AI Analysis failed:", error);
      const fallbackResult = getFallbackResult(t);
      setAnalysisResult(fallbackResult);
      
      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        image: data.image,
        result: fallbackResult
      }, ...prev]);
      
      navigateTo('health-report');
    } finally {
      setIsAnalyzing(false);
    }
  };

`;

fs.writeFileSync(appTsxPath, before + newHandleScan + after, 'utf8');
console.log('App.tsx refactored successfully.');
