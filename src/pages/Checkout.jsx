import { useState, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { createBooking, createPaymentSession, confirmPayment, confirmUsagePayment } from '../lib/flexispaceApi'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'

// ── Validation helpers ────────────────────────────────────────────────────────

const TEST_CARDS = new Set(['4242424242424242', '5555555555554444', '4000056655665556'])

function luhnCheck(digits) {
  let sum = 0
  let isEven = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10)
    if (isEven) { d *= 2; if (d > 9) d -= 9 }
    sum += d
    isEven = !isEven
  }
  return sum % 10 === 0
}

function validateCardName(name) {
  if (!name.trim() || name.trim().length < 2) return 'checkout.validation.nameRequired'
  return ''
}

function validateCardNumber(raw) {
  const digits = raw.replace(/\s/g, '')
  if (digits.length !== 16 || !luhnCheck(digits)) return 'checkout.validation.cardInvalid'
  if (!TEST_CARDS.has(digits)) return 'checkout.validation.cardTestOnly'
  return ''
}

function validateExpiry(value) {
  if (!/^\d{2}\/\d{2}$/.test(value)) return 'checkout.validation.expiryFormat'
  const [mm, yy] = value.split('/')
  const month = parseInt(mm, 10)
  if (month < 1 || month > 12) return 'checkout.validation.expiryFormat'
  const now = new Date()
  const expYear = 2000 + parseInt(yy, 10)
  const curYear = now.getFullYear()
  const curMonth = now.getMonth() + 1
  if (expYear < curYear || (expYear === curYear && month < curMonth)) {
    return 'checkout.validation.cardExpired'
  }
  return ''
}

function validateCvv(value) {
  if (value.length < 3 || value.length > 4) return 'checkout.validation.cvvInvalid'
  return ''
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CreditCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.3" />
      <rect x="3.5" y="9.5" width="3" height="1" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 14.5c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 1v2M9 1v2M1 5.5h11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6.5 3.5v3l2 1.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}

function ShieldSmallIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1.5L2 4v3c0 3 2 4.8 4.5 5.5C9 12 11 10 11 7V4L6.5 1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M1 7.5s2.3-4.5 6.5-4.5 6.5 4.5 6.5 4.5-2.3 4.5-6.5 4.5S1 7.5 1 7.5Z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 2l11 11M6 6.2A1.8 1.8 0 0 0 8.8 9M3.8 3.9C2.3 5 1 7.5 1 7.5s2.3 4.5 6.5 4.5c1.4 0 2.6-.4 3.6-1M6.5 3.1C7 3 7.2 3 7.5 3c4.2 0 6.5 4.5 6.5 4.5s-.6 1.1-1.6 2.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="animate-spin motion-reduce:animate-none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Input formatters ───────────────────────────────────────────────────────────

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
  return digits
}

// ── PaymentForm ───────────────────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="font-inter text-[11.5px] text-critical mt-1 leading-tight">
      {message}
    </p>
  )
}

