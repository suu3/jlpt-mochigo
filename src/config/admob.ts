export const admobConfig = {
  // Expo will inline EXPO_PUBLIC_ variables into the JS bundle.
  bannerUnitId: process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID ?? ""
} as const;

export function hasProductionBannerUnitId() {
  return admobConfig.bannerUnitId.trim().length > 0;
}
