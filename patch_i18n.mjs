import fs from 'fs';
import path from 'path';

const localesDir = path.join('c:/Users/Tim/Desktop/Pet Genie/pet scen 1/src/locales');

const missingKeys = {
  ko: {
    desc: "지금 강아지가 무슨 반려동물 언어로 말하는지 확인해보세요!",
    result_desc_human: "사람의 언어로 번역된 결과입니다.",
    result_desc_dog: "강아지의 언어로 번역된 결과입니다.",
    play_original: "원래 소리 듣기",
    human_to_dog_result: "멍멍! 왈왈!!",
    ad_title: "광고 시청 후 번역하기",
    ad_desc: "무료 이용자는 보상형 광고를 1회 시청한 후 번역 기능을 사용할 수 있습니다."
  },
  en: {
    desc: "Find out what your dog is saying right now!",
    result_desc_human: "Translated effectively into human language.",
    result_desc_dog: "Translated effectively into dog language.",
    play_original: "Play original sound",
    human_to_dog_result: "Woof! Bark!!",
    ad_title: "Watch an Ad to Translate",
    ad_desc: "Free users can unlock a translation by watching a short rewarded ad."
  },
  ja: {
    desc: "今、犬がどんなペットの言葉を話しているか確認してみましょう！",
    result_desc_human: "人間の言葉に翻訳された結果です。",
    result_desc_dog: "犬の言葉に翻訳された結果です。",
    play_original: "元の音を聞く",
    human_to_dog_result: "ワンワン！ワフワフ！！",
    ad_title: "広告を視聴して翻訳する",
    ad_desc: "無料ユーザーは、リワード広告を1回視聴することで翻訳機能を使用できます。"
  },
  es: {
    desc: "¡Descubre lo que dice tu perro en este momento!",
    result_desc_human: "Resultado traducido al lenguaje humano.",
    result_desc_dog: "Resultado traducido al lenguaje canino.",
    play_original: "Reproducir sonido original",
    human_to_dog_result: "¡Guau! ¡Guau!!",
    ad_title: "Ver anuncio para traducir",
    ad_desc: "Los usuarios gratuitos pueden usar la traducción después de ver un anuncio."
  },
  zh: {
    desc: "现在来看看你的狗狗在说什么吧！",
    result_desc_human: "已翻译为人类语言。",
    result_desc_dog: "已翻译为狗狗语言。",
    play_original: "播放原声",
    human_to_dog_result: "汪汪！汪汪！！",
    ad_title: "观看广告后翻译",
    ad_desc: "免费用户在观看一次奖励广告后即可使用翻译功能。"
  }
};

Object.entries(missingKeys).forEach(([lang, keys]) => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const data = JSON.parse(rawData);
    
    if (!data.translator) {
      data.translator = {};
    }
    
    // Add missing keys
    data.translator.desc = keys.desc;
    data.translator.result_desc_human = keys.result_desc_human;
    data.translator.result_desc_dog = keys.result_desc_dog;
    data.translator.play_original = keys.play_original;
    data.translator.human_to_dog_result = keys.human_to_dog_result;
    data.translator.ad_title = keys.ad_title;
    data.translator.ad_desc = keys.ad_desc;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
    console.log(`Updated ${lang}.json`);
  } else {
    console.warn(`File ${filePath} not found`);
  }
});
