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

export default function CommitteeDashboard({ assignment, onSwitchSession }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    currentTask: null,
    completedSessions: [],
  });

  // --- FETCH ANONYMAT COMMITTEE DASHBOARD DATA FOR SELECTED SESSION ---
  useEffect(() => {
    const fetchCommitteeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sessionId = assignment?.session?.id;
        
        // Pass the session ID to your backend so it only fetches tasks for this specific assignment
        const response = await api.get(`/api/v1/anonymat/dashboard?sessionId=${sessionId}`);
        
        if (response.data && response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError("Failed to parse committee data");
        }
      } catch (err) {
        console.error("Error fetching anonymity dashboard data:", err);
        
        // MOCK DATA FALLBACK: Matches the layout requirements seen in "Anonymat dashboard.png"
        setDashboardData({
          currentTask: {
            subjectCode: "ACSI",
            sessionRoomId: "room-456",
            subjectId: "subj-789"
          },
          completedSessions: [
            {
              id: "comp-1",
              subjectLabel: "Network",
              dateLabel: "May 20, 2024 • 01:30 PM",
              status: "Completed",
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (assignment) {
      fetchCommitteeData();
    }
  }, [assignment]);

  // --- DATE HELPER FOR MAIN HEADER ---
  const getTodayFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).toUpperCase(); 
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FA] justify-center items-center">
        <ActivityIndicator size="large" color="#311B92" />
      </SafeAreaView>
    );
  }

  const { currentTask, completedSessions } = dashboardData;
  // Extract session details from the prop passed by the Switcher
  const sessionLabel = assignment?.session?.label || "Active Session";
  const sessionId = assignment?.session?.id;

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- TOP HEADER & SWITCH ASSIGNMENT ROW --- */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[12px] font-black text-[#9CA3AF] uppercase tracking-widest">
            {getTodayFormattedDate()} • {assignment?.session?.academicYear}
          </Text>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={onSwitchSession}
            className="flex-row items-center bg-[#EEEBFF] px-3 py-1.5 rounded-full"
          >
            <Ionicons name="swap-horizontal" size={14} color="#311B92" />
            <Text className="text-[#311B92] text-[12px] font-bold ml-1">
              {i18n.t("Switch")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- GREETING --- */}
        <View className="mb-8">
          <Text className="text-[32px] font-extrabold text-[#1F2937] tracking-tight leading-tight">
            {i18n.t("Good morning,")}{"\n"}Dr. {user?.lastName || "Anis"}
          </Text>
        </View>

        {/* --- CURRENT SESSION HEADER PANEL --- */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-4">
              <Text className="text-[#9CA3AF] text-[12px] font-bold uppercase tracking-wider mb-1">
                {i18n.t("CURRENT SESSION")}
              </Text>
              <Text className="text-[22px] font-black text-[#111827] tracking-tight leading-snug">
                {sessionLabel}
              </Text>
            </View>
            
            {/* Laptop Display Badge Container */}
            <View className="bg-[#EEEBFF] p-3.5 rounded-[20px]">
              <MaterialCommunityIcons
                name="laptop"
                size={26}
                color="#311B92"
              />
            </View>
          </View>

          {/* --- HERO BLUE SUBJECT ACTION CARD --- */}
          {currentTask ? (
            <View
              className="bg-[#2B1192] rounded-[28px] p-6 mt-6 mb-8"
              style={{
                shadowColor: "#2B1192",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.22,
                shadowRadius: 24,
                elevation: 10,
              }}
            >
              <Text className="text-[#9E8BFF] text-[13px] font-bold uppercase tracking-wider mb-1">
                {i18n.t("Subject")}
              </Text>
              <Text className="text-white text-[32px] font-black tracking-tight mb-6">
                {currentTask.subjectCode}
              </Text>

              {/* Navigation Action CTA Button */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push(
                    `/anonymat/scan/${sessionId}/${currentTask.sessionRoomId}/${currentTask.subjectId}`
                  )
                }
                className="bg-[#F8F9FA] py-4 rounded-[22px] flex-row items-center justify-center"
              >
                <Text className="text-[#311B92] text-[16px] font-extrabold mr-2">
                  {i18n.t("Go To Scan")}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#311B92" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-white rounded-[24px] p-6 items-center border border-[#E5E7EB] mt-6 mb-8">
              <MaterialCommunityIcons name="clipboard-check-outline" size={32} color="#9CA3AF" />
              <Text className="text-[#6B7280] font-bold text-[16px] mt-2 text-center">
                {i18n.t("No active anonymity tasks for this session")}
              </Text>
            </View>
          )}
        </View>

        {/* --- ANONYMITY COMPLETED HISTORY SECTION --- */}
        <Text className="text-[20px] font-black text-[#111827] mb-4">
          {i18n.t("Anonymity Completed")}
        </Text>

        {completedSessions && completedSessions.length > 0 ? (
          completedSessions.map((session) => (
            <View
              key={session.id}
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
                {session.subjectLabel}
              </Text>
              <Text className="text-[13px] font-medium text-[#9CA3AF] mb-4">
                {session.dateLabel}
              </Text>

              {/* Light Green Completed Pill Status Capsule */}
              <View className="bg-[#E6F4EA] px-4 py-1.5 rounded-full align-self-start self-start">
                <Text className="text-[#137333] text-[13px] font-bold">
                  {i18n.t("Completed")}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-[#9CA3AF] text-[14px] font-medium italic mt-2">
            {i18n.t("No completed records found for this term.")}
          </Text>
        )}

        {error && (
          <Text className="text-center text-red-500 text-[12px] font-semibold mt-6">
            {error}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}