import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../constants/theme";

type GoalGardenHaloProps = {
  active: boolean;
};

const ORBS = [
  { x: -110, y: -80, size: 14, color: colors.roseSoft, delay: 0 },
  { x: 120, y: -50, size: 12, color: colors.accentSoft, delay: 240 },
  { x: -100, y: 110, size: 16, color: colors.amberSoft, delay: 140 },
  { x: 110, y: 100, size: 13, color: colors.surfaceHigh, delay: 320 },
  { x: 0, y: -140, size: 10, color: colors.primarySoft, delay: 420 },
  { x: 0, y: 140, size: 12, color: colors.gardenSoft, delay: 120 },
  { x: -140, y: 20, size: 9, color: colors.primaryWash, delay: 560 },
  { x: 140, y: 30, size: 11, color: colors.roseSoft, delay: 80 }
] as const;

export function GoalGardenHalo({ active }: GoalGardenHaloProps) {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const floatProgress = useRef(new Animated.Value(0)).current;
  const orbProgress = useRef(ORBS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceMotionEnabled(enabled);
        }
      })
      .catch(() => {
        if (mounted) {
          setReduceMotionEnabled(false);
        }
      });

    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotionEnabled);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!active || reduceMotionEnabled) {
      return;
    }

    floatProgress.setValue(0);
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
    );

    const orbLoops = orbProgress.map((value, index) => {
      value.setValue(0);

      return Animated.loop(
        Animated.sequence([
          Animated.delay(ORBS[index].delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 4500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 4500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      );
    });

    floatLoop.start();
    orbLoops.forEach((loop) => loop.start());

    return () => {
      floatLoop.stop();
      orbLoops.forEach((loop) => loop.stop());
    };
  }, [active, floatProgress, orbProgress, reduceMotionEnabled]);

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
                      outputRange: [8, -12]
                    })
                  },
                  {
                    scale: floatProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.97, 1.05]
                    })
                  }
                ]
              }
        ]}
      >
        <Svg width={300} height={300} viewBox="0 0 300 300">
          <Circle cx={150} cy={150} r={120} fill={colors.surface} opacity={0.65} />
          <Circle cx={150} cy={150} r={105} fill={colors.primaryWash} opacity={0.75} />
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
                        outputRange: [orb.y + 6, orb.y - 12, orb.y + 6]
                      })
                    }
              ],
              opacity: reduceMotionEnabled ? 0.7 : 0.85
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 320,
    height: 320,
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
});
