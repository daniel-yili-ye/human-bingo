import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const description =
  "Make a custom people-bingo board in a minute, share one link, and get a room full of strangers talking.";

export const metadata: Metadata = {
  title: { default: "Human Bingo — the icebreaker card", template: "%s · Human Bingo" },
  description,
  applicationName: "Human Bingo",
  openGraph: { siteName: "Human Bingo", type: "website", description },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Stops iOS zooming in when a small name field is focused. Pinch-to-zoom
  // stays available (the old `userScalable: false` blocked it).
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      {/* --page-max keeps the header exactly as wide as the page below it. */}
      <body className="flex min-h-dvh flex-col antialiased [--page-max:var(--container-5xl)] has-data-[page=narrow]:[--page-max:var(--container-xl)] max-lg:has-data-[page=editor]:[--page-max:var(--container-xl)]">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteHeader />
          {children}
          <Toaster richColors closeButton position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
