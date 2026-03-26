import fs from 'fs';
import path from 'path';

const localesDir = './src/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const updates = {
  ko: {
    guide_desc: "일반 회원은 총 3회의 건강 스캔과 기본 요약 리포트, 기본 케어 가이드를 이용하실 수 있습니다.\\n반면, <1>프리미엄 멤버십</1>은 무제한 스캔, 24종 유전 질환 심층 리포트, 그리고 신체 정보 기반의 맞춤형 정밀 케어 가이드 등 반려동물을 위한 모든 프리미엄 권한을 제공합니다.",
    benefit1: "AI 유전 분석 스캔",
    benefit1_free: "총 3회",
    benefit1_premium: "무제한",
    benefit2: "심층 건강 리포트",
    benefit2_free: "기본 요약",
    benefit2_premium: "24종 유전 질환 분석",
    benefit3: "맞춤형 케어 가이드",
    benefit3_free: "기본 식단 및 운동",
    benefit3_premium: "신체 기반 정밀 플랜"
  },
  en: {
    guide_desc: "Basic members receive up to 3 health scans, a basic summary report, and standard care guidelines.\\nHowever, <1>Premium Membership</1> unlocks unlimited scans, an in-depth report on 24 genetic diseases, and highly personalized care plans based on your pet's specific body metrics.",
    benefit1: "AI Health Scan",
    benefit1_free: "3 times limit",
    benefit1_premium: "Unlimited",
    benefit2: "In-depth Health Report",
    benefit2_free: "Basic summary",
    benefit2_premium: "24 genetic diseases",
    benefit3: "Custom Care Guide",
    benefit3_free: "Standard diet & exercise",
    benefit3_premium: "Precision body-based plan"
  },
  ja: {
    guide_desc: "一般会員は最大3回の健康スキャン、基本的なサマリーレポート、標準ケアガイドを利用できます。\\n一方、<1>プレミアムメンバーシップ</1>では、無制限のスキャン、24種類の遺伝性疾患に関する詳細レポート、ペットの身体データに基づいた専用の高度なケアプランなどを提供します。",
    benefit1: "AI遺伝子スキャン",
    benefit1_free: "計3回まで",
    benefit1_premium: "無制限",
    benefit2: "詳細な健康レポート",
    benefit2_free: "基本サマリー",
    benefit2_premium: "24種の遺伝性疾患",
    benefit3: "カスタムケアガイド",
    benefit3_free: "基本の食事と運動",
    benefit3_premium: "身体データに基づく精密プラン"
  },
  es: {
    guide_desc: "Los miembros básicos disfrutan de hasta 3 escaneos de salud, un informe resumido y una guía de cuidado estándar.\\nPor otro lado, la <1>Membresía Premium</1> ofrece escaneos ilimitados, un informe detallado sobre 24 enfermedades genéticas y planes de cuidado personalizados con base en la información corporal de su mascota.",
    benefit1: "Escaneo de Salud IA",
    benefit1_free: "Límite de 3",
    benefit1_premium: "Ilimitado",
    benefit2: "Informe de Salud Detallado",
    benefit2_free: "Resumen básico",
    benefit2_premium: "24 enfermedades gen. ",
    benefit3: "Guía de Cuidado Per.",
    benefit3_free: "Dieta y ejercicio est.",
    benefit3_premium: "Plan preciso basado en cuerpo"
  },
  zh: {
    guide_desc: "普通会员可享受最多3次健康扫描、基本摘要报告和标准护理指南。\\n而<1>高级会员</1>则提供无限次扫描、24种遗传疾病的深度分析报告，以及基于宠物身体数据的定制高精度护理计划。",
    benefit1: "AI 基因健康扫描",
    benefit1_free: "最多 3 次",
    benefit1_premium: "无限制",
    benefit2: "深度健康报告",
    benefit2_free: "基础摘要",
    benefit2_premium: "24种遗传疾病分析",
    benefit3: "定制护理指南",
    benefit3_free: "标准饮食与运动",
    benefit3_premium: "基于体型的精准计划"
  }
};

for (const file of files) {
  const lang = path.basename(file, '.json');
  const filePath = path.join(localesDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (data.membership) {
       for (const k in updates[lang]) {
         data.membership[k] = updates[lang][k];
       }
       // Delete old benefits 4 and 5
       delete data.membership.benefit4;
       delete data.membership.benefit4_free;
       delete data.membership.benefit4_premium;
       delete data.membership.benefit5;
       delete data.membership.benefit5_free;
       delete data.membership.benefit5_premium;
       
       fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
       console.log(`Updated ${file}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}
