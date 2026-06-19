import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { PortfolioHero } from "@/components/PortfolioHero";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userMe, loading, refreshUserMe } = useAuth();
  const { c } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUserMe();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUserMe]);

  async function shareReferral() {
    if (!userMe) return;
    await Share.share({
      message: `Join Finmora with my code ${userMe.user.referralCode}!`,
    });
  }

  if (loading && !userMe) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  if (!userMe) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={{ color: c.muted }}>Unable to load portfolio</Text>
      </View>
    );
  }

  const { user, stats } = userMe;
  const totalPortfolio = stats.totalInvestment + stats.sipBalance;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 100,
        gap: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={c.accent}
        />
      }
    >
      <PortfolioHero
        userName={user.name}
        totalPortfolio={totalPortfolio}
        monthlyIncome={stats.monthlyIncome}
        referralEarnings={stats.referralEarnings}
        sipBalance={stats.sipBalance}
        kycStatus={user.kycStatus}
        activePlan={user.activePlan}
      />

      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push("/(tabs)/invest")}
          style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Text style={[styles.actionText, { color: c.primary }]}>Invest</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)/more/withdrawals")}
          style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Text style={[styles.actionText, { color: c.primary }]}>Withdraw</Text>
        </Pressable>
        <Pressable
          onPress={shareReferral}
          style={[styles.actionBtn, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Text style={[styles.actionText, { color: c.primary }]}>Share</Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.cardTitle, { color: c.primary }]}>Referral code</Text>
        <Text style={[styles.code, { color: c.accent }]}>{user.referralCode}</Text>
        <Text style={[styles.meta, { color: c.muted }]}>
          {user.referralCount} referrals · Member since {user.memberSince}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  code: {
    fontFamily: "monospace",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
  meta: {
    fontSize: 13,
    marginTop: 8,
  },
});
