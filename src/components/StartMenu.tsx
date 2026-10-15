import { useEffect, useRef, useState } from 'react'

export type GameId = 'minesweeper' | 'solitaire'

interface StartMenuProps {
  onLaunchGame: (game: GameId) => void
  onClose: () => void
}

const GAMES: { id: GameId; label: string }[] = [
  { id: 'minesweeper', label: 'Minesweeper' },
  { id: 'solitaire', label: 'Solitaire' },
]

/**
 * The Start popup. Opens above the taskbar button, closes on outside-click or
 * Escape. The "Games" row expands to reveal the game list.
 */
export function StartMenu({ onLaunchGame, onClose }: StartMenuProps) {
  const [gamesOpen, setGamesOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      // Keep clicks on the Start button itself from closing-then-reopening.
      const target = e.target as HTMLElement
      if (ref.current?.contains(target) || target.closest('.taskbar__start')) return
      onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDocDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="startmenu" ref={ref} role="menu">
      <div className="startmenu__rail" aria-hidden="true">
        <span className="startmenu__brand">portfolio</span>
      </div>
      <ul className="startmenu__list">
        <li>
          <button
            className="startmenu__item"
            aria-haspopup="true"
            aria-expanded={gamesOpen}
            onClick={() => setGamesOpen((v) => !v)}
          >
            <span>🎮 Games</span>
            <span className="startmenu__chevron">▸</span>
          </button>
          {gamesOpen && (
            <ul className="startmenu__submenu">
              {GAMES.map((game) => (
                <li key={game.id}>
                  <button
                    className="startmenu__item"
                    role="menuitem"
                    onClick={() => {
                      onLaunchGame(game.id)
                      onClose()
                    }}
                  >
                    {game.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </div>
  )
}
