"use client";

const STATS = [
  {
    value: "5",
    unit: "min",
    label: "Average brokerage response time.",
    strong: "The conversion window closes in under 60 seconds.",
  },
  {
    value: "78",
    unit: "%",
    label: "Of leads close with the first agent who responds.",
    strong: "Speed wins before price is even discussed.",
  },
  {
    value: "0",
    unit: "s",
    label: "LeadHandler's reply time.",
    strong: "Every lead answered instantly — 24/7, no gaps, no exceptions.",
  },
];

export function StatsBand() {
  return (
    <section className="bg-[var(--ink)] py-[72px] px-4 sm:px-8">
      <div className="mx-auto max-w-[1100px] grid grid-cols-1 md:grid-cols-3 gap-px rounded-[20px] overflow-hidden border border-white/[0.08] bg-white/[0.08]">
        {STATS.map((s, i) => (
          <div key={i} className="bg-[var(--ink)] p-9 sm:p-10">
            <div className="text-[54px] font-black text-white leading-none mb-2.5 tracking-[-3px]">
              {s.value}
              <em className="not-italic text-white/30 text-4xl">{s.unit}</em>
            </div>
            <p className="text-sm text-white/45 leading-[1.6] max-w-[260px]">
              {s.label} <strong className="font-semibold text-white/80">{s.strong}</strong>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
