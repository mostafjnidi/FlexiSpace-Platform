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

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 4l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 2v8M4.5 7.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
  if (type === 'badge')    return <CardBadgeIcon />
  if (type === 'building') return <BuildingNavIcon />
  if (type === 'layout')   return <LayoutIcon />
  if (type === 'network')  return <NavNetworkIcon />
  if (type === 'calendar') return <CalendarNavIcon />
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
      { label: 'Live Operations',  path: '/workspace-ops',           icon: 'layout'   },
      { label: "Today's Bookings", path: '/todays-bookings',         icon: 'today'    },
      { label: 'Bookings Command', path: '/bookings-command-center', icon: 'calendar' },
    ],
  },
  {
    id: 'spaceAssets', label: 'Space Assets', mobileIcon: 'building', mobilePath: '/asset-command',
    items: [
      { label: 'Asset Management', path: '/asset-command',    icon: 'building' },
      { label: 'Maintenance Hub',  path: '/facility-ops-hub', icon: 'wrench'   },
    ],
  },
  {
    id: 'iot', label: 'IoT Infrastructure', mobileIcon: 'network', mobilePath: '/node-manager',
    items: [
      { label: 'IoT Nodes',      path: '/node-manager', icon: 'network' },
      { label: 'Access Control', path: '/access-logs',  icon: 'badge'   },
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

// ── Transaction data ──────────────────────────────────────────────────────

const TRANSACTIONS = [
  { id: 'TXN-9021', date: 'Today, 14:05',       customer: 'Sarah Jenkins',   space: 'Quantum Suite',    method: 'Visa •••• 4242',         amount: 249.00, status: 'success' },
  { id: 'TXN-9020', date: 'Today, 11:30',       customer: 'Marcus Thorne',   space: 'Nexus Hub Alpha',  method: 'Mastercard •••• 8810',   amount: 189.00, status: 'success' },
  { id: 'TXN-9019', date: 'Today, 09:15',       customer: 'Elena Rostova',   space: 'Pod Cluster 3',    method: 'Stripe Link',            amount: 75.00,  status: 'failed'  },
  { id: 'TXN-9018', date: 'Yesterday, 18:44',   customer: 'James Wu',        space: 'Vertex Base',      method: 'Visa •••• 1193',         amount: 320.00, status: 'success' },
  { id: 'TXN-9017', date: 'Yesterday, 15:20',   customer: 'Layla Hassan',    space: 'Hot Desk 02',      method: 'Apple Pay',              amount: 45.00,  status: 'success' },
  { id: 'TXN-9016', date: 'Yesterday, 10:05',   customer: 'Omar Khalid',     space: 'Studio A',         method: 'Mastercard •••• 5571',   amount: 210.00, status: 'pending' },
]

const STATUS_FILTERS = ['All', 'Success', 'Failed', 'Pending']

function StatusBadge({ status }) {
  if (status === 'success') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
      Success
    </span>
  )
  if (status === 'failed') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-red-400/10 border-red-400/30 text-red-400 font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      Failed
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-amber-400/10 border-amber-400/30 text-amber-400 font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Pending
    </span>
  )
}

