import React from "react"
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native"

type Props = {
  mood: "calm" | "happy" | "soft";
  stage?: 1 | 2 | 3 | 4;
}

const bunnyImages: Record<NonNullable<Props["stage"]>, ImageSourcePropType> = {
  1: require("../assets/bunny/level-1.png"),
  2: require("../assets/bunny/level-2.png"),
  3: require("../assets/bunny/level-3.png"),
  4: require("../assets/bunny/level-4.png")
} as const

const stageScale = {
  1: 0.86,
  2: 0.96,
  3: 1.08,
  4: 1.18
} as const

export function BunnyBadge({ mood: _mood, stage = 1 }: Props) {
  const scale = stageScale[stage]

  return (
    <View style={[styles.shell, { transform: [{ scale }] }]}>
      <Image source={bunnyImages[stage]} style={styles.image} resizeMode="contain" />
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  image: {
    width: "100%",
    height: "100%"
  }
})
