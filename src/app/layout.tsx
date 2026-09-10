import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";

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
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#111318",
};

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language/language-provider";
import { LanguageSelector } from "@/components/language/language-selector";
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
      <body
        className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-on-background min-h-screen overflow-x-hidden selection:bg-primary-container selection:text-black`}
        suppressHydrationWarning
      >
        <LanguageProvider initialLocale={initialLocale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <LanguageSelector variant="modal" />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
