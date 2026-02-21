"use client";

const BENTO = [
  {
    wide: true,
    tag: "Core feature",
    title: "Instant text-back — every time",
    body: "Every lead gets a reply in seconds. 24/7, no exceptions — even when your whole team is in showings.",
    miniChat: true,
  },
  {
    wide: false,
    tag: "Response time",
    stat: "0s",
    statLabel: "First reply to every lead, day or night.",
  },
  {
    wide: false,
    tag: "Routing",
    title: "Smart routing",
    body: "Round-robin or custom rules. The right agent gets the right lead — automatically, every time.",
  },
  {
    wide: false,
    tag: "Team",
    title: "Shared inbox",
    body: "Every SMS thread visible in one place. Clean handoffs, full context, no dropped conversations.",
  },
  {
    wide: false,
    tag: "Industry data",
    stat: "78%",
    statLabel: "Of leads go with the first agent who responds.",
  },
  {
    wide: false,
    tag: "Oversight",
    title: "Owner visibility",
    body: "See every lead, every response time, every agent. Full accountability across your team.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-4 sm:px-8 bg-[var(--white)]">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-12">
          <div className="mb-3.5 inline-block text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)]">
            Features
          </div>
          <h2
            className="text-[clamp(28px,3.5vw,42px)] font-black leading-[1.08] text-[var(--ink)] mb-3.5"
            style={{ letterSpacing: "-1.2px" }}
          >
            Built so no lead goes cold.
          </h2>
          <p className="text-[15px] text-[var(--muted)] max-w-[420px] mx-auto leading-[1.65]">
            Every feature answers one question: did the lead get a response?
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-fr" style={{ gridTemplateRows: "auto auto" }}>
          {BENTO.map((card, i) => (
            <div
              key={i}
              className={`rounded-[20px] border border-[var(--border)] bg-[var(--off)] p-8 overflow-hidden ${card.wide ? "md:col-span-2" : ""}`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--subtle)] mb-3.5">
                {card.tag}
              </div>
              {card.stat != null ? (
                <>
                  <div className="text-[52px] font-black text-[var(--ink)] leading-none my-5 mt-5 mb-1" style={{ letterSpacing: "-3px" }}>
                    {card.stat}
                  </div>
                  <div className="text-[13px] text-[var(--muted)]">{card.statLabel}</div>
                </>
              ) : (
                <>
                  <div className="text-[17px] font-extrabold text-[var(--ink)] tracking-[-0.4px] mb-2">
                    {card.title}
                  </div>
                  <div className="text-[13px] text-[var(--muted)] leading-[1.6] max-w-[320px]">
                    {card.body}
                  </div>
                  {card.miniChat && (
                    <div className="mt-6 max-w-[340px] rounded-[10px] overflow-hidden border border-[var(--border)] bg-[var(--white)]">
                      <div className="flex h-7 items-center gap-1.5 border-b border-[var(--border)] bg-[var(--off)] px-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57] opacity-60" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FEBC2E] opacity-60" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#28C840] opacity-60" />
                      </div>
                      <div className="flex flex-col gap-2 p-3">
                        <div className="flex gap-1.5 items-start">
                          <div className="h-5 w-5 flex-shrink-0 rounded-full bg-[var(--off2)] flex items-center justify-center text-[7px] font-extrabold text-[var(--ink)]">
                            JR
                          </div>
                          <div className="rounded-r-lg rounded-bl-lg bg-[var(--off2)] px-2 py-1 text-[9.5px] text-[var(--ink)] leading-snug max-w-[200px]">
                            &quot;Hi, saw the sign on Oak Ln — still available?&quot;
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="rounded-l-lg rounded-br-lg bg-[var(--ink)] text-white px-2 py-1 text-[9.5px] leading-snug max-w-[200px] ml-auto">
                            Hi James! Yes it is. Can I get your name and best time to connect?
                          </div>
                        </div>
                        <div className="text-center text-[9px] font-semibold text-[var(--muted)] py-1 px-2 rounded-md bg-[var(--off)] border border-[var(--border)]">
                          → Routed to Sarah M. · 38s response time
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
