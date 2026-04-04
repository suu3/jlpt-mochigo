# TECH SPEC

## 1. 목표

- 빠른 MVP 개발
- 최소 비용 운영
- 서버 의존도 최소화
- 로컬 중심 아키텍처
- 유지보수 쉬운 구조

---

## 2. Tech Stack

### Framework

- React Native (Expo 또는 CLI)

선정 이유:

- iOS / Android 동시 개발
- 빠른 MVP 구현
- 커뮤니티 및 라이브러리 풍부

---

### Language

- TypeScript

선정 이유:

- 타입 안정성
- 데이터 구조 관리 용이
- 유지보수 비용 감소

---

### State Management

- Zustand (or Jotai)

선정 이유:

- 가볍고 단순
- 보일러플레이트 적음
- 로컬 상태 관리에 적합

---

### Storage

#### 1. Key-Value Storage

- MMKV (or AsyncStorage)

용도:

- 설정값 저장
- 최근 선택 레벨
- TTS 설정
- 간단한 상태

선정 이유:

- 빠름
- 간단함
- 오프라인 중심 구조에 적합

---

#### 2. Structured Storage

- SQLite (expo-sqlite or react-native-sqlite-storage)

용도:

- 오답 노트
- 학습 이력
- 복습 큐

선정 이유:

- 구조화된 데이터 저장 가능
- 확장성 확보

---

### TTS (Text-to-Speech)

- OS Native TTS (iOS / Android built-in)
- react-native-tts 라이브러리 사용

용도:

- 단어 발음 재생

선정 이유:

- 무료 (API 비용 없음)
- 네트워크 필요 없음
- 빠른 응답
- MVP에 충분한 품질

정책:

- 자동 재생 없음
- 사용자 클릭 시만 실행
- 실패해도 앱 흐름에 영향 없음

---

### Data Handling

- 정적 JSON 또는 로컬 DB
- 앱 번들에 포함

데이터 소스:

- JMDict
- KANJIDIC2
- JLPT 매핑 데이터

선정 이유:

- 오프라인 사용 가능
- 서버 비용 없음
- 저작권 안정성 확보

---

### Ads

- Google AdMob (or LevelPlay)

용도:

- 전면 광고
- 보상형 광고

선정 이유:

- 모바일 광고 표준
- 간단한 통합

---

## 3. Architecture

### 기본 원칙

- Client-only architecture (서버 없음)
- Local-first data model
- Offline-first UX

---

### 데이터 흐름

```text
Bundled Data (JSON)
        ↓
Quiz Generator
        ↓
User Interaction
        ↓
Local Storage (MMKV / SQLite)
```
