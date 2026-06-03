import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateNavLabel } from '../components/navigation'

const PER_PAGE = 4

function formatCents(cents, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format((cents ?? 0) / 100)
  } catch {
    return `${((cents ?? 0) / 100).toFixed(2)}`
  }
}

function formatPaymentDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function mapPaymentRow(row, officeMap) {
  const officeName = officeMap[row.booking_id] ?? 'Office Booking'
  const refBase = row.idempotency_key || row.id
  const paymentType = row.metadata?.payment_type ?? null
  const typeLabel = paymentType === 'USAGE_FEE' ? 'Session Usage' : (row.status ?? 'PAYMENT')
  return {
    id: row.id ? row.id.slice(0, 8).toUpperCase() : '—',
    rawId: row.id,
    bookingId: row.booking_id,
    gateway: row.gateway,
    status: row.status,
    amount: formatCents(row.amount_cents, row.currency),
    date: formatPaymentDate(row.created_at),
    paidAt: formatPaymentDate(row.paid_at),
    expiresAt: row.expires_at,
    reference: refBase ? refBase.slice(0, 8).toUpperCase() : '—',
    desc: `${officeName} — ${typeLabel}`,
  }
}

const SIDEBAR_NAV = [
  {
    key: 'overview',
    label: 'Overview',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    key: 'payments',
    label: 'Payments',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    key: 'billing',
    label: 'Billing History',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function BillingHistory() {
  const { t } = useI18n()
  const [page, setPage] = useState(1)
  const [activeNav, setActiveNav] = useState('billing')
  const [allEntries, setAllEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentsError, setPaymentsError] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchPayments() {
      setLoading(true)
      setPaymentsError('')

      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      const userId = user?.id
      if (!userId) { setLoading(false); return }

      const { data: myOffices } = await supabase
        .from('offices')
        .select('id, name')
        .eq('owner_id', userId)
        .is('deleted_at', null)
      if (cancelled) return
      const ownerOfficeIds = (myOffices ?? []).map((o) => o.id)
      if (ownerOfficeIds.length === 0) { setAllEntries([]); setLoading(false); return }

      const { data: myBookings } = await supabase
        .from('bookings')
        .select('id, office_id')
        .in('office_id', ownerOfficeIds)
        .is('deleted_at', null)
      if (cancelled) return
      const bookingIds = (myBookings ?? []).map((b) => b.id)
      if (bookingIds.length === 0) { setAllEntries([]); setLoading(false); return }

      const officeById = Object.fromEntries((myOffices ?? []).map((o) => [o.id, o.name]))
      const officeMap = Object.fromEntries((myBookings ?? []).map((b) => [b.id, officeById[b.office_id] ?? 'Workspace']))

      const { data: payments, error } = await supabase
        .from('payments')
        .select('id,booking_id,gateway,status,amount_cents,currency,idempotency_key,paid_at,expires_at,created_at,updated_at,metadata')
        .in('booking_id', bookingIds)
        .order('created_at', { ascending: false })
        .limit(200)

      if (cancelled) return
      if (error) {
        setPaymentsError('Failed to load payment history.')
        setLoading(false)
        return
      }

      setAllEntries((payments ?? []).map((p) => mapPaymentRow(p, officeMap)))
      setLoading(false)
    }

    fetchPayments()
    return () => { cancelled = true }
  }, [refreshTrigger])

  useEffect(() => {
    const channel = supabase
      .channel('payments-billing')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payments' }, () => {
        setRefreshTrigger(t => t + 1)
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payments' }, () => {
        setRefreshTrigger(t => t + 1)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const totalPages = Math.max(1, Math.ceil(allEntries.length / PER_PAGE))
  const start = (page - 1) * PER_PAGE
  const visible = allEntries.slice(start, start + PER_PAGE)

  return (
    <div className="min-h-screen bg-bg flex flex-col font-inter">
      <header className="h-14 border-b border-line bg-bg-2 flex items-center px-6 gap-6 shrink-0 z-10">
        <Link to="/" className="shrink-0 flex items-center"><BrandLogo variant="mono" iconSize={22} /></Link>
        <nav className="flex items-center gap-1 ml-2">
          {['Dashboard', 'Workspaces', 'Analytics'].map(link => (
            <button
              key={link}
              className="px-3 py-1.5 rounded-lg text-neutral-2 font-inter text-[13.5px] hover:text-ink hover:bg-bg-3 transition-all duration-200 bg-transparent border-0 cursor-pointer"
            >
              {translateNavLabel(link, t)}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <LanguageSwitcher compact />
          <button aria-label={t('common.notifications')} className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 rounded-lg hover:bg-bg-3">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button aria-label={t('common.help')} className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-ink transition-colors cursor-pointer bg-transparent border-0 rounded-lg hover:bg-bg-3">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
          <div className="w-11 h-11 rounded-full overflow-hidden border border-line shrink-0">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80" srcSet="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80 1x, https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80 2x" alt="User avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-[200px] shrink-0 border-r border-line bg-bg-2 flex-col py-5 px-3 hidden md:flex">
          <div className="flex items-center gap-3 px-2 mb-6 pb-5 border-b border-line">
            <div className="w-10 h-10 rounded-xl border border-line overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=100&q=80" alt="" aria-hidden="true" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-inter text-[13.5px] font-semibold text-accent">{t('billing.premiumTier')}</div>
              <div className="font-inter text-[11px] text-neutral">{t('billing.enterpriseAccount')}</div>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 flex-1">
            {SIDEBAR_NAV.map(item => (
              <button
                key={item.key}
                aria-label={translateNavLabel(item.label, t)}
                onClick={() => setActiveNav(item.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-inter text-[13.5px] w-full text-left cursor-pointer border-0 transition-all duration-200 ${
                  activeNav === item.key
                    ? 'text-accent bg-accent/[.09] border-l-2 border-accent'
                    : 'text-neutral-2 hover:bg-bg-3 hover:text-ink border-l-2 border-transparent bg-transparent'
                }`}
              >
                {item.icon}
                {translateNavLabel(item.label, t)}
              </button>
            ))}
          </div>

          <button className="mt-4 mx-1 py-2.5 rounded-xl border border-accent text-accent font-inter text-[13.5px] font-semibold hover:bg-accent/10 transition-all duration-200 cursor-pointer bg-transparent">
            {t('billing.upgradeBtn')}
          </button>
        </nav>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8 pb-20 md:pb-8">
            <div className="mb-6 animate-fadeUp" style={{ '--delay': '0ms' }}>
              <h1 className="font-fraunces text-4xl font-medium text-ink mb-1">{t('billing.title')}</h1>
              <p className="font-inter text-[15px] text-neutral-2">{t('billing.subtitle')}</p>
            </div>

            <div className="bg-bg-2 border border-line rounded-2xl overflow-hidden animate-fadeUp" style={{ '--delay': '80ms' }}>
              <div className="hidden md:grid grid-cols-[180px_160px_1fr_120px_64px] bg-bg-3 border-b border-line px-6 py-3">
                {[t('billing.colDate'), t('billing.colBookingId'), t('billing.colDesc'), t('billing.colAmount'), t('billing.colInvoice')].map(col => (
                  <div key={col} className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{col}</div>
                ))}
              </div>

              {loading && (
                <div className="px-6 py-10 text-center">
                  <p className="font-inter text-[13.5px] text-neutral">{t('billing.loading')}</p>
                </div>
              )}

              {!loading && paymentsError && (
                <div className="px-6 py-10 text-center">
                  <p className="font-inter text-[13.5px] text-red-500">{paymentsError}</p>
                </div>
              )}

              {!loading && !paymentsError && visible.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <p className="font-inter text-[13.5px] text-neutral">{t('billing.empty')}</p>
                </div>
              )}

              {!loading && !paymentsError && visible.map((entry, i) => (
                <div
                  key={entry.rawId ?? entry.id}
                  className={`hidden md:grid grid-cols-[180px_160px_1fr_120px_64px] items-center px-6 py-4 hover:bg-bg-3 transition-colors duration-150 animate-fadeUp ${i < visible.length - 1 ? 'border-b border-line' : ''}`}
                  style={{ '--delay': `${i * 60 + 120}ms` }}
                >
                  <div className="font-inter text-[13.5px] text-ink-2">{entry.date}</div>
                  <div className="font-mono text-[13.5px] text-accent">#{entry.id}</div>
                  <div className="font-inter text-[13.5px] text-ink-2 pr-4">{entry.desc}</div>
                  <div className="font-inter text-[13.5px] font-semibold text-ink">{entry.amount}</div>
                  <div className="flex items-center">
                    <button
                      aria-label={t('billing.downloadInvoice', { id: entry.id })}
                      className="w-8 h-8 flex items-center justify-center text-neutral-2 hover:text-accent hover:bg-accent/10 rounded-lg transition-all duration-200 cursor-pointer bg-transparent border-0"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {!loading && !paymentsError && visible.map((entry, i) => (
                <div
                  key={`mob-${entry.rawId ?? entry.id}`}
                  className={`md:hidden flex items-center justify-between px-4 py-3 animate-fadeUp ${i < visible.length - 1 ? 'border-b border-line' : ''}`}
                  style={{ '--delay': `${i * 60 + 120}ms` }}
                >
                  <div>
                    <div className="font-inter text-[11px] text-accent mb-0.5">#{entry.id}</div>
                    <div className="font-inter text-[13.5px] text-ink-2">{entry.desc}</div>
                    <div className="font-inter text-[11px] text-neutral mt-0.5">{entry.date}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-inter text-[13.5px] font-semibold text-ink">{entry.amount}</span>
                    <button aria-label={t('billing.downloadInvoice', { id: entry.id })} className="w-11 h-11 flex items-center justify-center text-neutral-2 hover:text-accent rounded-lg bg-transparent border-0 cursor-pointer">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between px-6 py-3 border-t border-line bg-bg-3">
                <span className="font-inter text-[13.5px] text-neutral">
                  {loading ? t('billing.loadingShort') : t('billing.showing', { start: allEntries.length ? start + 1 : 0, end: Math.min(start + PER_PAGE, allEntries.length), total: allEntries.length })}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    aria-label={t('billing.previous')}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-1.5 rounded-lg border border-line text-ink-2 font-inter text-[13.5px] hover:bg-bg-2 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('billing.prevBtn')}
                  </button>
                  <button
                    aria-label={t('billing.next')}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-1.5 rounded-lg border border-line text-ink-2 font-inter text-[13.5px] hover:bg-bg-2 hover:text-ink transition-all duration-200 cursor-pointer bg-transparent disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {t('billing.nextBtn')}
                  </button>
                </div>
              </div>
            </div>
          </main>

          <footer className="border-t border-line px-6 md:px-10 py-3 flex items-center justify-between shrink-0 bg-bg-2">
            <span className="font-inter text-[11px] text-neutral uppercase tracking-[.1em]">· Secure Encrypted Environment.</span>
            <div className="hidden md:flex items-center gap-4">
              {[
                { key: 'billing.privacyPolicy', label: t('billing.privacyPolicy') },
                { key: 'billing.termsOfService', label: t('billing.termsOfService') },
                { key: 'billing.securityArchitecture', label: t('billing.securityArchitecture') },
              ].map(link => (
                <a key={link.key} href="#" className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral hover:text-ink transition-colors no-underline">
                  {link.label}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </div>

      <nav
        className="app-mobile-nav fixed bottom-0 left-0 right-0 md:hidden bg-bg-2 border-t border-line flex items-center justify-around h-14 z-50"
        aria-label="Mobile navigation"
      >
        {SIDEBAR_NAV.map((item) => (
          <button
            key={item.key}
            aria-label={translateNavLabel(item.label, t)}
            aria-current={activeNav === item.key ? 'page' : undefined}
            onClick={() => setActiveNav(item.key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer bg-transparent border-0 ${
              activeNav === item.key ? 'text-accent' : 'text-neutral hover:text-ink'
            }`}
          >
            {item.icon}
            <span className="font-inter text-[11px] uppercase tracking-[.1em]">
              {item.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
