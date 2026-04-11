const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const locales = ['ko', 'en', 'ja', 'zh', 'es'];

const titleMap = {
  ko: '강아지 소통기',
  en: 'Dog Communicator',
  ja: '犬用コミュニケーター',
  zh: '狗狗沟通器',
  es: 'Comunicador Canino'
};

locales.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.translator) data.translator = {};
    data.translator.title = titleMap[lang];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang}.json`);
  }
});
