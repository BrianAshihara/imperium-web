import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-primary",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none">
        <rect x="4" y="12" width="3.5" height="8" rx="1.25" fill="var(--accent)" />
        <rect x="10.25" y="7" width="3.5" height="13" rx="1.25" fill="var(--accent)" />
        <rect x="16.5" y="4" width="3.5" height="16" rx="1.25" fill="var(--accent)" opacity="0.55" />
      </svg>
    </span>
  );
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">Imperium</span>
    </div>
  );
}
