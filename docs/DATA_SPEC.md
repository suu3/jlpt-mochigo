# DATA SPEC

## 데이터 원칙

- 공식 JLPT 문제 사용 금지
- 오픈 데이터만 사용
- 출처와 라이선스가 확인된 데이터만 사용
- 각 데이터셋의 출처를 문서와 앱 내에 명시
- 필요 시 가공 후 사용

## 주요 데이터 소스

- JMDict
- KANJIDIC2
- 커뮤니티 JLPT 레벨 매핑 데이터
- 선택적으로 Tatoeba 또는 자체 제작 예문

## 데이터 처리 흐름

raw -> normalized -> derived

## 최종 단어 엔트리 예시

```ts
type WordEntry = {
  id: string;
  kana: string;
  kanji: string;
  meaning: string;
  jlptLevel: "N5" | "N4" | "N3" | "N2" | "N1";
};
```
