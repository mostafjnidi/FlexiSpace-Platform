import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { getRoleHome, loadProfileRole } from '../lib/authRoles'

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 5.5l6.5 4 6.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7.5V5a3 3 0 0 1 6 0v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.5L2 4v3.5c0 3 2.333 5.1 5 6 2.667-0.9 5-3 5-6V4L7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.1 4.2C2.4 5.3 1 8 1 8s2.5 5 7 5c1.5 0 2.8-.4 3.9-1.1M7 3.1C7.3 3 7.7 3 8 3c4.5 0 7 5 7 5s-.6 1.2-1.7 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.5 4.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

// Demo accounts — fill form instantly for committee presentation
const DEMO_ACCOUNTS = [
  {
    label: 'Owner',
    email: 'demo.owner@flexispace.app',
    password: 'FlexiDemo2026!',
    route: '/workspace-ops',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/8',
  },
  {
    label: 'Operator',
    email: 'demo.operator@flexispace.app',
    password: 'FlexiDemo2026!',
    route: '/command-center',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/8',
  },
  {
    label: 'Client',
    email: 'demo.client@flexispace.app',
    password: 'FlexiDemo2026!',
    route: '/find-workspace',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8',
  },
]

function getSafeAuthError(error, t) {
  const message = (error?.message ?? '').toLowerCase()
  const code = (error?.code ?? '').toLowerCase()
  const status = error?.status

  if (status === 429 || message.includes('rate limit') || message.includes('too many')) {
    return t('auth.errors.tooManyAttempts')
  }
  if (message.includes('email not confirmed') || message.includes('not confirmed')) {
    return t('auth.errors.confirmEmail')
  }
  if (
    status === 400 ||
    code.includes('invalid_credentials') ||
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials')
  ) {
    return t('auth.errors.invalidCredentials')
  }
  return t('auth.errors.signInUnavailable')
}

function TopNav() {
  const navigate = useNavigate()
  const { t } = useI18n()
  return (
    <header dir="ltr" className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg/90 backdrop-blur-md border-b border-line flex items-center px-6 md:px-10">
      <Link
        to="/"
        className="no-underline flex items-center"
        aria-label="FlexiSpace home"
      >
        <BrandLogo variant="colored" iconSize={24} />
      </Link>
      <div className="flex items-center gap-3 ml-auto">
        <LanguageSwitcher compact />
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="inline-flex items-center gap-2 px-[18px] py-[9px] rounded-lg bg-accent text-white font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0"
        >
          {t('auth.register')}
        </button>
      </div>
    </header>
  )
}

