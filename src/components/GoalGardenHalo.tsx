import React, { useEffect, useRef, useState } from "react"
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native"
import Svg, { Circle, Ellipse, Path } from "react-native-svg"
import { colors } from "../constants/theme"

type GoalGardenHaloProps = {
  active: boolean;
}

const ORBS = [
  { x: -92, y: -58, size: 14, color: colors.roseSoft, delay: 0 },
  { x: 102, y: -34, size: 12, color: colors.accentSoft, delay: 240 },
  { x: -82, y: 92, size: 16, color: colors.amberSoft, delay: 140 },
  { x: 92, y: 84, size: 13, color: colors.surfaceHigh, delay: 320 },
  { x: 0, y: -112, size: 10, color: colors.primarySoft, delay: 420 },
  { x: 0, y: 116, size: 12, color: colors.gardenSoft, delay: 120 }
] as const

export function GoalGardenHalo({ active }: GoalGardenHaloProps) {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false)
  const floatProgress = useRef(new Animated.Value(0)).current
  const orbProgress = useRef(ORBS.map(() => new Animated.Value(0))).current

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

    floatProgress.setValue(0)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatProgress, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(floatProgress, {
          toValue: 0,
          duration: 3400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    )

    const orbLoops = orbProgress.map((value, index) => {
      value.setValue(0)

      return Animated.loop(
        Animated.sequence([
          Animated.delay(ORBS[index].delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 4200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 4200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      )
    })

    floatLoop.start()
    orbLoops.forEach((loop) => loop.start())

    return () => {
      floatLoop.stop()
      orbLoops.forEach((loop) => loop.stop())
    }
  }, [active, floatProgress, orbProgress, reduceMotionEnabled])

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.illustrationWrap,
          reduceMotionEnabled
            ? null
            : {
                transform: [
                  {
                    translateY: floatProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [6, -10]
                    })
                  },
                  {
                    scale: floatProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1.04]
                    })
                  },
                  {
                    rotate: floatProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["-2deg", "1.5deg"]
                    })
                  }
                ]
              }
        ]}
      >
        <Svg width={210} height={210} viewBox="0 0 210 210">
          <Circle cx={105} cy={105} r={79} fill={colors.surface} opacity={0.78} />
          <Circle cx={105} cy={105} r={63} fill={colors.primaryWash} opacity={0.8} />
          <Path
            d="M52 126c10-30 27-49 53-56"
            stroke={colors.garden}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />
          <Path
            d="M158 126c-10-30-27-49-53-56"
            stroke={colors.garden}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
            opacity={0.85}
          />
          <Ellipse cx={60} cy={116} rx={11} ry={20} fill={colors.gardenSoft} transform="rotate(-34 60 116)" />
          <Ellipse cx={78} cy={90} rx={10} ry={18} fill={colors.gardenSoft} transform="rotate(-18 78 90)" />
          <Ellipse cx={94} cy={76} rx={8} ry={16} fill={colors.roseSoft} transform="rotate(-8 94 76)" />
          <Ellipse cx={150} cy={116} rx={11} ry={20} fill={colors.gardenSoft} transform="rotate(34 150 116)" />
          <Ellipse cx={132} cy={90} rx={10} ry={18} fill={colors.gardenSoft} transform="rotate(18 132 90)" />
          <Ellipse cx={116} cy={76} rx={8} ry={16} fill={colors.roseSoft} transform="rotate(8 116 76)" />
          <Ellipse cx={72} cy={145} rx={12} ry={18} fill={colors.amberSoft} transform="rotate(-20 72 145)" />
          <Ellipse cx={138} cy={145} rx={12} ry={18} fill={colors.accentSoft} transform="rotate(20 138 145)" />
          <Circle cx={105} cy={64} r={7} fill={colors.primarySoft} />
          <Circle cx={48} cy={132} r={5} fill={colors.primarySoft} opacity={0.7} />
          <Circle cx={162} cy={132} r={5} fill={colors.primarySoft} opacity={0.7} />
        </Svg>
      </Animated.View>
      {ORBS.map((orb, index) => (
        <Animated.View
          key={`orb-${index}`}
          style={[
            styles.orb,
            {
              width: orb.size,
              height: orb.size,
              backgroundColor: orb.color,
              transform: [
                { translateX: orb.x },
                reduceMotionEnabled
                  ? { translateY: orb.y }
                  : {
                      translateY: orbProgress[index].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [orb.y + 4, orb.y - 10, orb.y + 4]
                      })
                    },
                reduceMotionEnabled
                  ? { scale: 1 }
                  : {
                      scale: orbProgress[index].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.92, 1.08, 0.94]
                      })
                    }
              ],
              opacity: reduceMotionEnabled ? 0.88 : 0.92
            }
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: 256,
    height: 256,
    alignItems: "center",
    justifyContent: "center"
  },
  illustrationWrap: {
    position: "absolute"
  },
  orb: {
    position: "absolute",
    borderRadius: 999
  }
})
