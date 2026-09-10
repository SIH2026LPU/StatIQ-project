"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LanguageInfo } from "@/lib/translation/types";
import { getLanguageByCode, SUPPORTED_LANGUAGES } from "@/lib/translation/language-registry";

// Locale dictionary imports
const enLocale = require("@/i18n/locales/en.json");

const localeLoaders: Record<string, () => any> = {
  en: () => enLocale,
  hi: () => { try { return require("@/i18n/locales/hi.json"); } catch { return enLocale; } },
  pa: () => { try { return require("@/i18n/locales/pa.json"); } catch { return enLocale; } },
  bn: () => { try { return require("@/i18n/locales/bn.json"); } catch { return enLocale; } },
  mr: () => { try { return require("@/i18n/locales/mr.json"); } catch { return enLocale; } },
  ta: () => { try { return require("@/i18n/locales/ta.json"); } catch { return enLocale; } },
  te: () => { try { return require("@/i18n/locales/te.json"); } catch { return enLocale; } },
  gu: () => { try { return require("@/i18n/locales/gu.json"); } catch { return enLocale; } },
  kn: () => { try { return require("@/i18n/locales/kn.json"); } catch { return enLocale; } },
  ml: () => { try { return require("@/i18n/locales/ml.json"); } catch { return enLocale; } },
  or: () => { try { return require("@/i18n/locales/or.json"); } catch { return enLocale; } },
  as: () => { try { return require("@/i18n/locales/as.json"); } catch { return enLocale; } },
  ur: () => { try { return require("@/i18n/locales/ur.json"); } catch { return enLocale; } },
};

interface LanguageContextType {
  currentLanguage: LanguageInfo;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  translateDynamic: (text: string, targetLang?: string) => Promise<string>;
  isTranslating: boolean;
}

const defaultLanguage = getLanguageByCode("en")!;

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: defaultLanguage,
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  translateDynamic: async (text) => text,
  isTranslating: false,
});

export function LanguageProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: string;
}) {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageInfo>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("statiq_locale");
      if (saved && getLanguageByCode(saved)) {
        return getLanguageByCode(saved)!;
      }
    }
    return getLanguageByCode(initialLocale) || defaultLanguage;
  });

  const [dictionary, setDictionary] = useState<any>(() => {
    const loader = localeLoaders[currentLanguage.code] || localeLoaders.en;
    return loader();
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Sync dictionary, HTML lang and dir when language changes
  useEffect(() => {
    const langCode = currentLanguage.code;
    const loader = localeLoaders[langCode] || localeLoaders.en;
    setDictionary(loader());

    if (typeof document !== "undefined") {
      document.documentElement.lang = langCode;
      document.documentElement.dir = currentLanguage.direction || (langCode === "ur" ? "rtl" : "ltr");
    }
  }, [currentLanguage]);

  const setLanguage = useCallback((code: string) => {
    const lang = getLanguageByCode(code);
    if (lang) {
      setCurrentLanguageState(lang);
      if (typeof window !== "undefined") {
        localStorage.setItem("statiq_locale", code);
        document.cookie = `statiq_locale=${code}; path=/; max-age=31536000; SameSite=Lax`;
      }
    }
  }, []);

  // Static key lookup with fallback
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split(".");
      let value = dictionary;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          // Fallback to English dictionary
          let fallbackValue = enLocale;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk];
            } else {
              return fallback || key;
            }
          }
          return typeof fallbackValue === "string" ? fallbackValue : (fallback || key);
        }
      }

      return typeof value === "string" ? value : (fallback || key);
    },
    [dictionary]
  );

  // Dynamic Bhashini translation helper for live AI content
  const translateDynamic = useCallback(
    async (text: string, targetLang?: string): Promise<string> => {
      const target = targetLang || currentLanguage.code;
      if (!text || target === "en") {
        return text;
      }

      try {
        setIsTranslating(true);
        const res = await fetch("/api/translation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            sourceLanguage: "en",
            targetLanguage: target,
            sourceType: "dynamic_ai",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            return data.text;
          }
        }
      } catch (e) {
        console.warn("Dynamic translation failed, falling back to original:", e);
      } finally {
        setIsTranslating(false);
      }

      return text;
    },
    [currentLanguage.code]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        translateDynamic,
        isTranslating,
      }}
    >
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
  const { t, currentLanguage, translateDynamic, isTranslating, setLanguage } = useLanguage();
  return { t, currentLanguage, translateDynamic, isTranslating, setLanguage };
}
