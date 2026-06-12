import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'

function Eyebrow({ label }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 border border-line rounded-full bg-white/[.05] font-inter text-[11px] uppercase tracking-[.1em] text-ink-2">
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      {label}
    </div>
  )
}

function Logo() {
  const navigate = useNavigate()
  return (
    <Link
      to="/"
      className="no-underline flex items-center"
      aria-label="FlexiSpace home"
    >
      <BrandLogo variant="colored" iconSize={28} />
    </Link>
  )
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const links = [
    { label: t('home.memberPortal'), path: '/login' },
    { label: t('home.getStarted'), path: '/register' },
  ]
  return (
    <header dir="ltr" className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/[.05] bg-bg/95 backdrop-blur-xl">
      <Logo />
      <div className="hidden md:flex items-center gap-3">
        <LanguageSwitcher compact />
        <button aria-label={t('home.memberPortal')} onClick={() => navigate('/login')} className="inline-flex items-center gap-2 px-[18px] py-[11px] rounded-full bg-transparent border border-line text-ink font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-white/[.06] hover:-translate-y-px cursor-pointer">
          {t('home.memberPortal')}
        </button>
        <div className="group">
          <button aria-label={t('home.getStarted')} onClick={() => navigate('/register')} className="inline-flex items-center gap-2 px-[18px] py-[11px] rounded-full bg-accent text-white font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-accent-2 hover:-translate-y-px cursor-pointer border-0">
            {t('home.getStarted')}
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[2px]" style={{ transform: direction === 'rtl' ? 'scaleX(-1)' : undefined }}>→</span>
          </button>
        </div>
      </div>
      <button
        aria-label="Toggle mobile menu"
        className="md:hidden flex flex-col gap-1.5 p-2"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className="w-5 h-px bg-ink-2 block" />
        <span className="w-5 h-px bg-ink-2 block" />
        <span className="w-3 h-px bg-ink-2 block" />
      </button>
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-bg border-b border-line flex flex-col p-4 gap-2 md:hidden">
          {links.map((l) => (
            <a key={l.label} href="#" onClick={() => { setMenuOpen(false); navigate(l.path) }} className="px-4 py-2.5 rounded-xl font-inter text-[13.5px] text-ink-2 hover:text-ink hover:bg-white/[.06] transition-all duration-200 no-underline cursor-pointer">
              {l.label}
            </a>
          ))}
          <div className="border-t border-line pt-3 mt-1 flex flex-col gap-2">
            <button aria-label={t('home.memberPortal')} className="inline-flex items-center justify-center gap-2 px-[18px] py-[11px] rounded-full bg-transparent border border-line text-ink font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-white/[.06] cursor-pointer">
              {t('home.memberPortal')}
            </button>
            <button aria-label={t('home.getStarted')} className="inline-flex items-center justify-center gap-2 px-[18px] py-[11px] rounded-full bg-accent text-white font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0">
              {t('home.getStarted')} →
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

function HeroSection() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  return (
    <section className="pt-16 min-h-[100dvh] flex items-center bg-bg overflow-hidden">
      <div className="w-full px-6 md:px-12 py-20 md:py-0 grid md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-7 animate-fadeUp" style={{ '--delay': '0ms' }}>
          <div>
            <Eyebrow label={t('home.networkExpanding')} />
          </div>
          <h1 className="font-fraunces text-4xl md:text-[56px] font-light leading-[1.08] tracking-tight text-ink m-0">
            {t('home.heroTitle')}
          </h1>
          <p className="font-inter text-[15px] text-neutral-2 leading-relaxed max-w-sm">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="group">
              <button aria-label={t('home.explorePortfolio')} onClick={() => navigate('/find-workspace')} className="inline-flex items-center gap-2 px-[18px] py-[11px] rounded-full bg-accent text-white font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-accent-2 hover:-translate-y-px cursor-pointer border-0">
                {t('home.explorePortfolio')}
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-[3px] group-hover:-translate-y-[2px]" style={{ transform: direction === 'rtl' ? 'scaleX(-1)' : undefined }}>→</span>
              </button>
            </div>
            <button aria-label={t('home.viewTour')} className="inline-flex items-center gap-2 px-[18px] py-[11px] rounded-full bg-transparent border border-line text-ink font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-white/[.06] hover:-translate-y-px cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <polygon points="6.5,5.5 11,8 6.5,10.5" fill="currentColor" />
              </svg>
              {t('home.viewTour')}
            </button>
          </div>
          <div className="flex items-center gap-8 pt-2">
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1L8.545 5.09H13L9.5 7.636L10.955 12L7 9.272L3.045 12L4.5 7.636L1 5.09H5.455L7 1Z" fill="#10B981" />
                </svg>
                <span className="font-fraunces text-xl font-medium text-ink">4.9/5</span>
              </div>
              <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('home.guestRating')}</span>
            </div>
            <div className="w-px h-8 bg-line" />
            <div>
              <span className="font-fraunces text-xl font-medium text-ink block mb-0.5">12+</span>
              <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('home.globalLocations')}</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col gap-4 animate-fadeUp" style={{ '--delay': '120ms' }}>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <img
              src="/src/assets/pinnacle.jpg"
              alt="Premium workspace interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
              <div>
                <span className="font-inter text-[11px] uppercase tracking-[.1em] text-accent mb-1 block">{t('home.featuredLocation')}</span>
                <h3 className="font-fraunces text-lg font-medium text-ink m-0">The Pinnacle</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1C4.067 1 2.5 2.567 2.5 4.5C2.5 7.5 6 11 6 11C6 11 9.5 7.5 9.5 4.5C9.5 2.567 7.933 1 6 1Z" stroke="currentColor" strokeWidth="1.1" fill="none" />
                    <circle cx="6" cy="4.5" r="1.2" fill="currentColor" />
                  </svg>
                  <span className="font-inter text-[12px] text-neutral-2">{t('home.downtown')}</span>
                </div>
              </div>
              <button aria-label="View The Pinnacle location" className="w-11 h-11 rounded-full border border-line bg-ink/[.06] flex items-center justify-center text-ink hover:bg-ink/10 transition-all duration-200 cursor-pointer" style={{ transform: direction === 'rtl' ? 'scaleX(-1)' : undefined }}>
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EnvironmentCard({ badge, image, title, description, capacity, delay, t }) {
  return (
    <div
      className="bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden transition-transform duration-[350ms] ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 animate-fadeUp"
      style={{ '--delay': delay }}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-2/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-2/80 border border-line font-inter text-[11px] uppercase tracking-[.1em] text-ink-2">
            {badge}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-fraunces text-xl font-medium text-ink mb-2 mt-0">{title}</h3>
        <p className="font-inter text-[13.5px] text-neutral-2 leading-relaxed mb-4">{description}</p>
        <div className="flex items-center justify-between pt-3 border-t border-line">
          <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('home.capacity')} {capacity}</span>
          <button aria-label={`${t('home.reserve')} ${title}`} className="font-inter text-[11px] uppercase tracking-[.1em] text-accent hover:text-accent-2 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
            {t('home.reserve')}
          </button>
        </div>
      </div>
    </div>
  )
}

