import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { approveBooking, rejectBooking, FlexiApiError } from '../lib/flexispaceApi'
import BrandLogo from '../components/BrandLogo'
import { useI18n } from '../i18n'
import { translateNavGroup } from '../components/navigation'

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


function CalendarIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v2M11 1.5v2M1.5 6.5h13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 9.5h2M9 9.5h2M5 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function BuildingSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3.5" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 9v5.5M10 9v5.5M2 9h12" stroke="currentColor" strokeWidth="1.2" />
      <rect x="6.5" y="3.5" width="3" height="3" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6.5a8 8 0 0 1 12 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4.5 9a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 11.5a2 2 0 0 1 2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
    </svg>
  )
}


function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 14H3a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 3 2h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2a6 6 0 0 0-6 6v3.5L2.5 14h15L16 11.5V8a6 6 0 0 0-6-6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 8a2 2 0 0 1 4 0c0 1.5-2 2-2 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
    </svg>
  )
}

function HourglassIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3h10M5 17h10M6 3v2l4 5-4 5v2M14 3v2l-4 5 4 5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CashIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 8h2M16 8h2M2 12h2M16 12h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function XCircleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function TrendUpIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M1.5 9.5l4-5 2.5 2.5L11 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 3h2.5v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MonitorSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="1.5" width="12" height="8.5" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4 12.5h6M7 10v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4.5" y="1" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2 6.5a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M7 11.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 3.5v3l2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7l3.5 3.5L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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


function CardBadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 8h4M4 10.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function LineChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 12L5.5 7.5l3 2.5L13 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BuildingNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 2.5v12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 6.5h1.5M9.5 6.5h1.5M4.5 10h1.5M9.5 10h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function LayoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 6.5v8" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function NavNetworkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="1.8" fill="currentColor" />
      <circle cx="2.5" cy="8" r="1.3" fill="currentColor" />
      <circle cx="13.5" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="2.5" r="1.3" fill="currentColor" />
      <circle cx="8" cy="13.5" r="1.3" fill="currentColor" />
      <path d="M4 8h2.2M9.8 8h2M8 3.8v2.2M8 10v2.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 1.5h10v13l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5V1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function QuestionCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 6.5a1.5 1.5 0 0 1 3 0c0 1.5-1.5 1.5-1.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.8" fill="currentColor" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4.5 1.5h2l1 3-1.5 1a7 7 0 0 0 2.5 2.5l1-1.5 3 1v2c0 .8-.7 1.5-1.5 1.5A10 10 0 0 1 1.5 3C1.5 2.2 2.2 1.5 3 1.5h1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="11" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 4.5l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const TABS = ['All', 'Pending', 'Confirmed', 'Completed']

