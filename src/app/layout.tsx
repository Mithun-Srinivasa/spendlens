import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "SpendLens — Expense Intelligence for India",
  description:
    "Upload your Indian bank statement and get instant AI-powered expense insights. Category breakdowns, monthly trends, anomaly detection — all processed privately in your session.",
  keywords: [
    "expense tracker",
    "bank statement analysis",
    "UPI spending",
    "India finance",
    "HDFC ICICI SBI",
  ],
  openGraph: {
    title: "SpendLens",
    description: "Your money, finally legible.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
