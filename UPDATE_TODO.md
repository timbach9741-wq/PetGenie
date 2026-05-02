# 🚀 Pet Genie 업데이트 관리 (2026-05-02 현재)

> **현재 버전**: v1.1.8 (versionCode 28)
> **출시 상태**: ⏳ 구글 Play 스토어 프로덕션 심사 재개 대기 중 (v1.1.8 제출 예정)
> **추가 사항**: ✅ 관리자 대시보드 고도화 및 '6월 무료 프로모션 홈 화면 팝업' 연동 완료

---

## 📋 다음 업데이트 후보 아이디어 및 남은 과제 (v1.1.6 이후 예정)

### 🚀 사용자 경험(UX) 및 기능 확장

1. **커뮤니티 활성화 기능 추가:**
   - [x] 게시물 댓글/대댓글 기능 강화
   - [x] 실시간 알림 기능 (내 글에 좋아요/댓글 달렸을 때 푸시 알림)
2. **AI 수의사 분석 고도화:**
   - [x] AI 스캔 결과 리포트 저장 및 PDF 다운로드 기능
   - [x] 사용자의 이전 질문 이력을 기억하여 맥락 있는 AI 상담 제공
3. **산책 / 건강 관리:**
   - [x] 모바일 기기의 GPS/만보기 센서 연동을 통한 자동 산책 측정 기능 강화
   - [x] 주간/월간 펫 건강 요약 리포트 (차트/그래프 시각화)

### 🛠 운영 및 법무 관리

- [x] 이용약관과 개인정보처리방침 앱 내 정적 페이지 2개로 분리 (심사 대비)
- [x] 스토어 정보 최신화 (1.1.6 업데이트 사항에 맞는 스크린샷, 앱 설명 추가)
- [x] 파이어베이스 성능 모니터링(Performance Monitoring) 및 크래시틱스(Crashlytics) 연동
- [x] 실명 인증 연동 (구글 로그인으로 본인인증 대체 및 갈음 완료)

---

## 📋 배포 및 출시 체크리스트

### 🚀 Google Play Console 진행 현황 (v1.1.8 기준)

> 🛑 **상태: 스토어 제출 보류 (추후 진행 예정)**
> 접근성 개선 및 버전 동기화(v1.1.8)를 포함한 AAB 빌드(`PetGenie_v1.1.8_20260502_165421.aab`)까지 완료되었으나, 당장 배포하지 않고 잠시 홀드해 두기로 하였습니다.

- [x] **1. 앱 번들 업로드 준비** — 최신 AAB 파일 바탕화면 생성 완료 (2026-05-02)
- [x] **2. 스토어 정보 최신화** — 릴리스 노트 및 앱 설명서 업데이트 완료
- [ ] **3. 프로덕션 트랙 재제출 (추후 진행)** — 구글 플레이 심사 다시 시작 및 제출
- [ ] **4. 구글 프로덕션 심사 통과** — 승인 및 정식 게시 대기

---

## ✅ v1.1.8 이후 완료 항목 (현재 개발 중)

| #   | 항목                                                     | 상태         |
| --- | -------------------------------------------------------- | ------------ |
| 1   | 관리자 대시보드 지표 고도화 (ARPU, 30일 리텐션, 종 분포)   | ✅ 완료      |
| 2   | 6월 무료 혜택 안내를 위한 홈 화면 팝업 배너 구현           | ✅ 완료      |

---

## ✅ v1.1.6 완료 항목 (이전 심사 제출 빌드에 포함)

| #   | 항목                                                     | 상태         |
| --- | -------------------------------------------------------- | ------------ |
| 1   | 관리자 대시보드 KPI 연동 (총 유저, 매출 등)              | ✅ 완료      |
| 2   | 실시간 가입자 지표 연동 (DAU, 금일/7일 신규)             | ✅ 완료      |
| 3   | versionCode 24 중복 오류 해결 (versionCode 25 상향)      | ✅ 완료      |

---

## ✅ v1.1.5 이하 버전 주요 완료 항목

## ✅ v1.1.1 완료 항목 (이전 빌드에 배포됨)

| #   | 항목                                            | 파일                                 |
| --- | ----------------------------------------------- | ------------------------------------ |
| 1   | AI 수의사 한국어→영어 답변 버그 수정            | `geminiService.ts`                   |
| 2   | AuthScreens 약관/마케팅 동의 i18n               | `AuthScreens.tsx` + 5개 locale       |
| 3   | ProfileScreen Admin Dashboard i18n              | `ProfileScreen.tsx` + 5개 locale     |
| 4   | CameraScreen 카메라 UI i18n                     | `CameraScreen.tsx`                   |
| 5   | MembershipScreen 요금제/프로모션 i18n (18개 키) | `MembershipScreen.tsx` + 5개 locale  |
| 6   | HealthReport 서브타이틀 i18n (8개 키)           | `HealthReport.tsx` + 5개 locale      |
| 7   | AIVetScreen 에러/광고 팝업 i18n (9곳)           | `AIVetScreen.tsx` + 5개 locale       |
| 8   | 6월 무료 프로모션 다국어 지원                   | `MembershipScreen.tsx` + 5개 locale  |
| 9   | 이메일/비밀번호 Firebase Auth 연동              | `AuthScreens.tsx`                    |
| 10  | 버전 표시 동적 동기화                           | `ProfileScreen.tsx` + `package.json` |
| 11  | AdMob 보상형 광고 네이티브 연동                 | `AIVetScreen.tsx` + `App.tsx`        |
| 12  | Toss Payments 결제 시스템 연동                  | Cloud Functions + Secret Manager     |
| 13  | 커뮤니티 다국어 최종 패치                       | 5개 locale                           |
| 14  | Firestore 보안 Rules 적용                       | `firestore.rules`                    |
| 15  | Admin Dashboard 실데이터 연동                   | Firebase `getDocs()`                 |

---

## 🛠️ 배포 방법 (참고용)

### 빌드 명령 (deploy.ps1)

```powershell
# 프로젝트 루트에서 실행
.\deploy.ps1
```

### 수동 빌드 순서

```bash
# 1. 버전 올리기
# build.gradle → versionCode +1, versionName 변경
# package.json → version 동기화

# 2. 웹 빌드
npm run build

# 3. 네이티브 동기화
npx cap sync android

# 4. AAB 빌드
cd android && ./gradlew bundleRelease
```

### 키스토어 정보

- 파일: `android/app/petgenie-release.jks`
- 별칭: `build.gradle`의 signingConfigs 참조

---

## 💾 세션 복원용 컨텍스트

> "대화내용 불러와" 시 참조할 핵심 정보

1. **현재 출시 상태**: ⏳ 구글 Play 스토어 1.1.6 프로덕션 심사 대기 중 (In Review)
2. **차기 대응(우선순위)**: 심사 승인 모니터링, 약관 분리 페이지 준비, 스토어 이미지 최신화
3. **핵심 기능 완료**: 관리자 대시보드 지표 연동(AdminDashboard.tsx) 및 빌드 안정화(versionCode 25)
4. **기술 스택**: React + Capacitor + Firebase + Tailwind + TypeScript
5. **결제/광고**: Toss Payments 연동(Cloud Functions), AdMob 보상형 광고 연동 완료
