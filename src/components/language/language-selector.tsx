"use client";

import React, { useState, useEffect } from "react";
import { useLanguage, useTranslation } from "./language-provider";
import { SUPPORTED_LANGUAGES } from "@/lib/translation/language-registry";
import { Check, Globe } from "lucide-react";

export function LanguageSelector({ variant = "dropdown" }: { variant?: "dropdown" | "modal" }) {
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (variant === "modal") {
      const hasVisited = localStorage.getItem("statiq_has_visited");
      if (!hasVisited) {
        setShowModal(true);
      }
    }
  }, [variant]);

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    if (variant === "modal") {
      localStorage.setItem("statiq_has_visited", "true");
      setShowModal(false);
    }
  };

  if (variant === "modal" && showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6">
        {/* Glassmorphism Container */}
        <div className="bg-white/95 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 max-w-4xl w-full mx-auto shadow-2xl border border-white relative overflow-hidden max-h-[95vh] flex flex-col">
          
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-emerald-400/20 blur-[80px] pointer-events-none rounded-full"></div>
          
          <div className="text-center mb-6 sm:mb-8 relative z-10 shrink-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-sora, sans-serif)" }}>
              {t("common.chooseLanguage") || "Choose your preferred language"}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base" style={{ fontFamily: "var(--font-inter, sans-serif)" }}>
              {t("common.chooseLanguageDesc") || "Use StatIQ AI in your preferred Indian language."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 sm:mb-8 relative z-10 overflow-y-auto px-1 py-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#10b981 #f1f5f9" }}>
            {SUPPORTED_LANGUAGES.filter(l => l.enabledByApp).map((lang) => {
              const isActive = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-300 group ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-md"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-lg shadow-sm"
                  }`}
                  aria-label={`Select ${lang.englishName}`}
                >
                  <span className={`text-xl sm:text-2xl font-bold mb-1 transition-colors ${isActive ? "text-emerald-600" : "text-slate-700 group-hover:text-emerald-600"}`}>
                    {lang.nativeName}
                  </span>
                  <span className={`text-[10px] sm:text-xs tracking-widest uppercase ${isActive ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"}`} style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
                    {lang.englishName}
                  </span>
                  
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center relative z-10 shrink-0">
            <button 
              onClick={() => handleSelectLanguage(currentLanguage.code)} 
              className="px-10 py-3 rounded-xl text-base sm:text-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all duration-300 active:scale-95 border border-emerald-400"
              style={{ fontFamily: "var(--font-inter, sans-serif)" }}
            >
              {t("actions.continue") || "Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 text-slate-700">
          <Globe className="h-4 w-4 text-emerald-500" />
          <span className="hidden sm:inline-block font-medium text-sm">
            {currentLanguage.nativeName}
          </span>
        </button>
        <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
          {SUPPORTED_LANGUAGES.filter(l => l.enabledByApp).map((lang) => {
            const isActive = currentLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md cursor-pointer text-left transition-colors ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-600 font-medium" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{lang.nativeName}</span>
                {isActive && (
                  <Check className="h-4 w-4 text-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
