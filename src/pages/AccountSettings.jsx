import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import { useI18n } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'

// ─── Icons ────────────────────────────────────────────────────────────────────

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 14.5c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.5 8h6M12.5 8v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="1.5" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="3.5" y="7.5" width="7" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L2 5v4c0 3.5 2.5 5.8 6 7 3.5-1.2 6-3.5 6-7V5L8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.2" />
      <rect x="3.5" y="9.5" width="3" height="1" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2a4.5 4.5 0 0 0-4.5 4.5v2.5L2 11.5h12L12.5 9V6.5A4.5 4.5 0 0 0 8 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M6.5 12.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3v10M6 7l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 15h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 7v5M10 7v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 4l.9 9.1a1 1 0 0 0 1 .9h6.2a1 1 0 0 0 1-.9L13 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LaptopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M0 13h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 12.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v7M4 6.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function NetworkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="2.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="13.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 8h2M10 8h2M8 4v2M8 10v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v2M11 1.5v2M1.5 7h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 2a4 4 0 0 0-3.8 5.2L2 11.5l.5 2 2 .5 4.3-4.2A4 4 0 1 0 10 2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="10.5" cy="5.5" r="1" fill="currentColor" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 13l1.5-1H15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 7h7M4.5 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}


// ─── Utilities ────────────────────────────────────────────────────────────────

function getPasswordStrength(pwd) {
  if (!pwd) return null
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { labelKey: 'settings.weak',   bar: 'w-1/4', barColor: 'bg-red-500',    text: 'text-red-400' }
  if (score === 2) return { labelKey: 'settings.fair',   bar: 'w-2/4', barColor: 'bg-orange-400', text: 'text-orange-400' }
  if (score === 3) return { labelKey: 'settings.good',   bar: 'w-3/4', barColor: 'bg-yellow-400', text: 'text-yellow-400' }
  return              { labelKey: 'settings.strong', bar: 'w-full', barColor: 'bg-accent',     text: 'text-accent' }
}

// ─── Shared components ────────────────────────────────────────────────────────

function Toggle({ on, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${on ? 'bg-accent' : 'bg-muted'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

function FieldInput({ label, id, icon, type = 'text', placeholder, value, onChange, name, badge }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id || name} className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">
          {label}
        </label>
        {badge}
      </div>
      <div className="relative bg-bg-3 border border-line rounded-xl focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id || name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={label}
          className={`w-full bg-transparent border-0 outline-none ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 text-ink font-inter text-[15px] placeholder:text-neutral-2`}
        />
      </div>
    </div>
  )
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`bg-bg-2 border border-line rounded-2xl shadow-card p-8 ${className}`}>
      {children}
    </div>
  )
}

function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-6">
      <span className="text-accent">{icon}</span>
      <h2 className="font-mono text-[11px] uppercase tracking-[.14em] text-accent font-medium">{title}</h2>
    </div>
  )
}

// ─── Initial state (for dirty detection) ─────────────────────────────────────

const INITIAL_FORM = {
  fullName: 'Elias Vance',
  email: 'elias.vance@infrastructure.net',
  phone: '',
  countryCode: '+1',
  currentPassword: '',
  newPassword: '',
}

const INITIAL_TOGGLES = {
  twoFA: false,
  iotAlerts: true,
  bookingConfirm: true,
  maintenance: false,
  smsDelivery: false,
}

const INVOICES = [
  { date: 'May 01, 2026', amount: '$150.00', id: 'INV-2026-05' },
  { date: 'Apr 01, 2026', amount: '$150.00', id: 'INV-2026-04' },
  { date: 'Mar 01, 2026', amount: '$150.00', id: 'INV-2026-03' },
]

// ─── Account & Security tab ───────────────────────────────────────────────────

