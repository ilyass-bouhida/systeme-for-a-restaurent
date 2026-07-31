import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        className={cn(
          "max-h-[92vh] w-full max-w-xl overflow-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6",
          className,
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-stone-950">
            {title}
          </h2>
          <Button
            aria-label="Close"
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="size-5" />}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
