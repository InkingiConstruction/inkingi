import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { COLORS } from "@/constants/colors";

type UserSummary = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Project = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  budget?: string | number | null;
  currency?: string | null;
  address?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  client?: UserSummary | null;
  engineer?: UserSummary | null;
  milestones?: { id: string; title?: string | null; name?: string | null; status?: string | null }[];
};

type Assignment = {
  id: string;
  role: string;
  status: string;
  invitedAt?: string;
  project?: Project | null;
};

export default function SiteAgentProjects() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Assignment | null>(null);
  const assignmentsQuery = useQuery({
    queryKey: ["site-agent-assignments"],
    queryFn: async () => {
      const response = await api.get<Assignment[]>(ENDPOINTS.PROJECT_MEMBERS.LIST);
      return response.data.filter((assignment) => assignment.role === "site_agent");
    },
    refetchOnMount: "always",
    refetchInterval: 10000,
  });

  const respond = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "accept" | "reject" }) => {
      const endpoint =
        action === "accept" ? ENDPOINTS.PROJECT_MEMBERS.ACCEPT(id) : ENDPOINTS.PROJECT_MEMBERS.REJECT(id);
      return api.post(endpoint);
    },
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["site-agent-assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["site-agent-projects"] }),
      ]);
      setSelected(null);
      Alert.alert(
        variables.action === "accept" ? "Project accepted" : "Project declined",
        variables.action === "accept"
          ? "You can now submit reports, track stock, and verify deliveries for this project."
          : "The client will see that you declined the site assignment.",
      );
    },
    onError: (error) => Alert.alert("Action failed", error instanceof Error ? error.message : "Try again."),
  });

  const assignments = assignmentsQuery.data || [];
  const pending = assignments.filter((assignment) => assignment.status === "pending");
  const accepted = assignments.filter((assignment) => assignment.status === "accepted");
  const history = assignments.filter((assignment) => assignment.status !== "pending" && assignment.status !== "accepted");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={assignmentsQuery.isRefetching}
            onRefresh={() => assignmentsQuery.refetch()}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        <View style={{ gap: 6, marginBottom: 16 }}>
          <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 12, fontWeight: "900" }}>SITE ASSIGNMENTS</Text>
          <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 30, fontWeight: "900" }}>Projects</Text>
          <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 14, lineHeight: 20 }}>
            Inspect full project details before accepting. Accepted projects unlock reports, stock, and delivery tools.
          </Text>
        </View>

        {assignmentsQuery.isLoading ? (
          <ActivityIndicator color={COLORS.PRIMARY} style={{ marginTop: 70 }} />
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              <SummaryTile icon="mail-unread-outline" label="Pending" value={pending.length} tone="#2563EB" />
              <SummaryTile icon="shield-checkmark-outline" label="Accepted" value={accepted.length} />
              <SummaryTile icon="clipboard-outline" label="Reports" value={0} tone="#D97706" />
              <SummaryTile icon="cube-outline" label="Stock" value={0} />
            </View>

            <Section title="Pending invitations" count={pending.length}>
              {pending.length === 0 ? <Empty text="No pending Site Agent invitations." /> : null}
              {pending.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} tone="pending" onPress={() => setSelected(assignment)} />
              ))}
            </Section>

            <Section title="Accepted projects" count={accepted.length}>
              {accepted.length === 0 ? <Empty text="Accepted projects will appear here." /> : null}
              {accepted.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} tone="accepted" onPress={() => setSelected(assignment)} />
              ))}
            </Section>

            {history.length > 0 ? (
              <Section title="History" count={history.length}>
                {history.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} tone="history" onPress={() => setSelected(assignment)} />
                ))}
              </Section>
            ) : null}
          </View>
        )}
      </ScrollView>

      <ProjectSheet
        assignment={selected}
        loading={respond.isPending}
        onAccept={() => selected && respond.mutate({ id: selected.id, action: "accept" })}
        onClose={() => setSelected(null)}
        onReject={() => selected && respond.mutate({ id: selected.id, action: "reject" })}
      />
    </SafeAreaView>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  tone = COLORS.PRIMARY,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: COLORS.SURFACE,
        borderColor: COLORS.BORDER_LIGHT,
        borderRadius: 10,
        borderWidth: 1,
        flex: 1,
        flexDirection: "row",
        gap: 10,
        minWidth: "40%",
        padding: 12,
      }}
    >
      <View style={{ alignItems: "center", backgroundColor: `${tone}16`, borderRadius: 16, height: 32, justifyContent: "center", width: 32 }}>
        <Ionicons name={icon} size={16} color={tone} />
      </View>
      <View>
        <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 16, fontWeight: "900" }}>{value}</Text>
        <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 10, fontWeight: "800" }}>{label}</Text>
      </View>
    </View>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: COLORS.SURFACE, borderColor: COLORS.BORDER_LIGHT, borderRadius: 12, borderWidth: 1, padding: 16 }}>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 18, fontWeight: "900" }}>{title}</Text>
        <Text style={{ color: COLORS.PRIMARY, fontSize: 12, fontWeight: "900" }}>{count}</Text>
      </View>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function AssignmentCard({
  assignment,
  tone,
  onPress,
}: {
  assignment: Assignment;
  tone: "pending" | "accepted" | "history";
  onPress: () => void;
}) {
  const project = assignment.project;
  const client = project?.client;
  const color = tone === "accepted" ? COLORS.SUCCESS : tone === "pending" ? COLORS.INFO : COLORS.TEXT_LIGHT;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: tone === "pending" ? "#EFF6FF" : COLORS.MUTED,
        borderColor: tone === "pending" ? "#BFDBFE" : COLORS.BORDER_LIGHT,
        borderRadius: 8,
        borderWidth: 1,
        padding: 13,
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row", gap: 11 }}>
        <Avatar image={client?.image} name={client?.name || client?.email || "Client"} color={color} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 15, fontWeight: "900" }} numberOfLines={1}>
            {project?.name || "Assigned project"}
          </Text>
          <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 12, lineHeight: 17, marginTop: 3 }} numberOfLines={2}>
            {tone === "pending"
              ? "Tap to view details before accepting this site assignment."
              : project?.address || project?.description || "Tap to open project actions."}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <StatusPill label={assignment.status} color={color} />
          <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_LIGHT} />
        </View>
      </View>
    </Pressable>
  );
}

