import { useId, useMemo, useState } from 'react'
import type { Player } from '../api/client'

interface Props {
  label: string
  players: Player[]
  excludedIds: Set<number>
  onSelect: (player: Player) => void
}

const MAX_RESULTS = 10

export function PlayerSearch({ label, players, excludedIds, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const listId = useId()

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    // `players` arrives sorted by ownership, so the best-known players rank first.
    return players
      .filter(
        (p) =>
          !excludedIds.has(p.id) &&
          `${p.name} ${p.pro_team} ${p.position}`.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS)
  }, [query, players, excludedIds])

  const choose = (player: Player) => {
    onSelect(player)
    setQuery('')
    setActive(0)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && matches[active]) {
      e.preventDefault()
      choose(matches[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && matches.length > 0

  return (
    <div className="search">
      <input
        type="text"
        role="combobox"
        aria-label={label}
        aria-expanded={showList}
        aria-controls={listId}
        placeholder="Search players…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul id={listId} role="listbox" className="results">
          {matches.map((p, i) => (
            <li
              key={p.id}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(p)
              }}
            >
              <span>{p.name}</span>
              <span className="meta">
                {p.position} · {p.pro_team}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
