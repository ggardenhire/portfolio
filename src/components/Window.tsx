import type { ReactNode } from 'react'

interface WindowProps {
  title: string
  /** Optional text shown in the window's status bar footer. */
  status?: string
  children: ReactNode
  className?: string
}

/**
 * A classic 90s desktop window: raised chrome, a title bar with the
 * minimize/maximize/close buttons, and an optional sunken status bar.
 * Purely decorative controls — this is a single-page site.
 */
export function Window({ title, status, children, className }: WindowProps) {
  return (
    <section className={`window ${className ?? ''}`}>
      <div className="window__titlebar">
        <span className="window__title">{title}</span>
        <div className="window__controls" aria-hidden="true">
          <button className="window__btn" tabIndex={-1}>
            _
          </button>
          <button className="window__btn" tabIndex={-1}>
            □
          </button>
          <button className="window__btn window__btn--close" tabIndex={-1}>
            ✕
          </button>
        </div>
      </div>
      <div className="window__body">{children}</div>
      {status && <div className="window__status">{status}</div>}
    </section>
  )
}
