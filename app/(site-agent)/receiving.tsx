import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { COLORS } from "@/constants/colors";

type Project = { id: string; name: string; status: string };

export default function SiteAgentReceiving() {
  const [deliveryCode, setDeliveryCode] = useState("");
  const [pin, setPin] = useState("");
  const [remarks, setRemarks] = useState("");
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["site-agent-projects"],
    queryFn: async () => (await api.get<Project[]>(ENDPOINTS.PROJECTS.LIST)).data,
  });
  const activeProject = (projectsQuery.data || []).find((project) => project.status === "active");

  const createVerification = useMutation({
    mutationFn: async () =>
      api.post(ENDPOINTS.SITE_AGENT.DELIVERY_VERIFICATIONS, {
        projectId: activeProject?.id,
        deliveryCode,
        pin,
        remarks,
      }),
    onSuccess: () => {
      setDeliveryCode("");
      setPin("");
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["site-agent-delivery-verifications"] });
      Alert.alert("Delivery confirmed", "Delivery verification has been saved.");
    },
    onError: (error: any) => {
      Alert.alert("Verification failed", error?.response?.data?.message || "Could not verify delivery.");
    },
  });

  const verify = () => {
    if (!activeProject) {
      Alert.alert("No active project", "You need an active assigned project before verifying deliveries.");
      return;
    }
    if (!deliveryCode.trim() || pin.trim().length !== 6) {
      Alert.alert("Missing verification", "Enter the delivery reference and 6-digit receiving PIN.");
      return;
    }
    createVerification.mutate();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 12, fontWeight: "900" }}>MATERIAL RECEIVING</Text>
        <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 28, fontWeight: "900" }}>Verify Delivery</Text>
        <Text style={{ color: COLORS.TEXT_SECONDARY, lineHeight: 20, marginTop: 4 }}>
          Confirm incoming supplier materials with PIN, receipt photo, and condition notes.
        </Text>
        <View style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER_LIGHT, borderRadius: 10, borderWidth: 1, marginTop: 16, padding: 12 }}>
          {projectsQuery.isLoading ? (
            <ActivityIndicator color={COLORS.PRIMARY} />
          ) : (
            <>
              <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 11, fontWeight: "900" }}>ACTIVE PROJECT</Text>
              <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 15, fontWeight: "900", marginTop: 3 }}>
                {activeProject?.name || "No active project assigned"}
              </Text>
            </>
          )}
        </View>

        <View style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER_LIGHT, borderRadius: 12, borderWidth: 1, gap: 12, marginTop: 20, padding: 16 }}>
          <TextInput value={deliveryCode} onChangeText={setDeliveryCode} placeholder="Delivery reference or PO number" placeholderTextColor={COLORS.TEXT_LIGHT} style={{ backgroundColor: COLORS.MUTED, borderRadius: 10, color: COLORS.TEXT_PRIMARY, padding: 13 }} />
          <TextInput value={pin} onChangeText={(value) => setPin(value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="6-digit receiving PIN" placeholderTextColor={COLORS.TEXT_LIGHT} keyboardType="numeric" style={{ backgroundColor: COLORS.MUTED, borderRadius: 10, color: COLORS.TEXT_PRIMARY, fontSize: 20, fontWeight: "900", letterSpacing: 4, padding: 13, textAlign: "center" }} />
          <TextInput value={remarks} onChangeText={setRemarks} placeholder="Missing, damaged, or incorrect items" placeholderTextColor={COLORS.TEXT_LIGHT} multiline style={{ backgroundColor: COLORS.MUTED, borderRadius: 10, color: COLORS.TEXT_PRIMARY, minHeight: 90, padding: 13, textAlignVertical: "top" }} />

          <Pressable style={{ alignItems: "center", backgroundColor: COLORS.PRIMARY_LIGHT, borderColor: COLORS.PRIMARY, borderRadius: 12, borderStyle: "dashed", borderWidth: 1, gap: 8, padding: 18 }}>
            <Ionicons name="camera-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={{ color: COLORS.PRIMARY, fontWeight: "900" }}>Capture receipt photo</Text>
          </Pressable>

          <Pressable disabled={createVerification.isPending} onPress={verify} style={{ alignItems: "center", backgroundColor: COLORS.PRIMARY, borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center", opacity: createVerification.isPending ? 0.65 : 1, paddingVertical: 14 }}>
            <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.TEXT_WHITE} />
            <Text style={{ color: COLORS.TEXT_WHITE, fontWeight: "900" }}>
              {createVerification.isPending ? "Confirming..." : "Confirm Delivery"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
