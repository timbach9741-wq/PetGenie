import fs from 'fs';
import path from 'path';

const localesDir = 'c:/Users/Tim/Desktop/강아지 앱/강아지-스켄 (1)/src/locales';
const languages = ['ko.json', 'en.json', 'es.json', 'ja.json', 'zh.json'];

const newKeys = {
  ko: {
    unlock_genetic_mix: "🔓 전체 유전 믹스 보기",
    expert_advice_title: "전문가 조언",
    wsava_title: "영양 및 활력 징후 (WSAVA 기준)",
    steve_mann_title: "행동 및 훈련 (Steve Mann 기준)",
    unlock_full_insights: "🔓 전체 인사이트 보기",
    no_analysis_result: "분석 결과가 없습니다.",
    precision_genetic_report: "정밀 유전 분석 리포트",
    premium_only_desc_part1: "프리미엄 회원만 확인 가능한",
    premium_only_desc_part2: "상세 유전 질환 24종",
    premium_only_desc_part3: "혈통 분석 데이터",
    upgrade_membership: "멤버십 업그레이드"
  },
  en: {
    unlock_genetic_mix: "🔓 View Full Genetic Mix",
    expert_advice_title: "Expert Advice",
    wsava_title: "Nutrition & Vitals (WSAVA)",
    steve_mann_title: "Behavior & Training (Steve Mann)",
    unlock_full_insights: "🔓 Unlock Full Insights",
    no_analysis_result: "No analysis results.",
    precision_genetic_report: "Precision Genetic Report",
    premium_only_desc_part1: "Available only for premium members",
    premium_only_desc_part2: "24 detailed genetic diseases",
    premium_only_desc_part3: "lineage analysis data",
    upgrade_membership: "Upgrade Membership"
  },
  es: {
    unlock_genetic_mix: "🔓 Ver mezcla genética completa",
    expert_advice_title: "Consejo de Expertos",
    wsava_title: "Nutrición y signos vitales (WSAVA)",
    steve_mann_title: "Comportamiento y entrenamiento (Steve Mann)",
    unlock_full_insights: "🔓 Desbloquear todos los insights",
    no_analysis_result: "No hay resultados de análisis.",
    precision_genetic_report: "Informe Genético de Precisión",
    premium_only_desc_part1: "Disponible solo para miembros premium",
    premium_only_desc_part2: "24 enfermedades genéticas detalladas",
    premium_only_desc_part3: "datos de análisis de linaje",
    upgrade_membership: "Mejorar Membresía"
  },
  ja: {
    unlock_genetic_mix: "🔓 全遺伝子構成を見る",
    expert_advice_title: "専門家のアドバイス",
    wsava_title: "栄養とバイタルサイン（WSAVA基準）",
    steve_mann_title: "行動とトレーニング（Steve Mann基準）",
    unlock_full_insights: "🔓 すべてのインサイトを解除",
    no_analysis_result: "分析結果がありません。",
    precision_genetic_report: "精密遺伝子分析レポート",
    premium_only_desc_part1: "プレミアム会員限定",
    premium_only_desc_part2: "24種の詳細な遺伝性疾患",
    premium_only_desc_part3: "血統分析データ",
    upgrade_membership: "メンバーシップをアップグレード"
  },
  zh: {
    unlock_genetic_mix: "🔓 查看完整基因组",
    expert_advice_title: "专家建议",
    wsava_title: "营养与生命体征 (WSAVA)",
    steve_mann_title: "行为与训练 (Steve Mann)",
    unlock_full_insights: "🔓 解锁全部洞察",
    no_analysis_result: "没有分析结果。",
    precision_genetic_report: "精准基因分析报告",
    premium_only_desc_part1: "仅限高级会员查看",
    premium_only_desc_part2: "24种详细遗传疾病",
    premium_only_desc_part3: "血统分析数据",
    upgrade_membership: "升级会员"
  }
};

languages.forEach(file => {
  const langCode = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.report) data.report = {};
    data.report = { ...data.report, ...newKeys[langCode] };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  }
});
