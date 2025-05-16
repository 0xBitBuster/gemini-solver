import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { icons, illustrations } from "../../constants";
import ImageCropper from "../../components/ImageCropper";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import ImageSolver from "../../components/ImageSolver";
import Calculator from "../../components/Calculator";
import AnimationTabBar from "../../components/AnimationTabBar";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from "react-native-dropdown-picker";
import Settings from "../../components/Settings";
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../../context/GlobalProvider";

const Scan = () => {
  const { settings } = useGlobalContext()
  const { t } = useTranslation();
  const modes = t("screens.scan.modes", { returnObjects: true });
  const worldLanguages = t("localization.worldLanguages", { returnObjects: true });
  const [image, setImage] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropperLoading, setCropperLoading] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mode, setMode] = useState(modes[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(worldLanguages[18]?.value);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted
    return (
      <SafeAreaView className="relative bg-cloud flex flex-1 justify-center items-center px-8">
        <TouchableOpacity className="absolute top-10 right-0 p-4" activeOpacity={0.6} onPress={() => setIsSettingsOpen(true)}>
          <Image source={icons.settings} className="w-7 h-7" tintColor={"#888"} />
        </TouchableOpacity>

        <Image source={illustrations.photos} className="w-36 h-36" resizeMode="contain" />
        <Text className="font-pmedium text-xl mb-1 text-center">{t("permissions.camera")}</Text>
        <Text className="font-pregular mb-4 text-center">{t("permissions.cameraDescription")}</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={requestPermission} className="px-4 py-2 bg-[#222] mb-10 rounded-lg">
          <Text className="text-white font-pmedium">{t("permissions.grantPermission")}</Text>
        </TouchableOpacity>

        <Settings open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePicture = async () => {
    const photo = await cameraRef.current.takePictureAsync({ skipProcessing: true });
    setImage(photo.uri);
  };

  const handleCropImage = async (image, crop) => {
    setCropperLoading(true)

    const result = await ImageManipulator.manipulateAsync(image, [{ crop }], { format: "jpeg", base64: true });

    setCropperLoading(false)
    setCroppedImage(result.base64);
  };

  return (
    <>
      <SafeAreaView className="bg-cloud h-full pb-10">
        <CameraView ref={cameraRef} focusable className="relative flex-1" facing="back" enableTorch={torch && !image}>
          <View className="absolute top-0 left-0 right-0 m-2 flex flex-row items-center justify-between">
            <TouchableOpacity className="p-4" activeOpacity={0.6} onPress={() => setIsCalculatorOpen(true)}>
              <Image source={icons.calculator} className="w-7 h-7" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity className="p-4" activeOpacity={0.6} onPress={() => setIsSettingsOpen(true)}>
              <Image source={icons.settings} className="w-7 h-7" />
            </TouchableOpacity>
          </View>
          <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center">
            <View className="absolute w-5 h-0.5 rounded-xl bg-white/90" />
            <View className="absolute w-5 h-0.5 rounded-xl bg-white/90 rotate-90" />
          </View>
          <View className="absolute bottom-0 left-0 right-0 h-72">
            <LinearGradient
              colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.6)"]}
              style={{
                flex: 1,
                justifyContent: "flex-end",
              }}
            />
          </View>
          <View className="absolute bottom-28 left-0 right-0 mx-auto max-w-2xl">
            <AnimationTabBar
              data={modes}
              onItemChange={(item) => setMode(item)}
              itemsPerView={t("screens.scan.modesPerView")}
              itemHeight={70}
            />
          </View>
          <View className="absolute bottom-10 flex flex-row mx-10 items-end max-w-md self-center">
            <View className="flex flex-1 flex-row items-center justify-evenly">
              <TouchableOpacity className="bg-black/25 p-4 rounded-full" onPress={pickImage} activeOpacity={0.6}>
                <Image source={icons.gallery} className="w-5 h-5" />
              </TouchableOpacity>

              <TouchableOpacity onPress={takePicture} activeOpacity={0.7}>
                <View className="bg-transparent rounded-full w-[75px] h-[75px] border-[3.5px] border-white flex items-center justify-center p-1">
                  <View
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ backgroundColor: mode.background }}
                  >
                    <Image
                      source={icons[mode.icon]}
                      className="w-6 h-6 mb-0.5"
                      resizeMode="contain"
                      tintColor={mode.tintColor}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-black/25 p-4 rounded-full"
                onPress={() => setTorch(!torch)}
                activeOpacity={0.6}
              >
                <Image source={icons.flashlight} className="w-5 h-5" tintColor={torch ? "#fecd54" : "#fff"} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </SafeAreaView>

      <ImageCropper
        open={image !== null && mode.value === "homework"}
        image={image}
        onClose={() => setImage(null)}
        onCropImage={handleCropImage}
        text={t("screens.scan.cropQuestion")}
        croppedByDefault={true}
        loading={cropperLoading}
      />

      <ImageCropper
        open={image !== null && mode.value === "translate"}
        image={image}
        onClose={() => setImage(null)}
        onCropImage={handleCropImage}
        text={t("screens.scan.cropTranslation")}
        croppedByDefault={true}
        loading={cropperLoading}
        customControl={
          <TouchableOpacity
            onPress={() => setLanguagePickerOpen(true)}
            activeOpacity={0.8}
            className="flex flex-row mx-auto justify-center items-center bg-[#202328] rounded-full pt-0.5 px-4 h-8 mb-4"
          >
            <Text className="text-sm font-pregular text-gray-300 pb-[3px] -mr-2">{t("screens.scan.translateTo")} </Text>
            <View
              style={{
                width: worldLanguages.find((l) => l.value === selectedLanguage)?.label?.length > 10 ? 200 : 120,
              }}
            >
              <DropDownPicker
                open={languagePickerOpen}
                setOpen={setLanguagePickerOpen}
                value={selectedLanguage}
                setValue={setSelectedLanguage}
                items={worldLanguages}
                searchable
                searchPlaceholder={t("screens.scan.languageSearchPlaceholder")}
                listMode="MODAL"
                ListEmptyComponent={() => (
                  <View className="flex-1 flex justify-center items-center">
                    <Text>{t("screens.scan.noLanguageFound")}</Text>
                  </View>
                )}
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                style={{
                  borderWidth: 0,
                  backgroundColor: "transparent",
                }}
                textStyle={{
                  color: languagePickerOpen ? "#222" : "#fff",
                  fontWeight: "500",
                  fontFamily: languagePickerOpen ? "Poppins-Medium" : "Poppins-SemiBold",
                }}
                arrowIconStyle={{
                  tintColor: "#fff",
                  width: 15,
                  height: 15,
                }}
              />
            </View>
          </TouchableOpacity>
        }
      />

      <ImageSolver
        open={croppedImage !== null}
        image={croppedImage}
        prompt={
          mode.value === "homework"
            ? (settings.explainLikeIAm ? t("api.prompts.homework") : t("api.prompts.homeworkExplainLikeIAm", { ageGroup: settings.explainLikeIAm }))
            : mode.value === "translate"
            ? t("api.prompts.translate", { language: selectedLanguage })
            : ""
        }
        loadingText={
          mode.value === "homework"
            ? t("screens.imageSolver.solvingProblem")
            : mode.value === "translate"
            ? t("screens.imageSolver.translating")
            : ""
        }
        onClose={() => {
          setImage(null);
          setCroppedImage(null);
        }}
      />

      <Calculator open={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
      <Settings open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

export default Scan;
