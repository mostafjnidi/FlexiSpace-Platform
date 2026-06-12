import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { manualCheckinBooking, FlexiApiError } from '../lib/flexispaceApi'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavGroup, translateNavItem } from '../components/navigation'

/* ─── Icons ───────────────────────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2a5 5 0 0 0-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 0 0-5-5Z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7.5 14.5a1.5 1.5 0 0 0 3 0"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function HelpCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 7a2 2 0 0 1 4 .667c0 1.333-2 1.666-2 3"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 4l5 5 5-5"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GridDotsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="4" cy="4" r="1.5" fill="currentColor" />
      <circle cx="9" cy="4" r="1.5" fill="currentColor" />
      <circle cx="14" cy="4" r="1.5" fill="currentColor" />
      <circle cx="4" cy="9" r="1.5" fill="currentColor" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="14" cy="9" r="1.5" fill="currentColor" />
      <circle cx="4" cy="14" r="1.5" fill="currentColor" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  )
}

function WifiSignalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 6a7.5 7.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 8.5a4.5 4.5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 11a2 2 0 0 1 3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7.5" cy="13" r="0.8" fill="currentColor" />
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

function LineChartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M1.5 12L5 8l3 2.5L12 5l1.5 1.5"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
      <path d="M7.5 6v2.5M7.5 8.5L3 10M7.5 8.5L12 10"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CalendarNavIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v2M10 1.5v2M1.5 6.5h12"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M3 1.5v12l1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1V1.5H3Z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 5.5h4M5.5 8h3"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 5.5a2 2 0 0 1 4 .667c0 1.333-2 1.666-2 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7.5" cy="11" r="0.8" fill="currentColor" />
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

function NavIcon({ type }) {
  if (type === 'grid') return <GridDotsIcon />
  if (type === 'wifi') return <WifiSignalIcon />
  if (type === 'badge') return <CardBadgeIcon />
  if (type === 'chart') return <LineChartIcon />
  if (type === 'building') return <BuildingNavIcon />
  if (type === 'layout') return <LayoutIcon />
  if (type === 'network') return <NavNetworkIcon />
  if (type === 'calendar') return <CalendarNavIcon />
  if (type === 'receipt') return <ReceiptIcon />
  if (type === 'today') return <NavTodayIcon />
  if (type === 'wrench') return <NavWrenchIcon />
  if (type === 'users') return <UsersNavIcon />
  if (type === 'scanner') return <NavScannerIcon />
  if (type === 'command') return <NavCommandIcon />
  if (type === 'access')  return <NavAccessIcon />
  return null
}

/* ─── Nav ─────────────────────────────────────────────────────────────── */

const OPERATOR_ITEMS = [
  { label: 'Command Center',   shortLabel: 'Command',  path: '/command-center',   icon: 'command' },
  { label: "Today's Bookings", shortLabel: "Today's",  path: '/todays-bookings',  icon: 'today'   },
  { label: 'Scanner Control',  shortLabel: 'Scanner',  path: '/scanner-control',  icon: 'scanner' },
  { label: 'Live Access Feed', shortLabel: 'Access',   path: '/access-logs',      icon: 'access'  },
  { label: 'Facility Ops Hub', shortLabel: 'Facility', path: '/facility-ops-hub', icon: 'wrench'  },
]

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

/* ─── BookingRow ──────────────────────────────────────────────────────── */

