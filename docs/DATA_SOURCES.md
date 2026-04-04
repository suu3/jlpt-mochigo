# DATA SOURCES & LICENSES

본 앱은 일본어 학습을 위해 오픈 데이터를 사용합니다.
모든 데이터는 해당 라이선스 범위 내에서 사용하며, 필요한 경우 출처를 표기합니다.

## 1. JMDict

- 설명: 일본어 단어 사전 데이터
- 용도: 단어, 읽기, 의미 구성
- 출처: https://www.edrdg.org/jmdict/j_jmdict.html
- 라이선스: CC BY-SA 4.0
- 비고: 앱 내 출처 표기 필요. 사전 데이터의 뜻과 표제어는 JMDict 기반이다.

## 2. Community JLPT Word List

- 설명: JLPT 레벨 매핑용 커뮤니티 데이터
- 용도: 단어에 N5~N1 레벨 부여
- 출처: https://github.com/elzup/jlpt-word-list
- 라이선스: MIT
- 비고: 공식 JLPT 데이터가 아니며, 레벨 태깅 참고용으로 사용한다.

## 3. Tatoeba (선택)

- 설명: 문장 예문 데이터
- 용도: 향후 예문 기반 학습
- 출처: https://tatoeba.org
- 라이선스: CC BY 계열
- 비고: 필요 시 문장별 attribution 고려

## 앱 내 표기 원칙

앱의 Settings 또는 About 화면에 아래를 명시한다.

- 사용 데이터 소스명
- 라이선스명
- 출처 링크 또는 설명
- 공식 JLPT 시험과 무관하다는 안내

## 현재 배포 판단

- 현재 빌드 스크립트는 JMDict와 elzup/jlpt-word-list를 사용해 앱용 번들 데이터셋을 생성한다.
- KANJIDIC2는 다운로드 대상이지만 현재 최종 앱 데이터 생성에는 사용하지 않는다.
- 광고 기반 플레이스토어 배포 시 최소한 JMDict와 jlpt-word-list 출처 표기는 앱 내부 화면에 노출한다.

## 앱 내 표기 예시

- This app uses JMdict dictionary data from the Electronic Dictionary Research and Development Group (EDRDG), licensed under CC BY-SA 4.0.
- JLPT level mapping is based in part on the community-maintained jlpt-word-list project by elzup, distributed under the MIT License.
- This app is not affiliated with or endorsed by the official Japanese-Language Proficiency Test (JLPT).
