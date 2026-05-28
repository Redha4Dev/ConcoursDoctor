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
// Adjusted imports for the new file location
import api from "../../../utils/axios"; 
import { i18n } from "../../../locales/i18n";
import { useAuth } from "../../../providers/AuthProvider";


export default function SurveillantDashboard({ onClearRole }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ active: [], upcoming: [], past: [] });
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/v1/attendance/my-assignments");
        if (response.data && response.data.success) {
          setData(response.data.data);
        } else {
          setError("Failed to parse data");
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Network error or token expired");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "00:00 AM";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateLabel = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const activeSession = data.active && data.active.length > 0 ? data.active[0] : null;
  const upcomingShifts = data.upcoming || [];
  const todayLabel = formatDateLabel(new Date());

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8F9FA] justify-center items-center">
        <ActivityIndicator size="large" color="#311B92" />
      </SafeAreaView>
    );
  }

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
            {activeSession ? formatDateLabel(activeSession.examDate) : todayLabel}
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
        <View className="mb-6">
          <Text className="text-[32px] font-extrabold text-[#1F2937] tracking-tight leading-tight">
            {i18n.t("Good morning,")}{"\n"}Dr. {user?.lastName}
          </Text>
        </View>

        {/* --- HERO ACTIVE CARD --- */}
        {activeSession ? (
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[20px] font-black text-[#111827]">
                {i18n.t("Next Assignment")}
              </Text>
              <View className="bg-[#EEEBFF] px-3 py-1 rounded-full">
                <Text className="text-[#311B92] text-[12px] font-bold">
                  {activeSession.sessionStatus}
                </Text>
              </View>
            </View>

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
                <View className="flex-1 pr-2">
                  <Text className="text-[#9E8BFF] text-[12px] font-bold uppercase tracking-wider mb-1">
                    {i18n.t("CURRENT SESSION")}
                  </Text>
                  <Text className="text-white text-[24px] font-black tracking-tight" numberOfLines={2}>
                    {activeSession.sessionLabel}
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
                    <Text className="text-[#9E8BFF] text-[13px] font-semibold ml-1.5 uppercase">
                      {i18n.t("Time")}
                    </Text>
                  </View>
                  <Text className="text-white text-[17px] font-bold">
                    {formatTime(activeSession.examDate)}
                  </Text>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="business-outline" size={16} color="#A594FF" />
                    <Text className="text-[#9E8BFF] text-[13px] font-semibold ml-1.5 uppercase">
                      {i18n.t("Location")}
                    </Text>
                  </View>
                  <Text className="text-white text-[16px] font-bold leading-tight" numberOfLines={2}>
                    {`${activeSession.room?.name}, ${activeSession.room?.floor}`}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push(`/shifts/${activeSession.sessionId}/${activeSession.sessionRoomId}/${activeSession.subject?.id}`)
                }
                className="bg-white py-4 rounded-[20px] flex-row items-center justify-center"
              >
                <Text className="text-[#311B92] text-[16px] font-extrabold mr-2">
                  {i18n.t("Open Candidate List")} ({activeSession.candidateCount})
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#311B92" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-[24px] p-6 items-center border border-[#E5E7EB] mb-8">
            <MaterialCommunityIcons name="calendar-blank" size={32} color="#9CA3AF" />
            <Text className="text-[#6B7280] font-bold text-[16px] mt-2">
              {i18n.t("No active shifts scheduled today")}
            </Text>
          </View>
        )}

        {/* --- UPCOMING SHIFTS --- */}
        <Text className="text-[20px] font-black text-[#111827] mb-4">
          {i18n.t("Upcoming Shifts")}
        </Text>

        {upcomingShifts.length > 0 ? (
          upcomingShifts.map((shift) => (
            <TouchableOpacity
              key={shift.assignmentId}
              activeOpacity={0.8}
              onPress={() => router.push(`/shifts/${shift.sessionId}/${shift.sessionRoomId}/${shift.subject?.id}`)}
              className="bg-white rounded-[24px] p-5 border border-[#E5E7EB] mb-4"
            >
              <Text className="text-[18px] font-bold text-[#4B5563] mb-1" numberOfLines={1}>
                {shift.sessionLabel}
              </Text>
              <Text className="text-[13px] font-medium text-[#9CA3AF] mb-4">
                {formatDateLabel(shift.examDate)} • {formatTime(shift.examDate)}
              </Text>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1 pr-2">
                  <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                  <Text className="text-[#9CA3AF] text-[13px] font-medium ml-1" numberOfLines={1}>
                    {`${shift.room?.name}, ${shift.room?.floor}`}
                  </Text>
                </View>
                <View className="bg-[#FFF7ED] px-3 py-1.5 rounded-full flex-row items-center border border-[#FED7AA]">
                  <Ionicons name="lock-closed" size={12} color="#C2410C" />
                  <Text className="text-[#C2410C] text-[12px] font-bold ml-1">
                    {shift.sessionStatus === "DRAFT" ? i18n.t("Waiting to start") : shift.sessionStatus}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-[#9CA3AF] text-[14px] font-medium italic mt-2">
            {i18n.t("No upcoming assignments found")}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}