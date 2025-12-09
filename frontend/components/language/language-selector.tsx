"use client"

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from './language-provider'
import { useTranslation } from './language-provider'

export function LanguageSelector() {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage()
  const t = useTranslation()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleLanguageSelect = (languageCode: string) => {
    console.log('Language selector clicked:', languageCode)
    setLanguage(languageCode)
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => {
          console.log('Language button clicked, current open state:', open)
          setOpen(!open)
        }}
        className="w-[200px] justify-between"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-sm">{currentLanguage.flag} {currentLanguage.nativeName}</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div 
          className="absolute top-full left-0 mt-1 w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-50"
          style={{ 
            position: 'absolute',
            top: '100%',
            left: '0',
            marginTop: '4px',
            width: '200px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 50
          }}
        >
          <div style={{ padding: '4px' }}>
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: currentLanguage.code === language.code ? '#eff6ff' : 'transparent',
                  color: currentLanguage.code === language.code ? '#1d4ed8' : 'inherit',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (currentLanguage.code !== language.code) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentLanguage.code !== language.code) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
                role="option"
                aria-selected={currentLanguage.code === language.code}
              >
                <span>{language.flag}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{language.nativeName}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{language.name}</span>
                {currentLanguage.code === language.code && (
                  <Check style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
