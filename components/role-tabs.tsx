import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { COLORS } from "@/constants/colors";

type TabIcon = keyof typeof Ionicons.glyphMap;

export type RoleTab = {
  name: string;
  title: string;
  icon: TabIcon;
};

type RoleTabsProps = {
  tabs: RoleTab[];
  hiddenRoutes?: string[];
};

export function RoleTabs({ tabs, hiddenRoutes = [] }: RoleTabsProps) {
  const tabNames = new Set(tabs.map((tab) => tab.name));
  const hiddenOnlyRoutes = hiddenRoutes.filter((name) => !tabNames.has(name));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_LIGHT,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          paddingBottom: Platform.OS === "android" ? 2 : 0,
        },
        tabBarStyle: {
          backgroundColor: COLORS.SURFACE,
          borderTopColor: COLORS.BORDER_LIGHT,
          borderTopWidth: 1,
          elevation: 10,
          height: Platform.OS === "ios" ? 86 : 68,
          paddingBottom: Platform.OS === "ios" ? 22 : 8,
          paddingTop: 8,
          shadowColor: "#064E3B",
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? tab.icon : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
      {hiddenOnlyRoutes.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null }}
        />
      ))}
    </Tabs>
  );
}
