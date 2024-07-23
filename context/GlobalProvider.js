import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18next from "i18next";
import * as Localization from "expo-localization"
import { common } from "../constants";

export const useGlobalContext = () => useContext(GlobalContext);
const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
  const [settings, setSettings] = useState(null)

  const updateLocale = (locale) => {
    i18next.changeLanguage(locale);
    setSettings(prev => ({ ...prev, explainLikeIAm: "", locale }));
  };

  const saveSettings = async() => {
    await AsyncStorage.setItem("settings", JSON.stringify(settings));
  }

	const loadSettings = async () => {
    const storedSettings = await AsyncStorage.getItem("settings");

    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      const locale = Localization.getLocales()?.[0]?.languageCode;
      setSettings({ ...common.defaultSettings, locale });
    }
	};

  useEffect(() => {
    if (!settings)
      loadSettings();
    else
      saveSettings();
  }, [settings])

  return (
    <GlobalContext.Provider
      value={{
        updateLocale,
        setSettings,
        settings
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
