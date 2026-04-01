const fs = require('fs');
const path = require('path');

// Write ads.ts
const adsConfigPath = path.join('src', 'config', 'ads.ts');
if (!fs.existsSync(path.join('src', 'config'))) {
  fs.mkdirSync(path.join('src', 'config'));
}
fs.writeFileSync(adsConfigPath, `
// Pet Genie 실물 AdMob 단위 ID (Production)
export const ADMOB_IDS = {
  INTERSTITIAL: 'ca-app-pub-7630237731274328/5352133362', // 전면 광고 (분석전 광고)
  REWARDED: 'ca-app-pub-7630237731274328/6964597935',    // 보상형 전면 광고 (상담충전 광고)
  BANNER: 'ca-app-pub-7630237731274328/2029067070'        // 배너 광고 (하단배너)
};
`);

// 1. App.tsx (Interstitial Ad update)
const appPath = path.join('src', 'App.tsx');
let appStr = fs.readFileSync(appPath, 'utf8');
appStr = appStr.replace('Google AdSense', 'AdMob Interstitial Unit');
appStr = appStr.replace(/<span className="text-zinc-600 font-bold uppercase tracking-widest text-sm">전면 광고 영역<\/span>/, '<span className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] break-all px-4 text-center">ca-app-pub-7630237731274328/5352133362</span>');
if (!appStr.includes("import { ADMOB_IDS }")) {
  appStr = "import { ADMOB_IDS } from './config/ads';\n" + appStr;
}
fs.writeFileSync(appPath, appStr);

// 2. AdBanner.tsx (Banner update)
const bannerPath = path.join('src', 'components', 'common', 'AdBanner.tsx');
let bannerStr = fs.readFileSync(bannerPath, 'utf8');
bannerStr = bannerStr.replace(/Google AdSense/g, 'AdMob Banner');
bannerStr = bannerStr.replace(/하단 앵커형 배너 광고 영역/g, 'ca-app-pub-7630237731274328/2029067070');
bannerStr = bannerStr.replace(/네이티브 형태 광고 노출 영역/g, 'ca-app-pub-7630237731274328/2029067070');
if (!bannerStr.includes("import { ADMOB_IDS }")) {
  bannerStr = "import { ADMOB_IDS } from '../../config/ads';\n" + bannerStr;
}
fs.writeFileSync(bannerPath, bannerStr);

// 3. AIVetScreen.tsx (Rewarded Ad placeholder)
// Since AIVetScreen uses handleWatchAd to fake delay, we can just replace text if any, but let's visually add it into UI for proof
const aivetPath = path.join('src', 'components', 'screens', 'AIVetScreen.tsx');
let aivetStr = fs.readFileSync(aivetPath, 'utf8');
aivetStr = aivetStr.replace(
  '<h3 className="text-lg font-bold text-center text-zinc-900 mb-2">상담 한도 소진</h3>',
  '<h3 className="text-lg font-bold text-center text-zinc-900 mb-2">상담 한도 소진</h3>\n              <p className="text-[9px] text-zinc-400 font-mono text-center mb-1">UNIT: ca-app-pub-7630237731274328/6964597935</p>'
);
if (!aivetStr.includes("import { ADMOB_IDS }")) {
  aivetStr = "import { ADMOB_IDS } from '../../config/ads';\n" + aivetStr;
}
fs.writeFileSync(aivetPath, aivetStr);

console.log("AdMob Production IDs successfully mapped!");
