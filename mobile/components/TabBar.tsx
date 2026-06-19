import { View, Text, Pressable, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/lib/theme";

const TAB_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }
> = {
  index: { label: "Home", icon: "home-outline", iconActive: "home" },
  invest: { label: "Invest", icon: "wallet-outline", iconActive: "wallet" },
  referrals: { label: "Referrals", icon: "share-social-outline", iconActive: "share-social" },
  sip: { label: "SIP", icon: "cash-outline", iconActive: "cash" },
  more: { label: "More", icon: "menu-outline", iconActive: "menu" },
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <BlurView intensity={80} tint="dark" style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? {
            label: route.name,
            icon: "ellipse-outline" as const,
            iconActive: "ellipse" as const,
          };

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tab, focused && styles.tabActive]}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
            >
              {focused && <View style={[styles.dot, { backgroundColor: c.accent }]} />}
              <Ionicons
                name={focused ? config.iconActive : config.icon}
                size={22}
                color={focused ? c.accent : c.muted}
                style={focused ? styles.iconActive : undefined}
              />
              <Text
                style={[
                  styles.label,
                  { color: focused ? c.accent : c.muted },
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
  },
  bar: {
    flexDirection: "row",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(17,24,39,0.75)",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 2,
  },
  tabActive: {
    transform: [{ scale: 1.02 }],
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  iconActive: {
    transform: [{ scale: 1.05 }],
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
});
