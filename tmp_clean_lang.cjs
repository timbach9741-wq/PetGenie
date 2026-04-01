const fs = require('fs');

// 1. antigravityEngine.ts 
let antiPath = 'src/services/antigravityEngine.ts';
let antiStr = fs.readFileSync(antiPath, 'utf8');
antiStr = antiStr.replace(/switchLanguage: \([^\{]+\{[\s\S]+?\},/, 
`switchLanguage: (newLang: string) => {
    localStorage.clear();
    localStorage.setItem('user-language', newLang);
    localStorage.setItem('i18nextLng', newLang);
    window.location.reload();
  },`);
fs.writeFileSync(antiPath, antiStr);

// 2. ProfileScreen.tsx
let profilePath = 'src/components/screens/ProfileScreen.tsx';
let profileStr = fs.readFileSync(profilePath, 'utf8');
profileStr = profileStr.replace(
  "localStorage.clear(); localStorage.setItem('i18nextLng', nextLang); window.location.reload();",
  "antigravityEngine.switchLanguage(nextLang);"
);
// Import antigravityEngine if not already imported (it is, I saw it at line 1 in my earlier view_file)
fs.writeFileSync(profilePath, profileStr);

// 3. LanguageSwitcher.tsx
let langPath = 'src/components/common/LanguageSwitcher.tsx';
let langStr = fs.readFileSync(langPath, 'utf8');
langStr = langStr.replace(
  "setShowDropdown(false); window.location.reload();", 
  "setShowDropdown(false);"
);
langStr = langStr.replace(
  "localStorage.clear(); localStorage.setItem('user-language', code);\n    i18n.changeLanguage(code);\n    setShowDropdown(false); window.location.reload();",
  "import { antigravityEngine } from '../../services/antigravityEngine';\n    antigravityEngine.switchLanguage(code);"
);
// Above replace might break because of exact matching. Let's just use regex for selectLang instead.

langStr = langStr.replace(/const selectLang = \([\s\S]+?\};/, 
`const selectLang = (code: string) => {
    antigravityEngine.switchLanguage(code);
  };`);
// Also fix the import if it's missing in LanguageSwitcher
if(!langStr.includes("antigravityEngine")) {
    langStr = "import { antigravityEngine } from '../../services/antigravityEngine';\n" + langStr;
}

fs.writeFileSync(langPath, langStr);

console.log('Language state purge fully repaired.');
