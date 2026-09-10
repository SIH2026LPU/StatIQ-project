import { LanguageInfo } from "./types";

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: "en",
    nativeName: "English",
    englishName: "English",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "hi",
    nativeName: "हिन्दी",
    englishName: "Hindi",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "bn",
    nativeName: "বাংলা",
    englishName: "Bengali",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "te",
    nativeName: "తెలుగు",
    englishName: "Telugu",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "mr",
    nativeName: "मराठी",
    englishName: "Marathi",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "ta",
    nativeName: "தமிழ்",
    englishName: "Tamil",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "gu",
    nativeName: "ગુજરાતી",
    englishName: "Gujarati",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "kn",
    nativeName: "ಕನ್ನಡ",
    englishName: "Kannada",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "ml",
    nativeName: "മലയാളം",
    englishName: "Malayalam",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "pa",
    nativeName: "ਪੰਜਾਬੀ",
    englishName: "Punjabi",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "or",
    nativeName: "ଓଡ଼ିଆ",
    englishName: "Odia",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "as",
    nativeName: "অসমীয়া",
    englishName: "Assamese",
    direction: "ltr",
    enabledByApp: true,
  },
  {
    code: "ur",
    nativeName: "اردو",
    englishName: "Urdu",
    direction: "rtl",
    enabledByApp: true,
  }
];

export function getLanguageByCode(code: string): LanguageInfo | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}
