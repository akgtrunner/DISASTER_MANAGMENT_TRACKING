import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { SEV_COLORS, SEV_LABELS } from '../data/indiaData'
import CityPopup from './CityPopup'

// Fix Leaflet default icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function makeIcon(city, zones) {
  const sev = zones[city.id]
  const color = city.hq ? '#3d8fff' : sev ? SEV_COLORS[sev] : '#3d4260'
  const r = city.hq ? 12 : sev ? 10 : 7
  const ring = sev
    ? `<circle cx="16" cy="16" r="15" fill="${color}" opacity=".12"/>`
    : city.hq
    ? `<circle cx="16" cy="16" r="19" fill="#3d8fff" opacity=".08"/>`
    : ''
  const label = sev
    ? `<text x="16" y="20" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Space Mono,monospace">${sev}</text>`
    : city.hq
    ? `<text x="16" y="20" text-anchor="middle" font-size="8" fill="#fff" font-family="Space Mono,monospace">HQ</text>`
    : ''
  return L.divIcon({
    className: '',
    html: `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      ${ring}
      <circle cx="16" cy="16" r="${r}" fill="${color}" stroke="#060810" stroke-width="2.5"/>
      ${label}
    </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

export default function MapView({
  cities, edges, zones, routeLines,
  selectedCity, deployed,
  onCityClick, onMapClick, onSetSeverity, onClosePopup,
}) {
  const mapRef      = useRef(null)
  const mapObj      = useRef(null)
  const markersRef  = useRef({})
  const baseEdges   = useRef([])
  const routeRefs   = useRef([])

  // ── Init map once ─────────────────────────────────────────
  useEffect(() => {
    if (mapObj.current) return
    const m = L.map(mapRef.current, { zoomControl: true }).setView([22, 80], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(m)
    m.on('click', onMapClick)
    mapObj.current = m
  }, [])

  // ── Draw base edges when edges change ─────────────────────
  useEffect(() => {
    if (!mapObj.current) return
    baseEdges.current.forEach(l => mapObj.current.removeLayer(l))
    baseEdges.current = []

    edges.forEach(({ f, t, w }) => {
      const a = cities.find(x => x.id === f)
      const b = cities.find(x => x.id === t)
      if (!a || !b) return

      const mid = [(a.lat + b.lat) / 2, (a.lng + b.lng) / 2]
      const line = L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
        color: '#ffffff14', weight: 1.5, dashArray: '5 4',
      }).addTo(mapObj.current)

      const lbl = L.marker(mid, {
        icon: L.divIcon({
          className: '',
          html: `<div style="font-size:8px;font-family:Space Mono,monospace;color:#ffffff30;background:#060810cc;padding:1px 4px;border-radius:3px;">${w}h</div>`,
          iconAnchor: [12, 8],
        }),
      }).addTo(mapObj.current)

      baseEdges.current.push(line, lbl)
    })
  }, [edges, cities])

  // ── Sync markers when cities or zones change ───────────────
  useEffect(() => {
    if (!mapObj.current) return

    cities.forEach(city => {
      const existing = markersRef.current[city.id]
      const icon = makeIcon(city, zones)

      if (existing) {
        existing.setIcon(icon)
      } else {
        const m = L.marker([city.lat, city.lng], {
          icon,
          zIndexOffset: city.hq ? 1000 : 0,
        }).addTo(mapObj.current)
        m.bindTooltip(`<b>${city.name}</b>${city.hq ? ' · Relief HQ' : ''}`, { direction: 'top' })
        if (!city.hq) {
          m.on('click', () => onCityClick(city.id))
        }
        markersRef.current[city.id] = m
      }
    })
  }, [cities, zones])

  // ── Draw route lines when allocations animate in ──────────
  useEffect(() => {
    if (!mapObj.current) return
    // Remove old routes
    routeRefs.current.forEach(l => mapObj.current.removeLayer(l))
    routeRefs.current = []

    routeLines.forEach(({ path, sev }) => {
      for (let i = 0; i < path.length - 1; i++) {
        const a = cities.find(x => x.id === path[i])
        const b = cities.find(x => x.id === path[i + 1])
        if (!a || !b) continue
        const line = L.polyline([[a.lat, a.lng], [b.lat, b.lng]], {
          color: SEV_COLORS[sev],
          weight: 3,
          opacity: 0.95,
          dashArray: '8 4',
        }).addTo(mapObj.current)
        routeRefs.current.push(line)
      }
    })
  }, [routeLines, cities])

  const selectedCityData = cities.find(c => c.id === selectedCity)

  return (
    <div className="map-wrap">
      <div ref={mapRef} className="map-container" />

      {/* Hint when no zones marked */}
      {Object.keys(zones).length === 0 && !deployed && (
        <div className="map-watermark">
          <div className="wm-icon">🗺️</div>
          <div className="wm-text">Click Cities to Mark Zones</div>
        </div>
      )}

      {/* City popup */}
      {selectedCity && selectedCityData && (
        <CityPopup
          city={selectedCityData}
          currentSev={zones[selectedCity]}
          onSetSeverity={sev => onSetSeverity(selectedCity, sev)}
          onClose={onClosePopup}
        />
      )}
    </div>
  )
}
