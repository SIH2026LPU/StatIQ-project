"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage, useTranslation } from "./language-provider";
import { SUPPORTED_LANGUAGES } from "@/lib/translation/language-registry";
import { Check, Globe, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function LanguageSelector({ variant = "dropdown" }: { variant?: "dropdown" | "modal" }) {
  const router = useRouter();
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === "modal") {
      const hasVisited = localStorage.getItem("statiq_has_visited");
      if (!hasVisited) {
        setShowModal(true);
      }
    }
  }, [variant]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: string) => {
    setLanguage(code);
    setIsOpen(false);
    if (variant === "modal") {
      localStorage.setItem("statiq_has_visited", "true");
      setShowModal(false);
    }
    try {
      router.refresh();
    } catch (e) {
      // Ignored if router is not mounted in some context
    }
  };

  if (variant === "modal" && showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
        {/* Glassmorphism Container */}
        <div className="bg-surface-container-low/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 max-w-4xl w-full mx-auto shadow-2xl border border-white/10 relative overflow-hidden max-h-[95vh] flex flex-col text-on-surface">
          
          {/* Background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary-container/20 blur-[80px] pointer-events-none rounded-full"></div>
          
          <div className="text-center mb-6 sm:mb-8 relative z-10 shrink-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-on-surface tracking-tight font-display">
              {t("common.chooseLanguage", "Choose your preferred language")}
            </h2>
            <p className="text-on-surface-variant text-sm sm:text-base">
              {t("common.chooseLanguageDesc", "Use StatIQ AI in your preferred Indian language.")}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 sm:mb-8 relative z-10 overflow-y-auto px-1 py-1 custom-scrollbar">
            {SUPPORTED_LANGUAGES.filter(l => l.enabledByApp).map((lang) => {
              const isActive = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all duration-300 group ${
                    isActive
                      ? "border-primary-container bg-primary-container/15 ring-1 ring-primary-container shadow-md"
                      : "border-white/5 bg-surface-container-high/40 hover:border-primary-container/40 hover:bg-surface-container-high hover:shadow-lg"
                  }`}
                  aria-label={`Select ${lang.englishName}`}
                >
                  <span className={`text-xl sm:text-2xl font-bold mb-1 transition-colors ${isActive ? "text-primary-container" : "text-on-surface group-hover:text-primary-container"}`}>
                    {lang.nativeName}
                  </span>
                  <span className={`text-[10px] sm:text-xs tracking-widest uppercase font-mono ${isActive ? "text-primary-container" : "text-on-surface-variant group-hover:text-primary-container"}`}>
                    {lang.englishName}
                  </span>
                  
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-primary-container rounded-full shadow-[0_0_8px_rgba(57,255,20,0.4)]">
                      <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center relative z-10 shrink-0">
            <button 
              onClick={() => handleSelectLanguage(currentLanguage.code)} 
              className="px-10 py-3 rounded-xl text-base font-bold text-black bg-primary-container hover:bg-primary-container/90 hover:shadow-[0_4px_15px_rgba(57,255,20,0.3)] transition-all duration-300 active:scale-95 border border-primary-container font-label-caps tracking-wider"
            >
              {t("common.continue", "Continue")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/60 hover:bg-surface-container-high transition-all border border-white/10 text-on-surface text-xs font-semibold shadow-sm active:scale-95"
          aria-expanded={isOpen}
        >
          <Globe className="h-3.5 w-3.5 text-primary-container" />
          <span className="font-medium text-xs">
            {currentLanguage.nativeName}
          </span>
          <ChevronDown className={`h-3 w-3 text-on-surface-variant transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-52 max-h-80 overflow-y-auto bg-surface-container-high/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 custom-scrollbar animate-in fade-in-50 zoom-in-95">
            <div className="px-2 py-1.5 text-[10px] font-label-caps uppercase text-on-surface-variant/60 font-bold border-b border-white/5 mb-1">
              Select Language ({SUPPORTED_LANGUAGES.length})
            </div>
            {SUPPORTED_LANGUAGES.filter(l => l.enabledByApp).map((lang) => {
              const isActive = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer text-left transition-colors ${
                    isActive 
                      ? "bg-primary-container/15 text-primary-container font-bold" 
                      : "text-on-surface hover:bg-white/5 hover:text-primary-container"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">{lang.nativeName}</span>
                    <span className="text-[10px] text-on-surface-variant font-mono">{lang.englishName}</span>
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 text-primary-container" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}
