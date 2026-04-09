import { antigravityEngine } from './antigravityEngine';

export const performPetScan = async (
  data: { image: string, weight?: number, height?: number },
  petProfile: any,
  language: string,
  apiKey: string,
  t: any
) => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const mimeType = data.image.split(';')[0].split(':')[1] || "image/jpeg";
  const base64Data = data.image.split(',')[1];
  
  if (!base64Data) throw new Error("Invalid base64 data");

  const petContext = `
    Pet Context (if available):
    ${data.weight ? `- Weight: ${data.weight}kg` : '- Weight: not provided'}
    ${data.height ? `- Height: ${data.height}cm` : '- Height: not provided'}
    ${petProfile.age ? `- Age: ${petProfile.age} years` : ''}
    ${petProfile.gender ? `- Gender: ${petProfile.gender}` : ''}
  `;

  const baseLang = language.split('-')[0];
  const langMap: Record<string, string> = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
    zh: "Traditional Chinese",
    es: "Spanish"
  };
  const responseLang = langMap[baseLang] || "English";

  const noKoreanStr = baseLang === 'ko' ? '' : 'NEVER USE KOREAN. ';
  
  const prompt = `REPLY ONLY IN [${responseLang.toUpperCase()}]. ${noKoreanStr}\nALL BREED AND DISEASE NAMES MUST BE TRANSLATED.
IDENTITY: You are "AI Vet", a highly advanced Veterinary Genetics Expert AI. Always act and speak as AI Vet. Perform a rigorous, evidence-based visual phenotype analysis of this dog image to identify its breed composition, health risks, and care requirements.

ANALYSIS GUIDELINES:
1. **Rigorous Breed Identification**: Analyze phenotype strictly based on AKC and FCI breed standards. Evaluate minutely: 
   - Skull shape and "stop" (muzzle to forehead transition)
   - Ear shape, set, and carriage (e.g., pricked, drop, rose)
   - Coat texture, length, coloration, and patterns (e.g., merle, roan, ticking)
   - Body proportions, chest depth, back length, and tail set.
2. **Score vs. Purity Distinction (CRITICAL)**: 
   - \`breedMatch\` (Confidence): Your AI confidence score (0-100) that you have correctly identified the visual breed.
   - \`primaryPercentage\` (Bloodline/Purity): Your estimate (0-100) of how purebred the dog is based on visual phenotypic purity vs mixing. Purebreds must be 90-100. Mixed breeds must be clearly split.
3. **Evidence-Based Health Risks**: Reference OFA, CHIC, and UCDavis VGL. State actual known prevalence rates and identify critical risk factors for the primary breed.
4. **Nutrition & Behavior**: Strictly follow WSAVA Global Nutrition Guidelines 2021 and AVSAB behavior protocols (positive reinforcement only).

${petContext}

Return a valid JSON object with this exact structure. All string values MUST be in ${responseLang} (Except 'color' fields or when noted). Do NOT include Japanese/Korean/Chinese unless requested:
{
  "primaryBreed": "Name of primary breed in ${responseLang}",
  "primaryPercentage": number (estimated genetic purity percentage, not confidence),
  "secondaryBreed": "Name of secondary mixed breed in ${responseLang} (If purebred, use 'N/A')",
  "secondaryPercentage": number (0 if purebred),
  "breedMatch": number (0-100, AI visual recognition confidence score),
  "breedSource": "e.g., AKC Breed Standard / FCI Group N",
  "identificationBasis": [
    "Specific physical traits matching the standard in ${responseLang}"
  ],
  "lineage": [
    {"label": "Lineage group in ${responseLang} (e.g., Retriever group)", "value": number, "color": "bg-[#00FF41] or other tailwind color"}
  ],
  "riskFactors": [
    {
      "name": "Disease name in ${responseLang}",
      "riskLevel": "high" | "medium" | "low",
      "prevalence": "Prevalence rate and stats in ${responseLang}",
      "source": "Source in English",
      "description": "Clinical description in ${responseLang}",
      "recommendation": "Prevention and management recommendations in ${responseLang}",
      "careGuides": [
        {
          "title": "Guide title in ${responseLang}",
          "desc": "Specific care instructions in ${responseLang}",
          "iconType": "calendar" | "weight" | "activity" | "medical" | "heart" | "eye"
        }
      ]
    }
  ],
  "detailedMarkers": [
    {
      "label": "Genetic marker name in English or ${responseLang}",
      "value": number (0-100),
      "status": "normal" | "carrier" | "caution",
      "testSource": "Reference DB in English"
    }
  ],
  "dietPlan": {
    "title": "Diet plan title in ${responseLang}",
    "source": "WSAVA / NRC / AAFCO",
    IMPORTANT: Generate breed-specific diet recommendations. Consider the breed's common health issues (e.g., joint problems → omega-3 rich foods, sensitive stomach → easily digestible proteins, obesity-prone → calorie control).
    "recommendations": [
      Generate 5-6 breed-specific nutrition recommendations in ${responseLang}.
      Include: ideal protein sources, fat ratio, fiber needs, breed-specific supplements (glucosamine for large breeds, etc.), meal frequency, and portion guidance.
    ],
    "prohibitedFoods": [
      Generate 6-8 dangerous foods in ${responseLang}.
      Include common ones (chocolate, grapes, onion, macadamia, xylitol) PLUS breed-specific warnings if applicable.
    ],
    "supplements": [
      Generate 2-3 breed-specific supplement recommendations.
      Each: {"name": "Supplement name in ${responseLang}", "benefit": "Why this breed needs it in ${responseLang}"}
    ],
    "feedingTips": [
      Generate 3-4 breed-specific feeding tips in ${responseLang}.
      E.g., elevated bowl for large breeds, slow-feeder for fast eaters, meal splitting for bloat-prone breeds.
    ],
    "dailyCalories": "Recommended daily calories range based on breed size in ${responseLang}"
  },
  "exercisePlan": {
    "title": "Exercise plan title in ${responseLang}",
    "source": "Guidelines source in English",
    "dailyGoal": "Daily goal duration in ${responseLang}",
    "activities": [
      IMPORTANT: Generate 5-7 diverse activities with varied intensities (mix of low, medium, high).
      Include breed-appropriate exercises such as: walks, fetch, tug-of-war, swimming, agility training, nose work, obedience drills, free play, hill walking, interval jogging, mental enrichment games, etc.
      Each: {"name": "Activity name in ${responseLang}", "duration": "Duration in ${responseLang}", "intensity": "low" | "medium" | "high"}
    ],
    "precautions": ["Precautions during exercise in ${responseLang} - generate at least 4 items"]
  },
  "expertInsights": {
    "expertAdvice": "General evaluation in ${responseLang}",
    "wsava": "WSAVA insights in ${responseLang}",
    "steveMann": "Behavior/training advice in ${responseLang}",
    "sources": ["Sources in English"]
  },
  "careGuides": [
    {
      "title": "Guide title in ${responseLang}",
      "desc": "Care instructions in ${responseLang}",
      "iconType": "calendar" | "weight" | "activity" | "medical" | "heart" | "eye",
      "source": "Source in English"
    }
  ],
  "dailyCareChecklist": [
    IMPORTANT: Generate exactly 4 breed-specific daily care items tailored to the identified breed's needs and health risks.
    Do NOT include generic items like walking, feeding, or water (those are already provided).
    Focus on breed-specific grooming, health monitoring, and preventive care.
    Examples: ear cleaning, dental care, eye/tear stain wiping, joint stretching, skin fold cleaning, coat brushing, nail check, weight monitoring, breathing check, etc.
    Each: {"id": "unique_snake_case_id", "label": "Short care task name in ${responseLang}", "iconType": "heart" | "eye" | "activity" | "sparkles" | "shield" | "thermometer"}
  ],
  "breedEncyclopedia": {
    IMPORTANT: Generate comprehensive breed encyclopedia data for the identified breed.
    "origin": "Country/region of origin in ${responseLang}",
    "group": "Breed group classification in ${responseLang} (e.g., Sporting, Herding, Toy, Working, etc.)",
    "lifespan": "Average lifespan range in ${responseLang} (e.g., '12-15년')",
    "sizeCategory": "Size category in ${responseLang} (소형 / 중형 / 대형 / 초대형)",
    "temperament": ["3-5 key temperament traits in ${responseLang}"],
    "funFacts": ["3-4 interesting/fun facts about this breed in ${responseLang}"],
    "idealFor": "Ideal owner/family type in ${responseLang}",
    "groomingLevel": "Grooming needs level in ${responseLang} (낮음 / 보통 / 높음 / 매우 높음)",
    "exerciseNeeds": "Exercise needs level in ${responseLang} (낮음 / 보통 / 높음 / 매우 높음)",
    "trainability": "Training ease in ${responseLang} (쉬움 / 보통 / 어려움 - with brief reason)"
  },
  "disclaimer": "This analysis is generated by AI..."
}

CRITICAL RULES:
${antigravityEngine.getGlobalPrompt(language.split('-')[0])}
- Use REAL prevalence data from OFA/CHIC when available for the identified breed
- Be honest about confidence levels - if breed identification is uncertain, reflect lower breedMatch scores
- All medical recommendations should align with AAHA preventive care guidelines
- Include only conditions genuinely associated with the identified breed(s)
- All text values MUST be in ${responseLang}, but keep source/reference names in English for credibility (unless they have well known translated names)
- If weight/height data is provided, factor it into calorie calculations and health assessments`;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  const analysisPromise = fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(async res => {
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('API 요금제 한도가 초과되었습니다. 잠시 후 다시 시도해주세요.');
      }
      throw new Error(`API HTTP Error: ${res.status}`);
    }
    return res.json();
  });

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Analysis timed out")), 60000)
  );

  const response = await Promise.race([analysisPromise, timeoutPromise]) as any;
  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  
  let result: any = null;
  try {
    result = JSON.parse(cleanedText);
  } catch (parseError) {
    console.error("JSON Parse failed:", parseError, "Text:", cleanedText);
    throw new Error("Invalid AI response format");
  }

  return result;
};

