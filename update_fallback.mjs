import fs from 'fs';

const file = 'c:/Users/Tim/Desktop/강아지 앱/강아지-스켄 (1)/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `      const fallbackResult = {
        primaryBreed: t('dashboard.default_breed') || "골든 리트리버",
        primaryPercentage: 70,
        secondaryBreed: t('hardcoded.secondary_breed_default') || "진돗개",
        secondaryPercentage: 30,
        breedMatch: 85,
        breedSource: "AKC Breed Standard / FCI Group 8 No.111",
        identificationBasis: [
          t('hardcoded.fallback_id_basis1'),
          t('hardcoded.fallback_id_basis2'),
          t('hardcoded.fallback_id_basis3')
        ],
        lineage: [
          { label: t('report.lineage_retriever') || '리트리버 계열 (Retriever Lineage)', value: 72, color: 'bg-[#00FF41]' },
          { label: t('report.lineage_spitz') || '스피츠 계열 (Spitz Lineage)', value: 25, color: 'bg-zinc-500' },
          { label: t('report.lineage_others') || '기타 미분류 (Others)', value: 3, color: 'bg-zinc-700' },
        ],
        riskFactors: [
          {
            "name": t('report.risk_hip_dysplasia') || "고관절 이형성증",
            "riskLevel": "high",
            "prevalence": t('hardcoded.fallback_hip_prevalence'),
            "source": "OFA Statistics 2024",
            "description": t('report.risk_hip_desc'),
            "recommendation": t('hardcoded.fallback_hip_recommendation'),
            "careGuides": [
              { "title": t('hardcoded.fallback_care_hip_check'), "desc": t('hardcoded.fallback_care_hip_check_desc'), "iconType": "medical" },
              { "title": t('hardcoded.fallback_care_weight'), "desc": t('hardcoded.fallback_care_weight_desc'), "iconType": "weight" },
              { "title": t('hardcoded.fallback_care_low_impact'), "desc": t('hardcoded.fallback_care_low_impact_desc'), "iconType": "activity" }
            ]
          },
          {
            "name": t('hardcoded.fallback_cataract'),
            "riskLevel": "medium",
            "prevalence": t('hardcoded.fallback_cataract_prevalence'),
            "source": "OFA Eye Certification Registry (CERF)",
            "description": t('hardcoded.fallback_cataract_desc'),
            "recommendation": t('hardcoded.fallback_cataract_recommendation'),
            "careGuides": [
              { "title": t('hardcoded.fallback_care_eye_check'), "desc": t('hardcoded.fallback_care_eye_check_desc'), "iconType": "eye" },
              { "title": t('hardcoded.fallback_care_antioxidant'), "desc": t('hardcoded.fallback_care_antioxidant_desc'), "iconType": "eye" }
            ]
          }
        ],
        detailedMarkers: [
          { label: t('report.marker_mdr1') || 'MDR1 유전자 변이', value: 98, status: 'normal', testSource: 'UCDavis VGL Panel' },
          { label: t('report.marker_dm') || '퇴행성 골수염 (DM)', value: 85, status: 'normal', testSource: 'UCDavis VGL Panel' },
          { label: t('report.marker_pra') || '진행성 망막 위축증 (PRA)', value: 12, status: 'caution', testSource: 'OFA/CHIC Recommended Test' },
          { label: t('hardcoded.fallback_marker_vwd') || '폰 빌레브란트 병', value: 95, status: 'normal', testSource: 'UCDavis VGL Panel' }
        ],
        dietPlan: {
          title: t('hardcoded.fallback_diet_title'),
          source: t('hardcoded.diet_source_default') || "WSAVA Global Nutrition Guidelines 2021 / NRC 2006",
          recommendations: [
            t('hardcoded.fallback_diet_rec1'),
            t('hardcoded.fallback_diet_rec2'),
            t('hardcoded.fallback_diet_rec3')
          ],
          prohibitedFoods: [
            t('hardcoded.fallback_prohibit1'),
            t('hardcoded.fallback_prohibit2'),
            t('hardcoded.fallback_prohibit3'),
            t('hardcoded.fallback_prohibit4')
          ],
          dailyCalories: t('hardcoded.fallback_daily_calories')
        },
        exercisePlan: {
          title: t('hardcoded.fallback_exercise_title'),
          source: t('hardcoded.exercise_source_default') || "AKC Exercise Guidelines",
          dailyGoal: t('hardcoded.fallback_exercise_goal'),
          activities: [
            { name: t('hardcoded.fallback_activity1'), duration: t('hardcoded.fallback_duration1'), intensity: "low" },
            { name: t('hardcoded.fallback_activity2'), duration: t('hardcoded.fallback_duration2'), intensity: "medium" },
            { name: t('hardcoded.fallback_activity3'), duration: t('hardcoded.fallback_duration3'), intensity: "high" }
          ],
          precautions: [
            t('hardcoded.fallback_precaution1'),
            t('hardcoded.fallback_precaution2'),
            t('hardcoded.fallback_precaution3')
          ]
        },
        expertInsights: {
          expertAdvice: t('hardcoded.fallback_expert_advice'),
          wsava: t('hardcoded.wsava_default'),
          steveMann: t('hardcoded.steve_mann_default'),
          sources: [
            t('hardcoded.source_wsava_nutrition') || "WSAVA Global Nutrition Guidelines 2021", 
            t('hardcoded.source_avsab_training') || "AVSAB Position Statement on Humane Training 2021", 
            t('hardcoded.source_ofa_stats') || "OFA Breed Statistics 2024"
          ]
        },
        careGuides: [
          { title: t('hardcoded.fallback_care_hip_check'), desc: t('hardcoded.fallback_careguide_hip_desc'), iconType: "medical", source: "OFA/AAHA Guidelines" },
          { title: t('hardcoded.fallback_care_weight'), desc: t('hardcoded.fallback_careguide_weight_desc'), iconType: "weight", source: "Purina Lifespan Study / WSAVA" },
          { title: t('hardcoded.fallback_care_eye_check'), desc: t('hardcoded.fallback_careguide_eye_desc'), iconType: "eye", source: "ACVO / OFA Eye Registry" },
          { title: t('hardcoded.fallback_care_joint_supplement'), desc: t('hardcoded.fallback_careguide_joint_desc'), iconType: "medical", source: "NRC 2006 / Veterinary Evidence" }
        ],
        disclaimer: t('hardcoded.default_disclaimer')
      };`;

// Use regex to locate the entire fallbackResult object block
const regex = /const fallbackResult = \{[\s\S]*?\};\s*setAnalysisResult/m;
if (!content.match(regex)) {
  console.log("Could not find the fallbackResult block.");
  process.exit(1);
}

content = content.replace(regex, replacement + "\n      \n      setAnalysisResult");
fs.writeFileSync(file, content, 'utf8');
console.log("Successfully replaced fallbackResult block.");
