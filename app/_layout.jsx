import { SplashScreen, Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { useFonts } from "expo-font"
import { useEffect } from "react";

import GlobalProvider, { useGlobalContext } from "../context/GlobalProvider"
import useI18next from "../lib/i18next";

NativeWindStyleSheet.setOutput({
  default: "native",
});

SplashScreen.preventAutoHideAsync();

function App() {
  const { settings } = useGlobalContext();
  const { languageLoaded } = useI18next();
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf")
  })
  const appReady = fontsLoaded && languageLoaded && settings !== null;

  useEffect(() => {
    if (fontError) throw fontError;
    if (appReady) SplashScreen.hideAsync();
  }, [fontError, appReady, settings])

  if (!appReady) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GlobalProvider>
      <App />
    </GlobalProvider>
  )
}
