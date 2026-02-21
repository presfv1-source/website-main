import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost";

export function Button({
  children,
  href,
  variant = "primary",
  className,
  type,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "inline-flex min-h-[44px] items-center justify-center rounded-full px-8 py-3.5 font-sans text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";
  const styles = {
    primary:
      "bg-gradient-to-r from-violet-600 to-sky-500 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-sky-400",
    ghost:
      "border border-white/30 bg-white/5 text-slate-100 backdrop-blur hover:border-white/60 hover:bg-white/10",
  };
  const combined = cn(base, styles[variant], className);

  if (href) {
    return <Link href={href} className={combined}>{children}</Link>;
  }
  return (
    <button
      type={type ?? "button"}
      className={combined}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
