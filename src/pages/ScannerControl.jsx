import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { verifyQrToken, FlexiApiError } from '../lib/flexispaceApi'
import { OperatorMobileNav, OperatorSidebar } from '../components/OperatorSidebar'
import { useI18n } from '../i18n'

function ScanCrosshair({ t }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5 pointer-events-none">
      <div className="relative overflow-hidden" style={{ width: '192px', height: '192px' }}>
        <span className="absolute top-0 left-0 w-9 h-9 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: '#10B981' }} />
        <span className="absolute top-0 right-0 w-9 h-9 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: '#10B981' }} />
        <span className="absolute bottom-0 left-0 w-9 h-9 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: '#10B981' }} />
        <span className="absolute bottom-0 right-0 w-9 h-9 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: '#10B981' }} />
        <div
          className="animate-laserScan absolute left-0 right-0 h-[2px] top-0"
          style={{
            background: 'linear-gradient(90deg, transparent, #10B981, #10B981, transparent)',
          }}
        />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[.14em]" style={{ color: '#94A3B8' }}>
        {t('scanner.pointCamera')}
      </span>
    </div>
  )
}

function AuthModal({ onClose, iotState, onVerify, onScanNext, deviceName, verifyResult, hasDevice, t }) {
  const modalRef = useRef(null)
  const [tokenInput, setTokenInput] = useState('')

  useEffect(() => {
    const el = modalRef.current
    if (!el) return
    const focusable = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    first?.focus()
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus() }
      }
    }
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="absolute inset-x-3 z-20 rounded-2xl overflow-hidden animate-fadeUp border bg-bg-4 border-muted"
      style={{
        '--delay': '80ms',
        bottom: '8px',
        borderTopWidth: '3px',
        borderTopColor: '#10B981',
      }}
    >
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center transition-colors bg-transparent border-0 cursor-pointer z-10"
        style={{ color: '#64748B' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="px-5 pt-6 pb-5 flex flex-col items-center">
        <div id="auth-modal-title" className="text-base font-semibold mb-1 text-center" style={{ color: '#F1F5F9' }}>
          {t('scanner.qrVerification')}
        </div>
        <div className="text-xs mb-4 text-center" style={{ color: '#94A3B8' }}>
          {deviceName ? `${t('scanner.devicePrefix')} ${deviceName}` : t('scanner.noDeviceFound')}
        </div>

        {iotState === 'idle' && (
          <>
            {!hasDevice && (
              <p className="text-[11px] text-red-400 text-center mb-3 leading-relaxed">
                {t('scanner.noScannerAvailable')}
              </p>
            )}
            <div className="w-full mb-3">
              <label htmlFor="qr-token-input" className="block font-mono text-[11px] uppercase tracking-[.14em] mb-1.5" style={{ color: '#64748B' }}>
                {t('scanner.pasteToken')}
              </label>
              <input
                id="qr-token-input"
                type="text"
                dir="ltr"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={t('scanner.pasteTokenPlaceholder')}
                className="w-full rounded-xl px-3 py-2.5 text-[12px] font-mono outline-none border bg-bg-3 border-muted text-ink placeholder:text-neutral focus:border-accent"
                style={{ backgroundColor: 'rgba(15,23,42,0.6)' }}
              />
            </div>
            <button
              onClick={() => onVerify(tokenInput.trim())}
              disabled={!tokenInput.trim() || !hasDevice}
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#10B981', color: '#0F172A' }}
            >
              {t('scanner.verifyQrToken')}
            </button>
          </>
        )}

        {iotState === 'sending' && (
          <div className="flex flex-col items-center gap-2 py-3">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin motion-reduce:animate-none"
              style={{ borderColor: '#10B981', borderTopColor: 'transparent' }}
            />
            <p className="text-xs" style={{ color: '#94A3B8' }}>{t('scanner.verifyingQr')}</p>
          </div>
        )}

        {iotState === 'success' && (
          <div className="flex flex-col items-center gap-2 py-3 w-full">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ color: '#10B981' }}>
                <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs font-medium" style={{ color: '#10B981' }}>{t('scanner.accessVerified')}</p>
            {verifyResult && (
              <div className="w-full flex flex-col gap-1 mt-1">
                {verifyResult.status && (
                  <p className="text-[11px] text-center font-mono uppercase tracking-[.1em]" style={{ color: '#10B981' }}>
                    {verifyResult.status}
                  </p>
                )}
                {verifyResult.access_event_id && (
                  <p className="text-[11px] text-center" style={{ color: '#64748B' }}>
                    Event: {verifyResult.access_event_id.slice(0, 8).toUpperCase()}
                  </p>
                )}
                {verifyResult.booking_id && (
                  <p className="text-[11px] text-center" style={{ color: '#64748B' }}>
                    Booking: {verifyResult.booking_id.slice(0, 8).toUpperCase()}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={onScanNext}
              className="mt-2 w-full py-2.5 rounded-xl text-xs font-medium cursor-pointer border bg-bg-4 border-muted"
              style={{ color: '#94A3B8' }}
            >
              {t('scanner.scanAnotherTicket')}
            </button>
          </div>
        )}

        {iotState === 'denied' && (
          <div className="flex flex-col items-center gap-2 py-3 w-full">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ color: '#f87171' }}>
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs font-medium text-red-400">{t('scanner.accessDenied')}</p>
            {verifyResult?.errorMessage && (
              <p className="text-[11px] text-center" style={{ color: '#64748B' }}>{verifyResult.errorMessage}</p>
            )}
            <button
              onClick={onScanNext}
              className="mt-2 w-full py-2.5 rounded-xl text-xs font-medium cursor-pointer border bg-bg-4 border-muted"
              style={{ color: '#94A3B8' }}
            >
              {t('scanner.tryAgain')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const BOTTOM_NAV_ITEMS = [
  {
    key: 'scanner',
    labelKey: 'scanner.scannerTab',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="5" height="5" rx="0.5" />
        <rect x="16" y="3" width="5" height="5" rx="0.5" />
        <rect x="3" y="16" width="5" height="5" rx="0.5" />
        <path d="M21 16h-3v3m0 2h3M14 3v2m0 2v1M11 14v1m3-1h3v3M11 11h1" />
      </svg>
    ),
  },
  {
    key: 'manual',
    labelKey: 'scanner.manualTab',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    ),
  },
  {
    key: 'logs',
    labelKey: 'scanner.logsTab',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: 'profile',
    labelKey: 'scanner.profileTab',
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function ScannerControl() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState('scanner')
  const [showModal, setShowModal] = useState(false)
  const [iotState, setIotState] = useState('idle')
  const [verifyResult, setVerifyResult] = useState(null)
  const [deviceId, setDeviceId] = useState(null)
  const [deviceName, setDeviceName] = useState(null)
  const [deviceLoading, setDeviceLoading] = useState(true)
  const [deviceError, setDeviceError] = useState('')

  // Load the first SMART_LOCK device from device_inventory_read_model
  useEffect(() => {
    let cancelled = false

    async function loadDevice() {
      setDeviceLoading(true)
      setDeviceError('')
      const { data, error } = await supabase
        .from('device_inventory_read_model')
        .select('id,name,device_type,status')
        .eq('device_type', 'SMART_LOCK')
        .limit(1)

      if (cancelled) return
      if (error) {
        setDeviceError('Failed to load scanner device.')
      } else if (!data?.length) {
        setDeviceError('No SMART_LOCK device configured. Contact your administrator.')
      } else {
        setDeviceId(data[0].id)
        setDeviceName(data[0].name)
      }
      setDeviceLoading(false)
    }

    loadDevice()
    return () => { cancelled = true }
  }, [])

  const handleVerify = async (rawToken) => {
    if (!rawToken) return
    setIotState('sending')
    setVerifyResult(null)
    try {
      const result = await verifyQrToken({
        rawToken,
        deviceId: deviceId ?? undefined,
      })
      setVerifyResult(result.data ?? null)
      setIotState('success')
    } catch (err) {
      const msg = err instanceof FlexiApiError ? err.message : 'Verification failed.'
      setVerifyResult({ errorMessage: msg })
      setIotState('denied')
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setIotState('idle')
    setVerifyResult(null)
  }

  const handleScanNext = () => {
    setShowModal(false)
    setIotState('idle')
    setVerifyResult(null)
  }

  return (
    <div className="min-h-screen bg-bg flex font-inter">
      <OperatorSidebar />
      <main className="flex-1 flex items-center justify-center p-6 pb-20 md:pb-6 min-w-0">
        <div className="relative w-[340px] max-w-full rounded-[3rem] overflow-hidden shadow-2xl border-[6px] bg-bg-4 border-muted">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full z-30 bg-bg-3" />
        {/* Volume buttons */}
        <div className="absolute -left-[8px] top-20 w-[6px] h-8 rounded-l-sm bg-muted" />
        <div className="absolute -left-[8px] top-32 w-[6px] h-8 rounded-l-sm bg-muted" />
        {/* Power button */}
        <div className="absolute -right-[8px] top-24 w-[6px] h-10 rounded-r-sm bg-muted" />

        {/* Screen */}
        <div className="h-[680px] flex flex-col overflow-hidden">
          <div className="h-8 shrink-0 bg-bg-3" />

          <header
            className="h-12 flex items-center px-4 gap-3 shrink-0 z-10 relative border-b bg-bg-3"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className="font-mono font-bold tracking-widest uppercase text-[11px]" style={{ color: '#10B981' }}>
              FLEXISPACE CONTROL
            </span>
          </header>

          <main className="flex-1 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover scale-105"
                style={{ opacity: 0.1, filter: 'blur(3px)' }}
              />
              <div className="absolute inset-0" style={{ backgroundColor: 'rgba(11,16,32,0.85)' }} />
            </div>

            {!showModal && (
              <>
                {deviceLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <p className="font-mono text-[11px] uppercase tracking-[.14em]" style={{ color: '#94A3B8' }}>
                      {t('scanner.loadingDevice')}
                    </p>
                  </div>
                ) : deviceError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3 px-6">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ color: '#f87171' }}>
                        <path d="M7 1.5L1 12h12L7 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        <path d="M7 5.5v3M7 10v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="font-mono text-[11px] uppercase tracking-[.14em] text-center leading-relaxed" style={{ color: '#f87171' }}>
                      {deviceError}
                    </p>
                  </div>
                ) : (
                  <>
                    <ScanCrosshair t={t} />
                    <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
                      <button
                        aria-label={t('scanner.tapToScan')}
                        onClick={() => setShowModal(true)}
                        className="px-8 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-[.14em] font-bold cursor-pointer border-0 transition-all duration-200 text-bg-3"
                        style={{ backgroundColor: '#10B981' }}
                      >
                        {t('scanner.tapToScan')}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {showModal && (
              <AuthModal
                onClose={handleClose}
                iotState={iotState}
                onVerify={handleVerify}
                onScanNext={handleScanNext}
                deviceName={deviceName}
                verifyResult={verifyResult}
                hasDevice={!!deviceId}
                t={t}
              />
            )}
          </main>

          <nav
            className="shrink-0 z-10 relative border-t bg-bg-3"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="grid grid-cols-4">
              {BOTTOM_NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  aria-label={t(item.labelKey)}
                  onClick={() => setActiveTab(item.key)}
                  className="relative flex flex-col items-center gap-1 py-3 px-2 cursor-pointer bg-transparent border-0 transition-all duration-200"
                  style={{ color: item.key === activeTab ? '#10B981' : '#64748B' }}
                >
                  {item.key === activeTab && (
                    <span
                      className="absolute top-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: '#10B981' }}
                    />
                  )}
                  {item.icon(item.key === activeTab)}
                  <span className="font-mono text-[11px] uppercase tracking-[.14em]">{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
        </div>
      </main>
      <OperatorMobileNav />
    </div>
  )
}
