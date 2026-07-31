import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-gigino-line rounded-[var(--gigino-radius-lg)] border bg-white shadow-[var(--gigino-shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}
