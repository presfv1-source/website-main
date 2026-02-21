import { DM_Sans } from "next/font/google";
import "./marketing.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-dm-sans",
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`marketing ${dmSans.variable} ${dmSans.className}`}>
      {children}
    </div>
  );
}
