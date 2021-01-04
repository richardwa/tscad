/// <reference path="../types.d.ts" />

export type Direction = 0 | 1 | 2;

const connectionMatrix = [
  //index, direction, index
  [3, 0, 2], [0, 0, 1], [1, 1, 2], [0, 1, 3],
  [0, 2, 4], [1, 2, 5], [2, 2, 6], [3, 2, 7],
  [4, 1, 7], [4, 0, 5], [5, 1, 6], [7, 0, 6]
];
/**
 * @param n 8 unconnected nodes, function will wire them up correctly
 * 'this' will be the first node
 */
export const connectNodes = <T>(n: Node<T>[]) => {
  const size = Math.pow(2, 8);
  n[0].size = [size, size, size];
  for (let i = 0; i < connectionMatrix.length; i++) {
    const conn = connectionMatrix[i];
    n[conn[0]].next[conn[1]] = { len: size, n: n[conn[2]] };
  }
  return n[0];
}

export class Node<T> {
  data?: T;
  next: TriArray<{ len: number, n: Node<T> }> = [null, null, null];
  size: TriArray<number> = [null, null, null];

  /**
   * Override this function to set custom node data at init time 
   */
  createNode(direction: Direction, to: Node<T>) {
    return new Node<T>();
  }

  getCorners() {
    const corners: OctArray<Node<T>> = [this, null, null, null, null, null, null, null];
    for (let i = 1; i < 8; i++) {
      const conn = connectionMatrix[i];
      const direction = conn[1] as Direction;
      corners[conn[2]] = corners[conn[0]].find(direction, this.size[direction]);
    }
    return corners;
  }

  find(axis: Direction, length: number): Node<T> {
    if (!this.next[axis]) {
      console.warn(`node: ${this}, nothing in ${axis} direction`);
      return;
    }
    let { len, n } = this.next[axis];
    while (len < length) {
      const p = n.next[axis];
      n = p.n;
      len += p.len;
    }
    if (len === length) {
      return n;
    } else {
      console.warn(`not found, axis ${axis}: ${len} != ${length}`, this);
    }
  }

  getNodes(): Set<Node<T>> {
    const nodes = this.next.filter(o => o).flatMap(({ n }) => {
      return Array.from(n.getNodes());
    });
    const set = new Set(nodes);
    set.add(this);
    return set;
  }

  divideEdge(axis: Direction, size: number): Node<T> {
    let { len, n } = this.next[axis];
    if (len === size) {
      return n;
    } else if (len > size) {
      // do the split
      const middle = this.createNode(axis, this.next[axis].n);
      middle.next[axis] = { len: size, n: this.next[axis].n };
      this.next[axis] = { len: size, n: middle }
      return middle;
    } else {
      // traveled less than new size, keep going and return that
      return this.find(axis, size);
    }
  }

  // divides a cube in 2 along indicated axis
  divideCube(axis: Direction): Pair<Node<T>> {
    const dir1 = (axis + 1) % 3 as Direction;
    const dir2 = (axis + 2) % 3 as Direction;
    // find all points on this plane
    const points = [this,
      this.find(dir1, this.size[dir1]),
      this.find(dir2, this.size[dir2])];
    points[3] = points[1].find(dir2, this.size[dir2]);

    const newSize = this.size[axis] / 2;
    const middle = points.map(p => p.divideEdge(axis, newSize));

    middle[0].next[dir1] = { len: this.size[dir1], n: middle[1] }
    middle[0].next[dir2] = { len: this.size[dir2], n: middle[2] };
    middle[1].next[dir2] = { len: this.size[dir2], n: middle[3] };
    middle[2].next[dir1] = { len: this.size[dir1], n: middle[3] };

    // middle of 3 doesn't point to anything for now.
    this.size[axis] /= 2;
    middle[0].size = [...this.size];

    // return the bottom left of each cube
    return [this, middle[0]];

  }

  octantDivide() {
    let cubes: Node<T>[] = [this];
    for (let i = 0; i < 3; i++) {
      cubes = cubes.flatMap(c => {
        return c.divideCube(i as Direction);
      });
    }
  }
}