function AmountCell({ amount, status }) {
  if (status === 'success') return (
    <span className="font-mono text-[13px] font-semibold text-[#10B981]">
      +${amount.toFixed(2)}
    </span>
  )
  if (status === 'failed') return (
    <span className="font-mono text-[13px] text-red-400 line-through opacity-60">
      -${amount.toFixed(2)}
    </span>
  )
  return (
    <span className="font-mono text-[13px] text-amber-400">
      ${amount.toFixed(2)}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

const STATUS_FILTER_LABEL_KEYS = {
  All: 'financialReports.filterAll',
  Success: 'financialReports.filterSuccess',
  Failed: 'financialReports.filterFailed',
  Pending: 'financialReports.filterPending',
}

export default function FinancialReports() {
  const { t } = useI18n()
  const location = useLocation()
  const navigate  = useNavigate()
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      navigate('/login')
    }
  }

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [payments, setPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(true)

  const [openGroups, setOpenGroups] = useState(() => {
    const d = {}
    NAV_GROUPS.forEach((g) => {
      d[g.id] = g.items.some((i) => i.path === location.pathname)
    })
    if (!Object.values(d).some(Boolean)) d['financials'] = true
    return d
  })
  const toggleGroup   = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  const isGroupActive = (group) => group.items.some((i) => i.path === location.pathname)

  useEffect(() => {
    let active = true
    async function loadPayments() {
      setLoadingPayments(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return
      const userId = user?.id
      if (!userId) { setLoadingPayments(false); return }

      const { data: myOffices } = await supabase
        .from('offices')
        .select('id')
        .eq('owner_id', userId)
        .is('deleted_at', null)
      if (!active) return
      const ownerOfficeIds = (myOffices ?? []).map((o) => o.id)
      if (ownerOfficeIds.length === 0) { setPayments([]); setLoadingPayments(false); return }

      const { data: myBookings } = await supabase
        .from('bookings')
        .select('id')
        .in('office_id', ownerOfficeIds)
        .is('deleted_at', null)
      if (!active) return
      const bookingIds = (myBookings ?? []).map((b) => b.id)
      if (bookingIds.length === 0) { setPayments([]); setLoadingPayments(false); return }

      const { data, error } = await supabase
        .from('payments')
        .select('id, amount_cents, status, created_at, booking_id, bookings(id, offices(name))')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false })
        .limit(200)
      if (!active) return
      if (error || !data) {
        setLoadingPayments(false)
        return
      }
      const rows = data.map((p) => ({
        id: `TXN-${p.id.slice(0, 6).toUpperCase()}`,
        date: new Date(p.created_at).toLocaleString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        }),
        customer: p.booking_id ? `Booking #${p.booking_id.slice(0, 6).toUpperCase()}` : 'Client',
        space: p.bookings?.offices?.name ?? 'Workspace',
        method: 'Mock Payment',
        amount: (p.amount_cents ?? 0) / 100,
        status: p.status === 'SUCCEEDED' ? 'success'
              : p.status === 'FAILED'    ? 'failed'
              : 'pending',
      }))
      setPayments(rows)
      setLoadingPayments(false)
    }
    loadPayments()
    return () => { active = false }
  }, [])

  const filtered = payments.filter((t) => {
    const matchSearch =
      search === '' ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      t.space.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === 'All' || t.status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const totalRevenueCents = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + Math.round(p.amount * 100), 0)

  const pendingCents = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + Math.round(p.amount * 100), 0)

  const totalCollected = filtered
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="min-h-screen bg-bg flex flex-col font-inter">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
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
                srcSet="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80 1x, https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80 2x"
                alt="Admin avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="app-sidebar hidden md:flex flex-col w-[200px] shrink-0 bg-bg-2 border-r border-line">
          <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto" aria-label="Main navigation">
            {NAV_GROUPS.map((rawGroup) => {
              const group = translateNavGroup(rawGroup, t)
              const isOpen = !!openGroups[rawGroup.id]
              return (
                <div key={rawGroup.id}>
                  <button
                    onClick={() => toggleGroup(rawGroup.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
                  >
                    <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">
                      {group.label}
                    </span>
                    <span className={`text-neutral transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon />
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
                    {group.items.map((item, idx) => {
                      const isActive = location.pathname === rawGroup.items[idx].path
                      return (
                        <button
                          key={rawGroup.items[idx].path}
                          onClick={() => navigate(rawGroup.items[idx].path)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent border-0 text-left border-l-[3px] ${
                            isActive
                              ? 'border-accent bg-bg-3 text-ink'
                              : 'border-transparent text-neutral-2 hover:bg-bg-3 hover:text-ink'
                          }`}
                        >
                          <span className={isActive ? 'text-accent' : 'text-neutral'}>
                            <NavIcon type={rawGroup.items[idx].icon} />
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
        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8 min-w-0">

          {/* 3-Layer Page Title */}
          <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
            <div>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('financialReports.section')}</p>
              <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('financialReports.title')}</h1>
              <p className="font-inter text-[13px] text-neutral leading-relaxed">
                {t('financialReports.subtitle')}
              </p>
            </div>
            <button className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-2 border border-line text-ink-2 font-inter text-[13px] font-medium hover:bg-ink/[.06] transition-all duration-200 cursor-pointer ml-auto shrink-0 mt-1">
              <DownloadIcon />
              {t('financialReports.exportCsv')}
            </button>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">

            <div className="bg-bg-2 border border-line rounded-2xl shadow-card p-4 animate-fadeUp" style={{ '--delay': '60ms' }}>
              <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-2">{t('financialReports.totalRevenue')}</div>
              <div className="flex items-center gap-2 font-inter text-[30px] font-bold tracking-[.02em] leading-none tabular-nums text-[#10B981]">
                <span className="w-2 h-2 rounded-full shrink-0 bg-[#10B981]" />
                {`$${(totalRevenueCents / 100).toFixed(2)}`}
              </div>
              <div className="font-inter text-[11px] text-neutral mt-2">{t('financialReports.vsLastMonth')}</div>
            </div>

            <div className="bg-bg-2 border border-line rounded-2xl shadow-card p-4 animate-fadeUp" style={{ '--delay': '120ms' }}>
              <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-2">{t('financialReports.totalTransactions')}</div>
              <div className="flex items-center gap-2 font-inter text-[30px] font-bold tracking-[.02em] leading-none tabular-nums text-ink">
                <span className="w-2 h-2 rounded-full shrink-0 bg-accent animate-pulse" />
                {`${payments.length}`}
              </div>
              <div className="font-inter text-[11px] text-neutral mt-2">{t('financialReports.paymentsRecorded')}</div>
            </div>

            <div className="bg-bg-2 border border-line rounded-2xl shadow-card p-4 animate-fadeUp" style={{ '--delay': '180ms' }}>
              <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-2">{t('financialReports.pendingPayments')}</div>
              <div className="flex items-center gap-2 font-inter text-[30px] font-bold tracking-[.02em] leading-none tabular-nums text-amber-400">
                <span className="w-2 h-2 rounded-full shrink-0 bg-amber-400" />
                {`$${(pendingCents / 100).toFixed(2)}`}
              </div>
              <div className="font-inter text-[11px] text-neutral mt-2">{t('financialReports.awaitingConf')}</div>
            </div>
          </div>

          {/* Search + Status Filter */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] bg-bg-3 border border-line rounded-xl flex items-center px-3 gap-2 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
              <span className="text-neutral shrink-0 pointer-events-none"><SearchIcon /></span>
              <input
                type="text"
                placeholder={t('financialReports.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none font-inter text-[13px] text-ink placeholder:text-neutral py-2.5"
              />
            </div>
            <div className="inline-flex bg-bg-2 border border-line rounded-xl p-1 gap-0.5 shrink-0">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-lg font-inter text-[13px] transition-all duration-200 cursor-pointer border-0 ${
                    statusFilter === f
                      ? 'bg-bg-3 text-ink font-medium'
                      : 'bg-transparent text-neutral-2 hover:text-ink'
                  }`}
                >
                  {t(STATUS_FILTER_LABEL_KEYS[f])}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden animate-fadeUp" style={{ '--delay': '200ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-6 py-4 font-inter text-[11px] uppercase tracking-[.1em] text-neutral font-medium whitespace-nowrap">{t('financialReports.colDate')}</th>
                    <th className="text-left px-4 py-4 font-inter text-[11px] uppercase tracking-[.1em] text-neutral font-medium whitespace-nowrap">{t('financialReports.colTransaction')}</th>
                    <th className="text-left px-4 py-4 font-inter text-[11px] uppercase tracking-[.1em] text-neutral font-medium whitespace-nowrap">{t('financialReports.colCustomer')}</th>
                    <th className="text-left px-4 py-4 font-inter text-[11px] uppercase tracking-[.1em] text-neutral font-medium whitespace-nowrap">{t('financialReports.colSpace')}</th>
                    <th className="text-left px-4 py-4 font-inter text-[11px] uppercase tracking-[.1em] text-neutral font-medium whitespace-nowrap">{t('financialReports.colMethod')}</th>
                    <th className="text-right px-4 py-4 font-inter text-[11px] uppercase tracking-[.1em] text-neutral font-medium whitespace-nowrap">{t('financialReports.colAmount')}</th>
                    <th className="text-right px-6 py-4 font-inter text-[11px] uppercase tracking-[.1em] text-neutral font-medium whitespace-nowrap">{t('financialReports.colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPayments && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center font-inter text-[13px] text-neutral">
                        {t('financialReports.loadingTransactions')}
                      </td>
                    </tr>
                  )}
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-line transition-colors duration-150 hover:bg-ink/[.03] last:border-b-0">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-inter text-[12px] text-neutral">{t.date}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-inter text-[12px] text-ink">{t.id}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-inter text-[13.5px] font-medium text-ink">{t.customer}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-inter text-[13px] text-neutral-2">{t.space}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-inter text-[12px] text-neutral">{t.method}</span>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <AmountCell amount={t.amount} status={t.status} />
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center font-inter text-[13px] text-neutral">
                        {t('financialReports.noMatchingTransactions')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-line bg-bg-3/30 flex-wrap gap-2">
              <span className="font-inter text-[13px] text-neutral">
                {t('financialReports.showingTransactions', { count: filtered.length })}
              </span>
              <span className="font-inter text-[13px] font-semibold text-ink">
                {t('financialReports.totalCollected')}&nbsp;
                <span className="text-[#10B981]">
                  ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </span>
            </div>
          </div>

        </main>
      </div>

      {/* ── Mobile Bottom Nav ────────────────────────────────────────────── */}
      <nav className="app-mobile-nav fixed bottom-0 left-0 right-0 md:hidden bg-bg-2 border-t border-line flex items-center justify-around h-14 z-50"
        aria-label="Mobile navigation">
        {NAV_GROUPS.map((rawGroup) => {
          const active = isGroupActive(rawGroup)
          const group = translateNavGroup(rawGroup, t)
          return (
            <button
              key={rawGroup.id}
              aria-label={group.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(rawGroup.mobilePath)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer bg-transparent border-0 ${
                active ? 'text-accent' : 'text-neutral hover:text-ink'
              }`}
            >
              <NavIcon type={rawGroup.mobileIcon} />
              <span className="font-inter text-[11px] uppercase tracking-[.1em]">
                {group.label.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}