function PaymentForm({ form, setForm, errors, touched, onBlur }) {
  const { t } = useI18n()
  const [showCvv, setShowCvv] = useState(false)

  const handleChange = (e) => {
    let { name, value } = e.target
    if (name === 'cardNumber') value = formatCardNumber(value)
    if (name === 'expiry')     value = formatExpiry(value)
    if (name === 'cvv')        value = value.replace(/\D/g, '').slice(0, 4)
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const inputBase = "w-full bg-transparent border-0 outline-none py-3.5 text-ink font-mono text-[13.5px] placeholder:text-neutral-2 placeholder:uppercase"

  const wrapperClass = (field) => {
    const hasErr = touched[field] && errors[field]
    return `relative bg-bg-3 border rounded-xl transition-all duration-200 ${
      hasErr
        ? 'border-critical/50 focus-within:border-critical focus-within:ring-[3px] focus-within:ring-critical/[.14]'
        : 'border-line focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14]'
    }`
  }

  return (
    <div className="bg-bg-2 border border-line rounded-2xl shadow-card p-8 animate-fadeUp" style={{ '--delay': '0ms' }}>
      <h2 className="font-mono text-[15px] uppercase tracking-[.14em] text-accent font-medium mb-1">{t('checkout.paymentMethod')}</h2>
      <p className="font-inter text-[13.5px] text-neutral-2 mb-4">{t('checkout.paymentCopy')}</p>

      {/* Demo mode hint */}
      <div className="rounded-xl border border-accent/25 bg-accent/[.06] px-4 py-3 mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[.13em] text-accent font-semibold mb-0.5">{t('checkout.validation.demoMode')}</p>
        <p className="font-mono text-[11.5px] text-neutral-2 leading-relaxed tracking-wide">{t('checkout.validation.demoCards')}</p>
      </div>

      <div className="border-t border-line mb-6" />

      <div className="flex flex-col gap-5">
        {/* Cardholder Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cardName" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
            {t('checkout.cardholder')}
          </label>
          <div className={wrapperClass('cardName')}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
              <PersonIcon />
            </span>
            <input
              id="cardName"
              name="cardName"
              type="text"
              autoComplete="cc-name"
              placeholder="John Doe"
              value={form.cardName}
              onChange={handleChange}
              onBlur={() => onBlur('cardName')}
              aria-label={t('checkout.cardholder')}
              aria-invalid={touched.cardName && !!errors.cardName}
              className={`${inputBase} pl-11 pr-4`}
            />
          </div>
          <FieldError message={touched.cardName && errors.cardName ? t(errors.cardName) : ''} />
        </div>

        {/* Card Number */}
        <div className="flex flex-col gap-2">
          <label htmlFor="cardNumber" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
            {t('checkout.cardNumber')}
          </label>
          <div className={wrapperClass('cardNumber')}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
              <CreditCardIcon />
            </span>
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              dir="ltr"
              value={form.cardNumber}
              onChange={handleChange}
              onBlur={() => onBlur('cardNumber')}
              aria-label={t('checkout.cardNumber')}
              aria-invalid={touched.cardNumber && !!errors.cardNumber}
              className={`${inputBase} pl-11 pr-16`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
              <div className="w-5 h-5 rounded-full bg-accent opacity-80" />
              <div className="w-5 h-5 rounded-full bg-yellow-400 opacity-60 -ml-2" />
            </div>
          </div>
          <FieldError message={touched.cardNumber && errors.cardNumber ? t(errors.cardNumber) : ''} />
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="expiry" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
              {t('checkout.expiry')}
            </label>
            <div className={wrapperClass('expiry')}>
              <input
                id="expiry"
                name="expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                dir="ltr"
                value={form.expiry}
                onChange={handleChange}
                onBlur={() => onBlur('expiry')}
                aria-label={t('checkout.expiry')}
                aria-invalid={touched.expiry && !!errors.expiry}
                className={`${inputBase} px-4 text-center`}
              />
            </div>
            <FieldError message={touched.expiry && errors.expiry ? t(errors.expiry) : ''} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="cvv" className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">
              CVV
            </label>
            <div className={wrapperClass('cvv')}>
              <input
                id="cvv"
                name="cvv"
                type={showCvv ? 'text' : 'password'}
                autoComplete="cc-csc"
                placeholder="···"
                dir="ltr"
                value={form.cvv}
                onChange={handleChange}
                onBlur={() => onBlur('cvv')}
                aria-label="CVV"
                aria-invalid={touched.cvv && !!errors.cvv}
                className={`${inputBase} pl-4 pr-10 text-center`}
              />
              <button
                type="button"
                aria-label={showCvv ? t('checkout.hideCvv') : t('checkout.showCvv')}
                onClick={() => setShowCvv(!showCvv)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral hover:text-ink-2 transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0"
              >
                <EyeIcon open={showCvv} />
              </button>
            </div>
            <FieldError message={touched.cvv && errors.cvv ? t(errors.cvv) : ''} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── UsageFeePanel ─────────────────────────────────────────────────────────────

function UsageFeePanel({ onPay, paying, error, amountCents, currency, sessionMinutes, sessionKwh, electricityFeeCents, ventilationFeeCents, isFormValid }) {
  const { t } = useI18n()
  return (
    <div className="bg-bg-2 border border-accent/40 rounded-2xl p-7 flex flex-col gap-6 animate-fadeUp" style={{ '--delay': '80ms' }}>
      <div>
        <h2 className="font-mono text-[15px] uppercase tracking-[.14em] text-accent font-medium">{t('checkout.finalCharges')}</h2>
        <p className="font-inter text-[13.5px] text-neutral-2 mt-1">{t('checkout.usageCopy')}</p>
      </div>

      <div className="flex flex-col gap-3">
        {sessionMinutes != null && (
          <div className="flex items-center justify-between">
            <span className="font-inter text-[13.5px] text-neutral-2">{t('checkout.sessionDuration')}</span>
            <span className="font-mono text-[13.5px] text-ink-2">{sessionMinutes} min</span>
          </div>
        )}
        {sessionKwh != null && (
          <div className="flex items-center justify-between">
            <span className="font-inter text-[13.5px] text-neutral-2">{t('checkout.electricityUsed')}</span>
            <span className="font-mono text-[13.5px] text-ink-2">{sessionKwh} kWh</span>
          </div>
        )}
        {electricityFeeCents != null && (
          <div className="flex items-center justify-between">
            <span className="font-inter text-[13.5px] text-neutral-2">{t('checkout.electricityFee')}</span>
            <span className="font-mono text-[13.5px] text-ink-2">{formatCents(electricityFeeCents, currency)}</span>
          </div>
        )}
        {ventilationFeeCents != null && (
          <div className="flex items-center justify-between">
            <span className="font-inter text-[13.5px] text-neutral-2">{t('checkout.environmentalService')}</span>
            <span className="font-mono text-[13.5px] text-ink-2">{formatCents(ventilationFeeCents, currency)}</span>
          </div>
        )}
        <div className="border-t border-line pt-3 flex items-center justify-between mt-1">
          <span className="font-inter text-[15px] font-medium text-ink">{t('checkout.totalDue')}</span>
          <span className="font-mono text-[22px] font-semibold text-accent tracking-[.02em]">
            {amountCents != null ? formatCents(amountCents, currency) : '—'}
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-critical/25 bg-critical/[.1] px-4 py-3">
          <p className="font-inter text-[13px] leading-relaxed text-critical">{error}</p>
        </div>
      )}

      <button
        type="button"
        aria-label={t('checkout.confirmPay')}
        onClick={onPay}
        disabled={paying || !isFormValid}
        className="w-full inline-flex items-center justify-center gap-3 px-[18px] py-[15px] rounded-xl bg-accent text-white font-inter text-[13.5px] font-semibold transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paying ? (
          <>
            <SpinnerIcon />
            {t('checkout.processingPayment')}
          </>
        ) : (
          <>
            <LockIcon />
            {t('checkout.confirmPay')}
          </>
        )}
      </button>
    </div>
  )
}

// ── IoTFeeRow ─────────────────────────────────────────────────────────────────

function IoTFeeRow() {
  const { t } = useI18n()
  const [tooltip, setTooltip] = useState(false)
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="font-inter text-[13.5px] text-neutral-2">{t('checkout.iotFee')}</span>
        <div className="relative">
          <button
            type="button"
            aria-label={t('checkout.iotFee')}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
            onFocus={() => setTooltip(true)}
            onBlur={() => setTooltip(false)}
            className="w-[15px] h-[15px] rounded-full border border-neutral/40 text-neutral font-mono text-[9px] flex items-center justify-center hover:border-accent/60 hover:text-accent transition-colors duration-150 cursor-default bg-transparent"
          >
            ?
          </button>
          {tooltip && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[22px] w-60 bg-bg-3 border border-line rounded-xl px-3.5 py-3 shadow-card z-20 pointer-events-none">
              <p className="font-inter text-[12px] text-neutral-2 leading-relaxed">
                {t('checkout.iotFeeTooltip')}
              </p>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-2.5 h-2.5 bg-bg-3 border-r border-b border-line rotate-45" />
            </div>
          )}
        </div>
      </div>
      <span className="font-mono text-[13.5px] text-ink-2">$5.00</span>
    </div>
  )
}

