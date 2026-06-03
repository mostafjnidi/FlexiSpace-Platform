import { useEffect, useState, Fragment } from 'react'
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

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="2.5" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
    </svg>
  )
}

function UnlockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="2.5" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7V5a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7.5 4.5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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

// ── Mock Data ─────────────────────────────────────────────────────────────

const INITIAL_USERS = [
  {
    id: 'USR-8821',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@email.com',
    tier: 'Premium',
    role: 'client',
    status: 'active',
    iotAccess: 'granted',
    lastSeen: 'Today, 14:05',
    history: [
      { event: 'Gate Entry — Node A3',           time: 'Today, 14:05',       type: 'success' },
      { event: 'Session Started — Quantum Suite', time: 'Today, 14:06',       type: 'info'    },
      { event: 'Gate Entry — Node A3',           time: 'Yesterday, 09:30',   type: 'success' },
      { event: 'Session Ended — Quantum Suite',  time: 'Yesterday, 17:00',   type: 'info'    },
    ],
  },
  {
    id: 'USR-8820',
    name: 'Marcus Thorne',
    email: 'm.thorne@corp.io',
    tier: 'Enterprise',
    role: 'operator',
    status: 'active',
    iotAccess: 'granted',
    lastSeen: 'Today, 11:30',
    history: [
      { event: 'Gate Entry — Node B1',              time: 'Today, 11:30',  type: 'success' },
      { event: 'Session Started — Nexus Hub Alpha', time: 'Today, 11:32',  type: 'info'    },
      { event: 'Subscription Renewed',              time: '3 days ago',    type: 'success' },
    ],
  },
  {
    id: 'USR-8819',
    name: 'Elena Rostova',
    email: 'elena.r@studio.co',
    tier: 'Standard',
    role: 'client',
    status: 'suspended',
    iotAccess: 'revoked',
    lastSeen: 'Yesterday, 18:44',
    history: [
      { event: 'Account Suspended — Policy Violation', time: 'Today, 08:00',       type: 'alert'   },
      { event: 'IoT Access Revoked',                   time: 'Today, 08:01',       type: 'alert'   },
      { event: 'Gate Entry — Node C2',                 time: 'Yesterday, 18:44',   type: 'success' },
      { event: 'Unauthorized Attempt — Node C2',       time: 'Yesterday, 23:11',   type: 'alert'   },
    ],
  },
  {
    id: 'USR-8818',
    name: 'James Wu',
    email: 'james.wu@ventures.com',
    tier: 'Premium',
    role: 'client',
    status: 'pending',
    iotAccess: 'granted',
    lastSeen: '3 days ago',
    history: [
      { event: 'Registration Submitted',    time: '3 days ago', type: 'info' },
      { event: 'Email Verification Pending', time: '3 days ago', type: 'info' },
    ],
  },
  {
    id: 'USR-8817',
    name: 'Layla Hassan',
    email: 'layla.h@designco.ae',
    tier: 'Standard',
    role: 'client',
    status: 'active',
    iotAccess: 'revoked',
    lastSeen: 'Today, 09:15',
    history: [
      { event: 'IoT Access Revoked — Manual Override', time: 'Today, 09:00',  type: 'alert'   },
      { event: 'Gate Entry Denied — Node A1',          time: 'Today, 09:15',  type: 'alert'   },
      { event: 'Session Ended — Hot Desk 02',          time: '2 days ago',    type: 'info'    },
    ],
  },
]

function formatProfileDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function mapProfileRole(role) {
  if (role === 'ADMIN') return 'admin'
  if (role === 'OPERATOR' || role === 'OWNER') return 'operator'
  return 'client'
}

function mapProfileRow(profile) {
  const isActive = profile.is_active && !profile.deleted_at
  const status = isActive ? 'active' : 'suspended'

  return {
    id: `USR-${String(profile.id).slice(0, 8).toUpperCase()}`,
    name: profile.full_name || 'Unnamed Member',
    email: profile.email || 'No email on file',
    tier: 'Standard',
    role: mapProfileRole(profile.role),
    status,
    iotAccess: isActive ? 'granted' : 'revoked',
    lastSeen: formatProfileDate(profile.updated_at || profile.created_at),
    history: [
      {
        event: 'Profile visible under current access rules',
        time: formatProfileDate(profile.updated_at || profile.created_at),
        type: 'info',
      },
    ],
  }
}

