import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, Image, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRef, useState } from "react";
import { icons } from "../../constants";
import { fetchGeminiPrompt } from "../../lib/gemini";
import { Flow } from 'react-native-animated-spinkit'
import GradientText from "../../components/GradientText";
import Markdown from 'react-native-markdown-display';
import { useTranslation } from "react-i18next";
import { useGlobalContext } from "../../context/GlobalProvider";

const Chat = () => {
  const { t } = useTranslation()
  const { settings } = useGlobalContext()
  const flatListRef = useRef();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [waitingOnResponse, setWaitingOnResponse] = useState(false)

  const sendMessage = async() => {
    if (!settings.geminiApiKey)
			return Alert.alert(t("common.error"), t("api.error.geminiApiKeyMissing"))

    const text = input.trim();
    const latestMessages = [...messages, { text, isAiResponse: false }]; // Important: Possible race condition if we try to access plain messages later on

    appendMessage(text, false, false)
    setInput("");
    setWaitingOnResponse(true)

    try {
      setMessages(prev => [
        ...prev,
        { 
          isAiResponse: true, 
          loading: true 
        },
      ]);

      // Convert messages into gemini chat format to have knowledge about previous chats
      const messageContents = [{
        role: "model",
        parts: [{
          text: t("api.prompts.chatInitialMessage")
        }]
      }]
      for (let msg of latestMessages) {
        messageContents.push({
          role: msg.isAiResponse ? "model" : "user",
          parts: [{
            text: msg.text
          }]
        })
      }

      const aiResponse = await fetchGeminiPrompt({ messageContents, model: settings.model, apiKey: settings.geminiApiKey }) || t("api.error.unableToHelp");
      appendMessage(aiResponse, true, true)

    } catch (error) {
      appendMessage(t("api.error.unknownError", { statusCode: error }), true, true)
    }

    setWaitingOnResponse(false)
  };

  const appendMessage = (text, isAiResponse, removeLastMessage) => {
    setMessages(prev => [
      ...(removeLastMessage ? prev.slice(0, prev.length - 1) : prev), 
      {
        text,
        isAiResponse
      }
    ]);
  }

  return (
    <>
      <StatusBar backgroundColor="#f8f8f8" />

      <SafeAreaView className="bg-cloud h-full pt-4">
        <FlatList
          ref={flatListRef}
          data={messages}
          className="px-4"
          keyExtractor={(_, index) => index.toString()}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          renderItem={({ item: msg }) => (
            <View className={`rounded-t-xl mb-4 px-4 ${msg.isAiResponse ? "bg-blue-500 rounded-br-xl self-start" : "self-end bg-gray-300 rounded-bl-xl"}`}>
              {msg.loading ? (
                <View className="flex items-center justify-center py-4">
                  <Flow size={24} color="#fff" />
                </View>
              ) : (
                <Markdown 
                  style={{ 
                    body: {
                      color: msg.isAiResponse ? "#fff" : "#222",
                      fontFamily: "Poppins-Medium",
                    },
                    blockquote: {
                      backgroundColor: msg.isAiResponse ? "#3B71CA" : "#d1d5db"
                    },
                    fence: {
                      backgroundColor: msg.isAiResponse ? "#3b82f6" : "#d1d5db",
                      borderWidth: 0
                    },
                    code_inline: {
                      backgroundColor: msg.isAiResponse ? "#3b82f6" : "#d1d5db"
                    }
                  }}
                >
                  {msg.text}
                </Markdown>
              )}
            </View>
          )}
          ListEmptyComponent={() => (
            <View className="mt-10 flex items-center">
              <GradientText gradientColors={["#3B71CA", "#DC4C64"]} className="text-3xl font-pmedium">
                {t("screens.chat.emptyGreeting")}
              </GradientText>
              
              <Text className="text-2xl font-pmedium text-primary text-center">
                {t("screens.chat.emptyQuestion")}
              </Text>
            </View>
          )}
        />

        <View className="relative m-4">
          <View className="flex flex-row">
            <TextInput className="flex-1 rounded-l-full bg-gray-200 py-3 px-4 font-pmedium max-h-16" placeholder={t("screens.chat.inputPlaceholder")} placeholderTextColor="#6b7280" value={input} onChangeText={(e) => setInput(e)} cursorColor="#3B71CA" selectionColor="#3B71CA" multiline />

            <View className="flex flex-row items-center flex-0 rounded-r-full bg-gray-200">
              <TouchableOpacity activeOpacity={0.6} className={`self-stretch pr-5 ${input.trim().length === 0 || waitingOnResponse ? "opacity-50" : ""}`} disabled={input.trim().length === 0 || waitingOnResponse} onPress={sendMessage}>
                <Image source={icons.send} className="w-6 h-6 my-auto" alt="Send" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Chat;
