import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, 'src', 'locales');
const masterFile = path.join(localesDir, 'ko.json');

const targetLangs = ['en', 'es', 'ja', 'zh'];

// 기준 데이터 읽기 (Master: ko.json)
let masterData = {};
try {
  masterData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
} catch (e) {
  console.error(`🚨 기준 파일(한국어)을 읽을 수 없습니다: ${masterFile}`);
  process.exit(1);
}

// 객체를 순회하며 누락된 키를 채워넣는 재귀 함수
function mergeLocales(masterObj, targetObj) {
  const result = { ...targetObj };
  
  for (const key in masterObj) {
    if (typeof masterObj[key] === 'object' && masterObj[key] !== null) {
      if (!result[key] || typeof result[key] !== 'object') {
        result[key] = {};
      }
      result[key] = mergeLocales(masterObj[key], result[key]);
    } else {
      // 타겟 파일에 해당 키가 없으면 (누락된 경우)
      if (result[key] === undefined) {
        result[key] = `[TODO] ${masterObj[key]}`;
      }
    }
  }
  
  // 마스터 파일 기준으로 키 순서 정렬 (파일 일관성 유지)
  const sortedResult = {};
  for (const key in masterObj) {
    sortedResult[key] = result[key];
  }
  return sortedResult;
}

console.log('🔄 다국어 구조 동기화 시작 (기준: ko.json)...');

let hasMissingTranslations = false;

targetLangs.forEach(lang => {
  const targetFile = path.join(localesDir, `${lang}.json`);
  let targetData = {};
  
  try {
    if (fs.existsSync(targetFile)) {
      targetData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    }
  } catch (e) {
    console.warn(`⚠️ 대상 파일을 읽을 수 없습니다 (새로 생성합니다): ${targetFile}`);
  }

  // 타겟 객체의 과거 형태를 텍스트로 미리 캐싱
  const previousString = JSON.stringify(targetData);

  const updatedData = mergeLocales(masterData, targetData);
  
  // 업데이트 후 형태 캐싱
  const newString = JSON.stringify(updatedData);

  fs.writeFileSync(targetFile, JSON.stringify(updatedData, null, 2) + '\n', 'utf8');
  
  if (previousString !== newString) {
    console.log(`✅ ${lang}.json 누락 키 업데이트 완료!`);
    if(newString.includes('[TODO]')) hasMissingTranslations = true;
  } else {
    console.log(`✔️ ${lang}.json 변경 사항 없음.`);
  }
});

console.log('\n========================================');
console.log('🎉 다국어 구조 동기화가 완료되었습니다.');
if (hasMissingTranslations) {
  console.log('🚨 주의: 텍스트 편집기에서 "[TODO]" 로 검색하여 누락된 번역을 채워주세요!');
} else {
  console.log('✨ 누락된 번역없이 완벽합니다.');
}
console.log('========================================');
