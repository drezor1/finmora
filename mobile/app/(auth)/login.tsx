import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { c } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[c.heroFrom, c.heroTo]} style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.inner}>
        <View>
          <Text style={styles.brand}>Finmora</Text>
          <Text style={styles.subtitle}>Sign in to your portfolio</Text>
        </View>

        <View style={[styles.form, { backgroundColor: c.card, borderColor: c.border }]}>
          {error && (
            <Text style={[styles.error, { color: c.destructive }]}>{error}</Text>
          )}

          <Text style={[styles.label, { color: c.muted }]}>Email or mobile</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={c.mutedForeground}
            style={[styles.input, { color: c.primary, borderColor: c.border }]}
          />

          <Text style={[styles.label, { color: c.muted }]}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={c.mutedForeground}
            style={[styles.input, { color: c.primary, borderColor: c.border }]}
          />

          <Pressable
            onPress={handleLogin}
            disabled={loading || !email || !password}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: c.accent, opacity: pressed || loading ? 0.85 : 1 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 32,
  },
  brand: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
    fontSize: 16,
  },
  form: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    gap: 8,
  },
  label: {
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    marginTop: 16,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    fontSize: 14,
    marginBottom: 4,
  },
});
