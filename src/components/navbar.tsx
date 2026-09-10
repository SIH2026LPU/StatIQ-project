"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Zap } from "lucide-react";
import { useTranslation } from "@/components/language/language-provider";
import { LanguageSelector } from "@/components/language/language-selector";

export function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-on-surface/5 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between px-6 md:px-12 py-3.5 max-w-7xl mx-auto">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-container to-primary-container/60 flex items-center justify-center font-bold text-black shadow-inner shadow-white/20 group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-display text-xl font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">
            StatIQ AI
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-surface-container-low/50 px-2 py-1.5 rounded-full border border-on-surface/5">
          <NavLink href="/features" label={t("nav.features")} />
          <NavLink href="/catalogue" label={t("nav.catalogue")} />
          <NavLink href="/courses" label={t("nav.courses")} />
          <NavLink href="/statistics" label={t("nav.statistics")} />
          <NavLink href="/ai-analyst" label={t("nav.aiAnalyst")} />
          <NavLink href="/sources" label={t("nav.dataSources")} />
        </div>

        {/* Actions & Theme */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 pr-2 border-r border-on-surface/10">
            <Link 
              href="/login" 
              className="px-5 py-2 rounded-full text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all active:scale-95"
            >
              {t("actions.signIn")}
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2 rounded-full text-sm font-bold text-primary-container-on bg-primary-container hover:bg-primary-container/90 hover:shadow-md hover:shadow-primary-container/20 transition-all active:scale-95"
            >
              {t("actions.signUp")}
            </Link>
          </div>
          
          <LanguageSelector variant="dropdown" />

          {/* Theme Changer at the end */}
          <div className="pl-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container/80 transition-all relative group"
    >
      {label}
    </Link>
  );
}
