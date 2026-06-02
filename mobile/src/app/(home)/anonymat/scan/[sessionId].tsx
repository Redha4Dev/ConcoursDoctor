import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../../../../../utils/axios"; // Adjust path based on your project structure

export default function AnonymatScannerPage() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Request camera permission on mount if not determined
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);

    // --- DEBUGGING LOGS ---
    console.log("\n--- QR SCANNED ---");
    console.log("Session ID from URL:", sessionId);
    console.log("QR Data:", data);
    console.log(`Endpoint it is trying to hit: GET /api/v1/anonymization/${sessionId}/lookup?qrCode=${encodeURIComponent(data)}`);
    console.log("------------------\n");

    try {
      const response = await api.get(`/api/v1/anonymization/${sessionId}/lookup`, {
        params: { qrCode: data },
      });
      console.log(response.data);

      if (response.data.data ) {
        setScanResult(response.data.data);
        console.log("Anonymous Code:", response.data.data.anonymousCode);
      } else {
        throw new Error(response.data?.message || "Invalid QR Code");
      }
    } catch (error) {
      console.error("Anonymization lookup error:", error?.response?.data || error.message);
      Alert.alert(
        "Scan Error",
        error?.response?.data?.message || "Could not retrieve anonymity code. (Check console)",
        [{ text: "Try Again", onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndNext = () => {
    setScanResult(null);
    // Add a slight delay before re-enabling the scanner for better UX
    setTimeout(() => {
      setScanned(false);
    }, 500);
  };

  // 1. Handling Camera Permissions
  if (!permission) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <MaterialCommunityIcons name="camera-off" size={64} color="#9CA3AF" />
        <Text className="text-white text-center text-lg mt-4 mb-6">
          We need your permission to show the camera.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-[#311B92] py-4 px-8 rounded-full"
        >
          <Text className="text-white font-bold text-base">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* --- TOP HEADER OVERLAY --- */}
      <SafeAreaView edges={["top"]} className="absolute top-0 w-full px-6 pt-4 flex-row items-start">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="w-12 h-12 bg-[#8C8C91]/90 rounded-full items-center justify-center mr-4"
        >
          <Ionicons name="arrow-back" size={24} color="#311B92" />
        </TouchableOpacity>

        {/* Info Card */}
        <View className="flex-1 bg-[#8C8C91]/90 rounded-[24px] p-4">
          <Text className="text-[#1F2937] text-[20px] font-black tracking-tight mb-2">
            Computer Science
          </Text>
          <View className="flex-row items-center gap-x-2">
            <View className="bg-[#E4E4EB] px-3 py-1.5 rounded-full">
              <Text className="text-[#311B92] text-[12px] font-bold">14 Candidates</Text>
            </View>
            <View className="bg-[#E4E4EB] px-3 py-1.5 rounded-full">
              <Text className="text-[#4B5563] text-[12px] font-bold">Session 09:00 AM</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* --- SCANNER TARGET UI OVERLAY --- */}
      <View className="flex-1 justify-center items-center pointer-events-none">
        <View className="w-64 h-64 relative mb-6">
          {/* Top Left Corner */}
          <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#6C63FF] rounded-tl-[16px]" />
          {/* Top Right Corner */}
          <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#6C63FF] rounded-tr-[16px]" />
          {/* Bottom Left Corner */}
          <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#6C63FF] rounded-bl-[16px]" />
          {/* Bottom Right Corner */}
          <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#6C63FF] rounded-br-[16px]" />

          {/* Loading Indicator inside the box if fetching API */}
          {loading && (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#6C63FF" />
            </View>
          )}
        </View>
        
        {/* Instruction Pill */}
        <View className="bg-transparent border border-white/40 px-5 py-2.5 rounded-full">
          <Text className="text-[#9CA3AF] text-[12px] font-bold tracking-widest uppercase">
            Align QR code within the frame
          </Text>
        </View>
      </View>

      {/* --- BOTTOM SHEET RESULT MODAL --- */}
      {scanResult && (
        <View 
          className="absolute bottom-0 w-full bg-[#8E8E93] rounded-t-[40px] px-6 pb-10 pt-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Drag Handle */}
          <View className="w-12 h-1.5 bg-[#D1D5DB] rounded-full self-center mb-6" />

          {/* Icon */}
          <View className="w-16 h-16 bg-[#F3E8FF] rounded-[22px] items-center justify-center self-center mb-4">
            <Ionicons name="checkmark-circle-outline" size={32} color="#311B92" />
          </View>

          {/* Title */}
          <Text className="text-[26px] font-black text-[#1F2937] self-center mb-6 tracking-tight">
            Code Obtained
          </Text>

          {/* Data Card */}
          <View className="bg-[#D1D5DB]/80 rounded-[28px] p-6 mb-8">
            <View className="flex-row mb-3">
              <Text className="text-[#6B7280] font-bold text-[15px] mr-2">Session:</Text>
              <Text className="text-[#1F2937] font-black text-[15px] flex-1" numberOfLines={1}>
                {scanResult?.sessionLabel || "Informatique 2025/2026"}
              </Text>
            </View>
            
            <View className="flex-row mb-6">
              <Text className="text-[#6B7280] font-bold text-[15px] mr-2">Subject:</Text>
              <Text className="text-[#1F2937] font-black text-[15px] flex-1">
                {scanResult?.subjectName}
              </Text>
            </View>

            <Text className="text-[#6B7280] font-extrabold text-[12px] uppercase tracking-wider mb-2">
              Anonymity Code
            </Text>
            
            {/* Code Block */}
            <View className="bg-[#E5E7EB] py-4 rounded-[20px] items-center justify-center">
              <Text className="text-[#311B92] text-[20px] font-black tracking-widest">
                {scanResult?.anonymousCode}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleConfirmAndNext}
            className="bg-[#311B92] py-5 rounded-[24px] items-center shadow-lg"
          >
            <Text className="text-white text-[18px] font-extrabold tracking-wide">
              Confirm & Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}