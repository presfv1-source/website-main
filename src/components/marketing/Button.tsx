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
    "inline-flex items-center justify-center rounded-full px-8 py-3.5 font-semibold font-sans text-base transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
  const styles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-500",
    ghost:
      "border border-slate-600 text-slate-300 hover:border-slate-400 bg-transparent",
  };
  const combined = cn(base, styles[variant], className);

  if (href) {
    return (
      <Link href={href} className={combined}>
        {children}
      </Link>
    );
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
