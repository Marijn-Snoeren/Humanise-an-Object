import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Humanize an object — Friction Lab",
  description: "Humanizing the digital cursor through intentional physical friction, hesitation, and mechanical resistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#e8ebe6] text-[#0e0f0c] antialiased selection:bg-[#9fe870] selection:text-[#0e0f0c]">
        {children}
      </body>
    </html>
  );
}
