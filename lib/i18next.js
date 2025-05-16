import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { en, de, ar, es, fr, hi, ja, ru, tr, zh } from "../locales";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/GlobalProvider";

const languageResources = {
  en: { translation: en },
  de: { translation: de },
  ar: { translation: ar },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
  ja: { translation: ja },
  ru: { translation: ru },
  tr: { translation: tr },
  zh: { translation: zh }
};

const useI18next = () => {
  const { settings } = useGlobalContext()
  const [languageLoaded, setLanguageLoaded] = useState(false);

  useEffect(() => {
    if (settings?.locale && !languageLoaded) {
      i18next.use(initReactI18next).init({
        compatibilityJSON: "v3",
        lng: settings.locale,
        fallbackLng: "en",
        resources: languageResources,
      });
  
      setLanguageLoaded(true);
    }
  }, [settings]);

	return { languageLoaded }
};

export default useI18next;
