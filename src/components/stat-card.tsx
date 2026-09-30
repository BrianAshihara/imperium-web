import { DeltaPill } from "@/components/delta-pill";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { formatPercent } from "@/lib/money";

interface StatCardProps {
  label: string;
  value: number;
  format?: "currency" | "percent";
  delta?: number | null;
  deltaInvert?: boolean;
  caption?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  format = "currency",
  delta,
  deltaInvert,
  caption,
  loading = false,
}: StatCardProps) {
  return (
    <div className="surface flex flex-col gap-3 p-5">
      <p className="eyebrow">{label}</p>

      {loading ? (
        <>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-24" />
        </>
      ) : (
        <>
          <p className="display-value text-[26px] leading-none">
            {format === "percent" ? formatPercent(value) : formatCurrency(value)}
          </p>
          {delta !== undefined ? (
            <DeltaPill value={delta} invert={deltaInvert} caption={caption} />
          ) : (
            caption && <p className="text-xs text-muted-foreground">{caption}</p>
          )}
        </>
      )}
    </div>
  );
}