// ── OrderSummary ──────────────────────────────────────────────────────────────

const FALLBACK_WORKSPACE = {
  name: 'Alpha Sector Desk 42',
  image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
}

function formatScheduleDate(value) {
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatScheduleTime(start, end) {
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false }
  return `${start.toLocaleTimeString(undefined, opts)} - ${end.toLocaleTimeString(undefined, opts)}`
}

function formatCents(cents, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
  } catch {
    return `${(cents / 100).toFixed(2)}`
  }
}

function OrderSummary({ onPay, paying, workspace, schedule, error, isPaymentMode, amountCents, currency, isFormValid }) {
  const { t } = useI18n()
  const ws = workspace ?? FALLBACK_WORKSPACE
  return (
    <div className="bg-bg-2 border border-accent/40 rounded-2xl p-7 flex flex-col gap-6 animate-fadeUp" style={{ '--delay': '80ms' }}>
      <h2 className="font-mono text-[15px] uppercase tracking-[.14em] text-accent font-medium">{t('checkout.orderSummary')}</h2>

      <div className="bg-bg-3 border border-line rounded-xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-line">
          <img
            src={ws.image}
            alt={ws.name}
            className="w-full h-full object-cover opacity-70"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-inter text-[14px] font-semibold text-ink">{ws.name}</span>
          <div className="flex items-center gap-1.5 text-ink-2">
            <CalendarIcon />
            <span className="font-mono text-[12.5px] text-ink-2">{formatScheduleDate(schedule.start)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ink-2">
            <ClockIcon />
            <span className="font-mono text-[12.5px] text-ink-2">{formatScheduleTime(schedule.start, schedule.end)}</span>
          </div>
        </div>
      </div>

      {isPaymentMode ? (
        <div className="flex flex-col gap-3">
          <div className="border-t border-line pt-3 flex items-center justify-between">
            <span className="font-inter text-[15px] font-medium text-ink">{t('checkout.totalDue')}</span>
            <span className="font-mono text-[22px] font-semibold text-accent tracking-[.02em]">
              {amountCents ? formatCents(amountCents, currency) : '—'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-inter text-[13.5px] text-neutral-2">{t('checkout.hourlyRate')}</span>
            <span className="font-mono text-[13.5px] text-ink-2">{ws.price || '—'}</span>
          </div>
          <div className="border-t border-line pt-3 flex items-center justify-between mt-1">
            <span className="font-inter text-[15px] font-medium text-ink">{t('checkout.total')}</span>
            <span className="font-mono text-[16px] font-semibold text-neutral-2 tracking-[.02em]">
              {t('checkout.calculatedOnApproval')}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-critical/25 bg-critical/[.1] px-4 py-3">
          <p className="font-inter text-[13px] leading-relaxed text-critical">{error}</p>
        </div>
      )}

      <button
        type="button"
        aria-label={isPaymentMode ? t('checkout.confirmPay') : t('checkout.submitRequest')}
        onClick={onPay}
        disabled={paying || !isFormValid}
        className="w-full inline-flex items-center justify-center gap-3 px-[18px] py-[15px] rounded-xl bg-accent text-white font-inter text-[13.5px] font-semibold transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paying ? (
          <>
            <SpinnerIcon />
            {isPaymentMode ? t('checkout.processingPayment') : t('checkout.submittingRequest')}
          </>
        ) : (
          <>
            <LockIcon />
            {isPaymentMode ? t('checkout.confirmPay') : t('checkout.submitRequest')}
          </>
        )}
      </button>
    </div>
  )
}

