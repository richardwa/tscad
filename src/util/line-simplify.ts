import { V2, V3 } from './math'

export type Segment<N> = {
  normal: Vec2
  node: N
  next: N
  length: number
  [x: string]: any
}

export class LineSimplify<N, K> {
  segments: Map<K, Segment<N>> = new Map()
  threshold: number
  keyFn: (v: N) => K
  constructor(keyFn: (v: N) => K) {
    this.keyFn = keyFn
    this.threshold = 0.8
  }

  clear() {
    this.segments.clear()
  }

  addSegment(s: Segment<N>) {
    this.segments.set(this.keyFn(s.node), s)
  }

  log(s: Segment<N>) {
    console.log(
      JSON.stringify({
        node: this.keyFn(s.node),
        next: this.keyFn(s.next),
        n: s.normal.map((o) => (Math.abs(o) < 0.05 ? 0 : Math.sign(o))).join(),
        hash: s.hash
      })
    )
  }

  /**
   * organize segments into ordered lists representing a closed loop
   */
  getCycles() {
    const cycles: Segment<N>[][] = []
    const visited: Set<K> = new Set()
    for (let [key] of this.segments) {
      if (visited.has(key)) {
        continue
      }
      let head = this.segments.get(key)
      const cycle: Segment<N>[] = []
      while (!visited.has(key)) {
        visited.add(key)
        cycle.push(head)
        //this.log(head);
        key = this.keyFn(head.next)
        head = this.segments.get(key)
      }
      cycles.push(cycle)
    }
    return cycles
  }

  similar(s1: Segment<N>, s2: Segment<N>) {
    return V2.dot(s1.normal, s2.normal) > this.threshold
  }
  combine(s1: Segment<N>, s2: Segment<N>): Segment<N> {
    return {
      length: s1.length + s2.length,
      node: s1.node,
      next: s2.next,
      normal: V2.normalize(V2.add(V2.scale(s1.length, s1.normal), V2.scale(s2.length, s2.normal)))
    }
  }

  getReducedSegments(): Segment<N>[] {
    const cycles = this.getCycles()
    return cycles.flatMap((cycle) => {
      const reduced: Segment<N>[] = []
      let prev
      for (const segment of cycle) {
        if (!prev) {
          prev = segment
        } else if (this.similar(prev, segment)) {
          prev = this.combine(prev, segment)
        } else {
          reduced.push(prev)
          prev = segment
        }
      }
      // last one
      if (this.similar(prev, cycle[0])) {
        cycle[0] = this.combine(prev, cycle[0])
      } else {
        reduced.push(prev)
      }
      return reduced
    })
  }
}
