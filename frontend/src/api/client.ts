export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST'

export interface Player {
  id: number
  name: string
  position: Position
  pro_team: string
  percent_owned: number
}

export interface TradeRequest {
  giving: number[]
  receiving: number[]
  my_roster: number[]
  their_roster: number[]
  league_format?: string | null
}

export interface TradeAnalysis {
  grade: string
  verdict: 'accept' | 'reject' | 'counter'
  summary: string
  giving_analysis: string
  receiving_analysis: string
  roster_impact: string | null
  suggested_counter: string | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') detail = body.detail
      else if (Array.isArray(body.detail)) detail = body.detail.map((d: { msg: string }) => d.msg).join('; ')
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new ApiError(detail, res.status)
  }
  return res.json()
}

export const fetchPlayers = () => request<Player[]>('/api/players')

export const analyzeTrade = (body: TradeRequest) =>
  request<TradeAnalysis>('/api/trades/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
