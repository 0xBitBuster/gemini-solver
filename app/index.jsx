import { router, useRootNavigationState } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";
import { useEffect } from "react";
import { Image, View } from "react-native";
import splashScreen from "../assets/splash.png"

function index() {
  const { settings } = useGlobalContext()
  const navigationState = useRootNavigationState();
  
  useEffect(() => {
    if (!navigationState?.key) return;

    if (settings !== null) {
      if (settings.firstLaunch)
        router.replace("/onboarding")
      else
        router.replace("/scan")
    }
  }, [settings, navigationState?.key])

  return (
    <View className="flex-1 flex justify-center items-center">
      <Image 
        source={splashScreen}
        className="w-full h-full max-w-5xl"
        resizeMode="contain"
      />
    </View>
  )
}

export default index;
