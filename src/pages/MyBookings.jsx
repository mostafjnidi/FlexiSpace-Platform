import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { cancelBooking, checkOutBooking } from '../lib/flexispaceApi'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavLabel } from '../components/navigation'

// ─── PIN utilities ────────────────────────────────────────────────────────────

function derivePIN(bookingId) {
  if (!bookingId) return '------'
  const hex = bookingId.replace(/-/g, '')
  const n = parseInt(hex.slice(-8), 16)
  return String(n % 1_000_000).padStart(6, '0')
}

function getPinStatus(rawStartTime, rawEndTime, rawStatus) {
  if (rawStatus === 'CHECKED_IN') return 'used'
  const now = Date.now()
  const start = rawStartTime ? new Date(rawStartTime).getTime() : null
  const end   = rawEndTime   ? new Date(rawEndTime).getTime()   : null
  if (!start || !end) return 'active'
  if (now < start) return 'scheduled'
  if (now >= end)   return 'expired'
  return 'active'
}

const PIN_STATUS_STYLE = {
  scheduled: { bg: 'bg-neutral/[.08]', border: 'border-line',         text: 'text-neutral-2', dot: 'bg-neutral/40'  },
  active:    { bg: 'bg-accent/[.08]',  border: 'border-accent/25',    text: 'text-accent',    dot: 'bg-accent'       },
  expired:   { bg: 'bg-neutral/[.08]', border: 'border-line',         text: 'text-neutral-2', dot: 'bg-neutral/40'  },
  used:      { bg: 'bg-accent/[.06]',  border: 'border-accent/20',    text: 'text-accent',    dot: 'bg-accent'       },
}

// ─── Sidebar Icons ────────────────────────────────────────────────────────────

function CompassNavIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 3.5v1M7 9.5v1M3.5 7h1M9.5 7h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function SidebarCalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v2M9 1.5v2M1.5 6h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function UserNavIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 12.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SupportNavIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 5.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.6" fill="currentColor" />
    </svg>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2a6 6 0 0 0-6 6v3.5L2.5 14h15L16 11.5V8a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1C4.567 1 3 2.567 3 4.5C3 7.5 6.5 12 6.5 12C6.5 12 10 7.5 10 4.5C10 2.567 8.433 1 6.5 1Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="6.5" cy="4.5" r="1.3" fill="currentColor" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="12" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 4V3M5.5 12v-1M9.5 4V3M9.5 12v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.5 7.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M12 7a5 5 0 1 1-1-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 1v3h-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 7a9 9 0 0 1 14 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 10a5 5 0 0 1 8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M7.5 13a2 2 0 0 1 3 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="15.5" r="1" fill="currentColor" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="2.5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 15.5h6M9 12.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function PowerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 4.5A7 7 0 1 0 13 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CalendarEmptyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="26" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3v4M22 3v4M3 13h26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 19h4M10 24h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatCents(cents, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format((cents ?? 0) / 100)
  } catch {
    return `${((cents ?? 0) / 100).toFixed(2)}`
  }
}

// ─── Usage Summary Modal ──────────────────────────────────────────────────────

