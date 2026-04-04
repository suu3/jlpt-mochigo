# AdMob Banner Setup

현재 앱에는 `홈/퀴즈/결과` 같은 메인 화면 하단에 붙는 최소 배너 슬롯이 연결되어 있습니다.

- 코드 위치: `src/components/AdBanner.tsx`
- 환경변수 설정 파일: `.env`
- Expo 설정 파일: `app.config.js`
- 현재 동작:
  - 개발 모드(`__DEV__`)에서는 Google 테스트 배너 ID 사용
  - 웹에서는 광고 숨김
  - 프로덕션에서는 `EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID`를 입력하기 전까지 광고 숨김

## 지금 수정하면 되는 파일

광고 관련 값은 `.env`만 수정하면 됩니다.

## 내가 직접 해야 하는 작업

### 1. 패키지 설치

```bash
npm install react-native-google-mobile-ads
```

현재 저장소에는 의존성 선언과 UI 연결만 반영되어 있고, 실제 SDK 설치는 각 개발 환경에서 한 번 실행해줘야 합니다.

### 2. `.env` 값 채우기

루트의 `.env` 파일에서 아래 4개 값만 실제 값으로 바꿉니다.

```bash
ADMOB_ANDROID_APP_ID=ca-app-pub-실제안드로이드앱ID
ADMOB_IOS_APP_ID=ca-app-pub-실제iOS앱ID
ADMOB_IOS_USER_TRACKING_DESCRIPTION=This identifier will be used to deliver personalized ads to you.
EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID=ca-app-pub-실제배너광고유닛ID
```

- `ADMOB_ANDROID_APP_ID`, `ADMOB_IOS_APP_ID`는 AdMob 콘솔의 각 앱 `App ID`
- `EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID`는 배너 광고 유닛 ID
- iOS 추적 문구는 기본값을 넣어뒀지만 필요하면 수정 가능
- 이 값들은 `app.config.js`와 앱 코드에서 자동으로 읽습니다.

### 3. Expo 개발 빌드 다시 생성

Expo Go에서는 이 라이브러리가 동작하지 않습니다. 개발 빌드나 네이티브 런으로 확인해야 합니다.

```bash
npx expo prebuild
npx expo run:android
```

또는

```bash
npx expo prebuild
npx expo run:ios
```

### 4. 출시 전 필수 체크

- Google Play Console에서 `이 앱에는 광고가 포함됨` 설정
- AdMob의 `app-ads.txt` 설정 및 검증
- iOS 대상이면 ATT 설명 문구 및 개인정보 동의 흐름 점검
- 실제 광고 대신 테스트 광고로 먼저 검증

### 5. EAS 빌드를 쓰는 경우

로컬 `.env`는 원격 빌드 서버에 자동으로 올라가지 않습니다. EAS Build를 쓸 거면 같은 값을 EAS 환경변수에도 넣어야 합니다.

## 참고 링크

- React Native Google Mobile Ads docs: https://docs.page/invertase/react-native-google-mobile-ads
- Expo environment variables docs: https://docs.expo.dev/eas/environment-variables
- AdMob app-ads.txt 도움말: https://support.google.com/admob/answer/14538460?hl=en
- AdMob Privacy & messaging 도움말: https://support.google.com/admob/answer/10107561?hl=en
