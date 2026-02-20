"use client";

const STATS = [
  { label: "New Leads", value: "24", sub: "+12%" },
  { label: "Avg Reply", value: "2.5m", sub: null },
  { label: "Active Convos", value: "8", sub: null },
  { label: "Qual Rate", value: "68%", sub: null },
];

const LEADS = [
  { name: "James R.", source: "Listing", status: "Hot" as const },
  { name: "Maria S.", source: "Direct", status: "Warm" as const },
  { name: "David K.", source: "Referral", status: "New" as const },
];

const NAV_ITEMS = [
  { label: "Dashboard", active: true },
  { label: "Leads", active: false },
  { label: "Inbox", active: false },
  { label: "Routing", active: false },
  { label: "Agents", active: false },
  { label: "Analytics", active: false },
];

function StatusBadge({ status }: { status: "Hot" | "Warm" | "New" }) {
  const styles = {
    Hot: "bg-red-50 text-red-600",
    Warm: "bg-orange-50 text-orange-600",
    New: "bg-green-50 text-green-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden max-w-4xl mx-auto bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-100">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden />
        </div>
        <span className="text-xs font-sans text-gray-500 ml-3 flex-1 text-center max-w-md mx-auto truncate">
          app.leadhandler.ai/dashboard
        </span>
      </div>
      <div className="flex min-h-[320px] sm:min-h-[360px]">
        {/* Sidebar */}
        <aside className="hidden sm:flex w-[200px] flex-col border-r border-gray-200 bg-gray-50/80 py-4 px-3 gap-1">
          <div className="font-display font-bold text-lg text-[#0A0A0A] mb-4 px-2">
            LeadHandler<span className="text-blue-600">.ai</span>
          </div>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium font-sans ${
                item.active
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </div>
          ))}
        </aside>
        {/* Main */}
        <div className="flex-1 p-4 sm:p-6 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 font-sans">
            Today&apos;s Overview
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <p className="text-xs font-sans text-gray-500 truncate">{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-display font-semibold text-[#0A0A0A]">
                    {s.value}
                  </p>
                  {s.sub && (
                    <span className="text-xs font-sans text-emerald-600">{s.sub}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-4 py-2.5 bg-gray-50/80">
              <p className="text-xs font-sans font-medium text-gray-600">Recent leads</p>
            </div>
            <div className="divide-y divide-gray-100">
              {LEADS.map((lead) => (
                <div
                  key={lead.name}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-sans"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#0A0A0A] truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500 truncate">{lead.source}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
