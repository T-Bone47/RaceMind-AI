import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

import "./globals.css";

export const metadata: Metadata = {
  title: "RaceMind AI - Your race engineer, never misses a delta",
  description:
    "RaceMind AI reads your sim racing telemetry lap by lap and calls the strategy before you have to ask - pit windows, undercuts, tyre and fuel calls, in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
