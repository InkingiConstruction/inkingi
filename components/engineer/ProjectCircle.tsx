import { Text, View } from "react-native";
import { COLORS } from "@/constants/colors";

export default function ProgressCircle({
  value,
}: {
  value: number;
}) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: COLORS.PRIMARY_LIGHT,
        borderColor: COLORS.PRIMARY,
        borderRadius: 28,
        borderWidth: 4,
        height: 56,
        justifyContent: "center",
        width: 56,
      }}
    >
      <Text style={{ color: COLORS.PRIMARY_DARK, fontSize: 12, fontWeight: "900" }}>
        {percent}%
      </Text>
    </View>
  );
}