function LoginForm() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [email, setEmail] = useState(() => localStorage.getItem('fs_remembered_email') ?? '')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('fs_remembered_email'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [failCount, setFailCount] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [lockSeconds, setLockSeconds] = useState(0)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const formRef = useRef(null)

  // Countdown for lockout
  useEffect(() => {
    if (!lockedUntil) return
    const tick = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setLockSeconds(0)
        setFailCount(0)
        clearInterval(tick)
      } else {
        setLockSeconds(remaining)
      }
    }, 500)
    return () => clearInterval(tick)
  }, [lockedUntil])

  const shakeForm = () => {
    const el = formRef.current
    if (!el) return
    el.classList.add('animate-shake')
    setTimeout(() => el.classList.remove('animate-shake'), 500)
  }

  const validate = () => {
    const errs = {}
    if (!email.trim()) errs.email = t('auth.validation.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = t('auth.validation.emailInvalid')
    if (!password) errs.password = t('auth.validation.passwordRequired')
    else if (password.length < 6) errs.password = t('auth.validation.passwordShort')
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (lockedUntil) return
    if (!validate()) { shakeForm(); return }

    setLoading(true)
    const normalizedEmail = email.trim().toLowerCase()
    let authError
    try {
      const result = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      authError = result.error
      if (!authError) {
        const role = await loadProfileRole(supabase, result.data?.user)
        if (rememberMe) localStorage.setItem('fs_remembered_email', normalizedEmail)
        else localStorage.removeItem('fs_remembered_email')
        navigate(getRoleHome(role))
        return
      }
    } catch (requestError) {
      authError = requestError
    }

    const next = failCount + 1
    setFailCount(next)
    if (next >= 3) {
      setLockedUntil(Date.now() + 30_000)
      setError(t('auth.errors.tooManyFailed'))
    } else {
      const safeMessage = getSafeAuthError(authError, t)
      if (safeMessage === t('auth.errors.invalidCredentials')) {
        setError(t('auth.errors.failedAttempts', { count: 3 - next, attempts: 3 - next === 1 ? 'attempt' : 'attempts' }))
      } else {
        setError(safeMessage)
      }
    }
    shakeForm()
    setLoading(false)
  }

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
    setFieldErrors({})
  }

  const isLocked = !!lockedUntil

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setFieldErrors((p) => ({ ...p, email: 'Enter your email first' }))
      return
    }
    setForgotLoading(true)
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    })
    setForgotLoading(false)
    setForgotSent(true)
  }

  return (
    <div className="w-full max-w-md animate-fadeUp" style={{ '--delay': '100ms' }}>
      <div className="mb-8">
        <span className="font-mono text-[13.5px] uppercase tracking-[.14em] text-accent font-semibold">
          {t('auth.authorization')}
        </span>
        <div className="mt-1.5 h-0.5 w-8 bg-accent rounded-full" />
      </div>

      {/* Demo quick-login panel */}
      <div className="mb-6 rounded-xl border border-line bg-bg-3 px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-2.5">
          {t('auth.demoAccounts')}
        </p>
        <div className="flex items-center gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => fillDemo(acc)}
              className={`flex-1 px-3 py-1.5 rounded-lg border text-[13px] font-inter font-medium transition-all duration-150 cursor-pointer ${acc.color} hover:opacity-80`}
            >
              {t(`auth.${acc.label.toLowerCase()}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400"
        >
          <span className="mt-px shrink-0"><AlertIcon /></span>
          <span className="font-inter text-[13px] leading-snug">
            {isLocked ? t('auth.accountLocked', { seconds: lockSeconds }) : error}
          </span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="font-inter text-[13.5px] text-ink-2">
            {t('auth.emailAddress')}
          </label>
          <div className={`relative bg-bg-3 border rounded-xl transition-all duration-200 ${
            fieldErrors.email ? 'border-red-500/60 ring-[3px] ring-red-500/12' : 'border-line focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14]'
          }`}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
              <MailIcon />
            </span>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })) }}
              aria-label={t('auth.emailAddress')}
              aria-invalid={!!fieldErrors.email}
              aria-describedby="login-email-error"
              className="w-full bg-transparent border-0 outline-none pl-11 pr-4 py-3.5 text-ink font-inter text-[15px] placeholder:text-neutral-2"
            />
          </div>
          <span id="login-email-error" aria-live="polite" className="font-inter text-[12px] text-red-400 flex items-center gap-1.5 min-h-[18px]">
            {fieldErrors.email && <><AlertIcon /> {fieldErrors.email}</>}
          </span>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="font-inter text-[13.5px] text-ink-2">
            {t('auth.password')}
          </label>
          <div className={`relative bg-bg-3 border rounded-xl transition-all duration-200 ${
            fieldErrors.password ? 'border-red-500/60 ring-[3px] ring-red-500/12' : 'border-line focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14]'
          }`}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
              <LockIcon />
            </span>
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })) }}
              aria-label={t('auth.password')}
              aria-invalid={!!fieldErrors.password}
              aria-describedby="login-password-error"
              className="w-full bg-transparent border-0 outline-none pl-11 pr-11 py-3.5 text-ink font-inter text-[15px] placeholder:text-neutral-2"
            />
            <button
              type="button"
              aria-label={showPass ? t('auth.hidePassword') : t('auth.showPassword')}
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral hover:text-ink-2 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0"
            >
              <EyeIcon open={showPass} />
            </button>
          </div>
          <span id="login-password-error" aria-live="polite" className="font-inter text-[12px] text-red-400 flex items-center gap-1.5 min-h-[18px]">
            {fieldErrors.password && <><AlertIcon /> {fieldErrors.password}</>}
          </span>
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
                aria-label="Remember me"
              />
              <div className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center ${
                rememberMe ? 'bg-accent border-accent' : 'bg-bg-3 border-line group-hover:border-accent/50'
              }`}>
                {rememberMe && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="font-inter text-[13px] text-neutral-2 group-hover:text-ink transition-colors duration-150">
              {t('auth.rememberMe')}
            </span>
          </label>
          <button
            type="button"
            aria-label={t('auth.forgotPassword')}
            className="font-inter text-[13.5px] text-accent hover:text-accent-2 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0"
            onClick={handleForgotPassword}
            disabled={forgotLoading}
          >
            {forgotSent ? 'Check your email' : t('auth.forgotPassword')}
          </button>
        </div>

        <button
          type="submit"
          aria-label={t('auth.signIn')}
          disabled={loading || isLocked}
          className="w-full inline-flex items-center justify-center gap-2 px-[18px] py-[14px] rounded-xl bg-accent text-white font-inter text-[13.5px] font-semibold tracking-[.1em] uppercase transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading ? t('auth.signingIn') : isLocked ? `${t('auth.locked')} (${lockSeconds}s)` : t('auth.signIn')}
          {!loading && !isLocked && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-neutral pt-1">
          <ShieldIcon />
          <span className="font-inter text-[13px] text-neutral">{t('auth.secured')}</span>
        </div>

        <p className="text-center font-inter text-[13px] text-neutral-2">
          {t('auth.dontHaveAccount')}{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-accent hover:text-accent-2 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0 font-medium"
          >
            {t('auth.createAccount')}
          </button>
        </p>
      </form>
    </div>
  )
}

export default function Login() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <TopNav />
      <main className="flex-1 flex flex-col">
        <section className="flex-1 grid md:grid-cols-2 min-h-[calc(100vh-56px)] mt-14">
          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/50 via-bg/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-10 right-10 animate-fadeUp" style={{ '--delay': '0ms' }}>
              <h1 className="font-fraunces text-4xl md:text-5xl font-light text-ink leading-tight mb-3">
                {t('auth.welcomeBack')}
              </h1>
              <p className="font-inter text-[15px] text-neutral-2 leading-relaxed max-w-xs">
                {t('auth.welcomeCopy')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 md:px-16 py-12 bg-bg">
            <div className="w-full max-w-md">
              <div className="md:hidden mb-8 animate-fadeUp" style={{ '--delay': '0ms' }}>
                <p aria-hidden="true" className="font-fraunces text-3xl font-light text-ink mb-2">{t('auth.welcomeBack')}</p>
                <p className="font-inter text-[15px] text-neutral-2">{t('auth.welcomeCopy')}</p>
              </div>
              <LoginForm />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-5 px-6 md:px-10 flex items-center justify-center">
        <p className="font-inter text-[12.5px] text-neutral">© 2026 FlexiSpace. {t('common.allRightsReserved')}</p>
      </footer>
    </div>
  )
}
