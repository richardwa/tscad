

type Segment = {
  normal: Vec2,
  node: Vec2,
  next: Vec2
}

const keyFn = (v: Vec2) => v.join();
export class LineSimplify {
  segments: Map<string, Segment> = new Map();

  addSegment(node: Vec2, next: Vec2, normal: Vec2) {
    this.segments.set(keyFn(node), { node, normal, next });
  }

  /**
   * organize segments into ordered lists representing a closed loop
   */
  getCycles() {
    const cycles: Segment[][] = [];
    const visited: Set<string> = new Set();
    for (let key in this.segments) {
      if (visited.has(key)) {
        continue;
      }
      let head = this.segments.get(key);
      const cycle: Segment[] = [];
      while (!visited.has(key)) {
        visited.add(key);
        cycle.push(head);
        key = keyFn(head.next);
        head = this.segments.get(key);
      }
      cycles.push(cycle);
    }
    return cycles;
  }

  similar(s1: Segment, s2: Segment) {
    return true;
  }

  reduce(threshold: number): Segment[] {
    return this.getCycles().flatMap(cycle => {
      const reduced: Segment[] = [];
      let prev;
      for (const segment of cycle) {
        if (!prev) {
          prev = segment;
        } else if (this.similar(segment, prev)) {
          // combine


        } else {
          // next
          reduced.push(prev);
          prev = segment;
        }
      }
      return reduced
    });
  }




}