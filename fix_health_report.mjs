import fs from 'fs';
import path from 'path';

// === 1. Update locale files with new keys ===
const localeDir = './src/locales';
const newKeys = {
  ko: {
    "report.start_premium": "🔓 Premium 시작하기 — $4.99/월",
    "report.cancel_anytime": "언제든지 해지 가능 · 7일 무료 체험",
    "report.identification_basis": "품종 식별 근거",
    "report.source_label": "출처",
    "report.wsava_default": "영양 상태는 체온, 맥박과 함께 \"다섯 번째 활력징후\"입니다. 체계적인 영양 평가를 통해 질병을 예방하고 수명을 연장할 수 있습니다.",
    "report.wsava_source": "출처: 세계소동물수의사회 (WSAVA) 지침",
    "report.stevemann_default": "강압적인 방식 대신 간식과 장난감을 활용한 \"긍정강화교육\"이 반려견과의 신뢰를 쌓는 핵심입니다. 보디랭귀지를 이해하고 소통하세요.",
    "report.stevemann_source": "출처: 스티브 만 (Steve Mann) 교육 방법론",
    "report.lineage_retriever": "리트리버 계열 (Retriever Lineage)",
    "report.lineage_spitz": "스피츠 계열 (Spitz Lineage)",
    "report.lineage_others": "기타 미분류 (Others)",
    "report.default_risk_name": "고관절 이형성증",
    "report.default_risk_desc": "골든 리트리버 품종에서 흔히 발생합니다. 관절 건강을 위해 조기 발견과 체중 관리가 매우 중요합니다.",
    "report.premium_desc_connector": "및",
    "report.premium_desc_suffix": "입니다.",
    "report.marker_mdr1": "MDR1 유전자 변이",
    "report.marker_dm": "퇴행성 골수염 (DM)",
    "report.marker_pra": "진행성 망막 위축증",
    "report.default_disclaimer": "이 분석은 AI 시각 평가와 공개된 수의학 연구를 기반으로 합니다. 전문 수의사의 진단을 대체하지 않습니다.",
    "report.references_title": "참고 자료 References",
    "report.risk_level_high": "위험",
    "report.risk_level_medium": "주의",
    "report.risk_level_low": "양호"
  },
  en: {
    "report.start_premium": "🔓 Start Premium — $4.99/mo",
    "report.cancel_anytime": "Cancel anytime · 7-day free trial",
    "report.identification_basis": "Identification Basis",
    "report.source_label": "Source",
    "report.wsava_default": "Nutritional status is the \"fifth vital sign\" alongside temperature and pulse. Systematic nutritional assessment can prevent disease and extend lifespan.",
    "report.wsava_source": "Source: World Small Animal Veterinary Association (WSAVA) Guidelines",
    "report.stevemann_default": "Instead of coercive methods, \"positive reinforcement training\" using treats and toys is key to building trust with your dog. Understand their body language and communicate.",
    "report.stevemann_source": "Source: Steve Mann Training Methodology",
    "report.lineage_retriever": "Retriever Lineage",
    "report.lineage_spitz": "Spitz Lineage",
    "report.lineage_others": "Others",
    "report.default_risk_name": "Hip Dysplasia",
    "report.default_risk_desc": "Commonly found in Golden Retriever breeds. Early detection and weight management are critical for joint health.",
    "report.premium_desc_connector": "and",
    "report.premium_desc_suffix": ".",
    "report.marker_mdr1": "MDR1 Gene Mutation",
    "report.marker_dm": "Degenerative Myelopathy (DM)",
    "report.marker_pra": "Progressive Retinal Atrophy",
    "report.default_disclaimer": "This analysis is based on AI visual assessment and published veterinary research. It does not replace professional veterinary diagnosis.",
    "report.references_title": "References",
    "report.risk_level_high": "Critical",
    "report.risk_level_medium": "Moderate",
    "report.risk_level_low": "Normal"
  },
  ja: {
    "report.start_premium": "🔓 Premiumを開始 — $4.99/月",
    "report.cancel_anytime": "いつでもキャンセル可能・7日間無料体験",
    "report.identification_basis": "品種識別根拠",
    "report.source_label": "出典",
    "report.wsava_default": "栄養状態は体温、脈拍と並ぶ「5番目のバイタルサイン」です。体系的な栄養評価により疾病を予防し寿命を延ばすことができます。",
    "report.wsava_source": "出典：世界小動物獣医師会（WSAVA）ガイドライン",
    "report.stevemann_default": "強圧的な方法の代わりに、おやつやおもちゃを活用した「正の強化トレーニング」が愛犬との信頼関係を築く鍵です。ボディランゲージを理解し、コミュニケーションを取りましょう。",
    "report.stevemann_source": "出典：スティーブ・マン（Steve Mann）教育方法論",
    "report.lineage_retriever": "レトリーバー系統",
    "report.lineage_spitz": "スピッツ系統",
    "report.lineage_others": "その他",
    "report.default_risk_name": "股関節形成不全",
    "report.default_risk_desc": "ゴールデンレトリーバーによく見られる疾患です。関節の健康のために早期発見と体重管理が非常に重要です。",
    "report.premium_desc_connector": "と",
    "report.premium_desc_suffix": "です。",
    "report.marker_mdr1": "MDR1遺伝子変異",
    "report.marker_dm": "変性性脊髄症（DM）",
    "report.marker_pra": "進行性網膜萎縮症",
    "report.default_disclaimer": "この分析はAIの視覚的評価と公開された獣医学研究に基づいています。専門の獣医師の診断に代わるものではありません。",
    "report.references_title": "参考文献 References",
    "report.risk_level_high": "危険",
    "report.risk_level_medium": "注意",
    "report.risk_level_low": "良好"
  },
  zh: {
    "report.start_premium": "🔓 开始 Premium — $4.99/月",
    "report.cancel_anytime": "随时取消 · 7天免费试用",
    "report.identification_basis": "品种识别依据",
    "report.source_label": "来源",
    "report.wsava_default": "营养状况与体温、脉搏一样是"第五生命体征"。系统的营养评估可以预防疾病并延长寿命。",
    "report.wsava_source": "来源：世界小动物兽医协会（WSAVA）指南",
    "report.stevemann_default": "代替强制方法，利用零食和玩具的"正向强化训练"是与爱犬建立信任的关键。了解它们的肢体语言并进行沟通。",
    "report.stevemann_source": "来源：Steve Mann 教育方法论",
    "report.lineage_retriever": "寻回犬系",
    "report.lineage_spitz": "尖嘴犬系",
    "report.lineage_others": "其他",
    "report.default_risk_name": "髋关节发育不良",
    "report.default_risk_desc": "常见于金毛猎犬品种。早期发现和体重管理对关节健康至关重要。",
    "report.premium_desc_connector": "和",
    "report.premium_desc_suffix": "。",
    "report.marker_mdr1": "MDR1基因突变",
    "report.marker_dm": "退行性脊髓病（DM）",
    "report.marker_pra": "进行性视网膜萎缩",
    "report.default_disclaimer": "本分析基于AI视觉评估和已发表的兽医学研究。不能替代专业兽医的诊断。",
    "report.references_title": "参考文献 References",
    "report.risk_level_high": "危险",
    "report.risk_level_medium": "注意",
    "report.risk_level_low": "良好"
  },
  es: {
    "report.start_premium": "🔓 Iniciar Premium — $4.99/mes",
    "report.cancel_anytime": "Cancela en cualquier momento · 7 días gratis",
    "report.identification_basis": "Base de identificación",
    "report.source_label": "Fuente",
    "report.wsava_default": "El estado nutricional es el \"quinto signo vital\" junto con la temperatura y el pulso. La evaluación nutricional sistemática puede prevenir enfermedades y prolongar la vida.",
    "report.wsava_source": "Fuente: Directrices de WSAVA",
    "report.stevemann_default": "En lugar de métodos coercitivos, el \"entrenamiento de refuerzo positivo\" usando premios y juguetes es clave para construir confianza con tu perro. Comprende su lenguaje corporal y comunícate.",
    "report.stevemann_source": "Fuente: Metodología de Steve Mann",
    "report.lineage_retriever": "Linaje Retriever",
    "report.lineage_spitz": "Linaje Spitz",
    "report.lineage_others": "Otros",
    "report.default_risk_name": "Displasia de cadera",
    "report.default_risk_desc": "Comúnmente encontrada en Golden Retrievers. La detección temprana y el control de peso son fundamentales para la salud articular.",
    "report.premium_desc_connector": "y",
    "report.premium_desc_suffix": ".",
    "report.marker_mdr1": "Mutación del gen MDR1",
    "report.marker_dm": "Mielopatía degenerativa (DM)",
    "report.marker_pra": "Atrofia progresiva de retina",
    "report.default_disclaimer": "Este análisis se basa en la evaluación visual de IA y la investigación veterinaria publicada. No reemplaza el diagnóstico veterinario profesional.",
    "report.references_title": "Referencias",
    "report.risk_level_high": "Crítico",
    "report.risk_level_medium": "Moderado",
    "report.risk_level_low": "Normal"
  }
};

for (const [lang, keys] of Object.entries(newKeys)) {
  const filePath = path.join(localeDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Add keys into "report" section (flatten dotted keys into nested object)
  for (const [key, value] of Object.entries(keys)) {
    const parts = key.split('.');
    let obj = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!obj[parts[i]]) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${filePath}`);
}

console.log('\\nAll locale files updated successfully!');
