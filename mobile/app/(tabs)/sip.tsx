import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SIP_OPTIONS, formatCurrency } from "@finmora/shared";
import { apiPatch, apiPost, fetchSip, type SipData } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { MoneyText } from "@/components/MoneyText";
import { Badge, Card, ErrorState, LoadingState, Screen, ScreenTitle } from "@/components/ui";

export default function SipScreen() {
  const { c } = useTheme();
  const [sip, setSip] = useState<SipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<1 | 3 | 5>(3);
  const [percent, setPercent] = useState(30);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSip();
      setSip(data);
      setSelectedYears(data.lockYears);
      setPercent(data.percentOfIncome);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleEnroll() {
    setSaving(true);
    try {
      const data = await apiPost<SipData>("/api/sip", {
        lockYears: selectedYears,
        percentOfIncome: percent,
      });
      setSip(data);
      Alert.alert("SIP enrolled", "Your systematic investment plan is now active.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to enroll");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      const data = await apiPatch<SipData>("/api/sip", { percentOfIncome: percent });
      setSip(data);
      Alert.alert("Updated", "SIP allocation saved.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error && !sip) return <ErrorState message={error} />;
  if (!sip) return null;

  const previewAmount = Math.round(sip.grossMonthlyIncome * (percent / 100));

  return (
    <Screen>
      <ScreenTitle title="SIP" subtitle="Systematic investment from monthly income" />

      {sip.active ? (
        <>
          <Card>
            <View style={styles.row}>
              <Badge label={sip.status ?? "active"} tone="success" />
              <Text style={{ color: c.muted, fontSize: 12 }}>{sip.daysRemaining} days left</Text>
            </View>
            <MoneyText amount={sip.totalContributed} size="lg" style={{ color: c.primary, marginTop: 8 }} />
            <Text style={{ color: c.muted, fontSize: 13, marginTop: 4 }}>
              {sip.percentOfIncome}% of income · {formatCurrency(sip.monthlyContribution)}/mo
            </Text>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
              {sip.startDate} → {sip.endDate}
            </Text>
            <Text style={{ color: c.accent, fontSize: 13, marginTop: 8 }}>
              Projected: {formatCurrency(sip.projectedValue)}
            </Text>
          </Card>

          <Card>
            <Text style={{ color: c.primary, fontWeight: "600", marginBottom: 8 }}>
              Adjust allocation ({percent}%)
            </Text>
            <View style={styles.percentRow}>
              {[30, 40, 50].map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPercent(p)}
                  style={[
                    styles.percentChip,
                    {
                      backgroundColor: percent === p ? c.accent : c.background,
                      borderColor: c.border,
                    },
                  ]}
                >
                  <Text style={{ color: percent === p ? "#fff" : c.primary, fontWeight: "600" }}>
                    {p}%
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 8 }}>
              New monthly: {formatCurrency(previewAmount)}
            </Text>
            <Pressable
              onPress={handleUpdate}
              disabled={saving}
              style={[styles.btn, { backgroundColor: c.accent, marginTop: 12 }]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Save changes</Text>
              )}
            </Pressable>
          </Card>

          {sip.history.length > 0 && (
            <>
              <Text style={[styles.section, { color: c.primary }]}>Contribution history</Text>
              {sip.history.map((h) => (
                <Card key={h.month}>
                  <View style={styles.row}>
                    <Text style={{ color: c.primary }}>{h.month}</Text>
                    <MoneyText amount={h.amount} size="sm" />
                  </View>
                </Card>
              ))}
            </>
          )}
        </>
      ) : sip.canEnroll ? (
        <Card>
          <Text style={{ color: c.primary, fontWeight: "600", fontSize: 17 }}>Enroll in SIP</Text>
          <Text style={{ color: c.muted, fontSize: 13, marginTop: 6 }}>
            Auto-invest {percent}% of your {formatCurrency(sip.grossMonthlyIncome)} monthly income.
          </Text>

          <Text style={[styles.label, { color: c.muted }]}>Lock period</Text>
          <View style={styles.percentRow}>
            {SIP_OPTIONS.map((o) => (
              <Pressable
                key={o.years}
                onPress={() => setSelectedYears(o.years)}
                style={[
                  styles.percentChip,
                  {
                    backgroundColor: selectedYears === o.years ? c.accent : c.background,
                    borderColor: c.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedYears === o.years ? "#fff" : c.primary,
                    fontWeight: "600",
                  }}
                >
                  {o.years}y
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: c.muted }]}>Allocation</Text>
          <View style={styles.percentRow}>
            {[30, 40, 50].map((p) => (
              <Pressable
                key={p}
                onPress={() => setPercent(p)}
                style={[
                  styles.percentChip,
                  {
                    backgroundColor: percent === p ? c.accent : c.background,
                    borderColor: c.border,
                  },
                ]}
              >
                <Text style={{ color: percent === p ? "#fff" : c.primary, fontWeight: "600" }}>
                  {p}%
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ color: c.accent, fontSize: 14, marginTop: 12 }}>
            Monthly SIP: {formatCurrency(previewAmount)}
          </Text>

          <Pressable
            onPress={handleEnroll}
            disabled={saving}
            style={[styles.btn, { backgroundColor: c.accent, marginTop: 16 }]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Start SIP</Text>
            )}
          </Pressable>
        </Card>
      ) : (
        <Card>
          <Text style={{ color: c.primary, fontWeight: "600" }}>SIP not available yet</Text>
          <Text style={{ color: c.muted, fontSize: 13, marginTop: 8 }}>
            You need an active investment with monthly income before enrolling in SIP.
          </Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  section: { fontSize: 18, fontWeight: "600" },
  label: { fontSize: 13, marginTop: 16, marginBottom: 8 },
  percentRow: { flexDirection: "row", gap: 8 },
  percentChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
