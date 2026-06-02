import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

type Milestone = {
  id: string;
  name: string;
  pct: number;
  durationDays: number;
  acceptanceCriteria: string;
};

type BoqItem = {
  id: string;
  milestoneId: string;
  category: string;
  material: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: number;
};

type DailyMedia = {
  id: string;
  uri: string;
  type: "image" | "video";
};

type DailyUpdate = {
  id: string;
  createdAt: string;
  description: string;
  media: DailyMedia[];
};

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams();

  const [showMilestone, setShowMilestone] = useState(false);
  const [showBoq, setShowBoq] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: Date.now().toString(),
      name: "",
      pct: 0,
      durationDays: 0,
      acceptanceCriteria: "",
    },
  ]);

  const [boqItems, setBoqItems] = useState<BoqItem[]>([]);

  const [boqCategory, setBoqCategory] = useState("Concrete");
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const [dailyProgressTab, setDailyProgressTab] = useState<
    "draft" | "history"
  >("draft");

  const [draftDailyDescription, setDraftDailyDescription] = useState("");

  const [draftDailyMedia, setDraftDailyMedia] = useState<DailyMedia[]>([]);

  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);

  const project = {
    id,
    name: "Villa Nyarutarama",
    status: "ACTIVE",
    progress: 35,
    clientName: "John Doe",
    clientPhone: "+250788123456",
    budget: 50000000,
    location: "Nyarutarama, Kigali",
    description:
      "Luxury villa construction including swimming pool, parking and landscaping.",
    photos: [
      "https://picsum.photos/500/400",
      "https://picsum.photos/501/400",
      "https://picsum.photos/502/400",
    ],
  };

  const totalPercentage = useMemo(() => {
    return milestones.reduce((sum, item) => sum + item.pct, 0);
  }, [milestones]);

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        pct: 0,
        durationDays: 0,
        acceptanceCriteria: "",
      },
    ]);
  };

  const updateMilestone = (
    id: string,
    field: keyof Milestone,
    value: any,
  ) => {
    setMilestones((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const saveMilestones = () => {
    if (totalPercentage !== 100) {
      Alert.alert(
        "Validation Error",
        "Milestones total percentage must equal 100%",
      );

      return;
    }

    Alert.alert("Success", "Milestones saved successfully");

    setShowMilestone(false);
  };

  const openBoqModal = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    setShowBoq(true);
  };

  const saveBoq = () => {
    if (!selectedMilestoneId) {
      Alert.alert("Error", "Please select milestone");
      return;
    }

    if (!material || !quantity || !unit || !unitPrice) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    const total =
      (Number(quantity) || 0) * (Number(unitPrice) || 0);

    const newItem: BoqItem = {
      id: Date.now().toString(),
      milestoneId: selectedMilestoneId,
      category: boqCategory,
      material,
      quantity,
      unit,
      unitPrice,
      total,
    };

    setBoqItems((prev) => [...prev, newItem]);

    setMaterial("");
    setQuantity("");
    setUnit("");
    setUnitPrice("");

    Alert.alert("Success", "BOQ item added successfully");

    setShowBoq(false);
  };

  const uploadDailyProgressMedia = async (
    type: "photo" | "video",
  ) => {
    try {
      const cameraPermission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (cameraPermission.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera permission is required.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes:
          type === "photo"
            ? ImagePicker.MediaTypeOptions.Images
            : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (result.canceled) return;

      const asset = result.assets[0];

      const newMedia: DailyMedia = {
        id: Date.now().toString(),
        uri: asset.uri,
        type: type === "photo" ? "image" : "video",
      };

      if (type === "video") {
        if (draftDailyMedia.some((m) => m.type === "video")) {
          Alert.alert("Video Exists", "Only one video allowed.");
          return;
        }
      }

      if (type === "photo") {
        const photoCount = draftDailyMedia.filter(
          (m) => m.type === "image",
        ).length;

        if (photoCount >= 10) {
          Alert.alert(
            "Limit Reached",
            "Maximum 10 photos allowed.",
          );
          return;
        }
      }

      setDraftDailyMedia((prev) => [...prev, newMedia]);
    } catch (error) {
      Alert.alert("Error", "Could not open camera");
    }
  };

  const saveDailyUpdate = () => {
    const photosCount = draftDailyMedia.filter(
      (m) => m.type === "image",
    ).length;

    if (photosCount < 5) {
      Alert.alert(
        "Validation Error",
        "Please add at least 5 photos.",
      );

      return;
    }

    const newUpdate: DailyUpdate = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      description: draftDailyDescription,
      media: draftDailyMedia,
    };

    setDailyUpdates((prev) => [newUpdate, ...prev]);

    setDraftDailyDescription("");
    setDraftDailyMedia([]);

    Alert.alert(
      "Success",
      "Daily update saved successfully",
    );

    setDailyProgressTab("history");
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{project.name}</Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {project.status}
            </Text>
          </View>

          <Text style={styles.progressText}>
            Progress {project.progress}%
          </Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            value={String(milestones.length)}
            label="Milestones"
          />

          <StatCard
            value={String(boqItems.length)}
            label="BOQ Items"
          />

          <StatCard
            value={String(dailyUpdates.length)}
            label="Daily Updates"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Client Information
          </Text>

          <Text style={styles.label}>
            {project.clientName}
          </Text>

          <Text style={styles.label}>
            {project.clientPhone}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Project Overview
          </Text>

          <Text style={styles.label}>
            Budget: {project.budget.toLocaleString()} RWF
          </Text>

          <Text style={styles.label}>
            Location: {project.location}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Site Photos
          </Text>

          <ScrollView horizontal>
            {project.photos.map((p) => (
              <Image
                key={p}
                source={{ uri: p }}
                style={styles.image}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Description
          </Text>

          <Text style={styles.description}>
            {project.description}
          </Text>
        </View>

        {/* DISPLAY CREATED MILESTONES */}
        <View style={styles.card}>
          <View style={styles.milestoneHeaderRow}>
            <Text style={styles.sectionTitle}>
              Project Milestones
            </Text>

            <TouchableOpacity
              style={styles.smallCreateBtn}
              onPress={() => setShowMilestone(true)}
            >
              <Text style={styles.smallCreateBtnText}>
                + Create
              </Text>
            </TouchableOpacity>
          </View>

          {milestones.filter((m) => m.name).length === 0 ? (
            <Text style={styles.label}>
              No milestones created yet.
            </Text>
          ) : (
            milestones
              .filter((m) => m.name)
              .map((milestone) => {
                const milestoneBoqs = boqItems.filter(
                  (b) => b.milestoneId === milestone.id,
                );

                const totalBoq = milestoneBoqs.reduce(
                  (sum, item) => sum + item.total,
                  0,
                );

                return (
                  <View
                    key={milestone.id}
                    style={styles.createdMilestoneCard}
                  >
                    <Text style={styles.createdTitle}>
                      {milestone.name}
                    </Text>

                    <Text style={styles.createdInfo}>
                      Budget Percentage: {milestone.pct}%
                    </Text>

                    <Text style={styles.createdInfo}>
                      Duration: {milestone.durationDays} days
                    </Text>

                    <Text style={styles.createdInfo}>
                      Acceptance Criteria:
                    </Text>

                    <Text style={styles.createdDesc}>
                      {milestone.acceptanceCriteria}
                    </Text>

                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={() =>
                        openBoqModal(milestone.id)
                      }
                    >
                      <Text style={styles.primaryText}>
                        Create Bill of Quantities (BOQ)
                      </Text>
                    </TouchableOpacity>

                    {milestoneBoqs.length > 0 && (
                      <View style={{ marginTop: 16 }}>
                        <Text
                          style={styles.boqTitle}
                        >
                          BOQ Items
                        </Text>

                        {milestoneBoqs.map((item) => (
                          <View
                            key={item.id}
                            style={styles.boqCard}
                          >
                            <Text
                              style={styles.boqText}
                            >
                              Category: {item.category}
                            </Text>

                            <Text
                              style={styles.boqText}
                            >
                              Material: {item.material}
                            </Text>

                            <Text
                              style={styles.boqText}
                            >
                              Quantity: {item.quantity}
                            </Text>

                            <Text
                              style={styles.boqText}
                            >
                              Unit: {item.unit}
                            </Text>

                            <Text
                              style={styles.boqText}
                            >
                              Unit Price:{" "}
                              {Number(
                                item.unitPrice,
                              ).toLocaleString()}{" "}
                              RWF
                            </Text>

                            <Text
                              style={
                                styles.boqTotal
                              }
                            >
                              Total:{" "}
                              {item.total.toLocaleString()}{" "}
                              RWF
                            </Text>
                          </View>
                        ))}

                        <Text style={styles.finalTotal}>
                          Total BOQ Amount:{" "}
                          {totalBoq.toLocaleString()} RWF
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
          )}
        </View>

        <View style={styles.actions}>
          <ActionCard
            title="Daily Progress"
            onPress={() => setShowProgress(true)}
          />
        </View>
      </ScrollView>

      {/* MILESTONE MODAL */}
      <Modal
        visible={showMilestone}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowMilestone(false)
        }
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          style={styles.overlay}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Milestone Builder
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowMilestone(false)
                }
              >
                <Text style={styles.close}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.helper}>
              Total percentage must equal 100%.
              Current Total Percentage:
              {totalPercentage}%
            </Text>

            <ScrollView>
              {milestones.map(
                (milestone, index) => (
                  <View
                    key={milestone.id}
                    style={styles.milestoneCard}
                  >
                    <Text
                      style={
                        styles.milestoneTitle
                      }
                    >
                      Milestone {index + 1}
                    </Text>

                    <TextInput
                      placeholder="Milestone Name"
                      value={milestone.name}
                      onChangeText={(text) =>
                        updateMilestone(
                          milestone.id,
                          "name",
                          text,
                        )
                      }
                      style={styles.input}
                    />

                    <View
                      style={
                        styles.rowInputs
                      }
                    >
                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={{
                            marginBottom: 10,
                          }}
                        >
                          Budget %
                        </Text>

                        <TextInput
                          keyboardType="numeric"
                          value={String(
                            milestone.pct,
                          )}
                          onChangeText={(
                            text,
                          ) =>
                            updateMilestone(
                              milestone.id,
                              "pct",
                              Number(
                                text,
                              ) || 0,
                            )
                          }
                          style={
                            styles.input
                          }
                        />
                      </View>

                      <View
                        style={{
                          flex: 1,
                        }}
                      >
                        <Text
                          style={{
                            marginBottom: 10,
                          }}
                        >
                          Duration
                        </Text>

                        <TextInput
                          keyboardType="numeric"
                          value={String(
                            milestone.durationDays,
                          )}
                          onChangeText={(
                            text,
                          ) =>
                            updateMilestone(
                              milestone.id,
                              "durationDays",
                              Number(
                                text,
                              ) || 0,
                            )
                          }
                          style={
                            styles.input
                          }
                        />
                      </View>
                    </View>

                    <TextInput
                      multiline
                      textAlignVertical="top"
                      placeholder="Acceptance Criteria"
                      value={
                        milestone.acceptanceCriteria
                      }
                      onChangeText={(text) =>
                        updateMilestone(
                          milestone.id,
                          "acceptanceCriteria",
                          text,
                        )
                      }
                      style={
                        styles.multiline
                      }
                    />
                  </View>
                ),
              )}

              <TouchableOpacity
                style={
                  styles.secondaryButton
                }
                onPress={addMilestone}
              >
                <Text
                  style={
                    styles.secondaryText
                  }
                >
                  + Add Milestone
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveMilestones}
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                Save Milestones
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* BOQ MODAL */}
      <Modal
        visible={showBoq}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowBoq(false)
        }
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          style={styles.overlay}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Add BOQ Item
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowBoq(false)
                }
              >
                <Text style={styles.close}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.smallLabel}>
                Category
              </Text>

              <ScrollView horizontal>
                {[
                  "Concrete",
                  "Steel",
                  "Timber",
                  "Finishes",
                  "Labor",
                  "Equipment",
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() =>
                      setBoqCategory(cat)
                    }
                    style={[
                      styles.categoryBtn,
                      boqCategory ===
                        cat && {
                        backgroundColor:
                          "#0F766E",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        boqCategory ===
                          cat && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                placeholder="Material name"
                value={material}
                onChangeText={setMaterial}
                style={styles.input}
              />

              <View
                style={styles.rowInputs}
              >
                <TextInput
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                  style={[
                    styles.input,
                    { flex: 1 },
                  ]}
                />

                <TextInput
                  placeholder="Unit"
                  value={unit}
                  onChangeText={setUnit}
                  style={[
                    styles.input,
                    { flex: 1 },
                  ]}
                />
              </View>

              <TextInput
                placeholder="Unit Price (RWF)"
                keyboardType="numeric"
                value={unitPrice}
                onChangeText={
                  setUnitPrice
                }
                style={styles.input}
              />

              <View
                style={
                  styles.totalPreview
                }
              >
                <Text
                  style={
                    styles.totalPreviewText
                  }
                >
                  Total:
                  {" "}
                  {(
                    (Number(
                      quantity,
                    ) || 0) *
                    (Number(
                      unitPrice,
                    ) || 0)
                  ).toLocaleString()}
                  {" "}
                  RWF
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={saveBoq}
              >
                <Text
                  style={
                    styles.primaryText
                  }
                >
                  Save BOQ Item
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DAILY PROGRESS */}
      <Modal
        visible={showProgress}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowProgress(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Daily Progress Upload
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowProgress(false)
                }
              >
                <Text style={styles.close}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabsRow}>
              <TouchableOpacity
                onPress={() =>
                  setDailyProgressTab(
                    "draft",
                  )
                }
                style={[
                  styles.tabButton,
                  dailyProgressTab ===
                    "draft" &&
                    styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    dailyProgressTab ===
                      "draft" &&
                      styles.activeTabText,
                  ]}
                >
                  Draft
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setDailyProgressTab(
                    "history",
                  )
                }
                style={[
                  styles.tabButton,
                  dailyProgressTab ===
                    "history" &&
                    styles.activeTab,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    dailyProgressTab ===
                      "history" &&
                      styles.activeTabText,
                  ]}
                >
                  History
                </Text>
              </TouchableOpacity>
            </View>

            {dailyProgressTab ===
            "draft" ? (
              <>
                <Text
                  style={styles.helper}
                >
                  Capture 5–10 photos
                  and optionally a
                  video.
                </Text>

                <TextInput
                  value={
                    draftDailyDescription
                  }
                  onChangeText={
                    setDraftDailyDescription
                  }
                  placeholder="Describe today's progress..."
                  multiline
                  textAlignVertical="top"
                  style={styles.multiline}
                />

                <View
                  style={
                    styles.rowInputs
                  }
                >
                  <TouchableOpacity
                    onPress={() =>
                      uploadDailyProgressMedia(
                        "photo",
                      )
                    }
                    style={[
                      styles.primaryButton,
                      { flex: 1 },
                    ]}
                  >
                    <Text
                      style={
                        styles.primaryText
                      }
                    >
                      Add Photo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      uploadDailyProgressMedia(
                        "video",
                      )
                    }
                    style={[
                      styles.secondaryButton,
                      {
                        flex: 1,
                        marginBottom: 0,
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.secondaryText
                      }
                    >
                      Add Video
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View
                    style={
                      styles.mediaGrid
                    }
                  >
                    {draftDailyMedia.map(
                      (m) => (
                        <View
                          key={m.id}
                          style={
                            styles.mediaCard
                          }
                        >
                          <Image
                            source={{
                              uri: m.uri,
                            }}
                            style={
                              styles.mediaImage
                            }
                          />

                          <Text
                            style={
                              styles.mediaType
                            }
                          >
                            {m.type.toUpperCase()}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  onPress={
                    saveDailyUpdate
                  }
                  style={
                    styles.primaryButton
                  }
                >
                  <Text
                    style={
                      styles.primaryText
                    }
                  >
                    Save Update
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <ScrollView>
                {dailyUpdates.map((u) => (
                  <View
                    key={u.id}
                    style={
                      styles.historyCard
                    }
                  >
                    <Text
                      style={
                        styles.historyDate
                      }
                    >
                      {formatDateTime(
                        u.createdAt,
                      )}
                    </Text>

                    <Text
                      style={
                        styles.historyText
                      }
                    >
                      {u.description}
                    </Text>

                    <View
                      style={
                        styles.mediaGrid
                      }
                    >
                      {u.media.map((m) => (
                        <Image
                          key={m.id}
                          source={{
                            uri: m.uri,
                          }}
                          style={
                            styles.historyImage
                          }
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function StatCard({
  value,
  label,
}: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function ActionCard({
  title,
  onPress,
}: any) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
    >
      <Text style={styles.actionTitle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    paddingTop: 16,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  badge: {
    backgroundColor: "#D1FAE5",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },

  badgeText: {
    color: "#065F46",
    fontWeight: "700",
  },

  progressText: {
    marginTop: 10,
    color: "#64748B",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  label: {
    color: "#475569",
    marginBottom: 6,
  },

  description: {
    lineHeight: 22,
    color: "#475569",
  },

  image: {
    width: 200,
    height: 140,
    borderRadius: 16,
    marginRight: 12,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingHorizontal: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F766E",
  },

  statLabel: {
    marginTop: 6,
    color: "#64748B",
  },

  actions: {
    padding: 16,
  },

  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },

  actionTitle: {
    fontWeight: "700",
    color: "#111827",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: "92%",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F766E",
  },

  close: {
    fontSize: 20,
    fontWeight: "900",
  },

  helper: {
    color: "#64748B",
    marginBottom: 16,
  },

  milestoneCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  milestoneTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 14,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },

  multiline: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 100,
    marginBottom: 14,
  },

  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#0F766E",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  secondaryText: {
    color: "#0F766E",
    fontWeight: "800",
  },

  primaryButton: {
    backgroundColor: "#0F766E",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  categoryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    backgroundColor: "#E2E8F0",
    marginRight: 10,
    marginBottom: 16,
  },

  categoryText: {
    fontWeight: "700",
    color: "#334155",
  },

  smallLabel: {
    marginBottom: 10,
    color: "#64748B",
    fontWeight: "700",
  },

  tabsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },

  tabText: {
    fontWeight: "700",
    color: "#64748B",
  },

  activeTabText: {
    color: "#fff",
  },

  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  mediaCard: {
    width: "48%",
    marginBottom: 12,
  },

  mediaImage: {
    width: "100%",
    height: 100,
    borderRadius: 14,
  },

  mediaType: {
    marginTop: 6,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
  },

  historyCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  historyDate: {
    color: "#0F766E",
    fontWeight: "800",
    marginBottom: 8,
    fontSize: 12,
  },

  historyText: {
    color: "#334155",
    marginBottom: 12,
  },

  historyImage: {
    width: "48%",
    height: 90,
    borderRadius: 12,
    marginBottom: 10,
  },

  milestoneHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  smallCreateBtn: {
    backgroundColor: "#0F766E",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  smallCreateBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  createdMilestoneCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  createdTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
  },

  createdInfo: {
    color: "#334155",
    marginBottom: 6,
  },

  createdDesc: {
    color: "#475569",
    marginBottom: 12,
  },

  boqTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  boqCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },

  boqText: {
    color: "#334155",
    marginBottom: 4,
  },

  boqTotal: {
    marginTop: 8,
    color: "#0F766E",
    fontWeight: "800",
  },

  finalTotal: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  totalPreview: {
    backgroundColor: "#ECFDF5",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },

  totalPreviewText: {
    color: "#065F46",
    fontWeight: "800",
    fontSize: 16,
  },
});