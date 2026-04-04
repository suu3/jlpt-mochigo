import React from "react"
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native"

type Props = {
  mood: "calm" | "happy" | "soft";
  stage?: 1 | 2 | 3 | 4;
}

const bunnyPool: Record<number, ImageSourcePropType[]> = {
  1: [
    require("../assets/bunny/level1_basic.png"),
    require("../assets/bunny/level1_sleeping.png"),
    require("../assets/bunny/level1_study.png")
  ],
  2: [
    require("../assets/bunny/level2_basic.png"),
    require("../assets/bunny/level2_sleeping.png"),
    require("../assets/bunny/level2_acheived.png")
  ],
  3: [
    require("../assets/bunny/level3_basic.png"),
    require("../assets/bunny/level3_acheived.png")
  ],
  4: [
    require("../assets/bunny/level4_study.png"),
    require("../assets/bunny/level4_sleeping.png"),
    require("../assets/bunny/level4_acheived.png")
  ]
}

const stageScale = {
  1: 0.86,
  2: 0.96,
  3: 1.08,
  4: 1.18
} as const

export function BunnyBadge({ mood: _mood, stage = 1 }: Props) {
  const scale = stageScale[stage]
  
  // Pick a random image from the pool for the current stage
  const source = React.useMemo(() => {
    const pool = bunnyPool[stage] || []
    if (pool.length === 0) return null
    const randomIndex = Math.floor(Math.random() * pool.length)
    return pool[randomIndex]
  }, [stage])

  if (!source) return null

  return (
    <View style={[styles.shell, { transform: [{ scale }] }]}>
      <Image source={source} style={styles.image} resizeMode="contain" />
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
