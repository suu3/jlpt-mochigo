const appJson = require("./app.json");

const androidAppId = process.env.ADMOB_ANDROID_APP_ID;
const iosAppId = process.env.ADMOB_IOS_APP_ID;
const userTrackingUsageDescription =
  process.env.ADMOB_IOS_USER_TRACKING_DESCRIPTION ||
  "This identifier will be used to deliver personalized ads to you.";

function hasInstalledGoogleMobileAdsPlugin() {
  try {
    require.resolve("react-native-google-mobile-ads/package.json");
    return true;
  } catch {
    return false;
  }
}

function isGoogleMobileAdsPlugin(plugin) {
  if (typeof plugin === "string") {
    return plugin === "react-native-google-mobile-ads";
  }

  return Array.isArray(plugin) && plugin[0] === "react-native-google-mobile-ads";
}

module.exports = ({ config }) => {
  const baseConfig = config ?? appJson.expo;
  const existingPlugins = baseConfig.plugins ?? [];
  const plugins = existingPlugins.filter((plugin) => !isGoogleMobileAdsPlugin(plugin));
  const existingGoogleMobileAdsPlugin = existingPlugins.find(isGoogleMobileAdsPlugin);
  const existingGoogleMobileAdsOptions =
    Array.isArray(existingGoogleMobileAdsPlugin) && typeof existingGoogleMobileAdsPlugin[1] === "object"
      ? existingGoogleMobileAdsPlugin[1]
      : null;

  if (hasInstalledGoogleMobileAdsPlugin()) {
    plugins.push([
      "react-native-google-mobile-ads",
      {
        ...existingGoogleMobileAdsOptions,
        ...(androidAppId ? { androidAppId } : {}),
        ...(iosAppId ? { iosAppId } : {}),
        userTrackingUsageDescription
      }
    ]);
  }

  return {
    ...baseConfig,
    plugins
  };
};
