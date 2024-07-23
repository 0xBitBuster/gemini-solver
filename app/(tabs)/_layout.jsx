import { View, Text, Image } from "react-native";
import { Tabs } from "expo-router";
import { icons } from "../../constants";
import { useTranslation } from "react-i18next";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-1 w-28">
      <Image source={icon} resizeMode="contain" tintColor={color} className="w-6 h-6" />
      <Text numberOfLines={1} className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`} style={{ color }}>
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const { t } = useTranslation()

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#222",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            height: 60,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20
          }
        }}
      >
        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan",
            tabBarStyle: {
              height: 60,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              position: "absolute"
            },
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.camera} 
                color={color} 
                focused={focused} 
                name={t("tabs.scan")}
              />
            )
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Chat",
            headerShown: false,
            tabBarHideOnKeyboard: true,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon={icons.chat} 
                color={color} 
                focused={focused} 
                name={t("tabs.chat")}
              />
            )
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
