import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sora",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "StatIQ AI — Competency Intelligence for Official Statistics",
  description:
    "AI-powered competency passport, skill-gap analysis, personalized learning and workforce intelligence for India's Official Statistical System. SIH 2026 PS 26101.",
  manifest: "/manifest.webmanifest",
  applicationName: "StatIQ AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "StatIQ AI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon-192x192.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e12" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language/language-provider";
import { LanguageSelector } from "@/components/language/language-selector";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { cookies } from "next/headers";
import { getLanguageByCode } from "@/lib/translation/language-registry";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialLocale = cookieStore.get("statiq_locale")?.value || "en";
  const languageInfo = getLanguageByCode(initialLocale) || getLanguageByCode("en")!;

  return (
    <html lang={languageInfo.code} dir={languageInfo.direction} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="StatIQ AI" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-on-background min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-black`}
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        <LanguageProvider initialLocale={initialLocale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <LanguageSelector variant="modal" />
            <PWAInstallPrompt />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
