import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "pending_supervisor"
  | "approved";

type Project = {
  id: string;
  name: string;
  clientName: string;
  location: string;
  budget: number;
  coverImage: string;
};

type BoqItem = {
  id: string;
  category: string;
  material: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

type Milestone = {
  id: string;
  name: string;
  percentage: number;
  durationDays: number;
  status: MilestoneStatus;

  project: Project;

  boqItems: BoqItem[];

  completionPhotos: string[];

  completionNotes: string;
};

const boqCategories = [
  "Concrete",
  "Steel",
  "Timber",
  "Finishes",
  "Labor",
  "Equipment",
];

const units = [
  "bags",
  "cubic meters",
  "pieces",
  "lumpsum",
];

export default function MilestonesScreen() {
  const [showBoqModal, setShowBoqModal] =
    useState(false);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [selectedMilestone, setSelectedMilestone] =
    useState<Milestone | null>(null);

  const [milestones, setMilestones] = useState<
    Milestone[]
  >([
    {
      id: "1",
      name: "Foundation Works",
      percentage: 20,
      durationDays: 14,
      status: "in_progress",

      project: {
        id: "p1",
        name: "Luxury Villa Construction",
        clientName: "John Doe",
        location: "Nyarutarama, Kigali",
        budget: 85000000,
        coverImage:
          "https://picsum.photos/600/400",
      },

      boqItems: [],
      completionPhotos: [],
      completionNotes: "",
    },

    {
      id: "2",
      name: "Wall Construction",
      percentage: 35,
      durationDays: 25,
      status: "pending",

      project: {
        id: "p1",
        name: "Luxury Villa Construction",
        clientName: "John Doe",
        location: "Nyarutarama, Kigali",
        budget: 85000000,
        coverImage:
          "https://picsum.photos/601/400",
      },

      boqItems: [],
      completionPhotos: [],
      completionNotes: "",
    },
  ]);

  // BOQ STATES
  const [category, setCategory] =
    useState("Concrete");

  const [material, setMaterial] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [unit, setUnit] =
    useState("bags");

  const [unitPrice, setUnitPrice] =
    useState("");

  // PAYMENT STATES
  const [workComplete, setWorkComplete] =
    useState(false);

  const [completionPhotos, setCompletionPhotos] =
    useState<string[]>([]);

  const [completionNotes, setCompletionNotes] =
    useState("");

  const calculatedTotal = useMemo(() => {
    return (
      (Number(quantity) || 0) *
      (Number(unitPrice) || 0)
    );
  }, [quantity, unitPrice]);

  const openBoqModal = (
    milestone: Milestone
  ) => {
    setSelectedMilestone(milestone);
    setShowBoqModal(true);
  };

  const openPaymentModal = (
    milestone: Milestone
  ) => {
    setSelectedMilestone(milestone);
    setShowPaymentModal(true);
  };

  const saveBoqItem = () => {
    if (
      !material ||
      !quantity ||
      !unitPrice
    ) {
      Alert.alert(
        "Validation",
        "Please fill all fields"
      );

      return;
    }

    if (!selectedMilestone) return;

    const newItem: BoqItem = {
      id: Date.now().toString(),
      category,
      material,
      quantity: Number(quantity),
      unit,
      unitPrice: Number(unitPrice),
      total: calculatedTotal,
    };

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === selectedMilestone.id
          ? {
              ...m,
              boqItems: [
                ...m.boqItems,
                newItem,
              ],
            }
          : m
      )
    );

    setMaterial("");
    setQuantity("");
    setUnitPrice("");

    Alert.alert(
      "Success",
      "BOQ item added successfully"
    );

    setShowBoqModal(false);
  };

  const uploadCompletionPhoto =
    async () => {
      try {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (
          permission.status !== "granted"
        ) {
          Alert.alert(
            "Permission required",
            "Camera permission required"
          );

          return;
        }

        if (
          completionPhotos.length >= 10
        ) {
          Alert.alert(
            "Limit reached",
            "Maximum 10 photos allowed"
          );

          return;
        }

        const result =
          await ImagePicker.launchCameraAsync(
            {
              mediaTypes:
                ImagePicker.MediaTypeOptions.Images,
              quality: 1,
            }
          );

        if (result.canceled) return;

        const imageUri =
          result.assets[0].uri;

        /**
         * CLOUDINARY UPLOAD PLACEHOLDER
         */

        setCompletionPhotos((prev) => [
          ...prev,
          imageUri,
        ]);
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to upload image"
        );
      }
    };

  const submitForReview = () => {
    if (!selectedMilestone) return;

    if (!workComplete) {
      Alert.alert(
        "Validation",
        "Please confirm work completion"
      );

      return;
    }

    if (
      completionPhotos.length < 5
    ) {
      Alert.alert(
        "Validation",
        "Minimum 5 completion photos required"
      );

      return;
    }

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === selectedMilestone.id
          ? {
              ...m,
              status:
                "pending_supervisor",
              completionPhotos,
              completionNotes,
            }
          : m
      )
    );

    Alert.alert(
      "Submitted",
      "Milestone submitted for supervisor review"
    );

    setCompletionPhotos([]);
    setCompletionNotes("");
    setWorkComplete(false);

    setShowPaymentModal(false);
  };

  const getStatusColor = (
    status: MilestoneStatus
  ) => {
    switch (status) {
      case "pending":
        return "#F59E0B";

      case "in_progress":
        return "#2563EB";

      case "pending_supervisor":
        return "#7C3AED";

      case "approved":
        return "#059669";

      default:
        return "#64748B";
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
      >
        <Text style={styles.pageTitle}>
          Project Milestones
        </Text>

        {milestones.map(
          (milestone) => (
            <View
              key={milestone.id}
              style={styles.card}
            >
              {/* PROJECT DETAILS */}

              <Image
                source={{
                  uri:
                    milestone.project
                      .coverImage,
                }}
                style={
                  styles.projectImage
                }
                contentFit="cover"
              />

              <Text
                style={
                  styles.projectName
                }
              >
                {
                  milestone.project
                    .name
                }
              </Text>

              <Text
                style={
                  styles.projectInfo
                }
              >
                Client:{" "}
                {
                  milestone.project
                    .clientName
                }
              </Text>

              <Text
                style={
                  styles.projectInfo
                }
              >
                Location:{" "}
                {
                  milestone.project
                    .location
                }
              </Text>

              <Text
                style={
                  styles.projectInfo
                }
              >
                Budget:{" "}
                {milestone.project.budget.toLocaleString()}{" "}
                RWF
              </Text>

              {/* MILESTONE */}

              <View
                style={
                  styles.headerRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.milestoneTitle
                    }
                  >
                    {
                      milestone.name
                    }
                  </Text>

                  <Text
                    style={
                      styles.subText
                    }
                  >
                    {
                      milestone.percentage
                    }
                    % •{" "}
                    {
                      milestone.durationDays
                    }{" "}
                    days
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getStatusColor(
                          milestone.status
                        ),
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.statusText
                    }
                  >
                    {
                      milestone.status
                    }
                  </Text>
                </View>
              </View>

              {/* BOQ */}

              <View
                style={
                  styles.section
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Bill of Quantities
                </Text>

                {milestone.boqItems
                  .length === 0 ? (
                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    No BOQ items yet
                  </Text>
                ) : (
                  milestone.boqItems.map(
                    (
                      item
                    ) => (
                      <View
                        key={
                          item.id
                        }
                        style={
                          styles.boqCard
                        }
                      >
                        <Text
                          style={
                            styles.boqMaterial
                          }
                        >
                          {
                            item.material
                          }
                        </Text>

                        <Text
                          style={
                            styles.boqInfo
                          }
                        >
                          {
                            item.category
                          }
                        </Text>

                        <Text
                          style={
                            styles.boqInfo
                          }
                        >
                          Qty:{" "}
                          {
                            item.quantity
                          }{" "}
                          {
                            item.unit
                          }
                        </Text>

                        <Text
                          style={
                            styles.boqInfo
                          }
                        >
                          Unit Price:{" "}
                          {item.unitPrice.toLocaleString()}{" "}
                          RWF
                        </Text>

                        <Text
                          style={
                            styles.totalText
                          }
                        >
                          Total:{" "}
                          {item.total.toLocaleString()}{" "}
                          RWF
                        </Text>
                      </View>
                    )
                  )
                )}
              </View>

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={() =>
                  openBoqModal(
                    milestone
                  )
                }
              >
                <Text
                  style={
                    styles.primaryText
                  }
                >
                  + Create BOQ
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.secondaryButton
                }
                onPress={() =>
                  openPaymentModal(
                    milestone
                  )
                }
              >
                <Text
                  style={
                    styles.secondaryText
                  }
                >
                  Request Payment
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </ScrollView>

      {/* BOQ MODAL */}

      <Modal
        visible={showBoqModal}
        transparent
        animationType="slide"
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Add BOQ Item
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowBoqModal(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.close
                  }
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text
                style={
                  styles.label
                }
              >
                Category
              </Text>

              <ScrollView horizontal>
                {boqCategories.map(
                  (cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() =>
                        setCategory(
                          cat
                        )
                      }
                      style={[
                        styles.categoryBtn,
                        category ===
                          cat && {
                          backgroundColor:
                            "#0F766E",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          category ===
                            cat && {
                            color:
                              "#fff",
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>

              <TextInput
                placeholder="Material name"
                value={material}
                onChangeText={
                  setMaterial
                }
                style={styles.input}
              />

              <TextInput
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={
                  setQuantity
                }
                style={styles.input}
              />

              <Text
                style={
                  styles.label
                }
              >
                Unit
              </Text>

              <ScrollView horizontal>
                {units.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() =>
                      setUnit(u)
                    }
                    style={[
                      styles.categoryBtn,
                      unit === u && {
                        backgroundColor:
                          "#0F766E",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        unit === u && {
                          color:
                            "#fff",
                        },
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                placeholder="Unit price (RWF)"
                keyboardType="numeric"
                value={unitPrice}
                onChangeText={
                  setUnitPrice
                }
                style={styles.input}
              />

              <View
                style={
                  styles.totalBox
                }
              >
                <Text
                  style={
                    styles.totalLabel
                  }
                >
                  Auto Calculated
                  Total
                </Text>

                <Text
                  style={
                    styles.totalAmount
                  }
                >
                  {calculatedTotal.toLocaleString()}{" "}
                  RWF
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={
                  saveBoqItem
                }
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
        </View>
      </Modal>

      {/* PAYMENT MODAL */}

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View
              style={
                styles.modalHeader
              }
            >
              <Text
                style={
                  styles.modalTitle
                }
              >
                Request Payment
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setShowPaymentModal(
                    false
                  )
                }
              >
                <Text
                  style={
                    styles.close
                  }
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={
                styles.checkboxRow
              }
              onPress={() =>
                setWorkComplete(
                  !workComplete
                )
              }
            >
              <View
                style={[
                  styles.checkbox,
                  workComplete &&
                    styles.checkboxActive,
                ]}
              />

              <Text
                style={
                  styles.checkboxText
                }
              >
                Confirm work 100%
                complete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={
                uploadCompletionPhoto
              }
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                Upload Completion
                Photos
              </Text>
            </TouchableOpacity>

            <Text
              style={
                styles.photoCount
              }
            >
              Uploaded Photos:{" "}
              {
                completionPhotos.length
              }
              /10
            </Text>

            <View
              style={
                styles.mediaGrid
              }
            >
              {completionPhotos.map(
                (photo, index) => (
                  <Image
                    key={index}
                    source={{
                      uri: photo,
                    }}
                    style={
                      styles.photo
                    }
                  />
                )
              )}
            </View>

            <TextInput
              placeholder="Completion notes (optional)"
              multiline
              value={
                completionNotes
              }
              onChangeText={
                setCompletionNotes
              }
              style={
                styles.multiline
              }
            />

            <TouchableOpacity
              style={
                styles.submitButton
              }
              onPress={
                submitForReview
              }
            >
              <Text
                style={
                  styles.primaryText
                }
              >
                Submit for Review
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
    padding: 16,
    paddingTop: 44,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 18,
    color: "#111827",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  projectImage: {
    width: "100%",
    height: 180,
    borderRadius: 18,
    marginBottom: 14,
  },

  projectName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },

  projectInfo: {
    color: "#64748B",
    marginBottom: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginTop: 18,
  },

  milestoneTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  subText: {
    color: "#64748B",
    marginTop: 6,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
  },

  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  section: {
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111827",
  },

  emptyText: {
    color: "#64748B",
  },

  boqCard: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },

  boqMaterial: {
    fontWeight: "800",
    marginBottom: 6,
    color: "#111827",
  },

  boqInfo: {
    color: "#64748B",
    marginBottom: 3,
  },

  totalText: {
    marginTop: 8,
    color: "#0F766E",
    fontWeight: "800",
  },

  primaryButton: {
    backgroundColor: "#0F766E",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
  },

  submitButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "800",
  },

  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#0F766E",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },

  secondaryText: {
    color: "#0F766E",
    fontWeight: "800",
  },

  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.55)",
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
    justifyContent:
      "space-between",
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

  label: {
    marginBottom: 10,
    fontWeight: "700",
    color: "#475569",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  multiline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    minHeight: 120,
    textAlignVertical: "top",
    marginTop: 14,
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

  totalBox: {
    backgroundColor: "#F0FDFA",
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
  },

  totalLabel: {
    color: "#64748B",
    marginBottom: 6,
  },

  totalAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F766E",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    marginRight: 12,
  },

  checkboxActive: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },

  checkboxText: {
    fontWeight: "700",
    color: "#111827",
  },

  photoCount: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "700",
  },

  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },

  photo: {
    width: "48%",
    height: 110,
    borderRadius: 16,
    marginBottom: 12,
  },
});