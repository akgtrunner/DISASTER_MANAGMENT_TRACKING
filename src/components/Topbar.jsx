export default function Topbar({ status, progress, canDeploy, deployed, onDeploy, onReset, onExport }) {
  const statusLabel =
    status === 'running' ? 'DEPLOYING...' :
    status === 'done'    ? 'DEPLOYED' :
                           'STANDBY'

  return (
    <header className="topbar">
      {/* Logo */}
      <div className="topbar-logo">
        <div className="logo-icon">🚨</div>
        <div>
          <div className="logo-title">DISASTER RELIEF CMD</div>
          <div className="logo-sub">Resource Allocator · India Grid · v2</div>
        </div>
      </div>

      {/* DSA Pills */}
      <div className="topbar-pills">
        <span className="dsa-pill"><span className="pip pip-blue" />Graph</span>
        <span className="dsa-pill"><span className="pip pip-green" />Dijkstra</span>
        <span className="dsa-pill"><span className="pip pip-red" />Max Heap</span>
        <span className="dsa-pill"><span className="pip pip-amber" />Greedy</span>
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        <div className="status-badge">
          <span className={`status-dot dot-${status}`} />
          <span className="status-text">{statusLabel}</span>
        </div>

        {deployed && (
          <button className="btn btn-export" onClick={onExport}>
            ⬇ Export
          </button>
        )}

        {canDeploy && (
          <button className="btn btn-deploy" onClick={onDeploy}>
            🚁 Deploy Resources
          </button>
        )}

        {deployed && (
          <button className="btn btn-reset" onClick={onReset}>
            ↺ Reset
          </button>
        )}
      </div>

      {/* Progress bar */}
      {status === 'running' && (
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      )}
      {status === 'done' && (
        <div className="progress-bar progress-done" style={{ width: '100%' }} />
      )}
    </header>
  )
}
