import { createContext, useContext, useMemo, type ReactNode } from "react";
import { colors, type ColorScheme } from "@finmora/theme";

type ThemeContextValue = {
  scheme: ColorScheme;
  c: (typeof colors)[ColorScheme];
};

const ThemeContext = createContext<ThemeContextValue>({
  scheme: "dark",
  c: colors.dark,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({ scheme: "dark" as const, c: colors.dark }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
