import type { ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";

export default function Button({
  children,
  variant = "primary",
  onClick,
  className = "",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  variant?: Variant;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  const base = "px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    primary: "bg-amber text-bg hover:bg-amber/90",
    outline: "border border-amber/40 text-amber hover:bg-amber/10",
    ghost:   "text-text-muted hover:text-text hover:bg-surface-hover",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}