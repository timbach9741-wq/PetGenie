import fs from 'fs';

const file = 'c:/Users/Tim/Desktop/강아지 앱/강아지-스켄 (1)/src/components/screens/HealthReport.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  { search: '🔓 전체 유전 믹스 보기', replace: "{t('report.unlock_genetic_mix')}" },
  { search: '전문가 조언', replace: "{t('report.expert_advice_title')}" },
  { search: '영양 및 활력 징후 (WSAVA 기준)', replace: "{t('report.wsava_title')}" },
  { search: '행동 및 훈련 (Steve Mann 기준)', replace: "{t('report.steve_mann_title')}" },
  { search: '🔓 전체 인사이트 보기', replace: "{t('report.unlock_full_insights')}" },
  { search: '분석 결과가 없습니다.', replace: "{t('report.no_analysis_result')}" },
  { search: '정밀 유전 분석 리포트', replace: "{t('report.precision_genetic_report')}" },
  { search: '프리미엄 회원만 확인 가능한', replace: "{t('report.premium_only_desc_part1')}" },
  { search: '상세 유전 질환 24종', replace: "{t('report.premium_only_desc_part2')}" },
  { search: '혈통 분석 데이터', replace: "{t('report.premium_only_desc_part3')}" },
  { search: '멤버십 업그레이드', replace: "{t('report.upgrade_membership')}" }
];

replacements.forEach(r => {
  content = content.replace(new RegExp(r.search, 'g'), r.replace);
});

fs.writeFileSync(file, content, 'utf8');
console.log("Successfully replaced hardcoded strings in HealthReport.tsx");
