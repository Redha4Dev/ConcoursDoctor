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
    setIsScannerVisible(false);
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

    setActiveScanningId(null);
  };

  // --- MANUALLY TOGGLE STATUS ---
  const toggleStatus = (id) => {
    // FIXED: Calculate the new state FIRST, outside of the setStates to avoid React update race conditions
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
              Room Candidates
            </Text>
            <View className="bg-[#EEEBFF] px-3 py-1.5 rounded-full align-self-start max-w-[100px]">
              <Text className="text-[#311B92] text-[12px] font-bold text-center">
                {candidates.length} Total
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
            placeholder="Search candidate by name or ID..."
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
            Submitting Attendance...
          </Text>
        </View>
      )}

      {/* --- SCROLL LIST (Wrapped in flex-1 to push the bottom bar down) --- */}
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
                        REG: {cReg}
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
                        {isScanned ? "Scanned" : "Scan QR"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* --- FIXED SUBMIT BUTTON (No longer absolute, sits naturally at the bottom) --- */}
      {pendingScans.length > 0 && (
        <View className="px-6 py-4 bg-white border-t border-[#F3F4F6] shadow-sm">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={submitAllAttendance}
            className="bg-[#10B981] w-full py-4 rounded-[16px] flex-row justify-center items-center"
          >
            <MaterialCommunityIcons name="cloud-upload" size={22} color="white" />
            <Text className="text-white font-bold text-[16px] ml-2">
              Submit Attendance ({pendingScans.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- CAMERA OVERLAY MODAL --- */}
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
        }}
      >
        <View style={StyleSheet.absoluteFillObject} className="bg-black">
          {isReadyToScan && (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
            />
          )}

          <SafeAreaView
            className="flex-1 justify-between"
            style={{ backgroundColor: "transparent" }}
          >
            <View className="p-6 flex-row justify-between items-center bg-[#111827]/90 mx-4 mt-4 rounded-2xl">
              <Text className="text-white font-bold text-[18px]">
                Align QR Code
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsScannerVisible(false);
                  setIsReadyToScan(false);
                  setActiveScanningId(null);
                }}
                className="p-2 bg-gray-800 rounded-full"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="items-center justify-center flex-1">
              <View style={styles.targetFrame} />
              <Text className="text-white text-center font-semibold text-[14px] mt-6 mx-10 bg-black/70 px-4 py-2.5 rounded-xl">
                Place the candidate code within the lines to scan.
              </Text>
            </View>
            <View className="h-10" />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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