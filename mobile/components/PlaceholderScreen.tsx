import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/theme";

type PlaceholderScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderScreen({ title, subtitle }: PlaceholderScreenProps) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: c.background,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 100,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${c.accent}20` }]}>
        <Ionicons name="construct-outline" size={32} color={c.accent} />
      </View>
      <Text style={[styles.title, { color: c.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});
