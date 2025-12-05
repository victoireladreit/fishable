import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "fishable",
    slug: "fishable",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
        image: "./assets/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: "com.victoiredll.fishable",
        config: {
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
        }
    },
    android: {
        adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
        },
        edgeToEdgeEnabled: true,
        package: "com.victoiredll.fishable",
        config: {
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_API_KEY
            }
        }
    },
    web: {
        favicon: "./assets/favicon.png"
    },
    plugins: [
        "expo-font",
        "expo-location"
    ],
    extra: {
        eas: {
            projectId: "be133fe7-60e2-4ead-b1b4-04c1a0ead122"
        }
    }
});