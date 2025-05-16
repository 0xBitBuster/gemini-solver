import React from "react";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { icons } from "../../constants";
import { useTranslation } from "react-i18next";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Button = ({ currentIndex, length, flatListRef, onContinuePress, disabled }) => {
  const { t } = useTranslation()

  const rnBtnStyle = useAnimatedStyle(() => {
    return {
      width: currentIndex === length - 1 ? withSpring(140) : withSpring(60),
      height: 60,
      opacity: disabled ? withTiming(0.3) : withTiming(1)
    };
  }, [currentIndex, length, disabled]);

  const rnTextStyle = useAnimatedStyle(() => {
    return {
      opacity: currentIndex === length - 1 ? withTiming(1) : withTiming(0),
      transform: [
        {
          translateX: currentIndex === length - 1 ? withTiming(0) : withTiming(100),
        },
      ],
    };
  }, [currentIndex, length]);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: currentIndex !== length - 1 ? withTiming(1) : withTiming(0),
      transform: [
        {
          translateX: currentIndex !== length - 1 ? withTiming(0) : withTiming(100),
        },
      ],
    };
  }, [currentIndex, length]);

  const onPress = () => {
    if (currentIndex !== length - 1) {
      flatListRef?.current?.scrollToIndex({
        index: currentIndex + 1,
      });
    } else 
      onContinuePress();
  }

  return (
    <AnimatedPressable disabled={disabled} style={rnBtnStyle} className="flex flex-row px-6 py-4 rounded-full bg-apple items-center justify-center overflow-hidden" onPress={onPress}>
      <Animated.Text style={rnTextStyle} className="text-white absolute font-pmedium text-[17px]">
        {t("screens.onboarding.getStarted")}
      </Animated.Text>
      <Animated.Image
        source={icons.arrowRight}
        style={imageAnimatedStyle}
        className="w-6 h-6 absolute"
        tintColor="#fff"
        resizeMode="contain"
      />
    </AnimatedPressable>
  );
};

export default Button;

