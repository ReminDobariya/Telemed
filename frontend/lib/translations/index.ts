import { en } from './en'
import { hi } from './hi'
import { gu } from './gu'
import { mr } from './mr'

export type TranslationKey = keyof typeof en

export const translations = {
  en,
  hi,
  gu,
  mr
} as const

export type LanguageCode = keyof typeof translations

export function getTranslation(languageCode: LanguageCode, key: TranslationKey): string {
  const translation = translations[languageCode]
  if (!translation) {
    console.warn(`Translation not found for language: ${languageCode}`)
    return translations.en[key] || key
  }
  
  const value = translation[key]
  if (!value) {
    console.warn(`Translation key not found: ${key} for language: ${languageCode}`)
    return translations.en[key] || key
  }
  
  return value
}

export function getAllTranslations(languageCode: LanguageCode) {
  return translations[languageCode] || translations.en
}
