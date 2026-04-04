import React, { useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";

type Props = PressableProps & {
  children: React.ReactNode;
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
};

export function ScaleInteract({
  children,
  activeScale = 0.97,
  style,
  ...pressableProps
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: activeScale,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100
    }).start();
  };

  const visualStyle = (StyleSheet.flatten(style) || {}) as ViewStyle;
  const { flex, ...remainingStyle } = visualStyle;

  return (
    <Pressable
      {...pressableProps}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex }}
    >
      <Animated.View style={[remainingStyle, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
