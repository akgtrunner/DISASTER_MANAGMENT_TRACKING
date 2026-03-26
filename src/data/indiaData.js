// ── Severity config ──────────────────────────────────────────
export const SEV_COLORS = ['', '#ffb020', '#ff7730', '#ff3b3b', '#cc1111', '#880000']
export const SEV_BG     = ['', '#ffb02012', '#ff773012', '#ff3b3b12', '#cc111112', '#88000012']
export const SEV_LABELS = ['', 'Low', 'Moderate', 'High', 'Critical', 'Extreme']
export const RESOURCE_POOL = 24

// ── City nodes ───────────────────────────────────────────────
export const DEFAULT_CITIES = [
  { id: 'delhi',      name: 'Delhi',      lat: 28.61, lng: 77.21, hq: true  },
  { id: 'chandigarh', name: 'Chandigarh', lat: 30.73, lng: 76.78, hq: false },
  { id: 'jaipur',     name: 'Jaipur',     lat: 26.91, lng: 75.79, hq: false },
  { id: 'agra',       name: 'Agra',       lat: 27.18, lng: 78.01, hq: false },
  { id: 'lucknow',    name: 'Lucknow',    lat: 26.85, lng: 80.95, hq: false },
  { id: 'bhopal',     name: 'Bhopal',     lat: 23.26, lng: 77.41, hq: false },
  { id: 'mumbai',     name: 'Mumbai',     lat: 19.08, lng: 72.88, hq: false },
  { id: 'nagpur',     name: 'Nagpur',     lat: 21.15, lng: 79.09, hq: false },
  { id: 'hyderabad',  name: 'Hyderabad',  lat: 17.39, lng: 78.49, hq: false },
  { id: 'chennai',    name: 'Chennai',    lat: 13.08, lng: 80.27, hq: false },
]

// ── Graph edges (weighted by travel hours) ───────────────────
export const DEFAULT_EDGES = [
  { f: 'delhi',     t: 'chandigarh', w: 3 },
  { f: 'delhi',     t: 'jaipur',     w: 4 },
  { f: 'delhi',     t: 'agra',       w: 2 },
  { f: 'delhi',     t: 'lucknow',    w: 6 },
  { f: 'agra',      t: 'lucknow',    w: 4 },
  { f: 'agra',      t: 'bhopal',     w: 5 },
  { f: 'jaipur',    t: 'bhopal',     w: 5 },
  { f: 'jaipur',    t: 'mumbai',     w: 8 },
  { f: 'bhopal',    t: 'mumbai',     w: 6 },
  { f: 'bhopal',    t: 'nagpur',     w: 4 },
  { f: 'nagpur',    t: 'hyderabad',  w: 5 },
  { f: 'nagpur',    t: 'lucknow',    w: 7 },
  { f: 'hyderabad', t: 'chennai',    w: 6 },
  { f: 'mumbai',    t: 'hyderabad',  w: 7 },
]
