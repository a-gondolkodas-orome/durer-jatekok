import { useLanguage } from './language-context';

export interface I18nString { hu: string; en: string }
export type Language = keyof I18nString
export type Translatable = I18nString | string

// Resolves a multilingual value to the requested language, falling back to 'hu'.
export const translate = (texts: Translatable, lang: Language): string => {
  if (!texts) return '';
  if (typeof texts === 'string') return texts;
  return texts[lang] ?? texts.hu;
};

/** Hook that returns a `t()` function bound to the current language. */
export const useTranslation = () => {
  const { language } = useLanguage();
  return { t: (texts: Translatable): string => translate(texts, language) };
};
