import React, { forwardRef } from "react"
import { StyleSheet, Text, TextProps } from "react-native"
import { fonts } from "../constants/theme"

export const AppText = forwardRef<Text, TextProps>(function AppText({ style, ...props }, ref) {
  return <Text ref={ref} {...props} style={[styles.text, style]} />
})

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.body
  }
})
