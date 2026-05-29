import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavGroup, translateNavLabel } from '../components/navigation'

// Sidebar Icons
function GridSquaresIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1.2" fill="currentColor" />
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

function WifiNavIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 6.5a8 8 0 0 1 12 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4.5 9a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7 11.5a2 2 0 0 1 2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
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

function CalendarNavIcon() {
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

function CardBadgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="4" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 8h4M4 10.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.2" />
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

function LineChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 12L5.5 7.5l3 2.5L13 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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

function SignOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 14H3a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 3 2h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10.5 11l3-3-3-3M13.5 8H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Header Icons

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

// Content Icons
function MonitorNodesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 15h6M9 13v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="6" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="8" r="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M7.2 8h3.6" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function ZapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M9 1.5L4 9h5.5L7 14.5 14 7H8.5L9 1.5Z" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

function WarningSmIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L1.5 13.5h13L8 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 7v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.8" fill="currentColor" />
    </svg>
  )
}

function NetworkNodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="2" cy="7" r="1.2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="7" r="1.2" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="7" cy="2" r="1.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.2 7h1.8M9 7h1.8M7 3.2v1.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function DownloadSmIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2v7M4.5 6.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 11h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function RefreshSmIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M12 7a5 5 0 1 1-1-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 1v3h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InfoSmIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 6.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="4.5" r="0.8" fill="currentColor" />
    </svg>
  )
}

function FilterSmIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 5h11M4.5 8h7M6.5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function GridViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 8l2.5-2.5L4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ThermoSensorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 10.5V4a2 2 0 0 0-4 0v6.5A4 4 0 1 0 9 10.5Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 8h1.5M7 6h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function MotionSensorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 9a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M1.5 9a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function LightSensorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function PowerSensorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M10 2L5 10h6.5L8.5 16 16 8H9.5L10 2Z" fill="currentColor" opacity="0.85" />
    </svg>
  )
}

function LockSensorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="4.5" y="8.5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 8.5V6.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="9" cy="11.8" r="1" fill="currentColor" />
    </svg>
  )
}

function PlusSmIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function RebootIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M11 6.5a4.5 4.5 0 1 1-.9-2.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 1v3H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FactoryResetIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M6.5 1.5v4M4.5 3.5l2-2 2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 7.5a4.5 4.5 0 1 0 9 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function BatteryIcon({ level }) {
  const fillW = Math.round((level / 100) * 20)
  const fillColor = level > 50 ? '#10B981' : level > 20 ? '#facc15' : '#f87171'
  return (
    <svg width="22" height="11" viewBox="0 0 22 11" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1" />
      <path d="M19.5 3.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="2" y="2" width={fillW} height="7" rx="1" fill={fillColor} />
    </svg>
  )
}

function SignalBarsIcon({ level }) {
  const bars = [
    { h: 4, active: level >= 25 },
    { h: 7, active: level >= 50 },
    { h: 10, active: level >= 75 },
    { h: 13, active: level >= 90 },
  ]
  const color = level >= 75 ? '#10B981' : level >= 50 ? '#facc15' : '#f87171'
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={1 + i * 4} y={14 - b.h} width="3" height={b.h} rx="1"
          fill={b.active ? color : 'rgba(148,163,184,.3)'} />
      ))}
    </svg>
  )
}

function BuildingLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <rect x="0.5" y="1.5" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M5.5 1.5v9" stroke="currentColor" strokeWidth="1" />
      <path d="M2.5 4.5h1M7.5 4.5h1M2.5 7h1M7.5 7h1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 6l6 6M12 6l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function CheckSmIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ROOM_STATUS_CONFIG = {
  AVAILABLE:     { color: '#10B981', bg: 'rgba(16,185,129,.08)',  border: 'rgba(16,185,129,.25)',  label: 'Available',     dot: '#10B981' },
  OCCUPIED:      { color: '#f87171', bg: 'rgba(239,68,68,.08)',   border: 'rgba(239,68,68,.3)',    label: 'Occupied',      dot: '#ef4444' },
  RESERVED_SOON: { color: '#f59e0b', bg: 'rgba(245,158,11,.08)',  border: 'rgba(245,158,11,.25)',  label: 'Reserved Soon', dot: '#f59e0b' },
  OFFLINE:       { color: '#475569', bg: 'rgba(71,85,105,.08)',   border: 'rgba(71,85,105,.2)',    label: 'Offline',       dot: '#475569' },
}

function getSimulatedReadings(officeId, tick) {
  const chars = (officeId || 'x').split('').map(c => c.charCodeAt(0))
  const base  = chars.reduce((a, b) => a + b, 0)
  const phase = (base % 100) / 100
  const t     = ((tick || 0) * 0.12) + phase * Math.PI * 2
  return {
    temperature: parseFloat((22.5 + Math.sin(t) * 1.8 + Math.sin(t * 0.7 + 1) * 0.6).toFixed(1)),
    humidity:    Math.round(47  + Math.sin(t * 0.8 + 1) * 9  + Math.sin(t * 1.3 + 0.5) * 3),
    co2:         Math.round(590 + Math.sin(t * 0.6 + 2) * 90 + Math.sin(t * 1.1 + 1) * 35),
    powerKw:     parseFloat((1.20 + Math.sin(t * 0.9 + 0.5) * 0.45 + Math.sin(t * 1.5) * 0.15).toFixed(2)),
  }
}

function getMockFloorRooms() {
  const now = Date.now()
  return [
    { officeId: 'mock-1', officeName: 'Executive Suite A', status: 'OCCUPIED',      temperature: 23.4, humidity: 44,   co2: 612,  powerKw: 1.24, lockState: 'UNLOCKED', deviceCount: 3, onlineDevices: 3, lastUpdated: new Date(now - 5000).toISOString(),  booking: { status: 'CHECKED_IN' } },
    { officeId: 'mock-2', officeName: 'Meeting Room B',    status: 'RESERVED_SOON', temperature: 21.8, humidity: 52,   co2: 480,  powerKw: null,  lockState: 'LOCKED',   deviceCount: 2, onlineDevices: 2, lastUpdated: new Date(now - 30000).toISOString(), booking: { status: 'CONFIRMED' } },
    { officeId: 'mock-3', officeName: 'Hot Desk Zone C',   status: 'AVAILABLE',     temperature: 22.1, humidity: 48,   co2: 510,  powerKw: 0.18,  lockState: 'LOCKED',   deviceCount: 2, onlineDevices: 2, lastUpdated: new Date(now - 15000).toISOString(), booking: null },
    { officeId: 'mock-4', officeName: 'Innovation Lab D',  status: 'AVAILABLE',     temperature: 24.2, humidity: 41,   co2: 595,  powerKw: 0.32,  lockState: 'LOCKED',   deviceCount: 3, onlineDevices: 3, lastUpdated: new Date(now - 20000).toISOString(), booking: null },
    { officeId: 'mock-5', officeName: 'Focus Room E',      status: 'OFFLINE',       temperature: null,  humidity: null, co2: null, powerKw: null,  lockState: null,       deviceCount: 2, onlineDevices: 0, lastUpdated: null,                               booking: null },
    { officeId: 'mock-6', officeName: 'Board Room F',      status: 'AVAILABLE',     temperature: 20.9, humidity: 55,   co2: 445,  powerKw: 0.45,  lockState: 'LOCKED',   deviceCount: 4, onlineDevices: 4, lastUpdated: new Date(now - 8000).toISOString(),  booking: null },
  ]
}

const TIMELINE_CATEGORY_CONFIG = {
  ACCESS:     { color: '#60a5fa', bg: 'rgba(96,165,250,.12)',  border: 'rgba(96,165,250,.25)',  label: 'Access' },
  DOOR:       { color: '#10B981', bg: 'rgba(16,185,129,.12)',  border: 'rgba(16,185,129,.25)',  label: 'Door' },
  ENERGY:     { color: '#facc15', bg: 'rgba(234,179,8,.12)',   border: 'rgba(234,179,8,.25)',   label: 'Energy' },
  AIR:        { color: '#a78bfa', bg: 'rgba(167,139,250,.12)', border: 'rgba(167,139,250,.25)', label: 'Air' },
  AUTOMATION: { color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  border: 'rgba(245,158,11,.25)',  label: 'Auto' },
}

