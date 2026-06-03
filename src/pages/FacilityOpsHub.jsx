import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchMaintenanceTasks, createMaintenanceTask, advanceTaskStatus, FlexiApiError } from '../lib/flexispaceApi'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavGroup, translateNavItem } from '../components/navigation'

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
      <path d="M5.5 5.5a2 2 0 0 1 4 .667c0 1.333-2 1.666-2 3"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7.5" cy="11" r="0.8" fill="currentColor" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M5.5 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 10l3-2.5L10 5"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 7.5h7.5"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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
  if (type === 'grid')    return <GridDotsIcon />
  if (type === 'wifi')    return <WifiSignalIcon />
  if (type === 'badge')   return <CardBadgeIcon />
  if (type === 'chart')   return <LineChartIcon />
  if (type === 'building') return <BuildingNavIcon />
  if (type === 'layout')  return <LayoutIcon />
  if (type === 'network') return <NavNetworkIcon />
  if (type === 'calendar') return <CalendarNavIcon />
  if (type === 'receipt') return <ReceiptIcon />
  if (type === 'today')   return <NavTodayIcon />
  if (type === 'wrench')  return <NavWrenchIcon />
  if (type === 'users')   return <UsersNavIcon />
  if (type === 'scanner') return <NavScannerIcon />
  if (type === 'command') return <NavCommandIcon />
  if (type === 'access')  return <NavAccessIcon />
  return null
}

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

const TEAM_OPTIONS = ['Cleaning Crew A', 'Cleaning Crew B', 'HVAC Team Alpha', 'HVAC Team Beta', 'IT Tech Squad', 'Security Team']


const STATUS_TO_STEP = { open: 0, assigned: 1, in_progress: 2, done: 3 }

const NOTIFICATION_FIELDS = [
  'id',
  'type',
  'title',
  'body',
  'data',
  'read_at',
  'created_at',
].join(', ')

