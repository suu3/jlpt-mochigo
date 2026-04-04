import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native";

type FoxType = "teaching" | "insight" | "good";

type Props = {
  type: FoxType;
  size?: number;
  style?: ViewStyle;
};

const foxImages: Record<FoxType, ImageSourcePropType> = {
  teaching: require("../assets/fox/fox_teaching.png"),
  insight: require("../assets/fox/fox_teaching.png"), // Fallback for missing asset
  good: require("../assets/fox/fox_good.png")
} as const;

export function FoxTeacher({ type, size = 120, style }: Props) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image 
        source={foxImages[type]} 
        style={styles.image} 
        resizeMode="contain" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
