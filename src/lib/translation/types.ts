export type TranslationSourceType = 
  | "ui_static"
  | "dataset_description"
  | "course_description"
  | "ai_response"
  | "chart_title"
  | "table_label"
  | "help_content";

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceType: TranslationSourceType;
  bypassCache?: boolean;
}

export interface TranslationResponse {
  success: boolean;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  cached: boolean;
  error?: string;
}

export interface LanguageInfo {
  code: string;
  nativeName: string;
  englishName: string;
  direction: "ltr" | "rtl";
  enabledByApp: boolean;
  supportedByProvider?: boolean;
}
