import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function AppShell({ children, header, className }: AppShellProps) {
  return (
    <div className={cn("min-h-full bg-background", className)}>
      {header}
      <main>{children}</main>
    </div>
  );
}
