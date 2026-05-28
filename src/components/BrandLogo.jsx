import { useId } from 'react'

function FlexiIcon({ width = 28, height = 28 }) {
  const uid = useId()
  const gid = `fsg${uid.replace(/:/g, '')}`

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="55%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Vertical stem of F */}
      <rect x="3" y="3" width="8" height="26" rx="1.5" fill={`url(#${gid})`} />
      {/* Top horizontal bar — skewed right edge for angular premium feel */}
      <polygon points="10,3 29,3 27,11 10,11" fill={`url(#${gid})`} />
      {/* Middle horizontal bar — shorter, same angular skew */}
      <polygon points="10,17 22,17 20,24 10,24" fill={`url(#${gid})`} />
    </svg>
  )
}

/**
 * BrandLogo — reusable FlexiSpace logo component.
 *
 * variant="colored"  → "Flexi" in near-white, "Space" in emerald (home/marketing)
 * variant="mono"     → "FlexiSpace" all-emerald, uppercase, tracking-widest (dashboard headers)
 *
 * iconOnly=true      → renders the geometric F icon without the wordmark
 */
export default function BrandLogo({
  variant = 'colored',
  iconSize = 24,
  iconOnly = false,
  className = '',
}) {
  return (
    <span
      dir="ltr"
      className={`inline-flex flex-row items-center gap-2.5 ${className}`}
      {...(iconOnly ? { role: 'img', 'aria-label': 'FlexiSpace' } : {})}
    >
      <FlexiIcon width={iconSize} height={iconSize} />
      {!iconOnly && (
        variant === 'colored' ? (
          <span className="font-fraunces font-medium text-xl tracking-tight leading-none">
            <span className="text-ink">Flexi</span>
            <span className="text-accent">Space</span>
          </span>
        ) : (
          <span className="font-fraunces font-extrabold text-[15px] tracking-widest text-accent uppercase leading-none">
            FlexiSpace
          </span>
        )
      )}
    </span>
  )
}