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

  const langMap: Record<string, string> = {
    ko: "Korean",
    en: "English",
    ja: "Japanese",
    "zh-TW": "Traditional Chinese",
    es: "Spanish"
  };
  const responseLang = langMap[language] || "English";

  const noKoreanStr = language === 'ko' ? '' : 'NEVER USE KOREAN. ';
  
  const prompt = `REPLY ONLY IN [${responseLang.toUpperCase()}]. NO KOREAN.\nALL BREED AND DISEASE NAMES MUST BE TRANSLATED.
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
    "source": "WSAVA / NRC",
    "recommendations": ["Nutrition advice in ${responseLang}"],
    "prohibitedFoods": ["Dangerous foods in ${responseLang}"],
    "dailyCalories": "Recommended daily calories range in ${responseLang}"
  },
  "exercisePlan": {
    "title": "Exercise plan title in ${responseLang}",
    "source": "Guidelines source in English",
    "dailyGoal": "Daily goal duration in ${responseLang}",
    "activities": [{"name": "Activity name in ${responseLang}", "duration": "Duration in ${responseLang}", "intensity": "low" | "medium" | "high"}],
    "precautions": ["Precautions during exercise in ${responseLang}"]
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
  }).then(res => {
    if (!res.ok) throw new Error(`API HTTP Error: ${res.status}`);
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
    { label: 'report.marker_mdr1', value: 98, status: 'report.status_normal', testSource: 'UCDavis VGL Panel' },
    { label: 'report.marker_dm', value: 85, status: 'report.status_normal', testSource: 'UCDavis VGL Panel' },
    { label: 'report.marker_pra', value: 12, status: 'report.status_caution', testSource: 'OFA/CHIC Recommended Test' },
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
