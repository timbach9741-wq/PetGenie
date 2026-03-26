/// <reference types="vite/client" />

// Gemini API 설정
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// 시스템 프롬프트: 다국어 및 수의사 페르소나 설정
const getSystemInstruction = (lang: string, petInfo?: string) => `
You are a professional veterinarian with 15 years of experience.
Analyze the provided text and image to give advice.
IMPORTANT: Your entire response must be in ${lang} language.
Structure: [Summary] - [Possible Causes] - [First Aid/Advice] - [Warning].
Disclaimer: "This is for reference only. Visit a vet for a professional diagnosis."
심각한 증상(호흡곤란, 지속적 구토 등)에는 즉시 응급실 방문을 권고하십시오.
${petInfo ? `현재 상담 대상 반려동물 정보: ${petInfo}` : ''}
`;

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
  const langMap: Record<string, string> = {
    ko: '한국어',
    en: 'English',
    ja: '日本語',
    zh: '中文',
    es: 'Español',
  };
  const lang = langMap[currentLang] || 'English';

  const systemText = getSystemInstruction(lang, petInfo);

  // 프롬프트 구성: 이전 대화 내역 + 새 입력
  const fullPrompt = chatHistory
    ? `[이전 대화 내역]\n${chatHistory}\n\n보호자: ${userInput}\n수의사:`
    : userInput;

  const parts: any[] = [{ text: fullPrompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageBase64 } });
  }

  const body = {
    contents: [{ role: 'user', parts }],
    system_instruction: { parts: [{ text: systemText }] },
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
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }
    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};
