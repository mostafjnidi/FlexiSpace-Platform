import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { getRoleHome, loadProfileRole } from '../lib/authRoles'

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

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
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 3.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="6.5" cy="9" r="0.65" fill="currentColor" />
    </svg>
  )
}

function getSafeSignupError(error) {
  const message = (error?.message ?? '').toLowerCase()
  const code = (error?.code ?? '').toLowerCase()
  const status = error?.status

  if (status === 429 || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Please try again later.'
  }
  if (code.includes('weak_password') || (message.includes('password') && message.includes('weak'))) {
    return 'Please choose a stronger password.'
  }
  if (
    status === 422 ||
    message.includes('already registered') ||
    message.includes('already exists') ||
    message.includes('duplicate')
  ) {
    return 'Unable to create account with these details.'
  }
  return 'Unable to create account right now. Please try again.'
}

// Scores password complexity → returns label + styling
function getPasswordStrength(pwd) {
  if (!pwd) return null
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { label: 'Weak',   bar: 'w-1/4', barColor: 'bg-red-500',    text: 'text-red-400' }
  if (score === 2) return { label: 'Fair',   bar: 'w-2/4', barColor: 'bg-orange-400', text: 'text-orange-400' }
  if (score === 3) return { label: 'Good',   bar: 'w-3/4', barColor: 'bg-yellow-400', text: 'text-yellow-400' }
  return              { label: 'Strong', bar: 'w-full', barColor: 'bg-accent',     text: 'text-accent' }
}

