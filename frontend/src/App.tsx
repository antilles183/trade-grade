import { AnalysisResult } from './components/AnalysisResult'
import { TradeForm } from './components/TradeForm'
import { useAnalyzeTrade } from './hooks/useAnalyzeTrade'
import { usePlayers } from './hooks/usePlayers'

export default function App() {
  const players = usePlayers()
  const analyze = useAnalyzeTrade()

  return (
    <main>
      <h1>Trade Grade</h1>
      <p className="meta">Build a trade offer and get an AI-graded verdict.</p>

      {players.isPending && <p>Loading players…</p>}
      {players.isError && (
        <p role="alert" className="error">
          Couldn't load players: {players.error.message}
        </p>
      )}
      {players.data && (
        <TradeForm players={players.data} pending={analyze.isPending} onSubmit={analyze.mutate} />
      )}

      {analyze.isError && (
        <p role="alert" className="error">
          {analyze.error.message}
        </p>
      )}
      {analyze.data && <AnalysisResult analysis={analyze.data} />}
    </main>
  )
}
