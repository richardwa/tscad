import { V2, V3 } from "./math";

type Segment<N> = {
  normal: Vec2,
  node: N,
  next: N,
  length: number;
  [x: string]: any;
}

export class LineSimplify<N, K> {
  segments: Map<K, Segment<N>> = new Map();
  threshold: number;
  keyFn: (v: N) => K;
  constructor(keyFn: (v: N) => K) {
    this.keyFn = keyFn;
    this.threshold = 0.5;
  }

  clear() {
    this.segments.clear();
  }

  addSegment(s: Segment<N>) {
    this.segments.set(this.keyFn(s.node), s);
  }

  /**
   * organize segments into ordered lists representing a closed loop
   */
  getCycles() {
    const cycles: Segment<N>[][] = [];
    const visited: Set<K> = new Set();
    for (let [key] of this.segments) {
      if (visited.has(key)) {
        continue;
      }
      let head = this.segments.get(key);
      const cycle: Segment<N>[] = [];
      while (!visited.has(key)) {
        visited.add(key);
        cycle.push(head);

        console.log(JSON.stringify({
          node: this.keyFn(head.node),
          next: this.keyFn(head.next),
          hash: head.hash,
          n: head.normal.map(o => Math.abs(o) < .02 ? 0 : Math.sign(o)).join()
        }));

        key = this.keyFn(head.next);
        head = this.segments.get(key);
      }
      cycles.push(cycle);
    }
    return cycles;
  }

  similar(s1: Segment<N>, s2: Segment<N>) {
    return V2.dot(s1.normal, s2.normal) > (1 - this.threshold);
  }
  combine(s1: Segment<N>, s2: Segment<N>): Segment<N> {
    return {
      node: s1.node,
      length: s1.length + s2.length,
      normal: V2.normalize(V2.add(
        V2.scale(s1.length, s1.normal),
        V2.scale(s2.length, s2.normal)
      )),
      next: s2.next
    };
  }

  process(): Segment<N>[] {
    const cycles = this.getCycles();
    console.log('cycles', cycles.length);
    console.log('each cycles', cycles.map(c => c.length));

    return cycles.flatMap(cycle => {
      const reduced: Segment<N>[] = [];
      let prev;
      for (const segment of cycle) {
        if (!prev) {
          prev = segment;
        } else if (this.similar(prev, segment)) {
          prev = this.combine(prev, segment);
        } else {
          reduced.push(prev);
          prev = segment;
        }
      }
      // last one
      if (this.similar(prev, cycle[0])) {
        prev = this.combine(prev, cycle[0]);
      }
      reduced.push(prev);
      return reduced
    });
  }
}

