"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, type Language } from '@/lib/languages'
import { getTranslation, type LanguageCode, type TranslationKey } from '@/lib/translations'

interface LanguageContextType {
  currentLanguage: Language
  setLanguage: (languageCode: string) => void
  t: (key: TranslationKey) => string
  availableLanguages: Language[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguageCode, setCurrentLanguageCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected-language')
      if (saved && SUPPORTED_LANGUAGES.find(lang => lang.code === saved)) {
        return saved
      }
    }
    return DEFAULT_LANGUAGE
  })

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguageCode) || 
    SUPPORTED_LANGUAGES.find(lang => lang.code === DEFAULT_LANGUAGE)!

  const setLanguage = (languageCode: string) => {
    console.log('Setting language to:', languageCode)
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)
    if (language) {
      console.log('Found language:', language)
      setCurrentLanguageCode(languageCode)
      if (typeof window !== 'undefined') {
        localStorage.setItem('selected-language', languageCode)
        console.log('Saved to localStorage:', languageCode)
      }
    } else {
      console.error('Language not found:', languageCode)
    }
  }

  const t = (key: TranslationKey): string => {
    return getTranslation(currentLanguageCode as LanguageCode, key)
  }

  // Update document language attribute
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLanguageCode
    }
  }, [currentLanguageCode])

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    availableLanguages: SUPPORTED_LANGUAGES
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Hook for easy translation access
export function useTranslation() {
  const { t } = useLanguage()
  return t
}
