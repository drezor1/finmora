import { useCallback, useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { apiPatch, fetchKyc, fetchUserMe } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Badge, Card, ErrorState, LoadingState, Screen } from "@/components/ui";

export default function SettingsScreen() {
  const { c } = useTheme();
  const { refreshUserMe } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [kycStatus, setKycStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, kyc] = await Promise.all([fetchUserMe(), fetchKyc()]);
      setName(me.user.name);
      setMobile(me.user.mobile);
      setEmail(me.user.email);
      setReferralCode(me.user.referralCode);
      setKycStatus(kyc.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    try {
      await apiPatch("/api/users/me", { name, mobile });
      await refreshUserMe();
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  const kycTone =
    kycStatus === "verified" ? "success" : kycStatus === "rejected" ? "default" : "warning";

  return (
    <Screen>
      <Card>
        <View style={styles.row}>
          <Text style={{ color: c.primary, fontWeight: "600" }}>KYC status</Text>
          <Badge label={kycStatus} tone={kycTone} />
        </View>
        {kycStatus !== "verified" && (
          <Text style={{ color: c.muted, fontSize: 12, marginTop: 8 }}>
            Complete KYC on finmora.vercel.app to enable withdrawals.
          </Text>
        )}
      </Card>

      <Card>
        <Text style={[styles.label, { color: c.muted }]}>Full name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { color: c.primary, borderColor: c.border }]}
        />
        <Text style={[styles.label, { color: c.muted }]}>Mobile</Text>
        <TextInput
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          style={[styles.input, { color: c.primary, borderColor: c.border }]}
        />
        <Text style={[styles.label, { color: c.muted }]}>Email</Text>
        <Text style={[styles.readonly, { color: c.muted }]}>{email}</Text>
        <Text style={[styles.label, { color: c.muted }]}>Referral code</Text>
        <Text style={[styles.readonly, { color: c.accent, fontFamily: "monospace" }]}>
          {referralCode}
        </Text>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[styles.btn, { backgroundColor: c.accent, marginTop: 16 }]}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save profile</Text>
          )}
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 13, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  readonly: { fontSize: 16, paddingVertical: 4 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});