function ProjectSheet({
  assignment,
  loading,
  onAccept,
  onReject,
  onClose,
}: {
  assignment: Assignment | null;
  loading: boolean;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  if (!assignment?.project) return null;
  const project = assignment.project;
  const pending = assignment.status === "pending";
  const accepted = assignment.status === "accepted";
  const milestones = project.milestones || [];

  return (
    <Modal animationType="slide" transparent visible={Boolean(assignment)} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable style={{ ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.OVERLAY }} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={{ alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 11, fontWeight: "900" }}>
                {pending ? "REVIEW INVITATION" : "SITE AGENT PROJECT"}
              </Text>
              <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 22, fontWeight: "900", marginTop: 4 }}>{project.name}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={21} color={COLORS.TEXT_PRIMARY} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 22, paddingTop: 14 }}>
            {pending ? (
              <View style={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE", borderRadius: 10, borderWidth: 1, padding: 12 }}>
                <Text style={{ color: "#1D4ED8", fontSize: 12, fontWeight: "900" }}>Inspect before accepting</Text>
                <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 13, lineHeight: 19, marginTop: 4 }}>
                  You can review the location, budget, client, engineer, and project scope before joining this site.
                </Text>
              </View>
            ) : null}

            {accepted ? (
              <View style={{ backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: 10, padding: 12 }}>
                <Text style={{ color: COLORS.PRIMARY_DARK, fontSize: 12, fontWeight: "900" }}>Site tools unlocked</Text>
                <Text style={{ color: COLORS.PRIMARY_DARK, fontSize: 13, lineHeight: 19, marginTop: 4 }}>
                  Submit daily reports, track stock movement, and verify supplier deliveries for this project.
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Info label="Assignment" value={assignment.status} />
              <Info label="Project" value={project.status} />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Info label="Budget" value={`${Number(project.budget || 0).toLocaleString()} ${project.currency || "RWF"}`} />
              <Info label="Milestones" value={String(milestones.length)} />
            </View>

            <DetailBlock icon="location-outline" label="Location" value={project.address || "Not provided"} />
            <PeopleRow client={project.client} engineer={project.engineer} />
            <DetailBlock icon="calendar-outline" label="Timeline" value={formatTimeline(project.startDate, project.endDate)} />
            <DetailBlock icon="document-text-outline" label="Scope" value={project.description || "No project description provided."} />

            {accepted ? (
              <View style={{ gap: 10, marginTop: 2 }}>
                <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 16, fontWeight: "900" }}>Project actions</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <ActionCard icon="clipboard-outline" label="Submit daily report" caption="Weather, labor, progress" projectId={project.id} route="/(site-agent)/daily-report" />
                  <ActionCard icon="cube-outline" label="Track site stock" caption="Stock in, use, damage" projectId={project.id} route="/(site-agent)/inventory" />
                </View>
                <ActionWide icon="keypad-outline" label="Verify delivery" caption="Confirm received materials and report issues" projectId={project.id} route="/(site-agent)/receiving" />
              </View>
            ) : null}

            {pending ? (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <Pressable disabled={loading} onPress={onReject} style={styles.rejectButton}>
                  <Text style={{ color: COLORS.ERROR, fontWeight: "900" }}>Reject</Text>
                </Pressable>
                <Pressable disabled={loading} onPress={onAccept} style={[styles.acceptButton, { opacity: loading ? 0.7 : 1 }]}>
                  <Text style={{ color: COLORS.TEXT_WHITE, fontWeight: "900" }}>{loading ? "Saving..." : "Accept project"}</Text>
                </Pressable>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PeopleRow({ client, engineer }: { client?: UserSummary | null; engineer?: UserSummary | null }) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Person label="Client" user={client} />
      <Person label="Engineer" user={engineer} fallback="Not assigned" />
    </View>
  );
}

