import { useState } from 'react'
import type { Player, TradeRequest } from '../api/client'
import { PlayerList } from './PlayerList'
import { PlayerSearch } from './PlayerSearch'

type Section = 'giving' | 'receiving' | 'my_roster' | 'their_roster'

const TITLES: Record<Section, string> = {
  giving: 'I give',
  receiving: 'I receive',
  my_roster: 'My roster',
  their_roster: 'Their roster',
}

const GROUPS: { title: string; keys: Section[]; note?: string }[] = [
  { title: 'Trade Offer', keys: ['giving', 'receiving'] },
  {
    title: 'Team Rosters (optional)',
    keys: ['my_roster', 'their_roster'],
    note: 'Optionally fill out the team rosters and league format for even better analysis.',
  },
]

// Players in the trade offer belong to a roster: what I give is on mine, what I receive is on theirs.
const ROSTER_FOR: Partial<Record<Section, Section>> = {
  giving: 'my_roster',
  receiving: 'their_roster',
}

const SIDE: Record<'mine' | 'theirs', Section[]> = {
  mine: ['giving', 'my_roster'],
  theirs: ['receiving', 'their_roster'],
}

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

  // A player belongs to one team: mine (I give + my roster) or theirs (I receive + their roster).
  // Anyone on one team is unavailable to the other, and can't be added twice to the same list.
  const idsOf = (keys: Section[]) => new Set(keys.flatMap((k) => selected[k].map((p) => p.id)))
  const mine = idsOf(SIDE.mine)
  const theirs = idsOf(SIDE.theirs)

  const excludedFor = (key: Section) => {
    const other = SIDE.mine.includes(key) ? theirs : mine
    return new Set([...other, ...selected[key].map((p) => p.id)])
  }

  const add = (key: Section, p: Player) =>
    setSelected((s) => {
      const side = SIDE.mine.includes(key) ? SIDE.theirs : SIDE.mine
      if (side.some((k) => s[k].some((x) => x.id === p.id))) return s
      if (s[key].some((x) => x.id === p.id)) return s
      const next = { ...s, [key]: [...s[key], p] }
      const roster = ROSTER_FOR[key]
      if (roster && !s[roster].some((r) => r.id === p.id)) next[roster] = [...s[roster], p]
      return next
    })

  const remove = (key: Section, id: number) =>
    setSelected((s) => {
      const next = { ...s, [key]: s[key].filter((p) => p.id !== id) }
      const roster = ROSTER_FOR[key]
      if (roster) next[roster] = s[roster].filter((p) => p.id !== id)
      return next
    })

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
      {GROUPS.map(({ title, keys, note }) => (
        <section key={title}>
          <h2 className="group-title">{title}</h2>
          {note && <p className="group-note">{note}</p>}
          <div className="grid">
            {keys.map((key) => (
              <fieldset key={key}>
                <legend>{TITLES[key]}</legend>
                <PlayerSearch
                  label={`Search ${TITLES[key]}`}
                  players={players}
                  excludedIds={excludedFor(key)}
                  onSelect={(p) => add(key, p)}
                />
                <PlayerList players={selected[key]} onRemove={(id) => remove(key, id)} />
              </fieldset>
            ))}
          </div>
        </section>
      ))}
      <label className="format">
        League format <span className="meta">(optional, e.g. "Superflex, TE premium")</span>
        <input
          type="text"
          maxLength={200}
          placeholder="Standard 10-team PPR redraft"
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
