import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  accentClassName?: string;
};

export function BrandLogo({
  className,
  accentClassName = "text-accent",
}: BrandLogoProps) {
  return (
    <span className={cn("font-bold tracking-tight", className)}>
      Fin<span className={accentClassName}>mora</span>
    </span>
  );
}
