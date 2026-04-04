import React from "react"
import { StyleSheet, View } from "react-native"
import { admobConfig, hasProductionBannerUnitId } from "../config/admob"
import { borderWidths, colors, radii, spacing } from "../constants/theme"

type MobileAdsModule = {
  BannerAd: React.ComponentType<{
    unitId: string;
    size: string;
  }>;
  BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: string;
  };
  TestIds: {
    ADAPTIVE_BANNER?: string;
    BANNER: string;
  };
}

import Constants, { ExecutionEnvironment } from "expo-constants"

function getMobileAdsModule(): MobileAdsModule | null {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return null
  }
  
  try {
    return require("react-native-google-mobile-ads") as MobileAdsModule
  } catch {
    return null
  }
}

export function AdBanner() {
  const mobileAds = getMobileAdsModule()

  if (!mobileAds) {
    return null
  }

  const { BannerAd, BannerAdSize, TestIds } = mobileAds
  const unitId = __DEV__ ? TestIds.ADAPTIVE_BANNER ?? TestIds.BANNER : hasProductionBannerUnitId() ? admobConfig.bannerUnitId : ""

  if (!unitId) {
    return null
  }

  return (
    <View style={styles.shell}>
      <View style={styles.frame}>
        <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background
  },
  frame: {
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.surface
  }
})
