const appJson = require("./app.json")

const androidAppId = process.env.ADMOB_ANDROID_APP_ID
const iosAppId = process.env.ADMOB_IOS_APP_ID
const userTrackingUsageDescription =
  process.env.ADMOB_IOS_USER_TRACKING_DESCRIPTION ||
  "This identifier will be used to deliver personalized ads to you."

function hasInstalledGoogleMobileAdsPlugin() {
  try {
    require.resolve("react-native-google-mobile-ads/package.json")
    return true
  } catch {
    return false
  }
}

module.exports = ({ config }) => {
  const baseConfig = config ?? appJson.expo
  const plugins = [...(baseConfig.plugins ?? [])]

  if ((androidAppId || iosAppId) && hasInstalledGoogleMobileAdsPlugin()) {
    plugins.push([
      "react-native-google-mobile-ads",
      {
        androidAppId,
        iosAppId,
        userTrackingUsageDescription
      }
    ])
  }

  return {
    ...baseConfig,
    plugins
  }
}
