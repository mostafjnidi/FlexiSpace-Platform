import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import { approveBooking, rejectBooking } from '../lib/flexispaceApi'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavItem } from '../components/navigation'

// ── Icons ─────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

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


function GridDotsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="4" cy="4" r="1.5" fill="currentColor" /><circle cx="9" cy="4" r="1.5" fill="currentColor" />
      <circle cx="14" cy="4" r="1.5" fill="currentColor" /><circle cx="4" cy="9" r="1.5" fill="currentColor" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" /><circle cx="14" cy="9" r="1.5" fill="currentColor" />
      <circle cx="4" cy="14" r="1.5" fill="currentColor" /><circle cx="9" cy="14" r="1.5" fill="currentColor" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  )
}

function CardBadgeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 8h4M4 10.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function BuildingNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 3V2M10 3V2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="4.5" y="7" width="2" height="2.5" rx=".4" stroke="currentColor" strokeWidth="1.1" />
      <rect x="8.5" y="7" width="2" height="2.5" rx=".4" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function LayoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 6h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 6v8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function NavNetworkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="3" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.5 6v2.5M7.5 8.5L3 10M7.5 8.5L12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CalendarNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v2M10 1.5v2M1.5 6.5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M3 1.5v12l1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1V1.5H3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 5.5h4M5.5 8h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function NavTodayIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.5 4.5v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NavWrenchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M11.5 1a3.5 3.5 0 0 0-3.46 4.07L2.5 10.5A1.5 1.5 0 0 0 4.5 12.5l5.46-5.54A3.5 3.5 0 1 0 11.5 1Z"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function UsersNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 8.5c1.5 0 3 1 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function NavScannerIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="4" height="4" rx=".5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9.5" y="1.5" width="4" height="4" rx=".5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1.5" y="9.5" width="4" height="4" rx=".5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M9.5 9.5h2M11.5 9.5v2M11.5 11.5h2M13.5 9.5v2M9.5 11.5v2M9.5 13.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function NavCommandIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.5 1.5v3.5M7.5 10v3.5M1.5 7.5h3.5M10 7.5h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function NavAccessIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 4.5h11M2 7.5h7M2 10.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11.5" cy="9" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 10.5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M5.5 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 10l3-2.5L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 7.5h7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 7l3.5 3.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 3v3l2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 9v7M11 9v7M3 9h12" stroke="currentColor" strokeWidth="1.3" />
      <rect x="7.5" y="4" width="3" height="3" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function HeadphonesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 10V9a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="2" y="10" width="3" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="13" y="10" width="3" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function SofaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M4.5 11V8.5A1.5 1.5 0 0 1 6 7h6a1.5 1.5 0 0 1 1.5 1.5V11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2 11h14v2.5H2V11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.5 13.5v1M13.5 13.5v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="2.5" y="5.5" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5.5V4a2 2 0 0 1 4 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6.5" cy="8.5" r="1" fill="currentColor" />
    </svg>
  )
}

function UnlockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="2.5" y="5.5" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 5.5V4a2 2 0 0 1 4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6.5" cy="8.5" r="1" fill="currentColor" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2C7 4.5 5 5.5 5 7.5a3 3 0 0 0 6 0c0-1-.5-2-1.2-2.7.4 1.5-.8 2.2-.8 2.2C9 5.5 9.5 4 8 2Z" fill="currentColor" />
    </svg>
  )
}

function WifiOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 6a6 6 0 0 1 8.5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7.5 9a2.5 2.5 0 0 1 2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="12.5" r="1" fill="currentColor" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="5" width="12" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M13 7v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="2.5" y="6.5" width="2.5" height="3" rx="0.5" fill="currentColor" />
      <path d="M15 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L1.5 15.5h15L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 7.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="13.2" r="0.9" fill="currentColor" />
    </svg>
  )
}

function PowerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5.25 4.5A6 6 0 1 0 12.75 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function SnowflakeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2v14M3 5.5l12 7M15 5.5l-12 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.5 3.5L9 6l2.5-2.5M6.5 14.5L9 12l2.5 2.5M2.8 8.2l3.4.9-.9 3.4M15.2 8.2l-3.4.9.9 3.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GlobalCommandPanel({ t }) {
  const commandBtnClass = 'bg-bg-3 border border-line rounded-xl px-4 py-4 min-h-[94px] flex flex-col items-center justify-center gap-2 text-neutral-2 cursor-pointer hover:border-accent/40 hover:text-ink transition-all duration-200'

  return (
    <section aria-label="Global Command" className="bg-bg-2 border border-line rounded-2xl shadow-card p-5 relative overflow-hidden">
      <div className="absolute right-4 top-4 opacity-[.04] text-ink pointer-events-none select-none">
        <NavCommandIcon />
      </div>
      <h2 className="font-inter text-[16px] font-semibold text-accent mb-1">{t('commandCenter.globalCommand')}</h2>
      <p className="font-inter text-[13.5px] text-neutral-2 mb-5 leading-relaxed">
        {t('commandCenter.globalCommandDesc')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          onClick={() => {}}
          aria-label="Reboot Main Hub"
          className={commandBtnClass}
        >
          <span className="text-neutral-2"><PowerIcon /></span>
          <span className="font-inter text-[13.5px] font-medium text-ink-2 text-center leading-tight">
            {t('commandCenter.rebootMainHub')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {}}
          aria-label="HVAC Override"
          className={commandBtnClass}
        >
          <span className="text-neutral-2"><SnowflakeIcon /></span>
          <span className="font-inter text-[13.5px] font-medium text-ink-2 text-center leading-tight">
            {t('commandCenter.hvacOverride')}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {}}
        aria-label="Global Door Unlock. Fire emergency only."
        className="w-full rounded-xl px-4 py-5 min-h-[112px] flex flex-col items-center justify-center gap-1.5 bg-red-600/80 border border-red-400/30 text-white cursor-pointer hover:bg-red-600 transition-all duration-200"
      >
        <WarningIcon />
        <span className="font-inter text-[13px] font-bold uppercase tracking-[.14em] text-center">
          {t('commandCenter.globalDoorUnlock')}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[.14em] text-white/70 text-center">
          {t('commandCenter.fireEmergencyOnly')}
        </span>
      </button>
    </section>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="14" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 2v2M13 2v2M2 7h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GridSquaresIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="10" y="10" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function NavIcon({ type }) {
  if (type === 'grid')     return <GridDotsIcon />
  if (type === 'badge')    return <CardBadgeIcon />
  if (type === 'building') return <BuildingNavIcon />
  if (type === 'layout')   return <LayoutIcon />
  if (type === 'network')  return <NavNetworkIcon />
  if (type === 'calendar') return <CalendarNavIcon />
  if (type === 'receipt')  return <ReceiptIcon />
  if (type === 'today')    return <NavTodayIcon />
  if (type === 'wrench')   return <NavWrenchIcon />
  if (type === 'users')    return <UsersNavIcon />
  if (type === 'scanner')  return <NavScannerIcon />
  if (type === 'command')  return <NavCommandIcon />
  if (type === 'access')   return <NavAccessIcon />
  return null
}

function RoomIconEl({ type }) {
  if (type === 'building')   return <BuildingIcon />
  if (type === 'headphones') return <HeadphonesIcon />
  if (type === 'sofa')       return <SofaIcon />
  return null
}

// ── Nav ───────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    id: 'operator', label: 'Operator', mobilePath: '/command-center',
    items: [
      { label: 'Command Center',   path: '/command-center',   icon: 'command' },
      { label: "Today's Bookings", path: '/todays-bookings',  icon: 'today'   },
      { label: 'Scanner Control',  path: '/scanner-control',  icon: 'scanner' },
      { label: 'Live Access Feed', path: '/access-logs',      icon: 'access'  },
      { label: 'Facility Ops Hub', path: '/facility-ops-hub', icon: 'wrench'  },
    ],
  },
]

// ── Data ──────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtBookingTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

function calcAge(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  return `${Math.floor(diff / 3600)}h`
}

