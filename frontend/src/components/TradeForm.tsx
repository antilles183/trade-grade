import { useMemo, useState } from 'react'
import type { Player, TradeRequest } from '../api/client'
import { PlayerList } from './PlayerList'
import { PlayerSearch } from './PlayerSearch'

type Section = 'giving' | 'receiving' | 'my_roster' | 'their_roster'

const SECTIONS: { key: Section; title: string; optional: boolean }[] = [
  { key: 'giving', title: 'I give', optional: false },
  { key: 'receiving', title: 'I receive', optional: false },
  { key: 'my_roster', title: 'My roster', optional: true },
  { key: 'their_roster', title: "Their roster", optional: true },
]

interface Props {
  players: Player[]
  pending: boolean
  onSubmit: (req: TradeRequest) => void
}

export function TradeForm({ players, pending, onSubmit }: Props) {
  const [selected, setSelected] = useState<Record<Section, Player[]>>({
    giving: [],
    receiving: [],
    my_roster: [],
    their_roster: [],
  })
  const [leagueFormat, setLeagueFormat] = useState('')

  // A player can't be on both sides of the trade, nor twice on the same roster.
  const tradeIds = useMemo(
    () => new Set([...selected.giving, ...selected.receiving].map((p) => p.id)),
    [selected.giving, selected.receiving],
  )

  const excludedFor = (key: Section) => {
    if (key === 'giving' || key === 'receiving') return tradeIds
    return new Set(selected[key].map((p) => p.id))
  }

  const add = (key: Section, p: Player) => setSelected((s) => ({ ...s, [key]: [...s[key], p] }))
  const remove = (key: Section, id: number) =>
    setSelected((s) => ({ ...s, [key]: s[key].filter((p) => p.id !== id) }))

  const canSubmit = selected.giving.length > 0 && selected.receiving.length > 0 && !pending

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const ids = (key: Section) => selected[key].map((p) => p.id)
    onSubmit({
      giving: ids('giving'),
      receiving: ids('receiving'),
      my_roster: ids('my_roster'),
      their_roster: ids('their_roster'),
      league_format: leagueFormat.trim() || null,
    })
  }

  return (
    <form onSubmit={submit}>
      <div className="grid">
        {SECTIONS.map(({ key, title, optional }) => (
          <fieldset key={key}>
            <legend>
              {title} {optional && <span className="meta">(optional)</span>}
            </legend>
            <PlayerSearch
              label={`Search ${title}`}
              players={players}
              excludedIds={excludedFor(key)}
              onSelect={(p) => add(key, p)}
            />
            <PlayerList players={selected[key]} onRemove={(id) => remove(key, id)} />
          </fieldset>
        ))}
      </div>
      <label className="format">
        League format <span className="meta">(optional, e.g. "Superflex, TE premium")</span>
        <input
          type="text"
          maxLength={200}
          value={leagueFormat}
          onChange={(e) => setLeagueFormat(e.target.value)}
        />
      </label>
      <button type="submit" className="primary" disabled={!canSubmit}>
        {pending ? 'Analyzing…' : 'Grade this trade'}
      </button>
    </form>
  )
}
