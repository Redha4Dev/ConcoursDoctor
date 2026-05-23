import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Camera, CameraView } from "expo-camera"; 
import api from "../../../../../utils/axios"; // Adjust path based on your folder structure

export default function CandidateListScreen() {
  const router = useRouter();
  // Extract dynamic parameters from the route URL
  const { sessionId, sessionRoomId } = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- CAMERA & LIVE SCANNING STATES ---
  const [hasPermission, setHasPermission] = useState(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [activeScanningId, setActiveScanningId] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isSubmittingScan, setIsSubmittingScan] = useState(false);

  // --- FETCH CANDIDATES FROM API ---
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!sessionId || !sessionRoomId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(
          `/api/v1/attendance/${sessionId}/room/${sessionRoomId}/candidates`
        );
        
        if (response.data && response.data.success) {
          setCandidates(response.data.data || []);
        } else {
          setError("Failed to load candidates.");
        }
      } catch (err) {
        console.error("Error fetching candidates:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [sessionId, sessionRoomId]);

  // --- TRIGGER SCAN MODAL WITH CAMERA PERMISSION MANAGEMENT ---
  const handleOpenScanner = async (candidateId) => {
    setActiveScanningId(candidateId);
    setScanned(false);

    if (hasPermission === null) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      if (status === "granted") {
        setIsScannerVisible(true);
      } else {
        Alert.alert("Permission Denied", "Camera access is required to parse exam codes.");
      }
    } else if (hasPermission === false) {
      Alert.alert("Permission Denied", "Please open settings to enable device camera usage.");
    } else {
      setIsScannerVisible(true);
    }
  };

  // --- SUBMIT SCANNED VALIDATION DATA TO BACKEND ---
  const handleBarcodeScanned = async ({ type, data }) => {
    if (scanned || isSubmittingScan) return; 
    setScanned(true); 
    setIsScannerVisible(false);
    setIsSubmittingScan(true);

    const currentCandidate = candidates.find(
      (c) => (c.id || c._id) === activeScanningId
    );

    if (!currentCandidate) {
      setIsSubmittingScan(false);
      setActiveScanningId(null);
      return;
    }

    try {
      // Build request body according to your API spec. Fallback subjectId safely.
      const payload = {
        sessionRoomId: sessionRoomId,
        subjectId: currentCandidate.subjectId || null, 
        scans: [
          {
            candidateId: activeScanningId,
            qrCode: data.trim()
          }
        ]
      };

      const response = await api.post(`/api/v1/attendance/${sessionId}/validate`, payload);

      if (response.data && response.data.success) {
        // Mark candidate as scanned inside local layout
        setCandidates((prev) =>
          prev.map((c) => {
            const cId = c.id || c._id;
            return cId === activeScanningId ? { ...c, status: "scanned" } : c;
          })
        );
        Alert.alert("Success", `Attendance validated for ${currentCandidate.name || "Candidate"}`);
      } else {
        Alert.alert("Validation Error", response.data.message || "Failed to validate candidate code.");
      }
    } catch (err) {
      console.error("Error validating code:", err);
      Alert.alert(
        "Network Error", 
        "Failed to reach server. Would you like to retry?",
        [
          { text: "Retry", onPress: () => handleOpenScanner(activeScanningId) },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } finally {
      setIsSubmittingScan(false);
      setActiveScanningId(null);
    }
  };

  // --- CANCEL MARKED STATUS (OPTIONAL TOGGLE BACK) ---
  const toggleStatus = (id) => {
    setCandidates((prev) =>
      prev.map((c) => {
        const candidateId = c.id || c._id; 
        return candidateId === id
          ? { ...c, status: c.status === "scanned" ? "SCAN QR" : "scanned" }
          : c;
      })
    );
  };

  // --- ACTIVE SEARCH FILTER ---
  const filteredCandidates = candidates.filter((c) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(query);
    const regMatch = 
      c.reg?.toLowerCase().includes(query) || 
      c.registrationNumber?.toLowerCase().includes(query); 
    
    return nameMatch || regMatch;
  });

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
              Room Candidates
            </Text>
            <View className="flex-row items-center flex-wrap">
              <View className="bg-[#EEEBFF] px-3 py-1.5 rounded-full mr-2 mb-2">
                <Text className="text-[#311B92] text-[12px] font-bold">
                  {candidates.length} Total
                </Text>
              </View>
              <View className="bg-[#E5E7EB] px-3 py-1.5 rounded-full mb-2">
                <Text className="text-[#4B5563] text-[12px] font-bold">
                  List Active
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

      {/* --- LAYER FEEDBACK ACTION OVERLAYS --- */}
      {isSubmittingScan && (
        <View className="absolute inset-0 bg-white/70 z-50 justify-center items-center">
          <ActivityIndicator size="large" color="#311B92" />
          <Text className="text-[#311B92] font-bold mt-3">Validating registration...</Text>
        </View>
      )}

      {/* --- CONTENT AREA --- */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#311B92" />
          <Text className="text-[#9CA3AF] mt-4 font-medium">Loading candidates...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-[#EF4444] mt-4 font-bold text-center">{error}</Text>
        </View>
      ) : (
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredCandidates.length === 0 ? (
            <Text className="text-center text-[#9CA3AF] mt-10 font-medium text-[15px]">
              No candidates found.
            </Text>
          ) : (
            filteredCandidates.map((candidate, index) => {
              const cId = candidate.id || candidate._id || `cand-key-${index}`; 
              const cName = candidate.name || `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim() || "Unknown Candidate";
              const cReg = candidate.reg || candidate.registrationNumber || "N/A";
              const isScanned = candidate.status === "scanned";

              return (
                <View 
                  key={cId}
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
                        {cName}
                      </Text>
                      <Text className="text-[13px] font-medium text-[#9CA3AF]">
                        REG: {cReg}
                      </Text>
                    </View>

                    {/* Dynamic Action Button Interceptors */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => isScanned ? toggleStatus(cId) : handleOpenScanner(cId)}
                      className={`flex-row items-center px-4 py-2 rounded-full ${
                        isScanned ? "bg-[#EEEBFF]" : "bg-[#311B92]"
                      }`}
                    >
                      <MaterialCommunityIcons
                        name="qrcode-scan"
                        size={16}
                        color={isScanned ? "#311B92" : "#FFFFFF"}
                      />
                      <Text
                        className={`ml-2 text-[13px] font-bold ${
                          isScanned ? "text-[#311B92]" : "text-white uppercase"
                        }`}
                      >
                        {isScanned ? "Scanned" : "Scan QR"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <Text className="text-[11px] font-medium text-[#9CA3AF] mt-1">
                    {isScanned ? "Attendance complete on backend servers." : "Scan QR to mark attendance. Press 'Scan' again to cancel."}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      {/* --- CAMERA OVERLAY DESIGN MODAL --- */}
      <Modal
        visible={isScannerVisible}
        animationType="slide"
        onRequestClose={() => {
          setIsScannerVisible(false);
          setActiveScanningId(null);
        }}
      >
        <SafeAreaView className="flex-1 bg-black justify-between">
          <View className="p-6 flex-row justify-between items-center bg-[#111827] z-10">
            <Text className="text-white font-bold text-[18px]">Align QR Code</Text>
            <TouchableOpacity 
              onPress={() => {
                setIsScannerVisible(false);
                setActiveScanningId(null);
              }}
              className="p-2 bg-gray-800 rounded-full"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />

          {/* Centralized Targeting Scope HUD Overlay */}
          <View style={styles.overlayContainer}>
            <View style={styles.targetFrame} />
            <Text className="text-white text-center font-semibold text-[14px] mt-6 px-10 bg-black/40 py-2 rounded-lg">
              Place the candidate code within the lines to scan.
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 120,
    bottom: 40,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  targetFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "#A594FF", 
    backgroundColor: "transparent",
    borderRadius: 24,
    borderStyle: "dashed",
  },
});