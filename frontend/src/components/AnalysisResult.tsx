import type { TradeAnalysis } from '../api/client'

export function AnalysisResult({ analysis }: { analysis: TradeAnalysis }) {
  const sections: [string, string | null][] = [
    ['What I give', analysis.giving_analysis],
    ['What I receive', analysis.receiving_analysis],
    ['Roster impact', analysis.roster_impact],
    ['Suggested counter', analysis.suggested_counter],
  ]
  return (
    <section className="result" aria-live="polite">
      <div className="headline">
        <div className={`grade grade-${analysis.grade[0]}`}>{analysis.grade}</div>
        <div>
          <div className={`verdict verdict-${analysis.verdict}`}>{analysis.verdict}</div>
          <p>{analysis.summary}</p>
        </div>
      </div>
      {sections.map(
        ([title, body]) =>
          body && (
            <details key={title} open>
              <summary>{title}</summary>
              <p>{body}</p>
            </details>
          ),
      )}
    </section>
  )
}
