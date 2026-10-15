import { useCallback, useMemo, useState } from 'react'

type Suit = '♠' | '♥' | '♦' | '♣'
const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RED: Suit[] = ['♥', '♦']

interface Card {
  id: string
  suit: Suit
  /** 1 = Ace … 11 = J, 12 = Q, 13 = K. */
  rank: number
  faceUp: boolean
}

interface GameState {
  stock: Card[]
  waste: Card[]
  foundations: Card[][] // 4 piles, one per suit as it fills
  tableau: Card[][] // 7 columns
}

/** Where a drag started, enough to recover the exact cards being moved. */
type Source =
  | { pile: 'waste' }
  | { pile: 'foundation'; index: number }
  | { pile: 'tableau'; col: number; row: number }

const RANK_LABELS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function isRed(suit: Suit) {
  return RED.includes(suit)
}

function freshDeal(): GameState {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `${suit}${rank}`, suit, rank, faceUp: false })
    }
  }
  // Fisher–Yates shuffle.
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  const tableau: Card[][] = Array.from({ length: 7 }, () => [])
  let d = 0
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[d++]
      card.faceUp = row === col // only the last card in each column starts face up
      tableau[col].push(card)
    }
  }

  return {
    stock: deck.slice(d),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  }
}

/** Deep-ish clone so we never mutate state in place. */
function cloneState(s: GameState): GameState {
  return {
    stock: s.stock.map((c) => ({ ...c })),
    waste: s.waste.map((c) => ({ ...c })),
    foundations: s.foundations.map((p) => p.map((c) => ({ ...c }))),
    tableau: s.tableau.map((p) => p.map((c) => ({ ...c }))),
  }
}

function movingCards(s: GameState, src: Source): Card[] {
  if (src.pile === 'waste') return s.waste.slice(-1)
  if (src.pile === 'foundation') return s.foundations[src.index].slice(-1)
  return s.tableau[src.col].slice(src.row)
}

function canStackOnTableau(moving: Card[], col: Card[]): boolean {
  const head = moving[0]
  if (col.length === 0) return head.rank === 13 // empty column: Kings only
  const top = col[col.length - 1]
  return top.faceUp && isRed(top.suit) !== isRed(head.suit) && top.rank === head.rank + 1
}

function canStackOnFoundation(moving: Card[], pile: Card[]): boolean {
  if (moving.length !== 1) return false
  const card = moving[0]
  if (pile.length === 0) return card.rank === 1 // Aces start a foundation
  const top = pile[pile.length - 1]
  return top.suit === card.suit && card.rank === top.rank + 1
}

/** Remove the moving cards from their source pile, flipping a newly exposed tableau card. */
function removeFromSource(s: GameState, src: Source) {
  if (src.pile === 'waste') {
    s.waste.pop()
  } else if (src.pile === 'foundation') {
    s.foundations[src.index].pop()
  } else {
    s.tableau[src.col] = s.tableau[src.col].slice(0, src.row)
    const col = s.tableau[src.col]
    if (col.length && !col[col.length - 1].faceUp) col[col.length - 1].faceUp = true
  }
}

