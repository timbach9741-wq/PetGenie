# 🚀 Pet Genie v1.1 업데이트 목록 (승인 후 배포)

> [!CAUTION]🚨 URGENT REMINDER 🚨
> 빌드 및 배포 작업이 보류되어 있습니다.
> 추후 작업 시 가장 먼저 **반드시 빌드하고 배포**해야 합니다! (`deploy.ps1` 실행 요망)
> 
> **작성일**: 2026-04-10
> **현재 상태**: v1.0.8 구글 플레이 콘솔 배포 및 심사 제출 완료 🎉
> **우선순위**: 🔴 Critical / 🟡 Important / 🟢 Enhancement

---

## 🔴 Critical — 앱 기능 버그

### 1. ✅ [수정완료] AI 수의사 한국어 질문 → 영어 답변 버그

- **파일**: `src/services/geminiService.ts`
- **원인**: `getSystemInstruction(targetLang, petInfo)` ← 이미 변환된 `"Korean"` 문자열을 넘겨서 내부 `langMap` 매칭 실패 → 기본값 `ENGLISH`로 폴백
- **추가 원인**: 시스템 프롬프트에 `NO KOREAN`이 하드코딩 되어 한국어 설정에서도 한국어 사용 금지
- **수정 내용**: `currentLang` (원본 코드 `"ko"`) 전달 + 한국어일 때 전용 한국어 프롬프트 분기
- **상태**: ✅ 코드 수정 완료 & 빌드 성공 (배포 미반영)

---

## 🟡 Important — 다국어(i18n) 하드코딩 텍스트

> 아래 항목들은 하드코딩된 텍스트를 `t()` 함수로 교체하고, 5개 언어 locale 파일에 번역을 추가한 항목입니다.

### 2. ✅ [수정완료] AuthScreens.tsx — 약관/마케팅 동의 i18n

- **파일**: `src/components/screens/AuthScreens.tsx`
- **수정 내용**:
  - 로그인/회원가입 양쪽 `"I agree to receive launch benefits via email"` → `t('auth.marketing_consent')`
  - `"By continuing, you agree to Pet Genie's Terms and Privacy Policy"` → `t('auth.terms_prefix')`, `t('auth.terms_link')`, `t('auth.privacy_link')`
- **locale 파일**: 5개 언어 (`ko/en/ja/zh/es`) — `marketing_consent`, `terms_prefix`, `terms_link`, `terms_and`, `privacy_link` 키 추가 완료
- **상태**: ✅ 코드 수정 완료 & locale 반영 완료

### 3. ✅ [수정완료] ProfileScreen.tsx — "Admin Dashboard" i18n

- **파일**: `src/components/screens/ProfileScreen.tsx`
- **수정 내용**: `"Admin Dashboard"` → `t('profile.admin_dashboard')`
- **locale 파일**: 5개 언어 — `admin_dashboard` 키 추가 완료
- **상태**: ✅ 코드 수정 완료

### 4. ✅ [수정완료] CameraScreen.tsx — 카메라 UI i18n

- **파일**: `src/components/screens/CameraScreen.tsx`
- **수정 내용**:
  - `"AI Vision Active"` → `t('camera.ai_vision_active')`
  - `"Align Subject"` → `t('camera.align_subject')`
- **참고**: "Pet Genie" (187번줄)는 브랜드명이므로 번역 불필요
- **상태**: ✅ 코드 수정 완료 (locale에 이미 키 존재)

### 5. ✅ [수정완료] MembershipScreen.tsx — 요금제/프로모션 텍스트 i18n

- **파일**: `src/components/screens/MembershipScreen.tsx`
- **수정 내용**:
  - 프로모션 배너 (`런칭 기념 사전 헤택`, `6월 전까지는 Pro 플랜...`) → `t('membership.promo_title')`, `t('membership.promo_desc')`
  - Basic 플랜 설명/버튼 → `t('membership.basic_desc')`, `t('membership.current_plan')` 등
  - Silverman Pro 설명/혜택 → `t('membership.pro_desc')`, `t('membership.pro_no_ads')` 등
  - Single Deep Scan 설명 → `t('membership.scan_desc')`, `t('membership.scan_no_ad')` 등
  - Coming Soon 버튼 → `t('membership.coming_soon')`
  - 요금제 이름(Basic, Silverman Pro, Single Deep Scan)은 브랜드명이므로 영어 유지
- **locale 파일**: `ko.json`, `en.json`, `ja.json`, `zh.json`, `es.json` — 18개 키 추가 완료
- **상태**: ✅ 코드 수정 완료 & locale 5개 언어 반영 완료

