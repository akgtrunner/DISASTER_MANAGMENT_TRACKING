import { useState } from 'react'

export default function AddCityModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [lat, setLat]   = useState('')
  const [lng, setLng]   = useState('')

  function handleSubmit() {
    if (!name.trim()) return alert('City name required.')
    const latN = parseFloat(lat)
    const lngN = parseFloat(lng)
    if (isNaN(latN) || isNaN(lngN)) return alert('Valid lat/lng required.')
    onAdd(name.trim(), latN, lngN)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Add Custom City</div>
        <div className="modal-sub">Auto-connects to nearest 2 cities in the graph.</div>

        <div className="form-field">
          <label className="form-label">CITY NAME</label>
          <input
            className="form-input"
            placeholder="e.g. Pune, Kolkata..."
            maxLength={20}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">LATITUDE</label>
            <input
              className="form-input"
              placeholder="18.52"
              type="number"
              step="0.01"
              value={lat}
              onChange={e => setLat(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">LONGITUDE</label>
            <input
              className="form-input"
              placeholder="73.86"
              type="number"
              step="0.01"
              value={lng}
              onChange={e => setLng(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn-add" onClick={handleSubmit}>＋ Add City</button>
        </div>
      </div>
    </div>
  )
}