const STATUS_FILTERS = ['All', 'Active', 'Suspended', 'Pending']
const IOT_FILTERS    = ['All', 'Granted', 'Revoked']

const STATUS_FILTER_LABEL_KEYS = {
  All: 'userManagement.accountStatusAll',
  Active: 'userManagement.activeBadge',
  Suspended: 'userManagement.suspendedBadge',
  Pending: 'userManagement.pendingBadge',
}

const IOT_FILTER_LABEL_KEYS = {
  All: 'userManagement.iotAccessAll',
  Granted: 'userManagement.grantedBadge',
  Revoked: 'userManagement.revokedBadge',
}

// ── Sub-components ────────────────────────────────────────────────────────

function TierBadge({ tier, t }) {
  if (tier === 'Enterprise') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-purple-400/10 border-purple-400/30 text-purple-300 font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 1.5L10.5 6 6 10.5 1.5 6 6 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
      {t('userManagement.enterprise')}
    </span>
  )
  if (tier === 'Premium') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-amber-400/10 border-amber-400/30 text-amber-400 font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M6 1l1.3 3.8H11L8 7l1.1 3.8L6 8.6 2.9 10.8 4 7 1 4.8h3.7L6 1Z" />
      </svg>
      {t('userManagement.premium')}
    </span>
  )
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full border bg-neutral-400/10 border-neutral-400/20 text-neutral font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      {t('userManagement.standard')}
    </span>
  )
}

function StatusBadge({ status, t }) {
  if (status === 'active') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
      {t('userManagement.activeBadge')}
    </span>
  )
  if (status === 'suspended') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-red-400/10 border-red-400/30 text-red-400 font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      {t('userManagement.suspendedBadge')}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-amber-400/10 border-amber-400/30 text-amber-400 font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      {t('userManagement.pendingBadge')}
    </span>
  )
}

function IoTIndicator({ access, t }) {
  if (access === 'granted') return (
    <span className="inline-flex items-center gap-1.5 text-[#10B981] font-inter text-[11px] uppercase tracking-[.1em]">
      <UnlockIcon /> {t('userManagement.grantedBadge')}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 text-red-400 font-inter text-[11px] uppercase tracking-[.1em]">
      <LockIcon /> {t('userManagement.revokedBadge')}
    </span>
  )
}

function RoleBadge({ role, t }) {
  if (role === 'admin') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-accent/10 border-accent/30 text-accent font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M6 1L1.5 3.5v3C1.5 9 3.5 10.8 6 11.5c2.5-.7 4.5-2.5 4.5-5v-3L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      {t('userManagement.adminBadge')}
    </span>
  )
  if (role === 'operator') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-blue-400/10 border-blue-400/30 text-blue-300 font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1.5 10.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {t('userManagement.operatorBadge')}
    </span>
  )
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full border bg-neutral-400/10 border-neutral-400/20 text-neutral font-inter text-[11px] uppercase tracking-[.1em] whitespace-nowrap">
      {t('userManagement.clientBadge')}
    </span>
  )
}

