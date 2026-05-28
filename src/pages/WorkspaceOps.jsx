import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavGroup } from '../components/navigation'

// ── Icons ─────────────────────────────────────────────────────────────────

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

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
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

function GridDotsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="4"  cy="4"  r="1.5" fill="currentColor" />
      <circle cx="9"  cy="4"  r="1.5" fill="currentColor" />
      <circle cx="14" cy="4"  r="1.5" fill="currentColor" />
      <circle cx="4"  cy="9"  r="1.5" fill="currentColor" />
      <circle cx="9"  cy="9"  r="1.5" fill="currentColor" />
      <circle cx="14" cy="9"  r="1.5" fill="currentColor" />
      <circle cx="4"  cy="14" r="1.5" fill="currentColor" />
      <circle cx="9"  cy="14" r="1.5" fill="currentColor" />
      <circle cx="14" cy="14" r="1.5" fill="currentColor" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 6a7.5 7.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 8.5a4.5 4.5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 11a2 2 0 0 1 3 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7.5" cy="13" r="0.8" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v2M10 1.5v2M1.5 6.5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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
      <circle cx="7.5" cy="4"    r="2"   stroke="currentColor" strokeWidth="1.2" />
      <circle cx="3"   cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12"  cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7.5 6v2.5M7.5 8.5L3 10M7.5 8.5L12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

function ReceiptIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M3 1.5v12l1.5-1 1.5 1 1.5-1 1.5 1 1.5-1 1.5 1V1.5H3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5.5 5.5h4M5.5 8h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 4l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

function NavIcon({ type }) {
  if (type === 'grid')     return <GridDotsIcon />
  if (type === 'wifi')     return <WifiIcon />
  if (type === 'badge')    return <CardBadgeIcon />
  if (type === 'building') return <BuildingNavIcon />
  if (type === 'layout')   return <LayoutIcon />
  if (type === 'network')  return <NavNetworkIcon />
  if (type === 'calendar') return <CalendarIcon />
  if (type === 'receipt')  return <ReceiptIcon />
  if (type === 'today')    return <NavTodayIcon />
  if (type === 'wrench')   return <NavWrenchIcon />
  if (type === 'users')    return <UsersNavIcon />
  return null
}

