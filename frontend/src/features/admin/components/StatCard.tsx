import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "stone",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  tone?: "stone" | "green" | "amber" | "blue" | "red" | "violet";
}) {
  const tones = {
    stone: "bg-gigino-subtle text-gigino-ink",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-50 text-gigino-tomato",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <Card className="min-h-32 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gigino-muted text-sm font-bold">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight xl:text-3xl">
            {value}
          </p>
          <p className="text-gigino-muted mt-2 text-xs font-medium">{detail}</p>
        </div>
        <div
          className={cn(
            "grid size-11 place-items-center rounded-2xl",
            tones[tone],
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
