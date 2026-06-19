import { Tabs } from "expo-router";
import { TabBar } from "@/components/TabBar";
import { useTheme } from "@/lib/theme";

export default function TabsLayout() {
  const { c } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="invest" options={{ title: "Invest" }} />
      <Tabs.Screen name="referrals" options={{ title: "Referrals" }} />
      <Tabs.Screen name="sip" options={{ title: "SIP" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />
    </Tabs>
  );
}
