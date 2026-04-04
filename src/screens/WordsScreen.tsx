import * as Speech from "expo-speech"
import React, { useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native"
import { AppIcon } from "../components/AppIcon"
import { AppText as Text } from "../components/AppText"
import { Card } from "../components/Card"
import { borderWidths, colors, radii, spacing } from "../constants/theme"
import { resolveLanguage, t, tf } from "../lib/i18n"
import { getLocalizedMeaning, getStudyWordsByLevel } from "../lib/quiz"
import { getSpeechOptions } from "../lib/speech"
import { useAppStore } from "../store/useAppStore"

const PAGE_SIZE = 24
type MemorizedFilter = "all" | "hidden" | "only"

function getWordLength(kana: string) {
  return Array.from(kana.replace(/\s+/g, "")).length
}

function renderHighlightedCopy(
  template: string,
  values: Record<string, string | number>,
  textStyles: Partial<Record<string, object>>
) {
  return template.split(/(\{\w+\})/g).map((part, index) => {
    const match = part.match(/^\{(\w+)\}$/)

    if (!match) {
      return part
    }

    const token = match[1]
    return (
      <Text key={`${token}-${index}`} style={textStyles[token]}>
        {values[token]}
      </Text>
    )
  })
}

export function WordsScreen() {
  const { width } = useWindowDimensions()
  const {
    settings,
    bookmarkWordIds,
    memorizedWordIds,
    toggleWordBookmark,
    toggleWordMemorized,
    speakEnabled
  } = useAppStore()
  const words = getStudyWordsByLevel(settings.level, settings.homeDensity)
  const [selectedLength, setSelectedLength] = useState<number | null>(null)
  const [memorizedFilter, setMemorizedFilter] =
    useState<MemorizedFilter>("hidden")
  const [page, setPage] = useState(1)
  const [showMeanings, setShowMeanings] = useState(true)
  const resolvedLanguage = resolveLanguage(settings.language)

  const lengthOptions = useMemo(
    () =>
      Array.from(new Set(words.map((word) => getWordLength(word.kana)))).sort(
        (left, right) => left - right
      ),
    [words]
  )

  const filteredWords = useMemo(
    () =>
      words.filter((word) => {
        const matchesLength =
          selectedLength === null ||
          getWordLength(word.kana) === selectedLength
        const isMemorized = memorizedWordIds.includes(word.id)

        if (!matchesLength) {
          return false
        }

        if (memorizedFilter === "hidden") {
          return !isMemorized
        }

        if (memorizedFilter === "only") {
          return isMemorized
        }

        return true
      }),
    [selectedLength, words, memorizedFilter, memorizedWordIds]
  )

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visibleWords = filteredWords.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )
  const rangeStart =
    filteredWords.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd =
    filteredWords.length === 0
      ? 0
      : Math.min(safePage * PAGE_SIZE, filteredWords.length)

  const visiblePageCount = useMemo(() => {
    if (width < 360) {
      return 3
    }

    if (width < 420) {
      return 5
    }

    if (width < 520) {
      return 7
    }

    if (width < 680) {
      return 9
    }

    return 11
  }, [width])

  const pageWindow = useMemo(() => {
    const half = Math.floor(visiblePageCount / 2)
    const start = Math.max(
      1,
      Math.min(safePage - half, totalPages - visiblePageCount + 1)
    )
    const end = Math.min(totalPages, start + visiblePageCount - 1)

    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [safePage, totalPages, visiblePageCount])

  useEffect(() => {
    setPage(1)
  }, [selectedLength, settings.level, memorizedFilter])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          {t(settings.language, "wordBankEyebrow")}
        </Text>
        <Text style={styles.title}>
          {t(settings.language, "wordBankTitle")}
        </Text>
        <Text style={styles.helper}>
          {renderHighlightedCopy(
            t(settings.language, "wordBankHelper"),
            { level: settings.level, count: filteredWords.length },
            {
              level: styles.helperLevelStrong,
              count: styles.helperCountStrong
            }
          )}
        </Text>
      </View>

      <View style={styles.noticeControls}>
        <Pressable
          onPress={() => setShowMeanings((current) => !current)}
          style={({ pressed }) => [
            styles.visibilityButton,
            pressed && styles.pressed
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

      <Card style={styles.noticeCard}>
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <View style={styles.filterTitleRow}>
              <View style={styles.filterIconBadge}>
                <AppIcon name="filters" size={14} color={colors.text} />
              </View>
              <Text style={styles.noticeTitle}>
                {t(settings.language, "wordLengthFilter")}
              </Text>
            </View>
          </View>
          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setSelectedLength(null)}
              style={({ pressed }) => [
                styles.filterChip,
                selectedLength === null && styles.filterChipActive,
                pressed && styles.pressed
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedLength === null && styles.filterChipTextActive
                ]}
              >
                {t(settings.language, "allLengths")}
              </Text>
            </Pressable>
            {lengthOptions.map((length) => {
              const isActive = selectedLength === length
              return (
                <Pressable
                  key={length}
                  onPress={() => setSelectedLength(length)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    pressed && styles.pressed
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive
                    ]}
                  >
                    {tf(settings.language, "lengthOption", { count: length })}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
        <View style={styles.filterSection}>
          <View style={styles.filterSectionHeader}>
            <View style={styles.filterTitleRow}>
              <View style={styles.filterIconBadge}>
                <AppIcon name="check" size={14} color={colors.garden} />
              </View>
              <Text style={styles.noticeTitle}>
                {t(settings.language, "memorizedFilter")}
              </Text>
            </View>
          </View>
          <View style={styles.filterRow}>
            {(
              [
                ["all", "allWordsFilter"],
                ["hidden", "hideMemorizedFilter"],
                ["only", "memorizedOnlyFilter"]
              ] as const
            ).map(([value, labelKey]) => {
              const isActive = memorizedFilter === value
              return (
                <Pressable
                  key={value}
                  onPress={() => setMemorizedFilter(value)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                    pressed && styles.pressed
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive
                    ]}
                  >
                    {t(settings.language, labelKey)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
        {resolvedLanguage === "ko" ? (
          <Text style={styles.noticeText}>
            {t(settings.language, "meaningLocalizationNotice")}
          </Text>
        ) : null}
      </Card>

      <View style={styles.list}>
        {visibleWords.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {t(settings.language, "emptyFilteredWords")}
            </Text>
          </Card>
        ) : null}
        {visibleWords.map((word, index) => {
          const isBookmarked = bookmarkWordIds.includes(word.id)
          const isMemorized = memorizedWordIds.includes(word.id)

          return (
            <Card
              key={word.id}
              style={[styles.wordCard, isMemorized && styles.wordCardMemorized]}
            >
              <View style={styles.wordHeader}>
                <View style={styles.wordMetaRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </Text>
                  </View>
                  <Text style={styles.levelText}>{word.jlptLevel}</Text>
                </View>

                <View style={styles.headerActions}>
                  <Pressable
                    onPress={() => {
                      if (speakEnabled()) {
                        Speech.speak(word.kana, getSpeechOptions(settings))
                      }
                    }}
                    style={({ pressed }) => [
                      styles.bookmarkIconButton,
                      pressed && styles.pressed
                    ]}
                  >
                    <AppIcon
                      name="volume"
                      size={18}
                      color={colors.primaryDeep}
                    />
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      await toggleWordMemorized(word.id)
                    }}
                    style={({ pressed }) => [
                      styles.bookmarkIconButton,
                      isMemorized && styles.memorizedIconButtonActive,
                      pressed && styles.pressed
                    ]}
                  >
                    <AppIcon
                      name="check"
                      size={18}
                      color={isMemorized ? colors.garden : colors.textMuted}
                    />
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      await toggleWordBookmark(word.id)
                    }}
                    style={({ pressed }) => [
                      styles.bookmarkIconButton,
                      isBookmarked && styles.bookmarkIconButtonActive,
                      pressed && styles.pressed
                    ]}
                  >
                    <AppIcon
                      name={isBookmarked ? "bookmarkActive" : "bookmarks"}
                      size={18}
                      color={isBookmarked ? colors.text : colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.kanji}>{word.kanji || word.kana}</Text>
              {word.kanji ? <Text style={styles.kana}>{word.kana}</Text> : null}
              <View style={styles.meaningBlock}>
                <Text style={styles.meaningLabel}>
                  {resolvedLanguage === "ko" && !word.meaningKo
                    ? t(settings.language, "englishMeaningLabel")
                    : t(settings.language, "meaningLabel")}
                </Text>
                <Text
                  style={[
                    styles.meaning,
                    !showMeanings && styles.meaningHidden
                  ]}
                >
                  {showMeanings
                    ? getLocalizedMeaning(word, settings.language)
                    : t(settings.language, "meaningHidden")}
                </Text>
              </View>
            </Card>
          )
        })}
      </View>

      <View style={styles.pagination}>
        <Text style={styles.pageSummary}>
          {tf(settings.language, "showingWordsSummary", {
            start: rangeStart,
            end: rangeEnd,
            total: filteredWords.length
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
                    pressed && styles.pressed
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
              const isActive = pageNumber === safePage

              return (
                <Pressable
                  key={pageNumber}
                  onPress={() => setPage(pageNumber)}
                  style={({ pressed }) => [
                    styles.pageChip,
                    isActive && styles.pageChipActive,
                    pressed && styles.pressed
                  ]}
                >
                  <Text
                    style={[
                      styles.pageChipText,
                      isActive && styles.pageChipTextActive
                    ]}
                  >
                    {pageNumber}
                  </Text>
                </Pressable>
              )
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
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={styles.pageChipText}>{totalPages}</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    flex: 1
  },
  header: {
    gap: spacing.xs
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  title: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900"
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    lineHeight: 22
  },
  helperLevelStrong: {
    color: colors.primary,
    fontWeight: "800"
  },
  helperCountStrong: {
    color: colors.rose,
    fontWeight: "800"
  },
  noticeCard: {
    gap: spacing.md,
    backgroundColor: colors.surfaceLow
  },
  filterSection: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface
  },
  noticeControls: {
    alignItems: "flex-end",
    marginTop: -spacing.xs,
    marginBottom: -spacing.xs
  },
  noticeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  noticeHeader: {
    gap: spacing.xs
  },
  filterSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  filterIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundRaised,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
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
    gap: spacing.xs
  },
  visibilityButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  filterChipTextActive: {
    color: colors.text,
    fontWeight: "900"
  },
  noticeText: {
    color: colors.textMuted,
    lineHeight: 22,
    fontSize: 13
  },
  emptyCard: {
    backgroundColor: colors.surfaceMuted
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 22
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  wordCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface
  },
  wordCardMemorized: {
    opacity: 0.58
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  wordMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceHigh,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  badgeText: {
    color: colors.text,
    fontWeight: "900"
  },
  levelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  bookmarkIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center"
  },
  bookmarkIconButtonActive: {
    borderColor: colors.border,
    backgroundColor: colors.primarySoft
  },
  memorizedIconButtonActive: {
    borderColor: colors.garden,
    backgroundColor: colors.gardenSoft
  },
  kanji: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  kana: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700"
  },
  meaningBlock: {
    marginTop: spacing.xs,
    gap: 4
  },
  meaningLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase"
  },
  meaning: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24
  },
  meaningHidden: {
    letterSpacing: 1.6
  },
  captionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  bookmarkCaption: {
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: "800"
  },
  memorizedCaption: {
    color: colors.garden,
    fontSize: 12,
    fontWeight: "800"
  },
  pagination: {
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.lg
  },
  pageChipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "nowrap",
    gap: spacing.xs
  },
  pageChip: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  pageChipActive: {
    borderColor: colors.border,
    backgroundColor: colors.primarySoft
  },
  pageChipText: {
    color: colors.textMuted,
    fontWeight: "800"
  },
  pageChipTextActive: {
    color: colors.text,
    fontWeight: "900"
  },
  pageGapText: {
    color: colors.textFaint,
    fontSize: 18,
    fontWeight: "900"
  },
  pageSummary: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }]
  }
})
