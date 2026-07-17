import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import Script from "next/script";
import { AppProviders } from "@/components/providers/app-providers";
import { PremiumCursor } from "@/components/ui/premium-cursor";
import "./globals.css";

const nexoraLogoSrc = "/brand/nexora-os-logo.png";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "Nexora OS",
  description:
    "BITHM's platform for assignments, labs, coding projects, feedback, and academic administration.",
  icons: {
    icon: "/brand/nexora-os-icon.png",
    shortcut: "/favicon.ico",
    apple: "/brand/nexora-os-icon.png",
  },
  openGraph: {
    title: "Nexora OS",
    description:
      "BITHM's platform for assignments, labs, coding projects, feedback, and academic administration.",
    images: [nexoraLogoSrc],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050706" },
    { media: "(prefers-color-scheme: light)", color: "#f3f7f4" },
  ],
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="nexora-theme-init"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
        <PremiumCursor />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