const PENDING_STATUSES = new Set(['PENDING_APPROVAL'])
const CONFIRMED_STATUSES = new Set(['APPROVED', 'PAYMENT_PENDING', 'CONFIRMED', 'CHECKED_IN', 'OVERSTAY'])
const COMPLETED_STATUSES = new Set(['CHECKED_OUT', 'COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'NO_SHOW', 'REFUNDED'])
const AVATAR_STYLES = [
  { bg: 'rgba(16,185,129,.2)', color: '#10B981' },
  { bg: 'rgba(96,165,250,.15)', color: '#60a5fa' },
  { bg: 'rgba(167,139,250,.15)', color: '#a78bfa' },
]

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'GU'
}

function formatDateLabel(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Scheduled'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimeLabel(startValue, endValue) {
  const start = new Date(startValue)
  const end = new Date(endValue)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '00:00 - 00:00'
  const options = { hour: '2-digit', minute: '2-digit', hour12: false }
  return `${start.toLocaleTimeString(undefined, options)} - ${end.toLocaleTimeString(undefined, options)}`
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

function formatWaitTime(createdAt) {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null
  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h`
}

function mapBookingStatus(status) {
  if (PENDING_STATUSES.has(status)) return 'pending'
  if (CONFIRMED_STATUSES.has(status)) return 'confirmed'
  if (COMPLETED_STATUSES.has(status)) return 'completed'
  return 'pending'
}

function mapPaymentStatus(payment) {
  return payment?.status === 'SUCCEEDED' ? 'paid' : 'pending'
}

function mapBookingRow(row, office, payment, profile, index) {
  const status = mapBookingStatus(row.status)
  const avatarStyle = AVATAR_STYLES[index % AVATAR_STYLES.length]
  const clientName = profile?.full_name || 'Guest User'

  return {
    rawId: row.id,
    rawOfficeId: row.office_id,
    id: `#BK-${String(row.id).slice(0, 8).toUpperCase()}`,
    dotColor: status === 'pending' ? 'accent' : 'blue',
    client: {
      name: clientName,
      company: 'Client',
      initials: getInitials(clientName),
      ...avatarStyle,
    },
    space: {
      name: office?.name || 'Workspace',
      icon: 'building',
      floor: [office?.building, office?.floor, office?.room].filter(Boolean).join(', ') || 'FlexiSpace Network',
      capacity: office?.capacity || 1,
    },
    date: formatDateLabel(row.start_time),
    time: formatTimeLabel(row.start_time, row.end_time),
    payment: mapPaymentStatus(payment),
    status,
    rawStatus: row.status,
    waitTime: status === 'pending' ? formatWaitTime(row.created_at) : null,
    isToday: isSameLocalDay(row.start_time),
    phone: 'Not available',
    email: profile?.email || 'Not available',
    notes: row.cancellation_reason || '',
    iot: { inRange: false, doorLocked: true },
  }
}

const NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    mobileIcon: 'grid',
    mobilePath: '/owner-dashboard',
    items: [
      { label: 'Dashboard', path: '/owner-dashboard', icon: 'grid' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    mobileIcon: 'calendar',
    mobilePath: '/workspace-ops',
    items: [
      { label: 'Live Operations', path: '/workspace-ops', icon: 'layout' },
      { label: "Today's Bookings", path: '/todays-bookings', icon: 'today' },
      { label: 'Bookings Command', path: '/bookings-command-center', icon: 'calendar' },
    ],
  },
  {
    id: 'spaceAssets',
    label: 'Space Assets',
    mobileIcon: 'building',
    mobilePath: '/asset-command',
    items: [
      { label: 'Asset Management', path: '/asset-command', icon: 'building' },
      { label: 'Maintenance Hub', path: '/facility-ops-hub', icon: 'wrench' },
    ],
  },
  {
    id: 'iot',
    label: 'IoT Infrastructure',
    mobileIcon: 'network',
    mobilePath: '/node-manager',
    items: [
      { label: 'IoT Nodes', path: '/node-manager', icon: 'network' },
      { label: 'Access Control', path: '/access-logs', icon: 'badge' },
    ],
  },
  {
    id: 'financials',
    label: 'Financials',
    mobileIcon: 'receipt',
    mobilePath: '/billing',
    items: [
      { label: 'Financial Reports', path: '/billing', icon: 'receipt' },
    ],
  },
  {
    id: 'members', label: 'Members', mobileIcon: 'users', mobilePath: '/admin/users',
    items: [{ label: 'User Management', path: '/admin/users', icon: 'users' }],
  },
]

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

function NavIcon({ type }) {
  if (type === 'grid') return <GridSquaresIcon />
  if (type === 'wifi') return <WifiIcon />
  if (type === 'badge') return <CardBadgeIcon />
  if (type === 'chart') return <LineChartIcon />
  if (type === 'building') return <BuildingNavIcon />
  if (type === 'layout') return <LayoutIcon />
  if (type === 'network') return <NavNetworkIcon />
  if (type === 'calendar') return <CalendarIcon />
  if (type === 'receipt') return <ReceiptIcon />
  if (type === 'today') return <NavTodayIcon />
  if (type === 'wrench') return <NavWrenchIcon />
  if (type === 'users') return <UsersNavIcon />
  return null
}

function SpaceIcon({ type }) {
  if (type === 'building') return <BuildingSmallIcon />
  if (type === 'monitor') return <MonitorSmallIcon />
  if (type === 'podcast') return <MicIcon />
  return null
}

function ClientAvatar({ client }) {
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-inter text-[11px] font-bold"
      style={{ backgroundColor: client.bg, color: client.color }}
    >
      {client.initials}
    </div>
  )
}

function PaymentBadge({ type }) {
  const { t } = useI18n()
  if (type === 'paid') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] uppercase tracking-[.14em]"
        style={{ backgroundColor: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', color: '#10B981' }}
      >
        <CheckCircleIcon />
        {t('bookingsCommand.paid')}
      </div>
    )
  }
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] uppercase tracking-[.14em]"
      style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)', color: '#F59E0B' }}
    >
      <HourglassIcon size={13} />
      {t('bookingsCommand.pendingTab')}
    </div>
  )
}

