import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Screen, ScreenTitle } from "@/components/ui";

const MENU_ITEMS = [
  { icon: "cash-outline" as const, label: "Withdrawals", href: "/(tabs)/more/withdrawals" },
  { icon: "trophy-outline" as const, label: "Leaderboard", href: "/(tabs)/more/leaderboard" },
  { icon: "settings-outline" as const, label: "Settings", href: "/(tabs)/more/settings" },
];

export default function MoreScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { c } = useTheme();

  return (
    <Screen padBottom={100}>
      <ScreenTitle title="More" />
      {user && (
        <Text style={[styles.subtitle, { color: c.muted }]}>
          {user.name} · {user.email}
        </Text>
      )}

      <View style={[styles.list, { backgroundColor: c.card, borderColor: c.border }]}>
        {MENU_ITEMS.map((item, i) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.href as never)}
            style={[
              styles.row,
              { borderBottomColor: c.border },
              i === MENU_ITEMS.length - 1 && styles.rowLast,
            ]}
          >
            <Ionicons name={item.icon} size={20} color={c.muted} />
            <Text style={[styles.rowLabel, { color: c.primary }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={c.muted} />
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={signOut}
        style={[styles.logout, { borderColor: `${c.destructive}40` }]}
      >
        <Ionicons name="log-out-outline" size={20} color={c.destructive} />
        <Text style={[styles.logoutText, { color: c.destructive }]}>Log out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, marginTop: -8 },
  list: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: "500" },
  logout: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
  },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
