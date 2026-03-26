import { SEV_COLORS, SEV_BG, SEV_LABELS } from '../data/indiaData'

const TABS = [
  { id: 'alloc', label: 'Allocations' },
  { id: 'heap',  label: 'Heap View'   },
  { id: 'graph', label: 'Graph Info'  },
]

export default function RightPanel({
  activeTab, onTabChange,
  allocations, heapSnapshot, extractedIds,
  cities, edges, zones,
}) {
  return (
    <aside className="right-panel">
      {/* Tabs */}
      <div className="right-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`rtab ${activeTab === tab.id ? 'rtab-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="right-content">
        {activeTab === 'alloc' && <AllocTab allocations={allocations} />}
        {activeTab === 'heap'  && <HeapTab snapshot={heapSnapshot} extracted={extractedIds} cities={cities} />}
        {activeTab === 'graph' && <GraphTab cities={cities} edges={edges} zones={zones} allocations={allocations} />}
      </div>

      {/* Summary bar */}
      {allocations.length > 0 && (
        <div className="summary-bar">
          <div className="sum-row">
            <div className="sum-chip">
              <div className="sum-num">{allocations.length}</div>
              <div className="sum-label">Zones</div>
            </div>
            <div className="sum-chip">
              <div className="sum-num">{allocations.reduce((s, a) => s + a.resources.total, 0)}</div>
              <div className="sum-label">Resources</div>
            </div>
            <div className="sum-chip">
              <div className="sum-num">{Math.round(allocations.reduce((s, a) => s + a.resources.total, 0) * 420)}</div>
              <div className="sum-label">Est. Lives</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

// ── Allocations tab ─────────────────────────────────────────
function AllocTab({ allocations }) {
  if (!allocations.length) {
    return <p className="empty-hint">Deploy resources to see allocations.</p>
  }
  return (
    <>
      {allocations.map(a => (
        <div
          key={a.rank}
          className="alloc-card"
          style={{ borderColor: SEV_COLORS[a.sev] + '44', background: SEV_BG[a.sev] }}
        >
          <div className="alloc-rank">
            RANK #{a.rank} · SCORE: {a.score} · DIST: {a.dist}h
          </div>
          <div className="alloc-city" style={{ color: SEV_COLORS[a.sev] }}>
            {a.city}
            <span className="alloc-risk">{SEV_LABELS[a.sev]} Risk</span>
          </div>
          <div className="res-grid">
            <div className="res-chip">🍱 Food: {a.resources.food}u</div>
            <div className="res-chip">💊 Med: {a.resources.med}k</div>
            <div className="res-chip">🚒 Rescue: {a.resources.rescue}</div>
            <div className="res-chip">🚰 Water: {a.resources.water}t</div>
          </div>
          <div className="alloc-path">
            Route: {a.pathNames.join(' → ')}
          </div>
        </div>
      ))}
    </>
  )
}

// ── Heap visualizer tab ─────────────────────────────────────
function HeapTab({ snapshot, extracted, cities }) {
  if (!snapshot.length) {
    return <p className="empty-hint">Mark zones first — heap builds after deployment.</p>
  }

  // Build levels for tree display
  const levels = []
  let i = 0, size = 1
  while (i < snapshot.length) {
    levels.push(snapshot.slice(i, i + size))
    i += size
    size *= 2
  }

  return (
    <div className="heap-view">
      <div className="heap-info">MAX HEAP — Score = Sev × 10 − Dist</div>
      {levels.map((level, li) => (
        <div key={li}>
          <div className="heap-level">
            {level.map(node => {
              const city = cities.find(c => c.id === node.id)
              const isDone = extracted.includes(node.id)
              return (
                <div
                  key={node.id}
                  className={`heap-node ${isDone ? 'heap-node-done' : ''}`}
                  style={{ borderColor: SEV_COLORS[node.sev] + (isDone ? '88' : '30') }}
                  title={`${city?.name} Sev:${node.sev} Dist:${node.dist}h Score:${node.score}`}
                >
                  <div className="heap-val" style={{ color: SEV_COLORS[node.sev] }}>
                    {node.score}
                  </div>
                  <div className="heap-tag">
                    {(city?.name || node.id).slice(0, 3).toUpperCase()}
                  </div>
                </div>
              )
            })}
          </div>
          {li < levels.length - 1 && <div className="heap-arrow">↓</div>}
        </div>
      ))}
    </div>
  )
}

// ── Graph info tab ──────────────────────────────────────────
function GraphTab({ cities, edges, zones, allocations }) {
  return (
    <div className="graph-tab">
      <div className="section-label" style={{ marginBottom: 10 }}>Graph Statistics</div>

      {[
        ['Total Nodes',    cities.length],
        ['Total Edges',    edges.length],
        ['Source Node',    'Delhi HQ'],
        ['Algorithm',      'Dijkstra O(E log V)'],
        ['Weight Unit',    'Hours'],
        ['Zones Marked',   Object.keys(zones).length],
        ['Routes Active',  allocations.length],
        ['Resource Pool',  '24 units'],
      ].map(([k, v]) => (
        <div key={k} className="stat-row">
          <span className="stat-key">{k}</span>
          <span className="stat-val">{v}</span>
        </div>
      ))}

      <div className="section-label" style={{ margin: '14px 0 8px' }}>Edge List</div>
      {edges.map(({ f, t, w }) => {
        const a = cities.find(x => x.id === f)
        const b = cities.find(x => x.id === t)
        if (!a || !b) return null
        return (
          <div key={`${f}-${t}`} className="edge-item">
            {a.name} ↔ {b.name}{' '}
            <span style={{ color: '#ffffff20' }}>[{w}h]</span>
          </div>
        )
      })}
    </div>
  )
}
