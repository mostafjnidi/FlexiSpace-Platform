import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavGroup, translateNavItem, translateStatusLabel } from '../components/navigation'

// ── Unified icons ─────────────────────────────────────────────────────────

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
  if (type === 'grid')     return <GridDotsIcon />
  if (type === 'wifi')     return <WifiSignalIcon />
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

// ── Domain icons ──────────────────────────────────────────────────────────

function DoorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="1.5" width="10" height="11" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5 7h1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M2 12.5h10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function NfcIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2 6.5a4.5 4.5 0 0 1 9 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 6.5a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

function QrIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="7.5" y="1.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="1.5" y="7.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="2.8" y="2.8" width="1.4" height="1.4" fill="currentColor" />
      <rect x="8.8" y="2.8" width="1.4" height="1.4" fill="currentColor" />
      <rect x="2.8" y="8.8" width="1.4" height="1.4" fill="currentColor" />
      <path d="M7.5 7.5h2M11.5 7.5v2M9.5 9.5h2M7.5 11.5V9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function CamMethodIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <rect x="1" y="3" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="6.5" cy="7" r="2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.5 3l.8-1.5h2.4L8.5 3" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="4.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M6.5 6h5M10 6v1.5M8 6v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L1.5 13.5h13L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 7v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 5v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


function PersonDefaultIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function PersonXIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 18c0-3.866 3.134-7 7-7 1.5 0 2.9.47 4 1.28" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14 12l4 4M18 12l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PersonGearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 17c0-3.314 2.91-6 6.5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="15" cy="14.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M15 11v1M15 17v1M12 14.5h1M17 14.5h1M12.9 12.4l.7.7M16.4 15.9l.7.7M12.9 16.6l.7-.7M16.4 13.1l.7-.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2 4h11M4.5 7.5h6M7 11h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M7.5 2v8M4.5 7.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <rect x="2.5" y="6.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7.5" cy="10" r="1.2" fill="currentColor" />
    </svg>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────

const OPERATOR_ITEMS = [
  { label: 'Command Center',   shortLabel: 'Command',  path: '/command-center',   icon: 'command' },
  { label: "Today's Bookings", shortLabel: "Today's",  path: '/todays-bookings',  icon: 'today'   },
  { label: 'Scanner Control',  shortLabel: 'Scanner',  path: '/scanner-control',  icon: 'scanner' },
  { label: 'Live Access Feed', shortLabel: 'Access',   path: '/access-logs',      icon: 'access'  },
  { label: 'Facility Ops Hub', shortLabel: 'Facility', path: '/facility-ops-hub', icon: 'wrench'  },
]

