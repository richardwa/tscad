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
}
class Cube extends Node<Data> {
  constructor(pos: Vec3) {
    super();
    this.data = { pos };
  }
  createNode(direction: Direction, to: Node<Data>) {
    const from = this.data.pos;
    const toPos = to.data.pos;
    // console.log(from, toPos);
    return new Cube(new Vector(from).add(toPos).scale(1 / 2).result);
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

  doMarch = (bounds: Bounds) => {
    console.log('bounds', bounds);
    const [lower, upper] = bounds;
    // evaluate this cube
    const corners: Vec3[] = cubeVerts.map(v =>
      v.map((o: number, i: number) =>
        o ? upper[i] : lower[i]) as Vec3);
    const cubeCorners = corners.map(p => new Cube(p))
    connectNodes(cubeCorners);
    this.findVertices(cubeCorners[0], "");
  };

  findVertices = (cube: Cube, gen: string) => {
    if (gen.length > 10) {
      return;
    }
    const corners = cube.getCorners();
    const results = corners.map(c => {
      if (c.data.val) {
        return c.data.val
      } else {
        const ans = this.fn(c.data.pos);
        c.data.val = ans;
        return ans;
      }
    });
    const lower = corners[0].data.pos;
    const upper = corners[6].data.pos;
    const lengths = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...lengths);
    // console.log(gen, maxLen, cube.size);

    // optimization, this cube is far away from an edge relative to its own size
    // we can skip it even when this cube is above the min size
    // if (Math.min(...results.map(Math.abs)) > maxLen) {
    //   return;
    // }

    // base case, we are small enought to find a vertex
    if (maxLen <= this.minSize) {
      const cubeIndex = results.reduce(reduceCorners, 0);
      if (cubeIndex === 0xff || cubeIndex === 0x00) {
        return;
      }

      const center = new Vector(corners[0].data.pos).add(corners[6].data.pos).scale(1 / 2).result;
      //const center = findVertex(cubeIndex, corners.map(c => c.pos) as OctArray<Vec3>, results);
      cube.data.center = center;
      return;
    }

    // recursion
    cube.octantDivide();
    cube.getCorners().forEach((c, i) => {
      this.findVertices(c, `${gen}${i}`);
    });
  }
}
