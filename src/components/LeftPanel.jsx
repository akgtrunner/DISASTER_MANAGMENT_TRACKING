import { SEV_COLORS, SEV_BG, SEV_LABELS } from '../data/indiaData'

const DSA_CARDS = [
  {
    id: 'graph',
    icon: '🕸️',
    name: 'Graph (Adjacency List)',
    desc: 'Cities = nodes, roads = weighted edges.',
    litDesc: (c, e) => `${c} nodes, ${e} edges. Graph built!`,
  },
  {
    id: 'dijkstra',
    icon: '📍',
    name: "Dijkstra's Algorithm",
    desc: 'Shortest path from Delhi HQ. O((V+E) log V).',
    litDesc: () => 'All shortest paths from HQ computed!',
  },
  {
    id: 'heap',
    icon: '📊',
    name: 'Max Heap Priority Queue',
    desc: 'Priority = Sev×10 − Dist. Highest zone first.',
    litDesc: n => `${n} zones queued by priority score.`,
  },
  {
    id: 'greedy',
    icon: '💡',
    name: 'Greedy Distribution',
    desc: '24 resource units split by severity ratio.',
    litDesc: n => `24 units distributed across ${n} zones.`,
  },
]

export default function LeftPanel({ zones, cities, dsaActive, deployed, onCityClick, onAddCity }) {
  const zoneKeys = Object.keys(zones)

  return (
    <aside className="left-panel">
      <div className="left-scroll">

        {/* Severity Scale */}
        <section className="panel-section">
          <div className="section-label">Severity Scale</div>
          {[1, 2, 3, 4, 5].map(s => (
            <div className="sev-row" key={s}>
              <div className="sev-bar" style={{ background: SEV_COLORS[s] }} />
              <span className="sev-name">{SEV_LABELS[s]}</span>
              <span className="sev-num">{s}</span>
            </div>
          ))}
          <div className="hq-row">
            <span className="hq-icon">🏛</span>
            <span className="hq-name">Delhi</span>
            <span className="hq-tag">HQ BASE</span>
          </div>
        </section>

        {/* DSA Engine */}
        <section className="panel-section">
          <div className="section-label">DSA Engine</div>
          {DSA_CARDS.map(card => (
            <div
              key={card.id}
              className={`dsa-card ${dsaActive === card.id ? 'dsa-card-lit' : ''}`}
            >
              <div className="dsa-card-head">
                <span className="dsa-icon">{card.icon}</span>
                <span className="dsa-card-name">{card.name}</span>
              </div>
              <div className="dsa-card-desc">{card.desc}</div>
            </div>
          ))}
        </section>

        {/* Add City Button */}
        <section className="panel-section">
          <button className="add-city-btn" onClick={onAddCity}>
            ＋ Add Custom City
          </button>
        </section>

        {/* Marked Zones */}
        <section className="panel-section">
          <div className="section-label">Marked Zones</div>
          {zoneKeys.length === 0 ? (
            <p className="empty-hint">No zones marked yet.</p>
          ) : (
            zoneKeys.map(id => {
              const sev = zones[id]
              const city = cities.find(c => c.id === id)
              return (
                <div
                  key={id}
                  className="zone-entry"
                  style={{
                    borderColor: SEV_COLORS[sev] + '30',
                    background: SEV_BG[sev],
                  }}
                  onClick={() => !deployed && onCityClick(id)}
                >
                  <div>
                    <div className="zone-name" style={{ color: SEV_COLORS[sev] }}>
                      {city?.name}
                    </div>
                    <div className="zone-sub">{SEV_LABELS[sev]} Severity</div>
                  </div>
                  <div
                    className="zone-badge"
                    style={{ background: SEV_COLORS[sev] }}
                  >
                    {sev}
                  </div>
                </div>
              )
            })
          )}
        </section>

      </div>
    </aside>
  )
}
