import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { formatCurrency } from "@finmora/shared";
import { useTheme } from "@/lib/theme";
import { MoneyText } from "./MoneyText";

type PortfolioHeroProps = {
  userName: string;
  totalPortfolio: number;
  monthlyIncome: number;
  referralEarnings: number;
  sipBalance: number;
  kycStatus: string;
  activePlan: string | null;
};

export function PortfolioHero({
  userName,
  totalPortfolio,
  monthlyIncome,
  referralEarnings,
  sipBalance,
  kycStatus,
  activePlan,
}: PortfolioHeroProps) {
  const { c } = useTheme();
  const firstName = userName.split(" ")[0];

  const stats = [
    { label: "Monthly", value: monthlyIncome },
    { label: "Referral", value: referralEarnings },
    { label: "SIP", value: sipBalance },
  ];

  return (
    <LinearGradient
      colors={[c.heroFrom, c.heroTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back, {firstName}</Text>
          <Text style={styles.label}>TOTAL PORTFOLIO</Text>
        </View>
        {kycStatus === "verified" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Verified</Text>
          </View>
        )}
      </View>

      <MoneyText amount={totalPortfolio} size="xl" style={styles.total} />

      {activePlan && (
        <View style={styles.planPill}>
          <Text style={styles.planText}>{activePlan}</Text>
        </View>
      )}

      <Text style={styles.subtitle}>
        +{formatCurrency(monthlyIncome)} monthly income
      </Text>

      <View style={styles.chips}>
        {stats.map((s) => (
          <View key={s.label} style={styles.chip}>
            <MoneyText amount={s.value} size="sm" />
            <Text style={styles.chipLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  label: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },
  badge: {
    backgroundColor: "rgba(201,162,39,0.25)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.4)",
  },
  badgeText: {
    color: "#E8D5A3",
    fontSize: 11,
    fontWeight: "600",
  },
  total: {
    color: "#FFFFFF",
    marginTop: 16,
  },
  planPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  planText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 12,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  chip: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    marginTop: 4,
  },
});
