/**
 * Dijkstra's Shortest Path Algorithm
 * Finds shortest path from Delhi HQ to every disaster zone.
 * Time Complexity: O((V + E) log V)
 */

// Build adjacency list from edges array
export function buildGraph(edges) {
  const graph = {}
  edges.forEach(({ f, t, w }) => {
    if (!graph[f]) graph[f] = []
    if (!graph[t]) graph[t] = []
    graph[f].push({ to: t, weight: w })
    graph[t].push({ to: f, weight: w })
  })
  return graph
}

// Run Dijkstra from source node
export function dijkstra(graph, source, allIds) {
  const dist = {}
  const prev = {}

  // Initialize all distances as Infinity
  allIds.forEach(id => {
    dist[id] = Infinity
    prev[id] = null
  })

  dist[source] = 0
  const queue = [{ id: source, d: 0 }]
  const visited = new Set()

  while (queue.length) {
    // Always process the node with smallest distance (simple sort-based PQ)
    queue.sort((a, b) => a.d - b.d)
    const { id: current } = queue.shift()

    if (visited.has(current)) continue
    visited.add(current)

    const neighbors = graph[current] || []
    neighbors.forEach(({ to, weight }) => {
      const newDist = dist[current] + weight
      if (newDist < dist[to]) {
        dist[to] = newDist
        prev[to] = current
        queue.push({ id: to, d: newDist })
      }
    })
  }

  return { dist, prev }
}

// Reconstruct path from source to target
export function reconstructPath(prev, target) {
  const path = []
  let current = target
  while (current) {
    path.unshift(current)
    current = prev[current]
  }
  return path
}

// Haversine formula — calculates distance (km) between two lat/lng points
export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
