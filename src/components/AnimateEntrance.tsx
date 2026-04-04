import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { animations } from "../constants/theme";

type Props = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  type?: "fade" | "slide" | "scale" | "lift";
};

export function AnimateEntrance({
  children,
  delay = 0,
  duration = animations.duration.long,
  type = "lift"
}: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true
    }).start();
  }, [delay, duration, progress]);

  const style = {
    opacity: progress,
    transform: [
      {
        translateY: type === "lift" ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0]
        }) : 0
      },
      {
        scale: type === "scale" ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.94, 1]
        }) : 1
      },
      {
        translateX: type === "slide" ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        }) : 0
      }
    ]
  };

  return (
    <Animated.View style={style}>
      {children}
    </Animated.View>
  );
}
