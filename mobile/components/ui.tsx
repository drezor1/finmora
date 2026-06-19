import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";

export function Screen({
  children,
  scroll = true,
  padBottom = 100,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padBottom?: number;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const contentStyle = {
    paddingTop: insets.top + 16,
    paddingHorizontal: 16,
    paddingBottom: insets.bottom + padBottom,
    gap: 16 as const,
  };

  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: c.background }, style]}>
        <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: c.background }, style]}
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { c } = useTheme();
  return (
    <View>
      <Text style={[styles.title, { color: c.primary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {children}
    </View>
  );
}

export function Badge({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "accent" | "success" | "warning";
}) {
  const { c } = useTheme();
  const colors = {
    default: { bg: `${c.muted}20`, text: c.muted },
    accent: { bg: `${c.accent}20`, text: c.accent },
    success: { bg: `${c.success}20`, text: c.success },
    warning: { bg: `${c.gold}20`, text: c.gold },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

export function LoadingState() {
  const { c } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={c.accent} />
    </View>
  );
}

export function ErrorState({ message }: { message: string }) {
  const { c } = useTheme();
  return (
    <View style={styles.center}>
      <Text style={{ color: c.destructive, textAlign: "center" }}>{message}</Text>
    </View>
  );
}

export function EmptyState({ message }: { message: string }) {
  const { c } = useTheme();
  return (
    <Text style={{ color: c.muted, textAlign: "center", paddingVertical: 24 }}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