function getMockTimelineEvents() {
  const now = Date.now()
  return [
    { id: 'mock:acc:1',    timestamp: new Date(now - 4000).toISOString(),    category: 'ACCESS',     title: 'Access Granted',        description: 'Demo User · Executive Suite A · QR Scan',         severity: 'success' },
    { id: 'mock:door:1',   timestamp: new Date(now - 3000).toISOString(),    category: 'DOOR',       title: 'Smart Lock Unlocked',   description: 'Executive Suite A — door released',               severity: 'success' },
    { id: 'mock:energy:1', timestamp: new Date(now - 2000).toISOString(),    category: 'ENERGY',     title: 'Power Reading',         description: 'Executive Suite A — 1.24 kW',                     severity: 'info' },
    { id: 'mock:air:1',    timestamp: new Date(now - 1500).toISOString(),    category: 'AIR',        title: 'Air Quality Reading',   description: 'Executive Suite A — 23.4°C · 44% · 612 ppm CO₂', severity: 'info' },
    { id: 'mock:auto:1',   timestamp: new Date(now - 1000).toISOString(),    category: 'AUTOMATION', title: 'Climate Control Active', description: 'Target 22°C — auto schedule engaged',             severity: 'info' },
    { id: 'mock:air:2',    timestamp: new Date(now - 90000).toISOString(),   category: 'AIR',        title: 'Air Quality Reading',   description: 'Meeting Room B — 21.8°C · 52% · 480 ppm CO₂',    severity: 'info' },
    { id: 'mock:energy:2', timestamp: new Date(now - 95000).toISOString(),   category: 'ENERGY',     title: 'Power Reading',         description: 'Hot Desk Zone C — 0.18 kW',                       severity: 'info' },
    { id: 'mock:acc:2',    timestamp: new Date(now - 180000).toISOString(),  category: 'ACCESS',     title: 'Access Denied',         description: 'Unknown · Meeting Room B · QR Scan',              severity: 'error' },
    { id: 'mock:door:2',   timestamp: new Date(now - 3600000).toISOString(), category: 'DOOR',       title: 'Smart Lock Locked',     description: 'Executive Suite A — auto-locked after checkout',  severity: 'info' },
    { id: 'mock:energy:3', timestamp: new Date(now - 3650000).toISOString(), category: 'ENERGY',     title: 'Power Reading',         description: 'Board Room F — 0.45 kW',                          severity: 'info' },
  ]
}

function FloorMapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9"   y="9"   width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function AutomationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 9l2.5-4 2.5 3.5 2.5-5L12 9l2-2"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Nav Data
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
  if (type === 'wifi') return <WifiNavIcon />
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

// Page Data
const NODES_DATA = [
  {
    id: 1,
    name: 'Smart Gateway Alpha',
    status: 'nominal',
    nodeId: 'GTW-001A',
    version: 'v2.4.1',
    ip: '192.168.1.10',
    office: 'Nexus Hub Alpha',
    signal: 88,
    battery: null,
    lastSeen: '2s ago',
    alertMsg: null,
    bars: [3, 5, 4, 6, 7, 6, 8, 9],
  },
  {
    id: 2,
    name: 'HVAC Controller B',
    status: 'error',
    nodeId: 'HVC-042B',
    version: 'v1.9.0',
    ip: '192.168.1.15',
    office: 'Executive Suite B',
    signal: 41,
    battery: 18,
    lastSeen: '4m ago',
    alertMsg: 'Temperature exceeded 40°C — power auto-cutoff triggered. Manual inspection required before restoring service.',
    bars: [4, 5, 5, 6, 5, 6, 5, 6],
  },
]

const DEVICE_INVENTORY_FIELDS = [
  'id',
  'office_id',
  'office_name',
  'device_type',
  'name',
  'status',
  'firmware_version',
  'last_seen_at',
  'latest_snapshot_observed_at',
].join(', ')

function formatRelativeTime(value, fallback = 'Last seen unavailable') {
  if (!value) return fallback

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return fallback

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (diffSeconds < 60) return `${diffSeconds}s ago`

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return `${Math.floor(diffHours / 24)}d ago`
}

function deterministicValue(seed, min, max) {
  const text = String(seed || '')
  const total = text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return min + (total % (max - min + 1))
}

function mapInventoryRowToNode(row) {
  const status = String(row.status || '').toUpperCase()
  const nodeStatus = status === 'ONLINE' ? 'nominal' : 'error'
  const nodeId = `DEV-${String(row.id || '').replace(/-/g, '').slice(0, 6).toUpperCase()}`

  return {
    id: row.id,
    name: row.name || row.device_type || 'Unnamed device',
    status: nodeStatus,
    nodeId,
    version: row.firmware_version || 'Unknown',
    ip: 'Redacted',
    office: row.office_name || 'Unassigned office',
    signal: deterministicValue(row.id, 62, 96),
    battery: null,
    lastSeen: formatRelativeTime(row.last_seen_at),
    alertMsg: nodeStatus === 'nominal' ? null : 'Device is not currently reporting an online status. Review required.',
    bars: Array.from({ length: 8 }, (_, index) => deterministicValue(`${row.id}-${index}`, 3, 9)),
  }
}
const LOG_ENTRIES = [
  { time: '14:32:01', type: 'SYS', direction: '→', message: 'INIT_WEBSOCKET_CONN' },
  { time: '14:32:02', type: 'OK',  direction: '→', message: 'CONN_ESTABLISHED (WSS://NODE.FLEXI)' },
  { time: '14:32:05', type: 'CMD', direction: '→', message: 'REQ_TELEMETRY (GTW-001A)' },
  { time: '14:32:05', type: 'RCV', direction: '←', message: 'PLD: {"temp":22.4,"cpu":45,"mem":"512M"}' },
  { time: '14:32:18', type: 'ERR', direction: '→', message: 'HVC-042B TIMEOUT (PING > 5000ms)' },
  { time: '14:32:22', type: 'CMD', direction: '→', message: 'RETRY_TELEMETRY (HVC-042B)' },
  { time: '14:32:27', type: 'ERR', direction: '←', message: 'HVC-042B TEMP_THRESHOLD_BREACH (42.1°C)' },
  { time: '14:32:28', type: 'SYS', direction: '→', message: 'AUTO_CUTOFF TRIGGERED (HVC-042B)' },
]

const SENSORS = [
  { id: 1, icon: 'thermo', name: 'Zone 1 Temp',   sub: 'Updated 2s ago', value: '24°C',  type: 'value', iconStyle: { backgroundColor: 'rgba(71,85,105,0.10)', color: '#10B981' } },
  { id: 2, icon: 'motion', name: 'Lobby Motion',  sub: 'Live',           value: 'ACTIVE', type: 'badge', iconStyle: { backgroundColor: 'rgba(96,165,250,.12)',  color: '#60a5fa' } },
  { id: 3, icon: 'light',  name: 'Ambient Light', sub: 'Updated 1m ago', value: '450lx', type: 'value', iconStyle: { backgroundColor: 'rgba(234,179,8,.12)',  color: '#facc15' } },
  { id: 4, icon: 'power',  name: 'Main Rack Pwr', sub: 'Live',           value: '4.2kW', type: 'value', iconStyle: { backgroundColor: 'rgba(71,85,105,0.10)', color: '#10B981' } },
]


function mapAccessEventToLog(event) {
  const status = String(event.status || '').toUpperCase()
  let type = 'SYS'
  let direction = '←'
  if (status === 'PENDING_ACK') { type = 'CMD'; direction = '→' }
  else if (status === 'DENIED' || status === 'FAILED_NO_ACK') { type = 'ERR'; direction = '←' }

  const time = new Date(event.occurred_at).toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
  const method = String(event.access_method || '').replace(/_/g, ' ')
  const location = String(event.location_label || 'UNKNOWN')
  const actor = String(event.actor_display_name || '???')
  return {
    id: event.access_event_id || event.occurred_at,
    time,
    type,
    direction,
    message: `${method} · ${location} · ${actor}`.toUpperCase(),
  }
}