// ── Checkout page ─────────────────────────────────────────────────────────────

export default function Checkout() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const location = useLocation()
  const workspace = location.state?.workspace ?? null

  // Usage fee payment mode: navigated from MyBookings after check-out
  const usagePaymentMode = Boolean(location.state?.usagePaymentMode)
  const usageBookingId = location.state?.bookingId ?? null
  const usageAmountCents = location.state?.amountCents ?? null
  const usageCurrency = location.state?.currency ?? 'USD'
  const sessionMinutes = location.state?.sessionMinutes ?? null
  const sessionKwh = location.state?.sessionKwh ?? null
  const electricityFeeCents = location.state?.electricityFeeCents ?? null
  const ventilationFeeCents = location.state?.ventilationFeeCents ?? null

  // Base payment mode: navigated from MyBookings with a PAYMENT_PENDING booking
  const pendingBookingId = location.state?.pendingBookingId ?? null
  const pendingAmountCents = location.state?.amountCents ?? null
  const pendingCurrency = location.state?.currency ?? 'USD'
  const pendingStartTime = location.state?.startTime ? new Date(location.state.startTime) : null
  const pendingEndTime = location.state?.endTime ? new Date(location.state.endTime) : null
  const isPaymentMode = Boolean(pendingBookingId)

  const [paying, setPaying] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' })
  const [touched, setTouched] = useState({ cardName: false, cardNumber: false, expiry: false, cvv: false })

  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })
  const [bookingStartTime, setBookingStartTime] = useState('09:00')
  const [bookingDuration, setBookingDuration] = useState(2)

  const schedule = useMemo(() => {
    if (pendingStartTime && pendingEndTime) {
      return { start: pendingStartTime, end: pendingEndTime }
    }
    const start = new Date(`${bookingDate}T${bookingStartTime}:00`)
    const end = new Date(start.getTime() + bookingDuration * 3600 * 1000)
    return { start, end }
  }, [bookingDate, bookingStartTime, bookingDuration, pendingStartTime, pendingEndTime])

  const errors = useMemo(() => ({
    cardName: validateCardName(form.cardName),
    cardNumber: validateCardNumber(form.cardNumber),
    expiry: validateExpiry(form.expiry),
    cvv: validateCvv(form.cvv),
  }), [form])

  const isFormValid = useMemo(() => (
    !errors.cardName && !errors.cardNumber && !errors.expiry && !errors.cvv
  ), [errors])

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }))

  const handlePay = async () => {
    if (!isFormValid) {
      setTouched({ cardName: true, cardNumber: true, expiry: true, cvv: true })
      return
    }

    setSubmitError('')
    setPaying(true)

    try {
      if (usagePaymentMode) {
        await confirmUsagePayment({ bookingId: usageBookingId, simulateSuccess: true })
        navigate('/bookings', { state: { usagePaymentConfirmed: true } })
      } else if (isPaymentMode) {
        await createPaymentSession({ bookingId: pendingBookingId })
        const result = await confirmPayment({
          bookingId: pendingBookingId,
          simulateSuccess: true,
        })
        navigate('/bookings', {
          state: {
            paymentConfirmed: true,
            bookingId: pendingBookingId,
            status: result.data?.booking_status,
          },
        })
      } else {
        if (!workspace?.id || typeof workspace.id !== 'string') {
          setSubmitError(t('checkout.errors.chooseLiveWorkspace'))
          setPaying(false)
          return
        }
        if (schedule.start < new Date()) {
          setSubmitError(t('checkout.errors.bookingMustBeFuture'))
          setPaying(false)
          return
        }
        const result = await createBooking({
          officeId: workspace.id,
          startTime: schedule.start.toISOString(),
          endTime: schedule.end.toISOString(),
          idempotencyKey: globalThis.crypto?.randomUUID?.(),
        })
        navigate('/bookings', {
          state: {
            bookingCreated: true,
            bookingId: result.data?.booking_id,
            status: result.data?.status,
          },
        })
      }
    } catch (error) {
      setSubmitError(error.message || t('checkout.errors.unableToComplete'))
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div dir="ltr" className="px-6 md:px-16 pt-10 pb-6 flex items-start justify-between">
        <div>
          <Link
            to="/"
            className="no-underline flex items-center"
            aria-label="FlexiSpace home"
          >
            <BrandLogo variant="mono" iconSize={20} />
          </Link>
          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2 mt-1.5 block">
            {usagePaymentMode ? t('checkout.usageFeePayment') : isPaymentMode ? t('checkout.completePayment') : t('checkout.secureCheckout')}
          </span>
        </div>

        <LanguageSwitcher compact />

        <button
          type="button"
          aria-label={t('common.back')}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 mt-1 rounded-lg bg-bg-2 border border-line font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2 hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer"
        >
          <span style={{ transform: direction === 'rtl' ? 'scaleX(-1)' : undefined, display: 'inline-flex' }}>
            <ArrowLeftIcon />
          </span>
          {t('common.back')}
        </button>
      </div>

      <main className="flex-1 px-6 md:px-16 pb-12">
        <div className="grid md:grid-cols-[1fr_420px] gap-6 max-w-5xl">
          <div className="flex flex-col gap-4">
            {!isPaymentMode && !usagePaymentMode && (
              <div className="bg-bg-2 border border-line rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="font-inter text-[13px] font-semibold text-ink">{t('checkout.bookingSchedule')}</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('checkout.date')}</label>
                  <input
                    type="date"
                    dir="ltr"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-bg-3 border border-line rounded-xl px-4 py-3 font-inter text-[13.5px] text-ink focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/[.14] transition-all duration-200"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('checkout.startTime')}</label>
                    <input
                      type="time"
                      dir="ltr"
                      value={bookingStartTime}
                      onChange={(e) => setBookingStartTime(e.target.value)}
                      className="w-full bg-bg-3 border border-line rounded-xl px-4 py-3 font-inter text-[13.5px] text-ink focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/[.14] transition-all duration-200"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('checkout.duration')}</label>
                    <select
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(Number(e.target.value))}
                      className="w-full bg-bg-3 border border-line rounded-xl px-4 py-3 font-inter text-[13.5px] text-ink focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/[.14] transition-all duration-200"
                    >
                      <option value={1}>{t('checkout.durationOptions.1')}</option>
                      <option value={2}>{t('checkout.durationOptions.2')}</option>
                      <option value={4}>{t('checkout.durationOptions.4')}</option>
                      <option value={8}>{t('checkout.durationOptions.8')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            <PaymentForm
              form={form}
              setForm={setForm}
              errors={errors}
              touched={touched}
              onBlur={handleBlur}
            />
          </div>
          {usagePaymentMode ? (
            <UsageFeePanel
              onPay={handlePay}
              paying={paying}
              error={submitError}
              amountCents={usageAmountCents}
              currency={usageCurrency}
              sessionMinutes={sessionMinutes}
              sessionKwh={sessionKwh}
              electricityFeeCents={electricityFeeCents}
              ventilationFeeCents={ventilationFeeCents}
              isFormValid={isFormValid}
            />
          ) : (
            <OrderSummary
              onPay={handlePay}
              paying={paying}
              workspace={workspace}
              schedule={schedule}
              error={submitError}
              isPaymentMode={isPaymentMode}
              amountCents={pendingAmountCents}
              currency={pendingCurrency}
              isFormValid={isFormValid}
            />
          )}
        </div>

        <div className="max-w-5xl mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4 text-neutral">
            <div className="flex items-center gap-1.5">
              <ShieldSmallIcon />
              <span className="font-mono text-[11px] uppercase tracking-[.14em]">PCI-DSS</span>
            </div>
            <span className="text-neutral/40 font-mono text-[11px]">|</span>
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon />
              <span className="font-mono text-[11px] uppercase tracking-[.14em]">SSL 256-Bit</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-neutral">
            <ShieldSmallIcon />
            <span className="font-inter text-[13px]">{t('checkout.secureGuard')}</span>
          </div>
        </div>
      </main>
    </div>
  )
}