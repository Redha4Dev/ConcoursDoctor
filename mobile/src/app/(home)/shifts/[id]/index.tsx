import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CandidateListScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data matching your design
  const [candidates, setCandidates] = useState([
    { id: "1", name: "Mohamed Belghait", reg: "CS-2024-0094", status: "scanned" },
    { id: "2", name: "Lina Boumediene", reg: "CS-2024-0102", status: "pending" },
    { id: "3", name: "Nadir Boulahia", reg: "CS-2024-0094", status: "scanned" },
    { id: "4", name: "Aya Kherbouche", reg: "CS-2024-0102", status: "pending" },
    { id: "5", name: "Wissal Amrani", reg: "CS-2024-0115", status: "pending" },
    { id: "6", name: "Farouk Gherbi", reg: "CS-2024-0115", status: "scanned" },
  ]);

  const toggleStatus = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "scanned" ? "pending" : "scanned" }
          : c
      )
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]" edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* --- HEADER SECTION --- */}
      <View className="px-6 pt-4 pb-6">
        <View className="flex-row items-start">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-[#F3F4F6] mr-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#311B92" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-[24px] font-extrabold text-[#111827] mb-2 tracking-tight">
              Computer Science
            </Text>
            <View className="flex-row items-center">
              <View className="bg-[#EEEBFF] px-3 py-1.5 rounded-full mr-2">
                <Text className="text-[#311B92] text-[12px] font-bold">
                  14 Candidates
                </Text>
              </View>
              <View className="bg-[#E5E7EB] px-3 py-1.5 rounded-full">
                <Text className="text-[#4B5563] text-[12px] font-bold">
                  Session 09:00 AM
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* --- SEARCH BAR --- */}
      <View className="px-6 mb-6">
        <View 
          className="flex-row items-center bg-white rounded-full px-5 py-3.5 border border-[#F3F4F6]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-[15px] font-medium text-[#1F2937]"
            placeholder="Search candidate by name or ID..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* --- CANDIDATES LIST --- */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {candidates.map((candidate) => (
          <View 
            key={candidate.id}
            className="bg-white rounded-[20px] p-5 mb-4 border border-[#F3F4F6]"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1 pr-4">
                <Text className="text-[17px] font-bold text-[#1F2937] mb-1">
                  {candidate.name}
                </Text>
                <Text className="text-[13px] font-medium text-[#9CA3AF]">
                  REG: {candidate.reg}
                </Text>
              </View>

              {/* Dynamic Scan Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleStatus(candidate.id)}
                className={`flex-row items-center px-4 py-2 rounded-full ${
                  candidate.status === "scanned"
                    ? "bg-[#EEEBFF]"
                    : "bg-[#311B92]"
                }`}
              >
                <MaterialCommunityIcons
                  name="qrcode-scan"
                  size={16}
                  color={candidate.status === "scanned" ? "#311B92" : "#FFFFFF"}
                />
                <Text
                  className={`ml-2 text-[13px] font-bold ${
                    candidate.status === "scanned"
                      ? "text-[#311B92]"
                      : "text-white uppercase"
                  }`}
                >
                  {candidate.status === "scanned" ? "Scanned" : "Scan QR"}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text className="text-[11px] font-medium text-[#9CA3AF] mt-1">
              Scan QR to mark attendance. Press "Scan" again to cancel.
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}