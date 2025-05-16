import { useEffect, useState } from "react";
import { SafeAreaView, View } from "react-native";
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import ListItem from "../components/OnBoarding/ListItem";
import PaginationElement from "../components/OnBoarding/PaginationElement";
import Button from "../components/OnBoarding/Button";
import * as NavigationBar from 'expo-navigation-bar';
import { useGlobalContext } from "../context/GlobalProvider";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export default function OnBoarding() {
  const { setSettings } = useGlobalContext()
  const { t } = useTranslation()
  const x = useSharedValue(0);
  const [flatListIndex, setFlatListIndex] = useState(0)
  const flatListRef = useAnimatedRef();
  const pages = t("screens.onboarding.pages", { returnObjects: true })

  // Convert page input values to object, e.g. ["geminiApiKey"] => { geminiApiKey: "" }
  const [pageInputValues, setPageInputValues] = useState(pages.reduce((result, item) => {
    if (item?.input?.name)
        result[item.input.name] = ""

    return result
  }, {}))

  const onViewableItemsChanged = ({ viewableItems }) => {
    setFlatListIndex(viewableItems[0]?.index ?? 0);
  };

  const scrollHandle = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const onContinuePress = () => {
    setSettings(prev => ({ ...prev, firstLaunch: false, geminiApiKey: pageInputValues.geminiApiKey || "" }))
    router.replace("/scan")
  }

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync('#000');
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Animated.FlatList
        ref={flatListRef}
        onScroll={scrollHandle}
        horizontal
        scrollEventThrottle={16}
        pagingEnabled={true}
        data={pages}
        keyExtractor={(_, index) => index.toString()}
        bounces={false}
        renderItem={({ item, index}) => (
          item.input ? <ListItem item={item} index={index} x={x} inputValue={pageInputValues[item.input.name]} setInputValue={(e) => setPageInputValues(prev => ({ ...prev, [item.input.name]: e.trim() }))} /> 
                     : <ListItem item={item} index={index} x={x} />
        )}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      <View className="flex-row justify-between items-center px-5">
        <PaginationElement length={pages.length} x={x} />
        <Button 
          currentIndex={flatListIndex} 
          length={pages.length} 
          flatListRef={flatListRef}  
          disabled={pages[flatListIndex]?.input ? pageInputValues[pages[flatListIndex].input.name]?.trim() === "" : false}
          onContinuePress={onContinuePress}
        />
      </View>
    </SafeAreaView>
  );
}
