"use client";

const STEPS = [
  {
    num: "01 —",
    title: "Lead texts your listing number",
    body: "Someone sees your yard sign or listing ad and sends a text. That's the trigger — no app, no form, just a simple text message.",
  },
  {
    num: "02 —",
    title: "Instant auto-reply collects the details",
    body: "LeadHandler responds in seconds — collecting name, intent, timeline, and budget. No agent needs to be available.",
  },
  {
    num: "03 —",
    title: "Routed to the right agent, tracked in one inbox",
    body: "The conversation routes to the right agent based on your rules. Every thread is logged and visible. Nothing falls through the cracks.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-8 bg-[var(--off)]">
      <div className="mx-auto max-w-[1100px]">
        <div className="text-center mb-12">
          <div className="mb-3.5 inline-block text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)]">
            How it works
          </div>
          <h2
            className="text-[clamp(28px,3.5vw,42px)] font-black leading-[1.08] text-[var(--ink)] mb-3.5"
            style={{ letterSpacing: "-1.2px" }}
          >
            Lead texts. Handler replies.
            <br />
            Agent gets the deal.
          </h2>
          <p className="text-[15px] text-[var(--muted)] max-w-[420px] mx-auto leading-[1.65]">
            No downloads. No manual forwarding. One number, your rules, done in minutes.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-[20px] overflow-hidden border border-[var(--border)] bg-[var(--border)]">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-[var(--white)] p-8 sm:p-9"
            >
              <div className="text-[11px] font-extrabold text-[var(--off2)] tracking-wider tabular-nums mb-5">
                {step.num}
              </div>
              <div className="text-[15.5px] font-extrabold text-[var(--ink)] mb-2.5 tracking-[-0.3px]">
                {step.title}
              </div>
              <div className="text-[13.5px] text-[var(--muted)] leading-[1.65]">
                {step.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
