import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavLabel } from '../components/navigation'
import BrandLogo from '../components/BrandLogo'

const workspaces = [
  {
    id: 1,
    name: 'Nexus Hub Alpha',
    location: 'Cyberjaya, Sector 4',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=70',
    tags: ['IoT-Enabled', '24/7 Access', 'Climate Ctrl'],
    capacity: '4-6 Persons',
    price: '$45',
    status: true,
    type: 'Private Office',
    availableDates: ['today', 'tomorrow', 'this-week'],
    availableSlots: ['morning', 'afternoon', 'all-day'],
  },
  {
    id: 2,
    name: 'Quantum Boardroom',
    location: 'Downtown Metro',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=600&q=70',
    tags: ['Smart Board', 'Soundproof'],
    capacity: '10-12 Persons',
    price: '$120',
    status: false,
    type: 'Meeting Room',
    availableDates: ['tomorrow', 'this-week'],
    availableSlots: ['afternoon', 'evening'],
  },
  {
    id: 3,
    name: 'Isolation Pod C',
    location: 'Innovation Park',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=70',
    tags: ['Deep Work', 'Ergonomic'],
    capacity: '1 Person',
    price: '$15',
    status: true,
    type: 'Isolation Pod',
    availableDates: ['today', 'tomorrow', 'this-week'],
    availableSlots: ['morning', 'afternoon', 'evening', 'all-day'],
  },
  {
    id: 4,
    name: 'Synapse Studio',
    location: 'Tech District West',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=600&q=70',
    tags: ['IoT-Enabled', 'Projector', 'Lounge Area'],
    capacity: '6-8 Persons',
    price: '$65',
    status: true,
    type: 'Hot Desk',
    availableDates: ['today', 'this-week'],
    availableSlots: ['morning', 'all-day'],
  },
]

function formatOfficeLocation(office) {
  return [office.building, office.floor, office.room].filter(Boolean).join(', ') || 'FlexiSpace Network'
}

