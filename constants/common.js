const appLanguages = [
  { label: "English", value: "en" },
  { label: "Deutsch", value: "de" },
  { label: "Español", value: "es" },
  { label: "Français", value: "fr" },
  { label: "Русский", value: "ru" },
  { label: "Türkçe", value: "tr" },
  { label: "हिंदी", value: "hi" },
  { label: "日本語", value: "ja" },
  { label: "中文", value: "zh" },
  { label: "اللغة العربية", value: "ar" },
]

const defaultSettings = {
  locale: "en",
  model: "gemini-1.5-pro",
  geminiApiKey: "",
  explainLikeIAm: "",
  firstLaunch: true
}

export default {
  appLanguages,
  defaultSettings
}