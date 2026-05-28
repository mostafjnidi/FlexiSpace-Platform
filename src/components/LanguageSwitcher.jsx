import { useI18n } from '../i18n'

export default function LanguageSwitcher({ compact = false, className = '' }) {
  const { t, language, setLanguage } = useI18n()

  return (
    <div
      className={`language-switcher inline-flex items-center rounded-full border border-line bg-bg-3/80 p-1 ${className}`}
      role="group"
      aria-label={t('common.language')}
      dir="ltr"
    >
      {[
        { value: 'en', label: compact ? 'EN' : t('common.english') },
        { value: 'ar', label: compact ? 'AR' : t('common.arabic') },
      ].map((option) => {
        const active = language === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLanguage(option.value)}
            className={`min-h-8 px-3 rounded-full font-inter text-[12px] font-medium transition-all duration-200 cursor-pointer border-0 ${
              active ? 'bg-accent text-white shadow-sm' : 'bg-transparent text-neutral-2 hover:text-ink'
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
