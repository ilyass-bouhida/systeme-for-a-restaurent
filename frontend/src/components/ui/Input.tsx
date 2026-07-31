import { cn } from "@/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="text-gigino-muted grid gap-2 text-sm font-bold">
      {label && <span>{label}</span>}
      <input
        id={inputId}
        className={cn(
          "border-gigino-line text-gigino-ink placeholder:text-gigino-muted/60 min-h-12 w-full rounded-[var(--gigino-radius-md)] border bg-white px-3.5 text-base transition outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error && (
        <span className="text-xs font-medium text-red-600">{error}</span>
      )}
    </label>
  );
}
