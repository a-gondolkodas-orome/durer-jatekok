import React from 'react';
import { useLanguage } from './language-context';

export interface I18nString { hu: string; en: string }
export type Language = keyof I18nString
export type Translatable = I18nString | string

export interface I18nNode { hu: React.ReactNode; en?: React.ReactNode }
export type TranslatableNode = I18nNode | React.ReactNode

const isI18nLike = (v: unknown): v is I18nNode =>
  typeof v === 'object' && v !== null && 'hu' in v;

export const translate = (texts: Translatable, lang: Language): string => {
  if (typeof texts === 'string') return texts;
  return texts[lang] ?? texts.hu;
};

export const translateNode = (texts: TranslatableNode, lang: Language): React.ReactNode => {
  if (texts == null) return null;
  if (isI18nLike(texts)) return texts[lang] ?? texts.hu;
  return texts;
};

/** Hook that returns `t()` (string) and `tNode()` (ReactNode) bound to the current language. */
export const useTranslation = () => {
  const { language } = useLanguage();
  return {
    t: (texts: Translatable): string => translate(texts, language),
    tNode: (texts: TranslatableNode): React.ReactNode => translateNode(texts, language)
  };
};
