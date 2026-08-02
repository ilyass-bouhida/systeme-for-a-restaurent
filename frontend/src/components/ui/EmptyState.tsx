import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-gigino-line grid min-h-56 place-items-center rounded-[var(--gigino-radius-lg)] border border-dashed bg-white p-8 text-center">
      <div className="grid max-w-sm justify-items-center gap-3">
        <div className="bg-gigino-subtle text-gigino-muted grid size-12 place-items-center rounded-2xl">
          {icon}
        </div>
        <h3 className="text-gigino-ink text-lg font-bold">{title}</h3>
        <p className="text-gigino-muted text-sm leading-6">{description}</p>
        {action}
      </div>
    </div>
  );
}
