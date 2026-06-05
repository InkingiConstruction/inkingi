import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { COLORS } from "@/constants/colors";

type Project = { id: string; name: string; status: string };

export default function SiteAgentDailyReport() {
  const [weather, setWeather] = useState("");
  const [workforce, setWorkforce] = useState("");
  const [tasks, setTasks] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ["site-agent-projects"],
    queryFn: async () => (await api.get<Project[]>(ENDPOINTS.PROJECTS.LIST)).data,
  });
  const activeProject = (projectsQuery.data || []).find((project) => project.status === "active");

  const createReport = useMutation({
    mutationFn: async () =>
      api.post(ENDPOINTS.SITE_AGENT.DAILY_REPORTS, {
        projectId: activeProject?.id,
        weather,
        workforceCount: Number(workforce),
        taskProgress: tasks,
        notes,
      }),
    onSuccess: () => {
      setWeather("");
      setWorkforce("");
      setTasks("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["site-agent-daily-reports"] });
      Alert.alert("Report submitted", "Daily site report has been saved.");
    },
    onError: (error: any) => {
      Alert.alert("Submission failed", error?.response?.data?.message || "Could not submit daily report.");
    },
  });

  const submit = () => {
    if (!activeProject) {
      Alert.alert("No active project", "You need an active assigned project before submitting a daily report.");
      return;
    }
    if (!weather.trim() || !workforce.trim() || !tasks.trim()) {
      Alert.alert("Missing report details", "Please add weather, workforce count, and task progress.");
      return;
    }
    createReport.mutate();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 12, fontWeight: "900" }}>DAILY SITE REPORT</Text>
        <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 28, fontWeight: "900" }}>Ground Truth</Text>
        <Text style={{ color: COLORS.TEXT_SECONDARY, lineHeight: 20, marginTop: 4 }}>
          Log today&apos;s weather, workforce, completed tasks, and live-camera evidence.
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

        <View style={{ gap: 12, marginTop: 20 }}>
          <Field icon="partly-sunny-outline" label="Weather conditions" value={weather} onChangeText={setWeather} placeholder="Sunny, rainy, cloudy..." />
          <Field icon="people-outline" label="Workforce count" value={workforce} onChangeText={setWorkforce} placeholder="e.g. 14 workers, 2 masons" keyboardType="default" />
          <Field icon="hammer-outline" label="Task progress" value={tasks} onChangeText={setTasks} placeholder="Foundation formwork completed..." multiline />
          <Field icon="document-text-outline" label="Notes / blockers" value={notes} onChangeText={setNotes} placeholder="Delayed cement delivery, safety issue..." multiline />

          <Pressable style={{ alignItems: "center", backgroundColor: COLORS.PRIMARY_LIGHT, borderColor: COLORS.PRIMARY, borderRadius: 12, borderStyle: "dashed", borderWidth: 1, gap: 8, padding: 18 }}>
            <Ionicons name="camera-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={{ color: COLORS.PRIMARY, fontWeight: "900" }}>Capture live site photos</Text>
            <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 12, textAlign: "center" }}>
              Gallery uploads should stay disabled for official daily attendance proof.
            </Text>
          </Pressable>

          <Pressable disabled={createReport.isPending} onPress={submit} style={{ alignItems: "center", backgroundColor: COLORS.PRIMARY, borderRadius: 10, marginTop: 8, opacity: createReport.isPending ? 0.65 : 1, paddingVertical: 15 }}>
            <Text style={{ color: COLORS.TEXT_WHITE, fontWeight: "900" }}>
              {createReport.isPending ? "Submitting..." : "Submit Daily Report"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "default";
}) {
  return (
    <View style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER_LIGHT, borderRadius: 12, borderWidth: 1, padding: 14 }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 8 }}>
        <Ionicons name={props.icon} size={18} color={COLORS.PRIMARY} />
        <Text style={{ color: COLORS.TEXT_PRIMARY, fontWeight: "900" }}>{props.label}</Text>
      </View>
      <TextInput
        multiline={props.multiline}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={COLORS.TEXT_LIGHT}
        style={{ color: COLORS.TEXT_PRIMARY, minHeight: props.multiline ? 92 : 44, textAlignVertical: "top" }}
        value={props.value}
      />
    </View>
  );
}
