import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useI18n } from '../i18n'
import { translateNavItem } from './navigation'
import BrandLogo from './BrandLogo'

const OPERATOR_NAV_ITEMS = [
  { label: 'Command Center', shortLabel: 'Command', path: '/command-center', icon: 'command' },
  { label: "Today's Bookings", shortLabel: "Today's", path: '/todays-bookings', icon: 'today' },
  { label: 'Live Access Feed', shortLabel: 'Access', path: '/access-logs', icon: 'access' },
  { label: 'Facility Ops Hub', shortLabel: 'Facility', path: '/facility-ops-hub', icon: 'wrench' },
  { label: 'Scanner Control', shortLabel: 'Scanner', path: '/scanner-control', icon: 'scanner' },
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
      <path d="M11.5 1a3.5 3.5 0 0 0-3.46 4.07L2.5 10.5A1.5 1.5 0 0 0 4.5 12.5l5.46-5.54A3.5 3.5 0 1 0 11.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M5.5 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 10l3-2.5L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 7.5h7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function NavIcon({ type }) {
  if (type === 'today') return <NavTodayIcon />
  if (type === 'wrench') return <NavWrenchIcon />
  if (type === 'scanner') return <NavScannerIcon />
  if (type === 'command') return <NavCommandIcon />
  if (type === 'access') return <NavAccessIcon />
  return null
}

export function OperatorSidebar() {
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

  return (
    <aside className="app-sidebar hidden md:flex flex-col w-[200px] shrink-0 bg-bg-2 border-r border-line">
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-line shrink-0">
        <Link to="/" className="flex items-center"><BrandLogo variant="colored" iconSize={24} /></Link>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 flex-1 overflow-y-auto" aria-label="Operator navigation">
        {OPERATOR_NAV_ITEMS.map((rawItem) => {
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
        })}
      </nav>
      <div className="flex flex-col gap-0.5 p-3 border-t border-line shrink-0">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-inter text-[13px] text-neutral-2 hover:bg-bg-3 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent border-0 border-l-[3px] border-transparent text-left"
        >
          <LogoutIcon /> {t('common.signOut')}
        </button>
      </div>
    </aside>
  )
}

export function OperatorMobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useI18n()

  return (
    <nav className="app-mobile-nav fixed bottom-0 left-0 right-0 md:hidden bg-bg-2 border-t border-line flex items-center justify-around h-14 z-50" aria-label="Operator mobile navigation">
      {OPERATOR_NAV_ITEMS.map((rawItem) => {
        const item = translateNavItem(rawItem, t)
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 cursor-pointer bg-transparent border-0 transition-colors duration-200 ${
              isActive ? 'text-accent' : 'text-neutral-2'
            }`}
          >
            <NavIcon type={item.icon} />
            <span className="font-mono text-[11px] uppercase tracking-[.14em]">{item.shortLabel}</span>
          </button>
        )
      })}
    </nav>
  )
}
