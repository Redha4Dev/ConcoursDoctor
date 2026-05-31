import React, { useState, useEffect } from "react";
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
import { useRouter } from "expo-router";
import api from "../../../utils/axios"; 
import { i18n } from "../../../locales/i18n";
import { useAuth } from "../../../providers/AuthProvider";

export default function CommitteeDashboard({ onClearRole }) {
  const router = useRouter();
  const { user } = useAuth();

  // 1. FILTER DATA DIRECTLY FROM USER PROFILE
  const allCommitteeTasks = user?.sessionStaff?.filter(
    (staff) => staff.function === "ANONYMAT_COMITE"
  ) || [];

  // 2. SPLIT INTO ACTIVE AND COMPLETED BASED ON SESSION STATUS
  const activeTasks = allCommitteeTasks.filter(
    (task) => task.session?.status !== "COMPLETED"
  );
  
  const historyTasks = allCommitteeTasks.filter(
    (task) => task.session?.status === "COMPLETED"
  );

  const getTodayFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase(); 
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- TOP HEADER ROW WITH SWITCH BUTTON --- */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[12px] font-black text-[#9CA3AF] uppercase tracking-widest">
            {getTodayFormattedDate()}
          </Text>
          
          {onClearRole && (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={onClearRole}
              className="flex-row items-center bg-[#EEEBFF] px-3 py-1.5 rounded-full"
            >
              <Ionicons name="swap-horizontal" size={14} color="#311B92" />
              <Text className="text-[#311B92] text-[12px] font-bold ml-1">
                {i18n.t("Switch")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- GREETING --- */}
        <View className="mb-8">
          <Text className="text-[32px] font-extrabold text-[#1F2937] tracking-tight leading-tight">
            {i18n.t("Good morning,")}{"\n"}Dr. {user?.lastName || "Staff"}
          </Text>
        </View>

        {/* --- RENDER ACTIVE ANONYMITY COMMITTEE SESSIONS --- */}
        {activeTasks.length > 0 ? (
          activeTasks.map((assignment) => (
            <View key={assignment.id} className="mb-8">
              
              {/* Header Context */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-1 pr-4">
                  <Text className="text-[#9CA3AF] text-[12px] font-bold uppercase tracking-wider mb-1">
                    {i18n.t("CURRENT SESSION")}
                  </Text>
                  <Text className="text-[20px] font-black text-[#111827] tracking-tight leading-snug">
                    {assignment.session?.label || i18n.t("Unnamed Session")}
                  </Text>
                </View>
                <View className="bg-[#EEEBFF] p-3.5 rounded-[20px]">
                  <MaterialCommunityIcons name="laptop" size={26} color="#311B92" />
                </View>
              </View>

              {/* --- BLUE HERO CARD --- */}
              <View
                className="bg-[#2B1192] rounded-[28px] p-6 mt-2"
                style={{
                  shadowColor: "#2B1192",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.22,
                  shadowRadius: 24,
                  elevation: 10,
                }}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[#9E8BFF] text-[13px] font-bold uppercase tracking-wider">
                    {i18n.t("Academic Year")}
                  </Text>
                  <View className="bg-[#432CA3] px-2 py-1 rounded-md">
                    <Text className="text-[#A594FF] text-[10px] font-bold uppercase tracking-widest">
                      {assignment.session?.status}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-white text-[32px] font-black tracking-tight mb-6">
                  {assignment.session?.academicYear || "N/A"}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push(`/anonymat/scan/${assignment.session?.id}`)
                  }
                  className="bg-[#F8F9FA] py-4 rounded-[22px] flex-row items-center justify-center"
                >
                  <Text className="text-[#311B92] text-[16px] font-extrabold mr-2">
                    {i18n.t("Go To Scan")}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#311B92" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-[24px] p-6 items-center border border-[#E5E7EB] mb-8">
            <MaterialCommunityIcons name="clipboard-check-outline" size={32} color="#9CA3AF" />
            <Text className="text-[#6B7280] font-bold text-[16px] mt-2 text-center">
              {i18n.t("No active anonymity tasks scheduled")}
            </Text>
          </View>
        )}

        {/* --- HISTORY SECTION --- */}
        <Text className="text-[20px] font-black text-[#111827] mb-4">
          {i18n.t("Anonymity Completed")}
        </Text>

        {historyTasks.length > 0 ? (
          historyTasks.map((assignment) => (
            <View
              key={assignment.id}
              className="bg-white rounded-[24px] p-5 border border-gray-100/80 mb-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.03,
                shadowRadius: 12,
                elevation: 2,
              }}
            >
              <Text className="text-[19px] font-black text-[#111827] mb-1">
                {assignment.session?.label || i18n.t("Unnamed Session")}
              </Text>
              <Text className="text-[13px] font-medium text-[#9CA3AF] mb-4">
                {i18n.t("Academic Year:")} {assignment.session?.academicYear}
              </Text>
              <View className="bg-[#E6F4EA] px-4 py-1.5 rounded-full align-self-start self-start">
                <Text className="text-[#137333] text-[13px] font-bold">
                  {i18n.t("Completed")}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-[#9CA3AF] text-[14px] font-medium italic mt-2">
            {i18n.t("No completed records found")}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}