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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Camera, CameraView } from "expo-camera";
import api from "../../../../../../utils/axios";
import { i18n } from "../../../../../../locales/i18n";

export default function CandidateListScreen() {
  const router = useRouter();
  
  const { sessionId, sessionRoomId, subjectId } = useLocalSearchParams();

  // Extract clean IDs for global use in the component
  const cleanRoomId = Array.isArray(sessionRoomId) ? sessionRoomId[0] : sessionRoomId;
  const cleanSubjectId = Array.isArray(subjectId) ? subjectId[0] : subjectId;

  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- STATE TO HOLD SCANNED DATA BEFORE SUBMITTING ---
  const [pendingScans, setPendingScans] = useState([]);

  // --- CAMERA & LIVE SCANNING STATES ---
  const [hasPermission, setHasPermission] = useState(null);
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [isReadyToScan, setIsReadyToScan] = useState(false);
  const [activeScanningId, setActiveScanningId] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isSubmittingScan, setIsSubmittingScan] = useState(false);

  // --- FETCH CANDIDATES FROM API ---
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!sessionId || !cleanRoomId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          `/api/v1/attendance/${sessionId}/room/${cleanRoomId}/candidates`,
        );

        if (response.data && response.data.success) {
          const fetchedData = response.data.data || [];
          setCandidates(fetchedData);
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
  }, [sessionId, cleanRoomId]);

  // --- TRIGGER SCAN MODAL ---
  const handleOpenScanner = async (candidateId) => {
    setActiveScanningId(candidateId);
    setScanned(false);
    setIsReadyToScan(false);

    if (hasPermission === null) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      if (status === "granted") {
        setIsScannerVisible(true);
      } else {
        Alert.alert("Permission Denied", "Camera access is required.");
      }
    } else if (hasPermission === false) {
      Alert.alert(
        "Permission Denied",
        "Please open settings to enable camera usage.",
      );
    } else {
      setIsScannerVisible(true);
    }
  };

  // --- ADD SCANNED DATA TO PENDING ARRAY ---
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned || !activeScanningId) return;

    setScanned(true);
    setIsReadyToScan(false);

    const targetCandidateId = activeScanningId;
    const cleanQrCode = data.trim();

    // 1. Add to pending scans array
    setPendingScans((prev) => {
      const filtered = prev.filter((scan) => scan.candidateId !== targetCandidateId);
      return [...filtered, { candidateId: targetCandidateId, qrCode: cleanQrCode }];
    });

    // 2. Optimistically update the UI to show they are scanned
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.candidateId === targetCandidateId) {
          const updatedSubjects = (c.subjects || []).map((sub) => {
            if (sub.subjectId === cleanSubjectId) {
              return { ...sub, attended: true };
            }
            return sub;
          });
          return { ...c, subjects: updatedSubjects };
        }
        return c;
      })
    );
  };

  // --- MANUALLY TOGGLE STATUS ---
  const toggleStatus = (id) => {
    const candidate = candidates.find((c) => c.candidateId === id);
    if (!candidate) return;

    const currentSubject = (candidate.subjects || []).find(
      (sub) => sub.subjectId === cleanSubjectId
    );
    const isCurrentlyAttended = currentSubject?.attended === true;
    const willBeAttended = !isCurrentlyAttended;

    // 1. Update visual Candidates List
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.candidateId === id) {
          const updatedSubjects = (c.subjects || []).map((sub) => {
            if (sub.subjectId === cleanSubjectId) {
              return { ...sub, attended: willBeAttended };
            }
            return sub;
          });
          return { ...c, subjects: updatedSubjects };
        }
        return c;
      })
    );

    // 2. Update Pending Scans Array
    setPendingScans((prevScans) => {
      if (willBeAttended) {
        return [...prevScans.filter((s) => s.candidateId !== id), { candidateId: id, qrCode: "MANUAL_ENTRY" }];
      } else {
        return prevScans.filter((s) => s.candidateId !== id);
      }
    });
  };

  // --- SUBMIT ALL PENDING SCANS TO BACKEND ---
  const submitAllAttendance = async () => {
    if (pendingScans.length === 0) return;

    setIsSubmittingScan(true);

    try {
      const payload = {
        sessionRoomId: cleanRoomId || "00000000-0000-0000-0000-000000000000",
        subjectId: cleanSubjectId || "00000000-0000-0000-0000-000000000000", 
        scans: pendingScans,
      };

      console.log("📦 Submitting Payload:", JSON.stringify(payload, null, 2));

      const response = await api.post(
        `/api/v1/attendance/${sessionId}/validate`,
        payload,
      );

      if (response.data && response.data.success) {
        Alert.alert("Success", `Successfully validated ${pendingScans.length} candidates.`);
        setPendingScans([]); // Clear the queue on success
      } else {
        Alert.alert(
          "Validation Error",
          response.data.message || "Failed to submit attendance.",
        );
      }
    } catch (err) {
      console.error("\n--- ❌ BACKEND VALIDATION BREAKDOWN ---", err);
      if (err.response) {
        Alert.alert(
          "Backend Error",
          err.response.data?.message || JSON.stringify(err.response.data),
        );
      } else {
        Alert.alert("Network Error", "Could not reach server.");
      }
    } finally {
      setIsSubmittingScan(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
    const nameMatch = fullName.includes(query);
    const regMatch = c.registrationNumber?.toLowerCase().includes(query);
    return nameMatch || regMatch;
  });

  // Find info of currently scanning candidate for validation view
  const activeCandidate = candidates.find((c) => c.candidateId === activeScanningId);
  const activeCandidateName = activeCandidate ? `${activeCandidate.firstName || ""} ${activeCandidate.lastName || ""}`.trim() : "";
  const activeCandidateReg = activeCandidate ? activeCandidate.registrationNumber || "N/A" : "";

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F9FA]"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* --- HEADER --- */}
      <View className="px-6 pt-4 pb-6">
        <View className="flex-row items-start">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-[#F3F4F6] mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#311B92" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-[24px] font-extrabold text-[#111827] mb-2 tracking-tight">
              {i18n.t("Room Candidates")}
            </Text>
            <View className="bg-[#EEEBFF] px-3 py-1.5 rounded-full align-self-start max-w-[100px]">
              <Text className="text-[#311B92] text-[12px] font-bold text-center">
                {candidates.length} {i18n.t("Total")}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* --- SEARCH --- */}
      <View className="px-6 mb-6">
        <View className="flex-row items-center bg-white rounded-full px-5 py-3.5 border border-[#F3F4F6]">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-[15px] font-medium text-[#1F2937]"
            placeholder={i18n.t("Search candidate by name or ID")}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* --- OVERLAY SPINNER --- */}
      {isSubmittingScan && (
        <View className="absolute inset-0 bg-white/70 z-50 justify-center items-center">
          <ActivityIndicator size="large" color="#311B92" />
          <Text className="text-[#311B92] font-bold mt-3">
            {i18n.t("Submitting Attendance")}
          </Text>
        </View>
      )}

      {/* --- SCROLL LIST --- */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#311B92" />
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-[#EF4444] font-bold text-center">{error}</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }} 
          >
            {filteredCandidates.map((candidate, index) => {
              const cId = candidate.candidateId || `cand-key-${index}`;
              const cName = `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim();
              const cReg = candidate.registrationNumber || "N/A";
              
              const currentSubject = (candidate.subjects || []).find(
                (sub) => sub.subjectId === cleanSubjectId
              );
              const isScanned = currentSubject?.attended === true;

              return (
                <View
                  key={cId}
                  className="bg-white rounded-[20px] p-5 mb-4 border border-[#F3F4F6]"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-4">
                      <Text className="text-[17px] font-bold text-[#1F2937] mb-1">
                        {cName}
                      </Text>
                      <Text className="text-[13px] font-medium text-[#9CA3AF]">
                        {i18n.t("REG:")} {cReg}
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        isScanned ? toggleStatus(cId) : handleOpenScanner(cId)
                      }
                      className={`flex-row items-center px-4 py-2 rounded-full ${isScanned ? "bg-[#EEEBFF]" : "bg-[#311B92]"}`}
                    >
                      <MaterialCommunityIcons
                        name="qrcode-scan"
                        size={16}
                        color={isScanned ? "#311B92" : "#FFFFFF"}
                      />
                      <Text
                        className={`ml-2 text-[13px] font-bold ${isScanned ? "text-[#311B92]" : "text-white"}`}
                      >
                        {isScanned ? i18n.t("Scanned") : i18n.t("Scan QR")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* --- FIXED SUBMIT BUTTON --- */}
      {pendingScans.length > 0 && (
        <View className="px-6 py-4 bg-white border-t border-[#F3F4F6] shadow-sm">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={submitAllAttendance}
            className="bg-[#10B981] w-full py-4 rounded-[16px] flex-row justify-center items-center"
          >
            <MaterialCommunityIcons name="cloud-upload" size={22} color="white" />
            <Text className="text-white font-bold text-[16px] ml-2">
              {i18n.t("Submit Attendance")} ({pendingScans.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- CAMERA SCANNING MODAL --- */}
      <Modal
        visible={isScannerVisible}
        animationType="slide"
        transparent={false}
        onShow={() => {
          setTimeout(() => setIsReadyToScan(true), 250);
        }}
        onRequestClose={() => {
          setIsScannerVisible(false);
          setIsReadyToScan(false);
          setActiveScanningId(null);
          setScanned(false);
        }}
      >
        <View style={StyleSheet.absoluteFillObject} className="bg-black justify-center items-center">
          {isReadyToScan && (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
          )}

          {/* --- FLOATING HEADER CARD PANEL --- */}
          <SafeAreaView className="absolute top-0 left-0 right-0 p-6 flex-row items-center z-10" edges={["top"]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setIsScannerVisible(false);
                setIsReadyToScan(false);
                setActiveScanningId(null);
                setScanned(false);
              }}
              className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-1 bg-[#2D3139]/90 rounded-[24px] p-5 shadow-lg border border-gray-700/40">
              <Text className="text-white text-[20px] font-extrabold tracking-tight">
                {i18n.t("Computer Science")}
              </Text>
              <Text className="text-gray-300 text-[13px] font-semibold mt-0.5">
                {i18n.t("Subject: ACSI")}
              </Text>
              <View className="flex-row items-center mt-3">
                <View className="bg-[#EEEBFF] px-3 py-1 rounded-full mr-2">
                  <Text className="text-[#311B92] text-[11px] font-black">
                    {candidates.length} {i18n.t("Candidates")}
                  </Text>
                </View>
                <View className="bg-gray-600/80 px-3 py-1 rounded-full">
                  <Text className="text-gray-200 text-[11px] font-bold">
                    {i18n.t("Session 09:00 AM")}
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>

          {/* --- CENTER SCANNING TARGET FRAMES WITH CORNERS --- */}
          <View style={styles.scannerTarget}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {/* --- ALIGNMENT NOTIFICATION CAPSULE --- */}
          <View className="mt-8 border border-gray-600/50 rounded-full px-6 py-2.5 bg-black/40">
            <Text className="text-white text-[12px] font-bold tracking-widest text-center uppercase">
              {i18n.t("Align QR Code within the frame")}
            </Text>
          </View>

          {/* --- ATTENDANCE CONFIRMED BOTTOM SHEET MODAL --- */}
          {scanned && (
            <View className="absolute inset-0 bg-black/50 justify-end z-20">
              <View className="bg-[#D6D6D6] rounded-t-[40px] px-6 pt-3 pb-8 items-center shadow-2xl">
                {/* Visual Top Handle Drag Bar */}
                <View className="w-12 h-1.5 bg-gray-400/70 rounded-full mb-6" />

                {/* Checked Success Badge */}
                <View className="w-16 h-16 bg-white rounded-[20px] justify-center items-center shadow-sm mb-4">
                  <Ionicons name="checkmark-circle" size={44} color="#311B92" />
                </View>

                {/* Title */}
                <Text className="text-[22px] font-black text-[#111827] mb-6 tracking-tight">
                  {i18n.t("Attendance Confirmed")}
                </Text>

                {/* Info Nested Block Layout */}
                <View className="w-full bg-[#C9C9C9]/80 rounded-[28px] p-4 mb-6 border border-gray-300/40">
                  <Text className="text-[12px] font-extrabold text-gray-500 mb-2 uppercase tracking-wider text-center">
                    {i18n.t("Candidate Full Name")}
                  </Text>
                  <View className="bg-[#ECECEC] rounded-[20px] p-4 items-center border border-white/60 shadow-sm">
                    <Text className="text-[19px] font-black text-[#311B92] mb-1 text-center">
                      {activeCandidateName}
                    </Text>
                    <Text className="text-[13px] font-bold text-gray-500 text-center">
                      {i18n.t("REG:")} {activeCandidateReg}
                    </Text>
                  </View>
                </View>

                {/* Action CTA Button */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    setIsScannerVisible(false);
                    setIsReadyToScan(false);
                    setActiveScanningId(null);
                    setScanned(false);
                  }}
                  className="bg-[#2B1192] w-full py-4 rounded-[20px] justify-center items-center shadow-md"
                >
                  <Text className="text-white font-black text-[16px]">
                    {i18n.t("Confirm & Next")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scannerTarget: {
    width: 270,
    height: 270,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 35,
    height: 35,
    borderColor: "#6366F1", 
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 4,
  },
});