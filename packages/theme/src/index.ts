export { colors, type ThemeColors, type ColorScheme } from "./colors";
export { spacing, radii, typography } from "./spacing";

import { colors } from "./colors";

export function cssVariables(scheme: "light" | "dark" = "light"): Record<string, string> {
  const c = colors[scheme];
  return {
    "--background": c.background,
    "--foreground": c.primary,
    "--primary": c.primary,
    "--primary-foreground": c.primaryForeground,
    "--accent": c.accent,
    "--accent-dark": c.accentDark,
    "--accent-glow": c.accentGlow,
    "--gold": c.gold,
    "--gold-light": c.goldLight,
    "--muted": c.muted,
    "--muted-foreground": c.mutedForeground,
    "--card": c.card,
    "--card-foreground": c.primary,
    "--border": c.border,
    "--success": c.success,
    "--destructive": c.destructive,
    "--hero-from": c.heroFrom,
    "--hero-to": c.heroTo,
    "--tier-start": c.tierStart,
    "--tier-grow": c.tierGrow,
    "--tier-max": c.tierMax,
  };
}
