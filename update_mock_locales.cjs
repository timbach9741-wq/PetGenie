const fs = require('fs');
const path = require('path');

const updates = {
  ko: {
    mock_luna: "루나",
    mock_choco: "초코",
    mock_mungchi: "뭉치",
    mock_bori: "보리",
    mock_kong: "콩이",
    ranking_min: "분",
    ranking_streak: "일 연속"
  },
  en: {
    mock_luna: "Luna",
    mock_choco: "Choco",
    mock_mungchi: "Max",
    mock_bori: "Bella",
    mock_kong: "Coco",
    ranking_min: "min",
    ranking_streak: "d streak"
  },
  es: {
    mock_luna: "Luna",
    mock_choco: "Choco",
    mock_mungchi: "Max",
    mock_bori: "Bella",
    mock_kong: "Coco",
    ranking_min: " min",
    ranking_streak: " días racha"
  },
  ja: {
    mock_luna: "ルナ",
    mock_choco: "チョコ",
    mock_mungchi: "マックス",
    mock_bori: "ベラ",
    mock_kong: "ココ",
    ranking_min: "分",
    ranking_streak: "日連続"
  },
  zh: {
    mock_luna: "露娜",
    mock_choco: "巧克",
    mock_mungchi: "麦克斯",
    mock_bori: "贝拉",
    mock_kong: "可可",
    ranking_min: "分钟",
    ranking_streak: "天连续"
  }
};

const localesDir = path.join(__dirname, 'src', 'locales');
for (const lang of Object.keys(updates)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!data.community) {
      data.community = {};
    }
    // merge updates
    data.community = { ...data.community, ...updates[lang] };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Updated ${lang}.json`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
