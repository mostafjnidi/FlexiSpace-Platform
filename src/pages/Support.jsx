import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import { useI18n } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { supabase } from '../lib/supabase'
import { getRoleHome } from '../lib/authRoles'

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2a5 5 0 0 0-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 0 0-5-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7.5 14.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function HelpCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 7a2 2 0 0 1 4 .667c0 1.333-2 1.666-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.8" fill="currentColor" />
    </svg>
  )
}


function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L3 5v4.5c0 4 2.5 6.5 6 8 3.5-1.5 6-4 6-8V5L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M6 9.5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NetworkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="15" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="9" cy="15" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 9h2.5M11 9h2.5M9 4.5v2.5M9 11v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function BillingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="3" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 7h6M6 10h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.5 6.5h13" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function KbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="#10B981" strokeWidth="1.4" />
      <path d="M6 8h8M6 11h5" stroke="#10B981" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 14l2 2" stroke="#10B981" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M14 2L1 7l5 1.5M14 2L9 15l-3-6.5M14 2L6.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'border-white/[.07] bg-white/[.02]' : 'border-line bg-bg-2'}`}>
      <button
        aria-expanded={isOpen}
        aria-label={item.title}
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 cursor-pointer bg-transparent border-0 text-left group"
      >
        <span className="text-accent shrink-0">{item.icon}</span>
        <span className="flex-1 font-inter text-[13px] font-semibold text-ink">{item.title}</span>
        <span className={`text-neutral-2 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 border-t border-line pt-4">
          <p className="font-inter text-[13.5px] text-neutral-2 leading-relaxed">{item.content}</p>
        </div>
      )}
    </div>
  )
}

function SupportForm({ t, prefillName = '', prefillEmail = '' }) {
  const [form, setForm] = useState({ name: prefillName, email: prefillEmail, category: '', summary: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setForm(prev => ({ ...prev, name: prefillName, email: prefillEmail }))
  }, [prefillName, prefillEmail])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const inputClass = "w-full bg-bg-3 border border-line rounded-xl px-4 py-3.5 text-ink font-inter text-[13.5px] placeholder:text-neutral outline-none focus:border-accent focus:ring-[2px] focus:ring-accent/[.1] transition-all duration-200"

  return (
    <div className="bg-bg-2 border border-line rounded-2xl shadow-card p-7 animate-fadeUp" style={{ '--delay': '120ms' }}>
      <div className="mb-6">
        <h2 className="font-inter text-[16px] font-semibold text-ink mb-2">{t('support.directSupport')}</h2>
        <p className="font-inter text-[13.5px] text-neutral-2 leading-relaxed">
          {t('support.directSupportDesc')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-name" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
            {t('support.operatorName')}
          </label>
          <input
            id="support-name"
            aria-label={t('support.operatorName')}
            name="name"
            type="text"
            placeholder={t('support.operatorName')}
            value={form.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-email" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
            {t('support.systemEmail')}
          </label>
          <input
            id="support-email"
            aria-label={t('support.systemEmail')}
            name="email"
            type="email"
            placeholder={t('support.systemEmail')}
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-category" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
            {t('support.incidentCategory')}
          </label>
          <div className="relative">
            <select
              id="support-category"
              aria-label={t('support.incidentCategory')}
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`${inputClass} appearance-none pr-10 cursor-pointer`}
            >
              <option value="" className="bg-bg-3 text-neutral">{t('support.incidentCategory')}</option>
              <option value="access" className="bg-bg-3 text-ink">{t('support.accessAuth')}</option>
              <option value="iot" className="bg-bg-3 text-ink">{t('support.iotConn')}</option>
              <option value="billing" className="bg-bg-3 text-ink">{t('support.billingLic')}</option>
              <option value="hardware" className="bg-bg-3 text-ink">{t('support.hardwareMalfunction')}</option>
              <option value="other" className="bg-bg-3 text-ink">{t('support.other')}</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-accent pointer-events-none">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="support-summary" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
            {t('support.diagnosticSummary')}
          </label>
          <textarea
            id="support-summary"
            aria-label={t('support.diagnosticSummary')}
            name="summary"
            placeholder={t('support.diagnosticSummary')}
            value={form.summary}
            onChange={handleChange}
            rows={5}
            className={`${inputClass} resize-none`}
          />
        </div>
        <button
          type="submit"
          aria-label={t('support.transmitRequest')}
          disabled={submitted}
          className="w-full inline-flex items-center justify-center gap-3 px-[18px] py-[14px] rounded-xl bg-accent text-white font-inter text-[13.5px] font-semibold tracking-[.08em] transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0 disabled:opacity-70 mt-1"
        >
          {submitted ? t('support.transmitted') : t('support.transmitRequest')}
          {!submitted && <SendIcon />}
        </button>
      </form>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Support() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [openItem, setOpenItem] = useState(null)
  const [userId, setUserId] = useState(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', user.id)
          .maybeSingle()
        if (profile) {
          setUserName(profile.full_name ?? '')
          setUserEmail(profile.email ?? user.email ?? '')
          setUserRole(profile.role ?? null)
        } else {
          setUserEmail(user.email ?? '')
        }
      } catch {
        // silent — support page works without auth
      }
    }
    loadUser()
  }, [])

  const kbItems = [
    {
      id: 'security',
      icon: <ShieldIcon />,
      title: t('support.kbSecurityTitle'),
      content: t('support.kbSecurityContent'),
    },
    {
      id: 'iot',
      icon: <NetworkIcon />,
      title: t('support.kbIotTitle'),
      content: t('support.kbIotContent'),
    },
    {
      id: 'billing',
      icon: <BillingIcon />,
      title: t('support.kbBillingTitle'),
      content: t('support.kbBillingContent'),
    },
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={22} /></Link>

        <button
          aria-label={t('support.backToDashboard')}
          onClick={() => userRole ? navigate(getRoleHome(userRole)) : navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter text-[12.5px] text-neutral-2 hover:text-ink hover:bg-bg-3 transition-all duration-200 cursor-pointer bg-transparent border border-line ml-2"
        >
          <BackIcon />
          {t('support.backToDashboard')}
        </button>

        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher compact />
          <button
            aria-label={t('common.notifications')}
            className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
          >
            <BellIcon />
          </button>
          <button
            aria-label={t('common.help')}
            className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
          >
            <HelpCircleIcon />
          </button>
          <div className="pl-3 border-l border-line ml-1">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-line">
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${userId || 'default'}&backgroundColor=1F211D`}
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        <section className="px-6 md:px-10 py-12 max-w-7xl mx-auto">
          <div className="mb-10 animate-fadeUp" style={{ '--delay': '0ms' }}>
            <h1 className="font-inter text-[32px] font-bold tracking-tight text-ink mb-3">{t('support.hubTitle')}</h1>
            <p className="font-inter text-[15px] text-neutral-2 leading-relaxed max-w-xl">
              {t('support.hubSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_480px] gap-10 items-start">
            <div className="animate-fadeUp" style={{ '--delay': '80ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <KbIcon />
                <h2 className="font-inter text-[16px] font-semibold text-ink">{t('support.knowledgeBase')}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {kbItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    isOpen={openItem === item.id}
                    onToggle={() => setOpenItem(openItem === item.id ? null : item.id)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SupportForm t={t} prefillName={userName} prefillEmail={userEmail} />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 md:px-10 py-6 bg-bg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-inter text-[13px] text-neutral">{t('support.copyright')}</span>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            {[
              { key: 'privacyPolicy', label: t('support.privacyPolicy') },
              { key: 'termsOfService', label: t('support.termsOfService') },
              { key: 'systemStatus', label: t('support.systemStatus') },
              { key: 'contactLink', label: t('support.contactLink') },
            ].map((l) => (
              <a key={l.key} href="#" className="font-inter text-[13px] text-neutral hover:text-ink transition-colors duration-200 no-underline">
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