function BookingRow({ booking, onApprove, onReject, onOpenDrawer, isLast, selected, onToggleSelect, actionInFlight }) {
  const { t } = useI18n()
  const dotStyle = booking.dotColor === 'accent'
    ? { backgroundColor: '#10B981' }
    : { backgroundColor: '#60a5fa' }
  const statusLabel = booking.status === 'completed' ? t('bookingsCommand.completed') : t('bookingsCommand.confirmed')

  return (
    <tr className={`transition-colors duration-150 hover:bg-ink/[.025] ${!isLast ? 'border-b border-line' : ''}`}>
      <td className="px-4 py-5 w-10">
        {booking.status === 'pending' ? (
          <button
            role="checkbox"
            aria-checked={selected}
            aria-label={`Select booking ${booking.id}`}
            onClick={onToggleSelect}
            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-150 cursor-pointer focus:ring-2 focus:ring-accent/40 ${
              selected
                ? 'bg-accent border-accent'
                : 'bg-transparent border-line hover:border-accent/50'
            }`}
          >
            {selected && <CheckSmallIcon />}
          </button>
        ) : (
          <div className="w-4 h-4" />
        )}
      </td>
      <td className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={dotStyle} />
          <button
            aria-label={`View details for booking ${booking.id}`}
            onClick={() => onOpenDrawer(booking)}
            className="font-inter text-[13px] text-accent hover:underline underline-offset-2 cursor-pointer bg-transparent border-0 p-0 focus:ring-2 focus:ring-accent/40"
          >
            {booking.id}
          </button>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center gap-3">
          <ClientAvatar client={booking.client} />
          <div>
            <div className="font-inter text-[13px] font-medium text-ink">{booking.client.name}</div>
            <div className="font-inter text-[11px] text-neutral-2 mt-0.5">{booking.client.company}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center gap-2 text-neutral-2">
          <SpaceIcon type={booking.space.icon} />
          <span className="font-inter text-[13px] text-ink-2">{booking.space.name}</span>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="font-inter text-[13px] text-ink-2">{booking.date}</div>
        <div className="font-mono text-[11px] text-neutral mt-0.5">{booking.time}</div>
      </td>
      <td className="px-4 py-5">
        <PaymentBadge type={booking.payment} />
      </td>
      <td className="px-5 py-5">
        {booking.status === 'pending' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              aria-label={`Approve booking ${booking.id}`}
              onClick={() => onApprove(booking.rawId, booking.id)}
              disabled={actionInFlight?.has(booking.id)}
              className="inline-flex items-center px-3.5 py-2 rounded-full bg-accent text-white font-inter text-[13px] font-medium transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0 focus:ring-2 focus:ring-accent/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionInFlight?.has(booking.id) ? '...' : t('common.approve')}
            </button>
            <button
              aria-label={`Reject booking ${booking.id}`}
              onClick={() => onReject(booking.rawId, booking.id)}
              disabled={actionInFlight?.has(booking.id)}
              className="inline-flex items-center px-3.5 py-2 rounded-full bg-transparent border border-line text-ink-2 font-inter text-[13px] font-medium transition-all duration-200 hover:bg-ink/[.06] cursor-pointer focus:ring-2 focus:ring-accent/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {t('common.reject')}
            </button>
            {booking.waitTime && (
              <div className="flex items-center gap-1 text-neutral">
                <ClockIcon />
                <span className="font-inter text-[11px]">{t('bookingsCommand.wait', { time: booking.waitTime })}</span>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5" style={{ color: '#10B981' }}>
              <CheckSmallIcon />
              <span className="font-inter text-[13px] font-medium">{statusLabel}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${booking.iot.inRange ? 'bg-accent' : 'bg-neutral'}`} />
              <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">
                {booking.iot.inRange
                  ? t('bookingsCommand.inRange')
                  : booking.iot.doorLocked
                    ? t('bookingsCommand.locked')
                    : t('bookingsCommand.awaiting')}
              </span>
            </div>
          </div>
        )}
      </td>
    </tr>
  )
}

