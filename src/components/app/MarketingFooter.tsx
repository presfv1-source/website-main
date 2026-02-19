import Link from "next/link";
import { CONTAINER, PAGE_PADDING, TYPO } from "@/lib/ui";
import { cn } from "@/lib/utils";

const productLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Demo" },
] as const;

const legalLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function MarketingFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mt-16 sm:mt-24 border-t border-border py-10 sm:py-12",
        className
      )}
    >
      <div className={cn(CONTAINER, PAGE_PADDING)}>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-12 sm:justify-between mb-8">
          <div>
            <p className={cn(TYPO.mutedSmall, "font-medium text-foreground mb-3")}>Product</p>
            <ul className="flex flex-col gap-2">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={cn(TYPO.mutedSmall, "block py-1.5 min-h-[44px] sm:min-h-0 sm:py-0 flex items-center hover:text-foreground hover:underline")}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={cn(TYPO.mutedSmall, "font-medium text-foreground mb-3")}>Legal</p>
            <ul className="flex flex-col gap-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={cn(TYPO.mutedSmall, "block py-1.5 min-h-[44px] sm:min-h-0 sm:py-0 flex items-center hover:text-foreground hover:underline")}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={cn(TYPO.mutedSmall, "font-medium text-foreground mb-3")}>Contact</p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/contact" className={cn(TYPO.mutedSmall, "block py-1.5 min-h-[44px] sm:min-h-0 sm:py-0 flex items-center hover:text-foreground hover:underline")}>
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className={cn(TYPO.mutedSmall, "text-muted-foreground text-center sm:text-left border-t border-border pt-6")}>
          {/* was: Houston, TX */}
          © 2026 LeadHandler.ai · United States
        </p>
      </div>
    </footer>
  );
}
