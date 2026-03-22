import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Target 1: The useEffect insertion point
const target1 = `    return () => clearTimeout(timer);\r\n  }, [dailyCare]);\r\n\r\n  const toggleCare = useCallback((id: string) => {`;
const target1_linux = target1.replace(/\r\n/g, '\n');

const replacement1 = `    return () => clearTimeout(timer);
  }, [dailyCare]);

  // Dynamic fallback retranslation when language changes
  useEffect(() => {
    // Re-translate current analysis result if it is fallback data
    if (analysisResult?.isFallback) {
      setAnalysisResult(getFallbackResult(t));
    }
    // Re-translate history items if they are fallback data
    setHistory(prev => prev.map(item => 
      item.result?.isFallback 
        ? { ...item, result: getFallbackResult(t) } 
        : item
    ));
  }, [i18n.language, t, analysisResult?.isFallback]);

  const toggleCare = useCallback((id: string) => {`;

if (content.includes(target1)) content = content.replace(target1, replacement1);
else if (content.includes(target1_linux)) content = content.replace(target1_linux, replacement1);
else console.error("Target 1 not found!");

// Target 2: The fallback block
const target2Regex = /\/\/ Fallback to mock data if AI fails[\s\S]*?setAnalysisResult\(fallbackResult\);/;
const replacement2 = `// Fallback to mock data if AI fails
      const fallbackResult = getFallbackResult(t);
      
      setAnalysisResult(fallbackResult);`;

if (target2Regex.test(content)) content = content.replace(target2Regex, replacement2);
else console.error("Target 2 not found!");

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx string replaced successfully!');
