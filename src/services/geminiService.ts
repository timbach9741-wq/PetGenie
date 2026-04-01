/// <reference types="vite/client" />

// Gemini API 설정
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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
