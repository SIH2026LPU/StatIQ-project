"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LanguageInfo } from "@/lib/translation/types";
import { getLanguageByCode, SUPPORTED_LANGUAGES } from "@/lib/translation/language-registry";

// Map of imported locale JSONs
const localeData: Record<string, any> = {
  en: require("@/i18n/locales/en.json"),
  hi: require("@/i18n/locales/hi.json"),
  // We can lazy load these or bundle them. For now, we import statically.
  // Real apps might use dynamic import() based on locale.
};

interface LanguageContextType {
  currentLanguage: LanguageInfo;
  setLanguage: (code: string) => void;
  t: (key: string) => string;
}

const defaultLanguage = getLanguageByCode("en")!;

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: string;
}) {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageInfo>(
    getLanguageByCode(initialLocale) || defaultLanguage
  );

  const [dictionary, setDictionary] = useState<any>(localeData[initialLocale] || localeData["en"]);

  // We need to update document element direction and lang
  useEffect(() => {
    document.documentElement.lang = currentLanguage.code;
    document.documentElement.dir = currentLanguage.direction;
    
    // In a real app, this might fetch the JSON dynamically
    if (localeData[currentLanguage.code]) {
      setDictionary(localeData[currentLanguage.code]);
    } else {
      setDictionary(localeData["en"]); // fallback
    }
  }, [currentLanguage]);

  const setLanguage = (code: string) => {
    const lang = getLanguageByCode(code);
    if (lang) {
      setCurrentLanguageState(lang);
      // Set cookie for persistence
      document.cookie = `statiq_locale=${code}; path=/; max-age=31536000`;
      
      // Optionally trigger an API call to save to user profile
      // fetch('/api/user/preference', { method: 'POST', body: JSON.stringify({ language: code }) });
    }
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value = dictionary;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to english dictionary
        let fallbackValue = localeData["en"];
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // completely missing
          }
        }
        return typeof fallbackValue === "string" ? fallbackValue : key;
      }
    }
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}
