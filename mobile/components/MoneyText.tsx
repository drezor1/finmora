import { Text, type TextProps, type TextStyle } from "react-native";
import { formatCurrency } from "@finmora/shared";
import { useTheme } from "@/lib/theme";

type MoneyTextProps = TextProps & {
  amount: number;
  showSign?: boolean;
  positive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizes: Record<NonNullable<MoneyTextProps["size"]>, TextStyle> = {
  sm: { fontSize: 14, fontWeight: "600" },
  md: { fontSize: 18, fontWeight: "700" },
  lg: { fontSize: 28, fontWeight: "700" },
  xl: { fontSize: 36, fontWeight: "700" },
};

export function MoneyText({
  amount,
  showSign = false,
  positive,
  size = "md",
  style,
  ...props
}: MoneyTextProps) {
  const { c } = useTheme();
  const isPositive = positive ?? amount >= 0;
  const prefix = showSign && amount >= 0 ? "+" : "";

  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: "monospace",
          color: isPositive ? c.accent : c.destructive,
        },
        sizes[size],
        style,
      ]}
    >
      {prefix}
      {formatCurrency(Math.abs(amount))}
    </Text>
  );
}
