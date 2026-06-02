// components/StatusTabs.tsx

import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const statuses = [
  "All",
  "Pending",
  "Active",
  "Completed",
  "Cancelled",
];

interface Props {
  selectedStatus: string;
  onSelect: (status: string) => void;
}

export default function StatusTabs({
  selectedStatus,
  onSelect,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {statuses.map((status) => {
        const active = selectedStatus === status;

        return (
          <TouchableOpacity
            key={status}
            style={[
              styles.tab,
              active && styles.activeTab,
            ]}
            onPress={() => onSelect(status)}
          >
            <Text
              style={[
                styles.tabText,
                active && styles.activeText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
    marginRight: 10,
  },

  activeTab: {
    backgroundColor: "#00897B",
  },

  tabText: {
    color: "#666",
    fontWeight: "600",
  },

  activeText: {
    color: "#fff",
  },
});