function formatNotificationTime(value) {
  if (!value) return 'Just now'

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Just now'

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (diffSeconds < 60) return `${diffSeconds}s ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return `${Math.floor(diffHours / 24)}d ago`
}

function mapNotificationLevel(type) {
  const normalized = String(type || '').toLowerCase()

  if (
    normalized.includes('critical') ||
    normalized.includes('alert') ||
    normalized.includes('error') ||
    normalized.includes('incident') ||
    normalized.includes('security')
  ) {
    return 'critical'
  }

  if (
    normalized.includes('warning') ||
    normalized.includes('maintenance') ||
    normalized.includes('pending')
  ) {
    return 'warning'
  }

  return 'info'
}

function mapNotificationRow(row) {
  const title = row.title || 'Notification'
  const body = row.body || ''

  return {
    id: row.id,
    level: mapNotificationLevel(row.type),
    text: body ? `${title} — ${body}` : title,
    time: formatNotificationTime(row.created_at),
    unread: row.read_at === null,
  }
}
function getTaskIcon(taskType) {
  if (taskType === 'cleaning') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
  if (taskType === 'hvac') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
  if (taskType === 'security') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  )
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="14" width="20" height="8" rx="2" /><path d="M6 18h.01M10 18h.01" />
      <path d="M12 14V8" /><path d="M8 8l4-4 4 4" />
    </svg>
  )
}

function mapTaskRow(row) {
  const createdAt = new Date(row.created_at)
  const diffMs = Date.now() - createdAt.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const ago = diffMin < 60 ? `${diffMin}m ago` : `${Math.floor(diffMin / 60)}h ago`
  return {
    id:       row.id,
    location: row.location || '—',
    priority: row.priority === 'high' ? 'HIGH PRIORITY' : 'NORMAL',
    title:    row.title,
    ago,
    team:     row.assigned_to || '',
    taskType: row.task_type || 'other',
    icon:     getTaskIcon(row.task_type),
    status:   row.status,
  }
}

function TeamDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        aria-label="Select team"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-3 border border-line text-ink-2 font-inter text-[13px] hover:bg-ink/[.06] transition-all duration-200 cursor-pointer"
      >
        {value}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-20 bg-bg-2 border border-line rounded-xl shadow-card overflow-hidden shadow-xl min-w-[180px]">
          {TEAM_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 font-inter text-[13px] hover:bg-bg-3 transition-colors duration-150 cursor-pointer border-0 ${t === value ? 'text-accent' : 'text-ink-2'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onAdvance, advanceInFlight, t }) {
  const [team, setTeam] = useState(task.team)
  const isHigh = task.priority === 'HIGH PRIORITY'
  const currentStep = STATUS_TO_STEP[task.status]
  const actionLabels = [t('facility.actionAssign'), t('facility.actionStartWork'), t('facility.actionMarkDone'), '']
  const actionLabel = actionLabels[currentStep]
  const taskSteps = [t('facility.stepDetected'), t('facility.stepAssigned'), t('facility.stepInProgress'), t('facility.stepDone')]

  return (
    <div className={`bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden transition-transform duration-[350ms] ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 flex flex-col ${isHigh ? 'border-t-2 border-t-accent' : ''}`}>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2 shrink-0">
            {task.icon}
          </div>
          <span className="font-inter text-[11px] text-neutral-2 truncate">{task.location}</span>
          <span className={`ml-auto shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md font-inter text-[11px] uppercase tracking-[.1em] ${isHigh ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-bg-3 text-neutral-2 border border-line'}`}>
            <span className={`w-1 h-1 rounded-full ${isHigh ? 'bg-accent' : 'bg-neutral-2'}`} />
            {task.priority}
          </span>
        </div>
        <h3 className="font-inter text-[13px] font-semibold text-ink leading-snug mb-2">{task.title}</h3>
        <div className="flex items-center gap-1.5 text-neutral font-inter text-[13px]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          {t('facility.requestedAgo', { time: task.ago })}
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center gap-2">
        <TeamDropdown value={team} onChange={setTeam} />
        {task.status !== 'done' ? (
          <button
            onClick={onAdvance}
            disabled={advanceInFlight?.has(task.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter text-[13px] font-medium transition-all duration-200 cursor-pointer border disabled:opacity-60 disabled:cursor-not-allowed ${
              currentStep === 2
                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/20'
                : 'bg-bg-3 border-line text-ink hover:bg-ink/[.06]'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline points="2 6 5 9 10 3" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {advanceInFlight?.has(task.id) ? '...' : actionLabel}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 font-inter text-[11px] uppercase tracking-[.1em] text-[#10B981]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('facility.completedBadge')}
          </span>
        )}
      </div>

      {/* Dot stepper */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex items-center">
          {taskSteps.map((step, idx) => {
            const done = STATUS_TO_STEP[task.status] > idx
            const active = STATUS_TO_STEP[task.status] === idx
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    done ? 'bg-[#10B981]' : active ? 'bg-accent' : 'bg-bg-3 border border-line'
                  }`} />
                  <span className="font-inter text-[11px] text-neutral whitespace-nowrap">{step}</span>
                </div>
                {idx < taskSteps.length - 1 && (
                  <div className={`h-px flex-1 mx-1 mb-3 transition-all duration-300 ${
                    done ? 'bg-[#10B981]' : 'bg-line'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function FacilityOpsHub({ operatorMode = false }) {
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
  const [searchParams] = useSearchParams()
  const isOperator = operatorMode || searchParams.get('ctx') === 'operator'

  const [search, setSearch] = useState('')
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState('')
  const [taskReloadTick, setTaskReloadTick] = useState(0)
  const [advanceInFlight, setAdvanceInFlight] = useState(new Set())
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [newTaskModal, setNewTaskModal] = useState(false)
  const [newTaskForm, setNewTaskForm] = useState({ title: '', taskType: 'other', priority: 'normal', location: '', assignedTo: '' })
  const [newTaskError, setNewTaskError] = useState('')
  const [newTaskSubmitting, setNewTaskSubmitting] = useState(false)

  // Load tasks from API
  useEffect(() => {
    let mounted = true
    async function load() {
      setTasksLoading(true)
      setTasksError('')
      try {
        const rows = await fetchMaintenanceTasks()
        if (mounted) { setTasks(rows.map(mapTaskRow)); setTasksLoading(false) }
      } catch (err) {
        if (mounted) {
          setTasksError(err instanceof FlexiApiError ? err.message : 'Failed to load tasks.')
          setTasksLoading(false)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [taskReloadTick])

  // Realtime: reload tasks on INSERT/UPDATE
  useEffect(() => {
    const channel = supabase
      .channel('facility-ops-tasks-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_tasks' }, () => setTaskReloadTick((v) => v + 1))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'maintenance_tasks' }, () => setTaskReloadTick((v) => v + 1))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadNotifications() {
      const { data, error } = await supabase
        .from('notifications')
        .select(NOTIFICATION_FIELDS)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!isMounted) return
      if (error) return

      setNotifications((data ?? []).map(mapNotificationRow))
    }

    loadNotifications()

    const channel = supabase
      .channel('facility-ops-notifications-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        if (isMounted) loadNotifications()
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const [openGroups, setOpenGroups] = useState(() => {
    const defaults = {}
    NAV_GROUPS.forEach((g) => {
      defaults[g.id] = g.items.some((item) => item.path === location.pathname)
    })
    if (!Object.values(defaults).some(Boolean)) defaults['operations'] = true
    return defaults
  })
  const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  const advanceStatus = async (task) => {
    const steps = ['open', 'assigned', 'in_progress', 'done']
    const next = steps[steps.indexOf(task.status) + 1]
    if (!next) return
    setAdvanceInFlight((prev) => new Set([...prev, task.id]))
    try {
      await advanceTaskStatus({ taskId: task.id, newStatus: next, assignedTo: task.team || null })
      setTaskReloadTick((v) => v + 1)
    } catch {
      // silently ignore — task list will not change
    } finally {
      setAdvanceInFlight((prev) => { const n = new Set(prev); n.delete(task.id); return n })
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskForm.title.trim()) { setNewTaskError('Title is required.'); return }
    setNewTaskSubmitting(true)
    setNewTaskError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: officeRows } = await supabase
        .from('offices')
        .select('id')
        .eq('owner_id', user?.id)
        .is('deleted_at', null)
        .limit(1)
      const officeId = officeRows?.[0]?.id ?? null
      if (!officeId) { setNewTaskError('No office found for your account.'); setNewTaskSubmitting(false); return }
      await createMaintenanceTask({
        officeId,
        title:      newTaskForm.title.trim(),
        taskType:   newTaskForm.taskType,
        priority:   newTaskForm.priority,
        location:   newTaskForm.location.trim() || null,
        assignedTo: newTaskForm.assignedTo.trim() || null,
      })
      setNewTaskModal(false)
      setNewTaskForm({ title: '', taskType: 'other', priority: 'normal', location: '', assignedTo: '' })
      setTaskReloadTick((v) => v + 1)
    } catch (err) {
      setNewTaskError(err instanceof FlexiApiError ? err.message : 'Failed to create task.')
    } finally {
      setNewTaskSubmitting(false)
    }
  }

  const filteredTasks = tasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase())
    const matchType =
      typeFilter === 'all' || t.taskType === typeFilter
    const matchPriority =
      priorityFilter === 'all' ||
      (priorityFilter === 'high' && t.priority === 'HIGH PRIORITY') ||
      (priorityFilter === 'normal' && t.priority === 'NORMAL')
    return matchSearch && matchType && matchPriority
  })

  const activeCount = tasks.filter((t) => t.status !== 'done').length
  const highCount = tasks.filter((t) => t.priority === 'HIGH PRIORITY' && t.status !== 'done').length
  const criticalNotifs = notifications.filter((n) => n.level === 'critical').length

  return (
    <div className="min-h-screen bg-bg flex flex-col font-inter">
      {/* Unified Header */}
      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
        <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full flex items-center px-3 gap-2">
          <span className="text-neutral shrink-0"><SearchIcon /></span>
          <input
            type="text"
            placeholder={t('facility.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none font-inter text-[13px] text-ink placeholder:text-neutral py-1.5"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <LanguageSwitcher compact />
          <div className="relative">
            <button
              aria-label={t('common.notifications')}
              onClick={() => setNotifOpen(true)}
              className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
            >
              <BellIcon />
            </button>
            {criticalNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-400 border-2 border-bg-2 flex items-center justify-center font-inter text-[9px] text-white font-bold">
                {criticalNotifs}
              </span>
            )}
          </div>
          <button
            aria-label={t('common.help')}
            className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors duration-200 cursor-pointer bg-transparent border-0"
          >
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

        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8">
          {/* Page Header */}
          <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
            <div>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('facility.section')}</p>
              <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('facility.title')}</h1>
              <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('facility.subtitle')}</p>
            </div>
            <button
              aria-label={t('facility.requestMaintenance')}
              onClick={() => { setNewTaskModal(true); setNewTaskError('') }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-inter text-[13px] font-semibold hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0 shrink-0 ml-auto mt-1"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <line x1="6.5" y1="1.5" x2="6.5" y2="11.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1.5" y1="6.5" x2="11.5" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {t('facility.requestMaintenance')}
            </button>
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2 mb-4 flex-wrap animate-fadeUp" style={{ '--delay': '80ms' }}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-line bg-ink/[.06] font-inter text-[11px] uppercase tracking-[.1em] text-ink-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              {activeCount} {t('facility.activeTasks')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-line bg-ink/[.06] font-inter text-[11px] uppercase tracking-[.1em] text-ink-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {highCount} {t('facility.high')} {t('facility.priority')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-line bg-ink/[.06] font-inter text-[11px] uppercase tracking-[.1em] text-ink-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              2 {t('facility.delayed')}
            </span>
          </div>

          {/* Quick filter bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap animate-fadeUp" style={{ '--delay': '120ms' }}>
            <div className="flex items-center bg-bg-2 border border-line rounded-xl p-1 gap-0.5">
              {[
                { id: 'all', label: t('facility.allTypes') },
                { id: 'cleaning', label: t('facility.cleaning') },
                { id: 'hvac', label: t('facility.hvac') },
                { id: 'it', label: t('facility.it') },
                { id: 'security', label: t('facility.security') },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-inter text-[13px] font-medium transition-all duration-200 cursor-pointer border-0 ${
                    typeFilter === f.id ? 'bg-bg-3 text-ink' : 'bg-transparent text-neutral-2 hover:text-ink'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center bg-bg-2 border border-line rounded-xl p-1 gap-0.5">
              {[
                { id: 'all', label: t('facility.allPriority') },
                { id: 'high', label: t('facility.high') },
                { id: 'normal', label: t('facility.normal') },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setPriorityFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-inter text-[13px] font-medium transition-all duration-200 cursor-pointer border-0 ${
                    priorityFilter === f.id ? 'bg-bg-3 text-ink' : 'bg-transparent text-neutral-2 hover:text-ink'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Operational trigger banner */}
          <div className="border-l-4 border-accent bg-accent/[.06] rounded-r-xl p-4 mb-6 flex items-start gap-3 animate-fadeUp" style={{ '--delay': '160ms' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <div className="font-inter text-[13px] font-semibold text-ink mb-1">{t('facility.triggerTitle')}</div>
              <div className="font-inter text-[13px] text-neutral leading-relaxed">
                {t('facility.triggerBody')}
              </div>
            </div>
          </div>

          {/* Task grid */}
          {tasksLoading ? (
            <div className="py-20 text-center">
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('common.loading')}</p>
            </div>
          ) : tasksError ? (
            <div className="py-12 text-center">
              <p className="font-inter text-[13px] text-red-400">{tasksError}</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-20 text-center">
              <div className="font-inter text-[13px] font-semibold text-ink">{t('facility.noTasks')}</div>
              <div className="font-inter text-[13px] text-neutral mt-1">
                {tasks.length === 0 ? t('facility.allCompleted') : t('facility.adjustFilters')}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredTasks.map((task, i) => (
                <div key={task.id} className="animate-fadeUp" style={{ '--delay': `${i * 80 + 200}ms` }}>
                  <TaskCard task={task} onAdvance={() => advanceStatus(task)} advanceInFlight={advanceInFlight} t={t} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* New Task Modal */}
      {newTaskModal && (
        <>
          <div
            onClick={() => setNewTaskModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Request Maintenance"
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
          >
            <div className="bg-bg-2 border border-line rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-inter text-[16px] font-semibold text-ink">{t('facility.requestMaintenance')}</h2>
                <button
                  onClick={() => setNewTaskModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                <div>
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. HVAC Unit Rattling"
                    className="w-full bg-bg-3 border border-line rounded-xl px-3 py-2.5 font-inter text-[13px] text-ink placeholder:text-neutral outline-none focus:border-accent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Type</label>
                    <select
                      value={newTaskForm.taskType}
                      onChange={(e) => setNewTaskForm((f) => ({ ...f, taskType: e.target.value }))}
                      className="w-full bg-bg-3 border border-line rounded-xl px-3 py-2.5 font-inter text-[13px] text-ink outline-none focus:border-accent"
                    >
                      <option value="cleaning">Cleaning</option>
                      <option value="hvac">HVAC</option>
                      <option value="it">IT</option>
                      <option value="security">Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Priority</label>
                    <select
                      value={newTaskForm.priority}
                      onChange={(e) => setNewTaskForm((f) => ({ ...f, priority: e.target.value }))}
                      className="w-full bg-bg-3 border border-line rounded-xl px-3 py-2.5 font-inter text-[13px] text-ink outline-none focus:border-accent"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Location</label>
                  <input
                    type="text"
                    value={newTaskForm.location}
                    onChange={(e) => setNewTaskForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Floor 2, Room B"
                    className="w-full bg-bg-3 border border-line rounded-xl px-3 py-2.5 font-inter text-[13px] text-ink placeholder:text-neutral outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Assign To</label>
                  <input
                    type="text"
                    value={newTaskForm.assignedTo}
                    onChange={(e) => setNewTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
                    placeholder="e.g. Cleaning Crew A"
                    className="w-full bg-bg-3 border border-line rounded-xl px-3 py-2.5 font-inter text-[13px] text-ink placeholder:text-neutral outline-none focus:border-accent"
                  />
                </div>
                {newTaskError && (
                  <p className="font-inter text-[13px] text-red-400">{newTaskError}</p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={newTaskSubmitting}
                    className="flex-1 bg-accent text-white rounded-full font-inter text-[13px] font-medium px-5 py-2.5 hover:bg-accent-2 transition-all duration-200 border-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {newTaskSubmitting ? '...' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskModal(false)}
                    className="flex-1 border border-line text-neutral-2 rounded-full font-inter text-[13px] px-5 py-2.5 hover:text-ink hover:bg-ink/[.06] transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Notification Drawer */}
      {notifOpen && (
        <>
          <div
            onClick={() => setNotifOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <div className="fixed top-14 right-0 bottom-0 w-80 bg-bg-2 border-l border-line z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div>
                <div className="font-inter text-[13px] font-semibold text-ink">{t('facility.notifications')}</div>
                <div className="font-inter text-[11px] text-neutral mt-0.5 uppercase tracking-[.1em]">
                  {t('facility.criticalAlerts', { count: criticalNotifs })}
                </div>
              </div>
              <button
                onClick={() => setNotifOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col overflow-y-auto flex-1 p-3 gap-2">
              {notifications.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12 text-center">
                  <div>
                    <div className="font-inter text-[13px] font-semibold text-ink">{t('facility.noNotifications')}</div>
                    <div className="font-inter text-[12px] text-neutral mt-1">{t('facility.allCaughtUp')}</div>
                  </div>
                </div>
              ) : notifications.map((n) => {
                const styles = {
                  critical: { bg: 'bg-red-500/10', border: 'border-red-400/30', dot: 'bg-red-400' },
                  warning: { bg: 'bg-amber-400/10', border: 'border-amber-400/30', dot: 'bg-amber-400' },
                  info: { bg: 'bg-bg-3', border: 'border-line', dot: 'bg-neutral' },
                }[n.level]
                return (
                  <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${styles.bg} ${styles.border}`}>
                    <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${styles.dot} ${n.level === 'critical' ? 'animate-pulse' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-inter text-[13px] text-ink leading-snug">{n.text}</div>
                      <div className="font-inter text-[11px] text-neutral mt-1">{n.time}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-3 border-t border-line">
              <button
                onClick={() => setNotifOpen(false)}
                className="w-full py-2 rounded-xl bg-bg-3 border border-line font-inter text-[13px] text-neutral-2 hover:text-ink hover:bg-ink/[.06] transition-all duration-200 cursor-pointer"
              >
                {t('facility.markAllRead')}
              </button>
            </div>
          </div>
        </>
      )}

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
