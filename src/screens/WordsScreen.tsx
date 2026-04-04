import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { AppIcon } from "../components/AppIcon";
import { AppText as Text } from "../components/AppText";
import { BunnyBadge } from "../components/BunnyBadge";
import { Card } from "../components/Card";
import { borderWidths, colors, radii, spacing } from "../constants/theme";
import { t, tf } from "../lib/i18n";
import { getLocalizedMeaning, getStudyWords } from "../lib/quiz";
import { getSpeechOptions } from "../lib/speech";
import { useAppStore } from "../store/useAppStore";
import { FoxTeacher } from "../components/FoxTeacher";
import { AnimateEntrance } from "../components/AnimateEntrance";
import { ScaleInteract } from "../components/ScaleInteract";
import { animations } from "../constants/theme";

const PAGE_SIZE = 24;
const SWIPE_TRIGGER_DISTANCE = 48;
type MemorizedFilter = "all" | "hidden" | "only";
type WordTab = "jlpt" | "custom";
type FilterAccordion = "kanaRow" | "length" | "memorized" | null;
type KanaRowFilter =
  | "a"
  | "ka"
  | "sa"
  | "ta"
  | "na"
  | "ha"
  | "ma"
  | "ya"
  | "ra"
  | "wa";

const KANA_ROW_OPTIONS: KanaRowFilter[] = [
  "a",
  "ka",
  "sa",
  "ta",
  "na",
  "ha",
  "ma",
  "ya",
  "ra",
  "wa",
];

const KANA_ROW_LABEL_KEYS: Record<
  KanaRowFilter,
  | "kanaRowa"
  | "kanaRowka"
  | "kanaRowsa"
  | "kanaRowta"
  | "kanaRowna"
  | "kanaRowha"
  | "kanaRowma"
  | "kanaRowya"
  | "kanaRowra"
  | "kanaRowwa"
> = {
  a: "kanaRowa",
  ka: "kanaRowka",
  sa: "kanaRowsa",
  ta: "kanaRowta",
  na: "kanaRowna",
  ha: "kanaRowha",
  ma: "kanaRowma",
  ya: "kanaRowya",
  ra: "kanaRowra",
  wa: "kanaRowwa",
};

const SMALL_KANA_NORMALIZATION: Record<string, string> = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
  っ: "つ",
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ゎ: "わ",
  ゕ: "か",
  ゖ: "け",
};

const HIRAGANA_ROW_MAP: Record<string, KanaRowFilter> = {
  あ: "a",
  い: "a",
  う: "a",
  え: "a",
  お: "a",
  か: "ka",
  き: "ka",
  く: "ka",
  け: "ka",
  こ: "ka",
  が: "ka",
  ぎ: "ka",
  ぐ: "ka",
  げ: "ka",
  ご: "ka",
  さ: "sa",
  し: "sa",
  す: "sa",
  せ: "sa",
  そ: "sa",
  ざ: "sa",
  じ: "sa",
  ず: "sa",
  ぜ: "sa",
  ぞ: "sa",
  た: "ta",
  ち: "ta",
  つ: "ta",
  て: "ta",
  と: "ta",
  だ: "ta",
  ぢ: "ta",
  づ: "ta",
  で: "ta",
  ど: "ta",
  な: "na",
  に: "na",
  ぬ: "na",
  ね: "na",
  の: "na",
  は: "ha",
  ひ: "ha",
  ふ: "ha",
  へ: "ha",
  ほ: "ha",
  ば: "ha",
  び: "ha",
  ぶ: "ha",
  べ: "ha",
  ぼ: "ha",
  ぱ: "ha",
  ぴ: "ha",
  ぷ: "ha",
  ぺ: "ha",
  ぽ: "ha",
  ま: "ma",
  み: "ma",
  む: "ma",
  め: "ma",
  も: "ma",
  や: "ya",
  ゆ: "ya",
  よ: "ya",
  ら: "ra",
  り: "ra",
  る: "ra",
  れ: "ra",
  ろ: "ra",
  わ: "wa",
  ゐ: "wa",
  ゑ: "wa",
  を: "wa",
  ん: "wa",
};

