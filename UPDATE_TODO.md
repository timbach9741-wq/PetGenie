# 🚀 Pet Genie 업데이트 관리 (2026-04-20 현재)

> **현재 버전**: v1.1.5 (versionCode 23)
> **빌드 상태**: ✅ AAB 빌드 및 플레이 콘솔 Alpha 제출 완료
> **추가 사항**: ✅ 이메일 로그인 제거 및 구글 전용 소셜 로그인 연동, 커뮤니티 산책 기록 및 랭킹 실데이터 연동 완료

---

## 📋 다음 업데이트 후보 아이디어 및 남은 과제 (v1.1.6 이후 예정)

### 🚀 사용자 경험(UX) 및 기능 확장
1. **커뮤니티 활성화 기능 추가:**
   - [ ] 게시물 댓글/대댓글 기능 강화
   - [ ] 실시간 알림 기능 (내 글에 좋아요/댓글 달렸을 때 푸시 알림)
2. **AI 수의사 분석 고도화:**
   - [ ] AI 스캔 결과 리포트 저장 및 PDF 다운로드 기능
   - [ ] 사용자의 이전 질문 이력을 기억하여 맥락 있는 AI 상담 제공
3. **산책 / 건강 관리:**
   - [ ] 모바일 기기의 GPS/만보기 센서 연동을 통한 자동 산책 측정 기능 강화
   - [ ] 주간/월간 펫 건강 요약 리포트 (차트/그래프 시각화)

### 🛠 운영 및 보안 관리
- [ ] 파이어베이스 성능 모니터링(Performance Monitoring) 및 크래시틱스(Crashlytics) 연동
- [ ] 실명 인증 연동 (어뷰징 방지 및 한국 내 성인/본인 인증 필요 시 도입)

---

## 📋 배포 체크리스트 (v1.1.2)

### ✅ Google Play Console 작업 (v1.1.2)

- [x] **1. AAB 업로드** — 비공개 테스트(Alpha) 트랙 업로드 완료
- [x] **2. 스토어 스크린샷 업로드** — 완료 
- [x] **3. 그래픽 이미지 & 앱 아이콘(512x512) 업로드** — 완료
- [x] **4. 출시 노트 작성** — 완료
- [x] **5. 심사 제출** — 검토 중인 변경사항에 등록됨 (구글 심사 대기 중)

---

## ✅ v1.1.2 완료 항목 (이번 빌드에 포함)

| # | 항목 | 상태 |
|---|------|------|
| 1 | Android 앱 아이콘 교체 (Capacitor 기본 → Pet Genie 로고) | ✅ 완료 |
| 2 | 스토어 이미지 제작 (스크린샷 5장 + 배너 1장) | ✅ 제작 완료 |

---

## ✅ v1.1.1 완료 항목 (이전 빌드에 배포됨)

| # | 항목 | 파일 |
|---|------|------|
| 1 | AI 수의사 한국어→영어 답변 버그 수정 | `geminiService.ts` |
| 2 | AuthScreens 약관/마케팅 동의 i18n | `AuthScreens.tsx` + 5개 locale |
| 3 | ProfileScreen Admin Dashboard i18n | `ProfileScreen.tsx` + 5개 locale |
| 4 | CameraScreen 카메라 UI i18n | `CameraScreen.tsx` |
| 5 | MembershipScreen 요금제/프로모션 i18n (18개 키) | `MembershipScreen.tsx` + 5개 locale |
| 6 | HealthReport 서브타이틀 i18n (8개 키) | `HealthReport.tsx` + 5개 locale |
| 7 | AIVetScreen 에러/광고 팝업 i18n (9곳) | `AIVetScreen.tsx` + 5개 locale |
| 8 | 6월 무료 프로모션 다국어 지원 | `MembershipScreen.tsx` + 5개 locale |
| 9 | 이메일/비밀번호 Firebase Auth 연동 | `AuthScreens.tsx` |
| 10 | 버전 표시 동적 동기화 | `ProfileScreen.tsx` + `package.json` |
| 11 | AdMob 보상형 광고 네이티브 연동 | `AIVetScreen.tsx` + `App.tsx` |
| 12 | Toss Payments 결제 시스템 연동 | Cloud Functions + Secret Manager |
| 13 | 커뮤니티 다국어 최종 패치 | 5개 locale |
| 14 | Firestore 보안 Rules 적용 | `firestore.rules` |
| 15 | Admin Dashboard 실데이터 연동 | Firebase `getDocs()` |

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

1. **현재 배포 대기**: v1.1.2 AAB가 바탕화면에 준비됨 (앱 아이콘 교체 포함)
2. **스토어 이미지**: `store_images/` 폴더에 스크린샷 5장 + 배너 1장 준비
3. **테스터 40명 확보**: 비공개 테스트 14일 심사 기준 충족
4. **기술 스택**: React + Capacitor + Firebase + Tailwind + TypeScript
5. **결제**: Toss Payments 라이브 키 연동 완료 (Secret Manager)
6. **광고**: AdMob 네이티브 보상형 광고 연동 완료
