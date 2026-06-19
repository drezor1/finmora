import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { INVESTMENT_PLANS, formatCurrency } from "@finmora/shared";
import {
  apiPost,
  buildMobilePayUrl,
  fetchInvestments,
  getStoredToken,
  type CreateOrderResponse,
  type Investment,
} from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { MoneyText } from "@/components/MoneyText";
import { Badge, Card, EmptyState, ErrorState, LoadingState, Screen, ScreenTitle } from "@/components/ui";

export default function InvestScreen() {
  const { c } = useTheme();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<(typeof INVESTMENT_PLANS)[number] | null>(null);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInvestments(await fetchInvestments());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleInvest() {
    if (!selectedPlan) return;
    const value = Number(amount);
    if (!Number.isInteger(value) || value < selectedPlan.min || value > selectedPlan.max) {
      Alert.alert(
        "Invalid amount",
        `Enter between ${formatCurrency(selectedPlan.min)} and ${formatCurrency(selectedPlan.max)}`
      );
      return;
    }

    setPaying(true);
    try {
      const order = await apiPost<CreateOrderResponse>("/api/payments/create-order", {
        planSlug: selectedPlan.id,
        amount: value,
      });
      const token = await getStoredToken();
      if (!token) throw new Error("Session expired. Please log in again.");

      const url = buildMobilePayUrl(order, token);
      await WebBrowser.openBrowserAsync(url);
      setSelectedPlan(null);
      setAmount("");
      await load();
    } catch (e) {
      Alert.alert("Payment", e instanceof Error ? e.message : "Failed to start payment");
    } finally {
      setPaying(false);
    }
  }

  if (loading && investments.length === 0) return <LoadingState />;
  if (error && investments.length === 0) return <ErrorState message={error} />;

  return (
    <Screen>
      <ScreenTitle title="Invest" subtitle="Grow your portfolio with Infinity plans" />

      {investments.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text style={[styles.section, { color: c.primary }]}>Active investments</Text>
          {investments
            .filter((i) => i.status === "active")
            .map((inv) => (
              <Card key={inv.id}>
                <View style={styles.row}>
                  <Badge label={inv.plan} tone="accent" />
                  <Badge label={inv.status} />
                </View>
                <MoneyText amount={inv.amount} size="lg" style={{ color: c.primary, marginTop: 8 }} />
                <Text style={{ color: c.muted, fontSize: 13, marginTop: 4 }}>
                  {inv.roi}% ROI · {formatCurrency(inv.monthlyIncome)}/mo
                </Text>
                {inv.nextPayout && (
                  <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
                    Next payout: {inv.nextPayout}
                  </Text>
                )}
              </Card>
            ))}
        </View>
      )}

      <Text style={[styles.section, { color: c.primary }]}>Choose a plan</Text>
      {INVESTMENT_PLANS.map((plan) => (
        <Pressable
          key={plan.id}
          onPress={() => {
            setSelectedPlan(plan);
            setAmount(String(plan.min));
          }}
        >
          <Card>
            <View style={styles.row}>
              <Text style={[styles.planName, { color: c.primary }]}>{plan.name}</Text>
              {"popular" in plan && plan.popular && <Badge label="Popular" tone="warning" />}
            </View>
            <Text style={{ color: c.muted, fontSize: 13 }}>
              {formatCurrency(plan.min)} – {formatCurrency(plan.max)}
            </Text>
            <Text style={{ color: c.accent, fontSize: 15, fontWeight: "600", marginTop: 6 }}>
              {plan.roi}% monthly ROI
            </Text>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 8 }}>Tap to invest →</Text>
          </Card>
        </Pressable>
      ))}

      {investments.length === 0 && !loading && (
        <EmptyState message="No investments yet. Pick a plan above to get started." />
      )}

      <Modal visible={!!selectedPlan} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.modalTitle, { color: c.primary }]}>
              Invest — {selectedPlan?.name}
            </Text>
            <Text style={{ color: c.muted, fontSize: 13, marginBottom: 12 }}>
              {selectedPlan &&
                `${formatCurrency(selectedPlan.min)} – ${formatCurrency(selectedPlan.max)} · ${selectedPlan.roi}%/mo`}
            </Text>
            <Text style={{ color: c.muted, fontSize: 13 }}>Amount (₹)</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="number-pad"
              style={[styles.input, { color: c.primary, borderColor: c.border }]}
            />
            {selectedPlan && (
              <Text style={{ color: c.accent, fontSize: 13, marginTop: 8 }}>
                Est. monthly income:{" "}
                {formatCurrency(Math.round((Number(amount) || 0) * (selectedPlan.roi / 100)))}
              </Text>
            )}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setSelectedPlan(null)}
                style={[styles.modalBtn, { borderColor: c.border }]}
              >
                <Text style={{ color: c.primary }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleInvest}
                disabled={paying}
                style={[styles.modalBtn, { backgroundColor: c.accent, borderColor: c.accent }]}
              >
                {paying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Pay with Razorpay</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 18, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planName: { fontSize: 17, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 6,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
});
