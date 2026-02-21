"use client";

export function SocialProofStrip() {
  const logos = ["Keller Williams", "RE/MAX", "Compass", "Coldwell Banker", "eXp Realty"];
  return (
    <div className="overflow-hidden border-y border-[var(--border)] bg-[var(--white)] py-5">
      <div className="text-center text-[11.5px] font-medium text-[var(--subtle)] tracking-wide mb-4">
        Built for Texas real estate teams
      </div>
      <div className="flex flex-wrap items-center justify-center gap-10 px-4 sm:px-8">
        {logos.map((name) => (
          <span
            key={name}
            className="text-sm font-bold text-[var(--off2)] tracking-[-0.3px] select-none grayscale opacity-[0.35]"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
