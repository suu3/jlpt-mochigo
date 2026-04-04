import React, { useEffect, useMemo, useRef, useState } from "react"
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native"
import { colors } from "../constants/theme"

type CelebrationBurstProps = {
  active: boolean;
}

const PARTICLES = [
  { x: -62, y: -70, size: 12, color: colors.primarySoft },
  { x: -24, y: -92, size: 8, color: colors.roseSoft },
  { x: 20, y: -96, size: 10, color: colors.accentSoft },
  { x: 60, y: -68, size: 12, color: colors.primary },
  { x: 76, y: -10, size: 8, color: colors.rose },
  { x: 58, y: 44, size: 10, color: colors.primaryWash },
  { x: 8, y: 70, size: 12, color: colors.gardenSoft },
  { x: -46, y: 56, size: 8, color: colors.amberSoft },
  { x: -82, y: 8, size: 10, color: colors.accent },
  { x: -6, y: -58, size: 6, color: colors.surfaceHighest }
] as const

export function CelebrationBurst({ active }: CelebrationBurstProps) {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false)
  const particleProgress = useRef(PARTICLES.map(() => new Animated.Value(0))).current
  const haloProgress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let mounted = true

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceMotionEnabled(enabled)
        }
      })
      .catch(() => {
        if (mounted) {
          setReduceMotionEnabled(false)
        }
      })

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled)

    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    if (!active || reduceMotionEnabled) {
      return
    }

    particleProgress.forEach((value) => value.setValue(0))
    haloProgress.setValue(0)

    Animated.parallel([
      Animated.timing(haloProgress, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true
      }),
      Animated.stagger(
        22,
        particleProgress.map((value) =>
          Animated.timing(value, {
            toValue: 1,
            duration: 560,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true
          })
        )
      )
    ]).start()
  }, [active, haloProgress, particleProgress, reduceMotionEnabled])

  const staticDots = useMemo(
    () => PARTICLES.filter((_, index) => index % 2 === 0),
    []
  )

  return (
    <View pointerEvents="none" style={styles.wrap}>
      {active ? (
        reduceMotionEnabled ? (
          <View style={styles.staticWrap}>
            {staticDots.map((particle, index) => (
              <View
                key={`static-${index}`}
                style={[
                  styles.staticDot,
                  {
                    backgroundColor: particle.color,
                    width: particle.size,
                    height: particle.size,
                    left: 96 + particle.x * 0.4,
                    top: 96 + particle.y * 0.4
                  }
                ]}
              />
            ))}
          </View>
        ) : (
          <>
            <Animated.View
              style={[
                styles.halo,
                {
                  opacity: haloProgress.interpolate({
                    inputRange: [0, 0.18, 1],
                    outputRange: [0, 0.85, 0]
                  }),
                  transform: [
                    {
                      scale: haloProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1.35]
                      })
                    }
                  ]
                }
              ]}
            />
            {PARTICLES.map((particle, index) => {
              const progress = particleProgress[index]

              return (
                <Animated.View
                  key={`particle-${index}`}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: particle.color,
                      width: particle.size,
                      height: particle.size,
                      opacity: progress.interpolate({
                        inputRange: [0, 0.14, 1],
                        outputRange: [0, 1, 0]
                      }),
                      transform: [
                        {
                          translateX: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, particle.x]
                          })
                        },
                        {
                          translateY: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, particle.y]
                          })
                        },
                        {
                          scale: progress.interpolate({
                            inputRange: [0, 0.18, 1],
                            outputRange: [0.35, 1, 0.9]
                          })
                        }
                      ]
                    }
                  ]}
                />
              )
            })}
          </>
        )
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  halo: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 999,
    backgroundColor: colors.primaryWash
  },
  particle: {
    position: "absolute",
    borderRadius: 999
  },
  staticWrap: {
    ...StyleSheet.absoluteFillObject
  },
  staticDot: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.9
  }
})
