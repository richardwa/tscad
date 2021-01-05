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
  const size = Math.pow(2, 50);
  n[0].size = [size, size, size];
  for (let i = 0; i < connectionMatrix.length; i++) {
    const conn = connectionMatrix[i];
    n[conn[0]].next[conn[1]] = { len: size, n: n[conn[2]] };
  }
  return n[0];
}



let counter = 0;
export class Node<T> {
  id: number;
  data?: T;
  next: TriArray<{ len: number, n: Node<T> }> = [null, null, null];
  size: TriArray<number>;
  constructor(id: number) {
    this.id = id;
  }

  /**
   * Override this function to set custom node data at init time 
   */
  createNode(direction: Direction, to: Node<T>) {
    return new Node<T>(counter++);
  }

  isCube() {
    return Boolean(this.size);
  }

  getCorners() {
    if (this.isCube()) {
      const corners: OctArray<Node<T>> = [this, null, null, null, null, null, null, null];
      for (let i = 1; i < 8; i++) {
        const conn = connectionMatrix[i];
        const direction = conn[1] as Direction;
        corners[conn[2]] = corners[conn[0]].find(direction, this.size[direction]);
      }
      return corners;
    }
  }

  find(axis: Direction, length: number): Node<T> {
    if (!this.next[axis]) {
      throw new Error(`node: ${this.id}, nothing in ${axis} direction`);
    }
    let len = 0;
    let n: Node<T> = this;
    while (len < length && n.next[axis]) {
      const p = n.next[axis];
      if (!p.len) {
        throw 'err';
      }
      n = p.n;
      len += p.len;
    }
    if (len === length) {
      return n;
    }
  }

  getNodes(): Set<Node<T>> {
    const nodes = new Set<Node<T>>();
    const stack: Node<T>[] = [this];
    while (stack.length > 0) {
      const n = stack.pop();
      nodes.add(n);
      for (let i = 0; i < 3; i++) {
        const child = n.next[i];
        if (child && !nodes.has(child.n)) {
          stack.push(child.n);
        }
      }
    }
    return nodes;
  }

  divideEdge(axis: Direction, size: number): Node<T> {
    const next = this.find(axis, size);
    let middle = this.find(axis, size / 2);
    if (!middle) {
      middle = this.createNode(axis, next);
      console.log(`created ${middle.id}, pointed by ${this.id} on ${axis}`);
      middle.next[axis] = { len: size / 2, n: next };
      this.next[axis] = { len: size / 2, n: middle }
    } else {
      middle.next[axis].len = size / 2;
    }
    return middle;
  }

  log(): string {
    return `${this.id} -> [${this.next.map(n => n && n.n.id).join(',')}]`;
  }

  makeConnection(axis: Direction, length: number, b: Node<T>) {
    let t: Node<T> = this;
    let len = 0;
    while (len < length && t !== b && t.next[axis]) {
      const next = t.next[axis];
      t = next.n;
      len += next.len;
    }
    if (t !== b) {
      t.next[axis] = { len: length - len, n: b };
    }
  }

  // divides a cube in 2 along indicated axis
  divideCube(axis: Direction): Pair<Node<T>> {
    console.log(axis, this.log(), 'start');
    let dir1 = (axis + 1) % 3 as Direction;
    let dir2 = (axis + 2) % 3 as Direction;

    // find all points on this plane
    const points = [this,
      this.find(dir1, this.size[dir1]),
      this.find(dir2, this.size[dir2])];
    points[3] = points[1].find(dir2, this.size[dir2]);
    if (!points[3]) {
      points[3] = points[2].find(dir1, this.size[dir1]);
    }
    points.forEach(m => console.log('base', m.log()));
    const middle = points.map(p => p.divideEdge(axis, this.size[axis]));

    middle[0].makeConnection(dir1, this.size[dir1], middle[1]);
    middle[0].makeConnection(dir2, this.size[dir2], middle[2]);
    middle[1].makeConnection(dir2, this.size[dir2], middle[3]);
    middle[2].makeConnection(dir1, this.size[dir1], middle[3]);

    // middle[0].next[dir1] = middle[0].next[dir1] || { len: this.size[dir1], n: middle[1] };
    // middle[0].next[dir2] = middle[0].next[dir2] || { len: this.size[dir2], n: middle[2] };
    // middle[1].next[dir2] = middle[1].next[dir2] || { len: this.size[dir2], n: middle[3] };
    // middle[2].next[dir1] = middle[2].next[dir1] || { len: this.size[dir1], n: middle[3] };


    console.log('after', this.log());
    middle.forEach(m => console.log('middle', m.log()));

    // middle[3] doesn't point to anything for now.
    this.size[axis] /= 2;
    middle[0].size = [...this.size];

    // return the bottom left of each cube
    this.show();
    return [this, middle[0]];
  }

  /**
   * this is OctArray is not in same order as corners, 
   * this ordering (low to high) is required when doing recursion
   */
  octantDivide() {
    let cubes: Node<T>[] = [this];
    for (let i = 0; i < 3; i++) {
      cubes = cubes.flatMap(c => {
        return c.divideCube(i as Direction);
      });
    }
    return cubes;
  }

  getArray(axis: Direction) {
    const cubes: Node<T>[] = [this];
    let next = this.next[axis];
    while (next) {
      cubes.push(next.n);
      next = next.n.next[axis];
    }
    return cubes;
  }

  show(offset: Direction = 0, f?: (n: Node<T>[]) => string) {
    const z = this.getArray((2 + offset) % 3 as Direction);
    for (let k of z) {
      const y = k.getArray((1 + offset) % 3 as Direction);
      for (let j of y) {
        const x = j.getArray(offset);
        console.log(f ? f(x) : x.map(c => `${c.id}`.padStart(3, '0')).join('|'));
      }
      console.log('')
    }
  }
}