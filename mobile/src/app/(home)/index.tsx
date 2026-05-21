import React from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

export default function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }} // Extra bottom padding so content doesn't hide behind the floating navbar
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER SECTION --- */}
        <View className="mb-6">
          <Text className="text-[14px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
            Oct 12, 2024
          </Text>
          <Text className="text-[32px] font-extrabold text-[#1F2937] tracking-tight leading-tight">
            Good morning,{"\n"}Dr. Anis
          </Text>
        </View>

        {/* --- NEXT ASSIGNMENT SECTION --- */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[20px] font-black text-[#111827]">
            Next Assignment
          </Text>
          <View className="bg-[#EEEBFF] px-3 py-1 rounded-full">
            <Text className="text-[#311B92] text-[12px] font-bold">
              Starts in 45m
            </Text>
          </View>
        </View>

        {/* --- HERO ACTIVE CARD --- */}
        <View 
          className="bg-[#311B92] rounded-[28px] p-6 mb-8"
          style={{
            shadowColor: "#311B92",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-[#9E8BFF] text-[12px] font-bold uppercase tracking-wider mb-1">
                CURRENT SESSION
              </Text>
              <Text className="text-white text-[26px] font-black tracking-tight">
                Computer Science
              </Text>
            </View>
            <View className="bg-[#432CA3] p-3 rounded-2xl">
              <MaterialCommunityIcons name="laptop" size={24} color="#A594FF" />
            </View>
          </View>

          <View className="flex-row mb-6 mt-2">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name="time-outline" size={16} color="#A594FF" />
                <Text className="text-[#9E8BFF] text-[13px] font-semibold ml-1.5 uppercase">Time</Text>
              </View>
              <Text className="text-white text-[18px] font-bold">09:00 AM</Text>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Ionicons name="business-outline" size={16} color="#A594FF" />
                <Text className="text-[#9E8BFF] text-[13px] font-semibold ml-1.5 uppercase">Location</Text>
              </View>
              <Text className="text-white text-[18px] font-bold leading-snug" numberOfLines={2}>
                Room A2, 2nd Floor
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-white py-4 rounded-[20px] flex-row items-center justify-center"
          >
            <Text className="text-[#311B92] text-[16px] font-extrabold mr-2">
              Open Candidate List
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#311B92" />
          </TouchableOpacity>
        </View>

        {/* --- UPCOMING SHIFTS SECTION --- */}
        <Text className="text-[20px] font-black text-[#111827] mb-4">
          Upcoming Shifts
        </Text>

        {/* SHIFT CARD 1 */}
        <View className="bg-white rounded-[24px] p-5 border border-[#E5E7EB] mb-4">
          <Text className="text-[18px] font-bold text-[#4B5563] mb-1">
            Modern History
          </Text>
          <Text className="text-[13px] font-medium text-[#9CA3AF] mb-4">
            May 23, 2026 • 01:30 PM
          </Text>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color="#9CA3AF" />
              <Text className="text-[#9CA3AF] text-[13px] font-medium ml-1">
                Room 105, 1st Floor
              </Text>
            </View>
            <View className="bg-[#FFF7ED] px-3 py-1.5 rounded-full flex-row items-center border border-[#FED7AA]">
              <Ionicons name="lock-closed" size={12} color="#C2410C" />
              <Text className="text-[#C2410C] text-[12px] font-bold ml-1">
                Waiting to start
              </Text>
            </View>
          </View>
        </View>

        {/* SHIFT CARD 2 */}
        <View className="bg-white rounded-[24px] p-5 border border-[#E5E7EB] mb-4">
          <Text className="text-[18px] font-bold text-[#4B5563] mb-1">
            Advanced Physics
          </Text>
          <Text className="text-[13px] font-medium text-[#9CA3AF] mb-4">
            May 24, 2024 • 10:00 AM
          </Text>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color="#9CA3AF" />
              <Text className="text-[#9CA3AF] text-[13px] font-medium ml-1">
                Lab 4, Basement
              </Text>
            </View>
            <Text className="text-[#9CA3AF] text-[13px] font-bold">
              Unlocks in 24h
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}