function Person({ label, user, fallback = "Not provided" }: { label: string; user?: UserSummary | null; fallback?: string }) {
  const name = user?.name || user?.email || fallback;
  return (
    <View style={{ backgroundColor: COLORS.BACKGROUND, borderRadius: 8, flex: 1, padding: 12 }}>
      <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 11, fontWeight: "900" }}>{label.toUpperCase()}</Text>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 8, marginTop: 8 }}>
        <Avatar image={user?.image} name={name} color={COLORS.PRIMARY} size={30} />
        <Text style={{ color: COLORS.TEXT_PRIMARY, flex: 1, fontSize: 12, fontWeight: "900" }} numberOfLines={2}>
          {name}
        </Text>
      </View>
    </View>
  );
}

function ActionCard({
  icon,
  label,
  caption,
  projectId,
  route,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  caption: string;
  projectId: string;
  route: "/(site-agent)/daily-report" | "/(site-agent)/inventory" | "/(site-agent)/receiving";
}) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: route, params: { projectId } } as never)}
      style={{ backgroundColor: COLORS.MUTED, borderRadius: 8, flex: 1, padding: 13 }}
    >
      <Ionicons name={icon} size={23} color={COLORS.PRIMARY} />
      <Text style={{ color: COLORS.TEXT_PRIMARY, fontSize: 13, fontWeight: "900", marginTop: 12 }}>{label}</Text>
      <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 11, lineHeight: 16, marginTop: 4 }}>{caption}</Text>
    </Pressable>
  );
}

function ActionWide({
  icon,
  label,
  caption,
  projectId,
  route,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  caption: string;
  projectId: string;
  route: "/(site-agent)/daily-report" | "/(site-agent)/inventory" | "/(site-agent)/receiving";
}) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: route, params: { projectId } } as never)}
      style={{ alignItems: "center", backgroundColor: COLORS.PRIMARY, borderRadius: 8, flexDirection: "row", gap: 12, padding: 14 }}
    >
      <View style={{ alignItems: "center", backgroundColor: "rgba(255,255,255,0.16)", borderRadius: 18, height: 36, justifyContent: "center", width: 36 }}>
        <Ionicons name={icon} size={19} color={COLORS.TEXT_WHITE} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 14, fontWeight: "900" }}>{label}</Text>
        <Text style={{ color: COLORS.TEXT_WHITE, fontSize: 11, marginTop: 3, opacity: 0.82 }}>{caption}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.TEXT_WHITE} />
    </Pressable>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ backgroundColor: COLORS.BACKGROUND, borderRadius: 8, flex: 1, padding: 12 }}>
      <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 11, fontWeight: "900" }}>{label.toUpperCase()}</Text>
      <Text style={{ color: COLORS.TEXT_PRIMARY, fontWeight: "900", marginTop: 5 }} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function DetailBlock({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={{ backgroundColor: COLORS.BACKGROUND, borderRadius: 8, padding: 12 }}>
      <View style={{ alignItems: "center", flexDirection: "row", gap: 7 }}>
        <Ionicons name={icon} size={15} color={COLORS.PRIMARY} />
        <Text style={{ color: COLORS.TEXT_LIGHT, fontSize: 11, fontWeight: "900" }}>{label.toUpperCase()}</Text>
      </View>
      <Text style={{ color: COLORS.TEXT_SECONDARY, lineHeight: 20, marginTop: 7 }}>{value}</Text>
    </View>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={{ backgroundColor: `${color}16`, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
      <Text style={{ color, fontSize: 10, fontWeight: "900", textTransform: "uppercase" }}>{label}</Text>
    </View>
  );
}

function Avatar({
  image,
  name,
  color,
  size = 38,
}: {
  image?: string | null;
  name?: string | null;
  color: string;
  size?: number;
}) {
  return (
    <View style={{ alignItems: "center", backgroundColor: `${color}16`, borderRadius: size / 2, height: size, justifyContent: "center", overflow: "hidden", width: size }}>
      {image ? (
        <Image source={{ uri: image }} style={{ height: size, width: size }} />
      ) : (
        <Text style={{ color, fontSize: size > 34 ? 14 : 12, fontWeight: "900" }}>{(name || "U").slice(0, 1).toUpperCase()}</Text>
      )}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={{ backgroundColor: COLORS.MUTED, borderRadius: 8, padding: 16 }}>
      <Text style={{ color: COLORS.TEXT_SECONDARY, fontSize: 13, textAlign: "center" }}>{text}</Text>
    </View>
  );
}

function formatTimeline(start?: string | null, end?: string | null) {
  if (!start && !end) return "Timeline not provided";
  const format = (value?: string | null) => {
    if (!value) return "Not set";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };
  return `${format(start)} - ${format(end)}`;
}

const styles = StyleSheet.create({
  acceptButton: {
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 13,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: COLORS.MUTED,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  rejectButton: {
    alignItems: "center",
    borderColor: COLORS.ERROR,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 13,
  },
  sheet: {
    backgroundColor: COLORS.SURFACE,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "90%",
    padding: 18,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: COLORS.BORDER_LIGHT,
    borderRadius: 999,
    height: 4,
    marginBottom: 12,
    width: 48,
  },
});
