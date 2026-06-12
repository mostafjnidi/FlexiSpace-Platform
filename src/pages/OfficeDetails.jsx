import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import BrandLogo from '../components/BrandLogo'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n'
import { translateStatusLabel } from '../components/navigation'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1200&q=80',
]

function getFallbackImage(id) {
  if (!id) return FALLBACK_IMAGES[0]
  const sum = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return FALLBACK_IMAGES[sum % FALLBACK_IMAGES.length]
}

function formatPrice(cents, currency) {
  const amount = (cents ?? 0) / 100
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${currency || 'USD'} ${amount.toFixed(2)}`
  }
}

function formatLocation(office) {
  return [office.building, office.floor, office.room].filter(Boolean).join(' · ') || 'FlexiSpace Network'
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

function BuildingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6h4M5 9h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.5L1.5 4.5L7 7.5L12.5 4.5L7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M1.5 7.5L7 10.5L12.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2.5" y="6.5" width="9" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 6.5V5a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function AirIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 5.5c0-1.933 1.567-3.5 3.5-3.5S9 3.567 9 5.5c0 1.1-.51 2.08-1.3 2.71" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2 8.5h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M2 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function MeterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 7L4 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
    </svg>
  )
}

function CpuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 1.5v2M8.5 1.5v2M5.5 10.5v2M8.5 10.5v2M1.5 5.5h2M1.5 8.5h2M10.5 5.5h2M10.5 8.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="animate-spin motion-reduce:animate-none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M16 9a7 7 0 0 0-7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LockBookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="7.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7.5V5.5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="currentColor" />
    </svg>
  )
}

// ── Device helpers ─────────────────────────────────────────────────────────────

const DEVICE_TYPE_LABELS = {
  SMART_LOCK: 'Smart Lock',
  AIR_QUALITY_SENSOR: 'Air Quality Sensor',
  ELECTRICITY_METER: 'Electricity Meter',
}

function DeviceTypeIcon({ type }) {
  if (type === 'SMART_LOCK') return <LockIcon />
  if (type === 'AIR_QUALITY_SENSOR') return <AirIcon />
  if (type === 'ELECTRICITY_METER') return <MeterIcon />
  return <CpuIcon />
}

const DEVICE_STATUS_COLORS = {
  ONLINE: 'bg-accent',
  OFFLINE: 'bg-neutral/40',
  MAINTENANCE: 'bg-yellow-400',
}

function DeviceRow({ device }) {
  const { t } = useI18n()
  const dotColor = DEVICE_STATUS_COLORS[device.status] ?? 'bg-neutral/40'
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-bg-3 border border-line">
      <div className="flex items-center gap-3">
        <span className="text-neutral-2">
          <DeviceTypeIcon type={device.device_type} />
        </span>
        <div>
          <div className="font-inter text-[13px] text-ink leading-tight">{device.name}</div>
          <div className="font-inter text-[11px] uppercase tracking-[.12em] text-neutral mt-0.5">
            {t(`office.devices.${device.device_type}`) !== `office.devices.${device.device_type}` ? t(`office.devices.${device.device_type}`) : (DEVICE_TYPE_LABELS[device.device_type] ?? device.device_type)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
        <span className="font-inter text-[11px] uppercase tracking-[.12em] text-neutral-2">
          {translateStatusLabel(device.status, t, t('common.unknown'))}
        </span>
      </div>
    </div>
  )
}

// ── Meta card ─────────────────────────────────────────────────────────────────

function MetaCard({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 bg-bg-3 border border-line rounded-xl px-4 py-3">
      <span className="text-neutral-2 mt-0.5 shrink-0">{icon}</span>
      <div>
        <div className="font-inter text-[11px] uppercase tracking-[.12em] text-neutral mb-0.5">{label}</div>
        <div className="font-inter text-[13px] text-ink-2">{value}</div>
      </div>
    </div>
  )
}

// ── Loading / error states ─────────────────────────────────────────────────────

function PageShell({ onBack, children }) {
  const navigate = useNavigate()
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div dir="ltr" className="px-6 md:px-16 pt-10 pb-6 flex items-center justify-between border-b border-line">
        <Link
          to="/"
          className="flex items-center"
          aria-label="FlexiSpace home"
        >
          <BrandLogo variant="mono" iconSize={20} />
        </Link>
        <LanguageSwitcher compact />
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-2 border border-line font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2 hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </button>
      </div>
      {children}
    </div>
  )
}

function LoadingState({ onBack }) {
  const { t } = useI18n()
  return (
    <PageShell onBack={onBack}>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="text-neutral-2">
            <SpinnerIcon />
          </span>
          <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral">{t('office.loading')}</span>
        </div>
      </div>
    </PageShell>
  )
}

function ErrorState({ message, onBack }) {
  const { t } = useI18n()
  return (
    <PageShell onBack={onBack}>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-critical/10 border border-critical/25 flex items-center justify-center text-critical font-mono text-lg">!</div>
          <div>
            <p className="font-inter text-[15px] text-ink-2 font-medium mb-1">{t('office.unable')}</p>
            <p className="font-inter text-[13px] text-neutral">{message}</p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-line font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2 hover:text-ink hover:bg-ink/[.06] transition-all duration-200 cursor-pointer bg-transparent"
          >
            <ArrowLeftIcon />
            {t('common.back')}
          </button>
        </div>
      </div>
    </PageShell>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function OfficeDetails() {
  const { t } = useI18n()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const preloaded = location.state?.workspace ?? null

  const [office, setOffice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [devices, setDevices] = useState([])
  const [devicesLoaded, setDevicesLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setLoadError(null)

      const { data, error } = await supabase
        .from('offices')
        .select('id,name,description,building,floor,room,capacity,hourly_rate_cents,currency,status,image_url')
        .eq('id', id)
        .single()

      if (!mounted) return

      if (error || !data) {
        const msg = error?.code === 'PGRST116'
          ? t('office.notFound')
          : (error?.message || t('office.unable'))
        setLoadError(msg)
        setLoading(false)
        return
      }

      setOffice(data)
      setLoading(false)

      const { data: deviceData } = await supabase
        .from('device_inventory_read_model')
        .select('id,device_type,name,status,last_seen_at')
        .eq('office_id', id)

      if (mounted) {
        setDevices(deviceData ?? [])
        setDevicesLoaded(true)
      }
    }

    load()
    return () => { mounted = false }
  }, [id, t])

  const handleBack = () => navigate(-1)

  if (loading) return <LoadingState onBack={handleBack} />
  if (loadError) return <ErrorState message={loadError} onBack={handleBack} />

  const image = office.image_url || preloaded?.image || getFallbackImage(id)
  const isActive = office.status === 'ACTIVE'
  const location2 = formatLocation(office)

  const handleBookNow = () => {
    navigate('/checkout', {
      state: {
        workspace: {
          id: office.id,
          name: office.name,
          image,
          price: formatPrice(office.hourly_rate_cents, office.currency),
          location: location2,
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div dir="ltr" className="px-6 md:px-16 pt-10 pb-6 flex items-center justify-between border-b border-line">
        <Link
          to="/"
          className="flex items-center"
          aria-label="FlexiSpace home"
        >
          <BrandLogo variant="mono" iconSize={20} />
        </Link>
        <LanguageSwitcher compact />
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-2 border border-line font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2 hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer"
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </button>
      </div>

      <main className="flex-1 px-6 md:px-16 py-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden mb-8 h-56 md:h-72">
            <img
              src={image}
              alt={`${office.name} workspace`}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGES[0] }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent" />
            {!isActive && (
              <div className="absolute inset-0 bg-bg/50 flex items-center justify-center">
                <span className="font-inter text-[12px] uppercase tracking-[.1em] text-ink bg-bg/80 px-4 py-2 rounded-full border border-line">
                  {t('office.currentlyUnavailable')}
                </span>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-[1fr_340px] gap-8 items-start">
            <div className="flex flex-col gap-7">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-accent' : 'bg-red-400'}`}
                  />
                  <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2">
                    {isActive ? t('common.available') : t('common.unavailable')}
                  </span>
                </div>
                <h1 className="font-inter font-semibold text-2xl md:text-3xl text-ink tracking-tight mb-1">
                  {office.name}
                </h1>
                <div className="flex items-center gap-1.5 text-neutral-2">
                  <LocationIcon />
                  <span className="font-inter text-[13px]">{location2}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MetaCard
                  label={t('office.capacity')}
                  value={`${office.capacity} ${office.capacity === 1 ? t('office.person') : t('office.persons')}`}
                  icon={<PersonIcon />}
                />
                <MetaCard
                  label={t('assets.building')}
                  value={office.building || '—'}
                  icon={<BuildingIcon />}
                />
                <MetaCard
                  label={t('assets.floor')}
                  value={office.floor || '—'}
                  icon={<LayersIcon />}
                />
                <MetaCard
                  label={t('assets.room')}
                  value={office.room || '—'}
                  icon={<BuildingIcon />}
                />
              </div>

              {office.description && (
                <div>
                  <h2 className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2 mb-3">
                    {t('office.aboutSpace')}
                  </h2>
                  <p className="font-inter text-[14px] text-ink-2 leading-relaxed">
                    {office.description}
                  </p>
                </div>
              )}

              <div>
                <h2 className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2 mb-3">
                  {t('office.smartOffice')}
                </h2>
                {!devicesLoaded ? (
                  <div className="flex items-center gap-2 text-neutral">
                    <SpinnerIcon />
                    <span className="font-inter text-[13px]">{t('office.loadingDevices')}</span>
                  </div>
                ) : devices.length === 0 ? (
                  <div className="px-4 py-4 rounded-xl bg-bg-3 border border-line">
                    <p className="font-inter text-[13px] text-neutral-2 leading-relaxed">
                      {t('office.noDevices')}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {devices.map((device) => (
                      <DeviceRow key={device.id} device={device} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:sticky md:top-6">
              <div className="bg-bg-2 border border-accent/40 rounded-2xl p-6 flex flex-col gap-5">
                <div>
                  <span className="font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2">{t('office.hourlyRate')}</span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-inter font-semibold text-[26px] text-accent tracking-tight">
                      {formatPrice(office.hourly_rate_cents, office.currency)}
                    </span>
                    <span className="font-inter text-[13px] text-neutral-2">{t('workspace.perHour')}</span>
                  </div>
                </div>

                <div className="border-t border-line" />

                <div className="flex flex-col gap-2 text-[13px] text-neutral-2 font-inter">
                  <div className="flex items-center gap-2">
                    <PersonIcon />
                    <span>{t('office.upToPeople', { count: office.capacity, unit: office.capacity === 1 ? t('office.person') : t('office.persons') })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LocationIcon />
                    <span>{location2}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBookNow}
                  disabled={!isActive}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-[18px] py-[14px] rounded-xl bg-accent text-white font-inter text-[13.5px] font-semibold transition-all duration-200 hover:bg-accent-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LockBookIcon />
                  {t('office.bookNow')}
                </button>

                {!isActive && (
                  <p className="font-inter text-[12px] text-neutral text-center">
                    {t('office.unavailableCopy')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
