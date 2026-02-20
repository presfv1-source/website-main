import Link from "next/link";
import { Shield, Lock, Server } from "lucide-react";
import { MarketingHeader } from "@/components/app/MarketingHeader";
import { MarketingFooter } from "@/components/app/MarketingFooter";
import { CONTAINER_NARROW, PAGE_PADDING } from "@/lib/ui";
import { cn } from "@/lib/utils";

const sections: Array<{
  icon: typeof Shield;
  title: string;
  body: string;
  list?: Array<{ name: string; desc: string }>;
}> = [
  {
    icon: Shield,
    title: "Data handling",
    body: "Lead and contact data are stored in secure, access-controlled systems. We use encryption in transit and at rest. Only your brokerage's authorized users can access your data. We do not sell or share your data with third parties for marketing.",
  },
  {
    icon: Lock,
    title: "Access control",
    body: "Session-based access with role-based views (Broker vs Agent). Credentials and API keys are never exposed in the UI; they are stored and used server-side only.",
  },
  {
    icon: Server,
    title: "Vendors we use",
    body: "We use industry-standard providers for SMS, payments, and data sync. These partners have their own security and compliance programs. We do not overclaim compliance; we encourage you to review their policies as needed.",
    list: undefined,
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingHeader />

      <section className="py-12 md:py-16 bg-gray-950">
        <div className={cn(CONTAINER_NARROW, PAGE_PADDING)}>
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            Security & data
          </h1>
        </div>
      </section>

      <main className={cn(CONTAINER_NARROW, PAGE_PADDING, "flex-1 py-12 md:py-16")}>
        <p className="text-gray-600 leading-relaxed mt-2">
          How we handle your brokerage data and the vendors we use to run the service.
        </p>

        <section className="mt-8 md:mt-10 space-y-8">
          {sections.map(({ icon: Icon, title, body, list }) => (
            <div key={title} className="flex gap-4">
              <Icon className="size-8 shrink-0 text-primary" aria-hidden />
              <div>
                <h2 className="font-semibold text-gray-900">{title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">{body}</p>
                {list && (
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    {list.map(({ name, desc }) => (
                      <li key={name}>
                        <strong className="text-gray-900">{name}</strong> — {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </section>

        <p className="text-gray-600 mt-10 text-center text-sm">
          Questions?{" "}
          <Link href="/contact" className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
            Contact us
          </Link>
          .
        </p>
      </main>

      <MarketingFooter />
    </div>
  );
}
