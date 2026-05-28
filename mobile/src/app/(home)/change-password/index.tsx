import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2,
  Circle,
} from "lucide-react-native";
import api from "../../../../utils/axios";
import { Link } from "expo-router";
import { i18n } from "../../../../locales/i18n";

export default function ResetPasswordMobile() {
  // --- States ---
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- Password Validation Logic ---
  const requirements = [
    { label: i18n.t("At least 8 characters"), met: password.length >= 8 },
    { label: i18n.t("Contains a number"), met: /\d/.test(password) },
    {
      label: i18n.t("Contains a special character"),
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const allRequirementsMet = requirements.every((req) => req.met);

  // --- API Handler ---
  const handleChangePassword = async () => {
    // Basic Client-side Validation
    if (!oldPassword) {
      Alert.alert(i18n.t("Error"), i18n.t("Please enter your current password"));
      return;
    }
    if (!allRequirementsMet) {
      Alert.alert(i18n.t("Error"), i18n.t("New password does not meet all requirements"));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(i18n.t("Error"), i18n.t("Passwords do not match"));
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/v1/auth/change-password", {
        oldPassword: oldPassword,
        newPassword: password,
      });

      Alert.alert(i18n.t("Success"), i18n.t("Your password has been updated successfully"));

      // Clear form
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        i18n.t("An error occurred Please try again");
      Alert.alert(i18n.t("Update Failed"), msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View className="items-center mb-10">
            <View className="mb-10">
              <Text className="text-2xl font-bold text-[#0F172A]">
                Concour<Text className="text-[#3014B8]">Doctora</Text>
              </Text>
            </View>

            <Text className="text-2xl font-extrabold text-[#1E293B] text-center mb-2">
              {i18n.t("Set a New Password")}
            </Text>
            <Text className="text-sm text-slate-500 text-center px-5 leading-5">
              {i18n.t("Please choose a password you haven't used before to secure your account")}
            </Text>
          </View>

          {/* Input Fields */}
          <View className="mb-6">
            {/* Old Password */}
            <Text className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">
              {i18n.t("Old Password")}
            </Text>
            <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14 mb-4">
              <Lock size={20} color="#94A3B8" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-[#1E293B]"
                placeholder={i18n.t("Current password")}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPass}
                value={oldPassword}
                onChangeText={setOldPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                {showPass ? (
                  <EyeOff size={20} color="#94A3B8" />
                ) : (
                  <Eye size={20} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* New Password */}
            <Text className="text-sm font-semibold text-slate-600 mb-2 mt-2 uppercase tracking-wider">
              {i18n.t("New Password")}
            </Text>
            <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14 mb-4">
              <Lock size={20} color="#94A3B8" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-[#1E293B]"
                placeholder={i18n.t("New password")}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {/* Confirm Password */}
            <Text className="text-sm font-semibold text-slate-600 mb-2 mt-2 uppercase tracking-wider">
              {i18n.t("Confirm Password")}
            </Text>
            <View className="flex-row items-center bg-slate-100 rounded-xl px-4 h-14">
              <Lock size={20} color="#94A3B8" className="mr-3" />
              <TextInput
                className="flex-1 text-base text-[#1E293B]"
                placeholder={i18n.t("Confirm new password")}
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPass}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
              />
            </View>

            {/* Requirements Checklist */}
            <View className="bg-slate-50 rounded-2xl p-5 mt-8 border border-slate-100">
              {requirements.map((req, index) => (
                <View
                  key={index}
                  className="flex-row items-center mb-3 last:mb-0"
                >
                  {req.met ? (
                    <CheckCircle2 size={18} color="#3014B8" />
                  ) : (
                    <Circle size={18} color="#CBD5E1" />
                  )}
                  <Text
                    className={`ml-3 text-sm ${req.met ? "text-[#1E293B] font-medium" : "text-slate-400"}`}
                  >
                    {req.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mt-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleChangePassword}
              disabled={isLoading}
              className={`h-14 rounded-2xl justify-center items-center shadow-md ${
                isLoading
                  ? "bg-[#3014B8]/70"
                  : "bg-[#3014B8] shadow-[#3014B8]/40"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-base font-bold">
                  {i18n.t("Update Password")}
                </Text>
              )}
            </TouchableOpacity>

            <Link
              href={"/(home)"}
              className="flex-row w-full items-center justify-center mt-8 py-2"
            >
              <ChevronLeft size={18} color="#3014B8" />
              <Text className="text-[#3014B8] text-base font-bold ml-1">
                {i18n.t("Back to home")}
              </Text>
            </Link>
          </View>

          <Text className="text-center text-[#94A3B8] text-[10px] mt-12 tracking-widest uppercase">
            © 2026 ESI-SBA. ALL RIGHTS RESERVED.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
