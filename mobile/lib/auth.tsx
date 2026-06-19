import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSegments } from "expo-router";
import {
  clearStoredToken,
  fetchUserMe,
  getStoredToken,
  login as apiLogin,
  setStoredToken,
  type LoginResponse,
  type UserMeResponse,
} from "./api";

type AuthUser = LoginResponse["user"];

type AuthContextValue = {
  user: AuthUser | null;
  userMe: UserMeResponse | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userMe, setUserMe] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const refreshUserMe = useCallback(async () => {
    const me = await fetchUserMe();
    setUserMe(me);
    setUser({
      id: me.user.id,
      name: me.user.name,
      email: me.user.email,
      role: "USER",
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          await refreshUserMe();
        }
      } catch {
        await clearStoredToken();
        setUser(null);
        setUserMe(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [refreshUserMe]);

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";

    if (!user && !inAuth) {
      router.replace("/(auth)/login");
    } else if (user && inAuth) {
      router.replace("/(tabs)");
    }
  }, [user, loading, segments, router]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      await setStoredToken(res.accessToken);
      setUser(res.user);
      await refreshUserMe();
    },
    [refreshUserMe]
  );

  const signOut = useCallback(async () => {
    await clearStoredToken();
    setUser(null);
    setUserMe(null);
    router.replace("/(auth)/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, userMe, loading, signIn, signOut, refreshUserMe }),
    [user, userMe, loading, signIn, signOut, refreshUserMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
