/// <reference path="../types.d.ts" />

import { Node, Direction, connectNodes } from './cubetrees2';
import { cubeVerts } from './marchingcubes-tables';
import { Vector } from './math';
import { findVertex } from './util';

export type Bounds = [Vec3, Vec3];
export type Triangle = [Vec3, Vec3, Vec3];

const reduceCorners = (a: number, v: number, i: number) => {
  if (v > 0) {
    a |= 1 << i;
  }
  return a;
};

type Data = {
  pos: Vec3;
  center?: Vec3;
  val?: number;
  name?: string;
  type?: number;
}
let id = 0;
class Cube extends Node<Data> {
  constructor(pos: Vec3) {
    super(id++);
    this.data = { pos };
  }
  createNode(direction: Direction, to: Node<Data>) {
    const from = this.data.pos;
    const toPos = to.data.pos;
    if (!toPos) {
      throw 'error creating node';
    }
    return new Cube(new Vector(from).add(toPos).scale(1 / 2).result);
  }
}

const hasIntesection = (a: Cube, b: Cube): Number => {
  const val1 = a.data.val;
  const val2 = b.data.val;
  if (Math.sign(val1) === Math.sign(val2)) {
    return 0;
  }
  if (val1 < val2) {
    return -1;
  } else {
    return 1;
  }
}

export class SurfaceNets {
  triangles: Triangle[] = [];
  minSize: number;
  fn: Shape3;

  constructor(minSize: number, shape: Shape3) {
    this.minSize = minSize;
    this.fn = shape;
  }

  putFaces(p1: Cube, p2: Cube, face: Cube[]) {
    const intersected = hasIntesection(p1, p2);
    if (intersected) {
      console.log(p1.size, p1.id, p1.next[1].n.id, p2.id);
      const t = face.map(f => f.data.center).filter(o => o);
      if (t.length === 3) {
        this.triangles.push([t[0], t[1], t[2]]);
      } else if (t.length === 4) {
        this.triangles.push([t[0], t[1], t[2]]);
        this.triangles.push([t[0], t[2], t[3]]);
      }
    }
  }

  doMarch = (bounds: Bounds) => {
    console.log('bounds', bounds);
    const [lower, upper] = bounds;
    const corners: Vec3[] = cubeVerts.map(v =>
      v.map((o: number, i: number) =>
        o ? upper[i] : lower[i]) as Vec3);
    const cubeCorners = corners.map((p, i) => {
      const c = new Cube(p)
      c.data.name = `${i}`;
      return c;
    });
    connectNodes(cubeCorners);
    const base = cubeCorners[0];
    this.findVertices(base, "0");

    base.show(r => r.map(c => c.data.center ? '[*]' : '[ ]').join(''));

    base.getNodes().forEach(cube => {
      if (cube.data.center) {
        const c = cube.getCorners();
        this.putFaces(c[0], c[1], [c[0], c[3], c[7], c[4]]);
        // this.putFaces(c[2], c[6], [c[0], c[1], c[2], c[3]]);
        // this.putFaces(c[5], c[6], [c[0], c[1], c[5], c[4]]);
      }
    });
  };

  findVertices = (cube: Cube, gen: string) => {
    const corners = cube.getCorners();
    const results = corners.map(c => {
      const ans = this.fn(c.data.pos);
      c.data.val = ans;
      return ans;
    });
    const lower = corners[0].data.pos;
    const upper = corners[6].data.pos;
    const lengths = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...lengths);
    console.log(gen, maxLen);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    // if (Math.min(...results.map(Math.abs)) > maxLen) {
    //   return;
    // }

    // base case, we are small enought to find a vertex
    if (maxLen <= this.minSize) {
      const cubeIndex = results.reduce(reduceCorners, 0);
      cube.data.type = cubeIndex;
      if (cubeIndex === 0xff || cubeIndex === 0x00) {
        return;
      }

      const center = new Vector(corners[0].data.pos).add(corners[6].data.pos).scale(1 / 2).result;
      //const center = findVertex(cubeIndex, corners.map(c => c.pos) as OctArray<Vec3>, results);
      cube.data.center = center;
      return;
    }

    // recursion
    cube.octantDivide().forEach((c, i) => {
      c.data.name = `${gen}${i}`;
      this.findVertices(c, `${gen}${i}`);
    });
  }
}
