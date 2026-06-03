import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavGroup, translateNavLabel } from '../components/navigation'

function GridSquaresIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
      <rect x="10" y="10" width="6.5" height="6.5" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function WifiSignalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6.5a8 8 0 0 1 12 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4.5 9a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 11.5a2 2 0 0 1 2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
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

function BuildingIcon() {
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

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="5.5" cy="10.5" r="0.8" fill="currentColor" />
      <circle cx="8" cy="10.5" r="0.8" fill="currentColor" />
      <circle cx="10.5" cy="10.5" r="0.8" fill="currentColor" />
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

function ChevronIcon() {
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

function SignOutIcon() {
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
      <path d="M7 7a2 2 0 0 1 4 0c0 1.5-2 2-2 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="13.5" r="0.9" fill="currentColor" />
    </svg>
  )
}


function CoinsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <ellipse cx="10" cy="7" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 7v3c0 1.38 2.686 2.5 6 2.5s6-1.12 6-2.5V7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 10v3c0 1.38 2.686 2.5 6 2.5s6-1.12 6-2.5v-3" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function OccupancyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 10 L10 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 10 L16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function NetworkDotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2" fill="currentColor" />
      <circle cx="3" cy="10" r="2" fill="currentColor" />
      <circle cx="17" cy="10" r="2" fill="currentColor" />
      <circle cx="10" cy="3" r="2" fill="currentColor" />
      <circle cx="10" cy="17" r="2" fill="currentColor" />
      <path d="M5 10h3M12 10h3M10 5v3M10 12v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ShieldAlertIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2L3 5v5c0 4.4 3 8.1 7 9 4-.9 7-4.6 7-9V5L10 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M10 7v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="1" fill="currentColor" />
    </svg>
  )
}

function PowerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 4v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 6.3A7 7 0 1 0 15 6.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SnowflakeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M11 3v16M3 11h16M5.5 5.5l11 11M16.5 5.5l-11 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function WarningTriangleIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3L2 25h24L14 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 11v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="21" r="1.2" fill="currentColor" />
    </svg>
  )
}

function ShieldWatermarkIcon() {
  return (
    <svg width="140" height="160" viewBox="0 0 140 160" fill="none" aria-hidden="true">
      <path d="M70 10L15 35v45c0 35 23 62 55 70 32-8 55-35 55-70V35L70 10Z" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
      <path d="M48 80l16 16L92 62" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
  if (type === 'grid') return <GridSquaresIcon size={16} />
  if (type === 'wifi') return <WifiSignalIcon />
  if (type === 'badge') return <CardBadgeIcon />
  if (type === 'chart') return <LineChartIcon />
  if (type === 'building') return <BuildingIcon />
  if (type === 'layout') return <LayoutIcon />
  if (type === 'network') return <NavNetworkIcon />
  if (type === 'calendar') return <CalendarIcon />
  if (type === 'receipt') return <ReceiptIcon />
  if (type === 'today') return <NavTodayIcon />
  if (type === 'wrench') return <NavWrenchIcon />
  if (type === 'users') return <UsersNavIcon />
  return null
}

function CircularProgress({ pct }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const filled = (pct / 100) * circ
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" aria-label={`${pct}% occupancy`}>
      <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx="35" cy="35" r={r}
        fill="none"
        stroke="#10B981"
        strokeWidth="5"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
      />
    </svg>
  )
}

const DEFAULT_IOT_METRICS = {
  totalDevices: 0,
  uptimePercent: 0,
  alertCount: 0,
}

const IOT_METRIC_FIELDS = [
  'id',
  'status',
  'last_seen_at',
  'latest_snapshot_observed_at',
].join(', ')

function computeIotMetrics(rows) {
  const totalDevices = rows.length
  const onlineDevices = rows.filter((row) => row.status === 'ONLINE').length
  const alertCount = rows.filter((row) => ['OFFLINE', 'ERROR', 'MAINTENANCE'].includes(row.status)).length

  return {
    totalDevices,
    uptimePercent: Math.round((onlineDevices / totalDevices) * 100),
    alertCount,
  }
}

