import { cn } from "@/lib/utils";

type BarChartProps = {
  data: number[];
  labels?: string[];
  className?: string;
  barClassName?: string;
};

export function MiniBarChart({
  data,
  labels,
  className,
  barClassName,
}: BarChartProps) {
  const max = Math.max(...data, 1);

  return (
    <div className={cn("flex h-32 items-end gap-2", className)}>
      {data.map((value, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div
            className={cn(
              "w-full rounded-t-lg bg-gradient-to-t from-accent to-accent/60 transition-all",
              barClassName
            )}
            style={{ height: `${Math.max((value / max) * 100, 4)}%` }}
          />
          {labels?.[i] && (
            <span className="text-[10px] text-muted">{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
  );
}

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
};

export function ProgressRing({
  value,
  size = 120,
  stroke = 8,
  label,
  sublabel,
  className,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-accent transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-primary">{Math.round(clamped)}%</span>
        {label && <span className="text-[10px] text-muted">{label}</span>}
      </div>
      {sublabel && (
        <p className="mt-2 text-center text-xs text-muted">{sublabel}</p>
      )}
    </div>
  );
}

type SparklineProps = {
  data: number[];
  className?: string;
  strokeClassName?: string;
};

export function Sparkline({
  data,
  className,
  strokeClassName = "stroke-accent",
}: SparklineProps) {
  if (data.length < 2) return null;

  const width = 200;
  const height = 48;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-12 w-full", className)}
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className={strokeClassName}
      />
    </svg>
  );
}
