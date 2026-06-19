import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme";

export default function MoreLayout() {
  const { c } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.primary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="withdrawals" options={{ title: "Withdrawals" }} />
      <Stack.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}
