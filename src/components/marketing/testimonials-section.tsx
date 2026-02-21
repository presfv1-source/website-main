"use client";

const TESTIMONIALS = [
  {
    quote:
      "We used to miss leads constantly after hours. Now every text gets answered in seconds and routed to whoever's available. It changed how we operate.",
    name: "Sarah Mitchell",
    role: "Broker-Owner, Austin TX",
    initials: "SM",
    avatarBg: "bg-[var(--off2)]",
    avatarColor: "text-[var(--ink)]",
  },
  {
    quote:
      "Setup took less than an hour. Within the first week we'd already captured three leads we would have lost — all came in after 9pm.",
    name: "Marcus Reynolds",
    role: "Team Lead, Houston TX",
    initials: "MR",
    avatarBg: "bg-[var(--off2)]",
    avatarColor: "text-[var(--ink)]",
  },
  {
    quote:
      "As the broker I can finally see who's responding to what and how fast. The accountability alone was worth it for my team.",
    name: "Diana Walsh",
    role: "Managing Broker, Dallas TX",
    initials: "DW",
    avatarBg: "bg-[var(--off2)]",
    avatarColor: "text-[var(--ink)]",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-8 bg-[var(--off)]" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-12">
          <div className="mb-3.5 inline-block text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)]">
            Early beta
          </div>
          <h2
            id="testimonials-heading"
            className="text-[clamp(28px,3.5vw,42px)] font-black leading-[1.08] text-[var(--ink)]"
            style={{ letterSpacing: "-1.2px" }}
          >
            What beta members are saying.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.initials}
              className="rounded-[20px] border border-[var(--border)] bg-[var(--white)] p-7"
            >
              <p className="text-sm text-[var(--ink)] leading-[1.65] mb-5 font-normal">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-extrabold ${t.avatarBg} ${t.avatarColor}`}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[var(--ink)] tracking-[-0.2px]">
                    {t.name}
                  </div>
                  <div className="text-[11.5px] text-[var(--muted)]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
