import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const MENU_ITEMS = [
  { icon: "cash-outline" as const, label: "Withdrawals", soon: true },
  { icon: "trophy-outline" as const, label: "Leaderboard", soon: true },
  { icon: "settings-outline" as const, label: "Settings", soon: true },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuth();
  const { c } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 100,
      }}
    >
      <Text style={[styles.title, { color: c.primary }]}>More</Text>
      {user && (
        <Text style={[styles.subtitle, { color: c.muted }]}>
          {user.name} · {user.email}
        </Text>
      )}

      <View style={[styles.list, { backgroundColor: c.card, borderColor: c.border }]}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            style={[styles.row, { borderBottomColor: c.border }]}
          >
            <Ionicons name={item.icon} size={20} color={c.muted} />
            <Text style={[styles.rowLabel, { color: c.primary }]}>{item.label}</Text>
            {item.soon && (
              <Text style={[styles.soon, { color: c.muted }]}>Soon</Text>
            )}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  list: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  soon: {
    fontSize: 12,
  },
  logout: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