export function Solitaire() {
  const [state, setState] = useState<GameState>(freshDeal)
  const [drag, setDrag] = useState<Source | null>(null)
  const [drawCount, setDrawCount] = useState<1 | 3>(1)

  const won = useMemo(() => state.foundations.every((p) => p.length === 13), [state])

  const deal = useCallback(() => {
    setState(freshDeal())
    setDrag(null)
  }, [])

  function drawFromStock() {
    setState((prev) => {
      const next = cloneState(prev)
      if (next.stock.length === 0) {
        // Recycle the waste back into the stock, face down, order reset.
        next.stock = next.waste.reverse().map((c) => ({ ...c, faceUp: false }))
        next.waste = []
      } else {
        // Flip up to `drawCount` cards; only the last lands playable on top.
        for (let i = 0; i < drawCount && next.stock.length; i++) {
          const card = next.stock.pop()!
          card.faceUp = true
          next.waste.push(card)
        }
      }
      return next
    })
  }

  /** Apply a move if legal, returning whether it succeeded. */
  function tryMove(src: Source, dest: { pile: 'tableau' | 'foundation'; index: number }): boolean {
    let moved = false
    setState((prev) => {
      const moving = movingCards(prev, src)
      if (moving.length === 0) return prev
      const ok =
        dest.pile === 'tableau'
          ? canStackOnTableau(moving, prev.tableau[dest.index])
          : canStackOnFoundation(moving, prev.foundations[dest.index])
      if (!ok) return prev

      const next = cloneState(prev)
      removeFromSource(next, src)
      const cards = moving.map((c) => ({ ...c, faceUp: true }))
      if (dest.pile === 'tableau') next.tableau[dest.index].push(...cards)
      else next.foundations[dest.index].push(...cards)
      moved = true
      return next
    })
    return moved
  }

  /** Double-click shortcut: send a single card to any accepting foundation. */
  function autoToFoundation(src: Source) {
    const moving = movingCards(state, src)
    if (moving.length !== 1) return
    for (let i = 0; i < state.foundations.length; i++) {
      if (canStackOnFoundation(moving, state.foundations[i])) {
        tryMove(src, { pile: 'foundation', index: i })
        return
      }
    }
  }

  function onDrop(dest: { pile: 'tableau' | 'foundation'; index: number }) {
    if (drag) tryMove(drag, dest)
    setDrag(null)
  }

  const allowDrop = (e: React.DragEvent) => e.preventDefault()

  return (
    <div className="sol">
      <div className="sol__toolbar">
        <button className="sol__btn" onClick={deal}>
          New deal
        </button>
        <div className="sol__seg" role="group" aria-label="Cards per draw">
          <button
            className={`sol__btn ${drawCount === 1 ? 'is-active' : ''}`}
            onClick={() => setDrawCount(1)}
          >
            Draw 1
          </button>
          <button
            className={`sol__btn ${drawCount === 3 ? 'is-active' : ''}`}
            onClick={() => setDrawCount(3)}
          >
            Draw 3
          </button>
        </div>
        <span className="sol__status">{won ? 'You win! 🎉' : ''}</span>
      </div>

      <div className="sol__top">
        {/* Stock + waste */}
        <div className="sol__piles">
          <button
            className={`sol-slot ${state.stock.length ? 'sol-slot--stock' : ''}`}
            onClick={drawFromStock}
            title={state.stock.length ? 'Draw' : 'Recycle'}
            aria-label="Stock"
          >
            {state.stock.length ? '🂠' : '↺'}
          </button>
          <div className="sol-slot sol-slot--waste" aria-label="Waste">
            {(() => {
              // Fan the most recent few cards; only the top one is interactive.
              const fan = state.waste.slice(-(drawCount === 3 ? 3 : 1))
              return fan.map((card, i) => {
                const isTop = i === fan.length - 1
                return (
                  <div key={card.id} className="sol-waste__card" style={{ left: i * 18 }}>
                    <CardFace
                      card={card}
                      draggable={isTop}
                      onDragStart={() => isTop && setDrag({ pile: 'waste' })}
                      onDoubleClick={() => isTop && autoToFoundation({ pile: 'waste' })}
                    />
                  </div>
                )
              })
            })()}
          </div>
        </div>

        {/* Foundations */}
        <div className="sol__piles">
          {state.foundations.map((pile, i) => (
            <div
              key={i}
              className="sol-slot sol-slot--foundation"
              onDragOver={allowDrop}
              onDrop={() => onDrop({ pile: 'foundation', index: i })}
              aria-label={`Foundation ${i + 1}`}
            >
              {pile.length > 0 ? (
                <CardFace
                  card={pile[pile.length - 1]}
                  draggable
                  onDragStart={() => setDrag({ pile: 'foundation', index: i })}
                />
              ) : (
                <span className="sol-slot__ghost">A</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="sol__tableau">
        {state.tableau.map((col, c) => (
          <div
            key={c}
            className="sol-col"
            onDragOver={allowDrop}
            onDrop={() => onDrop({ pile: 'tableau', index: c })}
            style={{ minHeight: 84 + Math.max(0, col.length - 1) * 22 }}
          >
            {col.length === 0 && <div className="sol-col__empty" />}
            {col.map((card, row) => (
              <div key={card.id} className="sol-col__card" style={{ top: row * 22 }}>
                <CardFace
                  card={card}
                  draggable={card.faceUp}
                  onDragStart={() => card.faceUp && setDrag({ pile: 'tableau', col: c, row })}
                  onDoubleClick={() =>
                    card.faceUp &&
                    row === col.length - 1 &&
                    autoToFoundation({ pile: 'tableau', col: c, row })
                  }
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface CardFaceProps {
  card: Card
  draggable?: boolean
  onDragStart?: () => void
  onDoubleClick?: () => void
}

function CardFace({ card, draggable, onDragStart, onDoubleClick }: CardFaceProps) {
  if (!card.faceUp) {
    return <div className="sol-card sol-card--back" aria-label="Face-down card" />
  }
  return (
    <div
      className={`sol-card ${isRed(card.suit) ? 'sol-card--red' : 'sol-card--black'}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDoubleClick={onDoubleClick}
      aria-label={`${RANK_LABELS[card.rank]} ${card.suit}`}
    >
      <span className="sol-card__corner">
        {RANK_LABELS[card.rank]}
        {card.suit}
      </span>
      <span className="sol-card__pip">{card.suit}</span>
    </div>
  )
}
