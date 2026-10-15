import { useRef, useState, type ReactNode } from 'react'

interface GameWindowProps {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * A floating variant of {@link Window}: same raised chrome, but the title bar
 * is a drag handle and the close button actually closes. Positioned with
 * `transform` so dragging never triggers layout.
 */
export function GameWindow({ title, onClose, children }: GameWindowProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null)

  function onPointerDown(e: React.PointerEvent) {
    // Ignore drags that start on the control buttons.
    if ((e.target as HTMLElement).closest('.window__btn')) return
    drag.current = { startX: e.clientX, startY: e.clientY, originX: pos.x, originY: pos.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return
    setPos({
      x: drag.current.originX + (e.clientX - drag.current.startX),
      y: drag.current.originY + (e.clientY - drag.current.startY),
    })
  }

  function onPointerUp(e: React.PointerEvent) {
    drag.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }

  return (
    <section
      className="window window--floating"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      role="dialog"
      aria-label={title}
    >
      <div
        className="window__titlebar window__titlebar--drag"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <span className="window__title">{title}</span>
        <div className="window__controls">
          <button className="window__btn window__btn--close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
      <div className="window__body">{children}</div>
    </section>
  )
}
