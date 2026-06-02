// components/StatCard.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

interface Props {
  title: string;
  value: string | number;
  subtitle: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 15,
    color: "#444",
    fontWeight: "600",
  },

  value: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 10,
  },

  subtitle: {
    marginTop: 8,
    color: "#B99A4B",
    fontSize: 12,
  },
});