// Demo roles — allows switching account type during creation for committee demo
const DEMO_ROLES = [
  { value: 'client', labelKey: 'auth.client', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/8' },
  { value: 'operator', labelKey: 'auth.operator', color: 'text-sky-400 border-sky-500/30 bg-sky-500/8' },
  { value: 'owner', labelKey: 'auth.owner', color: 'text-violet-400 border-violet-500/30 bg-violet-500/8' },
]

function InputField({ label, id, icon, type = 'text', placeholder, value, onChange, error, showToggle, onToggle, show }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
        {label}
      </label>
      <div className={`relative bg-bg-3 border rounded-xl transition-all duration-200 ${
        error
          ? 'border-red-500/60 ring-[3px] ring-red-500/12'
          : 'border-line focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14]'
      }`}>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          name={id}
          type={showToggle ? (show ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={`${id}-error`}
          className="w-full bg-transparent border-0 outline-none pl-11 pr-11 py-3.5 text-ink font-inter text-[15px] placeholder:text-neutral-2"
        />
        {showToggle && (
          <button
            type="button"
            aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
            onClick={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral hover:text-ink-2 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0"
          >
            <EyeIcon open={show} />
          </button>
        )}
      </div>
      <span id={`${id}-error`} aria-live="polite" className="flex items-center gap-1.5 font-inter text-[12px] text-red-400 min-h-[18px]">
        {error && <><AlertIcon /> {error}</>}
      </span>
    </div>
  )
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
          aria-label={t('auth.login')}
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-2 px-[18px] py-[9px] rounded-lg bg-accent text-white font-inter text-[13.5px] font-medium transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0"
        >
          {t('auth.login')}
        </button>
      </div>
    </header>
  )
}

function RegistrationForm() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const formRef = useRef(null)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedRole, setSelectedRole] = useState('client')
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const strength = getPasswordStrength(form.password)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setSubmitError('')
    setSuccessMessage('')
  }

  const shakeForm = () => {
    const el = formRef.current
    if (!el) return
    el.classList.add('animate-shake')
    setTimeout(() => el.classList.remove('animate-shake'), 500)
  }

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = t('auth.validation.fullNameRequired')
    if (!form.email.trim()) errs.email = t('auth.validation.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('auth.validation.emailInvalid')
    if (!form.password) errs.password = t('auth.validation.passwordRequired')
    else if (form.password.length < 8) errs.password = t('auth.validation.passwordShort')
    if (!form.confirmPassword) errs.confirmPassword = t('auth.validation.confirmRequired')
    else if (form.password !== form.confirmPassword) errs.confirmPassword = t('auth.validation.passwordMismatch')
    if (!agreedToTerms) errs.terms = 'You must agree to the Terms of Service'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSuccessMessage('')
    if (!validate()) { shakeForm(); return }
    setSubmitted(true)

    const normalizedEmail = form.email.trim().toLowerCase()
    let signupData = null
    let signupError
    try {
      const result = await supabase.auth.signUp({
        email: normalizedEmail,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            requested_role: selectedRole,
          },
        },
      })
      signupData = result.data
      signupError = result.error
    } catch (requestError) {
      signupError = requestError
    }

    if (signupError) {
      setSubmitError(getSafeSignupError(signupError))
      setSubmitted(false)
      shakeForm()
      return
    }

    if (signupData?.session) {
      // Auto-signed in (email confirmation disabled) — go straight to role home
      const role = await loadProfileRole(supabase, signupData.session.user ?? signupData.user)
      navigate(getRoleHome(role))
    } else {
      // Email confirmation required — stay on page, show message
      setSuccessMessage('Account created. Check your email to confirm your account, then log in.')
      setSubmitted(false)
    }
  }

  return (
    <div className="bg-bg-2 border border-line rounded-2xl shadow-card p-8 w-full max-w-md animate-fadeUp" style={{ '--delay': '120ms' }}>
      <div className="mb-5">
        <h2 className="font-mono text-[15px] uppercase tracking-[.14em] text-accent font-medium mb-1">{t('auth.register')}</h2>
        <p className="font-inter text-[13.5px] text-neutral-2">{t('auth.createAccount')}</p>
      </div>

      {/* Demo role selector */}
      <div className="mb-5 rounded-xl border border-line bg-bg-3 px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-2.5">{t('auth.role')}</p>
        <div className="flex items-center gap-2">
          {DEMO_ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`flex-1 px-3 py-1.5 rounded-lg border text-[12.5px] font-inter font-medium transition-all duration-150 cursor-pointer ${role.color} ${
                selectedRole === role.value ? 'ring-2 ring-offset-1 ring-offset-bg-3 ring-current opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
            >
              {t(role.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400"
        >
          <span className="mt-px shrink-0"><AlertIcon /></span>
          <span className="font-inter text-[13px] leading-snug">{submitError}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-accent/10 border border-accent/25 text-accent"
        >
          <span className="mt-px shrink-0"><ShieldIcon /></span>
          <span className="font-inter text-[13px] leading-snug">{successMessage}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <InputField
          label={t('auth.fullName')}
          id="fullName"
          icon={<PersonIcon />}
          placeholder="John Doe"
          value={form.fullName}
          onChange={handleChange}
          error={fieldErrors.fullName}
        />
        <InputField
          label={t('auth.emailAddress')}
          id="email"
          type="email"
          icon={<MailIcon />}
          placeholder="john@company.com"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />

        {/* Password with strength indicator */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
            {t('auth.password')}
          </label>
          <div className={`relative bg-bg-3 border rounded-xl transition-all duration-200 ${
            fieldErrors.password
              ? 'border-red-500/60 ring-[3px] ring-red-500/12'
              : 'border-line focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14]'
          }`}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
              <LockIcon />
            </span>
            <input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              aria-label={t('auth.password')}
              aria-invalid={!!fieldErrors.password}
              aria-describedby="password-error"
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

          {/* Strength bar */}
          {form.password && strength && (
            <div className="flex items-center gap-2.5 mt-0.5">
              <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.barColor}`} />
              </div>
              <span className={`font-mono text-[11px] uppercase tracking-[.14em] font-medium ${strength.text}`}>
                {t(`auth.${strength.label.toLowerCase()}`)}
              </span>
            </div>
          )}

          <span id="password-error" aria-live="polite" className="flex items-center gap-1.5 font-inter text-[12px] text-red-400 min-h-[18px]">
            {fieldErrors.password && <><AlertIcon /> {fieldErrors.password}</>}
          </span>
        </div>

        <InputField
          label={t('auth.confirmPassword')}
          id="confirmPassword"
          icon={<ShieldIcon />}
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          showToggle
          show={showConfirm}
          onToggle={() => setShowConfirm(!showConfirm)}
        />

        {/* Terms & Conditions */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked)
                  setFieldErrors((p) => ({ ...p, terms: '' }))
                }}
                className="sr-only"
                aria-label="Agree to Terms of Service and Privacy Policy"
                aria-describedby="terms-error"
              />
              <div className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center ${
                fieldErrors.terms
                  ? 'border-red-500/60 bg-red-500/8'
                  : agreedToTerms
                    ? 'bg-accent border-accent'
                    : 'bg-bg-3 border-line group-hover:border-accent/50'
              }`}>
                {agreedToTerms && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
            <span className="font-inter text-[13px] text-neutral-2 leading-snug group-hover:text-ink-2 transition-colors duration-150">
              I agree to the{' '}
              <button type="button" className="text-accent hover:text-accent-2 transition-colors duration-150 bg-transparent border-0 p-0 cursor-pointer font-medium">
                Terms of Service
              </button>
              {' '}and{' '}
              <button type="button" className="text-accent hover:text-accent-2 transition-colors duration-150 bg-transparent border-0 p-0 cursor-pointer font-medium">
                Privacy Policy
              </button>
            </span>
          </label>
          <span id="terms-error" aria-live="polite" className="flex items-center gap-1.5 font-inter text-[12px] text-red-400 ml-6 min-h-[18px]">
            {fieldErrors.terms && <><AlertIcon /> {fieldErrors.terms}</>}
          </span>
        </div>

        <button
          type="submit"
          aria-label={t('auth.createAccountButton')}
          disabled={submitted}
          className="mt-1 w-full inline-flex items-center justify-center gap-2 px-[18px] py-[13px] rounded-xl bg-accent text-white font-inter text-[13.5px] font-semibold tracking-[.08em] uppercase transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitted ? t('auth.creatingAccount') : t('auth.createAccountButton')}
          {!submitted && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-neutral">
          <ShieldIcon />
          <span className="font-inter text-[12px] text-neutral">{t('auth.secured')}</span>
        </div>

        <div className="border-t border-line pt-4 text-center">
          <span className="font-inter text-[13.5px] text-neutral-2">
            {t('auth.alreadyHaveAccount')}{' '}
            <a
              href="/login"
              onClick={(e) => { e.preventDefault(); navigate('/login') }}
              className="text-accent hover:text-accent-2 transition-colors duration-200 no-underline font-medium"
            >
              {t('auth.login')}
            </a>
          </span>
        </div>
      </form>
    </div>
  )
}

export default function Register() {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <TopNav />
      <main className="flex-1 flex flex-col">
        <section className="flex-1 grid md:grid-cols-2 min-h-[calc(100vh-56px)] mt-14">
          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/60 via-bg/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
            <div className="absolute bottom-12 left-10 right-10 animate-fadeUp" style={{ '--delay': '0ms' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-line rounded-full bg-bg/60 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_0_3px_rgba(74,222,128,.2)]" />
                <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">{t('auth.systemOnline')}</span>
              </div>
              <h1 className="font-fraunces text-4xl md:text-5xl font-light text-ink leading-tight">
                {t('auth.registerTitle')}
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-center px-6 md:px-12 py-12 bg-bg">
            <div className="w-full max-w-md">
              <div className="md:hidden mb-8 animate-fadeUp" style={{ '--delay': '0ms' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-line rounded-full bg-ink/[.06] mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">{t('auth.systemOnline')}</span>
                </div>
                <p aria-hidden="true" className="font-fraunces text-3xl font-light text-ink">{t('auth.registerTitle')}</p>
              </div>
              <RegistrationForm />
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
