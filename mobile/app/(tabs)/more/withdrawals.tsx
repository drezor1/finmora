import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { apiPost, fetchWithdrawals, type Withdrawal, type WithdrawalLimits } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { MoneyText } from "@/components/MoneyText";
import { Badge, Card, EmptyState, ErrorState, LoadingState, Screen } from "@/components/ui";
import { formatCurrency } from "@finmora/shared";

export default function WithdrawalsScreen() {
  const { c } = useTheme();
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [limits, setLimits] = useState<WithdrawalLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"monthly_income" | "referral_income">("monthly_income");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithdrawals();
      setItems(data.items);
      setLimits(data.limits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxAmount =
    type === "monthly_income"
      ? limits?.monthlyAvailable ?? 0
      : limits?.referralAvailable ?? 0;

  const canSubmit =
    type === "monthly_income" ? limits?.canWithdrawMonthly : limits?.canWithdrawReferral;

  async function handleSubmit() {
    const value = Number(amount);
    if (!value || value > maxAmount) {
      Alert.alert("Invalid amount", `Enter up to ${formatCurrency(maxAmount)}`);
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/api/withdrawals", { amount: value, type });
      setAmount("");
      Alert.alert("Submitted", "Your withdrawal request is under review.");
      await load();
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !limits) return <LoadingState />;
  if (error && !limits) return <ErrorState message={error} />;

  return (
    <Screen>
      {limits && (
        <View style={styles.statsRow}>
          <Card>
            <Text style={{ color: c.muted, fontSize: 12 }}>Monthly available</Text>
            <MoneyText amount={limits.monthlyAvailable} size="md" style={{ color: c.primary }} />
            {!limits.canWithdrawMonthly && (
              <Text style={{ color: c.muted, fontSize: 11, marginTop: 4 }}>
                Available in {limits.daysUntilMonthly} days
              </Text>
            )}
          </Card>
          <Card>
            <Text style={{ color: c.muted, fontSize: 12 }}>Referral available</Text>
            <MoneyText amount={limits.referralAvailable} size="md" style={{ color: c.primary }} />
          </Card>
        </View>
      )}

      <Card>
        <Text style={{ color: c.primary, fontWeight: "600", marginBottom: 12 }}>Request withdrawal</Text>
        <View style={styles.typeRow}>
          {(
            [
              { key: "monthly_income" as const, label: "Monthly" },
              { key: "referral_income" as const, label: "Referral" },
            ] as const
          ).map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setType(t.key)}
              style={[
                styles.typeChip,
                {
                  backgroundColor: type === t.key ? c.accent : c.background,
                  borderColor: c.border,
                },
              ]}
            >
              <Text style={{ color: type === t.key ? "#fff" : c.primary, fontWeight: "600" }}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          placeholder={`Max ${formatCurrency(maxAmount)}`}
          placeholderTextColor={c.mutedForeground}
          style={[styles.input, { color: c.primary, borderColor: c.border }]}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={submitting || !canSubmit}
          style={[
            styles.btn,
            {
              backgroundColor: canSubmit ? c.accent : c.muted,
              marginTop: 12,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              {canSubmit ? "Submit request" : "Withdrawal not available"}
            </Text>
          )}
        </Pressable>
      </Card>

      <Text style={[styles.section, { color: c.primary }]}>History</Text>
      {items.length === 0 ? (
        <EmptyState message="No withdrawal requests yet." />
      ) : (
        items.map((w) => (
          <Card key={w.id}>
            <View style={styles.row}>
              <MoneyText amount={w.amount} size="sm" style={{ color: c.primary }} />
              <Badge
                label={w.status}
                tone={
                  w.status === "approved" ? "success" : w.status === "rejected" ? "default" : "warning"
                }
              />
            </View>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
              {w.type === "monthly_income" ? "Monthly income" : "Referral income"} · {w.requestedAt}
            </Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: "row", gap: 10 },
  section: { fontSize: 18, fontWeight: "600" },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  typeChip: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
