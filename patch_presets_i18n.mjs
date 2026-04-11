import fs from 'fs';
import path from 'path';

const localesDir = path.join('c:/Users/Tim/Desktop/Pet Genie/pet scen 1/src/locales');

const presetKeys = {
  ko: {
    play: "놀자!",
    walk: "산책 갈까?",
    love: "사랑해",
    stop: "안 돼!",
    eat: "밥 먹자",
    praise: "잘했어!"
  },
  en: {
    play: "Let's play!",
    walk: "Let's walk?",
    love: "I love you",
    stop: "Stop!",
    eat: "Time to eat",
    praise: "Good job!"
  },
  ja: {
    play: "遊ぼう！",
    walk: "散歩行く？",
    love: "愛してるよ",
    stop: "ダメ！",
    eat: "ご飯だね",
    praise: "えらいね！"
  },
  es: {
    play: "¡A jugar!",
    walk: "¿Paseamos?",
    love: "Te amo",
    stop: "¡Para!",
    eat: "A comer",
    praise: "¡Buen chico!"
  },
  zh: {
    play: "去玩吧！",
    walk: "去散步吗？",
    love: "我爱你",
    stop: "不行！",
    eat: "吃饭啦",
    praise: "做得好！"
  }
};

Object.entries(presetKeys).forEach(([lang, keys]) => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const data = JSON.parse(rawData);
    
    if (!data.translator) data.translator = {};
    if (!data.translator.presets) data.translator.presets = {};
    
    Object.assign(data.translator.presets, keys);
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
    console.log(`Updated presets for ${lang}.json`);
  }
});
