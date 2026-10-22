"use client"

type AuthShellHeaderMobileMenuProps = {
  mobileOpen: boolean
  onToggle: () => void
}

export function AuthShellHeaderMobileMenu({ mobileOpen, onToggle }: AuthShellHeaderMobileMenuProps) {
  return (
    <button
      type="button"
      className="f-button naked medium mobile-menu-btn"
      aria-label="Menu"
      aria-expanded={mobileOpen}
      onClick={onToggle}
    >
      <span className="f-icon left icon-only" aria-hidden="true">
        <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" role="presentation">
          <path d="M0 80c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 96C7.2 96 0 88.8 0 80zM0 240c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 256c-8.8 0-16-7.2-16-16zM448 400c0 8.8-7.2 16-16 16L16 416c-8.8 0-16-7.2-16-16s7.2-16 16-16l416 0c8.8 0 16 7.2 16 16z" />
        </svg>
      </span>
      <span className="button-text screen-reader-text">Menu</span>
    </button>
  )
}