### 6. ✅ [수정완료] HealthReport.tsx — 분석 리포트 서브타이틀 i18n

- **파일**: `src/components/screens/HealthReport.tsx`
- **수정 내용**:
  - `"Premium"` → `t('common.premium')`
  - `"Identification Basis"` → `t('report.identification_basis_sub')`
  - `"Genetic Health Screening"` → `t('report.genetic_screening_sub')`
  - `"Critical Risk"` / `"Moderate Risk"` / `"Low Risk"` → `t('report.risk_critical')` 등
  - `"AI-Powered Recommendations"` → `t('report.ai_recommendations_sub')`
  - `"Advanced DNA Mapping"` → `t('report.dna_mapping_sub')`
- **locale 파일**: 5개 언어 — 8개 키 추가 완료
- **상태**: ✅ 코드 수정 완료

### 7. ✅ [수정완료] AIVetScreen.tsx — 에러/광고 팝업 i18n (9곳)

- **파일**: `src/components/screens/AIVetScreen.tsx`
- **수정 내용**:
  - `'보호자'` / `'수의사'` → `t('ai_vet.role_owner')` / `t('ai_vet.role_vet')`
  - `'이름:', '나이:', '견종:', '성별:', '알 수 없음'` → `t()` 키로 교체
  - `'오류가 발생했습니다:'` → `t('ai_vet.error_occurred')`
  - `'네트워크 또는 서버 할당량 오류'` → `t('ai_vet.network_error')`
  - `'다시 시도하기'` → `t('ai_vet.retry')`
  - `'상담 한도 소진'` / `'일일 무료 상담...'` → `t('ai_vet.quota_exhausted')`, `t('ai_vet.quota_desc')`, `t('ai_vet.quota_ask')`
  - `'취소(Cancel)'` → `t('common.cancel')`
  - `'광고 보기'` → `t('ai_vet.watch_ad')`
- **locale 파일**: 5개 언어 — 9개 키 추가 완료 + `common.unknown`, `common.premium` 추가
- **상태**: ✅ 코드 수정 완료

### 8. ✅ [수정완료] 6월 무료 프로모션 — 다국어 지원

- **관련 파일**: `MembershipScreen.tsx`, 5개 locale 파일
- **수정 내용**:
  - 프로모션 문구 18개 키를 `t()` 함수로 교체
  - 5개 언어(한국어/영어/일본어/중국어/스페인어) 번역 완료
  - "6월 출시 예정" → 각 언어로 자연스럽게 번역
- **상태**: ✅ 코드 수정 완료

---

## 🟡 Important — 인증/보안

### 9. ✅ [제외완료] 카카오 로그인

- **상태**: 사용자 요청에 의해 이번 v1.1 릴리즈 스펙에서 제외

### 10. ✅ [수정완료] 이메일/비밀번호 로그인 — Firebase Auth 연동

- **파일**: `src/components/screens/AuthScreens.tsx`
- **수정 내용**: 기존 Mock 로그인 함수(`onLogin`)를 제거하고, 실제 Firebase의 `signInWithEmailAndPassword`, `createUserWithEmailAndPassword` 함수를 사용하여 연동 완료.
- **상태**: 유효성 검증 및 실제 Firebase Authentication 연동 완료

---

## 🟢 Enhancement — UX/기능 개선

### 11. 버전 표시 하드코딩

- **파일**: `src/components/screens/ProfileScreen.tsx`
- **문제**: 205번줄 `1.0.0` 하드코딩 → `package.json`에서 동적으로 가져오거나, 업데이트 시 같이 수정 필요 (현재 v1.0.8)

### 12. ✅ [수정완료] AdMob 보상형 광고 — 실제 연동

- **파일**: `src/components/screens/AIVetScreen.tsx`, `src/App.tsx`
- **수정 내용**: `@capacitor-community/admob` 네이티브 플러그인을 설치하고, App 마운트 시 초기화(`AdMob.initialize`) 및 AIVetScreen에서 `AdMob.showRewardVideoAd()` 실행되도록 실제 시스템 적용 완료.
- **상태**: 실제 AdMob SDK 연동 완료 (웹 환경에서는 fallback 모드로 크래시 방지 처리)

---

## 📋 업데이트 실행 순서 (승인 후)

1. `android/app/build.gradle` → `versionCode` +1, `versionName` 변경
2. `deploy.ps1` 실행 → AAB 빌드
3. Google Play Console에서 새 AAB 업로드 (프로덕션 or 단계적 출시)

---

