import { Alert, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../constants";
import { Fold } from "react-native-animated-spinkit";
import { useEffect, useRef, useState } from "react";
import { fetchGeminiImagePrompt } from "../lib/gemini";
import Markdown from "react-native-markdown-display";
import BottomSheet from '@devvie/bottom-sheet';
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../context/GlobalProvider";

function ImageSolver({ image, open, onClose, prompt, loadingText = "Solving Problem..." }) {
	const { settings, setSettings } = useGlobalContext()
  const { t } = useTranslation()
	const [loading, setLoading] = useState(true);
	const [answer, setAnswer] = useState("");
	const [isImageScaled, setIsImageScaled] = useState(false);
	const selectModelModalRef = useRef(null)

	const processImage = async () => {
		if (!settings.geminiApiKey)
			return Alert.alert(t("common.error"), t("api.error.geminiApiKeyMissing"))

		setLoading(true);

		try {
			const aiResponse = await fetchGeminiImagePrompt({ image, prompt, model: settings.model, apiKey: settings.geminiApiKey }) || t("api.error.unableToHelp");
			setAnswer(aiResponse);
		} catch (error) {
      setAnswer(t("api.error.unknownError", { statusCode: error }))
		}

		setLoading(false);
	};

	useEffect(() => {
		if (image !== null) {
			processImage();
		}
	}, [image]);

	return (
		<Modal visible={open} animationType={"slide"} onRequestClose={onClose}>
			<SafeAreaView className="flex-1 bg-cloud p-4">
				<ScrollView>
					<View className="flex mb-4">
						<TouchableOpacity className="self-start" activeOpacity={0.6} onPress={onClose}>
							<Image source={icons.chevronLeft} className="w-6 h-6" resizeMode="contain" />
						</TouchableOpacity>
					</View>

					<View className="flex justify-center relative bg-slate-300 rounded-2xl mb-4">
						<TouchableOpacity activeOpacity={0.6} onPress={() => setIsImageScaled(!isImageScaled)}>
							<Image
								source={{
									uri: "data:image/png;base64," + image,
								}}
								className={`${isImageScaled ? "h-[50vh]" : "h-20"} rounded-2xl`}
								resizeMode="contain"
							/>
						</TouchableOpacity>
					</View>

					{loading ? (
						<View className="flex items-center mt-10">
							<Fold size={40} color="#ff013f" />
							<Text className="font-pmedium mt-5">{loadingText}</Text>
						</View>
					) : (
						<View className="bg-gray-100 rounded-2xl">
							<View className="flex flex-row justify-between items-center p-4">
                <TouchableOpacity className="flex flex-row" activeOpacity={0.6} onPress={() => selectModelModalRef.current?.open()}>
								  <Text className="font-psemibold text-primary">{t("api.geminiModels", { returnObjects: true }).find(m => m.value === settings.model)?.label}</Text>
									<Image source={icons.caretDown} className="w-2.5 h-2.5 ml-1.5 mt-[5px]" tintColor="#6b7280" />
                </TouchableOpacity>
								<TouchableOpacity className="flex flex-row items-center" activeOpacity={0.6} onPress={processImage}>
									<Text className="font-pmedium text-gray-500">{t("screens.imageSolver.askAgain")}</Text>
									<Image source={icons.rotateRight} className="w-4 h-4 ml-1.5" tintColor="#6b7280" />
								</TouchableOpacity>
							</View>
							<View className="relative bg-white rounded-2xl px-4 py-2">
								<Markdown
									style={{
										body: {
											color: "#222",
											fontFamily: "Poppins-Medium",
										},
										blockquote: {
											backgroundColor: "#fff",
										},
									}}
								>
									{answer}
								</Markdown>

								<View className="absolute top-4 -left-3 w-5 h-6 bg-apple rounded-full" />
							</View>
						</View>
					)}
				</ScrollView>
			</SafeAreaView>

      <BottomSheet ref={selectModelModalRef} style={{ backgroundColor: '#fff' }}>
				<View className="px-4">
          <Text className="text-2xl text-primary font-psemibold mb-3">
            {t("screens.imageSolver.model")}
          </Text>

					<View className="gap-y-2">
						{t("api.geminiModels", { returnObjects: true }).map(model => (
							<TouchableOpacity activeOpacity={0.6} key={model.value} onPress={() => setSettings(prev => ({ ...prev, model: model.value }))} className="flex flex-shrink flex-row items-center bg-[#fff5f6] p-4 rounded-xl">
								<View className={`w-4 h-4 ${settings.model === model.value ? `bg-[#fe023f]` : "bg-gray-300"} rounded-full border-2 border-white mr-4 shadow shadow-black outline-none`} />
								<View className="flex-1">
									<Text className="font-psemibold leading-4 text-[#f60440]">{model.label}</Text>
									<Text className="text-xs font-pregular text-[#eb325f]">{model.description}</Text>
								</View>
							</TouchableOpacity>
						))}
					</View>
        </View>
      </BottomSheet>
		</Modal>
	);
}

export default ImageSolver;