export default function OwnerDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, locale } = useI18n()
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
    return Object.keys(result).length > 0 ? result : { overview: true }
  })

  const toggleGroup = (id) =>
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  const [search, setSearch] = useState('')
  const [iotMetrics, setIotMetrics] = useState(DEFAULT_IOT_METRICS)
  const [revenue, setRevenue] = useState(null)
  const [occupancy, setOccupancy] = useState({ sessions: 0, activeOffices: 0 })
  const [officeStatusCounts, setOfficeStatusCounts] = useState({ active: 0, maintenance: 0 })

  useEffect(() => {
    let isMounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return
      const userId = user?.id
      if (!userId) return

      const { data: myOffices } = await supabase
        .from('offices')
        .select('id, status')
        .eq('owner_id', userId)
        .is('deleted_at', null)
      if (!isMounted) return

      const offices = myOffices ?? []
      const officeIds = offices.map((o) => o.id)
      const activeCount = offices.filter((o) => o.status === 'ACTIVE').length
      const maintCount = offices.filter((o) => o.status === 'MAINTENANCE').length
      setOfficeStatusCounts({ active: activeCount, maintenance: maintCount })

      await Promise.all([
        (async () => {
          if (officeIds.length === 0) { if (isMounted) setIotMetrics(DEFAULT_IOT_METRICS); return }
          const { data, error } = await supabase
            .from('device_inventory_read_model')
            .select(IOT_METRIC_FIELDS)
            .in('office_id', officeIds)
          if (!isMounted) return
          if (error || !data || data.length === 0) { setIotMetrics(DEFAULT_IOT_METRICS); return }
          setIotMetrics(computeIotMetrics(data))
        })(),
        (async () => {
          const { data, error } = await supabase
            .from('payments')
            .select('amount_cents')
            .eq('status', 'SUCCEEDED')
            .is('deleted_at', null)
          if (!isMounted) return
          if (error || !data) { setRevenue(0); return }
          const total = data.reduce((sum, row) => sum + (row.amount_cents ?? 0), 0)
          setRevenue(total)
        })(),
        (async () => {
          if (officeIds.length === 0) { if (isMounted) setOccupancy({ sessions: 0, activeOffices: activeCount }); return }
          const { data: bookingsData } = await supabase
            .from('bookings')
            .select('office_id')
            .eq('status', 'CHECKED_IN')
            .in('office_id', officeIds)
            .is('deleted_at', null)
          if (!isMounted) return
          const sessions = new Set((bookingsData ?? []).map((b) => b.office_id).filter(Boolean)).size
          setOccupancy({ sessions, activeOffices: activeCount })
        })(),
      ])
    }

    load()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
        <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('common.search')}
            className="w-full bg-transparent border-0 outline-none pl-11 pr-4 py-2.5 text-ink font-inter text-[13px] placeholder:text-neutral"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher compact />
          <button
            aria-label={t('common.notifications')}
            className="relative w-11 h-11 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40"
          >
            <BellIcon />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
          </button>
          <button
            aria-label={t('common.help')}
            className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40"
          >
            <HelpCircleIcon />
          </button>
          <div className="pl-3 border-l border-line ml-1">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-line">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&q=80"
                srcSet="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=100&q=80 1x, https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80 2x"
                alt="User avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        <aside className="app-sidebar hidden md:flex flex-col w-[200px] bg-bg-2 border-r border-line">
          <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Owner dashboard navigation">
            {NAV_GROUPS.map((rawGroup) => {
              const group = translateNavGroup(rawGroup, t)
              const isOpen = openGroups[group.id] ?? false
              const groupActive = isGroupActive(group)

              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                    aria-label={`${group.label} section`}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg font-inter text-[11px] uppercase tracking-[.1em] transition-colors duration-150 cursor-pointer bg-transparent border-0 ${
                      groupActive ? 'text-accent' : 'text-neutral hover:text-neutral-2'
                    }`}
                  >
                    {group.label}
                    <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronIcon />
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      isOpen ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 pb-1">
                      {group.items.map((item) => (
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
              aria-label="Support"
              onClick={() => navigate('/support')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full focus:ring-2 focus:ring-accent/40"
            >
              <QuestionCircleIcon />
              {t('common.support')}
            </button>
            <button
              aria-label="Sign Out"
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full focus:ring-2 focus:ring-accent/40"
            >
              <SignOutIcon />
              {t('common.signOut')}
            </button>
          </div>
        </aside>

        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8">

          <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
            <div>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('dashboard.overview')}</p>
              <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('dashboard.ownerTitle')}</h1>
              <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('dashboard.ownerSubtitle')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6 animate-fadeUp" style={{ animationDelay: '40ms' }}>
            <div className="bg-bg-2 border border-line rounded-xl shadow-card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('dashboard.totalRevenue')}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(234,179,8,.1)', color: '#facc15' }}>
                  <CoinsIcon />
                </div>
              </div>
              <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink tabular-nums mb-3">
                {revenue === null
                  ? '...'
                  : revenue === 0
                  ? '$0'
                  : `$${(revenue / 100).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </div>
            </div>

            <div className="bg-bg-2 border border-line rounded-xl shadow-card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('dashboard.occupancyRate')}</span>
                <div className="w-8 h-8 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2">
                  <OccupancyIcon />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink tabular-nums">
                    {occupancy.activeOffices > 0
                      ? `${Math.round((occupancy.sessions / occupancy.activeOffices) * 100)}%`
                      : '—'}
                  </div>
                  <div className="font-inter text-[11px] font-normal text-neutral opacity-75 mt-1">
                    {t('dashboard.occupiedOffices', { sessions: occupancy.sessions, offices: occupancy.activeOffices })}
                  </div>
                </div>
                <CircularProgress pct={occupancy.activeOffices > 0 ? Math.round((occupancy.sessions / occupancy.activeOffices) * 100) : 0} />
              </div>
            </div>

            <div className="bg-bg-2 border border-line rounded-xl shadow-card p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('dashboard.activeIotDevices')}</span>
                <div className="w-8 h-8 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2">
                  <NetworkDotsIcon />
                </div>
              </div>
              <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink tabular-nums mb-4">{iotMetrics.totalDevices.toLocaleString()}</div>
              <div>
                <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full" style={{ width: `${iotMetrics.uptimePercent}%`, backgroundColor: '#10B981' }} />
                </div>
                <span className="font-inter text-[11px] font-normal text-neutral opacity-75">{t('dashboard.uptimeLabel', { pct: iotMetrics.uptimePercent })}</span>
              </div>
            </div>

            <div className="rounded-xl p-5 relative overflow-hidden" style={{ backgroundColor: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)' }}>
              <div className="flex items-start justify-between mb-3">
                <span className="font-inter text-[11px] uppercase tracking-[.1em]" style={{ color: 'rgba(239,68,68,.8)' }}>{t('dashboard.securityAlerts')}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
                  <ShieldAlertIcon size={18} />
                </div>
              </div>
              <div className="font-inter text-[36px] font-bold tracking-[.02em] mb-1 tabular-nums" style={{ color: '#f87171' }}>{iotMetrics.alertCount}</div>
              <div className="font-inter text-[11px] font-normal opacity-75" style={{ color: '#f87171' }}>{t('dashboard.requiresReview')}</div>
            </div>
          </div>

          <div className="flex flex-col gap-6 animate-fadeUp" style={{ animationDelay: '80ms' }}>

            <section aria-label={t('dashboard.zoneStatus')}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-inter text-[16px] font-semibold tracking-tight text-ink">{t('dashboard.zoneStatus')}</h2>
                <button
                  onClick={() => {}}
                  aria-label={t('dashboard.viewAllZones')}
                  className="font-inter text-[13px] font-medium text-neutral hover:text-ink cursor-pointer bg-transparent border-0 p-0 transition-colors duration-200"
                >
                  {t('dashboard.viewAllZones')}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}>
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-3">
                <span className="bg-bg-3 border border-line rounded-full font-inter text-[11px] text-neutral-2 px-2.5 py-1">
                  {t('dashboard.officeActive', { count: officeStatusCounts.active, unit: officeStatusCounts.active === 1 ? t('dashboard.office') : t('dashboard.offices') })}
                </span>
                <span className="bg-bg-3 border border-line rounded-full font-inter text-[11px] text-neutral-2 px-2.5 py-1">
                  {officeStatusCounts.maintenance} {t('common.maintenance')}
                </span>
              </div>
            </section>

            <section aria-label={t('dashboard.globalCommand')} className="bg-bg-2 border border-line rounded-xl shadow-card p-6 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-[.04] text-ink pointer-events-none select-none">
                <ShieldWatermarkIcon />
              </div>
              <h2 className="font-inter text-[16px] font-semibold text-accent mb-1">{t('dashboard.globalCommand')}</h2>
              <p className="font-inter text-[13.5px] text-neutral-2 mb-5">{t('dashboard.globalCopy')}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => {}}
                  aria-label={t('dashboard.rebootMainHub')}
                  className="bg-bg-3 border border-line rounded-xl px-4 py-5 flex flex-col items-center gap-2.5 cursor-pointer hover:border-accent/40 hover:text-ink transition-all duration-200"
                >
                  <span className="text-neutral-2"><PowerIcon /></span>
                  <span className="font-inter text-[13.5px] font-medium text-ink-2">{t('dashboard.rebootMainHub')}</span>
                </button>
                <button
                  onClick={() => {}}
                  aria-label={t('dashboard.hvacOverride')}
                  className="bg-bg-3 border border-line rounded-xl px-4 py-5 flex flex-col items-center gap-2.5 cursor-pointer hover:border-accent/40 hover:text-ink transition-all duration-200"
                >
                  <span className="text-neutral-2"><SnowflakeIcon /></span>
                  <span className="font-inter text-[13.5px] font-medium text-ink-2">{t('dashboard.hvacOverride')}</span>
                </button>
              </div>
              <button
                onClick={() => {}}
                aria-label="Global door unlock"
                className="w-full rounded-xl px-4 py-5 flex flex-col items-center gap-1.5 bg-red-600 cursor-pointer hover:bg-red-500 transition-all duration-200 border-0"
              >
                <WarningTriangleIcon size={28} />
                <span className="font-inter text-[13px] font-bold text-white uppercase tracking-[.1em]">{t('dashboard.globalDoorUnlock')}</span>
                <span className="font-inter text-[11px] uppercase tracking-[.1em] text-white/60">{t('dashboard.fireOnly')}</span>
              </button>
            </section>

          </div>
        </main>
      </div>

      <nav className="app-mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-2 border-t border-line" aria-label="Mobile navigation">
        <div className="flex items-center justify-around px-2 h-14">
          {NAV_GROUPS.map((rawGroup) => {
              const group = translateNavGroup(rawGroup, t)
            const active = isGroupActive(group)
            return (
              <button
                key={group.id}
                onClick={() => navigate(rawGroup.mobilePath)}
                aria-label={translateNavLabel(rawGroup.label, t)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40 ${
                  active ? 'text-accent' : 'text-neutral hover:text-ink'
                }`}
              >
                <span aria-hidden="true"><NavIcon type={group.mobileIcon} /></span>
                <span className="font-inter text-[11px] uppercase tracking-[.1em]">
                  {translateNavLabel(rawGroup.label, t).split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

    </div>
  )
}
