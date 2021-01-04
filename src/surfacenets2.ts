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
  val: number;
}
class Cube extends Node<Data> {
  constructor(pos: Vec3) {
    super();
    this.data = {
      pos, val: null
    }
  }
  createNode(direction: Direction, to: Node<Data>) {
    const node = super.createNode(direction, to);
    const from = this.data.pos;
    const toPos = to.data.pos;
    node.data = {
      pos: new Vector(from).add(toPos).scale(1 / 2).result,
      val: null
    };
    return node;
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
    const baseCube = cubeCorners[0];
    this.findVertices(baseCube);
  };
  findVertices = (cube: Cube) => {
    const corners = cube.getCorners();
    const results = corners.map(c => {
      if (c.data) {
        return c.data
      } else {
        const ans = this.fn(c.pos);
        c.data = ans;
        return ans;
      }
    });
    const lower = corners[0].pos;
    const upper = corners[6].pos;
    const lengths = new Vector(upper).minus(lower).result;
    const maxLen = Math.max(...lengths);
    console.log(cube.name, lengths);

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

      const center = new Vector(corners[0].pos).add(corners[6].pos).scale(1 / 2).result;
      //const center = findVertex(cubeIndex, corners.map(c => c.pos) as OctArray<Vec3>, results);
      cube.data = center;
      return;
    }

    // recursion
    cube.split().forEach(this.findVertices)

  }
}
