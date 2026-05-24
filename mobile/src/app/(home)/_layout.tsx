import React from "react";
import { Tabs } from "expo-router";
import { View, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { i18n } from "../../../locales/i18n";

// --- CUSTOM FLOATING TAB BAR ---
function CustomBottomTabBar({ state, descriptors, navigation }) {
  return (
    <View
      className="absolute bottom-8 self-center flex-row bg-white p-1.5 rounded-[30px] items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        // 🔴 BULLETPROOF FIX: Force-ignore any routes matching change-password OR shifts
        if (
          options.href === null || 
          route.name.includes("change-password") ||
          route.name.includes("shifts") // <-- Added this condition
        ) {
          return null;
        }

        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            className={`flex-row items-center justify-center px-6 py-3 rounded-[25px] ${
              isFocused ? "bg-[#F3F0FF]" : "bg-transparent"
            }`}
          >
            <View className="items-center">
              {route.name === "index" || route.name.includes("dashboard") ? (
                <MaterialCommunityIcons
                  name="view-dashboard"
                  size={26}
                  color={isFocused ? "#311B92" : "#6B7280"}
                  className="mb-0.5"
                />
              ) : (
                <Ionicons
                  name={isFocused ? "settings" : "settings-outline"}
                  size={24}
                  color={isFocused ? "#311B92" : "#6B7280"}
                  className="mb-0.5"
                />
              )}
              <Text
                className={`text-[12px] font-bold ${
                  isFocused ? "text-[#311B92]" : "text-[#6B7280]"
                }`}
              >
                {i18n.t(label)}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// --- MAIN HOME LAYOUT ---
export default function HomeLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false, 
      }}
    >
      {/* Visible Tabs */}
      <Tabs.Screen
        name="index"
        options={{ title: "DASHBOARD" }}
      />

      <Tabs.Screen
        name="settings"
        options={{ title: "SETTINGS" }}
      />

      {/* Hidden Tabs */}
      <Tabs.Screen
        name="change-password/index"
        options={{ href: null, headerShown: false }}
      />
      
      <Tabs.Screen
        name="change-password/layout"
        options={{ href: null, headerShown: false }}
      />

      <Tabs.Screen
        name="shifts/[sessionId]/[sessionRoomId]/[subjectId]"
        options={{ href: null, headerShown: false }}
      />

      <Tabs.Screen
        name="shifts/[id]/index"
        options={{ href: null, headerShown: false }} 
      />
    </Tabs>
  );
}