function BookingDrawer({ booking, onClose, onApprove, onReject }) {
  const { t } = useI18n()
  return (
    <>
      <div
        className="fixed inset-0 bg-bg/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Booking details"
        className="fixed right-0 top-0 bottom-0 z-50 w-[420px] bg-bg-2 border-l border-line flex flex-col animate-fadeUp overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-line shrink-0">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-0.5">
              {t('bookingsCommand.bookingDetails')}
            </p>
            <h2 className="font-inter text-[16px] font-semibold text-ink">{booking.id}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking details"
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink hover:bg-bg-3 transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 border-b border-line">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-3">{t('bookingsCommand.client')}</p>
          <div className="flex items-center gap-3 mb-4">
            <ClientAvatar client={booking.client} />
            <div>
              <p className="font-inter text-[13px] font-semibold text-ink">{booking.client.name}</p>
              <p className="font-inter text-[13px] text-neutral-2">{booking.client.company}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-neutral-2">
              <PhoneIcon />
              <span className="font-inter text-[13px]">{booking.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-2">
              <MailIcon />
              <span className="font-inter text-[13px]">{booking.email}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-line">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-3">{t('bookingsCommand.bookingInfo')}</p>
          <div className="flex flex-col gap-3">
            {[
              [t('bookingsCommand.space'), booking.space.name],
              [t('bookingsCommand.floor'), booking.space.floor],
              [t('bookingsCommand.capacity'), t('bookingsCommand.people', { count: booking.space.capacity })],
              [t('bookingsCommand.date'), booking.date],
              [t('bookingsCommand.time'), booking.time],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{label}</span>
                <span className="font-inter text-[13px] text-ink">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="font-inter text-[11px] font-medium text-neutral-2">{t('bookingsCommand.payment')}</span>
              <PaymentBadge type={booking.payment} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-b border-line">
          <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-3">{t('bookingsCommand.iotStatus')}</p>
          <div className="flex items-center justify-between">
            <span className="font-inter text-[13px] text-neutral-2">{t('bookingsCommand.clientProximity')}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${booking.iot.inRange ? 'bg-accent' : 'bg-neutral'}`} />
              <span className={`font-inter text-[11px] font-medium ${booking.iot.inRange ? 'accent' : 'text-neutral'}`}>
                {booking.iot.inRange ? t('bookingsCommand.inRange') : t('bookingsCommand.notDetected')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-inter text-[13px] text-neutral-2">{t('bookingsCommand.doorStatus')}</span>
            <span className="font-inter text-[11px] font-medium text-neutral-2">
              {booking.iot.doorLocked ? t('bookingsCommand.locked') : t('bookingsCommand.unlocked')}
            </span>
          </div>
        </div>

        {booking.notes && (
          <div className="px-6 py-5 border-b border-line">
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-2">
              {t('bookingsCommand.clientNotes')}
            </p>
            <p className="font-inter text-[13px] text-ink-2 leading-relaxed">{booking.notes}</p>
          </div>
        )}

        {booking.status === 'pending' && (
          <div className="px-6 py-5 mt-auto border-t border-line flex items-center gap-3 shrink-0">
            <button
              aria-label={`Approve booking ${booking.id}`}
              onClick={() => { onApprove(booking.rawId, booking.id); onClose() }}
              className="flex-1 bg-accent text-white rounded-full font-inter text-[13px] font-medium px-[18px] py-[11px] hover:bg-accent-2 transition-all duration-200 border-0 cursor-pointer focus:ring-2 focus:ring-accent/40"
            >
              {t('common.approve')}
            </button>
            <button
              aria-label={`Reject booking ${booking.id}`}
              onClick={() => { onReject(booking.rawId, booking.id); onClose() }}
              className="flex-1 border border-line text-neutral-2 rounded-full font-inter text-[13px] px-[18px] py-[11px] hover:text-ink hover:bg-ink/[.06] transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-accent/40"
            >
              {t('common.reject')}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

export default function BookingsCommandCenter() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const officeFilter = searchParams.get('office')
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      navigate('/login')
    }
  }
  const isActive = (path) => location.pathname === path
  const isGroupActive = (group) => group.items.some((i) => isActive(i.path))

  const [openGroups, setOpenGroups] = useState(() => {
    const result = {}
    NAV_GROUPS.forEach((g) => {
      if (g.items.some((i) => i.path === location.pathname)) result[g.id] = true
    })
    return Object.keys(result).length > 0 ? result : { operations: true }
  })
  const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [bookings, setBookings] = useState([])
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const cancelledCount = bookings.filter((b) => b.rawStatus === 'CANCELLED').length
  const [page, setPage] = useState(1)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [todayRevenueCents, setTodayRevenueCents] = useState(null)
  const [bookingLoadError, setBookingLoadError] = useState(false)
  const [actionInFlight, setActionInFlight] = useState(new Set())
  const [actionError, setActionError] = useState('')

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [drawerBooking, setDrawerBooking] = useState(null)
  const [tableSearch, setTableSearch] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)

  const loadBookings = useCallback(async (signal) => {
    setLoadingBookings(true)
    setBookingLoadError(false)

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId) { setBookings([]); setLoadingBookings(false); return }

    const { data: myOffices } = await supabase
      .from('offices')
      .select('id')
      .eq('owner_id', userId)
      .is('deleted_at', null)
    const ownerOfficeIds = (myOffices ?? []).map((o) => o.id)
    if (ownerOfficeIds.length === 0) { setBookings([]); setLoadingBookings(false); return }

    const { data: bookingRows, error: bookingError } = await supabase
      .from('bookings')
      .select('id,user_id,office_id,status,start_time,end_time,amount_cents,currency,created_at,cancellation_reason')
      .in('office_id', ownerOfficeIds)
      .order('start_time', { ascending: true })
      .abortSignal(signal)

    if (bookingError?.message?.includes('AbortError') || bookingError?.name === 'AbortError') return

    if (bookingError || !bookingRows?.length) {
      setBookings([])
      setBookingLoadError(!!bookingError)
      setLoadingBookings(false)
      return
    }

    const officeIds = [...new Set(bookingRows.map((b) => b.office_id).filter(Boolean))]
    const bookingIds = bookingRows.map((b) => b.id)
    const userIds = [...new Set(bookingRows.map((b) => b.user_id).filter(Boolean))]

    const officeRequest = officeIds.length > 0
      ? supabase.from('offices').select('id,name,building,floor,room,capacity').in('id', officeIds)
      : Promise.resolve({ data: [], error: null })
    const paymentRequest = bookingIds.length > 0
      ? supabase.from('payments').select('booking_id,status,created_at').in('booking_id', bookingIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null })
    const profileRequest = userIds.length > 0
      ? supabase.from('profiles').select('id,email,full_name').in('id', userIds)
      : Promise.resolve({ data: [], error: null })

    const [officeResult, paymentResult, profileResult] = await Promise.all([
      officeRequest,
      paymentRequest,
      profileRequest,
    ])

    if (officeResult.error || paymentResult.error) {
      setBookings([])
      setBookingLoadError(true)
      setLoadingBookings(false)
      return
    }

    const officesById = Object.fromEntries((officeResult.data ?? []).map((o) => [o.id, o]))
    const profilesById = profileResult.error
      ? {}
      : Object.fromEntries((profileResult.data ?? []).map((p) => [p.id, p]))
    const paymentsByBookingId = {}
    for (const payment of paymentResult.data ?? []) {
      if (!paymentsByBookingId[payment.booking_id]) {
        paymentsByBookingId[payment.booking_id] = payment
      }
    }

    const mapped = bookingRows.map((booking, index) =>
      mapBookingRow(
        booking,
        officesById[booking.office_id],
        paymentsByBookingId[booking.id],
        profilesById[booking.user_id],
        index
      )
    )

    setBookings(mapped)
    setSelectedIds(new Set())
    setPage(1)
    const todayStart = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z'
    const { data: todayPayments } = await supabase
      .from('payments')
      .select('amount_cents')
      .eq('status', 'SUCCEEDED')
      .gte('created_at', todayStart)
    const total = (todayPayments ?? []).reduce(
      (sum, p) => sum + (p.amount_cents ?? 0), 0
    )
    setTodayRevenueCents(total)
    setLoadingBookings(false)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function init() { await loadBookings(controller.signal) }
    init()
    return () => controller.abort()
  }, [loadBookings])

  const handleApprove = async (rawId, displayId) => {
    setActionInFlight((prev) => new Set([...prev, displayId]))
    setActionError('')
    try {
      await approveBooking({ bookingId: rawId })
      await loadBookings()
      setDrawerBooking(null)
    } catch (err) {
      setActionError(err instanceof FlexiApiError ? err.message : t('bookingsCommand.failedApprove'))
    } finally {
      setActionInFlight((prev) => { const next = new Set(prev); next.delete(displayId); return next })
    }
  }

  const handleReject = async (rawId, displayId) => {
    setActionInFlight((prev) => new Set([...prev, displayId]))
    setActionError('')
    try {
      await rejectBooking({ bookingId: rawId, reason: 'Rejected from command center' })
      await loadBookings()
      setDrawerBooking(null)
    } catch (err) {
      setActionError(err instanceof FlexiApiError ? err.message : t('bookingsCommand.failedReject'))
    } finally {
      setActionInFlight((prev) => { const next = new Set(prev); next.delete(displayId); return next })
    }
  }

  const filtered = bookings.filter((b) => {
    if (officeFilter && b.rawOfficeId !== officeFilter) return false
    if (activeTab === 'Pending' && b.status !== 'pending') return false
    if (activeTab === 'Confirmed' && b.status !== 'confirmed') return false
    if (activeTab === 'Completed' && b.status !== 'completed') return false
    if (todayOnly && !b.isToday) return false
    if (tableSearch) {
      const q = tableSearch.toLowerCase()
      return (
        b.id.toLowerCase().includes(q) ||
        b.client.name.toLowerCase().includes(q) ||
        b.space.name.toLowerCase().includes(q)
      )
    }
    return true
  })

  const ITEMS_PER_PAGE = 20
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const pagedBookings = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const selectableIds = filtered.filter((b) => b.status === 'pending').map((b) => b.id)
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id))

  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(selectableIds))

  const handleApproveSelected = async () => {
    const targets = bookings.filter((b) => selectedIds.has(b.id) && b.status === 'pending')
    setActionError('')
    for (const b of targets) {
      try {
        await approveBooking({ bookingId: b.rawId })
      } catch {
        // continue with remaining even if one fails
      }
    }
    setSelectedIds(new Set())
    await loadBookings()
  }

  const handleRejectSelected = async () => {
    const targets = bookings.filter((b) => selectedIds.has(b.id) && b.status === 'pending')
    setActionError('')
    for (const b of targets) {
      try {
        await rejectBooking({ bookingId: b.rawId, reason: 'Rejected from command center' })
      } catch {
        // continue with remaining even if one fails
      }
    }
    setSelectedIds(new Set())
    await loadBookings()
  }

  return (
    <>
      <div className="min-h-screen bg-bg flex flex-col">
        <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-6">
          <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
          <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder={t('bookingsCommand.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('bookingsCommand.searchPlaceholder')}
              className="w-full bg-transparent border-0 outline-none pl-11 pr-4 py-2.5 text-ink font-inter text-[13px] placeholder:text-neutral"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button aria-label="Notifications" className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
              <BellIcon />
            </button>
            <button aria-label="Help" className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
              <HelpIcon />
            </button>
            <div className="pl-3 border-l border-line ml-1">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-line">
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className="app-sidebar hidden md:flex flex-col w-[200px] bg-bg-2 border-r border-line">
            <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Owner portal navigation">
              {NAV_GROUPS.map((group) => {
                const tGroup = translateNavGroup(group, t)
                const isOpen = openGroups[group.id] ?? false
                const groupActive = isGroupActive(group)
                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={isOpen}
                      aria-label={`${tGroup.label} section`}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-[.14em] transition-colors duration-150 cursor-pointer bg-transparent border-0 ${
                        groupActive ? 'text-accent' : 'text-neutral hover:text-neutral-2'
                      }`}
                    >
                      {tGroup.label}
                      <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDownIcon />
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col gap-0.5 pb-1">
                        {tGroup.items.map((item) => (
                          <button
                            key={item.path}
                            aria-label={item.label}
                            aria-current={isActive(item.path) ? 'page' : undefined}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] transition-all duration-200 cursor-pointer border-0 text-left w-full ${
                              isActive(item.path)
                                ? 'bg-accent/[.09] border-l-2 border-l-accent text-accent'
                                : 'border-l-2 border-l-transparent text-neutral-2 hover:bg-bg-3 hover:text-ink'
                            }`}
                          >
                            <span aria-hidden="true" className={isActive(item.path) ? 'text-accent' : 'text-neutral'}>
                              <NavIcon type={item.icon} />
                            </span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </nav>
            <div className="p-3 border-t border-line flex flex-col gap-1 shrink-0">
              <button
                aria-label={t('common.support')}
                onClick={() => navigate('/support')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full focus:ring-2 focus:ring-accent/40"
              >
                <QuestionCircleIcon />
                {t('common.support')}
              </button>
              <button
                aria-label={t('common.signOut')}
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full focus:ring-2 focus:ring-accent/40"
              >
                <LogoutIcon />
                {t('common.signOut')}
              </button>
            </div>
          </aside>

          <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8">
            <div className="animate-fadeUp" style={{ '--delay': '0ms' }}>
              {/* Page Header */}
              <div className="pt-8 pb-6 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-1.5">{t('bookingsCommand.section')}</p>
                  <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('bookingsCommand.title')}</h1>
                  <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('bookingsCommand.subtitle')}</p>
                </div>
                {officeFilter && (
                  <button
                    onClick={() => navigate('/bookings-command-center')}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-accent/[.09] border border-accent/30 font-inter text-[13px] text-accent hover:bg-accent/[.14] transition-all duration-200 cursor-pointer mt-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                    {t('bookingsCommand.filteredByOffice')}
                  </button>
                )}
              </div>
              <div role="tablist" aria-label="Booking status filter" className="flex items-center bg-bg-2 border border-line rounded-xl shadow-card p-1 gap-0.5 w-fit mb-6">
                {TABS.map((tab) => {
                  const tabLabel = tab === 'All' ? t('bookingsCommand.all') : tab === 'Pending' ? t('bookingsCommand.pendingTab') : tab === 'Confirmed' ? t('bookingsCommand.confirmed') : t('bookingsCommand.completed')
                  return (
                  <button
                    key={tab}
                    id={`bcc-tab-${tab.toLowerCase()}`}
                    role="tab"
                    aria-selected={activeTab === tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg font-inter text-[13px] font-medium transition-all duration-200 cursor-pointer border-0 focus:ring-2 focus:ring-accent/40 ${
                      activeTab === tab
                        ? 'bg-bg-3 text-ink'
                        : 'bg-transparent text-neutral-2 hover:text-ink'
                    }`}
                  >
                    {tabLabel}
                  </button>
                  )
                })}
              </div>

              {(loadingBookings || bookingLoadError) && (
                <div className="mb-6 animate-fadeUp" style={{ animationDelay: '20ms' }}>
                  <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">
                    {loadingBookings ? t('bookingsCommand.loading') : t('bookingsCommand.fallback')}
                  </p>
                </div>
              )}

              {actionError && (
                <div role="alert" className="mb-4 rounded-xl border border-critical/25 bg-critical/[.08] px-4 py-3 animate-fadeUp">
                  <p className="font-inter text-[13px] text-critical">{actionError}</p>
                </div>
              )}

              <div role="tabpanel" id={`bcc-panel-${activeTab.toLowerCase()}`} aria-labelledby={`bcc-tab-${activeTab.toLowerCase()}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fadeUp" style={{ animationDelay: '40ms' }}>
                <div className="bg-bg-2 border border-line rounded-xl shadow-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.activeBookings')}</span>
                    <div className="w-8 h-8 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2">
                      <CalendarIcon size={16} />
                    </div>
                  </div>
                  <div className="flex items-end gap-3 mb-3">
                    <span className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none">{bookings.length}</span>
                    <div className="flex items-center gap-1 mb-1" style={{ color: '#10B981' }}>
                      <TrendUpIcon />
                      <span className="font-inter text-[11px] font-normal opacity-75">+12%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="h-1 rounded-full w-full" style={{ backgroundColor: '#3b82f6' }} />
                    <div className="h-1 rounded-full w-3/4" style={{ backgroundColor: '#3b82f680' }} />
                  </div>
                </div>

                <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.pendingApprovals')}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(71,85,105,0.08)', color: '#10B981' }}>
                      <HourglassIcon size={16} />
                    </div>
                  </div>
                  <div className="flex items-end gap-3 mb-3">
                    <span className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none">{pendingCount}</span>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="font-inter text-[11px] font-normal text-muted">{t('bookingsCommand.liveNeedsAction')}</span>
                    </div>
                  </div>
                  <div className="flex items-end gap-0.5 h-5">
                    {[100, 70, 85, 50, 90, 60, 75].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{ height: `${h * 0.2}px`, backgroundColor: '#10B981', opacity: 0.25 + i * 0.04 }} />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl p-5 bg-bg-2 border border-line">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.todaysRevenue')}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(71,85,105,0.1)', color: '#10B981' }}>
                      <CashIcon size={16} />
                    </div>
                  </div>
                  <div className="flex items-end gap-3 mb-1">
                    <span className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none">{todayRevenueCents === null ? '—' : `$${(todayRevenueCents / 100).toFixed(2)}`}</span>
                    <span className="font-inter text-[11px] font-normal opacity-75 mb-1" style={{ color: '#10B981' }}>+$320</span>
                  </div>
                </div>

                <div className="bg-bg-2 border border-line rounded-xl shadow-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.canceledRequests')}</span>
                    <div className="w-8 h-8 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2">
                      <XCircleIcon size={16} />
                    </div>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none">{cancelledCount}</span>
                    <span className="font-inter text-[11px] font-normal text-neutral opacity-75 mb-1">{t('bookingsCommand.last24h')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden animate-fadeUp" style={{ animationDelay: '80ms' }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                  <h2 className="font-inter text-[16px] font-semibold text-ink">{t('bookingsCommand.recentRequests')}</h2>
                  <div className="flex items-center gap-2">
                    <div className="relative bg-bg-3 border border-line rounded-full focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        placeholder={t('bookingsCommand.tableSearchPlaceholder')}
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        aria-label={t('bookingsCommand.searchPlaceholder')}
                        className="bg-transparent border-0 outline-none pl-8 pr-3 py-1.5 text-ink font-inter text-[13px] placeholder:text-neutral-2 w-[150px] focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <button
                      aria-pressed={todayOnly}
                      aria-label={t('common.today')}
                      onClick={() => setTodayOnly((v) => !v)}
                      className={`px-3.5 py-2 rounded-full font-inter text-[13px] font-medium border transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-accent/40 ${
                        todayOnly
                          ? 'bg-accent/[.09] border-accent text-accent'
                          : 'border-line text-neutral-2 hover:text-ink hover:bg-ink/[.06]'
                      }`}
                    >
                      {t('common.today')}
                    </button>
                  </div>
                </div>

                {selectedIds.size > 0 && (
                  <div className="px-6 py-3 bg-bg-3 border-b border-line flex items-center justify-between animate-fadeUp">
                    <span className="font-inter text-[13px] text-ink">
                      {t('bookingsCommand.selected', { count: selectedIds.size })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleApproveSelected}
                        aria-label={t('bookingsCommand.approveAll')}
                        className="bg-accent text-white rounded-full font-inter text-[13px] font-medium px-3.5 py-2 hover:bg-accent-2 transition-all duration-200 border-0 cursor-pointer focus:ring-2 focus:ring-accent/40"
                      >
                        {t('bookingsCommand.approveAll')}
                      </button>
                      <button
                        onClick={handleRejectSelected}
                        aria-label={t('bookingsCommand.rejectAll')}
                        className="border border-line text-neutral-2 rounded-full font-inter text-[13px] px-3.5 py-2 hover:text-ink hover:bg-ink/[.06] transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-accent/40"
                      >
                        {t('bookingsCommand.rejectAll')}
                      </button>
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        aria-label={t('bookingsCommand.clear')}
                        className="font-inter text-[11px] font-medium text-neutral hover:text-ink transition-colors cursor-pointer bg-transparent border-0 px-2 focus:ring-2 focus:ring-accent/40"
                      >
                        {t('bookingsCommand.clear')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-line">
                        <th className="px-4 py-3 w-10">
                          <button
                            role="checkbox"
                            aria-checked={allSelected}
                            aria-label="Select all pending bookings"
                            onClick={toggleSelectAll}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-150 cursor-pointer focus:ring-2 focus:ring-accent/40 ${
                              allSelected
                                ? 'bg-accent border-accent'
                                : 'bg-transparent border-line hover:border-accent/50'
                            }`}
                          >
                            {allSelected && <CheckSmallIcon />}
                          </button>
                        </th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.bookingId')}</th>
                        <th className="text-left px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.client')}</th>
                        <th className="text-left px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.officeSpace')}</th>
                        <th className="text-left px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.dateTime')}</th>
                        <th className="text-left px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.payment')}</th>
                        <th className="text-left px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-[.14em] text-neutral">{t('bookingsCommand.statusAction')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedBookings.map((booking, i) => (
                        <BookingRow
                          key={booking.id}
                          booking={booking}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onOpenDrawer={setDrawerBooking}
                          isLast={i === filtered.length - 1}
                          selected={selectedIds.has(booking.id)}
                          onToggleSelect={() => toggleSelect(booking.id)}
                          actionInFlight={actionInFlight}
                        />
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center">
                            <p className="font-inter text-[13px] text-neutral">{t('bookingsCommand.noBookingsMatch')}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between px-5 py-4 border-t border-line bg-bg-3/20">
                  <span className="font-inter text-[13px] text-neutral-2">
                    {t('bookingsCommand.showingEntries', { shown: pagedBookings.length, total: filtered.length })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Previous page"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-line text-neutral-2 hover:text-ink hover:bg-ink/[.06] transition-colors cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-accent/40"
                    >
                      <ChevronLeftIcon />
                    </button>
                    <span className="font-inter text-[13px] text-ink-2 px-2">{t('bookingsCommand.page', { page, total: totalPages })}</span>
                    <button
                      aria-label="Next page"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-7 h-7 rounded-lg flex items-center justify-center border border-line text-neutral-2 hover:text-ink hover:bg-ink/[.06] transition-colors cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed focus:ring-2 focus:ring-accent/40"
                    >
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </main>
        </div>

        <nav className="app-mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-2 border-t border-line" aria-label="Mobile navigation">
          <div className="flex items-center justify-around px-2 h-14">
            {NAV_GROUPS.map((group) => {
              const active = isGroupActive(group)
              return (
                <button
                  key={group.id}
                  aria-label={group.label}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => navigate(group.mobilePath)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40 ${
                    active ? 'text-accent' : 'text-neutral hover:text-ink'
                  }`}
                >
                  <NavIcon type={group.mobileIcon} />
                  <span className="font-inter text-[10px] font-semibold uppercase tracking-[.1em]">{group.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {drawerBooking && (
        <BookingDrawer
          booking={drawerBooking}
          onClose={() => setDrawerBooking(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  )
}
