// screens/DashboardScreen.tsx

import React, {
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
} from "react-native";

import { projects } from "../../components/engineer/data/project";
import ProjectCard from "../../components/engineer/cards/ProjectCard";
import StatCard from "../../components/engineer/cards/StatCard";
import StatusTabs from "../../components/engineer/ProjectStatusTab";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const filteredProjects = useMemo(() => {
    if (selectedStatus === "All") {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.status === selectedStatus
    );
  }, [selectedStatus]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ProjectCard project={item} />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.welcome}>
              Welcome!
            </Text>

            <Text style={styles.name}>
              Mucyo Herve
            </Text>

            <TextInput
              placeholder="Enter project name"
              style={styles.search}
            />

            <View style={styles.statsContainer}>
              <StatCard
                title="Active Project"
                value={1}
                subtitle="This month"
              />

              <StatCard
                title="Total Budget"
                value="53,000,000"
                subtitle="Managed"
              />

              <StatCard
                title="Pending Milestones"
                value={0}
                subtitle="2 in review"
              />

              <StatCard
                title="Completion Rate"
                value="3%"
                subtitle="Above average"
              />
            </View>

            <View style={styles.projectHeader}>
              <Text style={styles.sectionTitle}>
                Latest Projects
              </Text>

              <Text style={styles.viewAll}>
                View All
              </Text>
            </View>

            <StatusTabs
              selectedStatus={selectedStatus}
              onSelect={setSelectedStatus}
            />
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },

  welcome: {
    fontSize: 20,
    fontWeight: "500",
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#00897B",
    marginBottom: 20,
  },

  search: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  projectHeader: {
    marginTop: 20,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00897B",
  },

  viewAll: {
    color: "#3F6FFF",
    fontWeight: "600",
  },
});