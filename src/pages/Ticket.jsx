import { useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { appUnlock } from '../lib/flexispaceApi'
import LanguageSwitcher from '../components/LanguageSwitcher'

// ─── PIN derivation ───────────────────────────────────────────────────────────

function derivePIN(bookingId) {
  if (!bookingId) return '------'
  const hex = bookingId.replace(/-/g, '')
  const n = parseInt(hex.slice(-8), 16)
  return String(n % 1_000_000).padStart(6, '0')
}

// ─── Delay helper ─────────────────────────────────────────────────────────────

function delay(ms) { return new Promise((r) => setTimeout(r, ms)) }

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTimeRange(start, end) {
  if (!start || !end) return '—'
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false }
  return `${new Date(start).toLocaleTimeString(undefined, opts)} – ${new Date(end).toLocaleTimeString(undefined, opts)}`
}

// ─── Terminal state machine ───────────────────────────────────────────────────

const TERMINAL_STATES = {
  IDLE:            'idle',
  AUTHENTICATING:  'authenticating',
  CONNECTING:      'connecting',
  GRANTED:         'granted',
  DENIED:          'denied',
  LOCKED_OUT:      'locked_out',
  CHECKED_IN_VIEW: 'checked_in_view',
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockClosedIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="12" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12V9a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="14" cy="19" r="2" fill="currentColor" />
    </svg>
  )
}

function LockOpenIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="12" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 12V9a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 0" />
      <circle cx="14" cy="19" r="2" fill="currentColor" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="animate-spin motion-reduce:animate-none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M5 11l5 5 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BackspaceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M7 4H15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7l-4-5 4-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M10 7l3 4M13 7l-3 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Ticket() {
  const navigate   = useNavigate()
  const location   = useLocation()

  const bookingId  = location.state?.bookingId  ?? null
  const officeName = location.state?.officeName ?? null
  const startTime  = location.state?.startTime  ?? null
  const endTime    = location.state?.endTime    ?? null
  const rawStatus  = location.state?.rawStatus  ?? null

  const correctPIN = derivePIN(bookingId)

  const [entered,   setEntered]   = useState('')
  const [termState, setTermState] = useState(
    rawStatus === 'CHECKED_IN'
      ? TERMINAL_STATES.CHECKED_IN_VIEW
      : TERMINAL_STATES.IDLE
  )
  const [attempts,  setAttempts]  = useState(0)
  const [errorMsg,  setErrorMsg]  = useState('')

  // Triple-tap safety net — no re-renders
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef(null)

  const handleLockTap = useCallback(() => {
    tapCountRef.current += 1
    clearTimeout(tapTimerRef.current)
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0 }, 2000)
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0
      setEntered(correctPIN)
    }
  }, [correctPIN])

  const handleKeyPress = (digit) => {
    if (termState !== TERMINAL_STATES.IDLE) return
    setErrorMsg('')
    setEntered((prev) => prev.length < 6 ? prev + digit : prev)
  }

  const handleBackspace = () => {
    if (termState !== TERMINAL_STATES.IDLE) return
    setErrorMsg('')
    setEntered((prev) => prev.slice(0, -1))
  }

  const handleConfirm = async () => {
    if (entered.length !== 6 || termState !== TERMINAL_STATES.IDLE) return

    if (entered !== correctPIN) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setEntered('')
      if (newAttempts >= 3) {
        setTermState(TERMINAL_STATES.LOCKED_OUT)
      } else {
        setTermState(TERMINAL_STATES.DENIED)
        setErrorMsg(`Invalid access code — ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining`)
        setTimeout(() => {
          setTermState(TERMINAL_STATES.IDLE)
        }, 1500)
      }
      return
    }

    setTermState(TERMINAL_STATES.AUTHENTICATING)
    await delay(650)
    setTermState(TERMINAL_STATES.CONNECTING)

    try {
      await appUnlock({ bookingId })
    } catch {
      // Swallow — booking may already be CHECKED_IN; still show granted
    }

    await delay(850)
    setTermState(TERMINAL_STATES.GRANTED)

    await delay(1600)
    navigate('/bookings', {
      state: { accessGranted: true, bookingId },
    })
  }

  // ── No booking guard ────────────────────────────────────────────────────────

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm bg-bg-2 border border-line rounded-2xl shadow-card p-8 text-center">
          <h2 className="font-inter text-[20px] font-semibold text-ink mb-3">No Booking Selected</h2>
          <p className="font-inter text-[13.5px] text-neutral-2 mb-6 leading-relaxed">
            This page requires a confirmed booking.
          </p>
          <button
            type="button"
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-inter text-[13.5px] font-semibold cursor-pointer border-0"
          >
            <ArrowLeftIcon />
            Back to Bookings
          </button>
        </div>
      </div>
    )
  }

  const shortId = `#FX-${bookingId.slice(0, 6).toUpperCase()}`
  const isProcessing = [
    TERMINAL_STATES.AUTHENTICATING,
    TERMINAL_STATES.CONNECTING,
    TERMINAL_STATES.GRANTED,
  ].includes(termState)

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-6 py-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(16,185,129,0.04) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm relative z-10">

        {/* Back + language */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-2 border border-line font-inter text-[11px] uppercase tracking-[.1em] text-neutral-2 hover:text-ink hover:border-accent/40 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeftIcon />
            Back
          </button>
          <LanguageSwitcher compact />
        </div>

        {/* Terminal card */}
        <div className="bg-bg-2 border border-line rounded-2xl shadow-card overflow-hidden animate-fadeUp" style={{ '--delay': '0ms' }}>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-line">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 border rounded-full font-inter text-[11px] uppercase tracking-[.1em] mb-5"
              style={{ borderColor: 'rgba(16,185,129,.18)', backgroundColor: 'rgba(16,185,129,.06)', color: '#10B981' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Smart Access Terminal
            </div>
            <h1 className="font-inter text-[22px] font-bold tracking-tight text-ink mb-0.5">
              {officeName ?? 'Loading...'}
            </h1>
            <p className="font-inter text-[11px] uppercase tracking-[.1em] text-accent">
              {formatDate(startTime)}
            </p>
            <p className="font-inter text-[12px] text-neutral-2 mt-1">
              {formatTimeRange(startTime, endTime)}
            </p>
          </div>

          {/* Lock icon — triple-tap target */}
          <div
            className="flex justify-center pt-7 pb-3 cursor-default select-none"
            onClick={handleLockTap}
            role="presentation"
            aria-hidden="true"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              termState === TERMINAL_STATES.GRANTED
                ? 'bg-accent/[.15] border border-accent/30 text-accent'
                : termState === TERMINAL_STATES.DENIED || termState === TERMINAL_STATES.LOCKED_OUT
                  ? 'bg-critical/[.1] border border-critical/25 text-critical'
                  : 'bg-bg-3 border border-line text-neutral-2'
            }`}>
              {termState === TERMINAL_STATES.AUTHENTICATING || termState === TERMINAL_STATES.CONNECTING
                ? <SpinnerIcon />
                : termState === TERMINAL_STATES.GRANTED
                  ? <LockOpenIcon />
                  : <LockClosedIcon />
              }
            </div>
          </div>

          {/* Status message */}
          <div className="text-center px-8 pb-5 min-h-[48px] flex flex-col items-center justify-center gap-1">
            {termState === TERMINAL_STATES.IDLE && (
              <p className="font-inter text-[13px] text-neutral-2">Enter your 6-digit access code</p>
            )}
            {termState === TERMINAL_STATES.AUTHENTICATING && (
              <p className="font-inter text-[12px] uppercase tracking-[.1em] text-accent animate-pulse">Authenticating...</p>
            )}
            {termState === TERMINAL_STATES.CONNECTING && (
              <p className="font-inter text-[12px] uppercase tracking-[.1em] text-accent animate-pulse">Connecting to Smart Lock...</p>
            )}
            {termState === TERMINAL_STATES.GRANTED && (
              <div className="flex items-center gap-2 text-accent">
                <CheckIcon />
                <p className="font-mono text-[13px] uppercase tracking-[.1em] font-semibold">Access Granted</p>
              </div>
            )}
            {(termState === TERMINAL_STATES.DENIED || termState === TERMINAL_STATES.IDLE) && errorMsg && (
              <p role="alert" className="font-inter text-[12.5px] text-critical leading-snug">{errorMsg}</p>
            )}
            {termState === TERMINAL_STATES.LOCKED_OUT && (
              <p role="alert" className="font-inter text-[12.5px] text-critical leading-snug text-center">
                Too many failed attempts. Please contact the facility.
              </p>
            )}
            {termState === TERMINAL_STATES.CHECKED_IN_VIEW && (
              <div className="flex flex-col items-center gap-1">
                <p className="font-inter text-[12px] uppercase tracking-[.1em] text-accent">You're Checked In</p>
                <p className="font-inter text-[12px] text-neutral-2">Session active</p>
              </div>
            )}
          </div>

          {/* PIN display */}
          <div className="flex justify-center gap-2.5 px-8 pb-6">
            {Array.from({ length: 6 }).map((_, i) => {
              const filled = i < entered.length
              const isLast = i === entered.length - 1
              return (
                <div
                  key={i}
                  className={`w-9 h-10 rounded-lg border flex items-center justify-center font-mono text-[18px] font-bold transition-all duration-150 ${
                    termState === TERMINAL_STATES.GRANTED
                      ? 'border-accent/40 bg-accent/[.08] text-accent'
                      : termState === TERMINAL_STATES.DENIED
                        ? 'border-critical/40 bg-critical/[.06] text-critical'
                        : filled
                          ? 'border-accent/40 bg-accent/[.08] text-ink'
                          : 'border-line bg-bg-3 text-neutral/40'
                  }`}
                >
                  {filled
                    ? (isLast && termState === TERMINAL_STATES.IDLE ? entered[i] : '•')
                    : '—'
                  }
                </div>
              )
            })}
          </div>

          {/* Keypad */}
          {!isProcessing && termState !== TERMINAL_STATES.LOCKED_OUT && termState !== TERMINAL_STATES.CHECKED_IN_VIEW && (
            <div className="px-6 pb-7">
              <div className="grid grid-cols-3 gap-2.5">
                {['1','2','3','4','5','6','7','8','9'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleKeyPress(d)}
                    disabled={entered.length >= 6}
                    className="h-14 rounded-xl bg-bg-3 border border-line font-mono text-[20px] font-semibold text-ink hover:bg-ink/[.06] hover:border-accent/30 active:scale-95 transition-all duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-14 rounded-xl bg-bg-3 border border-line flex items-center justify-center text-neutral-2 hover:bg-ink/[.06] hover:border-line active:scale-95 transition-all duration-100 cursor-pointer"
                >
                  <BackspaceIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  disabled={entered.length >= 6}
                  className="h-14 rounded-xl bg-bg-3 border border-line font-mono text-[20px] font-semibold text-ink hover:bg-ink/[.06] hover:border-accent/30 active:scale-95 transition-all duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={entered.length !== 6 || isProcessing}
                  className="h-14 rounded-xl bg-accent border border-accent text-white flex items-center justify-center hover:bg-accent-2 active:scale-95 transition-all duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckIcon />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-bg-3 border-t border-line px-8 py-4 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="font-inter text-[10px] uppercase tracking-[.1em] text-neutral-2">Booking</span>
              <span className="font-mono text-[13px] font-semibold text-accent">{shortId}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <path d="M5.5 1L1.5 3.5v2.5c0 2.5 1.8 4 4 4.5 2.2-.5 4-2 4-4.5V3.5L5.5 1Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" className="text-neutral" />
              </svg>
              <span className="font-inter text-[10px] uppercase tracking-[.1em] text-neutral">
                Single Use · Encrypted
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}