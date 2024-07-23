import { useState } from "react";
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { common, icons } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Application from 'expo-application';
import { Link } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../context/GlobalProvider";

export default function Settings({ open, onClose }) { 
  const { t } = useTranslation()
  const { settings, setSettings, updateLocale } = useGlobalContext()
  const [openedPicker, setOpenedPicker] = useState("")

  return (
    <Modal visible={open} animationType={"slide"} onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-cloud p-4">
        <View className="flex flex-row mb-4">
          <TouchableOpacity className="self-start" activeOpacity={0.6} onPress={onClose}>
            <Image source={icons.chevronLeft} className="w-6 h-6" resizeMode="contain" />
          </TouchableOpacity>
          <Text className="self-center mx-auto pr-6 text-lg font-pmedium">
            {t("screens.settings.title")}
          </Text>
        </View>
        <View className="mb-4">
          <Text className="mb-1 font-pmedium">{t("screens.settings.language")}</Text>
          <DropDownPicker 
            open={openedPicker === "language"}
            setOpen={(value) => setOpenedPicker(value ? "language" : "")}
            value={settings.locale}
            setValue={(value) => updateLocale(value())}
            items={common.appLanguages}
            placeholder={common.appLanguages.find(l => l.value === settings.locale)?.label}
            containerStyle={{ zIndex: 100 }}
            dropDownContainerStyle={{
              position: 'relative',
              top: 0
          }}
          listMode="SCROLLVIEW"
            textStyle={{ fontFamily: "Poppins-Regular", lineHeight: 20 }}
          />
        </View>
        <View className="mb-4">
          <Text className="mb-1 font-pmedium">{t("screens.settings.model")}</Text>
          <DropDownPicker 
            open={openedPicker === "model"}
            setOpen={(value) => setOpenedPicker(value ? "model" : "")}
            value={settings.model}
            setValue={(value) => setSettings(prev => ({ ...prev, model: value() }))}
            items={t("api.geminiModels", { returnObjects: true })}
            containerStyle={{ zIndex: 90 }}
            textStyle={{ fontFamily: "Poppins-Regular", lineHeight: 20 }}
          />
        </View>
        <View className="mb-4">
          <Text className="mb-1 font-pmedium">{t("screens.settings.explainLikeIAm")}</Text>
          <DropDownPicker 
            open={openedPicker === "explainLikeIAm"}
            setOpen={(value) => setOpenedPicker(value ? "explainLikeIAm" : "")}
            value={settings.explainLikeIAm}
            setValue={(value) => setSettings(prev => ({ ...prev, explainLikeIAm: value() }))}
            items={t("screens.settings.explainLikeIAmOptions", { returnObjects: true })}
            containerStyle={{ zIndex: 80 }}
            textStyle={{ fontFamily: "Poppins-Regular", lineHeight: 20 }}
          />
        </View>
        <View className="mb-4">
          <Text className="mb-1 font-pmedium">{t("screens.settings.geminiApiKey")}</Text>
          <TextInput 
            value={settings.geminiApiKey} 
            onChangeText={(e) => setSettings(prev => ({ ...prev, geminiApiKey: e.trim() }))} 
            className="border rounded-lg px-3 py-1" 
            placeholder={t("screens.settings.geminiApiKeyInputPlaceholder")} 
            cursorColor="#222" 
            spellCheck={false}
            autoCorrect={false}
            textStyle={{ fontFamily: "Poppins-Regular" }}
          />
          <Link href={"https://ai.google.dev/gemini-api/docs/api-key"} className="mt-1 ml-1">
            <View className="flex flex-row items-center">
              <Text className="text-gray-500 text-xs italic">{t("screens.settings.getGeminiApiKey")}</Text>
              <Image 
                source={icons.link}
                className="w-2.5 h-2.5 ml-1"
                tintColor="#6b7280"
              />
            </View>
          </Link>
        </View>

        <View className="mt-auto items-center">
          <Text className="text-gray-400">{t("screens.settings.version", { version: Application.nativeApplicationVersion })}</Text>
          <Text className="text-gray-400">{t("screens.settings.footer")} <Link href="https://github.com/0xBitBuster" className="underline">{t("screens.settings.author")}</Link></Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
