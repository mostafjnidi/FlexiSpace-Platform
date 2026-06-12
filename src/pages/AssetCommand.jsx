import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  createOffice,
  fetchOperatorsForOffice,
  fetchAllOperators,
  assignOperator,
  unassignOperator,
} from '../lib/flexispaceApi'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavGroup } from '../components/navigation'

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

function ToggleSwitch({ enabled, onChange }) {
  return (
    <span
      role="switch"
      aria-checked={enabled}
      aria-label={`Status: ${enabled ? 'active' : 'inactive'}`}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange?.()}
      className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 cursor-pointer transition-colors duration-200 ${enabled ? 'bg-accent' : 'bg-bg-3 border border-line'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </span>
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
  return null
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

const QUEUE_ITEMS = []

function QueueItem({ item }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-line last:border-b-0">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
        item.priority === 'overdue'
          ? 'bg-red-500/10 border-red-400/30 text-red-400'
          : 'bg-bg-3 border-line text-neutral-2'
      }`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-inter text-[13px] font-semibold text-ink leading-snug">{item.title}</div>
        <div className="font-inter text-[11px] text-neutral mt-0.5 truncate">{item.subtitle}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md font-inter text-[11px] uppercase tracking-[.1em] border ${
            item.urgent ? 'bg-red-900/30 text-red-400 border-red-800/40' : 'bg-bg-3 text-neutral-2 border-line'
          }`}>{item.badge}</span>
          {item.priority === 'overdue' && (
            <span className="inline-flex items-center gap-1 font-inter text-[11px] uppercase tracking-[.1em] text-red-400 mt-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1C6 1 8.5 3.5 8.5 6a2.5 2.5 0 0 1-5 0C3.5 4 5 2.5 5 2.5S4.5 5 6 5.5c0 0 1-1.5 0-4.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              Overdue
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function OperatorPanel({ office, links, allOperators, loading, error, selectedId, assigning, unassigningId, onSelectOperator, onAssign, onUnassign }) {
  const assignedIds = new Set(links.map((l) => l.operator_id))
  const available = allOperators.filter((op) => !assignedIds.has(op.id))

  return (
    <div className="mt-2 bg-bg-2 border border-accent/20 rounded-2xl p-4 animate-fadeUp" style={{ '--delay': '0ms' }}>
      <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-3">
        Operators — {office.name}
      </p>

      {loading && (
        <div className="flex items-center gap-2 py-2 text-neutral font-inter text-[12px]">
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity=".25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Loading…
        </div>
      )}

      {error && (
        <p className="font-inter text-[12px] text-red-400 mb-3">{error}</p>
      )}

      {!loading && links.length === 0 && (
        <p className="font-inter text-[12px] text-neutral mb-3">No operators assigned yet.</p>
      )}

      {!loading && links.length > 0 && (
        <div className="mb-3 flex flex-col gap-1.5">
          {links.map((link) => {
            const prof = link.profiles
            return (
              <div key={link.id} className="flex items-center justify-between gap-3 px-3 py-2 bg-bg-3 rounded-xl border border-line">
                <div className="min-w-0">
                  <p className="font-inter text-[13px] text-ink truncate">{prof?.full_name || 'Unnamed'}</p>
                  <p className="font-inter text-[11px] text-neutral truncate">{prof?.email || ''}</p>
                </div>
                <button
                  onClick={() => onUnassign(link.id)}
                  disabled={unassigningId === link.id}
                  className="shrink-0 px-2.5 py-1 rounded-lg border border-red-400/30 text-red-400 font-inter text-[11px] uppercase tracking-[.1em] hover:bg-red-400/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unassigningId === link.id ? '…' : 'Unassign'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {!loading && (
        <div className="flex items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => onSelectOperator(e.target.value)}
            className="flex-1 min-w-0 bg-bg-3 border border-line rounded-xl px-3 py-2 text-ink font-inter text-[13px] outline-none focus:border-accent/50 transition-colors cursor-pointer"
          >
            <option value="">
              {available.length === 0 ? 'No operators available' : 'Select operator…'}
            </option>
            {available.map((op) => (
              <option key={op.id} value={op.id}>
                {op.full_name || op.email}
              </option>
            ))}
          </select>
          <button
            onClick={onAssign}
            disabled={!selectedId || assigning || available.length === 0}
            className="shrink-0 px-3 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent font-inter text-[11px] uppercase tracking-[.1em] hover:bg-accent/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {assigning ? '…' : 'Assign'}
          </button>
        </div>
      )}
    </div>
  )
}

function OfficeCard({ office, onToggle, isTopPerformer, isSelected, onSelect, onViewBookings, onEdit, onManageOperators, operatorPanelOpen }) {
  const { t } = useI18n()
  return (
    <div className={`bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden
      transition-transform duration-[350ms] ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1
      border-l-[3px] ${office.hasPendingMaint ? 'border-l-amber-400' : 'border-l-transparent'}`}>
      <div className="relative h-44">
        <img src={office.image} alt="" aria-hidden="true" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = OFFICE_FALLBACK_IMAGES[0] }} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-2/60 to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <button
            onClick={() => onSelect(office.id)}
            aria-label={isSelected ? 'Deselect office' : 'Select office'}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
              transition-all duration-200 cursor-pointer ${
              isSelected ? 'bg-accent border-accent' : 'bg-bg/70 border-line hover:border-accent'
            }`}
          >
            {isSelected && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
            font-inter text-[11px] uppercase tracking-[.1em] ${
            office.status === 'Live'
              ? 'bg-bg/70 border border-line text-accent'
              : 'bg-accent/20 border border-accent/40 text-accent'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {office.status === 'Live' ? t('assets.live') : t('assets.maint')}
          </span>
        </div>

        {isTopPerformer && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
              bg-amber-400/20 border border-amber-400/50 font-inter text-[11px]
              uppercase tracking-[.1em] text-amber-400">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1l1.3 3.9H11L8 7.1l1 3.9L6 8.8 3 11l1-3.9L1 4.9h3.7L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" />
              </svg>
              Top Performer
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-inter text-[13px] font-semibold text-ink">{office.name}</h3>
          <ToggleSwitch enabled={office.enabled} onChange={onToggle} />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className={`flex items-center gap-1 font-inter text-[11px]`} style={{ color: office.iotOnline ? '#10B981' : undefined }}>
            {office.iotOnline ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" />
                </svg>
                IoT {office.iotPct}%
              </>
            ) : (
              <span className="text-neutral flex items-center gap-1">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                  <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                  <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                  <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                  <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                  <circle cx="12" cy="20" r="1" fill="currentColor" />
                </svg>
                IoT Offline
              </span>
            )}
          </span>
          <span className="text-neutral font-inter text-[11px]">·</span>
          <span className={`flex items-center gap-1 font-inter text-[11px] ${office.cleaned ? 'text-neutral-2' : 'text-neutral'}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {office.cleaned ? t('assets.cleaned') : t('assets.pending')}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-bg-3 rounded-xl border border-line">
          <div>
            <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1">{t('assets.health')}</div>
            <div className={`font-inter text-[13px] font-semibold ${
              office.healthScore >= 80 ? 'text-[#10B981]'
                : office.healthScore >= 50 ? 'text-amber-400'
                : 'text-red-400'
            }`}>
              {office.healthScore}/100
            </div>
          </div>
          <div>
            <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1">{t('assets.hourly')}</div>
            <div className="font-inter text-[13px] font-semibold text-ink">{office.hourly}</div>
          </div>
          <div>
            <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1">{t('assets.monthlyBookings')}</div>
            <div className="flex items-center gap-1">
              <span className="font-inter text-[13px] font-semibold text-ink">{office.monthlyBookings}</span>
              <span className={`font-inter text-[11px] font-medium ${
                office.trend.dir === 'up' ? 'text-[#10B981]' : 'text-red-400'
              }`}>
                {office.trend.dir === 'up' ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle' }}>
                    <path d="M6 9.5V2.5M2.5 6l3.5-3.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle' }}>
                    <path d="M6 2.5v7M2.5 6l3.5 3.5L9.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}{office.trend.pct}%
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onQuickControls(office.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-bg-3 border border-line text-ink-2 font-inter text-[13px] font-medium hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer mb-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 4v3l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {office.status === 'Maint' ? t('assets.viewMaintenance') : t('assets.quickControls')}
        </button>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button onClick={() => onEdit(office)} className="py-2 rounded-xl bg-bg-3 border border-line text-ink-2 font-inter text-[13px] hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer">{t('common.edit')}</button>
          <button onClick={onViewBookings} className="py-2 rounded-xl bg-bg-3 border border-line text-ink-2 font-inter text-[13px] hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer">{t('nav.bookings')}</button>
        </div>
        <button
          onClick={onManageOperators}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border font-inter text-[13px] transition-all duration-200 cursor-pointer ${
            operatorPanelOpen
              ? 'bg-accent/10 border-accent/40 text-accent'
              : 'bg-bg-3 border-line text-ink-2 hover:text-ink hover:border-accent/40'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <circle cx="5" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 11c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M9.5 5.5v3M11 7H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Manage Operators
        </button>
      </div>
    </div>
  )
}

// ── Office creation helpers ───────────────────────────────────────────────────

const DEVICE_OPTIONS = [
  { value: 'SMART_LOCK', label: 'Smart Door Lock' },
  { value: 'AIR_QUALITY_SENSOR', label: 'Air Quality Sensor' },
  { value: 'ELECTRICITY_METER', label: 'Electricity Meter' },
]

const INITIAL_FORM = {
  name: '',
  description: '',
  building: '',
  floor: '',
  room: '',
  capacityStr: '',
  hourlyPriceStr: '',
  currency: 'USD',
  status: 'ACTIVE',
  imageUrl: '',
  deviceTypes: [],
}

const OFFICE_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
]

function getOfficeFallbackImage(id) {
  const sum = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return OFFICE_FALLBACK_IMAGES[sum % OFFICE_FALLBACK_IMAGES.length]
}

function mapDbOffice(o) {
  return {
    id: o.id,
    name: o.name,
    status: o.status === 'ACTIVE' ? 'Live' : 'Maint',
    enabled: o.status === 'ACTIVE',
    iotOnline: false,
    iotPct: 0,
    cleaned: true,
    hourly: `$${(o.hourly_rate_cents / 100).toFixed(0)}/hr`,
    monthlyBookings: 0,
    image: o.image_url || getOfficeFallbackImage(o.id),
    trend: { dir: 'up', pct: 0 },
    revenue: 0,
    healthScore: o.status === 'ACTIVE' ? 80 : o.status === 'MAINTENANCE' ? 30 : 50,
    hasPendingMaint: o.status === 'MAINTENANCE',
    _dbStatus: o.status,
    _description: o.description || '',
    _building: o.building || '',
    _floor: o.floor || '',
    _room: o.room || '',
    _capacity: o.capacity,
    _hourlyRateCents: o.hourly_rate_cents,
    _currency: o.currency || 'USD',
    _imageUrl: o.image_url || '',
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AssetCommand() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()

  const handleSignOut = async () => {
    try { await supabase.auth.signOut() } finally { navigate('/login') }
  }

  const [headerSearch, setHeaderSearch] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // Live offices
  const [offices, setOffices] = useState([])
  const [loadingOffices, setLoadingOffices] = useState(true)
  const [officesError, setOfficesError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoadingOffices(true)
      setOfficesError(null)
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      const userId = user?.id
      if (!userId) { setLoadingOffices(false); return }
      const { data, error } = await supabase
        .from('offices')
        .select('id,name,description,building,floor,room,capacity,hourly_rate_cents,currency,status,image_url,created_at')
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (!mounted) return
      if (error) {
        setOfficesError('Could not load offices. Please refresh.')
        setLoadingOffices(false)
        return
      }
      setOffices((data ?? []).map(mapDbOffice))
      setLoadingOffices(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  async function reloadOffices() {
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id
    if (!userId) return
    const { data } = await supabase
      .from('offices')
      .select('id,name,description,building,floor,room,capacity,hourly_rate_cents,currency,status,image_url,created_at')
      .eq('owner_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (data) setOffices(data.map(mapDbOffice))
  }

  // Add Office modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [imageUploadError, setImageUploadError] = useState('')

  const [editingOffice, setEditingOffice] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editFormErrors, setEditFormErrors] = useState({})
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editSubmitError, setEditSubmitError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  function openAddModal() {
    setForm(INITIAL_FORM)
    setFormErrors({})
    setSubmitError(null)
    setSubmitResult(null)
    setImageFile(null)
    setImagePreviewUrl('')
    setImageUploadError('')
    setShowAddModal(true)
  }

  function closeAddModal() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(null)
    setImagePreviewUrl('')
    setImageUploadError('')
    setShowAddModal(false)
    setSubmitResult(null)
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageUploadError('')
    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image must be smaller than 5 MB.')
      return
    }
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  function removeImage() {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImageFile(null)
    setImagePreviewUrl('')
    setImageUploadError('')
  }

  function openEditModal(office) {
    setEditForm({
      name: office.name,
      description: office._description,
      building: office._building,
      floor: office._floor,
      room: office._room,
      capacityStr: String(office._capacity),
      hourlyPriceStr: (office._hourlyRateCents / 100).toFixed(2),
      currency: office._currency,
      status: office._dbStatus,
      imageUrl: office._imageUrl,
    })
    setEditFormErrors({})
    setEditSubmitError(null)
    setShowDeleteConfirm(false)
    setDeleteConfirmText('')
    setEditingOffice(office)
  }

  function closeEditModal() {
    setEditingOffice(null)
    setEditForm({})
    setEditFormErrors({})
    setEditSubmitError(null)
    setShowDeleteConfirm(false)
    setDeleteConfirmText('')
    setEditSubmitting(false)
  }

  function setEditField(key, value) {
    setEditForm((prev) => ({ ...prev, [key]: value }))
    setEditFormErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validateEditForm() {
    const errors = {}
    if (!editForm.name.trim()) errors.name = 'Name is required.'
    const cap = parseInt(editForm.capacityStr, 10)
    if (!editForm.capacityStr || isNaN(cap) || cap <= 0)
      errors.capacityStr = 'Capacity must be a positive number.'
    const price = parseFloat(editForm.hourlyPriceStr)
    if (editForm.hourlyPriceStr === '' || isNaN(price) || price < 0)
      errors.hourlyPriceStr = 'Hourly price must be 0 or greater.'
    if (!/^[A-Z]{3}$/.test(editForm.currency))
      errors.currency = 'Currency must be 3 uppercase letters (e.g. USD).'
    return errors
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    const errors = validateEditForm()
    if (Object.keys(errors).length > 0) { setEditFormErrors(errors); return }
    setEditSubmitting(true)
    setEditSubmitError(null)
    try {
      const { error } = await supabase.rpc('update_office_v1', {
        p_office_id:         editingOffice.id,
        p_name:              editForm.name.trim(),
        p_description:       editForm.description.trim() || null,
        p_building:          editForm.building.trim() || null,
        p_floor:             editForm.floor.trim() || null,
        p_room:              editForm.room.trim() || null,
        p_capacity:          parseInt(editForm.capacityStr, 10),
        p_hourly_rate_cents: Math.round(parseFloat(editForm.hourlyPriceStr) * 100),
        p_currency:          editForm.currency,
        p_status:            editForm.status,
        p_image_url:         editForm.imageUrl.trim() || null,
      })
      if (error) throw new Error(error.message)
      await reloadOffices()
      closeEditModal()
    } catch (err) {
      setEditSubmitError(err.message || 'Failed to update office.')
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDeleteOffice() {
    if (deleteConfirmText !== 'DELETE') return
    setEditSubmitting(true)
    setEditSubmitError(null)
    try {
      const { error } = await supabase.rpc('soft_delete_office_v1', {
        p_office_id: editingOffice.id,
      })
      if (error) throw new Error(error.message)
      await reloadOffices()
      closeEditModal()
    } catch (err) {
      setEditSubmitError(err.message || 'Failed to delete office.')
      setEditSubmitting(false)
    }
  }

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFormErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function toggleDevice(dt) {
    setForm((prev) => ({
      ...prev,
      deviceTypes: prev.deviceTypes.includes(dt)
        ? prev.deviceTypes.filter((d) => d !== dt)
        : [...prev.deviceTypes, dt],
    }))
  }

  function validateForm() {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required.'
    const cap = parseInt(form.capacityStr, 10)
    if (!form.capacityStr || isNaN(cap) || cap <= 0)
      errors.capacityStr = 'Capacity must be a positive number.'
    const price = parseFloat(form.hourlyPriceStr)
    if (form.hourlyPriceStr === '' || isNaN(price) || price < 0)
      errors.hourlyPriceStr = 'Hourly price must be 0 or greater.'
    if (!/^[A-Z]{3}$/.test(form.currency))
      errors.currency = 'Currency must be 3 uppercase letters (e.g. USD).'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setSubmitting(true)
    setSubmitError(null)
    try {
      // Upload image to storage if a file was selected
      let finalImageUrl = null
      if (imageFile) {
        const { data: { user } } = await supabase.auth.getUser()
        const ext = imageFile.name.split('.').pop().toLowerCase()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('office-images')
          .upload(path, imageFile, { upsert: true, contentType: imageFile.type })
        if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)
        const { data: { publicUrl } } = supabase.storage.from('office-images').getPublicUrl(path)
        finalImageUrl = publicUrl
      }

      const idempotencyKey = crypto.randomUUID()
      const result = await createOffice({
        name: form.name.trim(),
        description: form.description.trim() || null,
        building: form.building.trim() || null,
        floor: form.floor.trim() || null,
        room: form.room.trim() || null,
        capacity: parseInt(form.capacityStr, 10),
        hourlyRateCents: Math.round(parseFloat(form.hourlyPriceStr) * 100),
        currency: form.currency,
        status: form.status,
        imageUrl: finalImageUrl,
        deviceTypes: form.deviceTypes,
        idempotencyKey,
      })
      setSubmitResult(result.data)
      await reloadOffices()
    } catch (err) {
      setSubmitError(err.message || 'Failed to create office.')
    } finally {
      setSubmitting(false)
    }
  }

  const [openGroups, setOpenGroups] = useState(() => {
    const defaults = {}
    NAV_GROUPS.forEach((g) => {
      defaults[g.id] = g.items.some((item) => item.path === location.pathname)
    })
    if (!Object.values(defaults).some(Boolean)) defaults['assets'] = true
    return defaults
  })
  const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  const [selectedIds, setSelectedIds] = useState(new Set())
  const toggleSelect = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  const clearSelection = () => setSelectedIds(new Set())

  const [quickControlsId, setQuickControlsId] = useState(null)
  const [iotToggles, setIotToggles] = useState({})
  const toggleIot = (officeId, key) =>
    setIotToggles((prev) => ({
      ...prev,
      [officeId]: {
        ...(prev[officeId] ?? { lights: true, lock: false, hvac: true }),
        [key]: !(prev[officeId]?.[key] ?? (key === 'lights' || key === 'hvac')),
      },
    }))

  const handleToggle = (id) => {
    setOffices((prev) => prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)))
  }

  // ── Operator panel state ──────────────────────────────────────────────────
  const [operatorPanelOpenId, setOperatorPanelOpenId] = useState(null)
  const [operatorLinks, setOperatorLinks] = useState({})
  const [allOperators, setAllOperators] = useState([])
  const [operatorPanelLoading, setOperatorPanelLoading] = useState({})
  const [operatorPanelError, setOperatorPanelError] = useState({})
  const [selectedOperatorId, setSelectedOperatorId] = useState({})
  const [assigning, setAssigning] = useState({})
  const [unassigningId, setUnassigningId] = useState(null)

  async function loadOperatorPanel(officeId) {
    setOperatorPanelLoading((prev) => ({ ...prev, [officeId]: true }))
    setOperatorPanelError((prev) => ({ ...prev, [officeId]: null }))
    try {
      const [links, operators] = await Promise.all([
        fetchOperatorsForOffice(officeId),
        allOperators.length > 0 ? Promise.resolve(allOperators) : fetchAllOperators(),
      ])
      setOperatorLinks((prev) => ({ ...prev, [officeId]: links }))
      if (allOperators.length === 0) setAllOperators(operators)
    } catch (err) {
      setOperatorPanelError((prev) => ({ ...prev, [officeId]: err.message || 'Failed to load operators.' }))
    } finally {
      setOperatorPanelLoading((prev) => ({ ...prev, [officeId]: false }))
    }
  }

  function handleToggleOperatorPanel(officeId) {
    if (operatorPanelOpenId === officeId) {
      setOperatorPanelOpenId(null)
      return
    }
    setOperatorPanelOpenId(officeId)
    loadOperatorPanel(officeId)
  }

  async function handleAssignOperator(officeId) {
    const operatorId = selectedOperatorId[officeId]
    if (!operatorId) return
    setAssigning((prev) => ({ ...prev, [officeId]: true }))
    setOperatorPanelError((prev) => ({ ...prev, [officeId]: null }))
    try {
      await assignOperator(operatorId, officeId)
      setSelectedOperatorId((prev) => ({ ...prev, [officeId]: '' }))
      const links = await fetchOperatorsForOffice(officeId)
      setOperatorLinks((prev) => ({ ...prev, [officeId]: links }))
    } catch (err) {
      setOperatorPanelError((prev) => ({ ...prev, [officeId]: err.message || 'Failed to assign operator.' }))
    } finally {
      setAssigning((prev) => ({ ...prev, [officeId]: false }))
    }
  }

  async function handleUnassignOperator(officeId, linkId) {
    setUnassigningId(linkId)
    setOperatorPanelError((prev) => ({ ...prev, [officeId]: null }))
    try {
      await unassignOperator(linkId)
      const links = await fetchOperatorsForOffice(officeId)
      setOperatorLinks((prev) => ({ ...prev, [officeId]: links }))
    } catch (err) {
      setOperatorPanelError((prev) => ({ ...prev, [officeId]: err.message || 'Failed to unassign operator.' }))
    } finally {
      setUnassigningId(null)
    }
  }

  const maxRevenue = offices.reduce((max, o) => Math.max(max, o.revenue), 0)
  const topPerformerId = maxRevenue > 0
    ? offices.reduce(
        (best, o) => (o.revenue > (offices.find((x) => x.id === best)?.revenue ?? 0) ? o.id : best),
        offices[0]?.id
      )
    : null

  const filteredOffices = offices.filter((o) => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Active' && o.status === 'Live') ||
      (activeFilter === 'Maintenance' && o.status === 'Maint')
    return matchSearch && matchFilter
  })

  const totalOffices = offices.length
  const activeUnits = offices.filter((o) => o.status === 'Live').length
  const underMaint = offices.filter((o) => o.status === 'Maint').length

  const inputCls = (errorKey) =>
    `w-full bg-bg-3 border rounded-xl px-3 py-2.5 text-ink font-inter text-[13px] outline-none transition-all duration-200 ${
      formErrors[errorKey]
        ? 'border-red-400/60 focus:ring-[3px] focus:ring-red-400/20'
        : 'border-line focus:border-accent focus:ring-[3px] focus:ring-accent/[.14]'
    }`

  const editInputCls = (errorKey) =>
    `w-full bg-bg-3 border rounded-xl px-3 py-2.5 text-ink font-inter text-[13px] outline-none transition-all duration-200 ${
      editFormErrors[errorKey]
        ? 'border-red-400/60 focus:ring-[3px] focus:ring-red-400/20'
        : 'border-line focus:border-accent focus:ring-[3px] focus:ring-accent/[.14]'
    }`

  return (
    <div className="min-h-screen bg-bg flex flex-col font-inter">
      {/* Header */}
      <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
        <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full flex items-center px-3 gap-2">
          <span className="text-neutral shrink-0"><SearchIcon /></span>
          <input
            type="text"
            placeholder={t('assets.searchHeader')}
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
        {/* Sidebar */}
        <aside className="app-sidebar hidden md:flex flex-col w-[200px] shrink-0 bg-bg-2 border-r border-line">
          <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto" aria-label="Main navigation">
            {NAV_GROUPS.map((rawGroup) => {
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
          <div className="flex flex-col gap-0.5 p-3 border-t border-line">
            <button
              onClick={() => navigate('/support')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left"
            >
              <SupportIcon /> {t('common.support')}
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left"
            >
              <LogoutIcon /> Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 pb-16 md:pb-6">
          {/* Page Header */}
          <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
            <div>
              <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('assets.assetManagement')}</p>
              <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('assets.title')}</h1>
              <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('assets.subtitle')}</p>
            </div>
            <button
              onClick={openAddModal}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-inter text-[13px] font-medium hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0 ml-auto shrink-0 mt-1"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t('assets.addOffice')}
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: t('assets.totalOffices'), value: loadingOffices ? '—' : String(totalOffices), dot: false, accent: false },
              { label: t('assets.activeUnits'), value: loadingOffices ? '—' : String(activeUnits), dot: true, accent: false },
              { label: t('assets.underMaintenance'), value: loadingOffices ? '—' : String(underMaint), dot: true, accent: false },
              { label: t('assets.monthlyRevenue'), value: '—', dot: false, accent: true },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-bg-2 border border-line rounded-2xl shadow-card p-4 animate-fadeUp"
                style={{ '--delay': `${i * 60}ms` }}
              >
                <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-2 whitespace-pre-line">{stat.label}</div>
                <div className={`flex items-center gap-2 font-inter text-[30px] font-bold tracking-[.02em] leading-none tabular-nums ${stat.accent ? 'text-accent' : 'text-ink'}`}>
                  {stat.dot && <span className="w-2 h-2 rounded-full shrink-0 bg-accent" />}
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="relative bg-bg-3 border border-line rounded-xl flex-1 min-w-[180px] focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </span>
                  <input
                    className="w-full bg-transparent border-0 outline-none pl-9 pr-4 py-2.5 text-ink font-inter text-[13px] placeholder:text-neutral-2"
                    placeholder={t('assets.searchOffices')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label={t('assets.searchOfficesLabel')}
                  />
                </div>
                <div className="flex items-center gap-1 bg-bg-3 border border-line rounded-xl p-1">
                  {['All', 'Active', 'Maintenance'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1.5 rounded-lg font-inter text-[13px] transition-all duration-200 cursor-pointer border-0 ${
                        activeFilter === f ? 'bg-accent/20 text-accent' : 'text-neutral-2 hover:text-ink bg-transparent'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loadingOffices ? (
                  <div className="col-span-2 py-16 flex items-center justify-center">
                    <svg className="animate-spin text-neutral" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity=".25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                ) : officesError ? (
                  <div className="col-span-2 py-16 text-center">
                    <p className="font-inter text-[13px] text-red-400 mb-2">{officesError}</p>
                    <button
                      onClick={reloadOffices}
                      className="font-inter text-[13px] text-accent hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Try again
                    </button>
                  </div>
                ) : filteredOffices.length === 0 ? (
                  <div className="col-span-2 py-16 text-center text-neutral font-inter text-[13px]">
                    {offices.length === 0 ? (
                      <span>
                        No offices yet.{' '}
                        <button
                          onClick={openAddModal}
                          className="text-accent hover:underline cursor-pointer bg-transparent border-0 font-inter text-[13px]"
                        >
                          Add your first office
                        </button>
                      </span>
                    ) : (
                      'No offices match your search.'
                    )}
                  </div>
                ) : (
                  filteredOffices.map((office, i) => (
                    <div key={office.id} className="animate-fadeUp" style={{ '--delay': `${i * 80 + 160}ms` }}>
                      <OfficeCard
                        office={office}
                        onToggle={() => handleToggle(office.id)}
                        isTopPerformer={office.id === topPerformerId}
                        isSelected={selectedIds.has(office.id)}
                        onSelect={toggleSelect}
                        onQuickControls={setQuickControlsId}
                        onViewBookings={() => navigate(`/bookings-command-center?office=${office.id}`)}
                        onEdit={openEditModal}
                        onManageOperators={() => handleToggleOperatorPanel(office.id)}
                        operatorPanelOpen={operatorPanelOpenId === office.id}
                      />
                      {operatorPanelOpenId === office.id && (
                        <OperatorPanel
                          office={office}
                          links={operatorLinks[office.id] ?? []}
                          allOperators={allOperators}
                          loading={operatorPanelLoading[office.id] ?? false}
                          error={operatorPanelError[office.id] ?? null}
                          selectedId={selectedOperatorId[office.id] ?? ''}
                          assigning={assigning[office.id] ?? false}
                          unassigningId={unassigningId}
                          onSelectOperator={(id) => setSelectedOperatorId((prev) => ({ ...prev, [office.id]: id }))}
                          onAssign={() => handleAssignOperator(office.id)}
                          onUnassign={(linkId) => handleUnassignOperator(office.id, linkId)}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* {t('assets.actionQueue')} */}
            <aside className="w-[272px] shrink-0 hidden md:block">
              <div className="bg-bg-2 border border-line rounded-2xl shadow-card p-4 sticky top-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-inter text-[16px] font-semibold text-ink">{t('assets.actionQueue')}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-bg-3 border border-line font-inter text-[11px] text-neutral">
                    {QUEUE_ITEMS.length} Tasks
                  </span>
                </div>
                <div>
                  {QUEUE_ITEMS.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="font-inter text-[13px] text-neutral-2">{t('assets.allCaughtUp')}</div>
                      <div className="font-inter text-[11px] text-neutral mt-1">{t('assets.noPendingTasks')}</div>
                    </div>
                  ) : (
                    QUEUE_ITEMS.map((item) => <QueueItem key={item.id} item={item} />)
                  )}
                </div>
                <button onClick={() => {}} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-bg-3 border border-line text-ink-2 font-inter text-[13px] font-medium hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  Quick Schedule
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Add Office Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={closeAddModal}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="relative bg-bg-2 border border-line rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div>
                <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-0.5">{t('assets.assetManagement')}</p>
                <h2 className="font-inter text-[18px] font-semibold text-ink">{t('assets.addOffice')}</h2>
              </div>
              <button
                onClick={closeAddModal}
                className="w-8 h-8 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {submitResult ? (
              <div className="p-6">
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl mb-4">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="#10B981" strokeWidth="1.3" />
                    <path d="M5 8l2 2 4-4" stroke="#10B981" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="font-inter text-[13px] font-medium" style={{ color: '#10B981' }}>
                    {t('assets.created')}
                  </span>
                </div>
                <div className="p-3 bg-bg-3 border border-line rounded-xl mb-4">
                  <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('assets.officeId')}</div>
                  <div className="font-mono text-[13px] text-ink mt-1 break-all">{submitResult.office_id}</div>
                  {submitResult.device_ids?.length > 0 && (
                    <>
                      <div className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mt-3">{t('assets.devicesProvisioned')}</div>
                      <div className="font-mono text-[13px] text-ink mt-1">
                        {submitResult.device_ids.length} device{submitResult.device_ids.length > 1 ? 's' : ''}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={closeAddModal}
                  className="w-full py-2.5 rounded-xl bg-accent text-white font-inter text-[13px] font-medium hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0"
                >
                  {t('common.done')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6">
                {/* Name */}
                <div className="mb-4">
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                    {t('assets.officeName')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="e.g. Nexus Hub Alpha"
                    className={inputCls('name')}
                  />
                  {formErrors.name && <p className="font-inter text-[12px] text-red-400 mt-1">{formErrors.name}</p>}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('assets.description')}</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Brief description of the office space"
                    rows={2}
                    className={`${inputCls('description')} resize-none`}
                  />
                </div>

                {/* Building / Floor / Room */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('assets.building')}</label>
                    <input
                      type="text"
                      value={form.building}
                      onChange={(e) => setField('building', e.target.value)}
                      placeholder="Tower A"
                      className={inputCls('building')}
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('assets.floor')}</label>
                    <input
                      type="text"
                      value={form.floor}
                      onChange={(e) => setField('floor', e.target.value)}
                      placeholder="3rd Floor"
                      className={inputCls('floor')}
                    />
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('assets.room')}</label>
                    <input
                      type="text"
                      value={form.room}
                      onChange={(e) => setField('room', e.target.value)}
                      placeholder="301"
                      className={inputCls('room')}
                    />
                  </div>
                </div>

                {/* Capacity / Hourly Price / Currency */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                      {t('assets.capacity')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.capacityStr}
                      onChange={(e) => setField('capacityStr', e.target.value)}
                      placeholder="10"
                      className={inputCls('capacityStr')}
                    />
                    {formErrors.capacityStr && <p className="font-inter text-[12px] text-red-400 mt-1">{formErrors.capacityStr}</p>}
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                      {t('assets.hourlyRate')} ($) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.hourlyPriceStr}
                      onChange={(e) => setField('hourlyPriceStr', e.target.value)}
                      placeholder="45"
                      className={inputCls('hourlyPriceStr')}
                    />
                    {formErrors.hourlyPriceStr && <p className="font-inter text-[12px] text-red-400 mt-1">{formErrors.hourlyPriceStr}</p>}
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('assets.currency')}</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={form.currency}
                      onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                      placeholder="USD"
                      className={inputCls('currency')}
                    />
                    {formErrors.currency && <p className="font-inter text-[12px] text-red-400 mt-1">{formErrors.currency}</p>}
                  </div>
                </div>

                {/* Status / Image URL */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">{t('assets.status')}</label>
                    <select
                      value={form.status}
                      onChange={(e) => setField('status', e.target.value)}
                      className={`${inputCls('status')} cursor-pointer`}
                    >
                      <option value="ACTIVE">{t('common.active')}</option>
                      <option value="INACTIVE">{t('common.inactive')}</option>
                      <option value="MAINTENANCE">{t('common.maintenance')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                      Office Image
                    </label>
                    <div className="flex flex-col gap-2">
                      {imagePreviewUrl && (
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg border border-line"
                        />
                      )}
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-line bg-bg-3 text-neutral-2 hover:text-ink hover:border-neutral/40 transition-colors cursor-pointer font-inter text-[13px]">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                          <path d="M7.5 10.5V4M4.5 7l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 11.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                        <span>{imageFile ? imageFile.name : 'Choose image from device…'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                      {imageFile && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral hover:text-red-400 transition-colors cursor-pointer bg-transparent border-0 text-left"
                        >
                          Remove image
                        </button>
                      )}
                      {imageUploadError && (
                        <p className="font-inter text-[12px] text-red-400">{imageUploadError}</p>
                      )}
                      <p className="font-inter text-[11px] text-neutral">JPEG, PNG, WebP, GIF · max 5 MB</p>
                    </div>
                  </div>
                </div>

                {/* Device checklist */}
                <div className="mb-5">
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-2">
                    {t('assets.devices')}
                  </label>
                  <div className="flex flex-col gap-2">
                    {DEVICE_OPTIONS.map(({ value }) => {
                      const checked = form.deviceTypes.includes(value)
                      return (
                        <label
                          key={value}
                          className="flex items-center gap-3 p-3 rounded-xl bg-bg-3 border border-line cursor-pointer hover:border-accent/40 transition-all duration-200"
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => toggleDevice(value)}
                          />
                          <span
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                              checked ? 'bg-accent border-accent' : 'bg-bg border-line'
                            }`}
                          >
                            {checked && (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5"
                                  strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          <span className="font-inter text-[13px] text-ink">{t(`assets.deviceLabels.${value}`)}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Submit error */}
                {submitError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                    <p className="font-inter text-[13px] text-red-400">{submitError}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl border border-line text-neutral-2 hover:text-ink font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-40"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-accent text-white font-inter text-[13px] font-medium hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0 disabled:opacity-40 flex items-center gap-2"
                  >
                    {submitting && (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity=".25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {submitting ? t('assets.creating') : t('assets.createOffice')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Office Modal */}
      {editingOffice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={closeEditModal} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-bg-2 border border-line rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <div>
                <p className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-0.5">Asset Management</p>
                <h2 className="font-inter text-[18px] font-semibold text-ink">Edit Office</h2>
              </div>
              <button onClick={closeEditModal} className="w-8 h-8 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {showDeleteConfirm ? (
              <div className="p-6">
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-400/30 rounded-xl mb-4">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 2L14 13H2L8 2Z" stroke="#f87171" strokeWidth="1.3" strokeLinejoin="round" />
                    <path d="M8 6v3M8 11v.5" stroke="#f87171" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  <span className="font-inter text-[13px] text-red-400">
                    This will permanently delete <strong>{editingOffice.name}</strong>. This action cannot be undone.
                  </span>
                </div>
                <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                  Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-bg-3 border border-line rounded-xl px-3 py-2.5 text-ink font-inter text-[13px] outline-none focus:border-red-400/60 focus:ring-[3px] focus:ring-red-400/20 transition-all duration-200 mb-4"
                />
                {editSubmitError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                    <p className="font-inter text-[13px] text-red-400">{editSubmitError}</p>
                  </div>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                    disabled={editSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-line text-neutral-2 hover:text-ink font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteOffice}
                    disabled={deleteConfirmText !== 'DELETE' || editSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-red-500 text-white font-inter text-[13px] font-medium hover:bg-red-600 transition-all duration-200 cursor-pointer border-0 disabled:opacity-40 flex items-center gap-2"
                  >
                    {editSubmitting && (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity=".25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    Confirm Delete
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                    Office Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditField('name', e.target.value)}
                    className={editInputCls('name')}
                  />
                  {editFormErrors.name && <p className="font-inter text-[12px] text-red-400 mt-1">{editFormErrors.name}</p>}
                </div>

                <div className="mb-4">
                  <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Description</label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditField('description', e.target.value)}
                    rows={2}
                    className={`${editInputCls('description')} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Building</label>
                    <input type="text" value={editForm.building || ''} onChange={(e) => setEditField('building', e.target.value)} className={editInputCls('building')} />
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Floor</label>
                    <input type="text" value={editForm.floor || ''} onChange={(e) => setEditField('floor', e.target.value)} className={editInputCls('floor')} />
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Room</label>
                    <input type="text" value={editForm.room || ''} onChange={(e) => setEditField('room', e.target.value)} className={editInputCls('room')} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                      Capacity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number" min="1" step="1"
                      value={editForm.capacityStr || ''}
                      onChange={(e) => setEditField('capacityStr', e.target.value)}
                      className={editInputCls('capacityStr')}
                    />
                    {editFormErrors.capacityStr && <p className="font-inter text-[12px] text-red-400 mt-1">{editFormErrors.capacityStr}</p>}
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">
                      Hourly Rate ($) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number" min="0" step="0.01"
                      value={editForm.hourlyPriceStr || ''}
                      onChange={(e) => setEditField('hourlyPriceStr', e.target.value)}
                      className={editInputCls('hourlyPriceStr')}
                    />
                    {editFormErrors.hourlyPriceStr && <p className="font-inter text-[12px] text-red-400 mt-1">{editFormErrors.hourlyPriceStr}</p>}
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Currency</label>
                    <input
                      type="text" maxLength={3}
                      value={editForm.currency || ''}
                      onChange={(e) => setEditField('currency', e.target.value.toUpperCase())}
                      className={editInputCls('currency')}
                    />
                    {editFormErrors.currency && <p className="font-inter text-[12px] text-red-400 mt-1">{editFormErrors.currency}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Status</label>
                    <select
                      value={editForm.status || 'ACTIVE'}
                      onChange={(e) => setEditField('status', e.target.value)}
                      className={`${editInputCls('status')} cursor-pointer`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-inter text-[11px] uppercase tracking-[.1em] text-neutral mb-1.5">Image URL</label>
                    <input
                      type="text"
                      value={editForm.imageUrl || ''}
                      onChange={(e) => setEditField('imageUrl', e.target.value)}
                      placeholder="https://..."
                      className={editInputCls('imageUrl')}
                    />
                  </div>
                </div>

                {editSubmitError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-400/30 rounded-xl">
                    <p className="font-inter text-[13px] text-red-400">{editSubmitError}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={editSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-red-400/40 text-red-400 hover:bg-red-500/10 font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-40"
                  >
                    Delete Office
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      disabled={editSubmitting}
                      className="px-4 py-2.5 rounded-xl border border-line text-neutral-2 hover:text-ink font-inter text-[13px] transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-accent text-white font-inter text-[13px] font-medium hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0 disabled:opacity-40 flex items-center gap-2"
                    >
                      {editSubmitting && (
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity=".25" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                      {editSubmitting ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Quick Controls Drawer */}
      {quickControlsId !== null && (() => {
        const office = offices.find((o) => o.id === quickControlsId)
        const toggles = iotToggles[quickControlsId] ?? { lights: true, lock: false, hvac: true }
        return (
          <>
            <div
              onClick={() => setQuickControlsId(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <div className="fixed top-14 right-0 bottom-0 w-72 bg-bg-2 border-l border-line z-50 flex flex-col shadow-xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <div>
                  <div className="font-inter text-[13px] font-semibold text-ink">{office?.name}</div>
                  <div className="font-inter text-[11px] text-neutral mt-0.5 uppercase tracking-[.1em]">
                    Quick Controls
                  </div>
                </div>
                <button
                  onClick={() => setQuickControlsId(null)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-3 p-5">
                {[
                  {
                    key: 'lights', label: 'Ceiling Lights',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M8 1v1.5M8 12v1.5M1 7h1.5M12.5 7H14M3.2 3.2l1 1M11.8 11.8l-1-1M3.2 10.8l1-1M11.8 3.2l-1 1"
                          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M6 11h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    key: 'lock', label: 'Main Door Lock',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <circle cx="8" cy="11" r="1" fill="currentColor" />
                      </svg>
                    ),
                  },
                  {
                    key: 'hvac', label: 'HVAC System',
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M5 8h6M8 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                ].map(({ key, icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-bg-3 border border-line">
                    <div className="flex items-center gap-3">
                      <span className="text-neutral">{icon}</span>
                      <span className="font-inter text-[13px] text-ink">{t(`assets.deviceLabels.${key}`)}</span>
                    </div>
                    <ToggleSwitch
                      enabled={toggles[key]}
                      onChange={() => toggleIot(quickControlsId, key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      })()}

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 bg-bg-2 border-t border-line md:left-[200px]">
          <span className="font-inter text-[13px] text-neutral-2">
            <span className="text-ink font-semibold">{selectedIds.size}</span> {selectedIds.size > 1 ? t('assets.offices') : t('assets.office')} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 rounded-lg border border-line text-neutral-2 hover:text-ink font-inter text-[13px] transition-colors cursor-pointer bg-transparent"
            >
              Cancel
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-line bg-bg-3 text-ink font-inter text-[13px] hover:bg-ink/[.06] transition-colors cursor-pointer">
              Export Report
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-line bg-bg-3 text-ink font-inter text-[13px] hover:bg-ink/[.06] transition-colors cursor-pointer">
              Send Notification
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="app-mobile-nav fixed bottom-0 left-0 right-0 md:hidden bg-bg-2 border-t border-line flex items-center justify-around h-14 z-50">
        {NAV_GROUPS.map((rawGroup) => {
              const group = translateNavGroup(rawGroup, t)
          const isActive = group.items.some((i) => i.path === location.pathname)
          return (
            <button
              key={group.id}
              onClick={() => navigate(group.mobilePath)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer bg-transparent border-0 transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-neutral-2'
              }`}
            >
              <NavIcon type={group.mobileIcon} />
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