function formatOfficePrice(cents, currency) {
  const amount = (cents ?? 0) / 100
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`
  }
}

function mapOfficeToWorkspace(office, index) {
  const fallback = workspaces[index % workspaces.length]
  return {
    id: office.id,
    name: office.name,
    location: formatOfficeLocation(office),
    rating: fallback.rating,
    image: office.image_url || fallback.image,
    tags: fallback.tags,
    capacity: `${office.capacity} ${office.capacity === 1 ? 'Person' : 'Persons'}`,
    price: formatOfficePrice(office.hourly_rate_cents, office.currency),
    status: office.status === 'ACTIVE',
    type: 'Private Office',
    availableDates: ['today', 'tomorrow', 'this-week'],
    availableSlots: ['morning', 'afternoon', 'evening', 'all-day'],
  }
}

const DATE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'this-week' },
]

const TIME_OPTIONS = [
  { label: 'Morning (8–12)', value: 'morning' },
  { label: 'Afternoon (12–17)', value: 'afternoon' },
  { label: 'Evening (17–22)', value: 'evening' },
  { label: 'All Day', value: 'all-day' },
]

const TYPE_OPTIONS = [
  { label: 'Private Office', value: 'Private Office' },
  { label: 'Meeting Room', value: 'Meeting Room' },
  { label: 'Hot Desk', value: 'Hot Desk' },
  { label: 'Isolation Pod', value: 'Isolation Pod' },
]

// ── Icons ──────────────────────────────────────────────────────────────────────

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#10B981" aria-hidden="true">
      <path d="M6 1L7.545 4.09H11L8.5 6.136L9.455 10L6 7.772L2.545 10L3.5 6.136L1 4.09H4.455L6 1Z" />
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

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 12c0-2.76 2.239-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 1.5v2M9 1.5v2M1.5 6h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6h4M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 6a7 7 0 0 1 10 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 8.5a4 4 0 0 1 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 2h8v11l-4-3-4 3V2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 12.5c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CompassNavIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 3.5v1M7 9.5v1M3.5 7h1M9.5 7h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function CompassHeaderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 4v1M9 13v1M4 9h1M13 9h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function SupportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 5.5a1.5 1.5 0 0 1 3 0c0 1-1.5 1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.6" fill="currentColor" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Filter Components ──────────────────────────────────────────────────────────

function FilterWithDropdown({ icon, label, isOpen, onToggle, options, selected, onSelect }) {
  const displayLabel = selected
    ? `${label}: ${options.find((o) => o.value === selected)?.label ?? label}`
    : label

  return (
    <div className="relative">
      <button
        aria-label={`Filter by ${label}${selected ? `, currently ${options.find((o) => o.value === selected)?.label}` : ''}`}
        aria-expanded={isOpen}
        onClick={onToggle}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-inter text-[13px] font-medium transition-all duration-200 cursor-pointer ${
          selected || isOpen
            ? 'bg-accent/[.09] border-accent text-accent'
            : 'bg-transparent border-line text-ink-2 hover:bg-ink/[.06] hover:text-ink'
        }`}
      >
        {icon}
        {displayLabel}
        <span
          className="inline-flex"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
        >
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-bg-2 border border-line rounded-2xl shadow-card shadow-lg z-50 min-w-[180px] p-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value === selected ? null : option.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-inter text-[13px] transition-colors duration-150 cursor-pointer border-0 bg-transparent ${
                option.value === selected
                  ? 'bg-accent/[.09] text-accent'
                  : 'text-neutral-2 hover:bg-bg-3 hover:text-ink'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  option.value === selected ? 'bg-accent' : 'bg-neutral/40'
                }`}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterToggle({ icon, label, active, onClick }) {
  return (
    <button
      aria-label={`Filter by ${label}`}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-inter text-[13px] font-medium transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-accent/[.09] border-accent text-accent'
          : 'bg-transparent border-line text-ink-2 hover:bg-ink/[.06] hover:text-ink'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// ── WorkspaceCard ──────────────────────────────────────────────────────────────

function WorkspaceCard({ workspace, delay, t }) {
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  return (
    <div
      role="button"
      tabIndex={workspace.status ? 0 : -1}
      onClick={() => workspace.status && navigate('/office/' + workspace.id, { state: { workspace } })}
      onKeyDown={(e) => { if (e.key === 'Enter' && workspace.status) navigate('/office/' + workspace.id, { state: { workspace } }) }}
      className={`bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden transition-transform duration-[350ms] ease-[cubic-bezier(.2,.7,.2,1)] animate-fadeUp flex flex-col focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-1 focus:ring-offset-bg ${
        workspace.status
          ? 'hover:-translate-y-1 cursor-pointer'
          : 'opacity-60 pointer-events-none'
      }`}
      style={{ '--delay': delay }}
    >
      <div className="relative">
        <img
          src={workspace.image}
          alt={`${workspace.name} workspace interior in ${workspace.location}`}
          loading="lazy"
          className="w-full h-44 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-2/60 to-transparent" />
        <span
          className="absolute top-3 right-3 flex items-center gap-1.5 bg-bg/70 rounded-full px-2.5 py-1"
          aria-label={`Rated ${workspace.rating.toFixed(1)} out of 5`}
        >
          <StarIcon />
          <span className="font-inter text-[13px] font-medium text-ink">{workspace.rating.toFixed(1)}</span>
        </span>
        <button
          aria-label={saved ? `Remove ${workspace.name} from saved` : `Save ${workspace.name}`}
          onClick={(e) => { e.stopPropagation(); setSaved(!saved) }}
          className="absolute top-3 left-3 w-11 h-11 rounded-full bg-bg/70 border border-line flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-ink/10"
          style={{ color: saved ? '#10B981' : '#64748B' }}
        >
          <BookmarkIcon />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-inter text-[13px] font-semibold text-ink mb-1">{workspace.name}</h3>
          <div className="flex items-center gap-1.5 text-neutral-2">
            <LocationIcon />
            <span className="font-inter text-[13px]">{workspace.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {workspace.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-bg-3 border border-line font-inter text-[11px] text-neutral-2"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
          <div className="flex items-center gap-1.5 text-neutral-2">
            <PersonIcon />
            <div>
              <span className="font-inter text-[11px] text-neutral block leading-tight">{t('workspace.capacity')}</span>
              <span className="font-inter text-[13px] text-ink-2">{workspace.capacity}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1">
              <span className="font-inter text-[11px] text-neutral">
                {workspace.status ? t('common.available') : t('common.unavailable')}
              </span>
              <span
                title={workspace.status ? t('common.available') : t('common.unavailable')}
                className={`w-1.5 h-1.5 rounded-full inline-block ${workspace.status ? 'bg-accent' : 'bg-red-400'}`}
              />
            </div>
            <div className="font-inter text-[13px] text-neutral-2">
              {t('workspace.from')} <span className="text-accent font-medium">{workspace.price}{t('workspace.perHour')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function FindWorkspace() {
  const navigate = useNavigate()
  const { t, direction } = useI18n()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [filterState, setFilterState] = useState({ date: null, time: null, type: null, iot: false })
  const [openDropdown, setOpenDropdown] = useState(null)
  const [workspaceRows, setWorkspaceRows] = useState(workspaces)
  const [loadingOffices, setLoadingOffices] = useState(true)
  const [officeLoadError, setOfficeLoadError] = useState(false)
  const filterBarRef = useRef(null)

  useEffect(() => {
    let mounted = true

    async function loadOffices() {
      setLoadingOffices(true)
      setOfficeLoadError(false)

      const { data, error } = await supabase
        .from('offices')
        .select('id,name,description,building,floor,room,capacity,hourly_rate_cents,currency,status,image_url')
        .order('name', { ascending: true })

      if (!mounted) return

      if (error || !data?.length) {
        setWorkspaceRows(workspaces)
        setOfficeLoadError(!!error)
      } else {
        setWorkspaceRows(data.map(mapOfficeToWorkspace))
      }
      setLoadingOffices(false)
    }

    loadOffices()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    function handleMouseDown(e) {
      if (openDropdown && filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [openDropdown])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpenDropdown(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hasActiveFilters =
    filterState.iot || filterState.date || filterState.time || filterState.type || search !== ''

  const clearAll = () => {
    setSearch('')
    setFilterState({ date: null, time: null, type: null, iot: false })
    setOpenDropdown(null)
  }

  const setFilter = (key, value) => {
    setFilterState((prev) => ({ ...prev, [key]: value }))
    if (key !== 'iot') setOpenDropdown(null)
  }

  const filtered = workspaceRows.filter((w) => {
    const q = search.toLowerCase()
    if (q && !w.name.toLowerCase().includes(q) && !w.location.toLowerCase().includes(q)) return false
    if (filterState.iot && !w.tags.some((t) => t.toLowerCase().includes('iot'))) return false
    if (filterState.date && !w.availableDates.includes(filterState.date)) return false
    if (filterState.time && !w.availableSlots.includes(filterState.time)) return false
    if (filterState.type && w.type !== filterState.type) return false
    return true
  })

  const sidebarNavItems = [
    { id: 'explore', label: 'Explore', icon: <CompassNavIcon />, path: '/find-workspace' },
    { id: 'bookings', label: 'Bookings', icon: <CalendarIcon />, path: '/bookings' },
    { id: 'profile', label: 'Profile', icon: <UserIcon />, path: '/settings' },
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header dir="ltr" className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg border-b border-line flex items-center px-4 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <BrandLogo variant="colored" iconSize={28} />
        </Link>

        <div className="relative flex-1 max-w-md hidden md:block mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
            <SearchIcon />
          </span>
          <input
            aria-label={t('workspace.topSearchLabel')}
            type="text"
            placeholder={t('workspace.quickSearch')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-bg-3 border border-line rounded-full pl-9 pr-4 py-2 text-ink font-inter text-[13px] placeholder:text-neutral-2 outline-none focus:border-accent focus:ring-[2px] focus:ring-accent/[.14] transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher compact />
        </div>
      </header>

      <div className="flex pt-14 flex-1">
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
              <span className="text-neutral"><SupportIcon /></span>
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

        <main className={`flex-1 px-6 md:px-10 py-8 min-h-screen pb-16 md:pb-8 ${direction === 'rtl' ? 'md:mr-[200px] md:ml-0' : 'md:ml-[200px]'}`}>
          <div className="animate-fadeUp" style={{ '--delay': '0ms' }}>
            <h1 className="font-inter font-semibold tracking-tight text-4xl md:text-5xl text-ink mb-2 mt-0">
              {t('workspace.title')}
            </h1>
            <p className="font-inter text-[15px] text-neutral-2 mb-8 max-w-xl">
              {t('workspace.subtitle')}
            </p>
          </div>

          <div
            ref={filterBarRef}
            className="relative z-10 flex flex-col md:flex-row gap-3 mb-8 animate-fadeUp"
            style={{ '--delay': '80ms' }}
          >
            <div className="relative flex-1 max-w-lg">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
                <SearchIcon />
              </span>
              <input
                aria-label={t('workspace.searchLabel')}
                type="text"
                placeholder={t('workspace.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-bg-3 border border-line rounded-full pl-11 pr-4 py-3 text-ink font-inter text-[15px] placeholder:text-neutral-2 outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/[.14] transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FilterWithDropdown
                icon={<CalendarIcon />}
                label={t('workspace.date')}
                isOpen={openDropdown === 'date'}
                onToggle={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                options={DATE_OPTIONS.map((option) => ({ ...option, label: t(`workspace.dates.${option.value === 'this-week' ? 'thisWeek' : option.value}`) }))}
                selected={filterState.date}
                onSelect={(val) => setFilter('date', val)}
              />
              <FilterWithDropdown
                icon={<ClockIcon />}
                label={t('workspace.time')}
                isOpen={openDropdown === 'time'}
                onToggle={() => setOpenDropdown(openDropdown === 'time' ? null : 'time')}
                options={TIME_OPTIONS.map((option) => ({ ...option, label: t(`workspace.times.${option.value.replace(/-(\w)/g, (_, c) => c.toUpperCase())}`) }))}
                selected={filterState.time}
                onSelect={(val) => setFilter('time', val)}
              />
              <FilterWithDropdown
                icon={<BuildingIcon />}
                label={t('workspace.type')}
                isOpen={openDropdown === 'type'}
                onToggle={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                options={TYPE_OPTIONS.map((option) => ({ ...option, label: t(`workspace.types.${option.value === 'Private Office' ? 'privateOffice' : option.value === 'Meeting Room' ? 'meetingRoom' : option.value === 'Hot Desk' ? 'hotDesk' : 'isolationPod'}`) }))}
                selected={filterState.type}
                onSelect={(val) => setFilter('type', val)}
              />
              <FilterToggle
                icon={<WifiIcon />}
                label={t('workspace.iotFeatures')}
                active={filterState.iot}
                onClick={() => setFilter('iot', !filterState.iot)}
              />
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full font-inter text-[13px] text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {t('workspace.clearAll')}
                </button>
              )}
            </div>
          </div>

          {(loadingOffices || officeLoadError) && (
            <div className="mb-5 animate-fadeUp" style={{ '--delay': '120ms' }}>
              <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">
                {loadingOffices ? t('workspace.loadingCatalog') : t('workspace.fallbackCatalog')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((w, i) => (
              <WorkspaceCard key={w.id} workspace={w} delay={`${i * 80}ms`} t={t} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-20 gap-4">
                <div className="w-14 h-14 rounded-full bg-bg-3 border border-line flex items-center justify-center text-neutral">
                  <span style={{ transform: 'scale(1.6)', display: 'inline-flex' }}>
                    <SearchIcon />
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-inter text-[15px] text-ink-2 font-medium mb-1">{t('workspace.noResults')}</p>
                  <p className="font-inter text-[13px] text-neutral">
                    {t('workspace.noResultsCopy')}
                  </p>
                </div>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line text-neutral-2 font-inter text-[13px] hover:text-ink hover:bg-ink/[.06] transition-all duration-200 cursor-pointer bg-transparent"
                >
                  {t('workspace.clearAll')}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-2 border-t border-line z-50 flex justify-around py-2"
        aria-label="Mobile navigation"
      >
        {sidebarNavItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.id}
              aria-label={translateNavLabel(item.label, t)}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-2 py-2 bg-transparent border-0 cursor-pointer transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-neutral-2'
              }`}
            >
              {item.icon}
              <span className="font-mono text-[11px] uppercase tracking-[.14em]">{translateNavLabel(item.label, t)}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
