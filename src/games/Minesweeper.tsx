import { useCallback, useEffect, useMemo, useState } from 'react'

const ROWS = 9
const COLS = 9
const MINES = 10

interface Cell {
  mine: boolean
  revealed: boolean
  flagged: boolean
  /** Number of mines in the eight neighbouring cells. */
  adjacent: number
}

type Status = 'ready' | 'playing' | 'won' | 'lost'

function makeEmptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  )
}

/** Eight-neighbour offsets, reused for mine counting and flood fill. */
const NEIGHBOURS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
] as const

function forEachNeighbour(r: number, c: number, fn: (nr: number, nc: number) => void) {
  for (const [dr, dc] of NEIGHBOURS) {
    const nr = r + dr
    const nc = c + dc
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) fn(nr, nc)
  }
}

/**
 * Plant mines on a fresh board, keeping the first-clicked cell (and its
 * neighbours) clear so the opening move always opens a region — the classic
 * Minesweeper guarantee.
 */
function plantMines(board: Cell[][], safeR: number, safeC: number): Cell[][] {
  const next = board.map((row) => row.map((cell) => ({ ...cell })))
  const forbidden = new Set<string>()
  forbidden.add(`${safeR},${safeC}`)
  forEachNeighbour(safeR, safeC, (nr, nc) => forbidden.add(`${nr},${nc}`))

  let placed = 0
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS)
    const c = Math.floor(Math.random() * COLS)
    if (next[r][c].mine || forbidden.has(`${r},${c}`)) continue
    next[r][c].mine = true
    placed++
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r][c].mine) continue
      let count = 0
      forEachNeighbour(r, c, (nr, nc) => {
        if (next[nr][nc].mine) count++
      })
      next[r][c].adjacent = count
    }
  }
  return next
}

/** Flood-fill reveal: open the cell, and if it has no adjacent mines, recurse. */
function revealFrom(board: Cell[][], r: number, c: number) {
  const cell = board[r][c]
  if (cell.revealed || cell.flagged) return
  cell.revealed = true
  if (cell.adjacent === 0 && !cell.mine) {
    forEachNeighbour(r, c, (nr, nc) => revealFrom(board, nr, nc))
  }
}

const NUMBER_COLORS = ['', '#0a3fa6', '#0a7d4d', '#c40000', '#0a246a', '#7a0000', '#008080', '#000', '#5a5e62']

export function Minesweeper() {
  const [board, setBoard] = useState<Cell[][]>(makeEmptyBoard)
  const [status, setStatus] = useState<Status>('ready')
  const [elapsed, setElapsed] = useState(0)

  const reset = useCallback(() => {
    setBoard(makeEmptyBoard())
    setStatus('ready')
    setElapsed(0)
  }, [])

  // Tick the timer only while actively playing.
  useEffect(() => {
    if (status !== 'playing') return
    const id = window.setInterval(() => setElapsed((e) => Math.min(e + 1, 999)), 1000)
    return () => window.clearInterval(id)
  }, [status])

  const flagsUsed = useMemo(
    () => board.reduce((sum, row) => sum + row.filter((cell) => cell.flagged).length, 0),
    [board],
  )

  function handleReveal(r: number, c: number) {
    if (status === 'won' || status === 'lost') return

    setBoard((prev) => {
      // Plant mines on the first reveal so it is always safe.
      let working = prev
      if (status === 'ready') {
        working = plantMines(prev, r, c)
        setStatus('playing')
      }

      const cell = working[r][c]
      if (cell.revealed || cell.flagged) return working

      const next = working.map((row) => row.map((x) => ({ ...x })))

      if (next[r][c].mine) {
        for (const row of next) for (const x of row) if (x.mine) x.revealed = true
        setStatus('lost')
        return next
      }

      revealFrom(next, r, c)

      const safeRemaining = next
        .flat()
        .some((x) => !x.mine && !x.revealed)
      if (!safeRemaining) {
        for (const row of next) for (const x of row) if (x.mine) x.flagged = true
        setStatus('won')
      }
      return next
    })
  }

  function handleFlag(e: React.MouseEvent, r: number, c: number) {
    e.preventDefault()
    if (status === 'won' || status === 'lost') return
    setBoard((prev) => {
      const cell = prev[r][c]
      if (cell.revealed) return prev
      const next = prev.map((row) => row.map((x) => ({ ...x })))
      next[r][c].flagged = !next[r][c].flagged
      return next
    })
  }

  const face = status === 'lost' ? '✗_✗' : status === 'won' ? '⌐■_■' : ':-)'
  const minesLeft = Math.max(0, MINES - flagsUsed)

  return (
    <div className="mine">
      <div className="mine__hud">
        <span className="mine__counter">{String(minesLeft).padStart(3, '0')}</span>
        <button className="mine__face" onClick={reset} title="New game">
          {face}
        </button>
        <span className="mine__counter">{String(elapsed).padStart(3, '0')}</span>
      </div>

      <div className="mine__grid" role="grid" aria-label="Minesweeper board">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r}-${c}`
            if (!cell.revealed) {
              return (
                <button
                  key={key}
                  className="mine__cell mine__cell--hidden"
                  onClick={() => handleReveal(r, c)}
                  onContextMenu={(e) => handleFlag(e, r, c)}
                  aria-label={cell.flagged ? 'Flagged cell' : 'Hidden cell'}
                >
                  {cell.flagged ? '⚑' : ''}
                </button>
              )
            }
            return (
              <div
                key={key}
                className={`mine__cell mine__cell--open ${cell.mine ? 'mine__cell--bomb' : ''}`}
                style={cell.adjacent ? { color: NUMBER_COLORS[cell.adjacent] } : undefined}
              >
                {cell.mine ? '✸' : cell.adjacent || ''}
              </div>
            )
          }),
        )}
      </div>

      <p className="mine__hint">
        {status === 'won'
          ? 'You cleared the field. ⌐■_■'
          : status === 'lost'
            ? 'Boom. Click the face to retry.'
            : 'Left-click to reveal · right-click to flag'}
      </p>
    </div>
  )
}
