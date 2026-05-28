import { useEffect, useMemo, useState } from 'react'
import en from './en'
import ar from './ar'
import { I18nContext } from './context'

const STORAGE_KEY = 'flexispace_language'
const SUPPORTED_LANGUAGES = ['en', 'ar']
const dictionaries = { en, ar }

function normalizeLanguage(value) {
  return SUPPORTED_LANGUAGES.includes(value) ? value : 'en'
}

function getNestedValue(source, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), source)
}

function interpolate(template, values) {
  if (!values || typeof template !== 'string') return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, token) => (
    values[token] == null ? '' : String(values[token])
  ))
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY))
  })

  const direction = language === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.dir = direction
    document.documentElement.lang = language
    document.documentElement.dataset.language = language
  }, [direction, language])

  const value = useMemo(() => {
    function setLanguage(nextLanguage) {
      const normalized = normalizeLanguage(nextLanguage)
      setLanguageState(normalized)
      window.localStorage.setItem(STORAGE_KEY, normalized)
    }

    function t(key, values) {
      const activeValue = getNestedValue(dictionaries[language], key)
      const fallbackValue = getNestedValue(dictionaries.en, key)
      return interpolate(activeValue ?? fallbackValue ?? key, values)
    }

    return {
      t,
      language,
      setLanguage,
      direction,
      locale: language === 'ar' ? 'ar' : 'en-US',
    }
  }, [direction, language])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
