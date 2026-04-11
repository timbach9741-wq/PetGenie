const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const locales = ['ko', 'en', 'ja', 'zh', 'es'];

const descMap = {
  ko: '반려견의 긍정적 반응을 이끌어낼 다양한 환경음을 들려주세요!',
  en: 'Play various environmental sounds to trigger positive responses from your dog!',
  ja: '犬の肯定的な反応を引き出す様々な環境音を聞かせてください！',
  zh: '播放各种环境声音以引发狗狗的积极回馈！',
  es: '¡Reproduce varios sonidos ambientales para desencadenar respuestas positivas en tu perro!'
};

locales.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.translator) data.translator = {};
    data.translator.desc = descMap[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated desc in ${lang}.json`);
  }
});