export const getFallbackResult = () => ({
  primaryBreed: '골든 리트리버',
  primaryPercentage: 70,
  secondaryBreed: '진돗개',
  secondaryPercentage: 30,
  breedMatch: 85,
  breedSource: "AKC Breed Standard / FCI Group 8 No.111",
  identificationBasis: [
    'hardcoded.fallback_id_basis1',
    'hardcoded.fallback_id_basis2',
    'hardcoded.fallback_id_basis3'
  ],
  lineage: [
    { label: '리트리버 계열', value: 72, color: 'bg-[#00FF41]' },
    { label: '스피츠 계열', value: 25, color: 'bg-zinc-500' },
    { label: '기타 미분류', value: 3, color: 'bg-zinc-700' },
  ],
  riskFactors: [
    {
      name: '고관절 이형성증',
      riskLevel: "high",
      prevalence: 'hardcoded.fallback_hip_prevalence',
      source: "OFA Statistics 2024",
      description: 'hardcoded.default_risk_desc',
      recommendation: 'hardcoded.fallback_hip_recommendation',
      careGuides: [
        { title: 'hardcoded.fallback_care_hip_check', desc: 'hardcoded.fallback_care_hip_check_desc', iconType: "medical" },
        { title: 'hardcoded.fallback_care_weight', desc: 'hardcoded.fallback_care_weight_desc', iconType: "weight" },
        { title: 'hardcoded.fallback_care_low_impact', desc: 'hardcoded.fallback_care_low_impact_desc', iconType: "activity" }
      ]
    }
  ],
  detailedMarkers: [
    { label: 'report.marker_mdr1', value: 98, status: 'normal', testSource: 'UCDavis VGL Panel' },
    { label: 'report.marker_dm', value: 85, status: 'normal', testSource: 'UCDavis VGL Panel' },
    { label: 'report.marker_pra', value: 12, status: 'caution', testSource: 'OFA/CHIC Recommended Test' },
  ],
  dietPlan: null, // components will handle fallback
  exercisePlan: null, // components will handle fallback
  expertInsights: {
    expertAdvice: 'hardcoded.fallback_expert_advice',
    wsava: 'hardcoded.wsava_default',
    steveMann: 'hardcoded.steve_mann_default',
    sources: ["WSAVA 2021", "OFA 2024"]
  },
  careGuides: null, // components handle fallback
  disclaimer: 'hardcoded.default_disclaimer'
});
