import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../providers/AuthProvider";
import { i18n } from "../../../locales/i18n";

// Import your role-specific dashboards
import SurveillantDashboard from "@/components/dashboard/Surveillant"
import CommitteeDashboard from "@/components/dashboard/Committee"

export default function HomeIndexScreen() {
  const { user, isLoading } = useAuth();
  
  // Track the chosen global functional role state
  const [selectedRole, setSelectedRole] = useState(null);

  // 1. Loading Guard State
  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8F9FA]">
        <ActivityIndicator size="large" color="#311B92" />
      </View>
    );
  }

  // 2. Render the chosen Dashboard globally
  if (selectedRole === "SURVEILLANT") {
    return <SurveillantDashboard onClearRole={() => setSelectedRole(null)} />;
  }

  if (selectedRole === "ANONYMAT_COMITE") {
    return <CommitteeDashboard onClearRole={() => setSelectedRole(null)} />;
  }

  // 3. Extract unique functional permissions from user's sessionStaff array
  const staffEntries = user.sessionStaff || [];
  const hasSurveillantRole = staffEntries.some(item => item.function === "SURVEILLANT");
  const hasCommitteeRole = staffEntries.some(item => item.function === "ANONYMAT_COMITE");

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <View className="mb-10">
          <Text className="text-[32px] font-extrabold text-[#1F2937] tracking-tight leading-tight">
            {i18n.t("Welcome,")}{"\n"}Dr. {user.lastName || "Staff"}
          </Text>
          <Text className="text-[15px] font-medium text-[#6B7280] mt-2 leading-relaxed">
            {i18n.t("Select a functional space to manage your current responsibilities")}
          </Text>
        </View>

        <Text className="text-[12px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">
          {i18n.t("Select Functionality")}
        </Text>

        {/* --- CHOICE 1: SURVEILLANT CARD --- */}
        {hasSurveillantRole && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedRole("SURVEILLANT")}
            className="bg-white rounded-[24px] p-6 mb-5 border border-gray-100/70 flex-row items-center justify-between"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 }}
          >
            <View className="flex-row items-center flex-1 pr-4">
              <View className="bg-[#E0F2FE] p-4 rounded-2xl-custom rounded-2xl">
                <MaterialCommunityIcons name="clipboard-text-clock" size={26} color="#0369A1" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-[20px] font-black text-[#1F2937] tracking-tight">
                  {i18n.t("Surveillant Workspace")}
                </Text>
                <Text className="text-[13px] font-medium text-[#9CA3AF] mt-0.5" numberOfLines={1}>
                  {i18n.t("Manage room attendances and sheets")}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* --- CHOICE 2: ANONYMITY COMMITTEE CARD --- */}
        {hasCommitteeRole && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedRole("ANONYMAT_COMITE")}
            className="bg-white rounded-[24px] p-6 mb-5 border border-gray-100/70 flex-row items-center justify-between"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 }}
          >
            <View className="flex-row items-center flex-1 pr-4">
              <View className="bg-[#EEEBFF] p-4 rounded-2xl">
                <MaterialCommunityIcons name="shield-account" size={26} color="#311B92" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-[20px] font-black text-[#1F2937] tracking-tight">
                  {i18n.t("Anonymity Committee")}
                </Text>
                <Text className="text-[13px] font-medium text-[#9CA3AF] mt-0.5" numberOfLines={1}>
                  {i18n.t("Scan exam QR codes and handle anonymity")}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Fallback layout state if sessionStaff array metadata is completely empty */}
        {!hasSurveillantRole && !hasCommitteeRole && (
          <View className="bg-white rounded-[24px] p-8 items-center border border-dashed border-[#E5E7EB]">
            <MaterialCommunityIcons name="account-lock-outline" size={44} color="#9CA3AF" />
            <Text className="text-[#6B7280] font-bold text-[16px] mt-3 text-center">
              {i18n.t("No active profile permissions found")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}