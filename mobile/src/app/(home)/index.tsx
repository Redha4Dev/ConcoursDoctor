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

// Import your split UI dashboards
import SurveillantDashboard from "@/components/dashboard/surveillant";
import CommitteeDashboard from "@/components/dashboard/Committee";

export default function HomeIndexScreen() {
  const { user, isLoading } = useAuth();
  
  // Local state to store the currently active session context selection
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // 1. Loading Guard State
  if (isLoading || !user) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8F9FA]">
        <ActivityIndicator size="large" color="#311B92" />
      </View>
    );
  }

  // 2. If an assignment is already selected, load the respective dynamic dashboard
  if (selectedAssignment) {
    const isCommittee = selectedAssignment.function === "ANONYMAT_COMITE";
    
    if (isCommittee) {
      return (
        <CommitteeDashboard 
          assignment={selectedAssignment} 
          onSwitchSession={() => setSelectedAssignment(null)} 
        />
      );
    } else {
      return (
        <SurveillantDashboard 
          assignment={selectedAssignment} 
          onSwitchSession={() => setSelectedAssignment(null)} 
        />
      );
    }
  }

  // 3. Selection Screen Render (When selectedAssignment is null)
  const assignments = user.sessionStaff || [];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <View className="mb-8 mt-4">
          <Text className="text-[32px] font-extrabold text-[#1F2937] tracking-tight leading-tight">
            {i18n.t("Welcome,")}{"\n"}Dr. {user.lastName || "Staff"}
          </Text>
          <Text className="text-[15px] font-medium text-[#6B7280] mt-2 leading-relaxed">
            {i18n.t("Please choose your assigned role and session workflow to begin.")}
          </Text>
        </View>

        {/* Assignments Group Wrapper */}
        <Text className="text-[14px] font-black text-[#9CA3AF] uppercase tracking-widest mb-4">
          {i18n.t("Available Assignments")} ({assignments.length})
        </Text>

        {assignments.length > 0 ? (
          assignments.map((item) => {
            const isCommittee = item.function === "ANONYMAT_COMITE";
            
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => setSelectedAssignment(item)}
                className="bg-white rounded-[28px] p-6 mb-5 border border-gray-100 shadow-sm"
                style={{
                  shadowColor: "#311B92",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.03,
                  shadowRadius: 10,
                  elevation: 2,
                }}
              >
                {/* Session Label & Details */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 pr-3">
                    <Text className="text-[18px] font-black text-[#1F2937] tracking-tight leading-snug mb-1">
                      {item.session?.label}
                    </Text>
                    <Text className="text-[13px] font-bold text-[#9CA3AF]">
                      {i18n.t("Academic Year:")} {item.session?.academicYear}
                    </Text>
                  </View>

                  {/* Top-Right Mini Status Capsule */}
                  <View className="bg-[#F3F4F6] px-2.5 py-1 rounded-md">
                    <Text className="text-gray-500 text-[11px] font-extrabold tracking-wider uppercase">
                      {item.session?.status}
                    </Text>
                  </View>
                </View>

                {/* Separator Divider Line */}
                <View className="h-[1px] bg-gray-100 w-full my-1 mb-4" />

                {/* Bottom Row Badge Callout with directional action */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className={`p-2.5 rounded-xl ${isCommittee ? "bg-[#EEEBFF]" : "bg-[#E0F2FE]"}`}>
                      <MaterialCommunityIcons
                        name={isCommittee ? "shield-account" : "clipboard-text-clock"}
                        size={18}
                        color={isCommittee ? "#311B92" : "#0369A1"}
                      />
                    </View>
                    
                    <View className="ml-3">
                      <Text className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                        {i18n.t("Assigned Function")}
                      </Text>
                      <Text className={`text-[14px] font-black ${isCommittee ? "text-[#311B92]" : "text-[#0369A1]"}`}>
                        {isCommittee ? i18n.t("Anonymity Committee") : i18n.t("Surveillant")}
                      </Text>
                    </View>
                  </View>

                  {/* Small Action Pointer Arrow */}
                  <View className="bg-gray-50 w-9 h-9 rounded-full items-center justify-center border border-gray-100">
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          /* Missing Session Configuration Fallback View */
          <View className="bg-white rounded-[24px] p-8 items-center border border-dashed border-[#E5E7EB]">
            <MaterialCommunityIcons name="account-question" size={44} color="#9CA3AF" />
            <Text className="text-[#6B7280] font-bold text-[16px] mt-3 text-center">
              {i18n.t("No assignments configuration loaded.")}
            </Text>
            <Text className="text-gray-400 text-[13px] font-medium text-center mt-1">
              {i18n.t("Contact administration to bind your staff profile to an exam window.")}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}