function ProfileCard({ form, onChange, avatar, setAvatar, fileRef, t }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) setAvatar(URL.createObjectURL(file))
    setDragOver(false)
  }

  return (
    <SectionCard>
      <SectionHeading icon={<PersonIcon />} title={t('settings.profileInfo')} />

      {/* Role badge */}
      <div className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-1.5">
          {t('settings.jwtRole')}
        </p>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-accent/25 bg-accent/[.07]">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-accent">{t('settings.ownerAdmin')}</span>
        </div>
      </div>

      {/* Drag-drop avatar */}
      <div className="mb-8 pb-8 border-b border-line">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-3">{t('settings.profilePicture')}</p>
        <div className="grid md:grid-cols-[auto_1fr] gap-5 items-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent/30 bg-bg-3 shrink-0">
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <img
                src="https://api.dicebear.com/7.x/adventurer/svg?seed=EliasVance&backgroundColor=1F211D"
                alt={t('settings.defaultAvatar')}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setAvatar(URL.createObjectURL(file))
          }} />
          <div
            role="button"
            tabIndex={0}
            aria-label={t('settings.clickToUpload')}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click() } }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-accent/50 bg-accent/[.03]'
                : 'border-line hover:border-accent/40 hover:bg-accent/[.02]'
            }`}
          >
            <span className="text-neutral-2"><UploadIcon /></span>
            <p className="font-inter text-[13px] text-neutral-2 text-center">
              <span className="text-accent font-medium">{t('settings.clickToUpload')}</span> {t('settings.orDragDrop')}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">
              {t('settings.uploadHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <FieldInput
          label={t('settings.fullNameLabel')}
          name="fullName"
          icon={<PersonIcon />}
          placeholder="Elias Vance"
          value={form.fullName}
          onChange={onChange}
        />
        <FieldInput
          label={t('settings.emailAddress')}
          name="email"
          type="email"
          icon={<MailIcon />}
          placeholder="email@domain.com"
          value={form.email}
          onChange={onChange}
          badge={
            <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-accent/25 bg-accent/[.07] font-mono text-[11px] text-accent">
              {t('settings.verified')}
            </span>
          }
        />
      </div>

      {/* Phone with country code */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('settings.phoneNumber')}</label>
        <div className="flex bg-bg-3 border border-line rounded-xl focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200 overflow-hidden">
          <select
            name="countryCode"
            value={form.countryCode}
            onChange={onChange}
            aria-label="Country code"
            className="bg-bg-3 border-0 border-r border-line px-3 text-neutral-2 font-mono text-[13px] outline-none cursor-pointer py-3.5 shrink-0"
          >
            {['+1','+44','+90','+966','+971','+20'].map((c) => (
              <option key={c} value={c} className="bg-bg-3">{c}</option>
            ))}
          </select>
          <input
            name="phone"
            type="tel"
            placeholder="e.g. 555 0192"
            value={form.phone}
            onChange={onChange}
            aria-label="Phone number"
            className="flex-1 bg-transparent border-0 outline-none px-4 py-3.5 text-ink font-inter text-[15px] placeholder:text-neutral-2"
          />
        </div>
      </div>
    </SectionCard>
  )
}

function SecurityCard({ form, onChange, toggles, setToggles, t }) {
  const strength = getPasswordStrength(form.newPassword)

  return (
    <SectionCard>
      <SectionHeading icon={<ShieldIcon />} title={t('settings.security')} />

      {/* Password fields */}
      <div className="grid md:grid-cols-2 gap-5">
        <FieldInput
          label={t('settings.currentPassword')}
          name="currentPassword"
          type="password"
          icon={<LockIcon />}
          placeholder="••••••••"
          value={form.currentPassword}
          onChange={onChange}
        />
        <div className="flex flex-col gap-1.5">
          <FieldInput
            label={t('settings.newPassword')}
            name="newPassword"
            type="password"
            icon={<KeyIcon />}
            placeholder={t('settings.enterNewPassword')}
            value={form.newPassword}
            onChange={onChange}
          />
          {form.newPassword && strength && (
            <div className="flex items-center gap-2.5 mt-0.5">
              <div className="flex-1 h-1 rounded-full bg-line overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.bar} ${strength.barColor}`} />
              </div>
              <span className={`font-mono text-[11px] uppercase tracking-[.14em] font-medium ${strength.text}`}>
                {t(strength.labelKey)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2FA toggle */}
      <div className="mt-8 pt-6 border-t border-line">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-accent mt-0.5"><ShieldIcon /></span>
            <div>
              <p className="font-inter text-[14px] font-medium text-ink mb-0.5">{t('settings.twoFactor')}</p>
              <p className="font-inter text-[13px] text-neutral-2 leading-snug max-w-sm">
                {t('settings.twoFactorDescFull')}
              </p>
            </div>
          </div>
          <Toggle
            on={toggles.twoFA}
            onChange={(v) => setToggles((p) => ({ ...p, twoFA: v }))}
            ariaLabel={t('settings.twoFactor')}
          />
        </div>
      </div>

      {/* Active Sessions */}
      <div className="mt-8 pt-6 border-t border-line">
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-4">{t('settings.activeSessions')}</p>
        <div className="flex flex-col divide-y divide-line">
          {[
            { icon: <LaptopIcon />, browser: 'Chrome', os: 'Windows 11', time: t('settings.activeNow'), pulse: true },
            { icon: <MobileIcon />, browser: 'Mobile Safari', os: 'iPhone', time: t('settings.activeNowTime'), pulse: false },
          ].map((s) => (
            <div key={s.browser + s.os} className="flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-neutral-2">{s.icon}</span>
                <div>
                  <p className="font-inter text-[13.5px] text-ink-2">{s.browser} · {s.os}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.pulse ? 'bg-accent animate-pulse' : 'bg-neutral'}`} />
                    <span className="font-mono text-[11px] text-neutral">{s.time}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="font-mono text-[11px] uppercase tracking-[.14em] text-red-400 border border-red-500/20 rounded-lg px-3 py-1.5 hover:bg-red-500/10 transition-all duration-150 cursor-pointer bg-transparent"
              >
                {t('settings.revoke')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

function DangerZoneCard({ t }) {
  return (
    <div className="bg-bg-2 border border-red-500/20 border-l-2 border-l-red-500/40 rounded-2xl shadow-card p-8">
      <SectionHeading icon={<TrashIcon />} title={t('settings.dangerZone')} />
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-3">
          <span className="text-red-400 mt-0.5 shrink-0"><TrashIcon /></span>
          <div>
            <p className="font-inter text-[14px] font-medium text-red-400 mb-1">{t('settings.deleteAccount')}</p>
            <p className="font-inter text-[13px] text-neutral-2 leading-relaxed max-w-sm">
              {t('settings.deleteAccountDesc')}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 border border-red-500/30 text-red-400 font-mono text-[11px] uppercase tracking-[.14em] px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-150 bg-transparent cursor-pointer whitespace-nowrap"
        >
          {t('settings.deleteAccount')}
        </button>
      </div>
    </div>
  )
}

// ─── Billing tab ──────────────────────────────────────────────────────────────

function BillingCard({ t }) {
  return (
    <SectionCard>
      <SectionHeading icon={<CreditCardIcon />} title={t('settings.billing')} />

      {/* Current plan */}
      <div className="flex items-center justify-between mb-6 pb-6 border-b border-line">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-accent/25 bg-accent/[.07] font-mono text-[11px] uppercase tracking-[.14em] text-accent">
              {t('settings.enterprise')}
            </span>
          </div>
          <p className="font-mono text-[12.5px] text-ink-2 mt-2">{t('settings.renewsOn')} Jun 1, 2026</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[22px] font-semibold text-ink tracking-[.02em]">$150<span className="text-[14px] text-neutral-2 font-normal">{t('settings.perMonth')}</span></p>
        </div>
      </div>

      {/* Payment method */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-line">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-2">{t('settings.paymentMethod')}</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              <div className="w-6 h-6 rounded-full bg-accent opacity-80" />
              <div className="w-6 h-6 rounded-full bg-yellow-400 opacity-60 -ml-2.5" />
            </div>
            <span className="font-mono text-[13.5px] text-ink-2">•••• •••• •••• 4242</span>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-line bg-transparent font-mono text-[11px] uppercase tracking-[.14em] text-ink-2 hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer"
        >
          {t('settings.updateCard')}
        </button>
      </div>

      {/* Invoice history */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-4">{t('settings.invoiceHistory')}</p>
        <div className="rounded-xl border border-line overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-line bg-bg-3">
            {[t('settings.date'), t('settings.amount'), t('settings.status'), ''].map((h) => (
              <span key={h} className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{h}</span>
            ))}
          </div>
          {INVOICES.map((inv, i) => (
            <div
              key={inv.id}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 ${i < INVOICES.length - 1 ? 'border-b border-line' : ''} hover:bg-bg-3/50 transition-colors duration-150`}
            >
              <span className="font-mono text-[12.5px] text-ink-2">{inv.date}</span>
              <span className="font-mono text-[12.5px] text-ink">{inv.amount}</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-accent/20 bg-accent/[.07] font-mono text-[11px] uppercase tracking-[.14em] text-accent">
                {t('settings.paid')}
              </span>
              <button
                type="button"
                aria-label={`Download ${inv.id}`}
                className="flex items-center gap-1.5 text-neutral-2 hover:text-accent transition-colors duration-150 cursor-pointer bg-transparent border-0 p-0"
              >
                <DownloadIcon />
                <span className="font-mono text-[11px] uppercase tracking-[.14em]">{t('settings.downloadPdf')}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Notifications tab ────────────────────────────────────────────────────────

function NotificationsCard({ toggles, setToggles, t }) {
  const notifRows = [
    { key: 'iotAlerts',      icon: <NetworkIcon />,  title: t('settings.iotAlerts'),            subtitle: t('settings.iotAlertsDesc') },
    { key: 'bookingConfirm', icon: <CalendarIcon />, title: t('settings.bookingConfirmations'), subtitle: t('settings.bookingConfDesc') },
    { key: 'maintenance',    icon: <WrenchIcon />,   title: t('settings.systemMaintenance'),    subtitle: t('settings.maintenanceDesc') },
    { key: 'smsDelivery',    icon: <MessageIcon />,  title: t('settings.smsDelivery'),          subtitle: t('settings.smsDesc') },
  ]

  return (
    <SectionCard>
      <SectionHeading icon={<BellIcon />} title={t('settings.notifications')} />
      <div className="flex flex-col divide-y divide-line">
        {notifRows.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-5">
            <div className="flex items-start gap-3">
              <span className="text-accent mt-0.5 shrink-0">{row.icon}</span>
              <div>
                <p className="font-inter text-[14px] font-medium text-ink mb-0.5">{row.title}</p>
                <p className="font-inter text-[13px] text-neutral-2">{row.subtitle}</p>
              </div>
            </div>
            <Toggle
              on={toggles[row.key]}
              onChange={(v) => setToggles((p) => ({ ...p, [row.key]: v }))}
              ariaLabel={row.title}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AccountSettings() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const sidebarNav = [
    { id: 'account',       label: t('settings.accountSecurity'), icons: [<PersonIcon />, <ShieldIcon />] },
    { id: 'billing',       label: t('settings.billing'),         icon: <CreditCardIcon /> },
    { id: 'notifications', label: t('settings.notifications'),   icon: <BellIcon /> },
  ]

  const [activeSection, setActiveSection] = useState('account')
  const [avatar, setAvatar]               = useState(null)
  const [form, setForm]                   = useState({ ...INITIAL_FORM })
  const [toggles, setToggles]             = useState({ ...INITIAL_TOGGLES })
  const [savedSnapshot, setSavedSnapshot] = useState({ form: { ...INITIAL_FORM }, toggles: { ...INITIAL_TOGGLES }, avatar: null })
  const [savedToast, setSavedToast]       = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(savedSnapshot.form) ||
    JSON.stringify(toggles) !== JSON.stringify(savedSnapshot.toggles) ||
    avatar !== savedSnapshot.avatar

  const handleSave = async () => {
    try {
      if (form.fullName) {
        await supabase
          .from('profiles')
          .update({ full_name: form.fullName.trim() })
          .eq('id', (await supabase.auth.getUser()).data.user.id)
      }
      if (form.email) {
        await supabase.auth.updateUser({ email: form.email.trim() })
      }
      setSavedSnapshot({ form: { ...form }, toggles: { ...toggles }, avatar })
      setSavedToast(true)
      setTimeout(() => setSavedToast(false), 2000)
    } catch {
      // silent — toast not shown on error
    }
  }
  const handleDiscard = () => {
    setForm({ ...INITIAL_FORM })
    setToggles({ ...INITIAL_TOGGLES })
    setAvatar(null)
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  useEffect(() => {
    const ids = ['account', 'billing', 'notifications']
    const observers = ids.map((id) => {
      const el = document.getElementById(`section-${id}`)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { rootMargin: '-20% 0px -60% 0px' }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((obs) => obs?.disconnect())
  }, [])

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {savedToast && t('settings.changesSaved')}
      </div>

      {savedToast && (
        <div className="fixed top-[72px] right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-bg-2 border border-accent/30 rounded-xl shadow-card-md animate-fadeUp pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="#10B981" strokeWidth="1.4" />
            <path d="M5 8.5l2 2 4-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-inter text-[13.5px] font-medium text-ink">{t('settings.changesSaved')}</span>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header dir="ltr" className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg border-b border-line flex items-center px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BrandLogo variant="colored" iconSize={28} />
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher compact />
          <button
            onClick={() => navigate('/find-workspace')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-bg-2 border border-line font-inter text-[13px] text-neutral-2 hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('settings.findWorkspace')}
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className={`flex pt-14 flex-1 px-6 md:px-10 py-10 gap-8 max-w-7xl mx-auto w-full transition-all duration-300 ${isDirty ? 'pb-24' : ''}`}>

        {/* Sidebar — sticky, scroll-to-section nav */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 gap-4 sticky top-20 self-start h-fit">
          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral px-3 mt-2">{t('settings.settingsSidebar')}</span>
          <nav className="flex flex-col gap-1" aria-label="Settings navigation">
            {sidebarNav.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={activeSection === item.id ? 'page' : undefined}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-inter text-[13.5px] border-l-2 transition-all duration-200 cursor-pointer bg-transparent text-left ${
                  activeSection === item.id
                    ? 'text-accent bg-accent/[.09] border-accent'
                    : 'text-neutral-2 border-transparent hover:bg-bg-3 hover:text-ink'
                }`}
              >
                <span className={`flex items-center gap-1 ${activeSection === item.id ? 'text-accent' : 'text-neutral'}`}>
                  {item.icons ?? item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content — single scrollable column of stacked cards */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Account & Security */}
          <section id="section-account" className="flex flex-col gap-6">
            <ProfileCard
              form={form}
              onChange={handleChange}
              avatar={avatar}
              setAvatar={setAvatar}
              fileRef={fileRef}
              t={t}
            />
            <SecurityCard
              form={form}
              onChange={handleChange}
              toggles={toggles}
              setToggles={setToggles}
              t={t}
            />
          </section>

          {/* Billing */}
          <section id="section-billing">
            <BillingCard t={t} />
          </section>

          {/* Notifications */}
          <section id="section-notifications">
            <NotificationsCard toggles={toggles} setToggles={setToggles} t={t} />
          </section>

          {/* Danger Zone — always at bottom */}
          <DangerZoneCard t={t} />
        </main>
      </div>

      {/* ── Sticky save bar ───────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-bg-2/95 backdrop-blur-md border-t border-line px-6 md:px-10 py-4 flex items-center justify-between transition-transform duration-300 ease-out ${
          isDirty ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <p className="font-inter text-[13px] text-neutral-2">{t('settings.unsavedChanges')}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDiscard}
            className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-xl border border-line text-ink-2 font-mono text-[11px] uppercase tracking-[.14em] hover:bg-ink/[.06] transition-all duration-200 cursor-pointer bg-transparent"
          >
            {t('settings.discard')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-xl bg-accent text-white font-mono text-[11px] uppercase tracking-[.14em] hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0"
          >
            <SaveIcon />
            {t('settings.saveChanges')}
          </button>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-line py-5 px-6 flex items-center justify-center">
        <p className="font-inter text-[12.5px] text-neutral">{t('settings.copyright')}</p>
      </footer>
    </div>
  )
}
