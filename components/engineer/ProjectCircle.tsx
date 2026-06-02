// components/ProgressCircle.tsx

import CircularProgress from "react-native-circular-progress-indicator";

export default function ProgressCircle({
  value,
}: {
  value: number;
}) {
  return (
    <CircularProgress
      value={value}
      radius={28}
      activeStrokeWidth={6}
      inActiveStrokeWidth={6}
      progressValueColor="#111"
      valueSuffix="%"
    />
  );
}