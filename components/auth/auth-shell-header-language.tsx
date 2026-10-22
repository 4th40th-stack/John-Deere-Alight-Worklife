"use client"

/**
 * Language / overflow-menu control.
 *
 * On the live target this is an `f-overflow-menu` (113x40) showing a globe
 * glyph, the active language code and a chevron. It is part of the header's
 * right-hand cluster, which the target renders only from the `_l` breakpoint
 * (1024px) upward — below that the whole cluster is `_s-display-none`.
 *
 * The visual is supplied by `.header-right`; this component only renders the
 * control itself, so the header owns the layout.
 */
export function AuthShellHeaderLanguage() {
  return (
    <button
      type="button"
      className="f-button action medium header-language-btn"
      aria-haspopup="menu"
      aria-label="EN"
      aria-expanded="false"
    >
      <span className="f-icon left" aria-hidden="true">
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="presentation">
          <path fill="currentColor" d="M256 480c16.7 0 40.4-14.4 61.9-57.3c9.9-19.8 18.2-43.7 24.1-70.7l-172 0c5.9 27 14.2 50.9 24.1 70.7C215.6 465.6 239.3 480 256 480zM164.3 320l183.4 0c2.8-20.2 4.3-41.7 4.3-64s-1.5-43.8-4.3-64l-183.4 0c-2.8 20.2-4.3 41.7-4.3 64s1.5 43.8 4.3 64zM170 160l172 0c-5.9-27-14.2-50.9-24.1-70.7C296.4 46.4 272.7 32 256 32s-40.4 14.4-61.9 57.3C184.2 109.1 175.9 133 170 160zm210 32c2.6 20.5 4 41.9 4 64s-1.4 43.5-4 64l90.8 0c6-20.3 9.3-41.8 9.3-64s-3.2-43.7-9.3-64L380 192zm78.5-32c-25.9-54.5-73.1-96.9-130.9-116.3c21 28.3 37.6 68.8 47.2 116.3zm-321.1 0c9.6-47.6 26.2-88 47.2-116.3C126.7 63.1 79.4 105.5 53.6 160l83.7 0zm-96 32c-6 20.3-9.3 41.8-9.3 64s3.2 43.7 9.3 64l90.8 0c6-20.3 9.3-41.8 9.3-64s-3.2-43.7-9.3-64L32 224zm295 244c57.8-19.5 105-61.8 130.9-116.3l-83.8 0c-9.3 27-14.2 50.9-24.1 70.7C215.6 465.6 239.3 480 256 480zm-143 0c-21-28.3-37.5-68.8-47.2-116.3l83.7 0c9.6 47.6 26.2 88 47.2 116.3zM256 512A256 256 0 1 1 256 0a256 256 0 1 1 0 512z"/>
        </svg>
      </span>
      <span className="button-text">EN</span>
      <span className="f-icon right" aria-hidden="true">
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="presentation">
          <path fill="currentColor" d="M267.3 395.3c-6.2 6.2-16.4 6.2-22.6 0l-192-192c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L256 361.4 436.7 180.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-192 192z"/>
        </svg>
      </span>
    </button>
  )
}
