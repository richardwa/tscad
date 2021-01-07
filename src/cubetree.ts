/// <reference path="../types.d.ts" />

const identity = <T>(t: T) => t;
const fnTrue = () => true;

//type Direction = 0 | 1 | 2 | 4 | 5;
export enum Direction { left, right, front, back, bottom, top };
//type Position = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export enum Position {
  botfrontleft, botfrontright, botbackleft, botbackright,
  topfrontleft, topfrontright, topbackleft, topbackright,
}

const pushBits = [0, 1, 2].flatMap(i => {
  const a = 1 << i; // pushes number to the high side
  const b = ~a; // brings number to the low side
  return [(n) => n & b, (n) => n | a];
}) as HexArray<(n: number) => number>;

export const edgePairs = [0, 1, 2].flatMap(i => {
  const all = [...new Array(8)].map((c, i) => i);
  const low = Array.from(new Set(all.map(pushBits[i * 2])))
  const high = low.map(pushBits[i * 2 + 1]);
  return low.map((e, i) => [e, high[i]] as Pair<number>);
});

export const normalDirections = [0, 1, 2].map(axis =>
  [1, 2].map(i => ((axis + i) % 3) * 2 + 1)) as [Direction, Direction][];

export class Cube<T> {
  parent: Cube<T>;
  data: T;
  children: OctArray<Cube<T>>;
  path: Position[];

  constructor(p: Position[], parent: Cube<T>) {
    this.path = p;
    this.parent = parent;
  }

  getIndex() {
    if (this.parent) {
      return this.path[this.path.length - 1];
    }
  }

  split(init: (c: Cube<T>) => Cube<T> = identity) {
    this.children = [...new Array(8)].map((c, i) =>
      init(new Cube([...this.path, i as Position], this))) as OctArray<Cube<T>>;
    return this.children;
  }

  findChild(path: Position[]): Cube<T> {
    if (this.children) {
      const [first, ...rest] = path;
      const child = this.children[first];
      if (rest.length > 0) {
        return child.findChild(rest);
      }
      return child;
    } else {
      return this;
    }
  }

  getNeighbor(direction: Direction): Cube<T> {
    if (this.parent) {
      const index = this.getIndex();
      const rIndex = pushBits[direction](index);
      if (rIndex !== index) {
        return this.parent.children[rIndex];
      } else {
        const ancestor = this.parent.getNeighbor(direction);
        if (!ancestor) {
          return;
        }
        const path = this.path.slice(ancestor.path.length);
        const offset = direction % 2 === 0 ? 1 : -1;
        return ancestor.findChild(path.map(pushBits[direction + offset]) as Position[]);
      }
    }
    //absolute parent has no neighbors
  }

  makeFilter<T>(a: Position[]) {
    const set = new Set<Position>(a);
    return (n: Cube<T>) => set.has(n.getIndex());
  }

  getLeafs(filter: (n: Cube<T>) => boolean = fnTrue): Cube<T>[] {
    if (this.children) {
      return this.children.filter(filter).flatMap((c: Cube<T>) => c.getLeafs(filter));
    } else {
      return [this];
    }
  }
}

