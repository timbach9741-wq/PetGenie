export const globalTranslate = (text: string, lang: string) => {
  if (!text || !lang) return text;
  
  // Normalize language code to match our dictionary keys
  let normalizedLang = lang;
  if (lang.startsWith('en')) normalizedLang = 'en';
  else if (lang.startsWith('ja')) normalizedLang = 'ja';
  else if (lang.startsWith('zh')) normalizedLang = 'zh-TW';
  else if (lang.startsWith('es')) normalizedLang = 'es';
  else if (lang.startsWith('ko')) return text; // Korean is the default source language

  const dictionary: Record<string, Record<string, string>> = {
    "en": {
      "리트리버 계열": "Retriever Lineage",
      "스피츠 계열": "Spitz Lineage",
      "고관절 이형성증": "Hip Dysplasia",
      "기타 미분류": "Others",
      "골든 리트리버": "Golden Retriever",
      "진돗개": "Jindo Dog",
      "기타 믹스": "Other Mixes"
    },
    "ja": {
      "리트리버 계열": "レトリバー系",
      "스피츠 계열": "スピッツ系",
      "고관절 이형성증": "股関節形成不全",
      "기타 미분류": "その他",
      "골든 리트리버": "ゴールデン・レトリバー",
      "진돗개": "珍島犬",
      "기타 믹스": "その他のミックス"
    },
    "zh-TW": {
      "리트리버 계열": "尋回犬系",
      "스피츠 계열": "狐狸犬系",
      "고관절 이형성증": "髖關節發育不良",
      "기타 미분류": "其他",
      "골든 리트리버": "黃金獵犬",
      "진돗개": "珍島犬",
      "기타 믹스": "其他混種"
    },
    "es": {
      "리트리버 계열": "Linaje Retriever",
      "스피츠 계열": "Linaje Spitz",
      "고관절 이형성증": "Displasia de cadera",
      "기타 미분류": "Otros",
      "골든 리트리버": "Golden Retriever",
      "진돗개": "Jindo",
      "기타 믹스": "Otras mezclas"
    }
  };

  return dictionary[normalizedLang]?.[text] || text;
};