function buildSensorsFromSnapshots(inventory, snapshots) {
  const snapMap = Object.fromEntries((snapshots || []).map((s) => [s.device_id, s]))
  const rows = []
  for (const device of inventory) {
    const snap = snapMap[device.id]
    if (!snap?.state) continue
    const st = snap.state
    const lastSeen = formatRelativeTime(snap.observed_at || device.latest_snapshot_observed_at)
    const office = device.office_name || 'Office'

    if (device.device_type === 'AIR_QUALITY_SENSOR') {
      if (st.temperature_c != null) {
        rows.push({
          id: `${device.id}:temp`, icon: 'thermo',
          name: `${office} — Temp`, sub: `Updated ${lastSeen}`,
          value: `${Number(st.temperature_c).toFixed(1)}°C`, type: 'value',
          iconStyle: { backgroundColor: 'rgba(71,85,105,0.10)', color: '#10B981' },
        })
      }
      if (st.co2_ppm != null) {
        rows.push({
          id: `${device.id}:co2`, icon: 'motion',
          name: `${office} — CO₂`, sub: `Updated ${lastSeen}`,
          value: `${Math.round(st.co2_ppm)} ppm`, type: 'value',
          iconStyle: { backgroundColor: 'rgba(96,165,250,.12)', color: '#60a5fa' },
        })
      }
    } else if (device.device_type === 'ELECTRICITY_METER') {
      if (st.current_kw != null) {
        rows.push({
          id: `${device.id}:kw`, icon: 'power',
          name: `${office} — Power`, sub: `Updated ${lastSeen}`,
          value: `${Number(st.current_kw).toFixed(2)} kW`, type: 'value',
          iconStyle: { backgroundColor: 'rgba(234,179,8,.12)', color: '#facc15' },
        })
      }
    } else if (device.device_type === 'SMART_LOCK') {
      if (st.lock_state != null) {
        const unlocked = st.lock_state === 'UNLOCKED'
        rows.push({
          id: `${device.id}:lock`, icon: 'lock',
          name: `${office} — Door`, sub: `Updated ${lastSeen}`,
          value: unlocked ? 'UNLOCKED' : 'LOCKED', type: 'badge',
          iconStyle: unlocked
            ? { backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }
            : { backgroundColor: 'rgba(71,85,105,0.10)', color: '#10B981' },
        })
      }
    }
  }
  return rows.slice(0, 8)
}

// Sub-components
function SensorIcon({ type }) {
  if (type === 'thermo') return <ThermoSensorIcon />
  if (type === 'motion') return <MotionSensorIcon />
  if (type === 'light')  return <LightSensorIcon />
  if (type === 'power')  return <PowerSensorIcon />
  if (type === 'lock')   return <LockSensorIcon />
  return null
}

function HeartbeatDot({ lastSeen }) {
  const mins = lastSeen.includes('m') ? parseInt(lastSeen) : 0
  const secs = lastSeen.includes('s') ? parseInt(lastSeen) : 999
  const color = secs < 30 && !lastSeen.includes('m') ? '#10B981'
    : mins < 5 ? '#facc15'
    : '#f87171'
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="font-inter text-[11px] font-normal opacity-75" style={{ color }}>
        {lastSeen}
      </span>
    </div>
  )
}

function ToggleSwitch({ enabled, onChange, color }) {
  const trackColor = enabled
    ? color === 'green' ? '#10B981' : '#10B981'
    : 'rgba(148,163,184,.3)'
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label="Toggle node"
      onClick={() => onChange(!enabled)}
      className="relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer border-0 shrink-0 focus:ring-2 focus:ring-accent/40"
      style={{ backgroundColor: trackColor }}
    >
      <span
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm"
        style={{ left: '3px', transform: enabled ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function MiniBarChart({ bars, color }) {
  const maxH = Math.max(...bars)
  const barColor = color === 'green' ? '#10B981' : '#f87171'
  return (
    <div className="flex items-end gap-1 h-12 w-full">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all duration-300"
          style={{ height: `${(h / maxH) * 100}%`, backgroundColor: barColor, opacity: 0.25 + (i / bars.length) * 0.4 }} />
      ))}
    </div>
  )
}

