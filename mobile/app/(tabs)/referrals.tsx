import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, Share, StyleSheet } from "react-native";
import { REFERRAL_COMMISSION, formatCurrency } from "@finmora/shared";
import { fetchReferrals, type ReferralsData } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { MoneyText } from "@/components/MoneyText";
import { Badge, Card, EmptyState, ErrorState, LoadingState, Screen, ScreenTitle } from "@/components/ui";

export default function ReferralsScreen() {
  const { c } = useTheme();
  const [data, setData] = useState<ReferralsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchReferrals());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function shareCode() {
    if (!data) return;
    await Share.share({
      message: `Join Finmora with my referral code ${data.referralCode} and start investing!`,
    });
  }

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? "Failed to load"} />;

  return (
    <Screen>
      <ScreenTitle
        title="Referrals"
        subtitle={`Earn ${REFERRAL_COMMISSION}% commission on every deposit`}
      />

      <Card>
        <Text style={{ color: c.muted, fontSize: 13 }}>Your referral code</Text>
        <Text style={[styles.code, { color: c.accent }]}>{data.referralCode}</Text>
        <Pressable onPress={shareCode} style={[styles.shareBtn, { backgroundColor: c.accent }]}>
          <Text style={styles.shareText}>Share code</Text>
        </Pressable>
      </Card>

      <View style={styles.statsGrid}>
        {[
          { label: "Referrals", value: String(data.totalReferrals) },
          { label: "Total earned", value: formatCurrency(data.totalEarnings) },
          { label: "Pending", value: formatCurrency(data.pendingEarnings) },
          { label: "Available", value: formatCurrency(data.availableBalance) },
        ].map((s) => (
          <View key={s.label} style={[styles.stat, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statValue, { color: c.primary }]}>{s.value}</Text>
            <Text style={{ color: c.muted, fontSize: 11 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.section, { color: c.primary }]}>Your network</Text>
      {data.network.length === 0 ? (
        <EmptyState message="No referrals yet. Share your code to start earning." />
      ) : (
        data.network.map((u) => (
          <Card key={u.id}>
            <View style={styles.row}>
              <Text style={{ color: c.primary, fontWeight: "600" }}>{u.name}</Text>
              <Text style={{ color: c.muted, fontSize: 12 }}>{u.joinDate}</Text>
            </View>
            <Text style={{ color: c.muted, fontSize: 13, marginTop: 4 }}>
              Deposited {formatCurrency(u.totalDeposit)}
            </Text>
          </Card>
        ))
      )}

      <Text style={[styles.section, { color: c.primary }]}>Earnings history</Text>
      {data.earnings.length === 0 ? (
        <EmptyState message="No earnings yet." />
      ) : (
        data.earnings.map((e) => (
          <Card key={e.id}>
            <View style={styles.row}>
              <Text style={{ color: c.primary, fontWeight: "500" }}>{e.name}</Text>
              <Badge label={e.status} tone={e.status === "paid" ? "success" : "warning"} />
            </View>
            <View style={[styles.row, { marginTop: 6 }]}>
              <Text style={{ color: c.muted, fontSize: 12 }}>{e.date}</Text>
              <MoneyText amount={e.commission} size="sm" />
            </View>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>
              On deposit {formatCurrency(e.deposit)}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  code: { fontFamily: "monospace", fontSize: 28, fontWeight: "700", marginTop: 8 },
  shareBtn: { marginTop: 16, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  shareText: { color: "#fff", fontWeight: "600" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexGrow: 1,
  },
  statValue: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  section: { fontSize: 18, fontWeight: "600", marginTop: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