function getWordLength(kana: string) {
  return Array.from(kana.replace(/\s+/g, "")).length;
}

function normalizeKanaLeadCharacter(kana: string) {
  const leadCharacter = kana.trim().charAt(0);

  if (!leadCharacter) {
    return "";
  }

  const normalizedKatakana =
    leadCharacter >= "ァ" && leadCharacter <= "ヶ"
      ? String.fromCharCode(leadCharacter.charCodeAt(0) - 0x60)
      : leadCharacter;

  return SMALL_KANA_NORMALIZATION[normalizedKatakana] ?? normalizedKatakana;
}

function getKanaRow(kana: string) {
  const normalizedLeadCharacter = normalizeKanaLeadCharacter(kana);
  return HIRAGANA_ROW_MAP[normalizedLeadCharacter] ?? null;
}

function renderHighlightedCopy(
  template: string,
  values: Record<string, string | number>,
  textStyles: Partial<Record<string, object>>,
) {
  return template.split(/(\{\w+\})/g).map((part, index) => {
    const match = part.match(/^\{(\w+)\}$/);

    if (!match) {
      return <Text key={`text-${index}`}>{part}</Text>;
    }

    const token = match[1];
    return (
      <Text key={`${token}-${index}`} style={textStyles[token]}>
        {values[token]}
      </Text>
    );
  });
}

