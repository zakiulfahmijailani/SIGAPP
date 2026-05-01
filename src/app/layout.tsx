import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIGAPP — School Intervention Gap Prioritization Platform",
  description:
    "Government dashboard for prioritizing school interventions based on quality gaps, spatial inequity, structural risk, and public signals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-[240px] min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