// ── Nav ───────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    id: 'overview', label: 'Overview', mobileIcon: 'grid', mobilePath: '/owner-dashboard',
    items: [{ label: 'Dashboard', path: '/owner-dashboard', icon: 'grid' }],
  },
  {
    id: 'operations', label: 'Operations', mobileIcon: 'calendar', mobilePath: '/workspace-ops',
    items: [
      { label: 'Live Operations', path: '/workspace-ops', icon: 'layout' },
      { label: "Today's Bookings", path: '/todays-bookings', icon: 'today' },
      { label: 'Bookings Command', path: '/bookings-command-center', icon: 'calendar' },
    ],
  },
  {
    id: 'spaceAssets', label: 'Space Assets', mobileIcon: 'building', mobilePath: '/asset-command',
    items: [
      { label: 'Asset Management', path: '/asset-command', icon: 'building' },
      { label: 'Maintenance Hub', path: '/facility-ops-hub', icon: 'wrench' },
    ],
  },
  {
    id: 'iot', label: 'IoT Infrastructure', mobileIcon: 'network', mobilePath: '/node-manager',
    items: [
      { label: 'IoT Nodes', path: '/node-manager', icon: 'network' },
      { label: 'Access Control', path: '/access-logs', icon: 'badge' },
    ],
  },
  {
    id: 'financials', label: 'Financials', mobileIcon: 'receipt', mobilePath: '/billing',
    items: [{ label: 'Financial Reports', path: '/billing', icon: 'receipt' }],
  },
  {
    id: 'members', label: 'Members', mobileIcon: 'users', mobilePath: '/admin/users',
    items: [{ label: 'User Management', path: '/admin/users', icon: 'users' }],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────

function minutesUntilEnd(endTime) {
  return (new Date(endTime) - new Date()) / 60000
}

const STATUS_CONFIG = {
  available:    { cell: 'bg-[#10B981]/[.07] border-[#10B981]/25', dot: 'bg-[#10B981]', label: 'text-[#10B981]',  text: 'Available'     },
  occupied:     { cell: 'bg-accent/[.08] border-accent/30',        dot: 'bg-accent',     label: 'text-accent',     text: 'In-Session'    },
  'freeing-soon': { cell: 'bg-amber-400/[.08] border-amber-400/30', dot: 'bg-amber-400', label: 'text-amber-400', text: 'Freeing Soon'  },
  expected:     { cell: 'bg-bg-3 border-line',                     dot: 'bg-neutral-2',  label: 'text-neutral-2',  text: 'Expected'      },
  maintenance:  { cell: 'bg-red-400/[.06] border-red-400/25',      dot: 'bg-red-400',    label: 'text-red-400',    text: 'Maintenance'   },
}

const LEGEND = [
  { dot: 'bg-[#10B981]',  label: 'Available'    },
  { dot: 'bg-accent',     label: 'In-Session'   },
  { dot: 'bg-amber-400',  label: 'Freeing Soon' },
  { dot: 'bg-red-400',    label: 'Maintenance'  },
]

function getSpaceStatus(office, bookings) {
  if (office.status === 'MAINTENANCE' || office.status === 'INACTIVE') return 'maintenance'
  const booking = bookings.find((b) => b.office_id === office.id)
  if (!booking) return 'available'
  if (booking.status === 'CHECKED_IN') {
    const minsLeft = minutesUntilEnd(booking.end_time)
    return minsLeft > 0 && minsLeft <= 30 ? 'freeing-soon' : 'occupied'
  }
  if (booking.status === 'CONFIRMED') return 'expected'
  return 'available'
}

// ── SpaceCell ─────────────────────────────────────────────────────────────

const STATUS_TEXT_KEY = {
  available: 'workspaceOps.available',
  occupied: 'workspaceOps.inSession',
  'freeing-soon': 'workspaceOps.freeingSoon',
  expected: 'workspaceOps.expected',
  maintenance: 'workspaceOps.maintenance',
}

function SpaceCell({ space, status, delay, onClick, t }) {
  const cfg = STATUS_CONFIG[status]
  const typeLabel = t('workspaceOps.officeType')

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`relative rounded-xl border p-3 transition-all duration-200 animate-fadeUp ${cfg.cell} ${
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-sm'
          : 'cursor-default'
      }`}
      style={{ '--delay': delay }}
    >
      <div className="flex items-start justify-between gap-1 mb-2">
        <span className="font-inter text-[12px] font-semibold text-ink leading-tight" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {space.name}
        </span>
        <span className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${cfg.dot} ${status === 'occupied' ? 'animate-pulse' : ''}`} />
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-2">
        {space.floor ? `${t('workspaceOps.floorLabel', { floor: space.floor })} · ` : ''}{typeLabel}
      </div>
      <div className={`font-mono text-[11px] uppercase tracking-[.14em] font-medium ${cfg.label}`}>
        {t(STATUS_TEXT_KEY[status])}
      </div>
    </div>
  )
}

// ── Circular progress ─────────────────────────────────────────────────────

function StatCircularProgress({ pct }) {
  const r    = 28
  const circ = 2 * Math.PI * r
  const filled = (pct / 100) * circ
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" aria-label={`${pct}% occupancy`}>
      <circle cx="35" cy="35" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx="35" cy="35" r={r}
        fill="none" stroke="#10B981" strokeWidth="5"
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
      />
    </svg>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function WorkspaceOps() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      navigate('/login')
    }
  }

  const [search,      setSearch]      = useState('')
  const [floorFilter, setFloorFilter] = useState('all')
  const [offices,     setOffices]     = useState([])
  const [bookings,    setBookings]    = useState([])
  const [loading,     setLoading]     = useState(true)

  const [openGroups, setOpenGroups] = useState(() => {
    const defaults = {}
    NAV_GROUPS.forEach((g) => {
      defaults[g.id] = g.items.some((item) => item.path === location.pathname)
    })
    if (!Object.values(defaults).some(Boolean)) defaults['operations'] = true
    return defaults
  })
  const toggleGroup   = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  const isGroupActive = (group) => group.items.some((i) => i.path === location.pathname)

  useEffect(() => {
    let isMounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return
      const userId = user?.id
      if (!userId) { setLoading(false); return }

      const [officesRes, bookingsRes] = await Promise.all([
        supabase
          .from('offices')
          .select('id, name, floor, building, room, capacity, status')
          .eq('owner_id', userId)
          .is('deleted_at', null),
        supabase
          .from('bookings')
          .select('id, office_id, status, start_time, end_time')
          .in('status', ['CHECKED_IN', 'CONFIRMED'])
          .is('deleted_at', null),
      ])

      if (!isMounted) return
      const ownerOffices = officesRes.data ?? []
      setOffices(ownerOffices)
      const officeIdSet = new Set(ownerOffices.map((o) => o.id))
      setBookings((bookingsRes.data ?? []).filter((b) => officeIdSet.has(b.office_id)))
      setLoading(false)
    }

    load()
    return () => { isMounted = false }
  }, [])

  // ── Derived floor filters from real offices ────────────────────────────
  const floorFilters = [
    { id: 'all', label: t('workspaceOps.allFloors') },
    ...Array.from(new Set(offices.map((o) => o.floor).filter(Boolean))).sort().map((f) => ({
      id: f,
      label: t('workspaceOps.floorLabel', { floor: f }),
    })),
  ]

  const legend = [
    { dot: 'bg-[#10B981]', label: t('workspaceOps.available') },
    { dot: 'bg-accent',    label: t('workspaceOps.inSession') },
    { dot: 'bg-amber-400', label: t('workspaceOps.freeingSoon') },
    { dot: 'bg-red-400',   label: t('workspaceOps.maintenance') },
  ]

  // ── Derived stats ──────────────────────────────────────────────────────
  const totalSpaces  = offices.length
  const checkedIn    = bookings.filter((b) => b.status === 'CHECKED_IN')
  const activeCount  = checkedIn.length
  const occupancyPct = totalSpaces > 0 ? Math.round((activeCount / totalSpaces) * 100) : 0
  const freeingSoon  = checkedIn.filter(
    (b) => minutesUntilEnd(b.end_time) > 0 && minutesUntilEnd(b.end_time) <= 30
  ).length

  // ── Filtered offices for heatmap ────────────────────────────────────────
  const filteredSpaces = offices.filter(
    (o) =>
      (floorFilter === 'all' || o.floor === floorFilter) &&
      (search === '' || o.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
        <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full flex items-center px-3 gap-2">
          <span className="text-neutral shrink-0 pointer-events-none"><SearchIcon /></span>
          <input
            type="text"
            placeholder={t('workspaceOps.filterSpaces')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
                alt="Admin avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="app-sidebar hidden md:flex flex-col w-[200px] bg-bg-2 border-r border-line">
          <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto" aria-label="Main navigation">
            {NAV_GROUPS.map((rawGroup) => {
              const group = translateNavGroup(rawGroup, t)
              const isOpen = !!openGroups[group.id]
              return (
                <div key={group.id}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">
                      {group.label}
                    </span>
                    <span className={`text-neutral transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
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
                  </div>
                </div>
              )
            })}
          </nav>
          <div className="flex flex-col gap-0.5 p-3 border-t border-line shrink-0">
            <button onClick={() => navigate('/support')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left">
              <SupportIcon /> {t('common.support')}
            </button>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left">
              <LogoutIcon /> {t('common.signOut')}
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────── */}
        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8">

          {/* Page Header */}
          <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-1.5">{t('workspaceOps.section')}</p>
              <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('workspaceOps.title')}</h1>
              <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('workspaceOps.subtitle')}</p>
            </div>
          </div>

          {/* ── Stat Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-fadeUp" style={{ '--delay': '40ms' }}>

            <div className="bg-bg-2 border border-line rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none tabular-nums">
                    {occupancyPct}%
                  </div>
                  <div className="font-inter text-[11px] text-neutral mt-1">{t('workspaceOps.spacesOccupied', { count: totalSpaces })}</div>
                </div>
                <StatCircularProgress pct={occupancyPct} />
              </div>
              <div className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mt-3">{t('workspaceOps.liveOccupancy')}</div>
            </div>

            <div className="bg-bg-2 border border-line rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none tabular-nums">{activeCount}</div>
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shrink-0" />
              </div>
              <div className="font-inter text-[11px] text-neutral mt-1">{t('workspaceOps.sessionsRunning')}</div>
              <div className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mt-3">{t('workspaceOps.activeSessions')}</div>
            </div>

            <div className="bg-bg-2 border border-line rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none tabular-nums">{freeingSoon}</div>
                <span className="text-neutral-2"><ClockIcon /></span>
              </div>
              <div className="font-inter text-[11px] text-neutral mt-1">{t('workspaceOps.endingIn30')}</div>
              <div className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mt-3">{t('workspaceOps.freeingSoon')}</div>
            </div>
          </div>

          {/* ── Space Heatmap ────────────────────────────────────────── */}
          <div className="animate-fadeUp" style={{ '--delay': '80ms' }}>

            {/* Section header + legend */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="font-inter text-[16px] font-semibold text-ink">{t('workspaceOps.spaceOccupancyGrid')}</h2>
              <div className="flex items-center gap-5">
                {legend.map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                    <span className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floor filter */}
            {floorFilters.length > 1 && (
              <div className="inline-flex bg-bg-2 border border-line rounded-xl p-1 gap-0.5 mb-5">
                {floorFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFloorFilter(f.id)}
                    className={`px-4 py-1.5 rounded-lg font-inter text-[13px] transition-all duration-200 cursor-pointer border-0 ${
                      floorFilter === f.id
                        ? 'bg-bg-3 text-ink font-medium'
                        : 'bg-transparent text-neutral-2 hover:text-ink'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="py-16 text-center font-inter text-[13px] text-neutral">{t('common.loading')}</div>
            ) : filteredSpaces.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredSpaces.map((office, i) => {
                  const status = getSpaceStatus(office, bookings)
                  const isActionable = status === 'occupied' || status === 'freeing-soon' || status === 'expected'
                  return (
                    <SpaceCell
                      key={office.id}
                      space={office}
                      status={status}
                      delay={`${i * 25 + 100}ms`}
                      onClick={isActionable ? () => navigate(`/todays-bookings?office=${office.id}`) : undefined}
                      t={t}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="py-16 text-center font-inter text-[13px] text-neutral">
                {offices.length === 0 ? t('workspaceOps.noOfficesFound') : t('workspaceOps.noSpacesMatch')}
              </div>
            )}
          </div>

        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────────────────── */}
      <nav
        className="app-mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-2 border-t border-line flex items-center justify-around h-14"
        aria-label="Mobile navigation"
      >
        {NAV_GROUPS.map((rawGroup) => {
          const group = translateNavGroup(rawGroup, t)
          const active = isGroupActive(rawGroup)
          return (
            <button
              key={group.id}
              aria-label={group.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(group.mobilePath)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer bg-transparent border-0 ${
                active ? 'text-accent' : 'text-neutral hover:text-ink'
              }`}
            >
              <NavIcon type={group.mobileIcon} />
              <span className="font-mono text-[11px] uppercase tracking-[.14em]">
                {group.label.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}