function PortfolioSection() {
  const { t, direction } = useI18n()
  const envs = [
    {
      badge: t('home.envExecutive'),
      image: 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=80',
      title: t('home.envApexTitle'),
      description: t('home.envApexDesc'),
      capacity: '12–15',
      delay: '80ms',
    },
    {
      badge: t('home.envCollaborative'),
      image: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80',
      title: t('home.envFoundTitle'),
      description: t('home.envFoundDesc'),
      capacity: '20–30',
      delay: '160ms',
    },
  ]
  return (
    <section className="py-24 px-6 md:px-12 bg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-4 animate-fadeUp" style={{ '--delay': '0ms' }}>
            <Eyebrow label={t('home.portfolioSection')} />
            <h2 className="font-fraunces text-3xl md:text-4xl font-light leading-tight text-ink m-0">
              {t('home.portfolioTitle')}
            </h2>
            <p className="font-inter text-[15px] text-neutral-2 leading-relaxed max-w-sm">
              {t('home.portfolioSubtitle')}
            </p>
          </div>
          <a href="#" className="font-inter text-[13.5px] text-accent hover:text-accent-2 transition-colors duration-200 no-underline whitespace-nowrap shrink-0 animate-fadeUp" style={{ '--delay': '80ms' }}>
            {t('home.viewAllEnv')}
          </a>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {envs.map((e) => (
            <EnvironmentCard key={e.title} {...e} t={t} direction={direction} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessStep({ icon, title, description, delay }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 p-8 bg-bg-2 border border-line rounded-2xl shadow-card animate-fadeUp" style={{ '--delay': delay }}>
      <div className="w-14 h-14 rounded-full bg-bg-3 border border-line flex items-center justify-center text-accent">
        {icon}
      </div>
      <h3 className="font-fraunces text-xl font-medium text-ink m-0">{title}</h3>
      <p className="font-inter text-[13.5px] text-neutral-2 leading-relaxed">{description}</p>
    </div>
  )
}

function ProcessSection() {
  const { t } = useI18n()
  const steps = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="2" y="4" width="18" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <rect x="2" y="9.5" width="12" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <rect x="2" y="15" width="15" height="3" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      ),
      title: t('home.step1Title'),
      description: t('home.step1Desc'),
      delay: '80ms',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <rect x="4" y="10" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="11" cy="14.5" r="1.5" fill="currentColor" />
        </svg>
      ),
      title: t('home.step2Title'),
      description: t('home.step2Desc'),
      delay: '160ms',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <polyline points="3,16 8,10 12,13 17,6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="14,6 17,6 17,9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: t('home.step3Title'),
      description: t('home.step3Desc'),
      delay: '240ms',
    },
  ]
  return (
    <section className="py-24 px-6 md:px-12 bg-bg-2">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-14 animate-fadeUp" style={{ '--delay': '0ms' }}>
          <Eyebrow label={t('home.processSection')} />
          <h2 className="font-fraunces text-3xl md:text-4xl font-light text-ink m-0">{t('home.processTitle')}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <ProcessStep key={s.title} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}

function GlobalPresenceSection() {
  const { t } = useI18n()
  const pins = [
    { top: '38%', left: '22%' },
    { top: '35%', left: '48%' },
    { top: '55%', left: '72%' },
    { top: '42%', left: '80%' },
  ]
  return (
    <section className="py-24 px-6 md:px-12 bg-bg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-14 animate-fadeUp" style={{ '--delay': '0ms' }}>
          <Eyebrow label={t('home.networkSection')} />
          <h2 className="font-fraunces text-3xl md:text-4xl font-light text-ink m-0">{t('home.networkTitle')}</h2>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-line bg-bg-2 animate-fadeUp" style={{ '--delay': '80ms' }}>
          <img
            src="https://images.unsplash.com/photo-1589519160732-576f1f2c069d?auto=format&fit=crop&w=1200&q=80"
            alt="World map showing FlexiSpace locations"
            loading="lazy"
            className="w-full h-auto object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg/60" />
          {pins.map((p, i) => (
            <div
              key={i}
              className="absolute"
              style={{ top: p.top, left: p.left }}
              aria-hidden="true"
            >
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-line rounded-xl overflow-hidden bg-bg-2 transition-all duration-200">
      <button
        aria-expanded={open}
        aria-label={question}
        className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer bg-transparent border-0 group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-inter text-[15px] font-medium text-ink">{question}</span>
        <span className={`text-neutral-2 transition-transform duration-200 shrink-0 ml-4 ${open ? 'rotate-180' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-line pt-4">
          <p className="font-inter text-[13.5px] text-neutral-2 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

function FaqSection() {
  const { t } = useI18n()
  const faqs = [
    { question: t('home.faq1Q'), answer: t('home.faq1A') },
    { question: t('home.faq2Q'), answer: t('home.faq2A') },
    { question: t('home.faq3Q'), answer: t('home.faq3A') },
  ]
  return (
    <section className="py-24 px-6 md:px-12 bg-bg-2">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-12 animate-fadeUp" style={{ '--delay': '0ms' }}>
          <Eyebrow label={t('home.knowledgeSection')} />
          <h2 className="font-fraunces text-3xl md:text-4xl font-light text-ink m-0">{t('home.faqTitle')}</h2>
        </div>
        <div className="flex flex-col gap-3">
          {faqs.map((f) => (
            <FaqItem key={f.question} {...f} />
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const { t } = useI18n()
  const portfolioLinks = [
    t('home.executiveSuites'),
    t('home.collaborativeHubs'),
    t('home.boardrooms'),
    t('home.virtualOffice'),
  ]
  const solutionsLinks = [
    t('home.forStartups'),
    t('home.enterpriseCustom'),
    t('home.eventSpaces'),
    t('home.pricing'),
  ]
  const supportLinks = [
    t('home.helpCenter'),
    t('home.memberPortal'),
    t('home.contactUs'),
    t('home.systemStatus'),
  ]
  return (
    <footer className="bg-bg border-t border-line px-6 md:px-12 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="font-inter text-[13.5px] text-neutral-2 leading-relaxed max-w-[200px]">
              {t('home.premiumWorkspaces')}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="w-11 h-11 rounded-full border border-line bg-ink/[.04] flex items-center justify-center text-neutral-2 hover:text-ink hover:bg-ink/[.08] transition-all duration-200">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
                  <path d="M10.5 1.5H12.5L8.5 6L13 12H9.5L6.5 8.5L3 12H1L5.5 7L1 1.5H4.5L7.5 4.8L10.5 1.5ZM9.8 10.8H10.8L4.2 2.5H3.2L9.8 10.8Z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-11 h-11 rounded-full border border-line bg-ink/[.04] flex items-center justify-center text-neutral-2 hover:text-ink hover:bg-ink/[.08] transition-all duration-200">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true">
                  <path d="M2.5 4H0.5V13H2.5V4ZM1.5 3C2.1 3 2.5 2.6 2.5 2C2.5 1.4 2.1 1 1.5 1C0.9 1 0.5 1.4 0.5 2C0.5 2.6 0.9 3 1.5 3ZM13 8V13H11V8.5C11 7.4 10.4 7 9.7 7C9 7 8.5 7.5 8.5 8.5V13H6.5V4H8.5V5C8.9 4.3 9.7 4 10.5 4C12 4 13 5.1 13 8Z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral block mb-5">{t('home.portfolio')}</span>
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {portfolioLinks.map((l) => (
                <li key={l}>
                  <a href="#" className="font-inter text-[13.5px] text-neutral-2 hover:text-ink transition-colors duration-200 no-underline">{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral block mb-5">{t('home.solutions')}</span>
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {solutionsLinks.map((l) => (
                <li key={l}>
                  <a href="#" className="font-inter text-[13.5px] text-neutral-2 hover:text-ink transition-colors duration-200 no-underline">{l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral block mb-5">{t('home.support')}</span>
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {supportLinks.map((l) => (
                <li key={l}>
                  <a href="#" className="font-inter text-[13.5px] text-neutral-2 hover:text-ink transition-colors duration-200 no-underline">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-inter text-[13px] text-neutral">{t('home.copyright')}</span>
          <div className="flex items-center gap-5">
            <a href="#" className="font-inter text-[13px] text-neutral hover:text-ink transition-colors duration-200 no-underline">{t('home.privacyPolicy')}</a>
            <a href="#" className="font-inter text-[13px] text-neutral hover:text-ink transition-colors duration-200 no-underline">{t('home.termsOfService')}</a>
            <a href="#" className="font-inter text-[13px] text-neutral hover:text-ink transition-colors duration-200 no-underline">{t('home.cookieSettings')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function FlexiSpaceHome() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main>
        <HeroSection />
        <PortfolioSection />
        <ProcessSection />
        <GlobalPresenceSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  )
}
