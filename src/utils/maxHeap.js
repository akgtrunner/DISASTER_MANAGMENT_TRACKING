/**
 * Max Heap (Priority Queue)
 * Used to serve the highest-priority disaster zone first.
 * Priority Score = Severity × 10 − Distance
 */
export class MaxHeap {
  constructor() {
    this.h = []
  }

  insert(item) {
    this.h.push(item)
    this._bubbleUp(this.h.length - 1)
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (this.h[parent].score < this.h[i].score) {
        ;[this.h[parent], this.h[i]] = [this.h[i], this.h[parent]]
        i = parent
      } else break
    }
  }

  pop() {
    if (!this.h.length) return null
    const max = this.h[0]
    const last = this.h.pop()
    if (this.h.length) {
      this.h[0] = last
      this._sinkDown(0)
    }
    return max
  }

  _sinkDown(i) {
    const n = this.h.length
    while (true) {
      let best = i
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < n && this.h[left].score > this.h[best].score) best = left
      if (right < n && this.h[right].score > this.h[best].score) best = right
      if (best !== i) {
        ;[this.h[i], this.h[best]] = [this.h[best], this.h[i]]
        i = best
      } else break
    }
  }

  isEmpty() {
    return this.h.length === 0
  }

  // Return a copy so we can render without modifying
  snapshot() {
    return [...this.h]
  }
}
