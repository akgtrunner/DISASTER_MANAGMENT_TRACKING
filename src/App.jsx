import { useState, useCallback } from 'react'
import Topbar from './components/Topbar'
import LeftPanel from './components/LeftPanel'
import MapView from './components/MapView'
import RightPanel from './components/RightPanel'
import AddCityModal from './components/AddCityModal'
import Toast from './components/Toast'
import { DEFAULT_CITIES, DEFAULT_EDGES, RESOURCE_POOL } from './data/indiaData'
import { buildGraph, dijkstra, reconstructPath, haversine } from './utils/dijkstra'
import { MaxHeap } from './utils/maxHeap'

export default function App() {
  // ── Core state ─────────────────────────────────────────────
  const [cities, setCities] = useState(DEFAULT_CITIES)
  const [edges, setEdges] = useState(DEFAULT_EDGES)
  const [zones, setZones] = useState({})           // { cityId: severity (1-5) }
  const [deployed, setDeployed] = useState(false)
  const [status, setStatus] = useState('standby')  // 'standby' | 'running' | 'done'

  // ── Result state ────────────────────────────────────────────
  const [allocations, setAllocations] = useState([])
  const [heapSnapshot, setHeapSnapshot] = useState([])
  const [extractedIds, setExtractedIds] = useState([])
  const [routeLines, setRouteLines] = useState([])  // array of { path, sev }
  const [dsaActive, setDsaActive] = useState(null)  // which DSA card is highlighted

  // ── UI state ────────────────────────────────────────────────
  const [selectedCity, setSelectedCity] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState(null)          // { title, msg }
  const [activeTab, setActiveTab] = useState('alloc')
  const [progress, setProgress] = useState(0)

  // ── Toast helper ─────────────────────────────────────────────
  const showToast = useCallback((title, msg) => {
    setToast({ title, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Mark / clear a disaster zone ────────────────────────────
  const setSeverity = useCallback((cityId, severity) => {
    setZones(prev => {
      const next = { ...prev }
      if (severity === 0) delete next[cityId]
      else next[cityId] = severity
      return next
    })
    setSelectedCity(null)
  }, [])

  // ── Add custom city to graph ─────────────────────────────────
  const addCustomCity = useCallback((name, lat, lng) => {
    const id = name.toLowerCase().replace(/\s+/g, '_')
    if (cities.find(c => c.id === id)) {
      showToast('⚠️ Error', 'City already exists.')
      return
    }

    // Auto-connect to 2 nearest cities
    const nearest = [...cities]
      .map(c => ({ ...c, dist: haversine(lat, lng, c.lat, c.lng) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 2)

    const newCity = { id, name, lat, lng, hq: false }
    setCities(prev => [...prev, newCity])
    setEdges(prev => [
      ...prev,
      ...nearest.map(n => ({
        f: id,
        t: n.id,
        w: Math.max(1, Math.round(n.dist / 80)),
      })),
    ])
    showToast(`✅ ${name} Added`, `Connected to ${nearest.map(c => c.name).join(' & ')}`)
  }, [cities, showToast])

  // ── Main allocator engine ────────────────────────────────────
  const runAllocator = useCallback(() => {
    if (Object.keys(zones).length === 0) return

    setDeployed(true)
    setStatus('running')
    setAllocations([])
    setRouteLines([])
    setExtractedIds([])
    setProgress(0)
    setActiveTab('alloc')

    // Step 1: Build graph
    const graph = buildGraph(edges)
    setDsaActive('graph')

    // Step 2: Dijkstra from Delhi HQ
    const allIds = cities.map(c => c.id)
    const { dist, prev } = dijkstra(graph, 'delhi', allIds)
    setDsaActive('dijkstra')

    // Step 3: Build Max Heap with priority scores
    const heap = new MaxHeap()
    Object.entries(zones).forEach(([id, sev]) => {
      heap.insert({
        id,
        sev,
        dist: dist[id],
        score: sev * 10 - dist[id],
      })
    })
    const snap = heap.snapshot()
    setHeapSnapshot(snap)
    setDsaActive('heap')

    // Step 4: Extract in priority order
    const order = []
    while (!heap.isEmpty()) order.push(heap.pop())

    // Step 5: Greedy resource allocation
    const totalSev = order.reduce((sum, x) => sum + x.sev, 0)
    const alloc = {}
    order.forEach(({ id, sev }) => {
      const share = Math.max(2, Math.round((sev / totalSev) * RESOURCE_POOL))
      alloc[id] = {
        food:   Math.ceil(share * 0.4),
        med:    Math.ceil(share * 0.3),
        rescue: Math.ceil(share * 0.2),
        water:  Math.ceil(share * 0.1),
        total:  share,
      }
    })
    setDsaActive('greedy')

    // Step 6: Animate deployment one by one
    let step = 0
    const newExtracted = []

    function animateStep() {
      if (step >= order.length) {
        setStatus('done')
        setProgress(100)
        showToast('✅ Mission Complete', `${order.length} zones served`)
        return
      }

      const { id, sev, score } = order[step]
      const city = cities.find(c => c.id === id)
      const path = reconstructPath(prev, id)
      const a = alloc[id]

      // Update extracted list for heap visualizer
      newExtracted.push(id)
      setExtractedIds([...newExtracted])

      // Add route line
      setRouteLines(prev => [...prev, { path, sev }])

      // Add allocation card
      setAllocations(prev => [
        ...prev,
        {
          rank: step + 1,
          city: city.name,
          cityId: id,
          sev,
          score,
          dist: dist[id],
          resources: a,
          pathNames: path.map(x => cities.find(c => c.id === x)?.name || x),
        },
      ])

      setProgress(Math.round(((step + 1) / order.length) * 100))
      step++
      setTimeout(animateStep, 1100)
    }

    setTimeout(animateStep, 600)
  }, [zones, cities, edges, showToast])

  // ── Reset everything ─────────────────────────────────────────
  const resetAll = useCallback(() => {
    setZones({})
    setDeployed(false)
    setStatus('standby')
    setAllocations([])
    setHeapSnapshot([])
    setExtractedIds([])
    setRouteLines([])
    setDsaActive(null)
    setProgress(0)
    setSelectedCity(null)
  }, [])

  // ── Export text report ───────────────────────────────────────
  const exportReport = useCallback(() => {
    if (!allocations.length) {
      showToast('⚠️ No Data', 'Deploy resources first!')
      return
    }
    const lines = [
      '====================================================',
      '   DISASTER RELIEF COMMAND CENTER — MISSION REPORT',
      `   Generated: ${new Date().toLocaleString()}`,
      '====================================================',
      `Zones Served: ${allocations.length}  |  Pool: ${RESOURCE_POOL} units`,
      `Graph: ${cities.length} nodes / ${edges.length} edges`,
      '',
      '─── ALLOCATIONS ────────────────────────────────────',
    ]
    allocations.forEach(a => {
      lines.push('')
      lines.push(`  RANK #${a.rank} — ${a.city}`)
      lines.push(`  Score: ${a.score}  Dist: ${a.dist}h  Severity: ${a.sev}/5`)
      lines.push(`  Food:${a.resources.food}u  Med:${a.resources.med}k  Rescue:${a.resources.rescue}  Water:${a.resources.water}t`)
      lines.push(`  Route: ${a.pathNames.join(' → ')}`)
    })
    lines.push('')
    lines.push('  DSA: Graph + Dijkstra + Max Heap + Greedy Algorithm')
    lines.push('====================================================')

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'relief-report.txt'
    a.click()
    URL.revokeObjectURL(url)
    showToast('📄 Exported', 'Saved as relief-report.txt')
  }, [allocations, cities, edges, showToast])

  return (
    <div className="app-root">
      <Topbar
        status={status}
        progress={progress}
        canDeploy={Object.keys(zones).length > 0 && !deployed}
        deployed={deployed}
        onDeploy={runAllocator}
        onReset={resetAll}
        onExport={exportReport}
      />

      <div className="app-body">
        <LeftPanel
          zones={zones}
          cities={cities}
          dsaActive={dsaActive}
          deployed={deployed}
          onCityClick={id => !deployed && setSelectedCity(id)}
          onAddCity={() => setShowAddModal(true)}
        />

        <MapView
          cities={cities}
          edges={edges}
          zones={zones}
          routeLines={routeLines}
          selectedCity={selectedCity}
          deployed={deployed}
          onCityClick={id => !deployed && setSelectedCity(id)}
          onMapClick={() => setSelectedCity(null)}
          onSetSeverity={setSeverity}
          onClosePopup={() => setSelectedCity(null)}
        />

        <RightPanel
          activeTab={activeTab}
          onTabChange={setActiveTab}
          allocations={allocations}
          heapSnapshot={heapSnapshot}
          extractedIds={extractedIds}
          cities={cities}
          edges={edges}
          zones={zones}
        />
      </div>

      {showAddModal && (
        <AddCityModal
          onAdd={(name, lat, lng) => {
            addCustomCity(name, lat, lng)
            setShowAddModal(false)
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {toast && <Toast title={toast.title} msg={toast.msg} />}
    </div>
  )
}
