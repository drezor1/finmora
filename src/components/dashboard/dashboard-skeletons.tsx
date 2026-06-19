import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardPanelSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="mb-4 h-6 w-48" />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
