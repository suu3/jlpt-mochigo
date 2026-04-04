import React from "react"
import { useFonts } from "expo-font"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { RootApp } from "./src/RootApp"
import { colors, fonts } from "./src/constants/theme"

export default function App() {
  const [fontsLoaded] = useFonts({
    [fonts.body]: require("./src/assets/fonts/PretendardJPVariable.ttf")
  })

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaProvider>
    )
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootApp />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  }
})