const NAV_GROUPS = [
  {
    id: 'overview', label: 'Overview', mobileIcon: 'grid', mobilePath: '/owner-dashboard',
    items: [{ label: 'Dashboard', path: '/owner-dashboard', icon: 'grid' }],
  },
  {
    id: 'operations', label: 'Operations', mobileIcon: 'calendar', mobilePath: '/workspace-ops',
    items: [
      { label: 'Live Operations',   path: '/workspace-ops',          icon: 'layout'   },
      { label: "Today's Bookings",  path: '/todays-bookings',        icon: 'today'    },
      { label: 'Bookings Command',  path: '/bookings-command-center', icon: 'calendar' },
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

// ── Data mapping ─────────────────────────────────────────────────────────

function normalizeMethod(method) {
  if (!method) return 'nfc'
  const m = method.toLowerCase()
  if (m.includes('qr')) return 'qr'
  if (m.includes('override')) return 'override'
  if (m.includes('app') || m.includes('pin')) return 'pin'
  if (m.includes('lpr')) return 'lpr'
  return 'nfc'
}

function mapReadModelRow(row) {
  return {
    id: row.id,
    accessEventId: row.access_event_id,
    timestamp: row.time_label ?? '—',
    date: row.date_label ?? '—',
    userId: row.actor_display_id ?? '—',
    name: row.actor_display_name ?? '—',
    userType: (row.actor_display_type ?? 'employee').toLowerCase(),
    location: row.location_label ?? '—',
    method: normalizeMethod(row.access_method),
    status: row.status,
    statusLabel: row.status_label ?? '—',
    isSecurityAlert: row.is_security_alert ?? false,
    isAnomaly: row.is_anomaly ?? false,
    reason: row.reason_label ?? null,
    occurredAt: row.occurred_at ?? null,
  }
}

// ── Sub-components ────────────────────────────────────────────────────────

function UserAvatar({ userType }) {
  if (userType === 'unknown') {
    return (
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', color: '#f87171' }}>
        <PersonXIcon />
      </div>
    )
  }
  if (userType === 'admin') {
    return (
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(71,85,105,0.08)', border: '1px solid rgba(71,85,105,0.08)', color: '#10B981' }}>
        <PersonGearIcon />
      </div>
    )
  }
  return (
    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-bg-3 border border-line text-neutral">
      <PersonDefaultIcon />
    </div>
  )
}

function MethodBadge({ method }) {
  const { t } = useI18n()
  const cfg = {
    nfc:      { label: 'NFC Card',        icon: <NfcIcon />,       style: { backgroundColor: 'rgba(59,130,246,.1)',  border: '1px solid rgba(59,130,246,.2)',  color: '#60a5fa' } },
    qr:       { label: 'QR Code',         icon: <QrIcon />,        style: { backgroundColor: 'rgba(168,85,247,.1)',  border: '1px solid rgba(168,85,247,.2)',  color: '#c084fc' } },
    lpr:      { label: 'LPR Scan',        icon: <CamMethodIcon />, style: { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',   color: '#CBD5E1' } },
    override: { label: 'Manual Override', icon: <KeyIcon />,       style: { backgroundColor: 'rgba(234,179,8,.1)',   border: '1px solid rgba(234,179,8,.2)',   color: '#facc15' } },
    pin: {
      label: t('accessLogs.methodLabels.app-unlock'),
      icon: (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
          <rect x="2" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
          <path d="M4 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <circle cx="6.5" cy="9" r="1" fill="currentColor" />
        </svg>
      ),
      style: {
        backgroundColor: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.2)',
        color: '#10B981',
      },
    },
  }[method]

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-inter text-[11px] whitespace-nowrap" style={cfg.style}>
      {cfg.icon}
      {t(`accessLogs.methodLabels.${method}`)}
    </div>
  )
}

const STATUS_CFG = {
  granted:     { color: '#10B981', textClass: '',               icon: <CheckCircleIcon /> },
  'pending-ack': { color: '#F59E0B', textClass: '',             icon: <ClockIcon /> },
  denied:      { color: '#f87171', textClass: 'text-red-400',   icon: <WarningIcon /> },
  revoked:     { color: '#f87171', textClass: 'text-red-400',   icon: <WarningIcon /> },
}

function StatusBadge({ status, statusLabel }) {
  const { t } = useI18n()
  const cfg = STATUS_CFG[status]
  const label = translateStatusLabel(status, t, statusLabel && statusLabel !== '—' ? statusLabel : undefined)

  if (cfg) {
    return (
      <div className="inline-flex items-center gap-1.5" style={{ color: cfg.color }}>
        <span className="font-inter text-[13.5px] font-medium">{label}</span>
        {cfg.icon}
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="font-inter text-[13.5px] font-medium text-neutral-2">{label}</span>
    </div>
  )
}

function AccessLogRow({ log, openResponseId, setOpenResponseId }) {
  const { t } = useI18n()
  const isAnomaly = log.userType === 'unknown' || log.userType === 'admin'
  return (
    <tr className="transition-colors duration-150 hover:bg-ink/[.03] border-b border-line">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-mono text-[13.5px] text-ink">{log.timestamp}</div>
        <div className="font-inter text-[11px] text-neutral mt-0.5">{log.date}</div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar userType={log.userType} />
          <div>
            <div className={`font-mono text-[13px] font-medium ${isAnomaly ? 'text-accent' : 'text-ink-2'}`}>{log.userId}</div>
            <div className={`font-inter text-[12px] mt-0.5 ${isAnomaly ? 'text-accent/70' : 'text-neutral-2'}`}>{log.name}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-neutral-2">
          <DoorIcon />
          <span className="font-inter text-[13.5px] text-ink-2">{log.location}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <MethodBadge method={log.method} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <StatusBadge status={log.status} statusLabel={log.statusLabel} />
          {log.status === 'denied' && (
            <button
              onClick={() => setOpenResponseId(openResponseId === log.id ? null : log.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-400/10 border border-red-400/30 text-red-400 font-inter text-[12px] font-medium cursor-pointer hover:bg-red-400/20 transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 2L1.5 12h11L7 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M7 6v2.5M7 10v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {t('accessLogs.respond')} {openResponseId === log.id ? '▴' : '▾'}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function AccessLogs({ operatorMode = false }) {
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
  const [searchParams] = useSearchParams()
  const isOperator = operatorMode || searchParams.get('ctx') === 'operator'

  const [tableSearch,     setTableSearch]     = useState('')
  const [lockdownActive,  setLockdownActive]  = useState(false)
  const [openResponseId,  setOpenResponseId]  = useState(null)
  const [triggeredAlarms, setTriggeredAlarms] = useState(new Set())
  const [activeCameraId,  setActiveCameraId]  = useState(null)
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [logsError, setLogsError] = useState('')
  const [openGroups, setOpenGroups] = useState(() => {
    const d = {}
    NAV_GROUPS.forEach((g) => {
      d[g.id] = g.items.some((i) => i.path === location.pathname)
    })
    return d
  })
  const toggleGroup   = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  const isGroupActive = (group) => group.items.some((i) => i.path === location.pathname)

  const panelRef = useRef(null)

  useEffect(() => {
    if (activeCameraId === null) return
    const el = panelRef.current
    if (!el) return
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    first?.focus()
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setActiveCameraId(null); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [activeCameraId])

  useEffect(() => {
    let cancelled = false

    async function fetchLogs() {
      setLoadingLogs(true)
      setLogsError('')
      const { data, error } = await supabase
        .from('access_events_read_model')
        .select('id,access_event_id,booking_id,office_id,actor_id,occurred_at,date_label,time_label,actor_display_id,actor_display_name,actor_display_type,location_label,access_method,status,status_label,is_security_alert,is_anomaly,reason_label,created_at,updated_at')
        .order('occurred_at', { ascending: false })

      if (cancelled) return
      if (error) {
        setLogsError(error.message || 'Failed to load access events.')
        setLoadingLogs(false)
        return
      }
      setLogs((data ?? []).map(mapReadModelRow))
      setLoadingLogs(false)
    }

    fetchLogs()

    const channel = supabase
      .channel('access-events-read-model')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'access_events_read_model' },
        () => { if (!cancelled) fetchLogs() }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'access_events_read_model' },
        () => { if (!cancelled) fetchLogs() }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  const grantedCount = logs.filter((l) => l.status === 'granted').length
  const deniedCount  = logs.filter((l) => l.status === 'denied').length

  const filtered = logs.filter((log) => {
    if (!tableSearch) return true
    const q = tableSearch.toLowerCase()
    return log.userId.toLowerCase().includes(q) || log.location.toLowerCase().includes(q) || log.name.toLowerCase().includes(q)
  })

  const activeCamera = logs.find((l) => l.id === activeCameraId)

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
              <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=80&q=80"
                srcSet="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=80&q=80 1x, https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=160&q=80 2x"
                alt="Admin avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
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
                      <span className="font-inter text-[11px] font-semibold uppercase tracking-[.1em] text-neutral">
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

          <div className="flex flex-col gap-1 p-3 border-t border-line shrink-0">
            {!isOperator && (
              <button
                onClick={() => setLockdownActive((v) => !v)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-inter text-[12px] font-medium transition-all duration-200 cursor-pointer border mb-1 ${
                  lockdownActive
                    ? 'bg-red-400/20 border-red-400/40 text-red-400'
                    : 'bg-bg-3 border-line text-ink-2 hover:border-red-400/30 hover:text-red-400'
                }`}
              >
                <LockIcon />
                {lockdownActive ? t('accessLogs.lockdownActive') : t('accessLogs.lockdownDoors')}
              </button>
            )}
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

        {/* ── Main ─────────────────────────────────────────────────── */}
        <main className="flex-1 px-6 md:px-10 py-8 pb-16 md:pb-8 min-w-0">

          {/* 3-Layer Page Title */}
          <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
            <div>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('accessLogs.section')}</p>
              <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('accessLogs.title')}</h1>
              <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('accessLogs.subtitle')}</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: t('accessLogs.totalToday'),        value: logs.length,   dot: null,      color: 'text-ink'        },
              { label: t('accessLogs.successfulEntries'), value: grantedCount,  dot: '#10B981', color: 'text-[#10B981]'  },
              { label: t('accessLogs.securityAlerts'),    value: deniedCount,   dot: 'red',     color: 'text-red-400'    },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`bg-bg-2 border rounded-2xl shadow-card p-4 animate-fadeUp ${
                  stat.dot === 'red' ? 'border-red-400/20' : 'border-line'
                }`}
                style={{ '--delay': `${i * 60 + 60}ms` }}
              >
                <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-2">{stat.label}</div>
                <div className={`flex items-center gap-2 font-inter text-[30px] font-bold tracking-[.02em] leading-none tabular-nums ${stat.color}`}>
                  {stat.dot === '#10B981' && <span className="w-2 h-2 rounded-full shrink-0 bg-[#10B981]" />}
                  {stat.dot === 'red'     && <span className="w-2 h-2 rounded-full shrink-0 bg-red-400 animate-pulse" />}
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter + Export bar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[200px] bg-bg-3 border border-line rounded-xl flex items-center px-3 gap-2 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
              <span className="text-neutral shrink-0 pointer-events-none"><SearchIcon /></span>
              <input
                type="text"
                placeholder={t('common.search')}
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none font-inter text-[13px] text-ink placeholder:text-neutral py-2.5"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-line text-ink-2 font-inter text-[13px] font-medium hover:bg-ink/[.06] hover:text-ink transition-all duration-200 cursor-pointer">
                <FilterIcon /> {t('common.filter')}
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-line text-ink-2 font-inter text-[13px] font-medium hover:bg-ink/[.06] hover:text-ink transition-all duration-200 cursor-pointer">
                <DownloadIcon /> {t('common.export')}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden animate-fadeUp" style={{ '--delay': '200ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-6 py-4 font-inter text-[11px] font-medium uppercase tracking-[.1em] text-neutral whitespace-nowrap">{t('accessLogs.timestamp')}</th>
                    <th className="text-left px-4 py-4 font-inter text-[11px] font-medium uppercase tracking-[.1em] text-neutral whitespace-nowrap">{t('accessLogs.user')}</th>
                    <th className="text-left px-4 py-4 font-inter text-[11px] font-medium uppercase tracking-[.1em] text-neutral whitespace-nowrap">{t('accessLogs.officeLocation')}</th>
                    <th className="text-left px-4 py-4 font-inter text-[11px] font-medium uppercase tracking-[.1em] text-neutral whitespace-nowrap">{t('accessLogs.method')}</th>
                    <th className="text-right px-6 py-4 font-inter text-[11px] font-medium uppercase tracking-[.1em] text-neutral whitespace-nowrap">{t('accessLogs.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log) => (
                    <React.Fragment key={log.id}>
                      <AccessLogRow
                        log={log}
                        openResponseId={openResponseId}
                        setOpenResponseId={setOpenResponseId}
                      />
                      {log.status === 'denied' && openResponseId === log.id && (
                        <tr key={`respond-${log.id}`} className="bg-red-400/[.02] border-b border-line">
                          <td colSpan={5} className="px-6 py-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <button
                                onClick={() => setTriggeredAlarms((prev) => new Set([...prev, log.id]))}
                                disabled={triggeredAlarms.has(log.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-inter text-[13px] font-medium transition-all duration-200 border ${
                                  triggeredAlarms.has(log.id)
                                    ? 'bg-red-400/20 border-red-400/30 text-red-400 cursor-not-allowed opacity-70'
                                    : 'bg-red-500/10 border-red-400/30 text-red-400 cursor-pointer hover:bg-red-400/20'
                                }`}
                              >
                                {triggeredAlarms.has(log.id) ? (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                      <path d="M2 7l3.5 3.5 6.5-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {t('accessLogs.alarmActive')}
                                  </>
                                ) : (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                      <path d="M7 1.5a4 4 0 0 0-4 4v2.5L1.5 10h11L11 8V5.5a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                                      <path d="M5.5 10a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                    {t('accessLogs.triggerAlarm')}
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => setActiveCameraId(log.id)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-3 border border-line text-ink-2 font-inter text-[13px] font-medium hover:bg-ink/[.06] transition-all duration-200 cursor-pointer"
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                  <rect x="1" y="4" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                                  <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
                                  <path d="M4.5 4l1-2h3l1 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                {t('accessLogs.viewCamera')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {loadingLogs && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="font-inter text-[13.5px] text-neutral">{t('accessLogs.loading')}</p>
                      </td>
                    </tr>
                  )}
                  {!loadingLogs && logsError && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="font-inter text-[13.5px] text-red-400">{logsError}</p>
                      </td>
                    </tr>
                  )}
                  {!loadingLogs && !logsError && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="font-inter text-[13.5px] text-neutral">{t('accessLogs.empty')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* LIVE footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-line bg-bg-3/30 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
                <span className="font-inter text-[11px] uppercase tracking-[.1em] text-accent">{t('accessLogs.liveConnection')}</span>
                <span className="text-neutral font-inter text-[11px]">·</span>
                <span className="font-inter text-[11px] text-neutral">
                  {t('accessLogs.eventsLoaded')} <span className="text-ink font-semibold">{logs.length}</span>
                </span>
              </div>
              <span className="font-inter text-[11px] text-neutral uppercase tracking-[.1em]">
                {t('accessLogs.showingLatest')}
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* ── Camera Panel ─────────────────────────────────────────────────── */}
      {activeCameraId !== null && (
        <div
          aria-hidden="true"
          onClick={() => setActiveCameraId(null)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="camera-panel-title"
        aria-hidden={activeCameraId === null}
        className={`fixed top-0 right-0 bottom-0 w-80 bg-bg-2 border-l border-line z-50 flex flex-col shadow-xl transition-transform duration-300 ${activeCameraId !== null ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
          <div>
            <div id="camera-panel-title" className="font-inter text-[13px] font-semibold text-ink">{t('accessLogs.liveFeed')}</div>
            <div className="font-inter text-[11px] text-neutral mt-0.5 uppercase tracking-[.1em] truncate max-w-[180px]">
              {activeCamera?.location ?? '—'}
            </div>
          </div>
          <button
            onClick={() => setActiveCameraId(null)}
            className="w-8 h-8 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="relative rounded-xl overflow-hidden bg-[#0F172A]" style={{ aspectRatio: '16/9' }}>
            <img
              src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=60"
              alt="Security camera feed"
              className="w-full h-full object-cover grayscale opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="font-inter text-[11px] text-red-400 uppercase tracking-[.1em]">LIVE</span>
            </div>
            <div className="absolute top-2.5 right-2.5">
              <span className="font-inter text-[9px] text-neutral-2 bg-black/50 px-1.5 py-0.5 rounded">REC</span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="font-inter text-[11px] text-neutral">
              Camera ID: CAM-0{activeCameraId}3 · Zone A
            </div>
            <div className="font-inter text-[11px] text-neutral">
              {new Date().toLocaleTimeString('en-US', { hour12: false })} · Auto-refresh 30s
            </div>
            <div className="font-inter text-[11px] text-neutral">
              User: {activeCamera?.userId} — {activeCamera?.name}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-line">
            <p className="font-inter text-[12px] text-neutral leading-relaxed">
              Review footage to verify identity of badge holder before escalating to security personnel.
            </p>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────────── */}
      <nav className="app-mobile-nav fixed bottom-0 left-0 right-0 md:hidden bg-bg-2 border-t border-line flex items-center justify-around h-14 z-50"
        aria-label="Mobile navigation">
        {isOperator ? (
          OPERATOR_ITEMS.map((rawItem) => {
                const item = translateNavItem(rawItem, t)
            const isActive = location.pathname === item.path
            return (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer bg-transparent border-0 transition-colors duration-200 ${isActive ? 'text-accent' : 'text-neutral-2'}`}>
                <NavIcon type={item.icon} />
                <span className="font-inter text-[10px] font-semibold uppercase tracking-[.1em]">{item.shortLabel}</span>
              </button>
            )
          })
        ) : (
          NAV_GROUPS.map((rawGroup) => {
                const group = translateNavGroup(rawGroup, t)
            const active = isGroupActive(group)
            return (
              <button key={group.id}
                onClick={() => navigate(group.mobilePath)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer bg-transparent border-0 ${active ? 'text-accent' : 'text-neutral hover:text-ink'}`}>
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