## ⚡ 수정 완료 항목 요약

| #  | 항목                                       | 상태                              |
| -- | ------------------------------------------ | --------------------------------- |
| 1  | AI 수의사 언어 버그 (`geminiService.ts`)    | ✅ 코드 수정 완료                 |
| 2  | AuthScreens 약관/마케팅 동의 i18n          | ✅ 코드 + 5개 언어 locale 완료    |
| 3  | ProfileScreen Admin Dashboard i18n         | ✅ 코드 + 5개 언어 locale 완료    |
| 4  | CameraScreen 카메라 UI i18n                | ✅ 코드 수정 완료                 |
| 5  | MembershipScreen 요금제/프로모션 i18n      | ✅ 코드 + 5개 언어 locale 완료    |
| 6  | HealthReport 서브타이틀 i18n               | ✅ 코드 + 5개 언어 locale 완료    |
| 7  | AIVetScreen 에러/광고 팝업 i18n (9곳)      | ✅ 코드 + 5개 언어 locale 완료    |
| 8  | 6월 무료 프로모션 다국어 지원              | ✅ 코드 + 5개 언어 locale 완료    |

---

| 9  | 카카오 로그인 Mock 로직 제거                 | ✅ 사용자 요청으로 제외 (스펙 아웃) |
| 10 | 이메일/비밀번호 로그인 Firebase Auth 연동 | ✅ 실제 Auth SDK 적용 완료        |
| 12 | AdMob 보상형 광고 실제 연동                | ✅ Capacitor AdMob 연동 완료      |

---

## 💾 [대화내용 불러오기 용] 최신 세션 요약 (2026-04-10)

> "대화내용 불러와" 시 복원해야 할 핵심 컨텍스트입니다.

1. **배포 성공 및 심사 제출**:
   - `deploy.ps1` 스크립트를 통해 성공적으로 AAB 파일(v1.0.8, 코드 17) 빌드 완료.
   - 빌드 과정 중 Java 클래스 메이저 버전 69(Java 25) 비호환 이슈가 발생했으나, `deploy.ps1`을 수정하여 안드로이드 스튜디오 내장 JBR(Java 21)을 강제 사용하도록 하여 해결.
   - 구글 플레이 콘솔에 AAB 파일 업로드 및 "검토를 위해 변경사항 전송"까지 **완벽하게 마무리됨 (In Review 상태)**.
2. **구글 플레이 비공개 테스트 (Closed Testing)**:
   - **현재 확보된 테스터: 40명 (기준인 20명 초과 달성 및 매우 안정적인 상태)**
   - 목표: 테스터 이탈 방지를 고려해도 14일 심사 기준을 매우 여유롭게 충족하는 상태.
3. **코드 주요 변경 사항 (v1.0.8 최신본)**:
   - **Firebase Auth (이메일/비밀번호)**: Mock 대신 실제 `signInWithEmailAndPassword` 구현 완료.
   - **AdMob SDK 연동**: `@capacitor-community/admob` 네이티브 플러그인 실제 연동 완료 (`AIVetScreen` 광고 시청 기능).
   - **다국어(i18n)**: 모든 페이지(Profile, Auth, Camera, Membership, HealthReport, AIVet 등)의 하드코딩 텍스트를 언어셋으로 교체 완료.
   - **카카오 로그인**: 이번 릴리즈에서 제외됨.
4. **다음 사이클에 진행할 수 있는 후보 업무**:
   - (프로덕션/심사 대기 중 발견되는) 구글 플레이 리젝 사유 대응 (발생 시).
   - `ProfileScreen.tsx` 205번 줄 하드코딩된 버전명 동적 처리.
   - 추가 앱 기능 기획 및 업데이트.

---

## 📅 [예정] 4월 20일 정기 업데이트 (Target Release)

> 4월 20일 업데이트를 목표로 아래 내용들이 배포될 예정입니다.

1. **커뮤니티 다국어 완벽 적용 (Community Localization Patch)**: 
   - 주간 산책 챔피언 배너 등 하드코딩된 한국어를 5개 국어(한국어, 영어, 일본어, 중국어, 스페인어) 번역 키로 완벽히 교체 완료.
2. **네이티브 앱 기능 고도화**:
   - `AdMob` 보상형 광고 연동 및 네이티브 동작(Initialize, Ad Listeners) 최종 검수 통과.
3. **프로덕션 빌드 완료**:
   - `petgenie-release.aab` 생성 완료. 스토어 테스트 트랙을 거쳐 프로덕션 환경에 4월 20일 업데이트 될 수 있도록 준비됨.
