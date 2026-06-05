import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { COLORS } from "@/constants/colors";

type Project = {
  id: string;
  name: string;
  status: string;
  address?: string | null;
};

export default function SiteAgentDashboard() {
  const projectsQuery = useQuery({
    queryKey: ["site-agent-projects"],
    queryFn: async () => (await api.get<Project[]>(ENDPOINTS.PROJECTS.LIST)).data,
  });

  const projects = projectsQuery.data || [];
  const activeProjects = projects.filter((project) => project.status === "active");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={projectsQuery.isRefetching}
            onRefresh={() => projectsQuery.refetch()}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        <View style={{ marginBottom: 18 }}>
          <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 12, fontWeight: "900" }}>
            SITE AGENT PORTAL
          </Text>
          <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 30, fontWeight: "900" }}>
            Site Control
          </Text>
          <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 14, lineHeight: 20, marginTop: 4 }}>
            Record daily site facts, receive materials, and track stock movement.
          </Text>
        </View>

        {projectsQuery.isLoading ? (
          <ActivityIndicator color={COLORS.PRIMARY} style={{ marginTop: 80 }} />
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ backgroundColor: COLORS.INK, borderRadius: 12, padding: 18 }}>
              <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 12, fontWeight: "800", opacity: 0.75 }}>
                Today&apos;s site action
              </Text>
              <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 24, fontWeight: "900", marginTop: 8 }}>
                Submit daily report
              </Text>
              <Text style={{ color: "#CBD5E1", lineHeight: 20, marginTop: 8 }}>
                Capture weather, workforce count, task progress, and live site evidence.
              </Text>
              <Pressable
                onPress={() => router.push("/(site-agent)/daily-report")}
                style={{
                  alignItems: "center",
                  backgroundColor: COLORS.PRIMARY,
                  borderRadius: 8,
                  flexDirection: "row",
                  gap: 8,
                  justifyContent: "center",
                  marginTop: 16,
                  paddingVertical: 13,
                }}
              >
                <Ionicons name="clipboard-outline" size={18} color={COLORS.TEXT_WHITE} />
                <Text style={{ color: COLORS.TEXT_WHITE, fontWeight: "900" }}>Open report</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Metric icon="business-outline" label="Active sites" value={activeProjects.length} />
              <Metric icon="cube-outline" label="Stock tasks" value={0} />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Metric icon="keypad-outline" label="Receipts" value={0} />
              <Metric icon="camera-outline" label="Reports" value={0} />
            </View>

            <View style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER_LIGHT, borderRadius: 10, borderWidth: 1, padding: 16 }}>
              <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 18, fontWeight: "900", marginBottom: 12 }}>
                Assigned Projects
              </Text>
              <View style={{ gap: 10 }}>
                {activeProjects.slice(0, 4).map((project) => (
                  <View key={project.id} style={{ backgroundColor: COLORS.MUTED, borderRadius: 8, padding: 13 }}>
                    <Text style={{ color: COLORS.TEXT_PRIMARY, fontWeight: "900" }}>{project.name}</Text>
                    <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 12, marginTop: 4 }}>
                      {project.address || "Site location pending"}
                    </Text>
                  </View>
                ))}
                {activeProjects.length === 0 ? (
                  <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 13 }}>
                    No active site has been assigned yet.
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number }) {
  return (
    <View style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER_LIGHT, borderRadius: 10, borderWidth: 1, flex: 1, padding: 14 }}>
      <Ionicons name={icon} size={22} color={COLORS.PRIMARY} />
      <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 24, fontWeight: "900", marginTop: 12 }}>{value}</Text>
      <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 12, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}
