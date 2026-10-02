import type { Player } from '../api/client'

interface Props {
  players: Player[]
  onRemove: (id: number) => void
}

export function PlayerList({ players, onRemove }: Props) {
  if (players.length === 0) return null
  return (
    <ul className="chips">
      {players.map((p) => (
        <li key={p.id} className="chip">
          <span>
            {p.name} <span className="meta">{p.position} · {p.pro_team}</span>
          </span>
          <button type="button" aria-label={`Remove ${p.name}`} onClick={() => onRemove(p.id)}>
            ×
          </button>
        </li>
      ))}
    </ul>
  )
}
