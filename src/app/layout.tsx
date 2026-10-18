import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Klan — your influence builds the clan",
    template: "%s · Klan",
  },
  description:
    "Klan scores your X influence, turns it into points and cards, and lets you swear the oath to a clan. Points decide your share of the airdrop.",
  openGraph: {
    title: "Klan — your influence builds the clan",
    description: "Your X influence, scored. Your points, shared. Your clan, loud.",
    siteName: "Klan",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6" role="status" aria-live="polite" />
      </body>
    </html>
  );
}
