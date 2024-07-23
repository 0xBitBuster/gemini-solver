import React from "react";
import { StatusBar } from "expo-status-bar";
import { Image, Text, TextInput, View, useWindowDimensions } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { icons, illustrations } from "../../constants";
import Markdown from "react-native-markdown-display";
import { ResizeMode, Video } from "expo-av";

const AnimatedVideo = Animated.createAnimatedComponent(Video);

const ListItem = ({ item, index, x, inputValue, setInputValue }) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const rnImageStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [100, 0, 100],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  }, [index, x]);

  const rnTextStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [100, 0, 100],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      x.value,
      [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  }, [index, x]);

  return (
    <>
      <StatusBar hidden />

      <View style={{ width: SCREEN_WIDTH }} className={`flex-1 ${item.input ? "justify-center" : "justify-around"}`}>
        {item.input ? (
          <>
            {item.video ? (
              <AnimatedVideo
                source={illustrations[item.video]}
                isMuted
                isLooping
                shouldPlay
                style={[
                  rnImageStyle,
                  {
                    alignSelf: "center",
                    width: item.input ? 200 : SCREEN_WIDTH * 0.9,
                    height: item.input ? 200 : SCREEN_WIDTH * 0.9,
                  },
                ]}
                resizeMode={ResizeMode.CONTAIN}
              />
            ) : item.image ? (
              <Animated.Image
                source={illustrations[item.image]}
                style={[
                  rnImageStyle,
                  { 
                    width: item.input ? 200 : SCREEN_WIDTH * 0.9, 
                    height: item.input ? 200 : SCREEN_WIDTH * 0.9 
                  },
                ]}
                className="self-center"
                resizeMode="contain"
              />
            ) : null}

            <Animated.View style={rnTextStyle} className="mx-6 mt-6 items-center">
              <Text className="font-psemibold text-3xl mb-0.5 text-white text-center">{item.text}</Text>
              <Text className="font-pbold text-3xl text-apple text-center">{item.highlightedText}</Text>
              <Markdown
                style={{
                  body: {
                    color: "#9ca3af",
                    fontFamily: "Poppins-Medium",
                    marginBottom: 16,
                    textAlign: "center",
                  },
                  textgroup: {
                    textAlign: "center",
                  },
                  link: {
                    color: "#F33D69",
                  },
                }}
              >
                {item.description}
              </Markdown>
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                className="w-full border border-white rounded-lg px-3 py-2 text-white placeholder:text-white"
                placeholder={item.input.placeholder}
                placeholderTextColor={"#999"}
                cursorColor="#ff013f"
                textStyle={{ fontFamily: "Poppins-Regular" }}
              />
            </Animated.View>
          </>
        ) : (
          <>
            {item.video ? (
              <AnimatedVideo
                source={illustrations[item.video]}
                isMuted
                isLooping
                shouldPlay
                style={[
                  rnImageStyle,
                  {
                    alignSelf: "center",
                    width: item.input ? 200 : SCREEN_WIDTH * 0.9,
                    height: item.input ? 200 : SCREEN_WIDTH * 0.9,
                  },
                ]}
                resizeMode={ResizeMode.CONTAIN}
              />
            ) : item.image ? (
              <Animated.Image
                source={illustrations[item.image]}
                style={[
                  rnImageStyle,
                  { 
                    width: item.input ? 200 : SCREEN_WIDTH * 0.9, 
                    height: item.input ? 200 : SCREEN_WIDTH * 0.9 
                  },
                ]}
                className="self-center"
                resizeMode="contain"
              />
            ) : null}

            <Animated.View style={rnTextStyle} className="ml-6">
              <View className="flex flex-row items-center">
                <Text className="font-psemibold self-end text-3xl mb-0.5 text-white">
                  {item.text}
                </Text>

                {item.textImage ? (
                  <Image 
                    source={icons[item.textImage]}
                    className="w-16 h-16 rotate-[65deg]"
                    resizeMode="contain"
                    tintColor="#fff"
                  />
                ) : null}
              </View>
              <Text className="font-pbold text-3xl text-apple">{item.highlightedText}</Text>
            </Animated.View>
          </>
        )}
      </View>
    </>
  );
};

export default React.memo(ListItem);