function BookingRow({ booking, onMarkArrived, checkinInFlight, t }) {
  const isActive = booking.status === 'IN-SESSION'
  const isWaiting = booking.status === 'WAITING'
  const isCompleted = booking.status === 'COMPLETED'

  return (
    <div className="flex items-stretch gap-4 animate-fadeUp" style={{ '--delay': booking.delay }}>
      <div className="w-16 shrink-0 flex flex-col items-end justify-center gap-0.5 pt-1">
        <div className={`flex items-center gap-1 font-inter text-[11px] ${isActive ? 'text-accent' : 'text-neutral'}`}>
          {isActive && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          )}
          {booking.startTime}
        </div>
        <div className={`font-inter text-[11px] ${isActive ? 'text-accent' : 'text-neutral'}`}>{booking.endTime}</div>
      </div>

      <div
        className={`flex-1 flex items-center gap-4 rounded-2xl border transition-all duration-200 px-4 py-3 ${
          isActive
            ? 'bg-accent/[.07] border-accent/30 border-l-4 border-l-accent'
            : 'bg-bg-2 border-line hover:-translate-y-px'
        }`}
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-line">
          <img src={booking.image} alt="" aria-hidden="true" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = OFFICE_FALLBACK_IMAGES[0] }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className={`font-inter text-[13px] font-semibold mb-0.5 ${isActive ? 'text-ink' : isCompleted ? 'text-neutral-2' : 'text-ink'}`}>
            {booking.space}
          </div>
          <div className="font-inter text-[13.5px]">
            <span className="text-neutral">{t('todaysBookings.client')}: </span>
            <span className={isActive ? 'text-accent' : 'text-neutral-2'}>{booking.client}</span>
          </div>
          {isActive && booking.capacity && (
            <div className="mt-2">
              <div className="font-inter text-[11px] text-accent uppercase tracking-[.1em] mb-1">
                {t('todaysBookings.capacityLabel')}: {booking.capacity.current}/{booking.capacity.max}
              </div>
              <div className="w-24 h-0.5 bg-bg-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${(booking.capacity.current / booking.capacity.max) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCompleted && (
            <span className="px-3 py-1.5 rounded-full bg-bg-3 border border-line font-inter text-[11px] uppercase tracking-[.1em] text-neutral">
              {t('todaysBookings.completedBadge')}
            </span>
          )}
          {isActive && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 font-inter text-[11px] uppercase tracking-[.1em] text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {t('todaysBookings.inSession')}
            </span>
          )}
          {isWaiting && (
            <>
              <span className="px-3 py-1.5 rounded-full bg-bg-3 border border-line font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2">
                {t('todaysBookings.waiting')}
              </span>
              <button
                aria-label="Mark as arrived"
                onClick={() => onMarkArrived(booking.id)}
                disabled={checkinInFlight?.has(booking.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-white font-inter text-[13.5px] font-medium hover:bg-accent-2 hover:-translate-y-px transition-all duration-200 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                {checkinInFlight?.has(booking.id) ? '...' : t('todaysBookings.markArrived')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const OFFICE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
]

function getOfficeFallback(id) {
  const sum = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return OFFICE_FALLBACK_IMAGES[sum % OFFICE_FALLBACK_IMAGES.length]
}

function mapRawStatus(status) {
  if (['CHECKED_OUT', 'COMPLETED', 'NO_SHOW', 'REJECTED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(status)) return 'COMPLETED'
  if (status === 'CHECKED_IN' || status === 'OVERSTAY') return 'IN-SESSION'
  return 'WAITING'
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function TodaysBookings({ operatorMode = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      navigate('/login')
    }
  }
  const [searchParams] = useSearchParams()
  const isOperator = operatorMode || searchParams.get('ctx') === 'operator'
  const officeFilter = searchParams.get('office')

  const [headerSearch, setHeaderSearch] = useState('')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkinInFlight, setCheckinInFlight] = useState(new Set())
  const [checkinError, setCheckinError] = useState('')
  const [reloadTick, setReloadTick] = useState(0)

  const [openGroups, setOpenGroups] = useState(() => {
    const defaults = {}
    NAV_GROUPS.forEach((g) => {
      defaults[g.id] = g.items.some((item) => item.path === location.pathname)
    })
    if (!Object.values(defaults).some(Boolean)) defaults['operations'] = true
    return defaults
  })
  const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      const userId = user?.id
      if (!userId) { setLoading(false); return }

      const [{ data: ownedOffices }, { data: operatedLinks }] = await Promise.all([
        supabase
          .from('offices')
          .select('id, name, image_url, capacity, floor, building, room')
          .eq('owner_id', userId)
          .is('deleted_at', null),
        supabase
          .from('operator_offices')
          .select('office_id')
          .eq('operator_id', userId)
          .is('deleted_at', null),
      ])
      if (!mounted) return

      const ownedIds = new Set((ownedOffices ?? []).map((o) => o.id))
      const operatedIds = (operatedLinks ?? []).map((o) => o.office_id).filter((id) => !ownedIds.has(id))

      let extraOffices = []
      if (operatedIds.length > 0) {
        const { data: extra } = await supabase
          .from('offices')
          .select('id, name, image_url, capacity, floor, building, room')
          .in('id', operatedIds)
          .is('deleted_at', null)
        if (!mounted) return
        extraOffices = extra ?? []
      }

      const allOffices = [...(ownedOffices ?? []), ...extraOffices]
      const officesById = Object.fromEntries(allOffices.map((o) => [o.id, o]))
      const officeIds = allOffices.map((o) => o.id)

      if (officeIds.length === 0) { if (mounted) { setBookings([]); setLoading(false) } return }

      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)

      const { data: rows } = await supabase
        .from('bookings')
        .select('id, user_id, office_id, status, start_time, end_time')
        .in('office_id', officeIds)
        .in('status', ['CONFIRMED', 'CHECKED_IN', 'OVERSTAY', 'CHECKED_OUT', 'COMPLETED', 'NO_SHOW', 'CANCELLED', 'REJECTED'])
        .gte('start_time', todayStart.toISOString())
        .lte('start_time', todayEnd.toISOString())
        .order('start_time', { ascending: true })
        .is('deleted_at', null)
      if (!mounted) return

      const bookingRows = rows ?? []
      if (bookingRows.length === 0) { if (mounted) { setBookings([]); setLoading(false) } return }

      const userIds = [...new Set(bookingRows.map((b) => b.user_id).filter(Boolean))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds)
      if (!mounted) return

      const profilesById = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

      const mapped = bookingRows.map((row, i) => {
        const office = officesById[row.office_id]
        const profile = profilesById[row.user_id]
        return {
          id: row.id,
          startTime: fmtTime(row.start_time),
          endTime: fmtTime(row.end_time),
          space: office?.name || 'Workspace',
          officeId: row.office_id,
          client: profile?.full_name || 'Guest',
          status: mapRawStatus(row.status),
          capacity: null,
          image: office?.image_url || getOfficeFallback(row.office_id),
          delay: `${i * 80}ms`,
        }
      })

      if (mounted) { setBookings(mapped); setLoading(false) }
    }
    load()
    return () => { mounted = false }
  }, [reloadTick])

  const handleMarkArrived = async (id) => {
    setCheckinInFlight((prev) => new Set([...prev, id]))
    setCheckinError('')
    try {
      await manualCheckinBooking({ bookingId: id })
      setReloadTick((v) => v + 1)
    } catch (err) {
      setCheckinError(err instanceof FlexiApiError ? err.message : 'Check-in failed. Please try again.')
    } finally {
      setCheckinInFlight((prev) => { const next = new Set(prev); next.delete(id); return next })
    }
  }

  const visibleBookings = officeFilter
    ? bookings.filter((b) => b.officeId === officeFilter)
    : bookings

  const searchFiltered = headerSearch
    ? visibleBookings.filter((b) =>
        b.space.toLowerCase().includes(headerSearch.toLowerCase()) ||
        b.client.toLowerCase().includes(headerSearch.toLowerCase())
      )
    : visibleBookings

  const totalCount = searchFiltered.length
  const activeCount = searchFiltered.filter((b) => b.status === 'IN-SESSION').length
  const waitingCount = searchFiltered.filter((b) => b.status === 'WAITING').length

  const todayLabel = new Date().toLocaleDateString(direction === 'rtl' ? 'ar-SA' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-bg flex flex-col font-inter">

      {/* Unified Header */}
      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
        <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full flex items-center px-3 gap-2">
          <span className="text-neutral shrink-0"><SearchIcon /></span>
          <input
            type="text"
            placeholder={t('todaysBookings.searchPlaceholder')}
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none font-inter text-[13px] text-ink placeholder:text-neutral py-1.5"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher compact />
          <button aria-label={t('common.notifications')}
            className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0">
            <BellIcon />
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

        <aside className="app-sidebar hidden md:flex flex-col w-[200px] shrink-0 bg-bg-2 border-r border-line">
          <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto" aria-label="Main navigation">
            {isOperator ? (
              OPERATOR_ITEMS.map((rawItem) => {
                const item = translateNavItem(rawItem, t)
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent border-0 text-left border-l-[3px] ${
                      isActive ? 'border-accent bg-bg-3 text-ink' : 'border-transparent text-neutral-2 hover:bg-bg-3 hover:text-ink'
                    }`}
                  >
                    <span className={isActive ? 'text-accent' : 'text-neutral'}>
                      <NavIcon type={item.icon} />
                    </span>
                    {item.label}
                  </button>
                )
              })
            ) : (
              NAV_GROUPS.map((rawGroup) => {
                const group = translateNavGroup(rawGroup, t)
                const isOpen = !!openGroups[group.id]
                return (
                  <div key={group.id}>
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
                    >
                      <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">
                        {group.label}
                      </span>
                      <span className={`text-neutral transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                        <ChevronDownIcon />
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                          <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent border-0 text-left border-l-[3px] ${
                              isActive ? 'border-accent bg-bg-3 text-ink' : 'border-transparent text-neutral-2 hover:bg-bg-3 hover:text-ink'
                            }`}
                          >
                            <span className={isActive ? 'text-accent' : 'text-neutral'}>
                              <NavIcon type={item.icon} />
                            </span>
                            {item.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </nav>
          <div className="flex flex-col gap-0.5 p-3 border-t border-line">
            {!isOperator && (
              <button onClick={() => navigate('/support')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left">
                <SupportIcon /> {t('common.support')}
              </button>
            )}
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left">
              <LogoutIcon /> {t('common.signOut')}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8">

          {/* 3-Layer Page Title */}
          <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
            <div>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('todaysBookings.section')}</p>
              <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('todaysBookings.overviewTitle')}</h1>
              <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('todaysBookings.liveMonitoring')}</p>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0 mt-1 ml-auto">
              <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{todayLabel}</span>
            </div>
          </div>

          {/* Inline Summary Strip */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-line animate-fadeUp" style={{ '--delay': '60ms' }}>
            <div className="flex items-center gap-2">
              <span className="font-inter text-[30px] font-bold text-ink leading-none tabular-nums">{totalCount}</span>
              <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('todaysBookings.total')}</span>
            </div>
            <span className="text-line font-mono text-neutral">·</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="font-inter text-[30px] font-bold text-accent leading-none tabular-nums">{activeCount}</span>
              <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('todaysBookings.inSession')}</span>
            </div>
            <span className="text-line font-mono text-neutral">·</span>
            <div className="flex items-center gap-2">
              <span className="font-inter text-[30px] font-bold text-ink leading-none tabular-nums">{waitingCount}</span>
              <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('todaysBookings.waiting')}</span>
            </div>
            <span className="ml-auto font-inter text-[11px] uppercase tracking-[.1em] text-neutral hidden md:block">{todayLabel}</span>
          </div>

          {/* Booking Rows */}
          {checkinError && (
            <div role="alert" className="mb-4 rounded-xl border border-red-400/25 bg-red-400/[.08] px-4 py-3">
              <p className="font-inter text-[13px] text-red-400">{checkinError}</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {loading ? (
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral py-8 text-center">{t('common.loading')}</p>
            ) : searchFiltered.length === 0 ? (
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral py-8 text-center">{t('todaysBookings.noBookings')}</p>
            ) : (
              searchFiltered.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onMarkArrived={handleMarkArrived}
                  checkinInFlight={checkinInFlight}
                  t={t}
                />
              ))
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="app-mobile-nav fixed bottom-0 left-0 right-0 md:hidden bg-bg-2 border-t border-line flex items-center justify-around h-14 z-50">
        {isOperator ? (
          OPERATOR_ITEMS.map((rawItem) => {
            const item = translateNavItem(rawItem, t)
            const isActive = location.pathname === item.path
            return (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer bg-transparent border-0 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-neutral-2'}`}>
                <NavIcon type={item.icon} />
                <span className="font-inter text-[11px] uppercase tracking-[.1em]">{item.shortLabel}</span>
              </button>
            )
          })
        ) : (
          NAV_GROUPS.map((rawGroup) => {
            const group = translateNavGroup(rawGroup, t)
            const isActive = group.items.some((i) => i.path === location.pathname)
            return (
              <button key={group.id}
                onClick={() => navigate(group.mobilePath)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer bg-transparent border-0 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-neutral-2'}`}>
                <NavIcon type={group.mobileIcon} />
                <span className="font-inter text-[11px] uppercase tracking-[.1em]">{group.label.split(' ')[0]}</span>
              </button>
            )
          })
        )}
      </nav>
    </div>
  )
}
