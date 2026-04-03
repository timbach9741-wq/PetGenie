/// <reference types="vite/client" />

// Gemini API 설정
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const getSystemInstruction = (lang: string, petInfo?: string) => {
  const langMap: Record<string, string> = { ko: 'KOREAN', en: 'ENGLISH', ja: 'JAPANESE', 'zh-TW': 'CHINESE', zh: 'CHINESE', es: 'SPANISH' };
  const targetLang = langMap[lang] || 'ENGLISH';
  const noKoreanStr = lang === 'ko' ? '' : 'NEVER USE KOREAN. ';
  
  return `REPLY ONLY IN [${targetLang}]. NO KOREAN.\nALL BREED AND DISEASE NAMES MUST BE TRANSLATED.
IDENTITY: You are "AI Vet", a highly advanced Veterinary Genetics Expert AI. Always act and speak as AI Vet. You have 15 years of experience.
Structure: [Summary] - [Detailed Analysis] - [First Aid] - [Urgency].
Disclaimer: "This is for reference only. Visit a vet for a professional diagnosis."
${petInfo ? `Current patient information: ${petInfo}` : ''}
`;
};

// --- 응답 캐싱을 위한 인메모리 Map ---
const responseCache = new Map<string, string>();
// 캐시 용량 제한(LRU 방식 단순 구현을 피하기 위해 크기 제한만 둠)
const MAX_CACHE_SIZE = 50;

/**
 * AI 수의사 상담 API 호출 (fetch 기반)
 * @param userInput 사용자 입력 텍스트
 * @param imageBase64 이미지 Base64 (선택)
 * @param currentLang 현재 언어 코드 (ko, en, ja, zh, es)
 * @param petInfo 반려동물 정보 문자열
 * @param chatHistory 이전 대화 내역
 */
export const fetchVetAnalysis = async (
  userInput: string,
  imageBase64?: string,
  currentLang: string = 'en',
  petInfo?: string,
  chatHistory?: string
): Promise<string> => {
  const langMap: { [key: string]: string } = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
    "zh-TW": "Traditional Chinese",
    es: "Spanish"
  };
  const targetLang = langMap[currentLang] || "English";

  const systemText = getSystemInstruction(targetLang, petInfo);

  // --- 캐시 (Cache) 검사 ---
  const cacheKey = [userInput, currentLang, petInfo || '', chatHistory || ''].join('||');
  if (responseCache.has(cacheKey) && !imageBase64) {
    console.log('✅ [Cache Hit] Returning cached response');
    return responseCache.get(cacheKey)!;
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  // 프롬프트 구성: 시스템 인스트럭션 + 이전 대화 내역 + 새 입력
  const fullPrompt = `${systemText}\n\n${
    chatHistory ? `[이전 대화 내역]\n${chatHistory}\n\n보호자: ${userInput}\n수의사:` : userInput
  }`;

  const parts: any[] = [{ text: fullPrompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  }

  const body = {
    contents: [{ role: 'user', parts }],
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API HTTP Error:', response.status, errorData);
      if (response.status === 429) {
        throw new Error('요금제 한도가 초과되었습니다 (Quota Exceeded). 잠시 후 다시 시도해주세요.');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    
    // --- 응답 캐시에 저장 ---
    if (!imageBase64) { // 텍스트 쿼리만 한정 캐싱 (이미지 캐싱은 비용/크기 문제가 있을 수 있어서 텍스트 주로)
      if (responseCache.size >= MAX_CACHE_SIZE) {
        // 가장 오래된 첫 번째 항목 제거 (단순 메모리 제어)
        const firstKey = responseCache.keys().next().value;
        if(firstKey) responseCache.delete(firstKey);
      }
      responseCache.set(cacheKey, text);
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};