function UsageSummaryModal({ summary, onPayUsageFee, onClose }) {
  const { t } = useI18n()
  const {
    session_minutes,
    session_kwh,
    electricity_fee_cents,
    ventilation_fee_cents,
    door_open_count,
    access_event_count,
    total_usage_fee_cents,
    currency,
    payment_required,
  } = summary

  return (
    <>
      <div
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Session usage summary"
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <div className="bg-bg-2 border border-line rounded-2xl shadow-elevated w-full max-w-md p-7 animate-fadeUp">
          <h2 className="font-inter text-[16px] font-semibold text-ink mb-1">{t('bookings.sessionEnded')}</h2>
          <p className="font-inter text-[13.5px] text-neutral-2 mb-5 leading-relaxed">
            {t('bookings.usageSummary')}
          </p>

          <div className="flex flex-col gap-3 mb-5">
            {session_minutes != null && (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13.5px] text-neutral-2">{t('bookings.duration')}</span>
                <span className="font-mono text-[13.5px] text-ink-2">{session_minutes} min</span>
              </div>
            )}
            {session_kwh != null && (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13.5px] text-neutral-2">{t('bookings.electricityUsed')}</span>
                <span className="font-mono text-[13.5px] text-ink-2">{session_kwh} kWh</span>
              </div>
            )}
            {electricity_fee_cents != null && (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13.5px] text-neutral-2">{t('bookings.electricityFee')}</span>
                <span className="font-mono text-[13.5px] text-ink-2">{formatCents(electricity_fee_cents, currency)}</span>
              </div>
            )}
            {ventilation_fee_cents != null && (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13.5px] text-neutral-2">{t('bookings.ventilation')}</span>
                <span className="font-mono text-[13.5px] text-ink-2">{formatCents(ventilation_fee_cents, currency)}</span>
              </div>
            )}
            {door_open_count != null && (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13.5px] text-neutral-2">{t('bookings.doorOpenings')}</span>
                <span className="font-mono text-[13.5px] text-ink-2">{door_open_count}</span>
              </div>
            )}
            {access_event_count != null && (
              <div className="flex items-center justify-between">
                <span className="font-inter text-[13.5px] text-neutral-2">{t('bookings.accessEvents')}</span>
                <span className="font-mono text-[13.5px] text-ink-2">{access_event_count}</span>
              </div>
            )}
            <div className="border-t border-line pt-3 flex items-center justify-between">
              <span className="font-inter text-[15px] font-semibold text-ink">{t('bookings.totalUsageFee')}</span>
              <span className="font-mono text-[18px] font-semibold text-accent">
                {formatCents(total_usage_fee_cents, currency)}
              </span>
            </div>
          </div>

          {payment_required ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-[18px] py-[11px] rounded-xl border border-line text-ink-2 font-inter text-[13.5px] hover:bg-white/[.04] transition-all duration-200 cursor-pointer bg-transparent"
              >
                {t('common.close')}
              </button>
              <button
                onClick={onPayUsageFee}
                className="flex-1 px-[18px] py-[11px] rounded-xl bg-accent border border-accent text-white font-inter text-[13.5px] font-medium hover:bg-accent-2 transition-all duration-200 cursor-pointer"
              >
                {t('bookings.payUsageFee')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-accent/25 bg-accent/[.09] px-4 py-3">
                <p className="font-inter text-[13.5px] leading-relaxed text-accent">
                  {t('bookings.noAdditionalCharges')}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full px-[18px] py-[11px] rounded-xl bg-accent text-white font-inter text-[13.5px] font-medium hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0"
              >
                {t('common.done')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Amenity helpers ──────────────────────────────────────────────────────────


function AmenityIcon({ type }) {
  if (type === 'wifi')    return <WifiIcon />
  if (type === 'monitor') return <MonitorIcon />
  if (type === 'power')   return <PowerIcon />
  return null
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function getCountdown(timeSlot, isToday, t) {
  if (!isToday) return null
  const now = new Date()
  const [startStr, endStr] = timeSlot.split(' - ')
  const [sh, sm] = startStr.trim().split(':').map(Number)
  const [eh, em] = endStr.trim().split(':').map(Number)
  const start = new Date(now); start.setHours(sh, sm, 0, 0)
  const end   = new Date(now); end.setHours(eh, em, 0, 0)
  const toStart = start - now
  const toEnd   = end   - now
  if (toStart > 0) {
    const h = Math.floor(toStart / 3600000)
    const m = Math.floor((toStart % 3600000) / 60000)
    return h > 0 ? t('bookings.startsIn', { h, m }) : t('bookings.startsInMinutes', { m })
  }
  if (toEnd > 0) {
    const h = Math.floor(toEnd / 3600000)
    const m = Math.floor((toEnd % 3600000) / 60000)
    return h > 0 ? t('bookings.endsIn', { h, m }) : t('bookings.endsInMinutes', { m })
  }
  return null
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const BOOKINGS_DATA = {
  upcoming: [
    {
      id: 1,
      status: 'upcoming',
      name: 'Alpha Sector Desk 42',
      location: 'Neo-Tokyo Hub, Floor 4',
      date: 'May 17',
      time: '14:00 - 18:00',
      isToday: true,
      spaceType: 'desk',
      iot: { connected: true },
      amenities: ['wifi', 'monitor', 'power'],
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
    },
  ],
  past: [
    {
      id: 2,
      status: 'completed',
      name: 'Nexus Boardroom',
      location: 'Neo-Tokyo Hub, Floor 2',
      date: 'May 12',
      time: '14:00 - 16:00',
      isToday: false,
      spaceType: 'meeting',
      iot: { connected: false },
      amenities: [],
      image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 3,
      status: 'completed',
      name: 'Quantum Suite',
      location: 'Innovation Park, Floor 8',
      date: 'Apr 30',
      time: '10:00 - 14:00',
      isToday: false,
      spaceType: 'office',
      iot: { connected: false },
      amenities: [],
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    },
  ],
}

const UPCOMING_STATUSES = new Set([
  'PENDING_APPROVAL',
  'APPROVED',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'OVERSTAY',
])

const PAST_STATUSES = new Set([
  'COMPLETED',
  'CHECKED_OUT',
  'REJECTED',
  'CANCELLED',
  'EXPIRED',
  'NO_SHOW',
  'REFUNDED',
])

function formatOfficeLocation(office) {
  return [office?.building, office?.floor, office?.room].filter(Boolean).join(', ') || 'FlexiSpace Network'
}

function formatDateLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Scheduled'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatTimeLabel(startValue, endValue) {
  const start = new Date(startValue)
  const end = new Date(endValue)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '00:00 - 00:00'
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false }
  return `${start.toLocaleTimeString(undefined, opts)} - ${end.toLocaleTimeString(undefined, opts)}`
}

function isSameLocalDay(value, compareTo = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return (
    date.getFullYear() === compareTo.getFullYear() &&
    date.getMonth() === compareTo.getMonth() &&
    date.getDate() === compareTo.getDate()
  )
}

function mapBookingRow(row, office, index) {
  const fallback = BOOKINGS_DATA.upcoming.concat(BOOKINGS_DATA.past)[index % 3]
  const isUpcoming = UPCOMING_STATUSES.has(row.status) || !PAST_STATUSES.has(row.status)
  return {
    id: row.id,
    rawStatus: row.status,
    status: isUpcoming ? 'upcoming' : 'completed',
    name: office?.name || 'Workspace Booking',
    location: formatOfficeLocation(office),
    date: formatDateLabel(row.start_time),
    time: formatTimeLabel(row.start_time, row.end_time),
    rawStartTime: row.start_time,
    rawEndTime: row.end_time,
    amountCents: row.amount_cents,
    currency: row.currency,
    isToday: isSameLocalDay(row.start_time),
    officeId: row.office_id,
    spaceType: 'office',
    iot: { connected: false },
    amenities: [],
    image: fallback.image,
  }
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

function CancelModal({ booking, onConfirm, onClose, loading, error }) {
  const { t } = useI18n()
  return (
    <>
      <div
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cancel booking confirmation"
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
      >
        <div className="bg-bg-2 border border-line rounded-2xl shadow-elevated w-full max-w-sm p-7 animate-fadeUp">
          <h2 className="font-inter text-[16px] font-semibold text-ink mb-2">{t('bookings.cancelTitle')}</h2>
          <p className="font-inter text-[13.5px] text-neutral-2 leading-relaxed mb-6">
            {t('bookings.cancelBody', { name: booking.name, date: booking.date })}
          </p>
          {error && (
            <p role="alert" className="font-inter text-[13px] text-critical leading-relaxed mb-4">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-[18px] py-[11px] rounded-xl border border-line text-ink-2 font-inter text-[13.5px] hover:bg-white/[.04] transition-all duration-200 cursor-pointer bg-transparent"
            >
              {t('bookings.keepBooking')}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-[18px] py-[11px] rounded-xl bg-critical/[.1] border border-critical/25 text-critical font-inter text-[13.5px] font-medium hover:bg-critical/[.18] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? t('bookings.cancelling') : t('bookings.cancelConfirm')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, countdown, onViewTicket, onCancel, onPayNow, onCheckOut, onAccessOffice, checkingOut, checkoutError, delay }) {
  const { t } = useI18n()
  const isUpcoming = booking.status === 'upcoming'

  return (
    <div
      className="group bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden flex flex-col md:flex-row animate-fadeUp"
      style={{ '--delay': delay }}
    >
      {/* Image */}
      <div className="md:w-72 shrink-0 h-52 md:h-auto overflow-hidden">
        <img
          src={booking.image}
          alt={booking.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col gap-3 relative">

        {/* Status + date/countdown row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            {isUpcoming ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-3 border border-line font-inter text-[12px] font-medium text-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {t('bookings.upcoming')}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-bg-3 border border-line font-inter text-[12px] font-medium text-neutral-2">
                {t('bookings.completed')}
              </span>
            )}
          </div>

          <div className="shrink-0 text-right">
            {countdown ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/[.08] border border-accent/20 font-mono text-[11px] text-accent uppercase tracking-[.14em]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                {countdown}
              </div>
            ) : (
              <div className="bg-bg-3 border border-line rounded-xl px-4 py-3 min-w-[90px]">
                <div className="font-inter text-[15px] font-semibold text-ink leading-tight">{booking.date}</div>
                <div className="font-mono text-[11px] text-neutral mt-1">{booking.time}</div>
              </div>
            )}
          </div>
        </div>

        {/* Name + location + IoT */}
        <div className="flex flex-col gap-1.5">
          <h2 className="font-inter text-[16px] font-semibold text-ink">{booking.name}</h2>
          <div className="flex items-center gap-1.5 text-neutral">
            <LocationIcon />
            <span className="font-inter text-[13.5px] text-neutral-2">{booking.location}</span>
          </div>
          {isUpcoming && booking.iot.connected && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="font-mono text-[11px] uppercase tracking-[.14em] text-accent">
                {t('bookings.iotReady')}
              </span>
            </div>
          )}
        </div>

        {(booking.rawStatus === 'CONFIRMED' || booking.rawStatus === 'CHECKED_IN') && (() => {
          const pinStatus = getPinStatus(booking.rawStartTime, booking.rawEndTime, booking.rawStatus)
          const pinDigits = derivePIN(booking.id)
          const st = PIN_STATUS_STYLE[pinStatus] ?? PIN_STATUS_STYLE.active
          const pinLabel = {
            scheduled: t('ticket.pin.scheduled'),
            active:    t('ticket.pin.active'),
            expired:   t('ticket.pin.expired'),
            used:      t('ticket.pin.used'),
          }[pinStatus]

          return (
            <div className={`inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl border ${st.bg} ${st.border} mt-1 self-start`}>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[.14em] text-neutral-2">{t('ticket.pin.accessPin')}</span>
                <span className="font-mono text-[17px] font-bold text-ink tracking-[.18em]">
                  {booking.rawStatus === 'CHECKED_IN' ? '••••••' : pinDigits}
                </span>
              </div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${st.bg} border ${st.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot} ${pinStatus === 'active' ? 'animate-pulse' : ''}`} />
                <span className={`font-mono text-[10px] uppercase tracking-[.12em] ${st.text}`}>{pinLabel}</span>
              </div>
            </div>
          )
        })()}

        {/* Amenities */}
        {isUpcoming && booking.amenities.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral-2">{t('bookings.amenities.title')}</span>
            <div className="flex items-center gap-3 text-sky-400">
              {booking.amenities.map((type) => (
                <span key={type} title={t(`bookings.amenities.${type}`) ?? type} className="cursor-default">
                  <AmenityIcon type={type} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <div className="flex items-center gap-4 flex-wrap">
            {isUpcoming ? (
              <>
                {booking.rawStatus === 'PAYMENT_PENDING' && (
                  <button
                    aria-label={`Complete payment for ${booking.name}`}
                    onClick={onPayNow}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-mono text-[11px] uppercase tracking-[.14em] font-medium transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0"
                  >
                    {t('bookings.payNow')}
                  </button>
                )}
                {(booking.rawStatus === 'CONFIRMED' || booking.rawStatus === 'CHECKED_IN') && (
                  <button
                    aria-label={`View ticket for ${booking.name}`}
                    onClick={onViewTicket}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-mono text-[11px] uppercase tracking-[.14em] font-medium transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0"
                  >
                    {t('bookings.viewTicket')}
                    <TicketIcon />
                  </button>
                )}
                {booking.rawStatus === 'CONFIRMED' && (
                  <button
                    type="button"
                    aria-label={`Access office for ${booking.name}`}
                    onClick={onAccessOffice}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-mono text-[11px] uppercase tracking-[.14em] font-medium transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                      <rect x="2" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
                      <path d="M4 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                      <circle cx="6.5" cy="9" r="1" fill="currentColor" />
                    </svg>
                    {t('bookings.accessOffice')}
                  </button>
                )}
                {booking.rawStatus === 'CHECKED_IN' && (
                  <button
                    aria-label={`Check out of ${booking.name}`}
                    onClick={onCheckOut}
                    disabled={checkingOut}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-3 border border-line text-ink-2 font-mono text-[11px] uppercase tracking-[.14em] font-medium transition-all duration-200 hover:border-accent/40 hover:text-accent cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkingOut ? t('bookings.checkingOut') : t('bookings.checkOut')}
                  </button>
                )}
                <button
                  aria-label={`Cancel booking for ${booking.name}`}
                  onClick={onCancel}
                  className="font-inter text-[12px] text-neutral hover:text-critical transition-colors duration-200 cursor-pointer bg-transparent border-0"
                >
                  {t('bookings.cancelBooking')}
                </button>
              </>
            ) : (
              <button
                aria-label={`Rebook ${booking.name}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent border border-accent/50 text-accent font-mono text-[11px] uppercase tracking-[.14em] font-medium transition-all duration-200 hover:bg-accent/[.09] cursor-pointer"
              >
                {t('bookings.rebookSpace')}
                <RefreshIcon />
              </button>
            )}
          </div>
          {checkoutError && (
            <p role="alert" className="font-inter text-[12px] text-critical leading-snug">
              {checkoutError}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ tab, onExplore }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <span className="text-neutral">
        <CalendarEmptyIcon />
      </span>
      <p className="font-inter text-[15px] text-neutral-2">
        {tab === 'upcoming' ? t('bookings.noUpcoming') : t('bookings.noPast')}
      </p>
      {tab === 'upcoming' && (
        <button
          onClick={onExplore}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent border border-accent/50 text-accent font-mono text-[11px] uppercase tracking-[.14em] font-medium transition-all duration-200 hover:bg-accent/[.09] cursor-pointer"
        >
          {t('bookings.exploreSpaces')}
        </button>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MyBookings() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const location = useLocation()

  const [activeTab,    setActiveTab]    = useState('upcoming')
  const [spaceFilter,  setSpaceFilter]  = useState('all')
  const [search,       setSearch]       = useState('')
  const [bookings,     setBookings]     = useState({ upcoming: [], past: [] })
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [bookingLoadError, setBookingLoadError] = useState(false)
  const [, setTick] = useState(0)

  const [checkingOutId, setCheckingOutId] = useState(null)
  const [checkoutErrorBookingId, setCheckoutErrorBookingId] = useState(null)
  const [checkoutErrorMsg, setCheckoutErrorMsg] = useState('')
  const [usageSummary, setUsageSummary] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)


  useEffect(() => {
    let cancelled = false

    async function loadBookings() {
      setLoadingBookings(true)
      setBookingLoadError(false)

      const { data: bookingRows, error: bookingError } = await supabase
        .from('bookings')
        .select('id,status,start_time,end_time,amount_cents,currency,office_id,checked_in_at,checked_out_at,cancelled_at')
        .order('start_time', { ascending: true })

      if (cancelled) return

      if (bookingError || !bookingRows?.length) {
        setBookings({ upcoming: [], past: [] })
        setBookingLoadError(!!bookingError)
        setLoadingBookings(false)
        return
      }

      const officeIds = [...new Set(bookingRows.map((b) => b.office_id).filter(Boolean))]
      let officesById = {}

      if (officeIds.length > 0) {
        const { data: officeRows, error: officeError } = await supabase
          .from('offices')
          .select('id,name,building,floor,room')
          .in('id', officeIds)

        if (cancelled) return

        if (officeError) {
          setBookings({ upcoming: [], past: [] })
          setBookingLoadError(true)
          setLoadingBookings(false)
          return
        }

        officesById = Object.fromEntries((officeRows ?? []).map((office) => [office.id, office]))
      }

      const mapped = bookingRows.reduce((acc, row, index) => {
        const booking = mapBookingRow(row, officesById[row.office_id], index)
        acc[booking.status === 'upcoming' ? 'upcoming' : 'past'].push(booking)
        return acc
      }, { upcoming: [], past: [] })

      if (cancelled) return
      setBookings(mapped)
      setLoadingBookings(false)
    }

    loadBookings()

    const channel = supabase
      .channel('my-bookings-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => { if (!cancelled) loadBookings() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => { if (!cancelled) loadBookings() })
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [refreshKey])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const tabs = [
    { id: 'upcoming', label: t('bookings.upcoming') },
    { id: 'past',     label: t('bookings.past') },
  ]

  const spaceFilters = [
    { id: 'all', label: t('common.all') },
  ]

  const source = bookings[activeTab] ?? []
  const visibleBookings = source.filter((b) => {
    if (spaceFilter !== 'all' && b.spaceType !== spaceFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    setCancelError('')

    try {
      await cancelBooking({
        bookingId: cancelTarget.id,
        reason: 'Cancelled by member from My Bookings',
      })
      setBookings((prev) => ({
        ...prev,
        upcoming: prev.upcoming.filter((b) => b.id !== cancelTarget.id),
      }))
      setCancelTarget(null)
    } catch (error) {
      setCancelError(error.message || t('bookings.errors.unableToCancel'))
    } finally {
      setCancelling(false)
    }
  }

  const handleCheckOut = async (bookingId) => {
    setCheckingOutId(bookingId)
    setCheckoutErrorBookingId(null)
    setCheckoutErrorMsg('')
    setUsageSummary(null)

    try {
      const result = await checkOutBooking({ bookingId })
      // Unwrap the { data, meta } envelope; derive payment_required from payment_id presence
      const inner = result.data ?? result
      setUsageSummary({
        ...inner,
        bookingId,
        payment_required: inner.payment_id != null,
      })
    } catch (error) {
      setCheckoutErrorBookingId(bookingId)
      setCheckoutErrorMsg(error.message || t('bookings.errors.unableToCheckout'))
    } finally {
      setCheckingOutId(null)
    }
  }

  const sidebarNavItems = [
    { id: 'explore',  label: 'Explore',  icon: <CompassNavIcon />,      path: '/find-workspace' },
    { id: 'bookings', label: 'Bookings', icon: <SidebarCalendarIcon />, path: '/bookings' },
    { id: 'profile',  label: 'Profile',  icon: <UserNavIcon />,         path: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header dir="ltr" className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg border-b border-line flex items-center px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BrandLogo variant="colored" iconSize={28} />
        </Link>
        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher compact />
        </div>
      </header>

      <div className="flex pt-14 flex-1">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className={`app-sidebar hidden md:flex flex-col w-[200px] shrink-0 fixed top-14 bottom-0 border-line ${direction === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'}`}>
          <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Sidebar navigation">
            {sidebarNavItems.map((item) => {
              const isNavActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  aria-label={translateNavLabel(item.label, t)}
                  aria-current={isNavActive ? 'page' : undefined}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] transition-all duration-200 cursor-pointer border-0 text-left w-full ${
                    isNavActive
                      ? `bg-accent/[.09] text-accent ${direction === 'rtl' ? 'border-r-2 border-r-accent' : 'border-l-2 border-l-accent'}`
                      : `text-neutral-2 hover:bg-bg-3 hover:text-ink ${direction === 'rtl' ? 'border-r-2 border-r-transparent' : 'border-l-2 border-l-transparent'}`
                  }`}
                >
                  <span aria-hidden="true" className={isNavActive ? 'text-accent' : 'text-neutral'}>
                    {item.icon}
                  </span>
                  {translateNavLabel(item.label, t)}
                </button>
              )
            })}
          </nav>
          <div className="p-3 border-t border-line flex flex-col gap-1 shrink-0">
            <button
              aria-label={t('common.support')}
              onClick={() => navigate('/support')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full"
            >
              <span className="text-neutral"><SupportNavIcon /></span>
              {t('common.support')}
            </button>
            <button
              aria-label={t('common.signOut')}
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M5.5 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M10 10l3-2.5L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.5 7.5h7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {t('common.signOut')}
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────── */}
        <main className={`flex-1 px-6 md:px-10 py-8 min-h-screen pb-16 md:pb-8 ${direction === 'rtl' ? 'md:mr-[200px] md:ml-0' : 'md:ml-[200px]'}`}>
        <div className="max-w-5xl mx-auto">

          {/* Page heading */}
          <div className="mb-8 animate-fadeUp" style={{ '--delay': '0ms' }}>
            <h1 className="font-fraunces text-4xl md:text-5xl font-light text-ink mb-2">{t('bookings.title')}</h1>
            <p className="font-inter text-[15px] text-neutral-2">{t('bookings.subtitle')}</p>
          </div>

          {location.state?.bookingCreated && (
            <div role="status" className="mb-6 rounded-xl border border-accent/25 bg-accent/[.09] px-4 py-3 animate-fadeUp" style={{ '--delay': '40ms' }}>
              <p className="font-inter text-[13.5px] leading-relaxed text-accent">
                {t('bookings.bookingCreatedMsg')}
              </p>
            </div>
          )}

          {location.state?.paymentConfirmed && (
            <div role="status" className="mb-6 rounded-xl border border-accent/25 bg-accent/[.09] px-4 py-3 animate-fadeUp" style={{ '--delay': '50ms' }}>
              <p className="font-inter text-[13.5px] leading-relaxed text-accent">
                {t('bookings.paymentConfirmedMsg')}
              </p>
            </div>
          )}

          {location.state?.usagePaymentConfirmed && (
            <div role="status" className="mb-6 rounded-xl border border-accent/25 bg-accent/[.09] px-4 py-3 animate-fadeUp" style={{ '--delay': '50ms' }}>
              <p className="font-inter text-[13.5px] leading-relaxed text-accent">
                {t('bookings.usageFeeConfirmedMsg')}
              </p>
            </div>
          )}

          {location.state?.accessGranted && (
            <div role="status" className="mb-6 rounded-xl border border-accent/25 bg-accent/[.09] px-4 py-3 animate-fadeUp" style={{ '--delay': '50ms' }}>
              <p className="font-inter text-[13.5px] leading-relaxed text-accent">
                {t('bookings.accessGrantedMsg')}
              </p>
            </div>
          )}

          {/* Tabs */}
          <div role="tablist" aria-label="Booking filters" className="flex items-center gap-6 border-b border-line mb-6 animate-fadeUp" style={{ '--delay': '60ms' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-4 font-inter text-[15px] font-medium transition-colors duration-200 cursor-pointer bg-transparent border-0 px-0 ${
                  activeTab === tab.id ? 'text-accent' : 'text-neutral-2 hover:text-ink'
                }`}
              >
                {tab.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full transition-opacity duration-200 ${
                    activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fadeUp" style={{ '--delay': '100ms' }}>
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder={t('bookings.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t('bookings.searchLabel')}
                className="w-full bg-bg-3 border border-line rounded-full pl-10 pr-4 py-2.5 text-ink font-inter text-[13px] placeholder:text-neutral outline-none focus:border-accent focus:ring-[2px] focus:ring-accent/[.1] transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {spaceFilters.map((f) => (
                <button
                  key={f.id}
                  aria-pressed={spaceFilter === f.id}
                  onClick={() => setSpaceFilter(f.id)}
                  className={`px-3.5 py-2 rounded-full font-inter text-[12px] font-medium transition-all duration-200 cursor-pointer border ${
                    spaceFilter === f.id
                      ? 'bg-accent/[.12] border-accent/30 text-accent'
                      : 'bg-bg-3 border-line text-neutral-2 hover:text-ink hover:border-white/[.1]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {(loadingBookings || bookingLoadError) && (
            <div className="mb-5 animate-fadeUp" style={{ '--delay': '120ms' }}>
              <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">
                {loadingBookings ? t('bookings.loading') : t('bookings.fallback')}
              </p>
            </div>
          )}

          {/* Cards */}
          <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="flex flex-col gap-5">
            {visibleBookings.length === 0 ? (
              <EmptyState tab={activeTab} onExplore={() => navigate('/')} />
            ) : (
              visibleBookings.map((booking, i) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  countdown={getCountdown(booking.time, booking.isToday, t)}
                  onViewTicket={() => navigate('/ticket', {
                    state: {
                      bookingId: booking.id,
                      officeName: booking.name,
                      startTime: booking.rawStartTime,
                      endTime: booking.rawEndTime,
                    },
                  })}
                  onPayNow={() => navigate('/checkout', {
                    state: {
                      pendingBookingId: booking.id,
                      amountCents: booking.amountCents,
                      currency: booking.currency,
                      startTime: booking.rawStartTime,
                      endTime: booking.rawEndTime,
                    },
                  })}
                  onCheckOut={() => handleCheckOut(booking.id)}
                  onAccessOffice={() => navigate('/ticket', {
                    state: {
                      bookingId: booking.id,
                      officeName: booking.name,
                      startTime: booking.rawStartTime,
                      endTime: booking.rawEndTime,
                      rawStatus: booking.rawStatus,
                    },
                  })}
                  checkingOut={checkingOutId === booking.id}
                  checkoutError={checkoutErrorBookingId === booking.id ? checkoutErrorMsg : ''}
                  onCancel={() => {
                    setCancelError('')
                    setCancelTarget(booking)
                  }}
                  delay={`${80 + i * 80}ms`}
                />
              ))
            )}
          </div>

        </div>
        </main>
      </div>

      {/* ── Cancel Modal ─────────────────────────────────────────────── */}
      {cancelTarget && (
        <CancelModal
          booking={cancelTarget}
          onConfirm={handleConfirmCancel}
          onClose={() => {
            if (cancelling) return
            setCancelError('')
            setCancelTarget(null)
          }}
          loading={cancelling}
          error={cancelError}
        />
      )}

      {/* ── Usage Summary Modal ───────────────────────────────────────── */}
      {usageSummary && (
        <UsageSummaryModal
          summary={usageSummary}
          onClose={() => setUsageSummary(null)}
          onPayUsageFee={() => {
            const s = usageSummary
            setUsageSummary(null)
            navigate('/checkout', {
              state: {
                usagePaymentMode: true,
                bookingId: s.bookingId,
                usageSummaryId: s.usage_summary_id,
                paymentId: s.payment_id,
                amountCents: s.total_usage_fee_cents,
                currency: s.currency,
                sessionMinutes: s.session_minutes,
                sessionKwh: s.session_kwh,
                electricityFeeCents: s.electricity_fee_cents,
                ventilationFeeCents: s.ventilation_fee_cents,
              },
            })
          }}
        />
      )}
    </div>
  )
}
