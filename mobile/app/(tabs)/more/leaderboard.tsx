import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { fetchLeaderboard, type LeaderboardEntry } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@finmora/shared";
import { Badge, Card, EmptyState, ErrorState, LoadingState, Screen } from "@/components/ui";

function RankBadge({ rank }: { rank: number }) {
  const { c } = useTheme();
  if (rank === 1) return <Badge label="🥇 #1" tone="warning" />;
  if (rank === 2) return <Badge label="🥈 #2" tone="default" />;
  if (rank === 3) return <Badge label="🥉 #3" tone="accent" />;
  return <Text style={{ color: c.muted, fontWeight: "700" }}>#{rank}</Text>;
}

export default function LeaderboardScreen() {
  const { c } = useTheme();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <Screen>
      {entries.length >= 3 && (
        <View style={styles.podium}>
          {entries.slice(0, 3).map((e) => (
            <Card key={e.rank}>
              <RankBadge rank={e.rank} />
              <Text style={[styles.name, { color: c.primary }]} numberOfLines={1}>
                {e.name}
                {e.isYou ? " (You)" : ""}
              </Text>
              <Text style={{ color: c.accent, fontSize: 22, fontWeight: "700" }}>{e.referrals}</Text>
              <Text style={{ color: c.muted, fontSize: 11 }}>referrals</Text>
              <Text style={{ color: c.muted, fontSize: 13, marginTop: 4 }}>
                {formatCurrency(e.earnings)}
              </Text>
            </Card>
          ))}
        </View>
      )}

      <Text style={[styles.section, { color: c.primary }]}>Full rankings</Text>
      {entries.length === 0 ? (
        <EmptyState message="No leaderboard data yet." />
      ) : (
        entries.map((e) => (
          <Card key={e.rank}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <RankBadge rank={e.rank} />
                <Text style={{ color: c.primary, fontWeight: e.isYou ? "700" : "500" }}>
                  {e.name}
                  {e.isYou ? " (You)" : ""}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: c.accent, fontWeight: "600" }}>{e.referrals} refs</Text>
                <Text style={{ color: c.muted, fontSize: 12 }}>{formatCurrency(e.earnings)}</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  podium: { flexDirection: "row", gap: 8 },
  name: { fontWeight: "600", marginTop: 8, marginBottom: 4 },
  section: { fontSize: 18, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
});
