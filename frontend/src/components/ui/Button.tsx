import { cn } from "@/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gigino-tomato text-white shadow-sm hover:bg-gigino-tomato-dark focus-visible:ring-red-200",
  secondary:
    "border border-gigino-line bg-white text-gigino-ink hover:border-gigino-line hover:bg-gigino-subtle focus-visible:ring-stone-200",
  danger:
    "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 focus-visible:ring-red-200",
  ghost:
    "bg-transparent text-gigino-muted hover:bg-white hover:text-gigino-ink focus-visible:ring-stone-200",
  success:
    "bg-gigino-olive text-white shadow-sm hover:bg-gigino-olive-dark focus-visible:ring-emerald-200",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 gap-1.5 rounded-[10px] px-3 text-sm",
  md: "min-h-12 gap-2 rounded-[var(--gigino-radius-md)] px-4 text-sm",
  lg: "min-h-14 gap-2.5 rounded-[var(--gigino-radius-md)] px-5 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  icon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex touch-manipulation items-center justify-center font-extrabold transition duration-150 focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