function HistoryEventRow({ event }) {
  const color =
    event.type === 'success' ? '#10B981' :
    event.type === 'alert'   ? '#f87171' : '#64748b'
  return (
    <div className="flex items-start gap-3 py-2 border-b border-line/50 last:border-0">
      <span className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className="font-inter text-[12px] text-ink leading-snug">{event.event}</p>
        <p className="font-inter text-[11px] text-neutral mt-0.5">{event.time}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function UserManagement() {
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

  const [users, setUsers]                         = useState(INITIAL_USERS)
  const [search, setSearch]                       = useState('')
  const [statusFilter, setStatusFilter]           = useState('All')
  const [iotFilter, setIotFilter]                 = useState('All')
  const [openHistoryId, setOpenHistoryId]         = useState(null)
  const [confirmSuspendId, setConfirmSuspendId]   = useState(null)
  const [loadingUsers, setLoadingUsers]           = useState(true)
  const [userLoadError, setUserLoadError]         = useState(false)

  const [openGroups, setOpenGroups] = useState(() => {
    const d = {}
    NAV_GROUPS.forEach((g) => { d[g.id] = g.items.some((i) => i.path === location.pathname) })
    if (!Object.values(d).some(Boolean)) d['members'] = true
    return d
  })

  const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  useEffect(() => {
    let mounted = true

    async function loadProfiles() {
      setLoadingUsers(true)
      setUserLoadError(false)

      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,full_name,role,is_active,created_at,updated_at,deleted_at')
        .order('created_at', { ascending: false })

      if (!mounted) return

      if (error || !data?.length) {
        setUsers(INITIAL_USERS)
        setUserLoadError(!!error)
        setLoadingUsers(false)
        return
      }

      setUsers(data.map(mapProfileRow))
      setLoadingUsers(false)
    }

    loadProfiles()

    return () => {
      mounted = false
    }
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────────

  const changeRole = (id, newRole) => {
    setUsers((prev) =>
      prev.map((u) => u.id !== id ? u : { ...u, role: newRole })
    )
  }

  const toggleIoT = (id) => {
    setUsers((prev) =>
      prev.map((u) => u.id !== id ? u : { ...u, iotAccess: u.iotAccess === 'granted' ? 'revoked' : 'granted' })
    )
  }

  const initSuspend = (id) => {
    setConfirmSuspendId(id)
    setOpenHistoryId(null)
  }

  const applySuspend = (id) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u
        const next = u.status === 'suspended' ? 'active' : 'suspended'
        return { ...u, status: next, iotAccess: next === 'suspended' ? 'revoked' : u.iotAccess }
      })
    )
    setConfirmSuspendId(null)
  }

  const toggleHistory = (id) => {
    setOpenHistoryId((prev) => (prev === id ? null : id))
    setConfirmSuspendId(null)
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || u.status === statusFilter.toLowerCase()
    const matchIoT    = iotFilter === 'All'    || u.iotAccess === iotFilter.toLowerCase()
    return matchSearch && matchStatus && matchIoT
  })

  const alertCount   = users.filter((u) => u.status === 'suspended').length
  const revokedCount = users.filter((u) => u.iotAccess === 'revoked').length

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg flex flex-col font-inter">

      {/* ── Header ── */}
      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="mono" iconSize={22} /></Link>

        <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full flex items-center px-3 gap-2">
          <span className="text-neutral shrink-0 pointer-events-none"><SearchIcon /></span>
          <input
            type="text"
            placeholder={t('userManagement.searchPlaceholder')}
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
              <SupportIcon /> {t('userManagement.support')}
            </button>
            <button onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left">
              <LogoutIcon /> {t('userManagement.signOut')}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8 min-w-0">

          {/* Page title */}
          <div className="mb-8 animate-fadeUp" style={{ '--delay': '0ms' }}>
            <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1">{t('userManagement.members')}</p>
            <h1 className="font-inter text-[30px] font-bold text-ink leading-none tracking-[.02em] mb-2">
              {t('userManagement.registeredMembers')}
            </h1>
            <p className="font-inter text-[13px] text-neutral max-w-xl">
              {t('userManagement.subtitleFull')}
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8 animate-fadeUp" style={{ '--delay': '40ms' }}>
            <div className="bg-bg border border-line rounded-xl px-5 py-4">
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-3">{t('userManagement.totalRegistered')}</p>
              <p className="font-inter text-[30px] font-bold text-ink leading-none tracking-[.02em]">1,248</p>
              <p className="font-inter text-[11px] text-neutral mt-2">{t('userManagement.allPlatformAccounts')}</p>
            </div>

            <div className="bg-bg border border-line rounded-xl px-5 py-4">
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-3">{t('userManagement.currentlyInSpace')}</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                <p className="font-inter text-[30px] font-bold text-accent leading-none tracking-[.02em]">42</p>
              </div>
              <p className="font-inter text-[11px] text-neutral mt-2">{t('userManagement.activeViaIot')}</p>
            </div>

            <div className={`bg-bg border rounded-xl px-5 py-4 transition-colors duration-300 ${alertCount > 0 ? 'border-red-400/30' : 'border-line'}`}>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-3">{t('userManagement.securityAlerts')}</p>
              <div className="flex items-center gap-2">
                {alertCount > 0 && <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />}
                <p className={`font-inter text-[30px] font-bold leading-none tracking-[.02em] transition-colors duration-300 ${alertCount > 0 ? 'text-red-400' : 'text-ink'}`}>
                  {alertCount}
                </p>
              </div>
              <p className="font-inter text-[11px] text-neutral mt-2">{t('userManagement.accountsSuspended')}</p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap animate-fadeUp" style={{ '--delay': '60ms' }}>
            <div className="flex-1 min-w-[200px] relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
                <SearchIcon />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('userManagement.searchPlaceholder')}
                className="w-full pl-8 pr-3 py-2 bg-bg border border-line rounded-lg font-inter text-[13px] text-ink placeholder-neutral focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-bg border border-line rounded-lg font-inter text-[13px] text-ink focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f} value={f}>{t(STATUS_FILTER_LABEL_KEYS[f])}</option>
              ))}
            </select>
            <select
              value={iotFilter}
              onChange={(e) => setIotFilter(e.target.value)}
              className="px-3 py-2 bg-bg border border-line rounded-lg font-inter text-[13px] text-ink focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
            >
              {IOT_FILTERS.map((f) => (
                <option key={f} value={f}>{t(IOT_FILTER_LABEL_KEYS[f])}</option>
              ))}
            </select>
          </div>

          {(loadingUsers || userLoadError) && (
            <div className="mb-5 animate-fadeUp" style={{ '--delay': '70ms' }}>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">
                {loadingUsers ? t('userManagement.loadingMembers') : t('userManagement.showingFallback')}
              </p>
            </div>
          )}

          {/* Table */}
          <div className="border border-line rounded-xl overflow-hidden animate-fadeUp" style={{ '--delay': '80ms' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {[
                    t('userManagement.userId'),
                    t('userManagement.nameContact'),
                    t('userManagement.tier'),
                    t('userManagement.role'),
                    t('userManagement.status'),
                    t('userManagement.iotGateAccess'),
                    t('userManagement.actions'),
                  ].map((col) => (
                    <th key={col} className="px-5 py-3 text-left font-inter text-[11px] uppercase tracking-[.1em] text-neutral whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center font-inter text-[12px] text-neutral">
                      {t('userManagement.noMembersMatch')}
                    </td>
                  </tr>
                )}

                {filtered.map((user) => (
                  <Fragment key={user.id}>

                    {/* Main row */}
                    <tr className={`border-b border-line transition-colors hover:bg-line/20 ${user.status === 'suspended' ? 'opacity-60' : ''}`}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-inter text-[12px] text-neutral">{user.id}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-inter text-[13px] font-medium text-ink leading-snug">{user.name}</p>
                        <p className="font-inter text-[11px] text-neutral mt-0.5">{user.email}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <TierBadge tier={user.tier} t={t} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={user.role} t={t} />
                          <select
                            value={user.role}
                            onChange={(e) => changeRole(user.id, e.target.value)}
                            className="px-1.5 py-0.5 bg-bg border border-line rounded text-neutral font-inter text-[11px] focus:outline-none focus:border-accent/50 cursor-pointer transition-colors hover:border-neutral/40"
                          >
                            <option value="client">Client</option>
                            <option value="operator">Operator</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} t={t} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <IoTIndicator access={user.iotAccess} t={t} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 flex-wrap">

                          {/* Toggle IoT */}
                          <button
                            onClick={() => toggleIoT(user.id)}
                            className={`px-2.5 py-1 rounded-md border font-inter text-[11px] uppercase tracking-[.1em] transition-colors whitespace-nowrap ${
                              user.iotAccess === 'granted'
                                ? 'border-red-400/30 text-red-400 hover:bg-red-400/10'
                                : 'border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10'
                            }`}
                          >
                            {user.iotAccess === 'granted' ? t('userManagement.revokeAccess') : t('userManagement.grantAccess')}
                          </button>

                          {/* Suspend / Unban */}
                          <button
                            onClick={() =>
                              user.status === 'suspended' ? applySuspend(user.id) : initSuspend(user.id)
                            }
                            className={`px-2.5 py-1 rounded-md border font-inter text-[11px] uppercase tracking-[.1em] transition-colors whitespace-nowrap ${
                              user.status === 'suspended'
                                ? 'border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/10'
                                : 'border-amber-400/30 text-amber-400 hover:bg-amber-400/10'
                            }`}
                          >
                            {user.status === 'suspended' ? t('userManagement.unban') : t('userManagement.suspendUser')}
                          </button>

                          {/* History */}
                          <button
                            onClick={() => toggleHistory(user.id)}
                            title="View Activity History"
                            className={`p-1.5 rounded-md border transition-colors ${
                              openHistoryId === user.id
                                ? 'border-accent/40 text-accent bg-accent/10'
                                : 'border-line text-neutral hover:text-ink hover:border-neutral/40'
                            }`}
                          >
                            <HistoryIcon />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Confirm suspend row */}
                    {confirmSuspendId === user.id && (
                      <tr key={`confirm-${user.id}`} className="border-b border-amber-400/20 bg-amber-400/[.03]">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-inter text-[11px] text-amber-400 uppercase tracking-[.1em]">
                              {t('userManagement.suspendWarning', { name: user.name })}
                            </span>
                            <button
                              onClick={() => applySuspend(user.id)}
                              className="px-3 py-1 rounded-md bg-red-400/10 border border-red-400/30 text-red-400 font-inter text-[11px] uppercase tracking-[.1em] hover:bg-red-400/20 transition-colors"
                            >
                              {t('userManagement.confirmSuspend')}
                            </button>
                            <button
                              onClick={() => setConfirmSuspendId(null)}
                              className="px-3 py-1 rounded-md border border-line text-neutral font-inter text-[11px] uppercase tracking-[.1em] hover:text-ink transition-colors"
                            >
                              {t('common.cancel')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* History expand row */}
                    {openHistoryId === user.id && (
                      <tr key={`history-${user.id}`} className="border-b border-line bg-line/10">
                        <td colSpan={7} className="px-8 py-5">
                          <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-3">
                            {t('userManagement.activityLog')} — {user.name}
                            <span className="ml-3 normal-case text-neutral/60">{t('userManagement.lastSeenLabel')} {user.lastSeen}</span>
                          </p>
                          <div className="max-w-lg">
                            {user.history.map((h) => (
                              <HistoryEventRow key={`${h.time}-${h.event}`} event={h} />
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}

                  </Fragment>
                ))}
              </tbody>
            </table>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-line flex items-center justify-between">
              <span className="font-inter text-[11px] text-neutral">
                {t('userManagement.showingOf', { shown: filtered.length, total: users.length })}
              </span>
              <span className="font-inter text-[11px] text-neutral">
                {t('userManagement.suspendedCount', { count: alertCount })} · {t('userManagement.iotRevokedCount', { count: revokedCount })}
              </span>
            </div>
          </div>

        </main>
      </div>

      {/* ── Mobile Nav ── */}
      <nav className="app-mobile-nav fixed bottom-0 left-0 right-0 border-t border-line flex md:hidden z-50">
        {NAV_GROUPS.map((rawGroup) => {
          const group = translateNavGroup(rawGroup, t)
          const active =
            location.pathname === rawGroup.mobilePath ||
            rawGroup.items.some((i) => i.path === location.pathname)
          return (
            <button
              key={rawGroup.id}
              onClick={() => navigate(rawGroup.mobilePath)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                active ? 'text-accent' : 'text-neutral hover:text-ink'
              }`}
            >
              <NavIcon type={rawGroup.mobileIcon} />
              <span className="font-inter text-[11px] uppercase tracking-[.1em]">{group.label}</span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}