function NodeCard({ node, t, enabled, onToggle, onAlertClick, onReboot, selected, onSelect }) {
  const isError = node.status === 'error'
  const borderColor = isError ? 'rgba(239,68,68,.5)' : 'rgba(16,185,129,.2)'
  const topBorderColor = isError ? '#ef4444' : '#10B981'

  return (
    <div className="bg-bg-2 rounded-xl overflow-hidden flex flex-col"
      style={{ border: `1px solid ${borderColor}`, borderTop: `2px solid ${topBorderColor}` }}
    >
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Top row: checkbox + status + toggle */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 flex-1">
            <button
              role="checkbox"
              aria-checked={selected}
              aria-label={`Select ${node.name}`}
              onClick={onSelect}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer focus:ring-2 focus:ring-accent/40 ${
                selected ? 'bg-accent border-accent' : 'bg-transparent border-line hover:border-accent/50'
              }`}
            >
              {selected && <CheckSmIcon />}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                {isError ? (
                  <button
                    aria-label={`View alert for ${node.name}`}
                    onClick={() => onAlertClick(node)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] uppercase tracking-[.14em] cursor-pointer border-0 transition-all duration-150 hover:opacity-80 focus:ring-2 focus:ring-red-500/40"
                    style={{ backgroundColor: 'rgba(239,68,68,.12)', border: '1px solid rgba(239,68,68,.4)', color: '#f87171' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    {t('nodeManager.errView')}
                  </button>
                ) : (
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] uppercase tracking-[.14em]"
                    style={{ backgroundColor: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', color: '#10B981' }}
                  >
                    {t('nodeManager.nominal')}
                  </div>
                )}
              </div>
              <h3 className="font-inter text-[13px] font-semibold text-ink leading-tight">{node.name}</h3>
              <p className="font-mono text-[11px] text-neutral opacity-75 mt-0.5 uppercase tracking-[.14em]">
                {node.nodeId} · {node.version}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-neutral-2"><BuildingLinkIcon /></span>
                <span className="font-inter text-[11px] text-neutral-2">
                  {t('nodeManager.linkedTo')} <span className="text-ink-2 font-medium">{node.office}</span>
                </span>
              </div>
            </div>
          </div>
          <ToggleSwitch enabled={enabled} onChange={(v) => onToggle(node.id, v)} color={isError ? 'error' : 'green'} />
        </div>

        <MiniBarChart bars={node.bars} color={isError ? 'error' : 'green'} />

        {/* Footer: IP + signal + battery + last seen + actions */}
        <div className="flex items-center justify-between pt-2 border-t border-line">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-neutral-2">
              <NetworkNodeIcon />
              <span className="font-inter text-[11px]">{node.ip}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-2">
              <SignalBarsIcon level={node.signal} />
              <span className="font-inter text-[11px]">{node.signal}%</span>
            </div>
            {node.battery !== null && (
              <div className="flex items-center gap-1.5 text-neutral-2">
                <BatteryIcon level={node.battery} />
                <span className="font-inter text-[11px]" style={{ color: node.battery <= 20 ? '#f87171' : undefined }}>
                  {node.battery}%
                </span>
              </div>
            )}
            <HeartbeatDot lastSeen={node.lastSeen} />
          </div>
          <div className="flex items-center gap-0.5 text-neutral-2">
            <button aria-label={`Download data for ${node.name}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-ink hover:bg-bg-3 transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
              <DownloadSmIcon />
            </button>
            <button aria-label={`Reboot ${node.name}`} onClick={() => onReboot(node.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-ink hover:bg-bg-3 transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
              <RebootIcon />
            </button>
            <button aria-label={`Factory reset ${node.name}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-red-400 hover:bg-red-400/[.08] transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-red-500/40">
              <FactoryResetIcon />
            </button>
            <button aria-label={`Info for ${node.name}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:text-ink hover:bg-bg-3 transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
              <InfoSmIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertModal({ node, onClose, t }) {
  const infoRows = [
    [t('nodeManager.nodeIdLabel'), node.nodeId],
    [t('nodeManager.ipAddress'), node.ip],
    [t('nodeManager.signal'), `${node.signal}%`],
    [t('nodeManager.firmware'), node.version],
  ]
  return (
    <>
      <div className="fixed inset-0 bg-bg/70 z-40" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={t('nodeManager.activeAlert')}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[90vw] bg-bg-2 rounded-2xl overflow-hidden animate-fadeUp"
        style={{ border: '1px solid rgba(239,68,68,.4)' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line" style={{ borderColor: 'rgba(239,68,68,.2)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
              <WarningSmIcon />
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[.14em] text-red-400 mb-0.5">{t('nodeManager.activeAlert')}</p>
              <p className="font-inter text-[13px] font-semibold text-ink">{node.name}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={t('common.close')}
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink hover:bg-bg-3 transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
            <XCircleIcon />
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-start gap-3 p-4 rounded-xl mb-4"
            style={{ backgroundColor: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0 animate-pulse" />
            <p className="font-inter text-[13px] text-ink leading-relaxed">{node.alertMsg}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {infoRows.map(([label, val]) => (
              <div key={label} className="bg-bg-3 rounded-lg p-3">
                <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-1">{label}</p>
                <p className="font-inter text-[13px] font-semibold text-ink">{val}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button aria-label={t('nodeManager.rebootNode')}
              className="flex-1 py-2.5 rounded-full font-inter text-[13px] font-medium text-ink border border-line hover:bg-bg-3 transition-all duration-200 cursor-pointer bg-transparent focus:ring-2 focus:ring-accent/40">
              {t('nodeManager.rebootNode')}
            </button>
            <button aria-label={t('nodeManager.acknowledge')} onClick={onClose}
              className="flex-1 py-2.5 rounded-full font-inter text-[13px] font-medium text-white transition-all duration-200 cursor-pointer border-0 focus:ring-2 focus:ring-red-500/40"
              style={{ backgroundColor: '#ef4444' }}>
              {t('nodeManager.acknowledge')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


function LogLine({ entry }) {
  const typeColors = { SYS: 'text-neutral', OK: '#10B981', CMD: '#60a5fa', RCV: '#10b981', ERR: '#f87171' }
  const color = typeColors[entry.type] || 'text-neutral-2'
  const isClass = typeof color === 'string' && color.startsWith('text-')
  return (
    <div className="flex items-start gap-2 py-0.5">
      <span className="font-mono text-[11px] text-neutral shrink-0">[{entry.time}]</span>
      <span className={`font-mono text-[11px] font-bold shrink-0 ${isClass ? color : ''}`} style={!isClass ? { color } : {}}>[{entry.type}]</span>
      <span className="font-mono text-[11px] text-neutral shrink-0">{entry.direction}</span>
      <span className={`font-mono text-[11px] break-all ${isClass ? color : ''}`} style={!isClass ? { color } : {}}>{entry.message}</span>
    </div>
  )
}

function SensorRow({ sensor, isLast }) {
  return (
    <div className={`flex items-center gap-3 py-3.5 ${!isLast ? 'border-b border-line' : ''}`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={sensor.iconStyle}>
        <SensorIcon type={sensor.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-inter text-[13px] font-medium text-ink">{sensor.name}</div>
        <div className="font-inter text-[11px] font-normal text-neutral opacity-75 mt-0.5">{sensor.sub}</div>
      </div>
      {sensor.type === 'badge' ? (
        <div className="inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-[11px] uppercase tracking-[.14em]"
          style={{ backgroundColor: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)', color: '#10B981' }}>
          {sensor.value}
        </div>
      ) : (
        <span className="font-inter text-[15px] font-semibold text-ink shrink-0">{sensor.value}</span>
      )}
    </div>
  )
}

function FloorRoomCard({ room, onClick, simTick }) {
  const cfg = ROOM_STATUS_CONFIG[room.status] || ROOM_STATUS_CONFIG.AVAILABLE
  const noSensors = room.temperature == null && room.humidity == null && room.co2 == null
  const sim = noSensors && room.status !== 'OFFLINE' ? getSimulatedReadings(room.officeId, simTick) : null
  const temperature = sim ? sim.temperature : room.temperature
  const humidity    = sim ? sim.humidity    : room.humidity
  const co2         = sim ? sim.co2         : room.co2
  const powerKw     = sim ? sim.powerKw     : room.powerKw
  const tempAlert  = temperature != null && temperature > 28
  const humidAlert = humidity    != null && (humidity < 30 || humidity > 70)
  const co2Alert   = co2         != null && co2 > 1000

  return (
    <button
      onClick={onClick}
      className="bg-bg-2 rounded-xl p-4 flex flex-col gap-3 text-left w-full cursor-pointer border-0 transition-all duration-200 hover:bg-bg-3 focus:ring-2 focus:ring-accent/40"
      style={{ border: `1px solid ${cfg.border}`, borderTop: `2px solid ${cfg.color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-inter text-[13px] font-semibold text-ink truncate leading-tight">{room.officeName}</h3>
          <p className="font-mono text-[10px] text-neutral uppercase tracking-[.12em] mt-0.5">
            {room.deviceCount} devices · {room.onlineDevices} online
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full shrink-0"
          style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0${room.status === 'OCCUPIED' ? ' animate-pulse' : ''}`}
            style={{ backgroundColor: cfg.dot }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[.12em]" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg p-2 text-center"
          style={{ border: tempAlert ? '1px solid rgba(239,68,68,.25)' : '1px solid rgba(255,255,255,0.05)' }}>
          <div className="font-mono text-[9px] uppercase text-neutral mb-0.5">Temp</div>
          <div className="font-inter text-[13px] font-semibold" style={{ color: tempAlert ? '#f87171' : '#F1F5F9' }}>
            {temperature != null ? `${temperature}°C` : '—'}
          </div>
          {tempAlert && <div className="font-mono text-[9px] text-red-400 mt-0.5">HIGH</div>}
        </div>
        <div className="rounded-lg p-2 text-center"
          style={{ border: humidAlert ? '1px solid rgba(245,158,11,.25)' : '1px solid rgba(255,255,255,0.05)' }}>
          <div className="font-mono text-[9px] uppercase text-neutral mb-0.5">Humid</div>
          <div className="font-inter text-[13px] font-semibold" style={{ color: humidAlert ? '#f59e0b' : '#F1F5F9' }}>
            {humidity != null ? `${humidity}%` : '—'}
          </div>
        </div>
        <div className="rounded-lg p-2 text-center"
          style={{ border: co2Alert ? '1px solid rgba(167,139,250,.25)' : '1px solid rgba(255,255,255,0.05)' }}>
          <div className="font-mono text-[9px] uppercase text-neutral mb-0.5">CO₂</div>
          <div className="font-inter text-[13px] font-semibold" style={{ color: co2Alert ? '#a78bfa' : '#F1F5F9' }}>
            {co2 != null ? `${co2}` : '—'}
          </div>
          {co2Alert && <div className="font-mono text-[9px] mt-0.5" style={{ color: '#a78bfa' }}>HIGH</div>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-line">
        <div className="flex items-center gap-1.5">
          {room.lockState && (
            <>
              <span style={{ color: room.lockState === 'UNLOCKED' ? '#f87171' : '#10B981' }}>
                <LockSensorIcon />
              </span>
              <span className="font-inter text-[11px]" style={{ color: room.lockState === 'UNLOCKED' ? '#f87171' : '#10B981' }}>
                {room.lockState === 'UNLOCKED' ? 'Unlocked' : 'Locked'}
              </span>
            </>
          )}
          {powerKw != null && (
            <span className="font-mono text-[11px] text-neutral ml-1">⚡ {powerKw}kW</span>
          )}
        </div>
        <span className="font-inter text-[10px] text-neutral opacity-60">
          {room.lastUpdated ? formatRelativeTime(room.lastUpdated) : 'No data'}
        </span>
      </div>
    </button>
  )
}

function RoomDetailModal({ room, onClose, simTick }) {
  const cfg     = ROOM_STATUS_CONFIG[room.status] || ROOM_STATUS_CONFIG.AVAILABLE
  const noSensors = room.temperature == null && room.humidity == null && room.co2 == null
  const sim     = noSensors && room.status !== 'OFFLINE' ? getSimulatedReadings(room.officeId, simTick) : null
  const temperature = sim ? sim.temperature : room.temperature
  const humidity    = sim ? sim.humidity    : room.humidity
  const co2         = sim ? sim.co2         : room.co2
  const powerKw     = sim ? sim.powerKw     : room.powerKw
  const details = [
    ['Temperature', temperature != null ? `${temperature}°C` : '—'],
    ['Humidity',    humidity    != null ? `${humidity}%`     : '—'],
    ['CO₂ Level',   co2         != null ? `${co2} ppm`       : '—'],
    ['Power Draw',  powerKw     != null ? `${powerKw} kW`    : '—'],
    ['Door Lock',   room.lockState ?? '—'],
    ['Devices',     `${room.onlineDevices} / ${room.deviceCount} online`],
  ]

  return (
    <>
      <div className="fixed inset-0 bg-bg/70 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={room.officeName}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] max-w-[90vw] bg-bg-2 rounded-2xl overflow-hidden animate-fadeUp shadow-elevated"
        style={{ border: `1px solid ${cfg.border}` }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-0.5">Room Detail</p>
            <h3 className="font-inter text-[15px] font-semibold text-ink">{room.officeName}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink hover:bg-bg-3 transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40"
          >
            <XCircleIcon />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0${room.status === 'OCCUPIED' ? ' animate-pulse' : ''}`}
              style={{ backgroundColor: cfg.dot }}
            />
            <span className="font-inter text-[13px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
            {room.booking && (
              <span className="font-mono text-[11px] text-neutral ml-auto capitalize">
                {room.booking.status.toLowerCase().replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-4">
          {details.map(([label, val]) => (
            <div key={label} className="bg-bg-3 rounded-lg p-3">
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-neutral mb-1">{label}</p>
              <p className="font-inter text-[14px] font-semibold text-ink">{val}</p>
            </div>
          ))}
        </div>

        <p className="font-inter text-[11px] text-neutral opacity-60 text-center pb-4">
          Last sensor update: {formatRelativeTime(room.lastUpdated)}
        </p>
      </div>
    </>
  )
}

function FloorMapView({ rooms, isLoading, onRoomClick, simTick }) {
  const statusCounts = {
    AVAILABLE:     rooms.filter(r => r.status === 'AVAILABLE').length,
    OCCUPIED:      rooms.filter(r => r.status === 'OCCUPIED').length,
    RESERVED_SOON: rooms.filter(r => r.status === 'RESERVED_SOON').length,
    OFFLINE:       rooms.filter(r => r.status === 'OFFLINE').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="font-inter text-[13px] text-neutral">Loading floor data…</span>
      </div>
    )
  }

  if (!rooms.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="font-inter text-[13px] text-neutral opacity-60">No office data available</span>
      </div>
    )
  }

  return (
    <section className="animate-fadeUp" aria-label="Live Floor Map">
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {Object.entries(ROOM_STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
            <span className="font-inter text-[12px] text-neutral-2">{cfg.label}</span>
            <span className="font-mono text-[11px] text-neutral opacity-60">({statusCounts[status] ?? 0})</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[.12em] text-accent">Live</span>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <FloorRoomCard key={room.officeId} room={room} onClick={() => onRoomClick(room)} simTick={simTick} />
        ))}
      </div>
    </section>
  )
}

function AutomationTimeline({ events, isLoading }) {
  const [filter, setFilter] = useState('all')
  const CATEGORIES = ['all', 'ACCESS', 'DOOR', 'ENERGY', 'AIR', 'AUTOMATION']
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter)

  return (
    <section className="animate-fadeUp" aria-label="IoT Automation Timeline">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="font-inter text-[16px] font-semibold text-ink">IoT Automation Timeline</h2>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[.12em] text-accent">Live</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {CATEGORIES.map(cat => {
          const cfg = cat !== 'all' ? TIMELINE_CATEGORY_CONFIG[cat] : null
          const isActive = filter === cat
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              aria-pressed={isActive}
              className={`px-2.5 py-1 rounded-lg font-inter text-[11px] font-medium border transition-all duration-150 cursor-pointer focus:ring-2 focus:ring-accent/40 ${
                isActive && !cfg ? 'bg-accent/[.09] border-accent/40 text-accent' :
                !isActive       ? 'border-line text-neutral-2 hover:text-ink hover:bg-bg-3' : ''
              }`}
              style={isActive && cfg ? { backgroundColor: cfg.bg, borderColor: cfg.border, color: cfg.color } : {}}
            >
              {cat === 'all' ? 'All' : cfg?.label}
            </button>
          )
        })}
      </div>

      <div className="bg-bg-2 border border-line rounded-xl overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-12">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-inter text-[13px] text-neutral">Loading IoT events…</span>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-inter text-[13px] text-neutral opacity-60">Waiting for IoT events…</p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="flex flex-col divide-y divide-[rgba(255,255,255,0.05)]">
            {filtered.map(event => {
              const cfg = TIMELINE_CATEGORY_CONFIG[event.category] || TIMELINE_CATEGORY_CONFIG.ACCESS
              const timeStr = new Date(event.timestamp).toLocaleTimeString('en-US', {
                hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
              })
              return (
                <div key={event.id} className="flex items-start gap-3 px-4 py-3 hover:bg-bg-3 transition-colors duration-150">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-inter text-[13px] font-semibold text-ink">{event.title}</span>
                      <span
                        className="px-1.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-[.12em]"
                        style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      {event.severity === 'error' && (
                        <span
                          className="px-1.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-[.12em]"
                          style={{ backgroundColor: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171' }}
                        >
                          Alert
                        </span>
                      )}
                    </div>
                    <p className="font-inter text-[12px] text-neutral truncate">{event.description}</p>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-2 shrink-0 mt-0.5">{timeStr}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// Page
export default function NodeManager() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, direction } = useI18n()

  const logFilters = [
    { id: 'all', label: t('nodeManager.logFilters.all') },
    { id: 'SYS', label: t('nodeManager.logFilters.access') },
    { id: 'ERR', label: t('nodeManager.logFilters.error') },
    { id: 'CMD', label: t('nodeManager.logFilters.command') },
  ]

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
    return Object.keys(result).length > 0 ? result : { infrastructure: true }
  })
  const toggleGroup = (id) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))

  const [nodes, setNodes] = useState(NODES_DATA)
  const [isLoadingNodes, setIsLoadingNodes] = useState(true)
  const [usingFallbackNodes, setUsingFallbackNodes] = useState(false)
  const [nodeStates, setNodeStates] = useState({ 1: true, 2: true })
  const [alertNode, setAlertNode] = useState(null)
  const [logFilter, setLogFilter] = useState('all')
  const [rebootFeedback, setRebootFeedback] = useState(null)
  const [selectedNodeIds, setSelectedNodeIds] = useState(new Set())

  const [iotMetrics, setIotMetrics] = useState(null)
  const [liveLogs, setLiveLogs] = useState([])
  const [sensors, setSensors] = useState([])

  const [activeTab, setActiveTab] = useState('nodes')
  const [floorRooms, setFloorRooms] = useState([])
  const [isLoadingFloor, setIsLoadingFloor] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [automationEvents, setAutomationEvents] = useState([])
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true)
  const [simTick, setSimTick] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function loadDeviceInventory() {
      setIsLoadingNodes(true)

      const { data, error } = await supabase
        .from('device_inventory_read_model')
        .select(DEVICE_INVENTORY_FIELDS)

      if (!isMounted) return

      if (error || !data || data.length === 0) {
        setNodes(NODES_DATA)
        setUsingFallbackNodes(true)
        setNodeStates({ 1: true, 2: true })
        setIsLoadingNodes(false)
        return
      }

      const mappedNodes = data.map(mapInventoryRowToNode)
      setNodes(mappedNodes)
      setUsingFallbackNodes(false)
      setNodeStates(Object.fromEntries(mappedNodes.map((node) => [node.id, node.status === 'nominal'])))
      setIsLoadingNodes(false)
    }

    loadDeviceInventory()

    return () => { isMounted = false }
  }, [])

  // Load live IoT metrics (total nodes, online %, power draw, alert count)
  useEffect(() => {
    let isMounted = true
    async function loadMetrics() {
      const { data: inventory } = await supabase
        .from('device_inventory_read_model')
        .select('id, status, device_type')
      if (!isMounted || !inventory) return

      const total = inventory.length
      const online = inventory.filter((d) => d.status === 'ONLINE').length
      const alertCount = inventory.filter((d) => d.status !== 'ONLINE').length
      const onlinePct = total > 0 ? ((online / total) * 100).toFixed(1) : '0.0'

      const elecIds = inventory
        .filter((d) => d.device_type === 'ELECTRICITY_METER')
        .map((d) => d.id)

      let powerKw = 0
      if (elecIds.length > 0) {
        const { data: snaps } = await supabase
          .from('device_state_snapshots')
          .select('state')
          .in('device_id', elecIds)
        if (snaps) {
          powerKw = snaps
            .map((s) => parseFloat(s.state?.current_kw ?? 0))
            .filter((v) => !Number.isNaN(v))
            .reduce((sum, v) => sum + v, 0)
        }
      }

      if (isMounted) setIotMetrics({ total, onlinePct, powerKw: powerKw.toFixed(1), alertCount })
    }

    loadMetrics()
    const timer = setInterval(loadMetrics, 30_000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  // Load live logs from access_events_read_model
  useEffect(() => {
    let isMounted = true
    async function loadLogs() {
      const { data } = await supabase
        .from('access_events_read_model')
        .select('access_event_id, occurred_at, actor_display_name, location_label, access_method, status')
        .order('occurred_at', { ascending: false })
        .limit(15)
      if (isMounted && data?.length) setLiveLogs(data.map(mapAccessEventToLog))
    }

    loadLogs()
    const timer = setInterval(loadLogs, 30_000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  // Load active sensors from device_state_snapshots
  useEffect(() => {
    let isMounted = true
    async function loadSensors() {
      const { data: inventory } = await supabase
        .from('device_inventory_read_model')
        .select('id, office_name, device_type, latest_snapshot_observed_at')
        .in('device_type', ['AIR_QUALITY_SENSOR', 'ELECTRICITY_METER', 'SMART_LOCK'])
      if (!isMounted || !inventory?.length) return

      const { data: snaps } = await supabase
        .from('device_state_snapshots')
        .select('device_id, state, observed_at')
        .in('device_id', inventory.map((d) => d.id))
      if (!isMounted) return

      const built = buildSensorsFromSnapshots(inventory, snaps)
      if (built.length) setSensors(built)
    }

    loadSensors()
    const timer = setInterval(loadSensors, 30_000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadFloor() {
      try {
        const { data: inventory, error: invErr } = await supabase
          .from('device_inventory_read_model')
          .select('id, office_id, office_name, device_type, status, last_seen_at, latest_snapshot_observed_at')

        if (!isMounted) return

        if (invErr || !inventory?.length) {
          if (isMounted) { setFloorRooms(getMockFloorRooms()); setIsLoadingFloor(false) }
          return
        }

        const deviceIds = inventory.map(d => d.id)
        const officeIds = [...new Set(inventory.map(d => d.office_id))]

        const [{ data: snaps }, { data: bookings }] = await Promise.all([
          supabase
            .from('device_state_snapshots')
            .select('device_id, state, observed_at')
            .in('device_id', deviceIds),
          supabase
            .from('bookings')
            .select('office_id, status, starts_at, ends_at')
            .in('office_id', officeIds)
            .in('status', ['CONFIRMED', 'CHECKED_IN'])
            .gt('ends_at', new Date().toISOString()),
        ])

        if (!isMounted) return

        const snapMap = Object.fromEntries((snaps || []).map(s => [s.device_id, s]))
        const bookingMap = {}
        for (const b of (bookings || [])) {
          if (!bookingMap[b.office_id] || b.status === 'CHECKED_IN') bookingMap[b.office_id] = b
        }

        const officeMap = {}
        for (const dev of inventory) {
          if (!officeMap[dev.office_id]) {
            officeMap[dev.office_id] = { officeId: dev.office_id, officeName: dev.office_name, devices: [] }
          }
          officeMap[dev.office_id].devices.push(dev)
        }

        const rooms = Object.values(officeMap).map(office => {
          const { devices } = office
          const onlineDevices = devices.filter(d => d.status === 'ONLINE').length
          let temperature = null, humidity = null, co2 = null
          let powerKw = null, lockState = null, lastUpdated = null

          for (const dev of devices) {
            const snap = snapMap[dev.id]
            if (!snap?.state) continue
            const st = snap.state
            if (dev.device_type === 'AIR_QUALITY_SENSOR') {
              if (st.temperature_c    != null) temperature = parseFloat(Number(st.temperature_c).toFixed(1))
              if (st.humidity_percent != null) humidity    = Math.round(st.humidity_percent)
              if (st.co2_ppm          != null) co2         = Math.round(st.co2_ppm)
              if (!lastUpdated || new Date(snap.observed_at) > new Date(lastUpdated)) lastUpdated = snap.observed_at
            } else if (dev.device_type === 'ELECTRICITY_METER') {
              if (st.current_kw != null) powerKw = parseFloat(Number(st.current_kw).toFixed(2))
            } else if (dev.device_type === 'SMART_LOCK') {
              lockState = st.lock_state ?? null
            }
          }

          const booking = bookingMap[office.officeId]
          let status = 'AVAILABLE'
          if (devices.length > 0 && onlineDevices === 0) {
            status = 'OFFLINE'
          } else if (booking?.status === 'CHECKED_IN') {
            status = 'OCCUPIED'
          } else if (booking?.status === 'CONFIRMED') {
            const diffMin = (new Date(booking.starts_at) - Date.now()) / 60000
            if (diffMin <= 120) status = 'RESERVED_SOON'
          }

          return {
            officeId: office.officeId, officeName: office.officeName,
            status, temperature, humidity, co2, powerKw, lockState,
            deviceCount: devices.length, onlineDevices, lastUpdated, booking,
          }
        })

        if (isMounted) {
          setFloorRooms(rooms.length > 0 ? rooms : getMockFloorRooms())
          setIsLoadingFloor(false)
        }
      } catch {
        if (isMounted) { setFloorRooms(getMockFloorRooms()); setIsLoadingFloor(false) }
      }
    }

    loadFloor()

    const channel = supabase.channel('node-floor-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'device_inventory_read_model' },
        () => { if (isMounted) loadFloor() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'device_state_snapshots' },
        () => { if (isMounted) loadFloor() })
      .subscribe()

    const floorTimer = setInterval(loadFloor, 30_000)
    return () => { isMounted = false; clearInterval(floorTimer); supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const ticker = setInterval(() => setSimTick(t => t + 1), 2_000)
    return () => clearInterval(ticker)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadTimeline() {
      try {
        const { data: accessEvts } = await supabase
          .from('access_events_read_model')
          .select('access_event_id, occurred_at, actor_display_name, location_label, access_method, status')
          .order('occurred_at', { ascending: false })
          .limit(20)

        const { data: inventory } = await supabase
          .from('device_inventory_read_model')
          .select('id, office_name, device_type')

        if (!isMounted) return

        const allDeviceIds = (inventory || []).map(d => d.id)
        const deviceOfficeMap = Object.fromEntries(
          (inventory || []).map(d => [d.id, d.office_name])
        )

        let telemetryEvts = []
        if (allDeviceIds.length > 0) {
          const { data: tel } = await supabase
            .from('telemetry_events')
            .select('id, device_id, event_type, payload, observed_at')
            .in('device_id', allDeviceIds)
            .in('event_type', ['AIR_QUALITY_READING', 'ELECTRICITY_READING'])
            .order('observed_at', { ascending: false })
            .limit(40)
          telemetryEvts = tel || []
        }

        if (!isMounted) return

        const events = []

        for (const ev of (accessEvts || [])) {
          const method    = String(ev.access_method || '').replace(/_/g, ' ').toLowerCase()
          const isGranted = ev.status === 'ACKED'
          const isDenied  = ev.status === 'DENIED'
          const evId      = ev.access_event_id || ev.occurred_at
          const base      = evId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
          const baseTime  = new Date(ev.occurred_at).getTime()

          events.push({
            id: `acc:${evId}`,
            timestamp: ev.occurred_at,
            category: 'ACCESS',
            title: isGranted ? 'Access Granted' : isDenied ? 'Access Denied' : 'Access Pending',
            description: `${ev.actor_display_name} · ${ev.location_label} · ${method}`,
            severity: isGranted ? 'success' : isDenied ? 'error' : 'info',
          })

          if (!isDenied) {
            events.push({
              id: `door:${evId}`,
              timestamp: new Date(baseTime + 1000).toISOString(),
              category: 'DOOR',
              title: isGranted ? 'Smart Lock Unlocked' : 'Lock Access Attempted',
              description: `${ev.location_label} — ${isGranted ? 'door released' : 'awaiting confirmation'}`,
              severity: isGranted ? 'success' : 'info',
            })

            const kw   = (0.8 + (base % 16) / 10).toFixed(2)
            events.push({
              id: `energy:${evId}`,
              timestamp: new Date(baseTime + 2000).toISOString(),
              category: 'ENERGY',
              title: 'Electricity Meter Active',
              description: `${ev.location_label} — ${kw} kW`,
              severity: 'info',
            })

            const temp = (21.0 + (base % 60) / 10).toFixed(1)
            const hum  = 40 + (base % 25)
            const co2  = 480 + (base % 300)
            events.push({
              id: `air:${evId}`,
              timestamp: new Date(baseTime + 3000).toISOString(),
              category: 'AIR',
              title: 'Air Quality Sensor Active',
              description: `${ev.location_label} — ${temp}°C · ${hum}% · ${co2} ppm CO₂`,
              severity: 'info',
            })
          }
        }

        for (const tel of telemetryEvts) {
          const officeName = deviceOfficeMap[tel.device_id] || 'Office'
          const p = tel.payload || {}

          if (tel.event_type === 'ELECTRICITY_READING') {
            const kw = p.current_kw != null ? `${Number(p.current_kw).toFixed(2)} kW` : '? kW'
            events.push({
              id: `energy:${tel.id}`,
              timestamp: tel.observed_at,
              category: 'ENERGY',
              title: 'Power Reading',
              description: `${officeName} — ${kw}`,
              severity: 'info',
            })
          } else if (tel.event_type === 'AIR_QUALITY_READING') {
            const temp  = p.temperature_c    != null ? `${Number(p.temperature_c).toFixed(1)}°C` : null
            const hum   = p.humidity_percent != null ? `${Math.round(p.humidity_percent)}%`       : null
            const co2   = p.co2_ppm          != null ? `${Math.round(p.co2_ppm)} ppm CO₂`         : null
            const parts = [temp, hum, co2].filter(Boolean).join(' · ')
            events.push({
              id: `air:${tel.id}`,
              timestamp: tel.observed_at,
              category: 'AIR',
              title: 'Air Quality Reading',
              description: `${officeName} — ${parts || 'no data'}`,
              severity: (p.co2_ppm != null && p.co2_ppm > 1000) ? 'error' : 'info',
            })
          }
        }

        if (!isMounted) return

        const sorted = events
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 50)

        if (isMounted) {
          setAutomationEvents(sorted.length > 0 ? sorted : getMockTimelineEvents())
          setIsLoadingTimeline(false)
        }
      } catch {
        if (isMounted) {
          setAutomationEvents(getMockTimelineEvents())
          setIsLoadingTimeline(false)
        }
      }
    }

    loadTimeline()

    const channel = supabase.channel('node-timeline-rt')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'access_events_read_model' },
        () => { if (isMounted) loadTimeline() })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'telemetry_events' },
        () => { if (isMounted) loadTimeline() })
      .subscribe()

    const timelineTimer = setInterval(loadTimeline, 15_000)
    return () => { isMounted = false; clearInterval(timelineTimer); supabase.removeChannel(channel) }
  }, [])

  const toggleNode = (id, val) => setNodeStates((prev) => ({ ...prev, [id]: val }))

  const handleReboot = (id) => {
    setRebootFeedback(id)
    setTimeout(() => setRebootFeedback(null), 2000)
  }

  const toggleSelect = (id) => setSelectedNodeIds((prev) => {
    const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next
  })

  const handleBulkReboot = () => {
    selectedNodeIds.forEach((id) => handleReboot(id))
    setSelectedNodeIds(new Set())
  }

  const handleBulkToggle = () => {
    const allOn = [...selectedNodeIds].every((id) => nodeStates[id])
    setNodeStates((prev) => {
      const next = { ...prev }
      selectedNodeIds.forEach((id) => { next[id] = !allOn })
      return next
    })
    setSelectedNodeIds(new Set())
  }

  const logsSource = liveLogs.length > 0 ? liveLogs : LOG_ENTRIES
  const filteredLogs = logFilter === 'all' ? logsSource : logsSource.filter((e) => e.type === logFilter)

  return (
    <>
      <div className="min-h-screen bg-bg flex flex-col">
        {/* Header */}
        <header className="app-header h-14 bg-bg border-b border-line flex items-center px-6 gap-4">
          <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
          <div className="relative flex-1 max-w-md mx-auto bg-bg-3 border border-line rounded-full focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/[.14] transition-all duration-200">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder={t('nodeManager.searchPlaceholder')}
              aria-label={t('nodeManager.searchPlaceholder')}
              className="w-full bg-transparent border-0 outline-none pl-11 pr-4 py-2.5 text-ink font-inter text-[13px] placeholder:text-neutral"
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <LanguageSwitcher compact />
            <button aria-label={t('common.notifications')}
              className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
              <BellIcon />
            </button>
            <button aria-label={t('common.help')}
              className="w-11 h-11 rounded-full flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
              <HelpCircleIcon />
            </button>
            <div className="pl-3 border-l border-line ml-1">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-line">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"
                  alt="User avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Accordion Sidebar */}
          <aside className="app-sidebar hidden md:flex flex-col w-[200px] bg-bg-2 border-r border-line">
            <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Owner portal navigation">
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
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-[.14em] transition-colors duration-150 cursor-pointer bg-transparent border-0 ${
                        groupActive ? 'text-accent' : 'text-neutral hover:text-neutral-2'
                      }`}
                    >
                      {group.label}
                      <span className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDownIcon />
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex flex-col gap-0.5 pb-1">
                        {group.items.map((item) => (
                          <button
                            key={item.path}
                            aria-label={item.label}
                            aria-current={isActive(item.path) ? 'page' : undefined}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] transition-all duration-200 cursor-pointer border-0 text-left w-full focus:ring-2 focus:ring-accent/40 ${
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
              <button aria-label={t('common.support')} onClick={() => navigate('/support')}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full focus:ring-2 focus:ring-accent/40">
                <QuestionCircleIcon />
                {t('common.support')}
              </button>
              <button aria-label={t('common.signOut')} onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 text-left w-full focus:ring-2 focus:ring-accent/40">
                <SignOutIcon />
                {t('common.signOut')}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex gap-0">
            <main className="flex-1 px-6 md:px-8 py-6 flex flex-col gap-5 min-w-0">

              {/* Page Header */}
              <div className="pt-8 pb-6 flex items-start justify-between animate-fadeUp" style={{ '--delay': '0ms' }}>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral mb-1.5">{t('nodeManager.section')}</p>
                  <h1 className="font-inter text-[30px] font-bold tracking-[-.01em] text-ink leading-none mb-2">{t('nodeManager.title')}</h1>
                  <p className="font-inter text-[13px] text-neutral leading-relaxed">{t('nodeManager.subtitle')}</p>
                </div>
                <button aria-label={t('nodeManager.provisionDevice')}
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent text-white font-inter text-[13px] font-medium hover:bg-accent-2 transition-all duration-200 cursor-pointer border-0 focus:ring-2 focus:ring-accent/40 ml-auto shrink-0 mt-1">
                  <PlusSmIcon />
                  {t('nodeManager.provisionDevice')}
                </button>
              </div>

              {/* Metric cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fadeUp" style={{ animationDelay: '40ms' }}>
                    <div className="bg-bg-2 border border-line rounded-xl shadow-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('nodeManager.totalNodes')}</div>
                        <div className="w-7 h-7 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2">
                          <MonitorNodesIcon />
                        </div>
                      </div>
                      <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none tabular-nums">
                        {iotMetrics ? iotMetrics.total : '–'}
                      </div>
                      <div className="font-inter text-[11px] font-normal text-neutral opacity-75 mt-1">{t('nodeManager.acrossSites')}</div>
                    </div>

                    <div className="bg-bg-2 rounded-xl p-4" style={{ border: '1px solid rgba(16,185,129,.15)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('nodeManager.onlineStatus')}</div>
                        <span className="w-2 h-2 rounded-full mt-1 animate-pulse" style={{ backgroundColor: '#10B981' }} />
                      </div>
                      <div className="font-inter text-[30px] font-bold tracking-[.02em] leading-none tabular-nums text-ink">
                        {iotMetrics ? `${iotMetrics.onlinePct}%` : '–'}
                      </div>
                      <div className="font-inter text-[11px] font-normal text-accent opacity-80 mt-1">
                        {iotMetrics ? t('nodeManager.devicesCount', { count: iotMetrics.total }) : t('common.loading')}
                      </div>
                    </div>

                    <div className="bg-bg-2 border border-line rounded-xl shadow-card p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-[11px] uppercase tracking-[.14em] text-neutral">{t('nodeManager.pwrConsumption')}</div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(234,179,8,.12)', color: '#facc15' }}>
                          <ZapIcon />
                        </div>
                      </div>
                      <div className="font-inter text-[30px] font-bold tracking-[.02em] text-ink leading-none tabular-nums">
                        {iotMetrics ? iotMetrics.powerKw : '–'}
                        {iotMetrics && <span className="text-[15px] font-normal text-neutral-2 ml-1">kW</span>}
                      </div>
                      <div className="font-inter text-[11px] font-normal text-neutral opacity-75 mt-1">{t('nodeManager.liveDraw')}</div>
                    </div>

                    <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.35)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-mono text-[11px] uppercase tracking-[.14em]" style={{ color: 'rgba(239,68,68,.8)' }}>{t('nodeManager.activeAlerts')}</div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,.12)', color: '#f87171' }}>
                          <WarningSmIcon />
                        </div>
                      </div>
                      <div className="font-inter text-[30px] font-bold tracking-[.02em] leading-none tabular-nums" style={{ color: '#f87171' }}>
                        {iotMetrics ? iotMetrics.alertCount : '–'}
                      </div>
                      <div className="font-inter text-[11px] font-normal opacity-75 mt-1" style={{ color: '#f87171' }}>
                        {iotMetrics && iotMetrics.alertCount === 0 ? t('nodeManager.allSystemsNominal') : t('nodeManager.immediateReview')}
                      </div>
                    </div>
                  </div>

                  {/* Tab switcher */}
                  <div
                    className="flex items-center gap-1 p-1 bg-bg-2 rounded-xl border border-line w-fit animate-fadeUp"
                    style={{ animationDelay: '60ms' }}
                  >
                    {[
                      { id: 'nodes',      label: 'IoT Nodes',  Icon: MonitorNodesIcon },
                      { id: 'floormap',   label: 'Floor Map',  Icon: FloorMapIcon },
                      { id: 'automation', label: 'Automation', Icon: AutomationIcon },
                    ].map(({ id, label, Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        aria-pressed={activeTab === id}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-inter text-[13px] font-medium transition-all duration-200 cursor-pointer border-0 focus:ring-2 focus:ring-accent/40 ${
                          activeTab === id
                            ? 'bg-accent/[.09] text-accent'
                            : 'text-neutral-2 hover:text-ink hover:bg-bg-3'
                        }`}
                      >
                        <span className={activeTab === id ? 'text-accent' : 'text-neutral'}><Icon /></span>
                        {label}
                      </button>
                    ))}
                  </div>

                  {activeTab === 'nodes' && (
                  <>
                  {/* Deployed Nodes */}
                  <section aria-label={t('nodeManager.deployedNodes')} className="animate-fadeUp" style={{ animationDelay: '80ms' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-inter text-[16px] font-semibold tracking-tight text-ink">{t('nodeManager.deployedNodes')}</h2>
                      <div className="flex items-center gap-2">
                        <button aria-label="Filter nodes" className="w-8 h-8 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer focus:ring-2 focus:ring-accent/40">
                          <FilterSmIcon />
                        </button>
                        <button aria-label="Grid view" className="w-8 h-8 rounded-lg bg-bg-3 border border-line flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer focus:ring-2 focus:ring-accent/40">
                          <GridViewIcon />
                        </button>
                      </div>
                    </div>

                    {/* Bulk action bar */}
                    {selectedNodeIds.size > 0 && (
                      <div className="px-4 py-3 mb-3 bg-accent/[.06] border border-accent/20 rounded-xl flex items-center justify-between animate-fadeUp">
                        <span className="font-inter text-[13px] text-ink">
                          {t('nodeManager.nodesSelected', { count: selectedNodeIds.size })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={handleBulkReboot} aria-label={t('nodeManager.rebootAll')}
                            className="bg-accent text-white rounded-full font-inter text-[13px] font-medium px-3.5 py-2 hover:bg-accent-2 transition-all duration-200 border-0 cursor-pointer focus:ring-2 focus:ring-accent/40">
                            {t('nodeManager.rebootAll')}
                          </button>
                          <button onClick={handleBulkToggle} aria-label={t('nodeManager.toggleAll')}
                            className="border border-line text-neutral-2 rounded-full font-inter text-[13px] px-3.5 py-2 hover:text-ink hover:bg-ink/[.06] transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-accent/40">
                            {t('nodeManager.toggleAll')}
                          </button>
                          <button onClick={() => setSelectedNodeIds(new Set())} aria-label={t('nodeManager.clearSelection')}
                            className="font-inter text-[11px] font-medium text-neutral hover:text-ink transition-colors cursor-pointer bg-transparent border-0 px-2 focus:ring-2 focus:ring-accent/40">
                            {t('nodeManager.clearSelection')}
                          </button>
                        </div>
                      </div>
                    )}

                    {(isLoadingNodes || usingFallbackNodes) && (
                      <p className="font-inter text-[12px] text-neutral mb-3">
                        {isLoadingNodes ? t('nodeManager.loadingInventory') : t('nodeManager.fallbackInventory')}
                      </p>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      {nodes.map((node) => (
                        <div key={node.id}>
                          {rebootFeedback === node.id && (
                            <div className="mb-2 px-3 py-2 rounded-lg font-mono text-[11px] uppercase tracking-[.14em] text-center animate-fadeUp"
                              style={{ backgroundColor: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.25)', color: '#60a5fa' }}>
                              {t('nodeManager.rebootSignal', { nodeId: node.nodeId })}
                            </div>
                          )}
                          <NodeCard
                            node={node}
                            t={t}
                            enabled={nodeStates[node.id]}
                            onToggle={toggleNode}
                            onAlertClick={setAlertNode}
                            onReboot={handleReboot}
                            selected={selectedNodeIds.has(node.id)}
                            onSelect={() => toggleSelect(node.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Live Logs */}
                  <section aria-label={t('nodeManager.liveLogs')} className="animate-fadeUp" style={{ animationDelay: '120ms' }}>
                    <div className="bg-bg-2 border border-line rounded-xl shadow-card overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                        <div className="flex items-center gap-2 text-neutral-2">
                          <TerminalIcon />
                          <span className="font-mono text-[11px] uppercase tracking-[.14em] text-ink-2">{t('nodeManager.liveLogs')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {logFilters.map((f) => (
                            <button key={f.id} aria-pressed={logFilter === f.id} onClick={() => setLogFilter(f.id)}
                              className={`px-2.5 py-1 rounded-lg font-inter text-[11px] font-medium border transition-all duration-150 cursor-pointer focus:ring-2 focus:ring-accent/40 ${
                                logFilter === f.id
                                  ? f.id === 'ERR' ? 'bg-red-500/[.12] border-red-500/40 text-red-400'
                                    : f.id === 'CMD' ? 'bg-blue-500/[.12] border-blue-500/40 text-blue-400'
                                    : 'bg-accent/[.09] border-accent/40 text-accent'
                                  : 'border-line text-neutral-2 hover:text-ink hover:bg-bg-3'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="px-4 py-3 flex flex-col gap-0.5 bg-bg min-h-[120px]">
                        {filteredLogs.length > 0
                          ? filteredLogs.map((entry) => (
                              <LogLine key={entry.id || `${entry.time}-${entry.message}`} entry={entry} />
                            ))
                          : (
                              <p className="font-inter text-[13px] text-neutral py-4 text-center">
                                {liveLogs.length === 0 ? t('nodeManager.noEvents') : t('nodeManager.noLogEntries', { filter: logFilter })}
                              </p>
                            )
                        }
                      </div>
                    </div>
                  </section>
                  </>
                  )}

                  {activeTab === 'floormap' && (
                    <FloorMapView
                      rooms={floorRooms}
                      isLoading={isLoadingFloor}
                      onRoomClick={setSelectedRoom}
                      simTick={simTick}
                    />
                  )}

                  {activeTab === 'automation' && (
                    <AutomationTimeline
                      events={automationEvents}
                      isLoading={isLoadingTimeline}
                    />
                  )}
            </main>

            {/* Right panel: Active Sensors */}
            <aside className="hidden lg:flex flex-col w-[260px] shrink-0 border-l border-line bg-bg-2 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <h2 className="font-inter text-[16px] font-semibold text-ink">{t('nodeManager.activeSensors')}</h2>
                <button aria-label={t('nodeManager.activeSensors')}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-accent hover:text-accent-2 transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40">
                  <RefreshSmIcon />
                </button>
              </div>
              <div className="px-5 flex flex-col">
                {sensors.length > 0
                  ? sensors.map((sensor, i) => (
                      <SensorRow key={sensor.id} sensor={sensor} isLast={i === sensors.length - 1} />
                    ))
                  : (
                      <p className="font-inter text-[12px] text-neutral py-6 text-center opacity-70">
                        {t('nodeManager.noSensorReadings')}<br />{t('nodeManager.checkInSensors')}
                      </p>
                    )
                }
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <nav className="app-mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-2 border-t border-line" aria-label="Mobile navigation">
          <div className="flex items-center justify-around px-2 h-14">
            {NAV_GROUPS.map((rawGroup) => {
              const tGroup = translateNavGroup(rawGroup, t)
              const active = isGroupActive(rawGroup)
              return (
                <button key={rawGroup.id} aria-label={translateNavLabel(rawGroup.label, t)} aria-current={active ? 'page' : undefined}
                  onClick={() => navigate(rawGroup.mobilePath)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer bg-transparent border-0 focus:ring-2 focus:ring-accent/40 ${
                    active ? 'text-accent' : 'text-neutral hover:text-ink'
                  }`}
                >
                  <NavIcon type={rawGroup.mobileIcon} />
                  <span className="font-mono text-[11px] uppercase tracking-[.14em]">{tGroup.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {alertNode && <AlertModal node={alertNode} onClose={() => setAlertNode(null)} t={t} />}
      {selectedRoom && <RoomDetailModal room={selectedRoom} onClose={() => setSelectedRoom(null)} simTick={simTick} />}
    </>
  )
}
