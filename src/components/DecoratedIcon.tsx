import React from "react"
import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from "react-native"

type DecorationName = 
  | "home" 
  | "carrot" 
  | "check" 
  | "bookmark" 
  | "language" 
  | "retry" 
  | "setting" 
  | "speaker" 
  | "sprout" 
  | "treasure"

type Props = {
  name: DecorationName;
  size?: number;
  style?: ViewStyle;
}

const icons: Record<DecorationName, ImageSourcePropType> = {
  home: require("../assets/icons/home.png"),
  carrot: require("../assets/icons/carrot.png"),
  check: require("../assets/icons/check.png"),
  bookmark: require("../assets/icons/bookmark.png"),
  language: require("../assets/icons/language.png"),
  retry: require("../assets/icons/retry.png"),
  setting: require("../assets/icons/setting.png"),
  speaker: require("../assets/icons/speaker.png"),
  sprout: require("../assets/icons/sprout.png"),
  treasure: require("../assets/icons/treasure.png")
} as const

export function DecoratedIcon({ name, size = 24, style }: Props) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Image source={icons[name]} style={styles.image} resizeMode="contain" />
    </View>
  )
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%"
  }
})
