import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  I18nManager,
  DevSettings,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { i18n } from "../../../locales/i18n";
import { useAuth } from "../../../providers/AuthProvider";

export default function SettingsScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.locale);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

   const { user, logout, token } = useAuth();

  const handleChangeLanguage = async (newLang) => {
    if (newLang === selectedLanguage) return;

    setSelectedLanguage(newLang);

    const isRTL = newLang === "ar";

    await AsyncStorage.setItem("APP_LANGUAGE", newLang);
    await AsyncStorage.setItem("APP_RTL", isRTL ? "1" : "0");

    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    try {
      await Updates.reloadAsync();
    } catch {
      // Fallback for Expo Go
      DevSettings.reload();
    }
  };

  // --- LOGOUT HANDLER ---
  

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 140 }} // Adjusted padding to give the logout button extra breathing room
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER SECTION --- */}
        <View className="mb-6">
          <Text className="text-[32px] font-extrabold text-[#1F2937] tracking-tight mb-1">
            {i18n.t("Settings")}
          </Text>
          <Text className="text-[14px] font-medium text-[#6B7280]">
            {i18n.t("Manage your archive administration preferences")}
          </Text>
        </View>

        {/* --- PROFILE BANNER CARD --- */}
        <View
          className="bg-white rounded-[24px] p-5 flex-row items-center justify-between border border-[#E5E7EB] mb-8"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center flex-1">
            <View className="w-14 h-14 bg-[#EEEBFF] rounded-full items-center justify-center mr-4">
              <Text className="text-[#311B92] text-[18px] font-black">{user.firstName.charAt(0) + user.lastName.charAt(0)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[18px] font-bold text-[#1F2937] mb-1">
                Dr. {user.firstName + " " + user.lastName}
              </Text>
              <View className="bg-[#EEEBFF] self-start px-2.5 py-0.5 rounded-md">
                <Text className="text-[#311B92] text-[11px] font-bold tracking-wide uppercase">
                  {i18n.t("Lead Surveillant")}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity className="p-2">
            <Feather name="edit-2" size={20} color="#311B92" />
          </TouchableOpacity>
        </View>

        {/* --- LANGUAGE SETTINGS SECTION --- */}
        <View className="flex-row items-center mb-4">
          <MaterialIcons name="translate" size={20} color="#311B92" />
          <Text className="text-[14px] font-black text-[#6B7280] uppercase tracking-wider ml-2">
            {i18n.t("Language Settings")}
          </Text>
        </View>

        <View className="bg-white rounded-[24px] p-4 border border-[#E5E7EB] mb-6">
          {/* English Option */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleChangeLanguage("en")}
            className={`flex-row items-center justify-between p-4 rounded-[16px] mb-2 border ${
              selectedLanguage === "en"
                ? "bg-[#F3F0FF] border-[#311B92]"
                : "bg-transparent border-transparent"
            }`}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-[#F3F4F6] rounded-full items-center justify-center mr-3 border border-[#E5E7EB]">
                <Text className="text-[11px] font-bold text-[#4B5563]">EN</Text>
              </View>
              <Text className="text-[16px] font-bold text-[#1F2937]">
                {i18n.t("English (US)")}
              </Text>
            </View>
            {selectedLanguage === "en" && (
              <Ionicons name="checkmark-circle" size={22} color="#311B92" />
            )}
          </TouchableOpacity>

          {/* Arabic Option */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleChangeLanguage("ar")}
            className={`p-4 rounded-[16px] border ${
              selectedLanguage === "ar"
                ? "bg-[#F3F0FF] border-[#311B92]"
                : "bg-transparent border-transparent"
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-[#F3F4F6] rounded-full items-center justify-center mr-3 border border-[#E5E7EB]">
                  <Text className="text-[11px] font-bold text-[#4B5563]">AR</Text>
                </View>
                <Text className="text-[16px] font-bold text-[#1F2937]">
                  {i18n.t("Arabic")}
                </Text>
              </View>
              {selectedLanguage === "ar" ? (
                <Ionicons name="checkmark-circle" size={22} color="#311B92" />
              ) : (
                <View className="w-5 h-5 rounded-full border-2 border-[#D1D5DB]" />
              )}
            </View>
            <Text className="text-[12px] font-medium text-[#9CA3AF] text-left leading-relaxed mt-1 px-1">
              {i18n.t("RTL Description")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- NOTIFICATIONS SECTION --- */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="notifications-outline" size={20} color="#311B92" />
          <Text className="text-[14px] font-black text-[#6B7280] uppercase tracking-wider ml-2">
            {i18n.t("Notifications")}
          </Text>
        </View>

        <View className="bg-white rounded-[24px] p-5 flex-row items-center justify-between border border-[#E5E7EB] mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-[16px] font-bold text-[#1F2937] mb-0.5">
              {i18n.t("Push Notifications")}
            </Text>
            <Text className="text-[13px] font-medium text-[#9CA3AF]">
              {i18n.t("System alerts and candidate updates")}
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#D1D5DB", true: "#311B92" }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        {/* --- ACCOUNT SECURITY SECTION --- */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="shield-checkmark-outline" size={20} color="#311B92" />
          <Text className="text-[14px] font-black text-[#6B7280] uppercase tracking-wider ml-2">
            {i18n.t("Account Security")}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/change-password")}
          className="bg-white rounded-[24px] p-5 flex-row items-center justify-between border border-[#E5E7EB] mb-8"
        >
          <View className="flex-row items-center">
            <Ionicons name="key-outline" size={20} color="#6B7280" />
            <Text className="text-[16px] font-bold text-[#1F2937] ml-3">
              {i18n.t("Change Password")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* --- SESSION MANAGEMENT SECTION --- */}
        <View className="flex-row items-center mb-4">
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-[14px] font-black text-[#EF4444] uppercase tracking-wider ml-2">
            {i18n.t("Session")}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={logout}
          className="bg-[#FEF2F2] rounded-[24px] p-5 flex-row items-center justify-between border border-[#FEE2E2]"
        >
          <View className="flex-row items-center">
            <Ionicons name="power-outline" size={20} color="#EF4444" />
            <Text className="text-[16px] font-bold text-[#B91C1C] ml-3">
              {i18n.t("Log Out Account")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FCA5A5" />
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
} 