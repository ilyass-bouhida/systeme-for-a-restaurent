import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "green" | "amber" | "red" | "blue";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-gigino-subtle text-gigino-muted ring-gigino-line",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
