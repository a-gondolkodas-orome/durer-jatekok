import React from 'react';
import { useLanguage } from './language-context';

export interface I18nString { hu: string; en: string }
export type Language = keyof I18nString

/**
 * Resolves a potentially multilingual value to a single language.
 * - If `texts` is a plain string, number, or React element, it is returned as-is.
 * - If `texts` is an object with `hu`/`en` keys, the value for `lang` is returned,
 *   falling back to `hu` if the requested language is missing.
 */
type Translatable = string | number | React.ReactElement | I18nString | null | undefined

export const translate = (texts: Translatable, lang: Language): Translatable => {
  if (texts === null || texts === undefined) return texts;
  if (typeof texts === 'string' || typeof texts === 'number') return texts;
  if (React.isValidElement(texts)) return texts;
  // Multilingual object: { hu: ..., en: ... }
  if (typeof texts === 'object' && ('hu' in texts || 'en' in texts)) {
    return texts[lang] ?? texts.hu;
  }
  return texts;
};

/** Hook that returns a `t()` function bound to the current language. */
export const useTranslation = () => {
  const { language } = useLanguage();
  return { t: (texts: Translatable) => translate(texts, language) };
};
