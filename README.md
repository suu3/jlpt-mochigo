# JLPT Bunny MVP

문서 기반으로 구현한 JLPT N5 일본어 단어 학습 앱 MVP입니다.

## 포함 기능

- 홈 화면
- 5문제 퀴즈 세션
- 의미 맞추기 / 읽기 맞추기
- 오답 저장 및 다음 세션 우선 복습
- 오답 노트 화면
- OS TTS 재생 버튼
- 로컬 저장 기반 진행률 / streak / 세션 기록
- SQLite 기반 오답 / 세션 이력 저장

## 실행

```bash
npm install
npm run data:refresh
npm run start
```

광고를 붙일 때는 `.env`의 AdMob 값만 수정한 뒤 `npx expo prebuild`로 네이티브 설정을 다시 생성하면 됩니다. 자세한 내용은 `docs/ADMOB_SETUP.md`를 참고하세요.

## GitHub Pages

GitHub Pages가 활성화되면 정적 검증 페이지와 `app-ads.txt`가 함께 배포됩니다.

- 배포 주소: `https://suu3.github.io/jlpt-mochigo/`
- app-ads.txt 주소: `https://suu3.github.io/jlpt-mochigo/app-ads.txt`

Pages 배포는 `.github/workflows/deploy-pages.yml`에서 처리합니다.

## 현재 구현 메모

- 문서의 MVP 범위를 우선 반영했습니다.
- 하단 배너 광고 슬롯을 최소 연결해두었고, 실제 AdMob 설정 절차는 `docs/ADMOB_SETUP.md`에 정리했습니다.
- 데이터 파이프라인은 `JMDict + JLPT word list` 기반으로 N1~N5 생성이 가능하도록 구성했습니다.

## 데이터 파이프라인

```bash
npm run data:download
npm run data:build
```

- raw 데이터: `data/raw`
- 가공 결과: `data/derived`
- 앱 로딩용 생성 데이터: `src/data/generated`

## 데이터 출처

- 단어 표기, 읽기, 영문 뜻: `JMdict` by EDRDG, `CC BY-SA 4.0`
- JLPT 레벨 매핑 참고: `jlpt-word-list` by elzup, `MIT`
- 현재 빌드 기준으로 `KANJIDIC2`는 최종 앱 데이터 생성에 사용하지 않습니다.
- 이 앱은 공식 JLPT 시험과 무관하며, 일본어능력시험을 주관하는 기관의 승인이나 후원을 받지 않았습니다.

## SQLite 관련

- SQLite는 로컬 DB라서 기본적으로 외부 API가 필요하지 않습니다.
- 현재 구현에서는 `wrong_answers`, `session_history`를 SQLite로 저장합니다.
- 설정값, daily progress, streak는 AsyncStorage에 유지합니다.
- 기존 AsyncStorage 오답/이력 데이터가 있으면 첫 초기화 때 SQLite로 자동 마이그레이션됩니다.
