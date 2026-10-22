"use client"

/**
 * The John Deere "Virtual Assistant" control.
 *
 * It exists in TWO places on the live tenant, and the placement is
 * breakpoint-dependent (measured against the target):
 *
 *   < 1024px  →  a full-bleed orange pill in its own row under the header
 *                (`.virtual-assistant-row`, button spans the row)
 *   ≥ 1024px  →  a content-sized 178x40 orange pill inside the header's
 *                right-hand cluster, next to the language selector
 *
 * One component, two mount points, identical markup and styling.
 *
 * Target geometry: button 178x40, 20px radius, brand-coloured 2px border,
 * brand-coloured 8px glow, 24x24 chat-bubble glyph, Bold 14px black label.
 */
export function VirtualAssistantButton({
  className = "",
}: {
  className?: string
}) {
  return (
    <button
      type="button"
      className={`f-button progressive medium virtual-assistant-btn ${className}`.trim()}
    >
      <span className="f-icon left icon-only" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
          focusable="false"
        >
          <path
            d="M20.5 11.4a7.9 7.9 0 0 1-.85 3.59 8 8 0 0 1-7.16 4.42 7.9 7.9 0 0 1-3.59-.85L4 19.5l1.94-4.9a7.9 7.9 0 0 1-.85-3.59 8 8 0 0 1 4.42-7.16 7.9 7.9 0 0 1 3.59-.85h.5a8 8 0 0 1 8 8v.4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.6" cy="11.7" r="1.15" fill="currentColor" />
          <circle cx="12.1" cy="11.7" r="1.15" fill="currentColor" />
          <circle cx="15.6" cy="11.7" r="1.15" fill="currentColor" />
        </svg>
      </span>
      <span className="button-text">Virtual Assistant</span>
    </button>
  )
}