export function WordsScreen() {
  const { width } = useWindowDimensions();
  const {
    settings,
    customWords,
    wordsByLevel,
    addCustomWord,
    removeCustomWord,
    bookmarkWordIds,
    memorizedWordIds,
    toggleWordBookmark,
    toggleWordMemorized,
    speakEnabled,
    isWordDataLoading,
    totalStudyCount,
  } = useAppStore();

  const bunnyStage =
    totalStudyCount >= 100
      ? 4
      : totalStudyCount >= 60
        ? 3
        : totalStudyCount >= 25
          ? 2
          : 1;
  const isTtsEnabled = settings.ttsEnabled;

  const [activeTab, setActiveTab] = useState<WordTab>("jlpt");
  const [selectedLength, setSelectedLength] = useState<number | null>(null);
  const [selectedKanaRow, setSelectedKanaRow] = useState<KanaRowFilter | null>(
    null,
  );
  const [openFilterAccordion, setOpenFilterAccordion] =
    useState<FilterAccordion>(null);
  const [memorizedFilter, setMemorizedFilter] =
    useState<MemorizedFilter>("hidden");
  const [page, setPage] = useState(1);
  const [showMeanings, setShowMeanings] = useState(true);
  const [newKana, setNewKana] = useState("");
  const [newKanji, setNewKanji] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  const helperCopy =
    activeTab === "jlpt"
      ? t(settings.language, "wordBankHelper")
      : t(settings.language, "customWordBankHelper");

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 18 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.4,
        onPanResponderRelease: (_, gestureState) => {
          if (
            gestureState.dx <= -SWIPE_TRIGGER_DISTANCE &&
            activeTab === "jlpt"
          ) {
            setActiveTab("custom");
            return;
          }

          if (
            gestureState.dx >= SWIPE_TRIGGER_DISTANCE &&
            activeTab === "custom"
          ) {
            setActiveTab("jlpt");
          }
        },
      }),
    [activeTab],
  );

  const { filteredWords, lengthOptions } = useMemo(() => {
    const sourceWords = wordsByLevel[settings.level] ?? [];
    const studyWords = getStudyWords(sourceWords);

    const filtered = studyWords.filter((word) => {
      const matchesLength =
        selectedLength === null || getWordLength(word.kana) === selectedLength;
      const matchesKanaRow =
        selectedKanaRow === null || getKanaRow(word.kana) === selectedKanaRow;
      const isMemorized = memorizedWordIds.includes(word.id);

      if (!matchesLength || !matchesKanaRow) {
        return false;
      }

      if (memorizedFilter === "hidden") {
        return !isMemorized;
      }

      if (memorizedFilter === "only") {
        return isMemorized;
      }

      return true;
    });

    const lengths = Array.from(
      new Set(studyWords.map((word) => getWordLength(word.kana))),
    ).sort((left, right) => left - right);

    return { filteredWords: filtered, lengthOptions: lengths };
  }, [
    settings.level,
    wordsByLevel,
    selectedLength,
    selectedKanaRow,
    memorizedFilter,
    memorizedWordIds,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleWords = filteredWords.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const rangeStart =
    filteredWords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd =
    filteredWords.length === 0
      ? 0
      : Math.min(safePage * PAGE_SIZE, filteredWords.length);

  const visiblePageCount = useMemo(() => {
    if (width < 360) {
      return 3;
    }

    if (width < 420) {
      return 5;
    }

    if (width < 520) {
      return 7;
    }

    if (width < 680) {
      return 9;
    }

    return 11;
  }, [width]);

  const pageWindow = useMemo(() => {
    const half = Math.floor(visiblePageCount / 2);
    const start = Math.max(
      1,
      Math.min(safePage - half, totalPages - visiblePageCount + 1),
    );
    const end = Math.min(totalPages, start + visiblePageCount - 1);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [safePage, totalPages, visiblePageCount]);

  useEffect(() => {
    setPage(1);
  }, [selectedKanaRow, selectedLength, settings.level, memorizedFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <View style={styles.container}>
      <View {...panResponder.panHandlers} style={styles.swipeArea}>
        <AnimateEntrance duration={animations.duration.long} type="lift">
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                {activeTab === "jlpt" && (
                  <Text style={styles.eyebrow}>
                    {t(settings.language, "wordBankEyebrow")}
                  </Text>
                )}
                <Text style={styles.title}>
                  {t(settings.language, "wordBankTitle")}
                </Text>
              </View>
              <FoxTeacher type="insight" size={84} style={styles.headerFox} />
            </View>
            <Text style={styles.helper}>
              {renderHighlightedCopy(
                helperCopy,
                {
                  level: settings.level,
                  count:
                    activeTab === "jlpt"
                      ? filteredWords.length
                      : customWords.length,
                },
                {
                  level: styles.helperLevelStrong,
                  count: styles.helperCountStrong,
                },
              )}
            </Text>
          </View>
        </AnimateEntrance>

        <AnimateEntrance
          delay={100}
          duration={animations.duration.long}
          type="lift"
        >
          <View style={styles.tabRow}>
            {(
              [
                ["jlpt", "jlptWordsTab"],
                ["custom", "customNotebookTab"],
              ] as const
            ).map(([value, labelKey]) => {
              const isActive = activeTab === value;

              return (
                <ScaleInteract
                  key={value}
                  onPress={() => setActiveTab(value)}
                  style={styles.tabChipScale}
                >
                  <View style={styles.tabChip}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.tabChipText,
                        isActive && styles.tabChipTextActive,
                      ]}
                    >
                      {t(settings.language, labelKey)}
                    </Text>
                    {isActive && <View style={styles.tabIndicator} />}
                  </View>
                </ScaleInteract>
              );
            })}
          </View>
        </AnimateEntrance>

        <View style={styles.noticeControls}>
          <Pressable
            onPress={() => setShowMeanings((current) => !current)}
            style={({ pressed }) => [
              styles.visibilityButton,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              name={showMeanings ? "eye" : "eyeOff"}
              size={16}
              color={colors.text}
            />
            <Text style={styles.visibilityButtonText}>
              {showMeanings
                ? t(settings.language, "hideMeanings")
                : t(settings.language, "showMeanings")}
            </Text>
          </Pressable>
        </View>

        {activeTab === "jlpt" ? (
          <Card style={styles.noticeCard}>
            <View style={styles.filterSection}>
              <Pressable
                onPress={() =>
                  setOpenFilterAccordion((current) =>
                    current === "kanaRow" ? null : "kanaRow",
                  )
                }
                style={({ pressed }) => [
                  styles.filterSectionHeader,
                  styles.filterAccordionButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.filterTitleRow}>
                  <View style={styles.filterIconBadge}>
                    <AppIcon
                      name="words"
                      size={14}
                      color={colors.primaryDeep}
                    />
                  </View>
                  <Text style={styles.noticeTitle}>
                    {t(settings.language, "kanaRowFilter")}
                  </Text>
                </View>
                <AppIcon
                  name="chevronRight"
                  size={16}
                  color={colors.textMuted}
                  strokeWidth={2}
                  style={
                    openFilterAccordion === "kanaRow"
                      ? styles.filterChevronOpen
                      : styles.filterChevron
                  }
                />
              </Pressable>
              {openFilterAccordion === "kanaRow" ? (
                <View style={styles.filterRow}>
                  <Pressable
                    onPress={() => setSelectedKanaRow(null)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      selectedKanaRow === null && styles.filterChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedKanaRow === null && styles.filterChipTextActive,
                      ]}
                    >
                      {t(settings.language, "allKanaRows")}
                    </Text>
                  </Pressable>
                  {KANA_ROW_OPTIONS.map((row) => {
                    const isActive = selectedKanaRow === row;
                    return (
                      <Pressable
                        key={row}
                        onPress={() => setSelectedKanaRow(row)}
                        style={({ pressed }) => [
                          styles.filterChip,
                          isActive && styles.filterChipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isActive && styles.filterChipTextActive,
                          ]}
                        >
                          {t(settings.language, KANA_ROW_LABEL_KEYS[row])}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
            <View style={styles.filterSection}>
              <Pressable
                onPress={() =>
                  setOpenFilterAccordion((current) =>
                    current === "length" ? null : "length",
                  )
                }
                style={({ pressed }) => [
                  styles.filterSectionHeader,
                  styles.filterAccordionButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.filterTitleRow}>
                  <View style={styles.filterIconBadge}>
                    <AppIcon name="filters" size={14} color={colors.text} />
                  </View>
                  <Text style={styles.noticeTitle}>
                    {t(settings.language, "wordLengthFilter")}
                  </Text>
                </View>
                <AppIcon
                  name="chevronRight"
                  size={16}
                  color={colors.textMuted}
                  strokeWidth={2}
                  style={
                    openFilterAccordion === "length"
                      ? styles.filterChevronOpen
                      : styles.filterChevron
                  }
                />
              </Pressable>
              {openFilterAccordion === "length" ? (
                <View style={styles.filterRow}>
                  <Pressable
                    onPress={() => setSelectedLength(null)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      selectedLength === null && styles.filterChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedLength === null && styles.filterChipTextActive,
                      ]}
                    >
                      {t(settings.language, "allLengths")}
                    </Text>
                  </Pressable>
                  {lengthOptions.map((length) => {
                    const isActive = selectedLength === length;
                    return (
                      <Pressable
                        key={length}
                        onPress={() => setSelectedLength(length)}
                        style={({ pressed }) => [
                          styles.filterChip,
                          isActive && styles.filterChipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isActive && styles.filterChipTextActive,
                          ]}
                        >
                          {tf(settings.language, "lengthOption", {
                            count: length,
                          })}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
            <View style={styles.filterSection}>
              <Pressable
                onPress={() =>
                  setOpenFilterAccordion((current) =>
                    current === "memorized" ? null : "memorized",
                  )
                }
                style={({ pressed }) => [
                  styles.filterSectionHeader,
                  styles.filterAccordionButton,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.filterTitleRow}>
                  <View style={styles.filterIconBadge}>
                    <AppIcon name="check" size={14} color={colors.garden} />
                  </View>
                  <Text style={styles.noticeTitle}>
                    {t(settings.language, "memorizedFilter")}
                  </Text>
                </View>
                <AppIcon
                  name="chevronRight"
                  size={16}
                  color={colors.textMuted}
                  strokeWidth={2}
                  style={
                    openFilterAccordion === "memorized"
                      ? styles.filterChevronOpen
                      : styles.filterChevron
                  }
                />
              </Pressable>
              {openFilterAccordion === "memorized" ? (
                <View style={styles.filterRow}>
                  {(
                    [
                      ["all", "allWordsFilter"],
                      ["hidden", "hideMemorizedFilter"],
                      ["only", "memorizedOnlyFilter"],
                    ] as const
                  ).map(([value, labelKey]) => {
                    const isActive = memorizedFilter === value;
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setMemorizedFilter(value)}
                        style={({ pressed }) => [
                          styles.filterChip,
                          isActive && styles.filterChipActive,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isActive && styles.filterChipTextActive,
                          ]}
                        >
                          {t(settings.language, labelKey)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.addCard}>
              <View style={styles.addHeader}>
                <Text style={styles.addTitle}>
                  {t(settings.language, "customWordFormTitle")}
                </Text>
                <View style={styles.customCountBadge}>
                  <Text style={styles.customCountBadgeText}>
                    {t(settings.language, "customWordBadge")}
                  </Text>
                </View>
              </View>
              <Text style={styles.addHelper}>
                {t(settings.language, "customWordsHelper")}
              </Text>
              <Text style={styles.customIncludedText}>
                {tf(settings.language, "customWordsIncluded", {
                  count: customWords.length,
                })}
              </Text>

              <View style={styles.formGrid}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t(settings.language, "customWordKanaLabel")}
                  </Text>
                  <TextInput
                    value={newKana}
                    onChangeText={(value) => {
                      setNewKana(value);
                      if (showValidation) {
                        setShowValidation(false);
                      }
                    }}
                    placeholder={t(
                      settings.language,
                      "customWordKanaPlaceholder",
                    )}
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t(settings.language, "customWordKanjiLabel")}
                  </Text>
                  <TextInput
                    value={newKanji}
                    onChangeText={setNewKanji}
                    placeholder={t(
                      settings.language,
                      "customWordKanjiPlaceholder",
                    )}
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>
                    {t(settings.language, "customWordMeaningLabel")}
                  </Text>
                  <TextInput
                    value={newMeaning}
                    onChangeText={(value) => {
                      setNewMeaning(value);
                      if (showValidation) {
                        setShowValidation(false);
                      }
                    }}
                    placeholder={t(
                      settings.language,
                      "customWordMeaningPlaceholder",
                    )}
                    placeholderTextColor={colors.textFaint}
                    style={styles.input}
                  />
                </View>
              </View>

              {showValidation ? (
                <Text style={styles.validationText}>
                  {t(settings.language, "customWordValidation")}
                </Text>
              ) : null}

              <Pressable
                onPress={async () => {
                  if (!newKana.trim() || !newMeaning.trim()) {
                    setShowValidation(true);
                    return;
                  }

                  await addCustomWord({
                    kana: newKana,
                    kanji: newKanji,
                    meaning: newMeaning,
                  });
                  setNewKana("");
                  setNewKanji("");
                  setNewMeaning("");
                  setShowValidation(false);
                }}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.addButtonText}>
                  {t(settings.language, "addCustomWord")}
                </Text>
              </Pressable>
            </Card>

            <View style={styles.customSection}>
              <View style={styles.customSectionHeader}>
                <Text style={styles.customSectionTitle}>
                  {t(settings.language, "customWordsTitle")}
                </Text>
                <Text style={styles.customSectionCount}>
                  {customWords.length}
                </Text>
              </View>
              {customWords.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <View style={styles.emptyBunnyWrap}>
                    <BunnyBadge mood="soft" stage={bunnyStage} />
                  </View>
                  <Text style={styles.emptyText}>
                    {t(settings.language, "emptyCustomWords")}
                  </Text>
                </Card>
              ) : (
                <View style={styles.customList}>
                  {customWords.map((word) => (
                    <Card key={word.id} style={styles.customWordCard}>
                      <View style={styles.customWordTopRow}>
                        <View style={styles.customWordIdentity}>
                          <Text style={styles.customWordKanji}>
                            {word.kanji || word.kana}
                          </Text>
                          <Text style={styles.customWordKana}>{word.kana}</Text>
                        </View>
                        <Pressable
                          onPress={async () => {
                            await removeCustomWord(word.id);
                          }}
                          style={({ pressed }) => [
                            styles.deleteButton,
                            pressed && styles.pressed,
                          ]}
                        >
                          <AppIcon
                            name="trash"
                            size={16}
                            color={colors.error}
                            strokeWidth={2}
                          />
                        </Pressable>
                      </View>
                      <Text style={styles.customWordMeaning}>
                        {getLocalizedMeaning(word, settings.language)}
                        {word.meanings && word.meanings.length > 1 && (
                          <Text style={styles.additionalMeanings}>
                            {" | "}
                            {word.meanings.slice(1).join(" | ")}
                          </Text>
                        )}
                      </Text>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === "jlpt" ? (
          <View style={styles.list}>
            {isWordDataLoading === true ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                  {t(settings.language, "loading")}
                </Text>
              </View>
            ) : filteredWords.length === 0 ? (
              <Card style={styles.emptyCard}>
                <View style={styles.emptyBunnyWrap}>
                  <BunnyBadge mood="soft" stage={bunnyStage} />
                </View>
                <Text style={styles.emptyText}>
                  {t(settings.language, "emptyFilteredWords")}
                </Text>
              </Card>
            ) : null}
            {isWordDataLoading !== true &&
              visibleWords.map((word, index) => {
                const isBookmarked = bookmarkWordIds.includes(word.id);
                const isMemorized = memorizedWordIds.includes(word.id);

                return (
                  <AnimateEntrance
                    key={word.id}
                    delay={150 + index * 40}
                    duration={animations.duration.long}
                    type="lift"
                  >
                    <Card
                      style={[
                        styles.wordCard,
                        isMemorized && styles.wordCardMemorized,
                      ]}
                    >
                      <View style={styles.wordHeader}>
                        <View style={styles.wordMetaRow}>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {(safePage - 1) * PAGE_SIZE + index + 1}
                            </Text>
                          </View>
                          <Text style={styles.levelText}>{word.jlptLevel}</Text>
                          {word.source === "custom" ? (
                            <View style={styles.inlineCustomBadge}>
                              <Text style={styles.inlineCustomBadgeText}>
                                {t(settings.language, "customWordBadge")}
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.headerActions}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ disabled: !isTtsEnabled }}
                            disabled={!isTtsEnabled}
                            onPress={() => {
                              if (speakEnabled()) {
                                Speech.speak(
                                  word.kana,
                                  getSpeechOptions(settings),
                                );
                              }
                            }}
                            style={({ pressed }) => [
                              styles.bookmarkIconButton,
                              !isTtsEnabled &&
                                styles.bookmarkIconButtonDisabled,
                              pressed && isTtsEnabled && styles.pressed,
                            ]}
                          >
                            <AppIcon
                              name="volume"
                              size={18}
                              color={
                                isTtsEnabled
                                  ? colors.primaryDeep
                                  : colors.textFaint
                              }
                            />
                          </Pressable>
                          <Pressable
                            onPress={async () => {
                              await toggleWordMemorized(word.id);
                            }}
                            style={({ pressed }) => [
                              styles.bookmarkIconButton,
                              isMemorized && styles.memorizedIconButtonActive,
                              pressed && styles.pressed,
                            ]}
                          >
                            <AppIcon
                              name="check"
                              size={18}
                              color={
                                isMemorized ? colors.garden : colors.textMuted
                              }
                            />
                          </Pressable>
                          <Pressable
                            onPress={async () => {
                              await toggleWordBookmark(word.id);
                            }}
                            style={({ pressed }) => [
                              styles.bookmarkIconButton,
                              isBookmarked && styles.bookmarkIconButtonActive,
                              pressed && styles.pressed,
                            ]}
                          >
                            <AppIcon
                              name={
                                isBookmarked ? "bookmarkActive" : "bookmarks"
                              }
                              size={18}
                              color={
                                isBookmarked ? colors.text : colors.textMuted
                              }
                            />
                          </Pressable>
                        </View>
                      </View>

                      <Text style={styles.kanji}>
                        {word.kanji || word.kana}
                      </Text>
                      {word.kanji ? (
                        <Text style={styles.kana}>{word.kana}</Text>
                      ) : null}
                      <View style={styles.meaningBlock}>
                        <Text style={styles.meaningLabel}>
                          {t(settings.language, "meaningLabel")}
                        </Text>
                        <Text
                          style={[
                            styles.meaning,
                            !showMeanings && styles.meaningHidden,
                          ]}
                        >
                          {showMeanings ? (
                            <>
                              {getLocalizedMeaning(word, settings.language)}
                              {(() => {
                                const additionalMeanings =
                                  word.meanings?.slice(1) ?? [];
                                if (additionalMeanings.length === 0)
                                  return null;
                                return (
                                  <Text style={styles.additionalMeanings}>
                                    {" "}
                                    {additionalMeanings.join(" | ")}
                                  </Text>
                                );
                              })()}
                            </>
                          ) : (
                            t(settings.language, "meaningHidden")
                          )}
                        </Text>
                      </View>
                    </Card>
                  </AnimateEntrance>
                );
              })}
          </View>
        ) : null}

        {activeTab === "jlpt" && isWordDataLoading !== true ? (
          <View style={styles.pagination}>
            <Text style={styles.pageSummary}>
              {tf(settings.language, "showingWordsSummary", {
                start: rangeStart,
                end: rangeEnd,
                total: filteredWords.length,
              })}
            </Text>
            {filteredWords.length > 0 ? (
              <View style={styles.pageChipRow}>
                {pageWindow[0] > 1 ? (
                  <>
                    <Pressable
                      onPress={() => setPage(1)}
                      style={({ pressed }) => [
                        styles.pageChip,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.pageChipText}>1</Text>
                    </Pressable>
                    {pageWindow[0] > 2 ? (
                      <Text style={styles.pageGapText}>…</Text>
                    ) : null}
                  </>
                ) : null}

                {pageWindow.map((pageNumber) => {
                  const isActive = pageNumber === safePage;

                  return (
                    <Pressable
                      key={pageNumber}
                      onPress={() => setPage(pageNumber)}
                      style={({ pressed }) => [
                        styles.pageChip,
                        isActive && styles.filterChipActive,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pageChipText,
                          isActive && styles.pageChipTextActive,
                        ]}
                      >
                        {pageNumber}
                      </Text>
                    </Pressable>
                  );
                })}

                {pageWindow[pageWindow.length - 1] < totalPages ? (
                  <>
                    {pageWindow[pageWindow.length - 1] < totalPages - 1 ? (
                      <Text style={styles.pageGapText}>…</Text>
                    ) : null}
                    <Pressable
                      onPress={() => setPage(totalPages)}
                      style={({ pressed }) => [
                        styles.pageChip,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.pageChipText}>{totalPages}</Text>
                    </Pressable>
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    flex: 1,
  },
  swipeArea: {
    gap: spacing.lg,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  tabChipScale: {
    flex: 1,
  },
  tabChip: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tabChipActive: {},
  tabIndicator: {
    position: "absolute",
    bottom: -borderWidths.base,
    left: spacing.md,
    right: spacing.md,
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
  tabChipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  tabChipTextActive: {
    color: colors.text,
    fontWeight: "900",
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    lineHeight: 22,
  },
  helperLevelStrong: {
    color: colors.primary,
    fontWeight: "800",
  },
  helperCountStrong: {
    color: colors.rose,
    fontWeight: "800",
  },
  noticeCard: {
    gap: spacing.md,
    backgroundColor: colors.surfaceLow,
  },
  addCard: {
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  addHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  addTitle: {
    color: colors.primaryDeep,
    fontSize: 22,
    fontWeight: "900",
  },
  addHelper: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  customIncludedText: {
    color: colors.garden,
    fontSize: 13,
    fontWeight: "700",
  },
  customCountBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
  },
  customCountBadgeText: {
    color: colors.primaryDeep,
    fontSize: 11,
    fontWeight: "900",
  },
  formGrid: {
    gap: spacing.sm,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.backgroundRaised,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  validationText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: "700",
  },
  addButton: {
    minHeight: 52,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: colors.primaryDeep,
    fontSize: 15,
    fontWeight: "900",
  },
  filterSection: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
  },
  noticeControls: {
    alignItems: "flex-end",
    marginTop: -spacing.xs,
    marginBottom: -spacing.xs,
  },
  customSection: {
    gap: spacing.sm,
  },
  customSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customSectionTitle: {
    color: colors.primaryDeep,
    fontSize: 18,
    fontWeight: "900",
  },
  customSectionCount: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  customList: {
    gap: spacing.sm,
  },
  customWordCard: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  customWordTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  customWordIdentity: {
    flex: 1,
    gap: 4,
  },
  customWordKanji: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  customWordKana: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  customWordMeaning: {
    color: colors.text,
    lineHeight: 22,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.errorSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  noticeHeader: {
    gap: spacing.xs,
  },
  filterSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterAccordionButton: {
    minHeight: 32,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  filterIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundRaised,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterChevron: {
    transform: [{ rotate: "0deg" }],
  },
  filterChevronOpen: {
    transform: [{ rotate: "90deg" }],
  },
  visibilityButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  visibilityButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: colors.text,
    fontWeight: "900",
  },
  noticeText: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: colors.surfaceMuted,
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: "center",
  },
  emptyBunnyWrap: {
    alignItems: "center",
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  header: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerCopy: {
    flex: 1,
  },
  headerFox: {
    marginBottom: -spacing.sm,
    marginRight: spacing.sm,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  wordCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  wordCardMemorized: {
    opacity: 0.58,
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  wordMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceHigh,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.text,
    fontWeight: "900",
  },
  levelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  inlineCustomBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.primaryWash,
  },
  inlineCustomBadgeText: {
    color: colors.primaryDeep,
    fontSize: 10,
    fontWeight: "900",
  },
  bookmarkIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkIconButtonDisabled: {
    opacity: 0.45,
  },
  bookmarkIconButtonActive: {
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
  },
  memorizedIconButtonActive: {
    borderColor: colors.garden,
    backgroundColor: colors.gardenSoft,
  },
  kanji: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  kana: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  meaningBlock: {
    marginTop: spacing.xs,
    gap: 4,
  },
  meaningLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  meaning: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  additionalMeanings: {
    color: colors.textFaint,
    fontSize: 13,
    fontWeight: "500",
  },
  meaningHidden: {
    letterSpacing: 1.6,
  },
  captionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  bookmarkCaption: {
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: "800",
  },
  memorizedCaption: {
    color: colors.garden,
    fontSize: 12,
    fontWeight: "800",
  },
  pagination: {
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  pageChipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: spacing.xs,
  },
  pageChip: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pageChipActive: {
    borderColor: colors.border,
    backgroundColor: colors.primarySoft,
  },
  pageChipText: {
    color: colors.textMuted,
    fontWeight: "800",
  },
  pageChipTextActive: {
    color: colors.text,
    fontWeight: "900",
  },
  pageGapText: {
    color: colors.textFaint,
    fontSize: 18,
    fontWeight: "900",
  },
  pageSummary: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  inlineLoading: {
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }],
  },
});