function formatTime(secs) {
  if (secs <= 0) return '00:00:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

function relTime(iso) {
  if (!iso) return 'Unknown'
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Sub-components ────────────────────────────────────────────────────────

function BookingCard({ request, onApprove, onReject, t }) {
  return (
    <div className="bg-bg-2 border border-line rounded-xl shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('commandCenter.bookingRequest')}</span>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-bg-3 border border-line">
          <span className="text-neutral"><ClockIcon /></span>
          <span className="font-mono text-[11px] text-neutral-2">{request.age}</span>
        </div>
      </div>
      <div>
        <div className="font-inter text-[17px] font-semibold text-ink leading-tight">{request.name}</div>
        <div className="font-inter text-[13px] text-neutral-2 mt-1">{request.space} · {request.time}</div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onApprove(request.id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white font-inter text-[13px] font-medium transition-all duration-200 hover:opacity-90 cursor-pointer border-0"
        >
          <CheckIcon /> {t('commandCenter.approve')}
        </button>
        <button
          onClick={() => onReject(request.id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-transparent border border-line text-neutral-2 font-inter text-[13px] font-medium transition-all duration-200 hover:bg-ink/[.06] hover:text-ink cursor-pointer"
        >
          <XIcon /> {t('commandCenter.reject')}
        </button>
      </div>
    </div>
  )
}

function RoomCard({ room, doorLocked, onToggleDoor, remainingSecs, showToast, t }) {
  const isActive  = room.status === 'active'
  const isExpired = isActive && remainingSecs <= 0

  return (
    <div
      className={`bg-bg-2 rounded-xl overflow-hidden flex flex-col ${
        isActive ? 'border border-line border-l-[3px]' : 'border border-line'
      }`}
      style={isActive ? { borderLeftColor: '#10B981' } : {}}
    >
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={`font-inter text-[13px] font-semibold leading-tight ${isActive ? 'text-ink' : 'text-neutral'}`}>
              {room.name}
            </h3>
            <p className={`font-inter text-[12px] mt-0.5 ${isActive ? 'text-neutral-2' : 'text-neutral'}`}>
              {room.type}{room.capacity != null ? ` · ${t('commandCenter.capPrefix')} ${room.capacity}` : ''}
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={isActive
              ? { backgroundColor: 'rgba(16,185,129,.14)', color: '#10B981', border: '1px solid rgba(16,185,129,.22)' }
              : { backgroundColor: 'rgba(148,163,184,.08)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <RoomIconEl type={room.icon} />
          </div>
        </div>

        {isActive ? (
          <div className="bg-bg-3 rounded-lg p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {room.avatar ? (
                <img src={room.avatar} alt={room.occupant}
                  className="w-8 h-8 rounded-full object-cover shrink-0" aria-hidden="true" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: 'rgba(16,185,129,.2)', color: '#10B981' }}>
                  {room.initials}
                </div>
              )}
              <div>
                <div className="font-inter text-[13px] text-ink leading-tight">{room.occupant}</div>
                <div className="font-inter text-[11px] mt-0.5" style={{ color: '#10B981' }}>
                  {isExpired ? t('commandCenter.sessionEnded') : t('commandCenter.inProgress')}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-mono text-[14px] leading-tight ${isExpired ? 'text-red-400' : 'text-accent'}`}>
                {formatTime(remainingSecs)}
              </div>
              <div className="font-inter text-[11px] text-neutral-2 mt-0.5">{t('commandCenter.remaining')}</div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-5">
            <span className="font-inter text-[13.5px] text-neutral">{t('commandCenter.available')}</span>
          </div>
        )}
      </div>

      {/* Door control footer */}
      <div className="border-t border-line px-4 py-3 flex items-center justify-between gap-2">
        <div className={`flex items-center gap-1.5 ${isActive ? 'text-neutral-2' : 'text-neutral'}`}>
          {doorLocked ? <LockIcon /> : <UnlockIcon />}
          <span className="font-mono text-[11px] uppercase tracking-[.14em]">
            {doorLocked ? t('commandCenter.doorLocked') : t('commandCenter.doorUnlocked')}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showToast && (
            <span className="text-[#10B981] font-mono text-[11px] animate-fadeUp">
              {t('commandCenter.doorCommandSent')}
            </span>
          )}
          <button
            onClick={() => onToggleDoor(room.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-[.14em] font-semibold transition-all duration-200 cursor-pointer border-0 text-white ${
              doorLocked
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[#10B981] hover:bg-[#059669]'
            }`}
          >
            {doorLocked ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="2" y="7" width="10" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.5 7V5a4.5 4.5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {t('commandCenter.unlockDoor')}
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <rect x="2" y="7" width="10" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {t('commandCenter.lockDoor')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function HealthAlertRow({ alert, t }) {
  const navigate = useNavigate()
  const [pingState, setPingState] = useState('idle')

  const handlePing = () => {
    if (pingState !== 'idle') return
    setPingState('pinging')
    setTimeout(() => setPingState('done'), 2000)
  }

  const cfg = {
    critical: {
      wrap: 'border-l-2 border-red-500/60',
      iconStyle: { backgroundColor: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171' },
      issueClass: 'text-red-400',
    },
    warning: {
      wrap: 'border-l-2 border-accent/50',
      iconStyle: { backgroundColor: 'rgba(71,85,105,0.06)', border: '1px solid rgba(71,85,105,0.08)', color: '#10B981' },
      issueClass: 'text-accent',
    },
    info: {
      wrap: '',
      iconStyle: { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' },
      issueClass: 'text-neutral-2',
    },
  }[alert.severity]

  return (
    <div className={`bg-bg-3/60 rounded-xl p-3.5 flex items-start gap-3 ${cfg.wrap}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={cfg.iconStyle}>
        {alert.severity === 'critical' && <FlameIcon />}
        {alert.severity === 'warning'  && <WifiOffIcon />}
        {alert.severity === 'info'     && <BatteryIcon />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-inter text-[13.5px] text-ink">{alert.device}</div>
        <div className={`font-inter text-[12px] mt-0.5 ${cfg.issueClass}`}>{alert.issueKey ? t(`commandCenter.${alert.issueKey}`) : alert.issue}</div>
        <div className="font-mono text-[11px] text-neutral mt-1">{alert.time}</div>
        {alert.severity === 'warning' && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handlePing}
              disabled={pingState === 'pinging'}
              className="px-2.5 py-1 rounded border border-accent/30 text-accent font-mono text-[11px] transition-colors hover:bg-accent/10 cursor-pointer bg-transparent disabled:opacity-60"
            >
              {pingState === 'idle'    ? t('commandCenter.pingDevice')    : ''}
              {pingState === 'pinging' ? `↻ ${t('commandCenter.pinging')}`   : ''}
              {pingState === 'done'    ? t('commandCenter.signalReceived') : ''}
            </button>
            <button
              onClick={() => navigate('/facility-ops-hub')}
              className="px-2.5 py-1 rounded border border-line text-neutral font-mono text-[11px] transition-colors hover:text-ink hover:border-neutral/40 cursor-pointer bg-transparent"
            >
              {t('commandCenter.createTicket')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function CommandCenter() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { t } = useI18n()
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      navigate('/login')
    }
  }

  const [search,   setSearch]   = useState('')
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [doorStates, setDoorStates] = useState({})
  const [doorToasts, setDoorToasts] = useState({})
  const [timers, setTimers] = useState({})
  const [liveRooms, setLiveRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [healthAlerts, setHealthAlerts] = useState([])
  const [loadingAlerts, setLoadingAlerts] = useState(true)
  const [upcomingCheckins, setUpcomingCheckins] = useState([])
  const [loadingUpcoming, setLoadingUpcoming] = useState(true)

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const id = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) next[key] -= 1
        })
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadPendingBookings() {
      setLoadingRequests(true)
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      if (!userId || cancelled) { setLoadingRequests(false); return }

      const [{ data: ownedOffices }, { data: operatedLinks }] = await Promise.all([
        supabase.from('offices').select('id, name').eq('owner_id', userId).is('deleted_at', null),
        supabase.from('operator_offices').select('office_id').eq('operator_id', userId).is('deleted_at', null),
      ])

      const officeNameMap = Object.fromEntries((ownedOffices ?? []).map((o) => [o.id, o.name]))
      const operatedIds = (operatedLinks ?? []).map((o) => o.office_id)

      if (operatedIds.length > 0) {
        const { data: extraOffices } = await supabase.from('offices').select('id, name').in('id', operatedIds).is('deleted_at', null)
        for (const o of extraOffices ?? []) officeNameMap[o.id] = o.name
      }

      const allOfficeIds = [...new Set([...Object.keys(officeNameMap), ...operatedIds])]
      if (allOfficeIds.length === 0 || cancelled) { setRequests([]); setLoadingRequests(false); return }

      const { data: bookings } = await supabase
        .from('bookings')
        .select('id, user_id, office_id, start_time, end_time, created_at')
        .in('office_id', allOfficeIds)
        .eq('status', 'PENDING_APPROVAL')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (!bookings?.length || cancelled) { setRequests([]); setLoadingRequests(false); return }

      const userIds = [...new Set(bookings.map((b) => b.user_id))]
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds)
      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name]))

      const mapped = bookings.map((b) => ({
        id: b.id,
        name: profileMap[b.user_id] || 'Guest',
        space: officeNameMap[b.office_id] || 'Workspace',
        time: `${fmtBookingTime(b.start_time)} – ${fmtBookingTime(b.end_time)}`,
        age: calcAge(b.created_at),
      }))

      if (!cancelled) { setRequests(mapped); setLoadingRequests(false) }
    }

    loadPendingBookings()

    const channel = supabase.channel('cmd-pending-bookings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, () => { if (!cancelled) loadPendingBookings() })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, () => { if (!cancelled) loadPendingBookings() })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  // Sync doorStates and timers when liveRooms loads
  useEffect(() => {
    if (liveRooms.length === 0) return
    setDoorStates((prev) => {
      const next = { ...prev }
      liveRooms.forEach((r) => { if (!(r.id in next)) next[r.id] = true })
      return next
    })
    setTimers(
      Object.fromEntries(
        liveRooms
          .filter((r) => r.remainingSecs != null && r.remainingSecs > 0)
          .map((r) => [r.id, Math.floor(r.remainingSecs)])
      )
    )
  }, [liveRooms])

  useEffect(() => {
    let cancelled = false

    async function loadFacilityData() {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      if (!userId || cancelled) {
        setLoadingRooms(false); setLoadingAlerts(false); setLoadingUpcoming(false); return
      }

      const [{ data: ownedOffices }, { data: operatedLinks }] = await Promise.all([
        supabase.from('offices').select('id, name').eq('owner_id', userId).is('deleted_at', null),
        supabase.from('operator_offices').select('office_id').eq('operator_id', userId).is('deleted_at', null),
      ])

      const officeNameMap = Object.fromEntries((ownedOffices ?? []).map((o) => [o.id, o.name]))
      const operatedIds = (operatedLinks ?? []).map((o) => o.office_id)
      if (operatedIds.length > 0) {
        const { data: extraOffices } = await supabase.from('offices').select('id, name').in('id', operatedIds).is('deleted_at', null)
        for (const o of extraOffices ?? []) officeNameMap[o.id] = o.name
      }

      const allOfficeIds = [...new Set(Object.keys(officeNameMap))]
      if (allOfficeIds.length === 0 || cancelled) {
        setLiveRooms([]); setLoadingRooms(false)
        setHealthAlerts([]); setLoadingAlerts(false)
        setUpcomingCheckins([]); setLoadingUpcoming(false)
        return
      }

      const now = new Date().toISOString()
      const [
        { data: checkedInBookings },
        { data: alertDevices },
        { data: upcomingBookings },
        { data: officesData },
      ] = await Promise.all([
        supabase.from('bookings').select('id, user_id, office_id, end_time').in('office_id', allOfficeIds).eq('status', 'CHECKED_IN').is('deleted_at', null),
        supabase.from('device_inventory_read_model').select('id, name, status, office_name, last_seen_at, updated_at').in('office_id', allOfficeIds).neq('status', 'ONLINE'),
        supabase.from('bookings').select('id, office_id, start_time').in('office_id', allOfficeIds).eq('status', 'CONFIRMED').gt('start_time', now).is('deleted_at', null).order('start_time', { ascending: true }).limit(5),
        supabase.from('offices').select('id, name').in('id', allOfficeIds).is('deleted_at', null).limit(20),
      ])

      if (cancelled) return

      // Build checked-in booking map by office
      const checkedInByOffice = {}
      for (const b of (checkedInBookings ?? [])) checkedInByOffice[b.office_id] = b

      // Fetch profiles for occupants
      const activeUserIds = [...new Set((checkedInBookings ?? []).map((b) => b.user_id))]
      let profileMap = {}
      if (activeUserIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', activeUserIds)
        profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name ?? 'Guest']))
      }

      if (cancelled) return

      const rooms = (officesData ?? []).map((office) => {
        const booking = checkedInByOffice[office.id]
        if (booking) {
          const remainingSecs = (new Date(booking.end_time) - Date.now()) / 1000
          const fullName = profileMap[booking.user_id] || 'Guest'
          const words = fullName.trim().split(/\s+/)
          const initials = ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase()
          return { id: office.id, name: office.name, type: 'Workspace', capacity: null, status: 'active', occupant: fullName, initials, avatar: null, remainingSecs, icon: 'building' }
        }
        return { id: office.id, name: office.name, type: 'Workspace', capacity: null, status: 'vacant', occupant: null, initials: null, avatar: null, remainingSecs: null, icon: 'building' }
      })
      if (!cancelled) { setLiveRooms(rooms); setLoadingRooms(false) }

      const alerts = (alertDevices ?? []).map((d) => ({
        id: d.id,
        device: `${d.name} (${d.office_name})`,
        issue: d.status === 'ERROR' ? 'Error Detected' : d.status === 'OFFLINE' ? 'Device Offline' : 'Under Maintenance',
        issueKey: d.status === 'ERROR' ? 'errorDetected' : d.status === 'OFFLINE' ? 'deviceOffline' : 'underMaintenance',
        severity: d.status === 'ERROR' ? 'critical' : d.status === 'OFFLINE' ? 'warning' : 'info',
        time: relTime(d.last_seen_at || d.updated_at),
      }))
      if (!cancelled) { setHealthAlerts(alerts); setLoadingAlerts(false) }

      const upcoming = (upcomingBookings ?? []).map((b) => ({
        time: new Date(b.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }),
        name: officeNameMap[b.office_id] || 'Workspace',
      }))
      if (!cancelled) { setUpcomingCheckins(upcoming); setLoadingUpcoming(false) }
    }

    loadFacilityData()

    const channel = supabase.channel('cmd-facility-data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => { if (!cancelled) loadFacilityData() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'device_inventory_read_model' }, () => { if (!cancelled) loadFacilityData() })
      .subscribe()

    return () => { cancelled = true; supabase.removeChannel(channel) }
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleApprove = async (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    try { await approveBooking({ bookingId: id }) } catch { /* realtime will sync */ }
  }

  const handleReject = async (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    try { await rejectBooking({ bookingId: id }) } catch { /* realtime will sync */ }
  }

  const toggleDoor = (id) => {
    setDoorStates((prev) => ({ ...prev, [id]: !prev[id] }))
    setDoorToasts((prev) => ({ ...prev, [id]: true }))
    setTimeout(() => setDoorToasts((prev) => ({ ...prev, [id]: false })), 2000)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg flex flex-col font-inter">

      {/* ── Header ── */}
      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
        <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full flex items-center px-3 gap-2">
          <span className="text-neutral shrink-0 pointer-events-none"><SearchIcon /></span>
          <input
            type="text"
            placeholder={t('commandCenter.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none font-inter text-[13px] text-ink placeholder:text-neutral py-1.5"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher compact />
          <button aria-label={t('common.notifications')}
            className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0 relative">
            <BellIcon />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>
          <button aria-label={t('common.help')}
            className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0">
            <HelpCircleIcon />
          </button>
          <div className="pl-3 border-l border-line ml-1">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-line">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80"
                alt="Admin avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar ── */}
        <aside className="app-sidebar hidden md:flex flex-col w-[200px] shrink-0 bg-bg-2 border-r border-line">
          <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto" aria-label="Main navigation">
            {NAV_GROUPS[0].items.map((rawItem) => {
              const item = translateNavItem(rawItem, t)
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent border-0 text-left border-l-[3px] ${
                    isActive
                      ? 'border-accent bg-bg-3 text-ink'
                      : 'border-transparent text-neutral-2 hover:bg-bg-3 hover:text-ink'
                  }`}
                >
                  <span className={isActive ? 'text-accent' : 'text-neutral'}>
                    <NavIcon type={item.icon} />
                  </span>
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="flex flex-col gap-0.5 p-3 border-t border-line shrink-0">
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left">
              <LogoutIcon /> {t('common.signOut')}
            </button>
          </div>
        </aside>

        {/* ── Content column ── */}
        <div className="flex flex-col flex-1 min-w-0">

        {/* Real-time Status Banner */}
        <div className="h-8 px-6 border-b border-line flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-[#10B981]">{t('commandCenter.systemLive')}</span>
          <span className="text-neutral font-mono text-[11px]">·</span>
          <span className="font-mono text-[11px] text-neutral">{t('commandCenter.connected')}</span>
          <span className="ml-auto font-mono text-[11px] text-neutral">{liveRooms.length + healthAlerts.length} {t('commandCenter.eventsLoaded')}</span>
        </div>

        {/* ── Main ── */}
        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8 min-w-0">
          <div className="grid md:grid-cols-[1fr_300px] gap-6 items-start">

            <div className="flex flex-col gap-6">

              {/* Immediate Actions */}
              <section aria-label="Immediate Actions" className="animate-fadeUp" style={{ '--delay': '0ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-inter text-[20px] font-bold text-accent leading-none">!</span>
                  <h2 className="font-inter text-[16px] font-semibold text-ink">{t('commandCenter.immediateActions')}</h2>
                </div>
                {loadingRequests ? (
                  <div className="bg-bg-2 border border-line rounded-xl shadow-card p-8 text-center">
                    <p className="font-inter text-[13.5px] text-neutral">{t('commandCenter.loadingRequests')}</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="bg-bg-2 border border-line rounded-xl shadow-card p-8 text-center">
                    <p className="font-inter text-[13.5px] text-neutral">{t('commandCenter.noPendingRequests')}</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {requests.map((req) => (
                      <BookingCard key={req.id} request={req}
                        onApprove={handleApprove} onReject={handleReject} t={t} />
                    ))}
                  </div>
                )}
              </section>

              {/* Live Facility Status */}
              <section aria-label="Live Facility Status" className="animate-fadeUp" style={{ '--delay': '80ms' }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-accent"><GridSquaresIcon /></span>
                    <h2 className="font-inter text-[16px] font-semibold text-ink">{t('commandCenter.liveFacilityStatus')}</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10B981' }} />
                      <span className="font-inter text-[12px] text-neutral-2">{t('commandCenter.active')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-neutral" />
                      <span className="font-inter text-[12px] text-neutral-2">{t('commandCenter.vacant')}</span>
                    </div>
                  </div>
                </div>
                {loadingRooms ? (
                  <div className="bg-bg-2 border border-line rounded-xl shadow-card p-8 text-center">
                    <p className="font-inter text-[13.5px] text-neutral">{t('commandCenter.loadingFacility')}</p>
                  </div>
                ) : liveRooms.length === 0 ? (
                  <div className="bg-bg-2 border border-line rounded-xl shadow-card p-8 text-center">
                    <p className="font-inter text-[13.5px] text-neutral">{t('commandCenter.noSpaces')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {liveRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        doorLocked={doorStates[room.id] ?? true}
                        onToggleDoor={toggleDoor}
                        remainingSecs={timers[room.id] ?? 0}
                        showToast={!!doorToasts[room.id]}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </section>

            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4 animate-fadeUp" style={{ '--delay': '120ms' }}>

              <GlobalCommandPanel t={t} />

              {/* System Health */}
              <section aria-label="System Health" className="bg-bg-2 border border-line rounded-2xl shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-accent"><WarningIcon /></span>
                  <h2 className="font-inter text-[16px] font-semibold text-ink">{t('commandCenter.systemHealth')}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {loadingAlerts ? (
                    <p className="font-inter text-[13px] text-neutral text-center py-2">{t('common.loading')}</p>
                  ) : healthAlerts.length === 0 ? (
                    <p className="font-inter text-[13px] text-neutral text-center py-2">{t('commandCenter.allSystemsOnline')}</p>
                  ) : (
                    healthAlerts.map((alert) => (
                      <HealthAlertRow key={alert.id} alert={alert} t={t} />
                    ))
                  )}
                </div>
              </section>

              {/* Upcoming Checks */}
              <section aria-label="Upcoming Checks" className="bg-bg-2 border border-line rounded-2xl shadow-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-accent"><CalendarIcon /></span>
                  <h2 className="font-inter text-[16px] font-semibold text-ink">{t('commandCenter.upcomingChecks')}</h2>
                </div>
                <div className="flex flex-col divide-y divide-line">
                  {loadingUpcoming ? (
                    <p className="font-inter text-[13px] text-neutral text-center py-2">{t('common.loading')}</p>
                  ) : upcomingCheckins.length === 0 ? (
                    <p className="font-inter text-[13px] text-neutral text-center py-2">{t('commandCenter.noUpcomingCheckins')}</p>
                  ) : (
                    upcomingCheckins.map((check) => (
                      <button
                        key={check.time + check.name}
                        className="flex items-center gap-4 py-3.5 w-full text-left hover:bg-ink/[.04] transition-colors duration-150 cursor-pointer bg-transparent border-0 rounded-lg px-1"
                      >
                        <span className="font-mono text-[11px] text-accent w-10 shrink-0">{check.time}</span>
                        <span className="font-inter text-[13.5px] text-ink-2 flex-1">{check.name}</span>
                        <span className="text-neutral-2 shrink-0"><ChevronRightIcon /></span>
                      </button>
                    ))
                  )}
                </div>
              </section>

            </div>
          </div>
        </main>
        </div>{/* end content column */}
      </div>
    </div>
  )
}
