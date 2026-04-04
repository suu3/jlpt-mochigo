import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View
} from "react-native";
import { colors } from "../constants/theme";

type CelebrationBurstProps = {
  active: boolean
  intensity?: "normal" | "high"
  delay?: number
};

const PARTICLES = [
  { x: -15, y: -25, size: 8, color: colors.primarySoft, rotation: 15, isCircle: true },
  { x: 15, y: -35, size: 6, color: colors.roseSoft, rotation: -20, isCircle: false },
  { x: 25, y: -15, size: 7, color: colors.accentSoft, rotation: 30, isCircle: true },
  { x: -10, y: -10, size: 9, color: colors.primary, rotation: -10, isCircle: false },
  { x: 35, y: 15, size: 6, color: colors.rose, rotation: 45, isCircle: true },
  { x: -20, y: 30, size: 7, color: colors.primaryWash, rotation: -30, isCircle: false },
  { x: 15, y: 35, size: 8, color: colors.gardenSoft, rotation: 60, isCircle: true },
  { x: -30, y: 15, size: 6, color: colors.amberSoft, rotation: -15, isCircle: false },
  { x: -25, y: -10, size: 7, color: colors.accent, rotation: 25, isCircle: true },
  { x: 10, y: -30, size: 5, color: colors.surfaceHighest, rotation: -40, isCircle: false },
  { x: -12, y: -45, size: 7, color: colors.primary, rotation: 10, isCircle: true },
  { x: 30, y: -35, size: 6, color: colors.accent, rotation: -10, isCircle: false },
  { x: 15, y: 20, size: 8, color: colors.roseSoft, rotation: 20, isCircle: true },
  { x: -35, y: -20, size: 6, color: colors.gardenSoft, rotation: -20, isCircle: false },
  { x: -5, y: 45, size: 7, color: colors.amberSoft, rotation: 35, isCircle: true },
  { x: 25, y: 5, size: 6, color: colors.primarySoft, rotation: -35, isCircle: false },
  { x: -25, y: 25, size: 5, color: colors.rose, rotation: 10, isCircle: true },
  { x: 35, y: -10, size: 7, color: colors.accent, rotation: -15, isCircle: false },
  { x: 5, y: -45, size: 6, color: colors.garden, rotation: 45, isCircle: true },
  { x: -40, y: 0, size: 8, color: colors.primary, rotation: -45, isCircle: false },
  { x: -20, y: -50, size: 6, color: colors.accentSoft, rotation: 20, isCircle: true },
  { x: 20, y: -50, size: 5, color: colors.roseSoft, rotation: -20, isCircle: false },
  { x: 40, y: 40, size: 7, color: colors.gardenSoft, rotation: 10, isCircle: true },
  { x: -40, y: 40, size: 6, color: colors.primaryWash, rotation: -10, isCircle: false },
  { x: 0, y: -25, size: 9, color: colors.success, rotation: 0, isCircle: true }
] as const;

const HIGH_INTENSITY_PARTICLES = [
  ...PARTICLES,
  { x: 0, y: -55, size: 10, color: colors.primary, rotation: 0, isCircle: true },
  { x: -50, y: -25, size: 8, color: colors.accent, rotation: -45, isCircle: false },
  { x: 50, y: -25, size: 9, color: colors.rose, rotation: 45, isCircle: true },
  { x: 0, y: 50, size: 8, color: colors.gardenSoft, rotation: 180, isCircle: false },
  { x: -30, y: -50, size: 7, color: colors.amberSoft, rotation: 30, isCircle: true },
  { x: 30, y: -50, size: 8, color: colors.primarySoft, rotation: -30, isCircle: false },
  { x: -55, y: 20, size: 6, color: colors.accentSoft, rotation: 15, isCircle: true },
  { x: 55, y: 20, size: 7, color: colors.roseSoft, rotation: -15, isCircle: false }
] as const;

export function CelebrationBurst({
  active,
  intensity = "normal",
  delay = 0
}: CelebrationBurstProps) {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const particles = intensity === "high" ? HIGH_INTENSITY_PARTICLES : PARTICLES;
  const particleProgress = useRef(
    HIGH_INTENSITY_PARTICLES.map(() => new Animated.Value(0))
  ).current;

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

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotionEnabled
    );

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!active || reduceMotionEnabled) {
      return;
    }

    const timer = setTimeout(() => {
      particleProgress.forEach((value) => value.setValue(0));

      Animated.stagger(
        15,
        particles.map((_, index) =>
          Animated.timing(particleProgress[index], {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.bezier(0.23, 1, 0.32, 1)),
            useNativeDriver: true
          })
        )
      ).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [
    active,
    particleProgress,
    reduceMotionEnabled,
    particles,
    delay
  ]);

  const staticDots = useMemo(
    () => particles.filter((_, index) => index % 2 === 0),
    [particles]
  );

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
                    borderRadius: particle.isCircle ? 999 : 2,
                    left: 96 + particle.x * 0.4,
                    top: 96 + particle.y * 0.4
                  }
                ]}
              />
            ))}
          </View>
        ) : (
          <>
            {(intensity === "high" ? HIGH_INTENSITY_PARTICLES : PARTICLES).map(
              (particle, index) => {
                const progress = particleProgress[index];
                if (!progress) return null;

                return (
                  <Animated.View
                    key={`particle-${index}`}
                    style={[
                      styles.particle,
                      {
                        backgroundColor: particle.color,
                        width: particle.size,
                        height: particle.size,
                        borderRadius: particle.isCircle ? 999 : 2,
                        opacity: progress.interpolate({
                          inputRange: [0, 0.1, 0.8, 1],
                          outputRange: [0, 1, 1, 0]
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
                              inputRange: [0, 0.2, 1],
                              outputRange: [0.5, 1.2, 0.4]
                            })
                          },
                          {
                            rotate: progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0deg", `${particle.rotation * 4}deg`]
                            })
                          }
                        ]
                      }
                    ]}
                  />
                );
              }
            )}
          </>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  particle: {
    position: "absolute"
  },
  staticWrap: {
    ...StyleSheet.absoluteFillObject
  },
  staticDot: {
    position: "absolute",
    opacity: 0.9
  }
});
