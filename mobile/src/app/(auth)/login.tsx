import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  I18nManager,
  Platform,
  DevSettings,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Checkbox from "expo-checkbox";
import { useAuth } from "../../../providers/AuthProvider";
import { i18n } from "../../../locales/i18n";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState(i18n.locale);
  const { login } = useAuth();

  const reloadApp = async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Fallback for Expo Go
      DevSettings.reload();
    }
  };

  // Load saved language on mount
  const handleChangeLanguage = async (newLang) => {
    const isRTL = newLang === "ar";

    await AsyncStorage.setItem("APP_LANGUAGE", newLang);
    await AsyncStorage.setItem("APP_RTL", isRTL ? "1" : "0");

    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    await reloadApp();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      //@ts-ignore
      await login(email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 justify-center py-10"
          showsVerticalScrollIndicator={false}
        >
          {/* Main White Card */}
          <View
            className="bg-white rounded-[20px] p-6 w-full mb-10"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.05,
              shadowRadius: 15,
              elevation: 4,
            }}
          >
            {/* Header & Logo */}
            <View className="items-center border-b border-[#F3F4F6] pb-6 mb-6">
              <Image
                source={require("@/assets/images/Logo.png")}
                className="w-[240px] h-[60px]"
                resizeMode="contain"
              />
            </View>

            {/* Form Container */}
            <View className="w-full">
              {/* Username/Email Input */}
              <Text className="text-[14px] font-bold text-[#4B5563] mb-2">
                {i18n.t("Email")}
              </Text>
              <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-xl mb-5 h-[50px] px-4">
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#9CA3AF"
                  className="mr-3"
                />
                <TextInput
                  className="flex-1 h-full text-[#111827] text-[15px]"
                  placeholder="Enter your credentials"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isSubmitting}
                />
              </View>

              {/* Password Input */}
              <Text className="text-[14px] font-bold text-[#4B5563] mb-2">
                {i18n.t("Password")}
              </Text>
              <View className="flex-row items-center bg-white border border-[#E5E7EB] rounded-xl mb-5 h-[50px] px-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#9CA3AF"
                  className="mr-3"
                />
                <TextInput
                  className="flex-1 h-full text-[#111827] text-[15px]"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  className="p-1 ml-2"
                >
                  <Ionicons
                    name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Options Row */}
              <View className="flex-row justify-between items-center mb-8">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={isSubmitting}
                  activeOpacity={0.7}
                >
                  <Checkbox
                    className="w-[18px] h-[18px] rounded-[4px] border-[#D1D5DB]"
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    color={rememberMe ? "#311B92" : undefined}
                  />
                  <Text className="ml-2 text-[14px] text-[#6B7280]">
                    {i18n.t("Remember me")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity disabled={isSubmitting}>
                  <Text className="text-[#311B92] text-[14px] font-bold">
                    {i18n.t("Forgot Password?")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                className={`rounded-[14px] h-[52px] justify-center items-center ${
                  isSubmitting ? "bg-indigo-400" : "bg-[#311B92]"
                }`}
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-[16px] font-bold">
                    {i18n.t("Log In")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer (Outside the Card) */}
          <View className="items-center mt-auto pb-4">
            <Text className="text-[#9CA3AF] text-[13px] mb-3">
              © 2026 Esi-SBA. All rights reserved.
            </Text>
            <View className="flex-row items-center space-x-6">
              <TouchableOpacity>
                <Text className="text-[#9CA3AF] text-[13px]">
                  {i18n.t("Privacy Policy")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-[#9CA3AF] text-[13px]">
                  {i18n.t("Terms of Service")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-[#9CA3AF] text-[13px]">
                  {i18n.t("Support")}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Functional Language Toggles (Kept discrete to not disrupt UI) */}
            <View className="flex-row gap-4 mt-6 opacity-30">
              <TouchableOpacity onPress={() => handleChangeLanguage("en")}>
                <Text className="text-xs">EN</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleChangeLanguage("ar")}>
                <Text className="text-xs">AR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}