import { SEV_COLORS, SEV_LABELS } from '../data/indiaData'

export default function CityPopup({ city, currentSev, onSetSeverity, onClose }) {
  return (
    <div className="city-popup">
      <div className="popup-name">{city.name}</div>
      <div className="popup-hint">Select severity · 1 = Low · 5 = Extreme</div>

      <div className="popup-sevs">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            className={`sev-btn ${currentSev === s ? 'sev-btn-active' : ''}`}
            style={{
              background: currentSev === s ? SEV_COLORS[s] : `${SEV_COLORS[s]}28`,
              borderColor: SEV_COLORS[s],
              color: currentSev === s ? '#fff' : SEV_COLORS[s],
            }}
            onClick={() => onSetSeverity(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="popup-actions">
        <button className="popup-btn popup-btn-clear" onClick={() => onSetSeverity(0)}>
          ✕ Clear
        </button>
        <button className="popup-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  )
}
